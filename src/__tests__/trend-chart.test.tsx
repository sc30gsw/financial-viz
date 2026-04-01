import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { CompanyFinancials } from '../types/financial'
import { buildTrendChartData } from '../utils/trend-data'
import { normalizeToGrowthRate } from '../api/comparison-engine'
import TrendChart from '../components/TrendChart'

// Mock Recharts to make components testable in jsdom
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: ({ dataKey, dot, activeDot, opacity, onMouseEnter }: {
    dataKey: string
    dot: unknown
    activeDot: unknown
    opacity: number
    onMouseEnter?: () => void
  }) => (
    <div
      data-testid="recharts-line"
      data-key={dataKey}
      data-dot={JSON.stringify(dot)}
      data-active-dot={JSON.stringify(activeDot)}
      data-opacity={opacity}
      onMouseEnter={onMouseEnter}
    />
  ),
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
}))

// ── Test fixtures ──────────────────────────────────────────────────────────────

const jpyCompanyA: CompanyFinancials = {
  company: { ticker: '7203.T', name: 'Toyota', exchange: 'TSE' },
  annualData: [
    { year: 2022, revenue: 310_000_000_000, operatingIncome: 28_000_000_000, netIncome: 20_000_000_000, currency: 'JPY' },
    { year: 2023, revenue: 374_000_000_000, operatingIncome: 40_000_000_000, netIncome: 35_000_000_000, currency: 'JPY' },
    { year: 2024, revenue: 452_000_000_000, operatingIncome: 53_000_000_000, netIncome: 45_000_000_000, currency: 'JPY' },
  ],
  lastUpdated: '2024-01-01',
}

const jpyCompanyB: CompanyFinancials = {
  company: { ticker: '9984.T', name: 'SoftBank', exchange: 'TSE' },
  annualData: [
    { year: 2021, revenue: 60_000_000_000, operatingIncome: 5_000_000_000, netIncome: 3_000_000_000, currency: 'JPY' },
    { year: 2022, revenue: 63_000_000_000, operatingIncome: 6_000_000_000, netIncome: 2_000_000_000, currency: 'JPY' },
    { year: 2024, revenue: 70_000_000_000, operatingIncome: 7_000_000_000, netIncome: 4_000_000_000, currency: 'JPY' },
    // year 2023 intentionally missing (gap test)
  ],
  lastUpdated: '2024-01-01',
}

const usdCompany: CompanyFinancials = {
  company: { ticker: 'AAPL', name: 'Apple', exchange: 'NASDAQ' },
  annualData: [
    { year: 2022, revenue: 394_000_000_000, operatingIncome: 119_000_000_000, netIncome: 99_000_000_000, currency: 'USD' },
    { year: 2023, revenue: 383_000_000_000, operatingIncome: 114_000_000_000, netIncome: 97_000_000_000, currency: 'USD' },
  ],
  lastUpdated: '2024-01-01',
}

const dotTickerCompany: CompanyFinancials = {
  company: { ticker: '6758.T', name: 'Sony', exchange: 'TSE' },
  annualData: [
    { year: 2022, revenue: 100_000_000_000, operatingIncome: 10_000_000_000, netIncome: 5_000_000_000, currency: 'JPY' },
    { year: 2023, revenue: 110_000_000_000, operatingIncome: 11_000_000_000, netIncome: 6_000_000_000, currency: 'JPY' },
  ],
  lastUpdated: '2024-01-01',
}

// ── buildTrendChartData: absolute mode ────────────────────────────────────────

