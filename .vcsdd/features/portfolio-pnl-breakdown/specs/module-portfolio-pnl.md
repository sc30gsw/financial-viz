---
coherence:
  node_id: "module:portfolio-pnl"
  type: module
  name: "Portfolio PnL Module"
  depends_on:
    - id: "design:portfolio-pnl-breakdown"
      relation: depends_on
    - id: "req:portfolio-pnl-breakdown"
      relation: derives_from
  depended_by:
    - id: "test:strategy"
  source_files:
    - "src/components/PortfolioBreakdownPanel.tsx"
    - "src/hooks/usePortfolioQuoteQuery.ts"
    - "src/utils/portfolio-pnl.ts"
    - "src/__tests__/portfolio-breakdown-panel.test.tsx"
    - "src/__tests__/portfolio-pnl.test.ts"
    - "src/__tests__/use-portfolio-quote-query.test.tsx"
---

# Portfolio PnL Module

## Responsibilities

- Fetch latest quotes for the selected tickers through `usePortfolioQuoteQuery()`
- Keep holdings input editable even while quotes are loading or partially missing
- Normalize per-position market value and cost basis into JPY totals
- Render aggregate totals only from positions in `ready` state

## Pure Utility Contract

```typescript
export interface PortfolioHoldingInput {
  shares: number | null
  costBasis: number | null
}

export type PortfolioPositionStatus =
  | 'missing-input'
  | 'missing-quote'
  | 'pending-rate'
  | 'ready'

export function buildPortfolioPnlSummary(
  tickers: string[],
  holdings: Record<string, PortfolioHoldingInput>,
  quotes: Record<string, StockQuote>,
  usdJpy?: number,
): PortfolioPnlSummary
```

## Test Coverage Requirements

- USD rows convert to JPY when `usdJpy` is present
- USD rows become `pending-rate` when `usdJpy` is absent
- Rows with missing quantity/cost remain visible and do not affect totals
- Holdings inputs are controlled and emit parsed numeric values
- Ready rows display current price in native quote currency
- Quote fetch failure preserves the holdings editor and surfaces an error state without crashing
