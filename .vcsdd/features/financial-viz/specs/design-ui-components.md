---
coherence:
  node_id: "design:ui-components"
  type: design
  name: "UI Components Design"
  depends_on:
    - id: "req:graph-viz"
      relation: derives_from
    - id: "design:system-arch"
      relation: derives_from
    - id: "req:multi-trend"
      relation: derives_from
  depended_by:
    - id: "module:chart-renderer"
    - id: "module:trend-renderer"
---

# UI Components Design

## Component Tree

```
App
├── CompanySelector       – multi-select for company tickers
├── ComparisonChart       – multi-company comparison (BarChart, shown when 1+ companies selected)
├── TrendChart            – multi-company trend (LineChart with dot markers, shown when 2+ companies selected)
├── RevenueChart          – single company revenue trend (LineChart, shown when exactly 1 company selected)
└── StrategyPanel         – company strategy / business summary text
```

## Styling

Tailwind CSS v4 utility classes. No CSS modules. Dark mode via `dark:` variants.

## Recharts Integration

- `RevenueChart`: `<LineChart>` with `<Line>` per metric
- `ComparisonChart`: `<BarChart>` with `<Bar>` per company
- `TrendChart`: `<LineChart>` with `<Line>` per company; `dot={{ r: 4, strokeWidth: 2 }}` for markers; `activeDot={{ r: 6, strokeWidth: 0 }}` for hover (REQ-MT-004a); inactive lines at opacity=0.3, active at opacity=1.0 (REQ-MT-004b); mode toggle: two `<button>` elements labeled 絶対値/前年比%, default=絶対値, clicking immediately triggers re-render with updated data from `buildTrendChartData`, no persistence across sessions (REQ-MT-005); `buildTrendChartData` returns `{ data, excludedCompanies }`; when `excludedCompanies` is non-empty, a text note is rendered below the chart e.g. "※ データ不足のため除外: TICKER1, TICKER2" (REQ-MT-005b); growth rate values displayed as percentages (e.g. 5.0 → +5%)
- All charts use `<ResponsiveContainer width="100%" height={300}>`
- Tooltips: custom formatter for 億円/百万ドル display
