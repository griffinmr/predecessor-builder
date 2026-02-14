import express from 'express'

import charactersRouter       from './routes/characters.js'
import itemsRouter            from './routes/items.js'
import buildsRouter           from './routes/builds.js'
import leaderboardRouter      from './routes/leaderboard.js'
import communityBuildsRouter  from './routes/community-builds.js'

const app = express()

app.use(express.json())

app.use('/api', charactersRouter)
app.use('/api', itemsRouter)
app.use('/api', buildsRouter)
app.use('/api', leaderboardRouter)
app.use('/api', communityBuildsRouter)

// catch-all error handler – prevents stack traces reaching the client
app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

export default app
