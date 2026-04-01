---
coherence:
  node_id: "req:company-comparison"
  type: requirement
  name: "Company Comparison Requirements"
  depended_by:
    - id: "design:data-schema"
---

# REQ-003: Company Comparison Requirements

## Summary
Allow users to compare financial metrics across multiple companies simultaneously.

## EARS Format Requirements

- WHEN a user selects 2+ companies, the system SHALL display a comparison chart side-by-side
- WHEN comparing companies, the system SHALL normalize data to allow fair comparison (e.g., YoY growth %)
- WHEN comparison data is loaded, the system SHALL highlight the highest-performing company
- IF more than 5 companies are selected, the system SHALL warn the user about chart readability

## Edge Cases

1. Companies with different fiscal year ends → normalize to calendar year
2. Currency differences (JPY vs USD) → display in base currency with note
3. Companies with incomplete historical data → show partial comparison with disclaimer
