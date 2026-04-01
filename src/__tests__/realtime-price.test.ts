import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchQuote } from '../api/yahoo-finance'

const { mockInstance } = vi.hoisted(() => {
  const mockInstance = { fundamentalsTimeSeries: vi.fn(), quoteSummary: vi.fn(), quote: vi.fn() }
  return { mockInstance }
})

vi.mock('yahoo-finance2', () => ({
  default: class MockYahooFinance {
    fundamentalsTimeSeries = mockInstance.fundamentalsTimeSeries
    quoteSummary = mockInstance.quoteSummary
    quote = mockInstance.quote
  },
}))

const mockQuote = mockInstance.quote

describe('fetchQuote', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns StockQuote for a USD ticker', async () => {
    mockQuote.mockResolvedValue({
      regularMarketPrice: 185.50,
      currency: 'USD',
      marketCap: 2_850_000_000_000,
    })
    const result = await fetchQuote('AAPL')
    expect(result.ticker).toBe('AAPL')
    expect(result.price).toBe(185.50)
    expect(result.currency).toBe('USD')
  })

  it('returns StockQuote for a JPY ticker', async () => {
    mockQuote.mockResolvedValue({
      regularMarketPrice: 2850,
      currency: 'JPY',
      marketCap: undefined,
    })
    const result = await fetchQuote('7203.T')
    expect(result.ticker).toBe('7203.T')
    expect(result.price).toBe(2850)
    expect(result.currency).toBe('JPY')
  })

  it('throws when quote is null', async () => {
    mockQuote.mockResolvedValue(null)
    await expect(fetchQuote('INVALID')).rejects.toThrow()
  })
})
