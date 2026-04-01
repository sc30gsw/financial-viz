import type { CompanyFinancials, GrowthData, IncomeStatement, RankedCompany } from '../types/financial'

export function calculateYoY(current: number, previous: number): number | null {
  if (previous === 0) return null
  return ((current - previous) / Math.abs(previous)) * 100
}

export function normalizeToGrowthRate(data: IncomeStatement[]): GrowthData[] {
  const sorted = [...data].sort((a, b) => b.year - a.year)
  const result: GrowthData[] = []

  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i]
    const previous = sorted[i + 1]
    result.push({
      year: current.year,
      revenueGrowth: calculateYoY(current.revenue, previous.revenue),
      operatingIncomeGrowth: calculateYoY(current.operatingIncome, previous.operatingIncome),
      netIncomeGrowth: calculateYoY(current.netIncome, previous.netIncome),
    })
  }

  return result
}

export function rankByMetric(
  companies: CompanyFinancials[],
  metric: keyof IncomeStatement,
): RankedCompany[] {
  const scored = companies.map(c => {
    const latestYear = c.annualData[0]
    const value = latestYear ? (latestYear[metric] as number) : 0
    return {
      ticker: c.company.ticker,
      name: c.company.name,
      value,
      rank: 0,
    }
  })

  scored.sort((a, b) => b.value - a.value)
  scored.forEach((item, idx) => { item.rank = idx + 1 })

  return scored
}
