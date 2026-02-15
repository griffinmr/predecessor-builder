import express from 'express'
import { fetchCommunityBuilds, fetchHeroMap, fetchItemMap, fetchHeroes } from '../omeda.js'

const router = express.Router()

const OMEDA_BASE = 'https://omeda.city'

// Allowed filter keys that map to omeda.city's filter[key]=value format
const FILTER_KEYS = new Set([
  'player_id', 'hero_id', 'role', 'name',
  'skill_order', 'current_version', 'modules',
])

function stripHtml(html) {
  if (!html) return ''
  return html.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

function resolveItem(itemId, itemMap) {
  if (!itemId) return null
  const raw = itemMap.get(itemId)
  if (!raw) return { id: itemId, name: 'Unknown', image: null }

  // Format stats into readable pairs
  const stats = raw.stats && Object.keys(raw.stats).length > 0
    ? Object.entries(raw.stats).map(([k, v]) => ({ label: k.replace(/_/g, ' '), value: v }))
    : []

  // Format effects
  const effects = (raw.effects || [])
    .map((e) => ({
      name: e.name || null,
      description: stripHtml(e.menu_description || ''),
    }))
    .filter((e) => e.description)

  return {
    id:        raw.id,
    name:      raw.display_name,
    image:     raw.image ? `${OMEDA_BASE}${raw.image}` : null,
    slug:      raw.slug,
    price:     raw.total_price || null,
    rarity:    raw.rarity || null,
    slot_type: raw.slot_type || null,
    stats,
    effects,
  }
}

// ── GET /community-builds ────────────────────────────────────────────────────
router.get('/community-builds', async (req, res) => {
  try {
    // Build omeda.city query string from our query params
    const params = new URLSearchParams()

    if (req.query.page) {
      params.set('page', req.query.page)
    }
    if (req.query.order) {
      params.set('filter[order]', req.query.order)
    }

    for (const key of FILTER_KEYS) {
      const val = req.query[key]
      if (val !== undefined && val !== '') {
        params.set(`filter[${key}]`, val)
      }
    }

    const queryString = params.toString()

    // Fetch builds + lookup maps in parallel
    const [rawBuilds, heroMap, itemMap] = await Promise.all([
      fetchCommunityBuilds(queryString),
      fetchHeroMap(),
      fetchItemMap(),
    ])

    // Enrich builds with resolved hero/item data
    const builds = rawBuilds.map((b) => {
      const hero = heroMap.get(b.hero_id)

      return {
        id:          b.id,
        title:       b.title,
        description: b.description,
        role:        b.role,
        author:      b.author,
        upvotes:     b.upvotes_count,
        downvotes:   b.downvotes_count,
        version:     b.game_version?.name || null,
        skill_order: b.skill_order,
        has_modules: b.modules && b.modules.length > 0,
        created_at:  b.created_at,
        updated_at:  b.updated_at,
        hero: hero ? {
          id:    hero.id,
          name:  hero.display_name,
          slug:  hero.slug,
          image: hero.image ? `${OMEDA_BASE}${hero.image}` : null,
          roles: hero.roles || [],
        } : { id: b.hero_id, name: 'Unknown', slug: null, image: null, roles: [] },
        crest: resolveItem(b.crest_id, itemMap),
        items: [b.item1_id, b.item2_id, b.item3_id, b.item4_id, b.item5_id, b.item6_id]
          .map((id) => resolveItem(id, itemMap)),
      }
    })

    res.json({ builds })
  } catch (err) {
    console.error('community-builds error:', err)
    res.status(502).json({ error: 'Failed to fetch community builds' })
  }
})

// ── GET /heroes (for hero picker on client) ──────────────────────────────────
router.get('/heroes', async (_req, res) => {
  try {
    const heroes = await fetchHeroes()
    const list = heroes.map((h) => ({
      id:    h.id,
      name:  h.display_name,
      slug:  h.slug,
      image: h.image ? `${OMEDA_BASE}${h.image}` : null,
      roles: h.roles || [],
    }))
    res.json({ heroes: list })
  } catch (err) {
    console.error('heroes error:', err)
    res.status(502).json({ error: 'Failed to fetch heroes' })
  }
})

// ── GET /heroes/:heroId/stats ────────────────────────────────────────────────
// Cache ALL hero stats per time_frame+game_mode combo (hero_ids[] filter is broken on omeda)
const allStatsCache = new Map()
const HERO_STATS_TTL = 10 * 60 * 1000 // 10 minutes

async function getAllHeroStats(timeFrame, gameMode) {
  const cacheKey = `${timeFrame}:${gameMode}`
  const cached = allStatsCache.get(cacheKey)
  if (cached && (Date.now() - cached.at) < HERO_STATS_TTL) {
    return cached.data
  }

  const url = `${OMEDA_BASE}/dashboard/hero_statistics.json?time_frame=${encodeURIComponent(timeFrame)}&game_mode=${encodeURIComponent(gameMode)}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Omeda hero stats API error: ${response.status}`)
  }

  const data = await response.json()
  const statsArr = data.hero_statistics || data
  allStatsCache.set(cacheKey, { data: statsArr, at: Date.now() })
  return statsArr
}

router.get('/heroes/:heroId/stats', async (req, res) => {
  try {
    const heroId    = Number(req.params.heroId)
    const timeFrame = req.query.time_frame || '1M'
    const gameMode  = req.query.game_mode  || 'ranked'

    const allStats  = await getAllHeroStats(timeFrame, gameMode)
    const heroStats = Array.isArray(allStats)
      ? allStats.find((s) => s.hero_id === heroId) || null
      : null

    res.json({ stats: heroStats })
  } catch (err) {
    console.error('hero-stats error:', err)
    res.status(502).json({ error: 'Failed to fetch hero statistics' })
  }
})

export default router
