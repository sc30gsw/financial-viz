---
coherence:
  node_id: "design:portfolio-pnl-breakdown"
  type: design
  name: "Portfolio PnL Breakdown Design"
  depends_on:
    - id: "req:portfolio-pnl-breakdown"
      relation: derives_from
---

# Design: Portfolio PnL Breakdown

## Overview

Add a holdings editor and summary panel for the currently selected tickers. The panel remains local-state driven for holdings input, while quotes are fetched through React Query so the latest market price stays aligned with the existing realtime-price adapter.

## Interface

```typescript
interface PortfolioHoldingInput {
  shares: number | null
  costBasis: number | null
}

interface PortfolioQuoteQueryResult {
  data: Record<string, StockQuote>
  isLoading: boolean
  error: Error | null
}
```

## Design Decisions

- Holdings input is stored per ticker in `App.tsx` and passed down as controlled values
- Quote retrieval starts as soon as tickers are selected and is separated into `usePortfolioQuoteQuery()` so the DOM layer stays thin
- Position normalization and aggregate math live in `buildPortfolioPnlSummary()` as a pure utility
- Cost basis is interpreted in the quote's native currency on a per-share basis
- Aggregate totals are shown in JPY; USD positions require `usdJpy`
- Quote fetch failures do not clear user-entered holdings; the panel shows a non-crashing error state while preserving controlled inputs
