import { describe, expect, it } from 'vitest'
import type { StockQuote } from '../types/financial'
import { buildPortfolioPnlSummary, type PortfolioHoldingInput } from '../utils/portfolio-pnl'

describe('buildPortfolioPnlSummary', () => {
  it('converts mixed-currency positions to JPY and aggregates totals', () => {
    const holdings: Record<string, PortfolioHoldingInput> = {
      AAPL: { shares: 10, costBasis: 100 },
      '7203.T': { shares: 20, costBasis: 2000 },
    }
    const quotes: Record<string, StockQuote> = {
      AAPL: { ticker: 'AAPL', price: 120, currency: 'USD' },
      '7203.T': { ticker: '7203.T', price: 2500, currency: 'JPY' },
    }

    const result = buildPortfolioPnlSummary(['AAPL', '7203.T'], holdings, quotes, 150)

    expect(result.readyCount).toBe(2)
    expect(result.totalMarketValueJpy).toBe(230_000)
    expect(result.totalCostValueJpy).toBe(190_000)
    expect(result.totalPnlJpy).toBe(40_000)
    expect(result.positions[0]?.status).toBe('ready')
    expect(result.positions[1]?.status).toBe('ready')
  })

  it('marks USD positions as pending-rate when usdJpy is absent', () => {
    const result = buildPortfolioPnlSummary(
      ['AAPL'],
      { AAPL: { shares: 5, costBasis: 80 } },
      { AAPL: { ticker: 'AAPL', price: 100, currency: 'USD' } },
    )

    expect(result.readyCount).toBe(0)
    expect(result.positions[0]?.status).toBe('pending-rate')
    expect(result.totalMarketValueJpy).toBe(0)
  })

  it('keeps rows visible but excludes missing-input positions from totals', () => {
    const result = buildPortfolioPnlSummary(
      ['7203.T'],
      { '7203.T': { shares: null, costBasis: 1800 } },
      { '7203.T': { ticker: '7203.T', price: 2100, currency: 'JPY' } },
      150,
    )

    expect(result.positions).toHaveLength(1)
    expect(result.positions[0]?.status).toBe('missing-input')
    expect(result.readyCount).toBe(0)
    expect(result.totalPnlJpy).toBe(0)
  })
})
