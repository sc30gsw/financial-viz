---
coherence:
  node_id: "req:company-strategy"
  type: requirement
  name: "Company Strategy Display Requirements"
  depended_by:
    - id: "design:data-schema"
    - id: "design:ui-components"
---

# REQ-004: Company Strategy Display Requirements (Added in Change A)

## Summary
Display company business summary, key strategies, and industry information.

## EARS Format Requirements

- WHEN a company is selected, the system SHALL display a business summary (businessSummary field from Yahoo Finance)
- WHEN strategy information is available, the system SHALL show industry, sector, and employee count
- IF strategy data is not available for a ticker, the system SHALL display a placeholder message
- WHERE applicable, the system SHALL display key financial ratios alongside strategy (P/E, ROE)

## Edge Cases

1. Very long business summaries → truncate with "show more" expansion
2. Non-English descriptions for Japanese companies → display as-is
3. Missing sector/industry classification → show "Unknown"
