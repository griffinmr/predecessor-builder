/**
 * Omeda.city API client with caching for Predecessor item, hero, and build data.
 * Items/heroes are refreshed every hour; builds use a shorter 5-minute TTL.
 */

const OMEDA_ITEMS_URL  = 'https://omeda.city/items.json'
const OMEDA_HEROES_URL = 'https://omeda.city/heroes.json'
const OMEDA_BUILDS_URL = 'https://omeda.city/builds.json'
const CACHE_TTL_MS     = 60 * 60 * 1000  // 1 hour
const BUILDS_TTL_MS    = 5 * 60 * 1000   // 5 minutes

let cachedItems    = null
let cachedAt       = 0

let cachedHeroes   = null
let cachedHeroesAt = 0

// Builds cache is keyed by query string since filters change the response
const buildsCache  = new Map()

/**
 * Strip HTML tags from effect descriptions for cleaner AI prompts.
 * @param {string} html
 * @returns {string}
 */
function stripHtml(html) {
  if (!html) return ''
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Format stats object into a readable string.
 * @param {object} stats
 * @returns {string}
 */
function formatStats(stats) {
  if (!stats || Object.keys(stats).length === 0) return ''
  return Object.entries(stats)
    .map(([key, val]) => {
      const label = key.replace(/_/g, ' ')
      return `+${val} ${label}`
    })
    .join(', ')
}

/**
 * Build a concise description from item effects.
 * @param {object[]} effects
 * @returns {string}
 */
function formatEffects(effects) {
  if (!effects || effects.length === 0) return ''
  return effects
    .map((e) => {
      const desc = stripHtml(e.menu_description || '')
      return e.name ? `${e.name}: ${desc}` : desc
    })
    .filter(Boolean)
    .join(' | ')
}

/**
 * Transform raw Omeda item to our internal format for AI prompts.
 * @param {object} raw
 * @returns {object}
 */
function transformItem(raw) {
  const stats   = formatStats(raw.stats)
  const effects = formatEffects(raw.effects)

  // Build a rich description for the AI
  let description = ''
  if (stats) description += `Stats: ${stats}. `
  if (effects) description += effects
  if (!description) description = raw.display_name

  return {
    id:          raw.slug,                    // use slug as ID (e.g., "dust-devil")
    name:        raw.display_name,
    slot_type:   raw.slot_type,               // Passive, Active, Crest
    rarity:      raw.rarity,
    hero_class:  raw.hero_class,
    price:       raw.total_price,
    stats:       raw.stats || {},
    image:       raw.image ? `https://omeda.city${raw.image}` : null,
    description: description.trim(),
    // Keep raw data for potential future use
    _raw: {
      game_id:      raw.game_id,
      image:        raw.image,
      requirements: raw.requirements,
      build_paths:  raw.build_paths,
    },
  }
}

/**
 * Fetch items from Omeda API. Uses in-memory cache with TTL.
 * @param {boolean} forceRefresh - bypass cache
 * @returns {Promise<object[]>}
 */
export async function fetchItems(forceRefresh = false) {
  const now = Date.now()

  if (!forceRefresh && cachedItems && (now - cachedAt) < CACHE_TTL_MS) {
    return cachedItems
  }

  console.log('[omeda] Fetching fresh item data from omeda.city...')

  const res = await fetch(OMEDA_ITEMS_URL)
  if (!res.ok) {
    throw new Error(`Omeda API error: ${res.status} ${res.statusText}`)
  }

  const rawItems = await res.json()

  // Transform and filter to only Epic+ items (the ones used in final builds)
  // Include all rarities for now since lower-tier items can be build components
  cachedItems = rawItems.map(transformItem)
  cachedAt    = now

  console.log(`[omeda] Cached ${cachedItems.length} items`)

  return cachedItems
}

/**
 * Get items filtered by slot type.
 * @param {string} slotType - 'Passive', 'Active', or 'Crest'
 * @returns {Promise<object[]>}
 */
export async function fetchItemsBySlot(slotType) {
  const items = await fetchItems()
  return items.filter((i) => i.slot_type === slotType)
}

/**
 * Get only Epic/Legendary items (typically final build items).
 * @returns {Promise<object[]>}
 */
export async function fetchEndgameItems() {
  const items = await fetchItems()
  return items.filter((i) => i.rarity === 'Epic' || i.rarity === 'Legendary')
}

// ── Heroes ────────────────────────────────────────────────────────────────────

/**
 * Fetch heroes from Omeda API. Returns array of hero objects.
 * @param {boolean} forceRefresh
 * @returns {Promise<object[]>}
 */
export async function fetchHeroes(forceRefresh = false) {
  const now = Date.now()

  if (!forceRefresh && cachedHeroes && (now - cachedHeroesAt) < CACHE_TTL_MS) {
    return cachedHeroes
  }

  console.log('[omeda] Fetching fresh hero data from omeda.city...')

  const res = await fetch(OMEDA_HEROES_URL)
  if (!res.ok) {
    throw new Error(`Omeda heroes API error: ${res.status} ${res.statusText}`)
  }

  cachedHeroes   = await res.json()
  cachedHeroesAt = now

  console.log(`[omeda] Cached ${cachedHeroes.length} heroes`)

  return cachedHeroes
}

/**
 * Build a Map<id, hero> for fast numeric-ID lookups.
 * @returns {Promise<Map<number, object>>}
 */
export async function fetchHeroMap() {
  const heroes = await fetchHeroes()
  return new Map(heroes.map((h) => [h.id, h]))
}

// ── Raw Items (numeric-ID indexed) ────────────────────────────────────────────

let cachedRawItems   = null
let cachedRawItemsAt = 0

/**
 * Fetch raw items (untransformed) and index by numeric id.
 * Used for resolving item IDs in community builds.
 * @returns {Promise<Map<number, object>>}
 */
export async function fetchItemMap() {
  const now = Date.now()

  if (cachedRawItems && (now - cachedRawItemsAt) < CACHE_TTL_MS) {
    return cachedRawItems
  }

  const res = await fetch(OMEDA_ITEMS_URL)
  if (!res.ok) {
    throw new Error(`Omeda API error: ${res.status} ${res.statusText}`)
  }

  const rawItems = await res.json()
  cachedRawItems   = new Map(rawItems.map((i) => [i.id, i]))
  cachedRawItemsAt = now

  return cachedRawItems
}

// ── Community Builds ──────────────────────────────────────────────────────────

/**
 * Fetch community builds from Omeda API with filter passthrough.
 * @param {string} queryString - pre-built query string (e.g., "filter[role]=support&order=popular")
 * @returns {Promise<object[]>}
 */
export async function fetchCommunityBuilds(queryString = '') {
  const now   = Date.now()
  const entry = buildsCache.get(queryString)

  if (entry && (now - entry.at) < BUILDS_TTL_MS) {
    return entry.data
  }

  const url = queryString
    ? `${OMEDA_BUILDS_URL}?${queryString}`
    : OMEDA_BUILDS_URL

  console.log(`[omeda] Fetching community builds: ${url}`)

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Omeda builds API error: ${res.status} ${res.statusText}`)
  }

  const data = await res.json()
  buildsCache.set(queryString, { data, at: now })

  // Evict old entries to prevent unbounded growth
  if (buildsCache.size > 100) {
    const oldest = [...buildsCache.entries()].sort((a, b) => a[1].at - b[1].at)[0]
    buildsCache.delete(oldest[0])
  }

  return data
}

/**
 * Pre-warm the cache on server startup.
 */
export async function warmCache() {
  try {
    await Promise.all([
      fetchItems(true),
      fetchHeroes(true),
    ])
    console.log('[omeda] Item + hero caches warmed successfully')
  } catch (err) {
    console.error('[omeda] Failed to warm cache:', err.message)
  }
}
