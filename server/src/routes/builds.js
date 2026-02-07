import express from 'express'
import db      from '../db.js'
import { generateBuildFromOpenAI } from '../openai.js'
import { fetchItems } from '../omeda.js'

const router     = express.Router()
const VALID_ROLES = new Set(['adc', 'support', 'jungle', 'mid', 'offlane'])

// ── helpers ────────────────────────────────────────────────────────────────────
function getCharacter(id) {
  const row = db.prepare('SELECT * FROM characters WHERE id = ?').get(id)
  if (!row) return null
  return { id: row.id, name: row.name, roles: JSON.parse(row.roles) }
}

/** Batch-resolve an array of character IDs → name strings (preserving order). */
function resolveNames(ids) {
  if (!ids.length) return []
  const placeholders = ids.map(() => '?').join(',')
  const rows = db.prepare(`SELECT id, name FROM characters WHERE id IN (${placeholders})`).all(...ids)
  const map  = new Map(rows.map((r) => [r.id, r.name]))
  return ids.map((id) => map.get(id) || id)
}

/** Parse stored build data (handles both old array format and new {crest, items} format). */
function parseBuildData(jsonStr) {
  const data = JSON.parse(jsonStr)
  // Old format: items_json was just an array of items
  if (Array.isArray(data)) {
    return { crest: null, items: data }
  }
  // New format: { crest, items }
  return { crest: data.crest || null, items: data.items || [] }
}

// ── POST /generate-build ──────────────────────────────────────────────────────
router.post('/generate-build', async (req, res) => {
  try {
    const { characterId, role, enemyIds } = req.body

    // ── validate characterId ──
    const character = getCharacter(characterId)
    if (!character) {
      return res.status(400).json({ error: `Character "${characterId}" not found` })
    }

    // ── validate role ──
    if (!VALID_ROLES.has(role)) {
      return res.status(400).json({ error: `Invalid role "${role}"` })
    }
    if (!character.roles.includes(role)) {
      return res.status(400).json({ error: `${character.name} cannot play ${role}` })
    }

    // ── validate enemyIds ──
    if (!Array.isArray(enemyIds)) {
      return res.status(400).json({ error: 'enemyIds must be an array' })
    }
    if (enemyIds.length > 5) {
      return res.status(400).json({ error: 'Maximum 5 enemies allowed' })
    }

    const enemies = []
    for (const eid of enemyIds) {
      if (eid === characterId) {
        return res.status(400).json({ error: 'Cannot add your own character as an enemy' })
      }
      const enemy = getCharacter(eid)
      if (!enemy) {
        return res.status(400).json({ error: `Enemy "${eid}" not found` })
      }
      enemies.push(enemy)
    }

    // ── fetch live item pool from Omeda.city ──
    const items = await fetchItems()

    // ── call OpenAI with the real item pool ──
    const { crest, items: buildItems, strategy, tips } = await generateBuildFromOpenAI({ character, role, enemies, items })

    // ── persist to history (store crest + items together) ──
    const buildData = { crest, items: buildItems }
    const { lastInsertRowid } = db.prepare(`
      INSERT INTO build_history (character_id, role, enemy_ids, items_json, strategy, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      character.id,
      role,
      JSON.stringify(enemyIds),
      JSON.stringify(buildData),
      strategy,
      new Date().toISOString()
    )

    res.json({
      character,
      role,
      enemies,
      crest,
      items:     buildItems,
      strategy,
      tips,
      historyId: Number(lastInsertRowid),
    })
  } catch (err) {
    console.error('generate-build error:', err)
    res.status(500).json({ error: err.message || 'Build generation failed' })
  }
})

// ── GET /builds (history) ─────────────────────────────────────────────────────
router.get('/builds', (req, res) => {
  let limit = parseInt(req.query.limit, 10)
  if (isNaN(limit) || limit < 1) limit = 20
  if (limit > 100) limit = 100

  const rows = db.prepare(`
    SELECT bh.*,
           CASE WHEN sb.id IS NOT NULL THEN 1 ELSE 0 END AS saved
    FROM   build_history bh
    LEFT JOIN saved_builds sb ON sb.build_history_id = bh.id
    ORDER  BY bh.id DESC
    LIMIT  ?
  `).all(limit)

  const history = rows.map((r) => {
    const { crest, items } = parseBuildData(r.items_json)
    return {
      id:             r.id,
      character_id:   r.character_id,
      character_name: resolveNames([r.character_id])[0],
      role:           r.role,
      enemy_ids:      JSON.parse(r.enemy_ids),
      enemy_names:    resolveNames(JSON.parse(r.enemy_ids)),
      crest,
      items,
      strategy:       r.strategy,
      created_at:     r.created_at,
      saved:          r.saved === 1,
    }
  })

  res.json({ history })
})

// ── POST /saved-builds ────────────────────────────────────────────────────────
router.post('/saved-builds', (req, res) => {
  const { historyId, name, notes } = req.body

  if (!historyId) {
    return res.status(400).json({ error: 'historyId is required' })
  }

  const exists = db.prepare('SELECT id FROM build_history WHERE id = ?').get(historyId)
  if (!exists) {
    return res.status(404).json({ error: 'Build not found in history' })
  }

  try {
    const { lastInsertRowid } = db.prepare(`
      INSERT INTO saved_builds (build_history_id, name, notes, saved_at)
      VALUES (?, ?, ?, ?)
    `).run(historyId, name || null, notes || null, new Date().toISOString())

    const saved = db.prepare('SELECT * FROM saved_builds WHERE id = ?').get(Number(lastInsertRowid))
    res.status(201).json({ saved })
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Build is already saved' })
    }
    throw err
  }
})

// ── GET /saved-builds ─────────────────────────────────────────────────────────
router.get('/saved-builds', (_req, res) => {
  const rows = db.prepare(`
    SELECT sb.*,
           bh.character_id, bh.role, bh.enemy_ids, bh.items_json, bh.strategy, bh.created_at
    FROM   saved_builds sb
    JOIN   build_history bh ON bh.id = sb.build_history_id
    ORDER  BY sb.saved_at DESC
  `).all()

  const saved = rows.map((r) => {
    const enemyIds = JSON.parse(r.enemy_ids)
    const { crest, items } = parseBuildData(r.items_json)
    return {
      id:               r.id,
      build_history_id: r.build_history_id,
      name:             r.name,
      notes:            r.notes,
      saved_at:         r.saved_at,
      character_id:     r.character_id,
      character_name:   resolveNames([r.character_id])[0],
      role:             r.role,
      enemy_ids:        enemyIds,
      enemy_names:      resolveNames(enemyIds),
      crest,
      items,
      strategy:         r.strategy,
      created_at:       r.created_at,
    }
  })

  res.json({ saved })
})

export default router
