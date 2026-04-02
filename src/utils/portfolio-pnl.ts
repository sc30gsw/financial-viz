import type { StockQuote } from '../types/financial'

export interface PortfolioHoldingInput {
  shares: number | null
  costBasis: number | null
}

export type PortfolioPositionStatus =
  | 'missing-input'
  | 'missing-quote'
  | 'pending-rate'
  | 'ready'

export interface PortfolioPnlPosition {
  ticker: string
  shares: number | null
  costBasis: number | null
  quote: StockQuote | null
  status: PortfolioPositionStatus
  marketValueJpy: number | null
  costValueJpy: number | null
  pnlJpy: number | null
  pnlPct: number | null
}

export interface PortfolioPnlSummary {
  positions: PortfolioPnlPosition[]
  totalMarketValueJpy: number
  totalCostValueJpy: number
  totalPnlJpy: number
  totalPnlPct: number | null
  readyCount: number
  hasUsdPositions: boolean
  hasPendingRate: boolean
}

function isPositiveNumber(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

function normalizeToJpy(value: number, currency: StockQuote['currency'], usdJpy?: number): number | null {
  if (currency === 'JPY') {
    return value
  }
  const fxRate = usdJpy ?? null
  if (!isPositiveNumber(fxRate)) {
    return null
  }
  return value * fxRate
}

export function buildPortfolioPnlSummary(
  tickers: string[],
  holdings: Record<string, PortfolioHoldingInput>,
  quotes: Record<string, StockQuote>,
  usdJpy?: number,
): PortfolioPnlSummary {
  const positions = tickers.map<PortfolioPnlPosition>((ticker) => {
    const holding = holdings[ticker] ?? { shares: null, costBasis: null }
    const quote = quotes[ticker] ?? null

    if (!isPositiveNumber(holding.shares) || !isPositiveNumber(holding.costBasis)) {
      return {
        ticker,
        shares: holding.shares ?? null,
        costBasis: holding.costBasis ?? null,
        quote,
        status: 'missing-input',
        marketValueJpy: null,
        costValueJpy: null,
        pnlJpy: null,
        pnlPct: null,
      }
    }

    if (!quote) {
      return {
        ticker,
        shares: holding.shares,
        costBasis: holding.costBasis,
        quote: null,
        status: 'missing-quote',
        marketValueJpy: null,
        costValueJpy: null,
        pnlJpy: null,
        pnlPct: null,
      }
    }

    const currentPriceJpy = normalizeToJpy(quote.price, quote.currency, usdJpy)
    const costBasisJpy = normalizeToJpy(holding.costBasis, quote.currency, usdJpy)

    if (currentPriceJpy == null || costBasisJpy == null) {
      return {
        ticker,
        shares: holding.shares,
        costBasis: holding.costBasis,
        quote,
        status: 'pending-rate',
        marketValueJpy: null,
        costValueJpy: null,
        pnlJpy: null,
        pnlPct: null,
      }
    }

    const marketValueJpy = currentPriceJpy * holding.shares
    const costValueJpy = costBasisJpy * holding.shares
    const pnlJpy = marketValueJpy - costValueJpy

    return {
      ticker,
      shares: holding.shares,
      costBasis: holding.costBasis,
      quote,
      status: 'ready',
      marketValueJpy,
      costValueJpy,
      pnlJpy,
      pnlPct: costValueJpy === 0 ? null : (pnlJpy / costValueJpy) * 100,
    }
  })

  const readyPositions = positions.filter(position => position.status === 'ready')
  const totalMarketValueJpy = readyPositions.reduce((sum, position) => sum + (position.marketValueJpy ?? 0), 0)
  const totalCostValueJpy = readyPositions.reduce((sum, position) => sum + (position.costValueJpy ?? 0), 0)
  const totalPnlJpy = readyPositions.reduce((sum, position) => sum + (position.pnlJpy ?? 0), 0)

  return {
    positions,
    totalMarketValueJpy,
    totalCostValueJpy,
    totalPnlJpy,
    totalPnlPct: totalCostValueJpy === 0 ? null : (totalPnlJpy / totalCostValueJpy) * 100,
    readyCount: readyPositions.length,
    hasUsdPositions: positions.some(position => position.quote?.currency === 'USD'),
    hasPendingRate: positions.some(position => position.status === 'pending-rate'),
  }
}

export function formatJpyAmount(value: number): string {
  return `¥${Math.round(value).toLocaleString('en-US')}`
}

export function formatNativePrice(value: number, currency: StockQuote['currency']): string {
  if (currency === 'JPY') {
    return `¥${Math.round(value).toLocaleString('en-US')}`
  }
  return `$${value.toFixed(2)}`
}

export function formatSignedPercent(value: number | null): string {
  if (value == null || !Number.isFinite(value)) {
    return 'N/A'
  }
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}
