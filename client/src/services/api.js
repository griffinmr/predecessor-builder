// ─── leaderboard ────────────────────────────────────────────────────────────────
export async function getLeaderboard() {
  const res = await fetch('/api/leaderboard')
  if (!res.ok) throw new Error('Failed to load leaderboard')
  return res.json()
}

// ─── player hero statistics ─────────────────────────────────────────────────────
export async function getPlayerHeroStats(playerId) {
  const res = await fetch(`/api/players/${encodeURIComponent(playerId)}/hero-statistics`)
  if (!res.ok) throw new Error('Failed to load hero statistics')
  return res.json()
}
// ─── character roster ──────────────────────────────────────────────────────────
export async function getCharacters() {
  const res = await fetch('/api/characters')
  if (!res.ok) throw new Error('Failed to load characters')
  return (await res.json()).characters
}

// ─── item pool ─────────────────────────────────────────────────────────────────
export async function getItems() {
  const res = await fetch('/api/items')
  if (!res.ok) throw new Error('Failed to load items')
  return (await res.json()).items
}

// ─── build generation ──────────────────────────────────────────────────────────
/**
 * @param {{ characterId: string, role: string, enemyIds: string[] }} params
 */
export async function generateBuild({ characterId, role, enemyIds }) {
  const res = await fetch('/api/generate-build', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ characterId, role, enemyIds }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Build generation failed')
  }
  return res.json()
}

// ─── build history ─────────────────────────────────────────────────────────────
export async function getBuilds(limit = 20) {
  const res = await fetch(`/api/builds?limit=${limit}`)
  if (!res.ok) throw new Error('Failed to load build history')
  return (await res.json()).history
}

// ─── saved builds ──────────────────────────────────────────────────────────────
export async function getSavedBuilds() {
  const res = await fetch('/api/saved-builds')
  if (!res.ok) throw new Error('Failed to load saved builds')
  return (await res.json()).saved
}

export async function saveBuild({ historyId, name, notes }) {
  const res = await fetch('/api/saved-builds', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ historyId, name, notes }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to save build')
  }
  return res.json()
}

// ─── community builds (omeda.city) ──────────────────────────────────────────
export async function getCommunityBuilds(filters = {}) {
  const params = new URLSearchParams()
  for (const [key, val] of Object.entries(filters)) {
    if (val !== undefined && val !== null && val !== '') {
      params.set(key, val)
    }
  }
  const qs  = params.toString()
  const url = qs ? `/api/community-builds?${qs}` : '/api/community-builds'
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to load community builds')
  return (await res.json()).builds
}

export async function getHeroes() {
  const res = await fetch('/api/heroes')
  if (!res.ok) throw new Error('Failed to load heroes')
  return (await res.json()).heroes
}

export async function getHeroStats(heroId, { timeFrame = '1M', gameMode = 'ranked' } = {}) {
  const res = await fetch(`/api/heroes/${encodeURIComponent(heroId)}/stats?time_frame=${timeFrame}&game_mode=${gameMode}`)
  if (!res.ok) throw new Error('Failed to load hero statistics')
  return (await res.json()).stats
}

export async function getAllHeroStats({ timeFrame = '1M', gameMode = 'ranked' } = {}) {
  const res = await fetch(`/api/heroes/all-stats?time_frame=${timeFrame}&game_mode=${gameMode}`)
  if (!res.ok) throw new Error('Failed to load hero statistics')
  return (await res.json()).stats
}
