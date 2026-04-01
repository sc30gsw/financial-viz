import type { CompanyFinancials } from '../types/financial'
import { normalizeToGrowthRate } from '../api/comparison-engine'

export interface TrendDataPoint {
  year: number
  [companyKey: string]: number | undefined | string
}

export type TrendDisplayMode = 'absolute' | 'yoyGrowth'

export interface TrendChartData {
  data: TrendDataPoint[]
  excludedCompanies: string[]
}

function sanitizeKey(ticker: string): string {
  return ticker.replace(/\./g, '_')
}

function toJpy(value: number, currency: 'JPY' | 'USD', usdJpy: number): number {
  return currency === 'USD' ? value * usdJpy : value
}

export function buildTrendChartData(
  companies: CompanyFinancials[],
  metric: 'revenue' | 'operatingIncome' | 'netIncome',
  usdJpy?: number,
  mode: TrendDisplayMode = 'absolute',
): TrendChartData {
  if (companies.length === 0) {
    return { data: [], excludedCompanies: [] }
  }

  if (mode === 'absolute') {
    return buildAbsoluteData(companies, metric, usdJpy)
  }

  return buildYoYGrowthData(companies, metric)
}

function buildYoYGrowthData(
  companies: CompanyFinancials[],
  metric: 'revenue' | 'operatingIncome' | 'netIncome',
): TrendChartData {
  const growthMetricKey = {
    revenue: 'revenueGrowth',
    operatingIncome: 'operatingIncomeGrowth',
    netIncome: 'netIncomeGrowth',
  } as const

  const excludedCompanies: string[] = []
  const includedCompanies: Array<{ ticker: string; key: string; growthByYear: Map<number, number | null> }> = []

  for (const company of companies) {
    if (company.annualData.length < 2) {
      excludedCompanies.push(company.company.ticker)
      continue
    }
    const growthData = normalizeToGrowthRate(company.annualData)
    const growthByYear = new Map<number, number | null>()
    for (const g of growthData) {
      growthByYear.set(g.year, g[growthMetricKey[metric]])
    }
    includedCompanies.push({
      ticker: company.company.ticker,
      key: sanitizeKey(company.company.ticker),
      growthByYear,
    })
  }

  if (includedCompanies.length === 0) {
    return { data: [], excludedCompanies }
  }

  const yearSet = new Set<number>()
  for (const { growthByYear } of includedCompanies) {
    for (const year of growthByYear.keys()) {
      yearSet.add(year)
    }
  }

  const years = Array.from(yearSet).sort((a, b) => a - b)

  const data: TrendDataPoint[] = years.map(year => {
    const point: TrendDataPoint = { year }
    for (const { key, growthByYear } of includedCompanies) {
      const value = growthByYear.get(year)
      if (value !== undefined && value !== null) {
        point[key] = value
      }
    }
    return point
  }).filter(point => {
    // Only keep years where at least one company has data
    return Object.keys(point).length > 1
  })

  return { data, excludedCompanies }
}

function buildAbsoluteData(
  companies: CompanyFinancials[],
  metric: 'revenue' | 'operatingIncome' | 'netIncome',
  usdJpy?: number,
): TrendChartData {
  const hasMixedCurrency = companies.some(c =>
    c.annualData.some(d => d.currency === 'USD')
  ) && companies.some(c =>
    c.annualData.some(d => d.currency === 'JPY')
  )

  // Collect union of all years
  const yearSet = new Set<number>()
  for (const company of companies) {
    for (const row of company.annualData) {
      yearSet.add(row.year)
    }
  }

  const years = Array.from(yearSet).sort((a, b) => a - b)

  const data: TrendDataPoint[] = years.map(year => {
    const point: TrendDataPoint = { year }
    for (const company of companies) {
      const key = sanitizeKey(company.company.ticker)
      const row = company.annualData.find(d => d.year === year)
      if (row !== undefined) {
        const rawValue = row[metric]
        if (hasMixedCurrency && usdJpy !== undefined) {
          point[key] = toJpy(rawValue, row.currency, usdJpy)
        } else {
          point[key] = rawValue
        }
      }
      // If row is undefined for this year, key is intentionally absent (gap)
    }
    return point
  })

  return { data, excludedCompanies: [] }
}
