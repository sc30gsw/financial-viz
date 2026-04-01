---
coherence:
  node_id: "design:data-schema"
  type: design
  name: "Data Schema Design"
  depends_on:
    - id: "req:revenue-display"
      relation: derives_from
    - id: "req:company-comparison"
      relation: derives_from
    - id: "req:company-strategy"
      relation: derives_from
    - id: "req:sector-analysis"
      relation: derives_from
  depended_by:
    - id: "module:data-loader"
    - id: "module:chart-renderer"
    - id: "module:comparison-engine"
---

# Data Schema Design

## CompanyFinancials (flat structure — Sprint 1)

```typescript
interface IncomeStatement {
  year: number
  revenue: number         // 売上高 (JPY or USD)
  operatingIncome: number // 営業利益
  netIncome: number       // 純利益
  currency: 'JPY' | 'USD'
}

interface CompanyInfo {
  ticker: string
  name: string
  nameJa?: string
  exchange: 'TSE' | 'NYSE' | 'NASDAQ'
}

interface CompanyFinancials {
  company: CompanyInfo
  annualData: IncomeStatement[]  // sorted by year desc
  lastUpdated: string            // ISO8601
  fetchedAt?: string             // ISO8601 — Sprint 5: when data was fetched from API
  isStale?: boolean              // Sprint 5: true when cache TTL has expired
}
```

## Data Source

- Primary: yahoo-finance2 `quoteSummary` with `incomeStatementHistory` module
- Ticker format: Japanese TSE stocks use `7203.T` (Toyota), `9984.T` (SoftBank)
- Ticker format: US stocks use standard format `AAPL`, `MSFT`
