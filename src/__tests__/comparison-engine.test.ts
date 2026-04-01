import { describe, it, expect } from 'vitest'
import { normalizeToGrowthRate, rankByMetric, calculateYoY } from '../api/comparison-engine'
import type { IncomeStatement } from '../types/financial'

const sampleData: IncomeStatement[] = [
  { year: 2023, revenue: 110, operatingIncome: 20, netIncome: 15, currency: 'USD' },
  { year: 2022, revenue: 100, operatingIncome: 18, netIncome: 12, currency: 'USD' },
  { year: 2021, revenue: 90,  operatingIncome: 16, netIncome: 10, currency: 'USD' },
]

describe('calculateYoY', () => {
  it('calculates positive growth', () => {
    expect(calculateYoY(110, 100)).toBeCloseTo(10.0)
  })

  it('calculates negative growth', () => {
    expect(calculateYoY(90, 100)).toBeCloseTo(-10.0)
  })

  it('returns 0 when values are equal', () => {
    expect(calculateYoY(100, 100)).toBe(0)
  })

  it('returns null when previous is 0', () => {
    expect(calculateYoY(100, 0)).toBeNull()
  })
})

describe('normalizeToGrowthRate', () => {
  it('computes YoY growth rates for each year', () => {
    const result = normalizeToGrowthRate(sampleData)
    expect(result).toHaveLength(2) // 3 years -> 2 growth periods
    expect(result[0].year).toBe(2023)
    expect(result[0].revenueGrowth).toBeCloseTo(10.0)
  })

  it('preserves company data identity', () => {
    const result = normalizeToGrowthRate(sampleData)
    expect(result[0].year).toBeDefined()
    expect(result[0].revenueGrowth).toBeDefined()
  })
})

describe('rankByMetric', () => {
  const companies = [
    { company: { ticker: 'A', name: 'Company A', exchange: 'NYSE' as const }, annualData: [{ year: 2023, revenue: 300, operatingIncome: 30, netIncome: 25, currency: 'USD' as const }], lastUpdated: '' },
    { company: { ticker: 'B', name: 'Company B', exchange: 'NYSE' as const }, annualData: [{ year: 2023, revenue: 100, operatingIncome: 10, netIncome: 8, currency: 'USD' as const }], lastUpdated: '' },
    { company: { ticker: 'C', name: 'Company C', exchange: 'NYSE' as const }, annualData: [{ year: 2023, revenue: 200, operatingIncome: 20, netIncome: 15, currency: 'USD' as const }], lastUpdated: '' },
  ]

  it('ranks companies by revenue descending', () => {
    const result = rankByMetric(companies, 'revenue')
    expect(result[0].ticker).toBe('A')
    expect(result[1].ticker).toBe('C')
    expect(result[2].ticker).toBe('B')
  })

  it('handles single company', () => {
    const result = rankByMetric([companies[0]], 'revenue')
    expect(result).toHaveLength(1)
    expect(result[0].ticker).toBe('A')
  })
})
