import { describe, it, expect } from 'vitest'
import { groupBySector, filterBySector } from '../api/sector-analysis'
import type { CompanyFinancials } from '../types/financial'

const makeCompany = (ticker: string, sector: string, industry: string): CompanyFinancials => ({
  company: {
    ticker,
    name: `Company ${ticker}`,
    exchange: 'NYSE',
    sector,
    industry,
  },
  annualData: [{ year: 2023, revenue: 100, operatingIncome: 10, netIncome: 8, currency: 'USD' }],
  lastUpdated: '2023-01-01',
})

const companies: CompanyFinancials[] = [
  makeCompany('AAPL', 'Technology', 'Consumer Electronics'),
  makeCompany('MSFT', 'Technology', 'Software'),
  makeCompany('GOOGL', 'Technology', 'Internet Services'),
  makeCompany('7203.T', 'Consumer Cyclical', 'Auto Manufacturers'),
  makeCompany('9984.T', 'Technology', 'Telecom'),
]

describe('groupBySector', () => {
  it('groups companies by sector', () => {
    const result = groupBySector(companies)
    expect(result['Technology']).toHaveLength(4)
    expect(result['Consumer Cyclical']).toHaveLength(1)
  })

  it('returns empty object for empty input', () => {
    const result = groupBySector([])
    expect(result).toEqual({})
  })

  it('handles companies with undefined sector', () => {
    const noSector: CompanyFinancials = {
      company: { ticker: 'X', name: 'X', exchange: 'NYSE' },
      annualData: [],
      lastUpdated: '',
    }
    const result = groupBySector([noSector])
    expect(result['Unknown']).toHaveLength(1)
  })
})

describe('filterBySector', () => {
  it('filters companies by sector name', () => {
    const result = filterBySector(companies, 'Technology')
    expect(result).toHaveLength(4)
    result.forEach(c => expect(c.company.sector).toBe('Technology'))
  })

  it('returns empty array when no match', () => {
    const result = filterBySector(companies, 'Healthcare')
    expect(result).toHaveLength(0)
  })

  it('is case-sensitive', () => {
    const result = filterBySector(companies, 'technology')
    expect(result).toHaveLength(0)
  })
})
