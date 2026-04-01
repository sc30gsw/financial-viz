---
coherence:
  node_id: "req:multi-trend"
  type: requirement
  name: "Multi-Company Trend Chart Requirements"
  depends_on:
    - id: "req:company-comparison"
      relation: derives_from
    - id: "req:graph-viz"
      relation: derives_from
  depended_by:
    - id: "design:ui-components"
    - id: "module:trend-renderer"
---

# REQ-MT: Multi-Company Trend Chart Requirements

## Summary

Display multiple companies' financial metrics as time-series line charts (折れ線グラフ), enabling temporal trend comparison across selected companies.

## EARS Format Requirements

- REQ-MT-001: WHEN 2 or more companies are selected, the system SHALL render a TrendChart with one `<Line>` per company
- REQ-MT-002: WHEN companies use different currencies (JPY / USD), the system SHALL normalize all values to JPY using the live USD/JPY exchange rate
- REQ-MT-003: WHEN a company has no data for a specific year, the system SHALL render a gap in that company's line (not zero-fill)
- REQ-MT-004: WHEN rendering the TrendChart, the system SHALL display dot markers on each data point (radius=4px, stroke-width=2)
- REQ-MT-004a: WHEN the user hovers a dot marker, the system SHALL highlight that line by enlarging the active dot (radius=6px) with a CSS transition (300ms ease-in-out)
- REQ-MT-004b: WHEN a line is active (hovered), the system SHALL visually distinguish it from inactive lines by reducing inactive lines' opacity to 0.3 (leaving the active line at full opacity)

- REQ-MT-005: WHEN the TrendChart is displayed, the system SHALL provide a display mode toggle with two options: "絶対値" (absolute values) and "前年比%" (YoY growth rate)
- REQ-MT-005a: WHEN "前年比%" mode is selected, the system SHALL compute YoY growth rates using `normalizeToGrowthRate()` from `src/api/comparison-engine.ts`; growth rate values are percentages (5.0 = +5%); display values as percentages in tooltip
- REQ-MT-005b: WHEN "前年比%" mode is selected and a company has fewer than 2 years of data, that company SHALL be excluded from the chart and listed in `buildTrendChartData`'s `excludedCompanies` return field; a text note SHALL appear below the chart listing excluded company tickers (e.g., "※ データ不足のため除外: AAPL"); the note SHALL NOT appear when `excludedCompanies` is empty

## Edge Cases

1. All companies have identical values → overlapping lines; still rendered, tooltip disambiguates
2. Exchange rate unavailable → show amber warning, render in native currencies without conversion
3. Single year of data → single dot per company, no line segment drawn
4. 5+ companies selected → chart remains functional; readability is user's responsibility
5. Mixed null/undefined data in a year → that year's entry omitted for affected company only
6. YoY mode with single-year company → company excluded from chart (REQ-MT-005b)
