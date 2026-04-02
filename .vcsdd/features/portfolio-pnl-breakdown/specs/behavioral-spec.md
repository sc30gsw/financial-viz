# Behavioral Specification: portfolio-pnl-breakdown

## Feature Overview

Add a portfolio-oriented extension to financial-viz so that a user can enter holdings for the currently selected tickers and inspect unrealized PnL per position and in aggregate.

## Requirements Summary

| ID | Requirement | Priority |
|----|-------------|----------|
| REQ-007 | Portfolio PnL breakdown for selected holdings | High |

## Behavioral Scenarios

### Scenario 1: Position-Level PnL
- Given: User has selected one or more tickers
- When: The portfolio panel renders
- Then: The app fetches the latest quote for each selected ticker and shows the current price in native quote currency
- And: When the user enters holding quantity and average cost basis per ticker, the app renders position-level market value, cost value, unrealized PnL, and PnL percentage

### Scenario 2: Mixed-Currency Holdings
- Given: Selected holdings include both JPY and USD tickers
- When: The current USD/JPY rate is available
- Then: Aggregate totals are normalized to JPY and an exchange-rate note is shown
- And: If USD/JPY is unavailable, USD-denominated rows remain visible in a pending-rate state and are excluded from aggregate totals

### Scenario 3: Missing Input
- Given: A selected ticker has no quantity or no cost basis
- When: The portfolio panel renders
- Then: The row remains visible in an input-pending state and is excluded from totals

### Scenario 4: Quote Error Handling
- Given: A selected ticker quote cannot be fetched
- When: The quote request fails
- Then: The panel keeps the row visible, shows a non-crashing error state, and preserves user input

## EARS-Format System Requirements

- **WHEN** a user enters holding quantity and cost basis for a selected ticker, **THE SYSTEM SHALL** compute unrealized PnL from the latest quote
- **WHEN** a ticker is selected, **THE SYSTEM SHALL** fetch the latest quote for that ticker
- **WHEN** a quote is successfully fetched, **THE SYSTEM SHALL** show the current price in native quote currency
- **WHERE** selected holdings include USD-denominated tickers, **THE SYSTEM SHALL** normalize aggregate position totals to JPY using USD/JPY
- **IF** selected holdings include USD-denominated tickers and USD/JPY is unavailable, **THE SYSTEM SHALL** keep those rows visible in a pending-rate state and exclude them from aggregate totals
- **IF** holding quantity or cost basis is absent or non-positive, **THE SYSTEM SHALL** exclude that position from aggregate totals and show an input-pending state
- **IF** a quote request fails, **THE SYSTEM SHALL** preserve the holdings editor and display a non-crashing error message
