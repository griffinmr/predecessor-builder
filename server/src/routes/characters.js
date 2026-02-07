import express from 'express'
import db      from '../db.js'

const router = express.Router()

router.get('/characters', (_req, res) => {
  const rows = db.prepare('SELECT * FROM characters').all()
  const characters = rows.map((r) => ({
    id:    r.id,
    name:  r.name,
    roles: JSON.parse(r.roles),
  }))
  res.json({ characters })
})

export default router
