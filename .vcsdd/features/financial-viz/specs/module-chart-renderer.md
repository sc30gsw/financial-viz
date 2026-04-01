---
coherence:
  node_id: "module:chart-renderer"
  type: module
  name: "Chart Renderer Module"
  depends_on:
    - id: "design:data-schema"
      relation: derives_from
    - id: "design:ui-components"
      relation: derives_from
---

# Chart Renderer Module

## Responsibilities

- Render revenue trend line charts (RevenueChart)
- Render multi-company comparison bar charts (ComparisonChart)
- Format large financial numbers (億円, 兆円, million USD)
- Handle empty/loading states

## Pure Utility Functions (purity boundary)

```typescript
// Number formatting (pure, no DOM)
function formatRevenue(value: number, currency: 'JPY' | 'USD'): string
function formatYoYGrowth(current: number, previous: number): string
```

## DOM-coupled Components

React components (RevenueChart, ComparisonChart) are inherently stateful/DOM-coupled.
Unit tests use jsdom environment via @testing-library/react.

## Test Coverage Requirements

- formatRevenue: JPY in 億円, USD in million $
- formatYoYGrowth: positive, negative, zero cases
- RevenueChart render: correct number of data points
- ComparisonChart render: correct number of bars per company
