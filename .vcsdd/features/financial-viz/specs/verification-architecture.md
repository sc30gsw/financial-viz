# Verification Architecture

## Purity Boundary Map

| Module | Classification | Rationale |
|--------|---------------|-----------|
| `src/api/yahoo-finance.ts` | **Pure** (async) | No side effects beyond network I/O; returns typed data |
| `src/hooks/useFinancialData.ts` | **Stateful** | React hook managing loading/error state |
| `src/components/*.tsx` | **DOM-coupled** | Render to virtual DOM via React |
| Utility functions (`formatRevenue`, `calculateYoY`, `normalizeToGrowthRate`, `rankByMetric`) | **Pure** | No external deps, deterministic |
| `src/utils/trend-data.ts` (`buildTrendChartData`) | **Pure** | No external deps, deterministic data transform |

## Proof Obligations

| ID | Description | Tier | Required |
|----|-------------|------|---------|
| PROP-001 | formatRevenue always returns non-empty string | 0 | false |
| PROP-002 | calculateYoY handles division by zero (previous=0) | 0 | false |
| PROP-003 | normalizeToGrowthRate preserves company identity | 0 | false |
| PROP-004 | buildTrendChartData: missing year → key absent (not 0) | 0 | false |
| PROP-005 | buildTrendChartData: USD normalized to JPY when usdJpy provided | 0 | false |
| PROP-006 | buildTrendChartData: years sorted ascending | 0 | false |
| PROP-007 | TrendChart renders correct number of Line elements for N companies | 0 | false |
| PROP-008 | buildTrendChartData(mode='yoyGrowth'): returned data[year][companyKey] values equal the growthRate percentages produced by normalizeToGrowthRate() for the same input companies | 0 | false |
| PROP-009 | buildTrendChartData(mode='yoyGrowth'): companies with < 2 years of data are absent from data entries and appear in excludedCompanies[]; companies with >= 2 years appear in data and not in excludedCompanies | 0 | false |
| PROP-010 | TrendChart: mode toggle renders 絶対値/前年比% buttons (default=絶対値); clicking 前年比% triggers re-render with yoyGrowth data; excluded companies note is displayed below chart when excludedCompanies is non-empty | 0 | false |

**Tier 0**: Tests + review only. No formal proof tool required.

## Verification Tier

All components: **Tier 0** (Vitest unit + component tests, adversary review).

Rationale: This is a data visualization prototype. Safety-critical formal proof (Tier 2-3) is not justified.
