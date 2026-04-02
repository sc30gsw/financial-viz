---
coherence:
  node_id: "req:portfolio-pnl-breakdown"
  type: requirement
  name: "Portfolio PnL Breakdown Requirement"
  depended_by:
    - id: "design:portfolio-pnl-breakdown"
---

# REQ-007: Portfolio PnL Breakdown

## Requirement

The application MUST allow a user to enter holding quantity and average cost basis for each selected ticker, then display the unrealized PnL per position and in aggregate using the latest market quote.

## Behavioral Specification (EARS Format)

- **WHEN** a ticker is selected **THE SYSTEM SHALL** fetch the latest quote for that ticker and show the current price in native quote currency
- **WHEN** the user enters a positive holding quantity and positive cost basis **THE SYSTEM SHALL** calculate market value, cost value, unrealized PnL, and PnL percentage for that position
- **WHERE** selected holdings include USD-denominated tickers **THE SYSTEM SHALL** normalize aggregate values to JPY using the current USD/JPY quote
- **IF** selected holdings include USD-denominated tickers and USD/JPY is unavailable **THE SYSTEM SHALL** keep those rows visible in a pending-rate state and exclude them from aggregate totals
- **IF** quantity or cost basis is missing or non-positive **THE SYSTEM SHALL** keep the position visible in an input-pending state and exclude it from aggregate totals
- **IF** the app cannot fetch a quote **THE SYSTEM SHALL** keep the holdings editor visible and show a non-crashing error state for the affected position

## Acceptance Criteria

| ID | Criterion | Priority |
|----|-----------|----------|
| AC-007-1 | User can edit holding quantity and average cost basis per selected ticker | High |
| AC-007-2 | Position-level unrealized PnL is computed from latest quote and cost basis | High |
| AC-007-3 | Mixed JPY/USD holdings aggregate into JPY totals with exchange-rate note | High |
| AC-007-4 | Missing input rows remain visible but do not affect totals | Medium |
