import OpenAI from 'openai'

const client = new OpenAI()                                              // reads OPENAI_API_KEY automatically
const MODEL  = process.env.OPENAI_MODEL || 'gpt-4o'

const SYSTEM_PROMPT = `You are a build advisor for the MOBA game Predecessor by Omeda Studios.

You will be given:
1. A character and their role
2. The enemy team composition (if any)
3. The list of available FINAL BUILD items (2000+ gold) and Crests

CRITICAL: You may ONLY recommend items from the provided item pool. Do not invent items or use items from other games.

Respond with ONLY a valid JSON object — no markdown, no commentary, nothing else.
The object must have exactly these four keys:

{
  "crest": "crest-slug",
  "items": ["item-slug-1", "item-slug-2", "item-slug-3", "item-slug-4", "item-slug-5"],
  "strategy": "2–4 sentence tactical overview tailored to the matchup.",
  "tips": "1–2 concrete, actionable tips."
}

Rules:
- crest must be a SINGLE Crest item slug appropriate for the character and role. Choose the Legendary (evolved) form of the crest.
- items must contain EXACTLY 5 UNIQUE non-Crest item slugs from the provided pool. These are endgame items only.
- Order the items as a realistic build path (first purchase → final item).
- Strategy must account for the enemy team composition when provided.
- Tips must be specific (timing windows, positioning, ability combos, target priority).`

/**
 * Call OpenAI and return a validated build recommendation.
 * @param {{ character: object, role: string, enemies: object[], items: object[] }} ctx
 * @returns {Promise<{ items: object[], strategy: string, tips: string|null }>}
 */
export async function generateBuildFromOpenAI({ character, role, enemies, items }) {
  const enemyLine = enemies.length
    ? enemies.map((e) => e.name).join(', ')
    : 'None selected'

  // Filter items: Crests (any price) + non-Crest items >= 2000 gold
  const filteredItems = items.filter((item) => {
    if (item.slot_type === 'Crest') return true
    return item.price >= 2000
  })

  // Format item pool for the prompt - group by slot type for clarity
  const itemsBySlot = {}
  for (const item of filteredItems) {
    const slot = item.slot_type || 'Other'
    if (!itemsBySlot[slot]) itemsBySlot[slot] = []
    itemsBySlot[slot].push(item)
  }

  let itemPool = ''
  for (const [slot, slotItems] of Object.entries(itemsBySlot)) {
    itemPool += `\n=== ${slot} Items ===\n`
    for (const i of slotItems) {
      itemPool += `- ${i.id}: ${i.name} [${i.rarity}] (${i.hero_class || 'Any'}) — ${i.description}\n`
    }
  }

  const userMessage =
    `Character: ${character.name}\n` +
    `Role: ${role}\n` +
    `Enemy team: ${enemyLine}\n\n` +
    `Available items in Predecessor:${itemPool}\n\n` +
    `Pick exactly 5 items from the pool above using their slug IDs. Order them as a build path (first purchase → last). Write a short strategy and tips for this matchup.`

  const response = await client.chat.completions.create({
    model:      MODEL,
    max_tokens: 1024,
    messages:   [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user',   content: userMessage },
    ],
  })

  // extract text content
  const raw = response.choices[0]?.message?.content?.trim() || ''

  // strip markdown code fences if present
  const stripped = raw.replace(/^```(?:json)?\s*([\s\S]*?)\s*```$/, '$1').trim()

  // ── parse ──
  let parsed
  try {
    parsed = JSON.parse(stripped)
  } catch {
    throw new Error(`OpenAI returned invalid JSON:\n${raw}`)
  }

  // ── validate ──
  if (!Array.isArray(parsed.items) || parsed.items.length !== 5) {
    throw new Error(
      `Expected exactly 5 items, got ${Array.isArray(parsed.items) ? parsed.items.length : 'non-array'}`
    )
  }

  // Build a lookup map for validation (use filtered items)
  const itemMap = new Map(filteredItems.map((i) => [i.id, i]))

  // Validate crest
  let resolvedCrest = null
  if (parsed.crest && typeof parsed.crest === 'string') {
    const crestItem = itemMap.get(parsed.crest)
    if (crestItem) {
      resolvedCrest = {
        id:          crestItem.id,
        name:        crestItem.name,
        category:    'crest',
        price:       crestItem.price,
        description: crestItem.description,
        rarity:      crestItem.rarity,
        hero_class:  crestItem.hero_class,
        stats:       crestItem.stats,
      }
    }
  }

  // Validate each item slug exists in the pool
  const resolvedItems = []
  for (const slug of parsed.items) {
    if (typeof slug !== 'string') {
      throw new Error(`Item must be a string slug, got: ${typeof slug}`)
    }
    const item = itemMap.get(slug)
    if (!item) {
      throw new Error(`OpenAI returned invalid item slug: "${slug}"`)
    }
    resolvedItems.push({
      id:          item.id,
      name:        item.name,
      category:    item.slot_type?.toLowerCase() || 'passive',
      price:       item.price,
      description: item.description,
      rarity:      item.rarity,
      hero_class:  item.hero_class,
      stats:       item.stats,
    })
  }

  if (typeof parsed.strategy !== 'string' || !parsed.strategy.trim()) {
    throw new Error('OpenAI returned empty or missing strategy')
  }

  return {
    crest:    resolvedCrest,
    items:    resolvedItems,
    strategy: parsed.strategy.trim(),
    tips:     typeof parsed.tips === 'string' && parsed.tips.trim() ? parsed.tips.trim() : null,
  }
}
