# Behavioral Specification: financial-viz

## Feature Overview

A web application that visualizes company financial data (決算データ) including revenue, operating income, and strategy information, with multi-company comparison capabilities.

## Requirements Summary

| ID | Requirement | Priority |
|----|-------------|----------|
| REQ-001 | Revenue display with historical charts | High |
| REQ-002 | Interactive graph visualization (Recharts) | High |
| REQ-003 | Multi-company comparison | Medium |
| REQ-004 | Company strategy display | Medium |
| REQ-MT | Multi-company trend line chart | High |

## Behavioral Scenarios

### Scenario 1: Single Company Revenue View
- Given: User lands on the app
- When: User selects a ticker (e.g., "7203.T" for Toyota)
- Then: App fetches financials from Yahoo Finance and renders a LineChart of annual revenue

### Scenario 2: Multi-Company Comparison
- Given: One company is already selected
- When: User adds a second company
- Then: ComparisonChart renders BarChart with both companies side by side, normalized to growth %

### Scenario 3: Strategy Information
- Given: A company is selected
- When: Strategy panel loads
- Then: Business summary, sector, industry, and key ratios are displayed

### Scenario 4: Error Handling
- Given: User enters an invalid ticker
- When: API call fails
- Then: Error message is displayed; no crash

### Scenario 5: Multi-Company Trend View
- Given: User has selected 2 or more companies
- When: Financial data is loaded
- Then: A TrendChart renders with one line per company, dot markers (r=4px) on each data point, and a tooltip showing company name and value on hover
- And: When hovering a dot, the active dot enlarges (r=6px); inactive company lines reduce to 30% opacity while the hovered line remains at full opacity
- And: If companies have mixed currencies (JPY/USD), all values are normalized to JPY with an exchange rate note
- And: A display mode toggle shows "絶対値" and "前年比%" buttons; selecting "前年比%" switches to YoY growth rate display

## EARS-Format System Requirements

- WHEN the app loads, the system SHALL initialize with a default set of companies
- WHEN a user selects a ticker, the system SHALL fetch financials within 3 seconds
- IF the Yahoo Finance API is unavailable, the system SHALL display an error state
- WHERE financial data is in JPY, the system SHALL format values in 億円 (100M JPY)
- WHERE financial data is in USD, the system SHALL format values in million USD
