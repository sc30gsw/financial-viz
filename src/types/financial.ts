export interface IncomeStatement {
  year: number
  revenue: number
  operatingIncome: number
  netIncome: number
  currency: 'JPY' | 'USD'
}

export interface CompanyInfo {
  ticker: string
  name: string
  nameJa?: string
  exchange: 'TSE' | 'NYSE' | 'NASDAQ' | 'OTHER'
  sector?: string
  industry?: string
}

export interface CompanyFinancials {
  company: CompanyInfo
  annualData: IncomeStatement[]
  lastUpdated: string
  fetchedAt?: string
  isStale?: boolean
}

export interface StockQuote {
  ticker: string
  price: number
  currency: 'JPY' | 'USD'
  marketCap?: number
}

export interface GrowthData {
  year: number
  revenueGrowth: number | null
  operatingIncomeGrowth: number | null
  netIncomeGrowth: number | null
}

export interface RankedCompany {
  ticker: string
  name: string
  value: number
  rank: number
}
