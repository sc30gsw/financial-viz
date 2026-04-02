# Verification Architecture

## Purity Boundary Map

| Module | Classification | Rationale |
|--------|---------------|-----------|
| `src/hooks/usePortfolioQuoteQuery.ts` | **Stateful** | React Query hook that coordinates quote fetch state |
| `src/components/PortfolioBreakdownPanel.tsx` | **DOM-coupled** | Controlled inputs and summary rendering |
| `src/utils/portfolio-pnl.ts` (`buildPortfolioPnlSummary`) | **Pure** | Deterministic position normalization and aggregation |

## Proof Obligations

| ID | Description | Tier | Required |
|----|-------------|------|---------|
| PROP-011 | buildPortfolioPnlSummary converts USD-denominated positions to JPY when usdJpy is provided | 0 | false |
| PROP-012 | buildPortfolioPnlSummary excludes rows with missing quantity or cost basis from aggregate totals | 0 | false |
| PROP-013 | buildPortfolioPnlSummary marks USD rows as pending-rate when usdJpy is absent | 0 | false |
| PROP-014 | PortfolioBreakdownPanel shows aggregate totals only for rows in ready state and keeps pending rows visible | 0 | false |
| PROP-015 | usePortfolioQuoteQuery fetches one quote per selected ticker and returns a ticker-keyed result map | 0 | false |
| PROP-016 | PortfolioBreakdownPanel displays the current price in native quote currency for ready rows | 0 | false |
| PROP-017 | PortfolioBreakdownPanel preserves the row editor and surfaces a non-crashing error state when quote retrieval fails | 0 | false |

## Verification Tier

All artifacts remain **Tier 0** for this sprint: Vitest unit tests, component tests, React Query integration tests, and adversary review.