describe('buildTrendChartData (absolute mode)', () => {
  it('returns empty data and no excluded companies for empty input', () => {
    const result = buildTrendChartData([], 'revenue')
    expect(result.data).toEqual([])
    expect(result.excludedCompanies).toEqual([])
  })

  it('returns years sorted ascending', () => {
    const result = buildTrendChartData([jpyCompanyA], 'revenue')
    const years = result.data.map(d => d.year)
    expect(years).toEqual([2022, 2023, 2024])
  })

  it('sanitizes ticker keys: . → _', () => {
    const result = buildTrendChartData([dotTickerCompany], 'revenue')
    expect(result.data[0]).toHaveProperty('6758_T')
    expect(result.data[0]).not.toHaveProperty('6758.T')
  })

  it('maps JPY-only company revenue correctly', () => {
    const result = buildTrendChartData([jpyCompanyA], 'revenue')
    const row2023 = result.data.find(d => d.year === 2023)!
    expect(row2023['7203_T']).toBe(374_000_000_000)
  })

  it('maps USD-only company revenue as-is when no mixed currencies', () => {
    // USD-only: no conversion even if usdJpy provided (spec: convert only when mixed)
    const result = buildTrendChartData([usdCompany], 'revenue', 150)
    const row2022 = result.data.find(d => d.year === 2022)!
    expect(row2022['AAPL']).toBe(394_000_000_000)
  })

  it('normalizes USD to JPY when usdJpy provided and currencies are mixed', () => {
    const usdJpy = 150
    const result = buildTrendChartData([jpyCompanyA, usdCompany], 'revenue', usdJpy)
    const row2022 = result.data.find(d => d.year === 2022)!
    // AAPL is USD, should be converted to JPY
    expect(row2022['AAPL']).toBe(394_000_000_000 * usdJpy)
    // Toyota is JPY, should remain unchanged
    expect(row2022['7203_T']).toBe(310_000_000_000)
  })

  it('creates gap entry when one company has no data for a year', () => {
    // jpyCompanyB has no year 2023; jpyCompanyA does
    const result = buildTrendChartData([jpyCompanyA, jpyCompanyB], 'revenue')
    const row2023 = result.data.find(d => d.year === 2023)!
    expect(row2023['7203_T']).toBe(374_000_000_000)
    expect(row2023['9984_T']).toBeUndefined()
  })

  it('merges years from all companies (union)', () => {
    const result = buildTrendChartData([jpyCompanyA, jpyCompanyB], 'revenue')
    const years = result.data.map(d => d.year)
    expect(years).toContain(2021) // only B has 2021
    expect(years).toContain(2022)
    expect(years).toContain(2023) // only A has 2023
    expect(years).toContain(2024)
  })

  it('excludedCompanies is always [] in absolute mode', () => {
    const result = buildTrendChartData([jpyCompanyA, jpyCompanyB, usdCompany], 'revenue')
    expect(result.excludedCompanies).toEqual([])
  })

  it('maps operatingIncome metric correctly', () => {
    const result = buildTrendChartData([jpyCompanyA], 'operatingIncome')
    const row2022 = result.data.find(d => d.year === 2022)!
    expect(row2022['7203_T']).toBe(28_000_000_000)
  })

  it('maps netIncome metric correctly', () => {
    const result = buildTrendChartData([jpyCompanyA], 'netIncome')
    const row2022 = result.data.find(d => d.year === 2022)!
    expect(row2022['7203_T']).toBe(20_000_000_000)
  })
})

// ── TrendChart component ───────────────────────────────────────────────────────

describe('TrendChart component', () => {
  it('renders one Line per company', () => {
    render(
      <TrendChart companies={[jpyCompanyA, jpyCompanyB]} metric="revenue" />
    )
    const lines = screen.getAllByTestId('recharts-line')
    expect(lines.length).toBe(2)
  })

  it('renders 3 Lines for 3 companies', () => {
    render(
      <TrendChart companies={[jpyCompanyA, jpyCompanyB, dotTickerCompany]} metric="revenue" />
    )
    const lines = screen.getAllByTestId('recharts-line')
    expect(lines.length).toBe(3)
  })

  it('displays currency conversion note when usdJpy provided and companies are mixed currency', () => {
    render(
      <TrendChart companies={[jpyCompanyA, usdCompany]} metric="revenue" usdJpy={150} />
    )
    expect(screen.getByText(/USD.*JPY換算|USD→JPY換算/)).toBeInTheDocument()
  })

  it('does not display currency conversion note when all companies are same currency', () => {
    render(
      <TrendChart companies={[jpyCompanyA, jpyCompanyB]} metric="revenue" />
    )
    expect(screen.queryByText(/USD.*JPY換算|USD→JPY換算/)).not.toBeInTheDocument()
  })

  it('renders dot markers on each Line (r=4, strokeWidth=2)', () => {
    render(
      <TrendChart companies={[jpyCompanyA, jpyCompanyB]} metric="revenue" />
    )
    const lines = screen.getAllByTestId('recharts-line')
    lines.forEach(line => {
      const dotProp = JSON.parse(line.getAttribute('data-dot') ?? '{}')
      expect(dotProp.r).toBe(4)
      expect(dotProp.strokeWidth).toBe(2)
    })
  })

  it('activeDot has r=6 and strokeWidth=0 on each Line (REQ-MT-004a)', () => {
    render(
      <TrendChart companies={[jpyCompanyA, jpyCompanyB]} metric="revenue" />
    )
    const lines = screen.getAllByTestId('recharts-line')
    lines.forEach(line => {
      const activeDotProp = JSON.parse(line.getAttribute('data-active-dot') ?? '{}')
      expect(activeDotProp.r).toBe(6)
      expect(activeDotProp.strokeWidth).toBe(0)
    })
  })

  it('all Lines have opacity=1 when no line is hovered (REQ-MT-004b)', () => {
    render(
      <TrendChart companies={[jpyCompanyA, jpyCompanyB]} metric="revenue" />
    )
    const lines = screen.getAllByTestId('recharts-line')
    lines.forEach(line => {
      expect(Number(line.getAttribute('data-opacity'))).toBe(1)
    })
  })

  it('hovered Line stays at opacity=1; others reduce to 0.3 (REQ-MT-004b)', () => {
    render(
      <TrendChart companies={[jpyCompanyA, jpyCompanyB]} metric="revenue" />
    )
    const lines = screen.getAllByTestId('recharts-line')
    // Simulate hover on the first line
    fireEvent.mouseEnter(lines[0])
    // Re-query after state update
    const updatedLines = screen.getAllByTestId('recharts-line')
    expect(Number(updatedLines[0].getAttribute('data-opacity'))).toBe(1)
    expect(Number(updatedLines[1].getAttribute('data-opacity'))).toBe(0.3)
  })

  it('does not show excluded company note when no companies are excluded', () => {
    render(
      <TrendChart companies={[jpyCompanyA, jpyCompanyB]} metric="revenue" />
    )
    expect(screen.queryByText(/データ不足のため除外/)).not.toBeInTheDocument()
  })
})

