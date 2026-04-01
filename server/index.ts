import express from 'express'
import { fetchFinancials, fetchQuote } from '../src/api/yahoo-finance.js'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  next()
})

app.get('/api/financials/:ticker', async (req, res) => {
  const { ticker } = req.params
  try {
    const data = await fetchFinancials(ticker)
    res.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch financials'
    res.status(404).json({ error: message })
  }
})

app.get('/api/quote/:ticker', async (req, res) => {
  const { ticker } = req.params
  try {
    const data = await fetchQuote(ticker)
    res.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch quote'
    res.status(404).json({ error: message })
  }
})

app.listen(PORT, () => {
  console.log(`Financial API server running at http://localhost:${PORT}`)
})
