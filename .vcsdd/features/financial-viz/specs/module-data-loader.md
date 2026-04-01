---
coherence:
  node_id: "module:data-loader"
  type: module
  name: "Data Loader Module"
  depends_on:
    - id: "design:data-schema"
      relation: derives_from
    - id: "design:system-arch"
      relation: derives_from
---

# Data Loader Module

## Responsibilities

- Fetch company financial data from yahoo-finance2
- Transform raw API response into `CompanyFinancials` type
- Handle errors (network, rate limit, invalid ticker)
- Provide loading state via React hook

## Pure Functions (purity boundary)

```typescript
// src/api/yahoo-finance.ts
async function fetchFinancials(ticker: string): Promise<CompanyFinancials>
async function fetchQuote(ticker: string): Promise<StockQuote>
function transformIncomeStatement(raw: YFIncomeStatement): IncomeStatement
```

## Test Coverage Requirements

- Happy path: valid ticker returns CompanyFinancials
- Invalid ticker: throws TickerNotFoundError
- Network error: propagates with descriptive message
- Data transformation: all fields mapped correctly
