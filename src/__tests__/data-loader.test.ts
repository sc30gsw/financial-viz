import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchFinancials, transformFundamentalsRow } from '../api/yahoo-finance'

const { mockInstance } = vi.hoisted(() => {
  const mockInstance = {
    fundamentalsTimeSeries: vi.fn(),
    quoteSummary: vi.fn(),
    quote: vi.fn(),
  }
  return { mockInstance }
})

vi.mock('yahoo-finance2', () => ({
  default: class MockYahooFinance {
    fundamentalsTimeSeries = mockInstance.fundamentalsTimeSeries
    quoteSummary = mockInstance.quoteSummary
    quote = mockInstance.quote
  },
}))

const mockFundamentals = mockInstance.fundamentalsTimeSeries
const mockQuoteSummary = mockInstance.quoteSummary

const mockAaplRows = [
  { date: new Date('2024-09-28'), totalRevenue: 391_035_000_000, operatingIncome: 123_216_000_000, netIncome: 93_736_000_000 },
  { date: new Date('2023-09-30'), totalRevenue: 383_285_000_000, operatingIncome: 114_301_000_000, netIncome: 96_995_000_000 },
]

const mockToyotaRows = [
  { date: new Date('2024-03-31'), totalRevenue: 45_095_325_000_000, operatingIncome: 5_352_934_000_000, netIncome: 4_944_933_000_000 },
]

describe('fetchFinancials', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns CompanyFinancials for a valid US ticker', async () => {
    mockFundamentals.mockResolvedValue(mockAaplRows)
    mockQuoteSummary.mockResolvedValue({ price: { longName: 'Apple Inc.', shortName: 'AAPL' } })
    const result = await fetchFinancials('AAPL')
    expect(result.company.ticker).toBe('AAPL')
    expect(result.annualData.length).toBeGreaterThan(0)
    expect(result.annualData[0].revenue).toBe(391_035_000_000)
    expect(result.annualData[0].operatingIncome).toBe(123_216_000_000)
    expect(result.annualData[0].netIncome).toBe(93_736_000_000)
  })

  it('returns CompanyFinancials for a valid Japanese ticker', async () => {
    mockFundamentals.mockResolvedValue(mockToyotaRows)
    mockQuoteSummary.mockResolvedValue({ price: { longName: 'Toyota Motor Corporation', shortName: '7203.T' } })
    const result = await fetchFinancials('7203.T')
    expect(result.company.ticker).toBe('7203.T')
    expect(result.company.exchange).toBe('TSE')
    expect(result.annualData[0].currency).toBe('JPY')
  })

  it('throws when no data is returned', async () => {
    mockFundamentals.mockResolvedValue([])
    mockQuoteSummary.mockResolvedValue(null)
    await expect(fetchFinancials('INVALID_TICKER_XXXX')).rejects.toThrow()
  })
})

describe('transformFundamentalsRow', () => {
  it('correctly maps revenue, operatingIncome, netIncome', () => {
    const row = {
      date: new Date('2024-06-30'),
      TYPE: 'FINANCIALS' as const,
      periodType: '12M' as const,
      totalRevenue: 245_122_000_000,
      operatingIncome: 109_433_000_000,
      netIncome: 88_136_000_000,
    }
    const result = transformFundamentalsRow(row, 'USD')
    expect(result.year).toBe(2024)
    expect(result.revenue).toBe(245_122_000_000)
    expect(result.operatingIncome).toBe(109_433_000_000)
    expect(result.netIncome).toBe(88_136_000_000)
    expect(result.currency).toBe('USD')
  })

  it('handles null/missing fields gracefully', () => {
    const row = {
      date: new Date('2022-06-30'),
      TYPE: 'FINANCIALS' as const,
      periodType: '12M' as const,
      totalRevenue: 198_270_000_000,
    }
    const result = transformFundamentalsRow(row, 'JPY')
    expect(result.revenue).toBe(198_270_000_000)
    expect(result.operatingIncome).toBe(0)
    expect(result.netIncome).toBe(0)
  })
})
