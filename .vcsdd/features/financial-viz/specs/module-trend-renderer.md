---
coherence:
  node_id: "module:trend-renderer"
  type: module
  name: "Trend Renderer Module"
  depends_on:
    - id: "design:data-schema"
      relation: depends_on
    - id: "design:ui-components"
      relation: depends_on
    - id: "req:multi-trend"
      relation: derives_from
  depended_by:
    - id: "test:strategy"
---

# Trend Renderer Module

## Responsibilities

- Transform `CompanyFinancials[]` into Recharts-ready `TrendDataPoint[]` via `buildTrendChartData()`
- Render multi-company `<LineChart>` with one `<Line type="monotone">` per company
- Display dot markers on each data point with hover highlight animation
- Handle JPY/USD currency normalization (same pattern as ComparisonChart)
- Handle missing data years as gaps (undefined, not 0)

## Pure Utility Functions (purity boundary)

```typescript
export interface TrendDataPoint {
  year: number
  [companyKey: string]: number | undefined | string
}

export type TrendDisplayMode = 'absolute' | 'yoyGrowth'

export interface TrendChartData {
  data: TrendDataPoint[]
  excludedCompanies: string[]  // tickers excluded due to insufficient data (< 2 years in yoyGrowth mode)
}

// Pure: no DOM, deterministic, testable without React
export function buildTrendChartData(
  companies: CompanyFinancials[],
  metric: 'revenue' | 'operatingIncome' | 'netIncome',
  usdJpy?: number,
  mode?: TrendDisplayMode,  // default: 'absolute'
): TrendChartData
```

### `buildTrendChartData` Contract

- Sanitizes ticker keys: `.` → `_` (same as ComparisonChart)
- Normalizes USD → JPY when `usdJpy` is provided and currencies are mixed
- Returns `data` entries sorted ascending by year
- Missing year for a company → key is absent (not set to 0 or null)
- When `mode === 'absolute'`: `excludedCompanies` is always `[]`
- When `mode === 'yoyGrowth'`:
  - Calls `normalizeToGrowthRate()` per company to compute YoY growth rates
  - Growth rate values are percentages: `5.0` means +5%, `-3.2` means −3.2% (consistent with `normalizeToGrowthRate()` return type `revenueGrowth: number | null`)
  - Companies with < 2 years of data are excluded from `data` and their tickers are listed in `excludedCompanies`
  - Years with `null` growth rate (first year of series) are omitted from `data` entries

## DOM-coupled Components

- `TrendChart.tsx`: React component, uses Recharts `<LineChart>`
- `dot` prop on `<Line>`: `{ r: 4, strokeWidth: 2 }` for visible markers
- `activeDot` prop on `<Line>`: `{ r: 6, strokeWidth: 0 }` for hover highlight animation (REQ-MT-004a); the `strokeWidth: 0` removes the dot border so the enlarged dot appears as a solid filled circle
- CSS transition on activeDot: Recharts handles this via its built-in animation
- Inactive lines' opacity set to 0.3 when a line is active; active line remains at opacity 1.0 (REQ-MT-004b) — implemented via Recharts `<Line opacity={...}>` with state

## Test Coverage Requirements

- `buildTrendChartData` (absolute mode): JPY-only, USD-only, mixed currency, missing year gap, empty input, year sort; `excludedCompanies` is always `[]`
- `buildTrendChartData` (yoyGrowth mode): returned `data` values match growth rate percentages from `normalizeToGrowthRate()`; companies with < 2 years data appear in `excludedCompanies` and are absent from `data`
- `TrendChart`: correct number of `<Line>` elements for N companies, currency conversion note display, dot markers present, mode toggle renders 絶対値/前年比% buttons, excluded company note displayed when `excludedCompanies` is non-empty
