import YahooFinance from 'yahoo-finance2'
import type { FundamentalsTimeSeriesFinancialsResult } from 'yahoo-finance2/modules/fundamentalsTimeSeries'
import type { CompanyFinancials, IncomeStatement, StockQuote } from '../types/financial'

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] })

function detectExchange(ticker: string): CompanyFinancials['company']['exchange'] {
  if (ticker.endsWith('.T')) return 'TSE'
  return 'OTHER'
}

function detectCurrency(ticker: string): 'JPY' | 'USD' {
  if (ticker.endsWith('.T')) return 'JPY'
  return 'USD'
}

export function transformFundamentalsRow(
  row: FundamentalsTimeSeriesFinancialsResult,
  currency: 'JPY' | 'USD',
): IncomeStatement {
  return {
    year: row.date.getFullYear(),
    revenue: row.totalRevenue ?? 0,
    operatingIncome: row.operatingIncome ?? 0,
    netIncome: row.netIncome ?? 0,
    currency,
  }
}

export async function fetchFinancials(ticker: string): Promise<CompanyFinancials> {
  const fiveYearsAgo = new Date()
  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5)

  const [rows, summary] = await Promise.all([
    yahooFinance.fundamentalsTimeSeries(ticker, {
      module: 'financials',
      type: 'annual',
      period1: fiveYearsAgo,
    }),
    yahooFinance.quoteSummary(ticker, { modules: ['price'] }),
  ])

  if (!rows || rows.length === 0) {
    throw new Error(`No financial data found for ticker: ${ticker}`)
  }

  const currency = detectCurrency(ticker)
  const annualData: IncomeStatement[] = (rows as FundamentalsTimeSeriesFinancialsResult[])
    .filter(row => row.totalRevenue != null)
    .map(row => transformFundamentalsRow(row, currency))
    .sort((a, b) => b.year - a.year)

  if (annualData.length === 0) {
    throw new Error(`No income statement data found for ticker: ${ticker}`)
  }

  const name = summary?.price?.longName ?? summary?.price?.shortName ?? ticker

  return {
    company: {
      ticker,
      name,
      exchange: detectExchange(ticker),
    },
    annualData,
    lastUpdated: new Date().toISOString(),
  }
}

export async function fetchQuote(ticker: string): Promise<StockQuote> {
  const result = await yahooFinance.quote(ticker)
  if (!result) {
    throw new Error(`No quote found for ticker: ${ticker}`)
  }
  return {
    ticker,
    price: result.regularMarketPrice ?? 0,
    currency: detectCurrency(ticker),
    marketCap: result.marketCap,
  }
}
