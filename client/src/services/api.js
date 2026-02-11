// ─── leaderboard ────────────────────────────────────────────────────────────────
export async function getLeaderboard() {
  const res = await fetch('/api/leaderboard')
  if (!res.ok) throw new Error('Failed to load leaderboard')
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
