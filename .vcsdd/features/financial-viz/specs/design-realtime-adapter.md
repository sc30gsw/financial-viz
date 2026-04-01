---
coherence:
  node_id: "design:realtime-adapter"
  type: design
  name: "Realtime Adapter Design"
  depends_on:
    - id: "req:realtime-price"
      relation: derives_from
    - id: "design:system-arch"
      relation: derives_from
---

# Design: Realtime Adapter

## Overview

Adapter layer that wraps the Yahoo Finance quote API for real-time price polling.

## Interface

```typescript
interface RealtimeAdapter {
  fetchCurrentPrice(ticker: string): Promise<StockQuote>
  subscribeToUpdates(ticker: string, callback: (quote: StockQuote) => void): () => void
}
```

## Implementation Notes

- Uses `fetchQuote()` from `src/api/yahoo-finance.ts`
- Polling interval: 60s (Yahoo Finance rate limits)
- Cache layer to avoid redundant requests
