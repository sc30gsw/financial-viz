---
coherence:
  node_id: "req:graph-viz"
  type: requirement
  name: "Graph Visualization Requirements"
  depended_by:
    - id: "design:system-arch"
    - id: "design:ui-components"
---

# REQ-002: Graph Visualization Requirements

## Summary
Provide interactive financial data visualization using charts (Recharts).

## EARS Format Requirements

- WHEN financial data is loaded, the system SHALL render bar and line charts using Recharts
- WHEN a user hovers over a data point, the system SHALL display a tooltip with exact values
- WHEN the viewport is mobile-sized, the system SHALL render responsive charts that adapt to screen width
- IF chart data changes (e.g., company selection), the system SHALL animate the transition

## Edge Cases

1. Empty dataset → show "No data available" placeholder
2. Single data point → chart must handle gracefully (bar chart, not line)
3. Very long company names → truncate with tooltip
