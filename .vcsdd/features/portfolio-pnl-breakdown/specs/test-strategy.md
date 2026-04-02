---
coherence:
  node_id: "test:strategy"
  type: test
  name: "Test Strategy"
  depends_on:
    - id: "module:portfolio-pnl"
      relation: derives_from
---

# Test Strategy

## Test Layers

| Layer | Tool | Scope |
|-------|------|-------|
| Unit | Vitest | `buildPortfolioPnlSummary()` normalization and aggregation |
| Component | Vitest + @testing-library/react | `PortfolioBreakdownPanel` rendering, native-price display, controlled inputs, and error/pending states |
| Integration | Vitest + React Query | `usePortfolioQuoteQuery()` quote fetch behavior and ticker-keyed result mapping |

## Test Files

- `src/__tests__/portfolio-pnl.test.ts` — portfolio PnL normalization and aggregate calculation
- `src/__tests__/portfolio-breakdown-panel.test.tsx` — holdings input rendering, native-price display, summary display, and error/pending states
- `src/__tests__/use-portfolio-quote-query.test.tsx` — quote query integration, ticker-keyed mapping, and error handling

## Mocking Strategy

- `fetch`: stubbed globally per test
- No real network calls in tests
- Fixtures: predefined quotes for Apple (`AAPL`) and Toyota (`7203.T`)