// ── buildTrendChartData: yoyGrowth mode ───────────────────────────────────────

describe('buildTrendChartData (yoyGrowth mode)', () => {
  const singleYearCompany: CompanyFinancials = {
    company: { ticker: 'SINGLE', name: 'Single Year Co', exchange: 'NYSE' },
    annualData: [
      { year: 2023, revenue: 1_000_000_000, operatingIncome: 100_000_000, netIncome: 50_000_000, currency: 'USD' },
    ],
    lastUpdated: '2024-01-01',
  }

  it('returns growth rate values matching normalizeToGrowthRate() output', () => {
    const result = buildTrendChartData([jpyCompanyA], 'revenue', undefined, 'yoyGrowth')
    const growthData = normalizeToGrowthRate(jpyCompanyA.annualData)
    // Each year in result.data should have the matching revenueGrowth value
    for (const row of result.data) {
      const expected = growthData.find(g => g.year === row.year)
      if (expected) {
        expect(row['7203_T']).toBeCloseTo(expected.revenueGrowth as number, 5)
      }
    }
  })

  it('excludes company with < 2 years data from result.data', () => {
    const result = buildTrendChartData([jpyCompanyA, singleYearCompany], 'revenue', undefined, 'yoyGrowth')
    // All data rows should have no key for SINGLE
    for (const row of result.data) {
      expect(row['SINGLE']).toBeUndefined()
    }
  })

  it('includes excluded company ticker in excludedCompanies', () => {
    const result = buildTrendChartData([jpyCompanyA, singleYearCompany], 'revenue', undefined, 'yoyGrowth')
    expect(result.excludedCompanies).toContain('SINGLE')
  })

  it('does NOT list company with >= 2 years in excludedCompanies', () => {
    const result = buildTrendChartData([jpyCompanyA, singleYearCompany], 'revenue', undefined, 'yoyGrowth')
    expect(result.excludedCompanies).not.toContain('7203.T')
    expect(result.excludedCompanies).not.toContain('7203_T')
  })

  it('includes company with >= 2 years data in result.data', () => {
    const result = buildTrendChartData([jpyCompanyA, singleYearCompany], 'revenue', undefined, 'yoyGrowth')
    const hasData = result.data.some(row => row['7203_T'] !== undefined)
    expect(hasData).toBe(true)
  })

  it('returns empty excludedCompanies when all companies have >= 2 years', () => {
    const result = buildTrendChartData([jpyCompanyA, jpyCompanyB], 'revenue', undefined, 'yoyGrowth')
    expect(result.excludedCompanies).toEqual([])
  })
})

// ── TrendChart: yoyGrowth mode toggle ─────────────────────────────────────────

describe('TrendChart mode toggle', () => {
  const singleYearCompany: CompanyFinancials = {
    company: { ticker: 'SINGLE', name: 'Single Year Co', exchange: 'NYSE' },
    annualData: [
      { year: 2023, revenue: 1_000_000_000, operatingIncome: 100_000_000, netIncome: 50_000_000, currency: 'USD' },
    ],
    lastUpdated: '2024-01-01',
  }

  it('renders 絶対値 and 前年比% mode toggle buttons', () => {
    render(
      <TrendChart companies={[jpyCompanyA, jpyCompanyB]} metric="revenue" />
    )
    expect(screen.getByRole('button', { name: '絶対値' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '前年比%' })).toBeInTheDocument()
  })

  it('default mode is 絶対値 (前年比% not selected initially)', () => {
    render(
      <TrendChart companies={[jpyCompanyA, jpyCompanyB]} metric="revenue" />
    )
    // No excluded company note in absolute mode
    expect(screen.queryByText(/データ不足のため除外/)).not.toBeInTheDocument()
  })

  it('shows excluded company note after switching to 前年比% when a company has < 2 years', () => {
    render(
      <TrendChart companies={[jpyCompanyA, singleYearCompany]} metric="revenue" />
    )
    fireEvent.click(screen.getByRole('button', { name: '前年比%' }))
    expect(screen.getByText(/データ不足のため除外.*SINGLE/)).toBeInTheDocument()
  })

  it('does not show excluded note when switching to 前年比% with all companies having >= 2 years', () => {
    render(
      <TrendChart companies={[jpyCompanyA, jpyCompanyB]} metric="revenue" />
    )
    fireEvent.click(screen.getByRole('button', { name: '前年比%' }))
    expect(screen.queryByText(/データ不足のため除外/)).not.toBeInTheDocument()
  })
})
