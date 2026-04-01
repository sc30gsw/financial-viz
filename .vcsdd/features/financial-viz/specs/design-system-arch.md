---
coherence:
  node_id: "design:system-arch"
  type: design
  name: "System Architecture"
  depends_on:
    - id: "req:revenue-display"
      relation: derives_from
    - id: "req:graph-viz"
      relation: derives_from
  depended_by:
    - id: "module:data-loader"
    - id: "design:ui-components"
---

# System Architecture

## Layer Structure

```
UI Layer         src/components/     React components, Recharts, Tailwind CSS v4
Hook Layer       src/hooks/          useFinancialData — data fetching and state
API Layer        src/api/            yahoo-finance.ts — external API wrapper
Types            src/types/          TypeScript interfaces
```

## Data Flow

```
CompanySelector (UI)
  → useFinancialData hook
    → yahoo-finance.ts API wrapper
      → yahoo-finance2 npm package
        → Yahoo Finance API
    → Returns CompanyFinancials[]
  → RevenueChart / ComparisonChart (Recharts)
```

## Purity Boundaries

- `src/api/yahoo-finance.ts`: pure async functions, no side effects
- `src/hooks/useFinancialData.ts`: React hook, manages loading/error state
- `src/components/`: UI rendering only, no direct API calls
