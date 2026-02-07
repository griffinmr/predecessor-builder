import express from 'express'
import { fetchItems, fetchEndgameItems } from '../omeda.js'

const router = express.Router()

// GET /api/items - returns all items from Omeda.city (cached)
router.get('/items', async (_req, res) => {
  try {
    const items = await fetchItems()
    res.json({ items, source: 'omeda.city', count: items.length })
  } catch (err) {
    console.error('Failed to fetch items:', err)
    res.status(502).json({ error: 'Failed to fetch items from Omeda API' })
  }
})

// GET /api/items/endgame - returns only Epic/Legendary items
router.get('/items/endgame', async (_req, res) => {
  try {
    const items = await fetchEndgameItems()
    res.json({ items, source: 'omeda.city', count: items.length })
  } catch (err) {
    console.error('Failed to fetch items:', err)
    res.status(502).json({ error: 'Failed to fetch items from Omeda API' })
  }
})

export default router
