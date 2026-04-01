---
coherence:
  node_id: "test:strategy"
  type: test
  name: "Test Strategy"
  depends_on:
    - id: "module:data-loader"
      relation: derives_from
    - id: "module:chart-renderer"
      relation: derives_from
    - id: "module:comparison-engine"
      relation: derives_from
    - id: "module:trend-renderer"
      relation: derives_from
---

# Test Strategy

## Test Layers

| Layer | Tool | Scope |
|-------|------|-------|
| Unit | Vitest | Pure functions (formatRevenue, calculateYoY, normalizeToGrowthRate) |
| Component | Vitest + @testing-library/react | RevenueChart, ComparisonChart rendering |
| Integration | Vitest (mock yahoo-finance2) | useFinancialData hook |

## Coverage Target: 80%+

## Test Files

- `src/__tests__/data-loader.test.ts` — API fetch and transform functions
- `src/__tests__/chart-renderer.test.ts` — formatRevenue, formatYoYGrowth
- `src/__tests__/comparison-engine.test.ts` — normalizeToGrowthRate, rankByMetric
- `src/__tests__/trend-chart.test.tsx` — buildTrendChartData (unit), TrendChart component (render including dot markers)

## Mocking Strategy

- `yahoo-finance2`: mock entire module with `vi.mock('yahoo-finance2')`
- No real network calls in tests
- Fixtures: predefined company data for Toyota (7203.T), Apple (AAPL)
