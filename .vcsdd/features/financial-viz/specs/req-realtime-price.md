---
coherence:
  node_id: "req:realtime-price"
  type: requirement
  name: "Realtime Price Display Requirement"
  depended_by:
    - id: "design:realtime-adapter"
---

# REQ-006: Realtime Stock Price Display

## Requirement

The application MUST display real-time stock prices alongside historical financial data to enable investors to assess current market conditions vs historical performance.

## Behavioral Specification (EARS Format)

- **WHEN** a company is selected **THE SYSTEM SHALL** fetch the current stock price using Yahoo Finance quote API
- **WHEN** a price is available **THE SYSTEM SHALL** display it in the company card with currency indicator
- **WHEN** price is unavailable (after market hours) **THE SYSTEM SHALL** display last known price with timestamp

## Acceptance Criteria

| ID | Criterion | Priority |
|----|-----------|----------|
| AC-006-1 | Current price fetched via fetchQuote() function | High |
| AC-006-2 | Price displayed with currency (¥ for JPY, $ for USD) | High |
| AC-006-3 | Stale price indicator shown when market is closed | Medium |
