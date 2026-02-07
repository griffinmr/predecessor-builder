import dotenv from 'dotenv'
dotenv.config()

if (!process.env.OPENAI_API_KEY) {
  console.error('FATAL: OPENAI_API_KEY is not set. Add it to server/.env')
  process.exit(1)
}

// dynamic import so dotenv.config() above runs before any module reads process.env
const { default: app } = await import('./app.js')
const { warmCache }    = await import('./omeda.js')

const PORT = process.env.PORT || 3001

// Pre-fetch item data so first request is fast
warmCache()

app.listen(PORT, () => {
  console.log(`Predecessor server running on http://localhost:${PORT}`)
})
