---
coherence:
  node_id: "req:revenue-display"
  type: requirement
  name: "Revenue Display Requirements"
  depended_by:
    - id: "design:data-schema"
    - id: "design:system-arch"
---

# REQ-001: Revenue Display Requirements

## Summary
Display company revenue (売上) and related financial metrics in a clear, interactive chart.

## EARS Format Requirements

- WHEN a user selects a company, the system SHALL display annual revenue data for the past 5 years
- WHEN revenue data is available, the system SHALL render a line chart with year-over-year trend
- IF revenue data is unavailable, the system SHALL display an appropriate loading or error state
- WHERE multiple metrics exist (revenue, operating income), the system SHALL allow toggling between them

## Edge Cases

1. Missing data for some years → interpolate or show gaps in chart
2. Very large revenue numbers (e.g., Toyota ¥30 trillion) → format with appropriate units (億円, 兆円)
3. Negative revenue growth → chart must handle downward trends visually
4. API rate limiting → graceful degradation with cached data
