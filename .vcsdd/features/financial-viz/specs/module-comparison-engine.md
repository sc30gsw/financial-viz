---
coherence:
  node_id: "module:comparison-engine"
  type: module
  name: "Comparison Engine Module"
  depends_on:
    - id: "design:data-schema"
      relation: derives_from
    - id: "req:company-comparison"
      relation: derives_from
  depended_by:
    - id: "test:strategy"
---

# Comparison Engine Module (Added in Change A)

## Responsibilities

- Normalize financial data across companies for fair comparison
- Calculate year-over-year growth percentages
- Rank companies by selected metric
- Handle currency normalization

## Pure Functions (purity boundary)

```typescript
function normalizeToGrowthRate(data: IncomeStatement[]): GrowthData[]
function rankByMetric(companies: CompanyFinancials[], metric: keyof IncomeStatement): RankedCompany[]
function calculateYoY(current: number, previous: number): number
```

## Test Coverage Requirements

- normalizeToGrowthRate: correct % calculation
- rankByMetric: correct descending order
- calculateYoY: positive/negative/zero cases
- Edge: single company, same value two years
