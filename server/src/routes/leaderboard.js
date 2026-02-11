import { Router } from 'express'

const router = Router()

const OMEDA_PLAYERS_URL = 'https://omeda.city/players.json'
const CACHE_TTL_MS      = 5 * 60 * 1000  // 5 minutes
let cached   = null
let cachedAt = 0

router.get('/leaderboard', async (_req, res, next) => {
  try {
    const now = Date.now()
    if (cached && (now - cachedAt) < CACHE_TTL_MS) {
      return res.json(cached)
    }

    const response = await fetch(OMEDA_PLAYERS_URL)
    if (!response.ok) {
      throw new Error(`Omeda API error: ${response.status}`)
    }

    cached   = await response.json()
    cachedAt = now
    res.json(cached)
  } catch (err) {
    next(err)
  }
})

export default router
