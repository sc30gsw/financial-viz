import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import type { StockQuote } from '../types/financial'
import PortfolioBreakdownPanel from '../components/PortfolioBreakdownPanel'
import type { PortfolioHoldingInput } from '../utils/portfolio-pnl'

describe('PortfolioBreakdownPanel', () => {
  it('shows guidance before holdings are configured', () => {
    render(
      <PortfolioBreakdownPanel
        selectedTickers={['AAPL']}
        holdings={{}}
        quotes={{}}
        onHoldingChange={vi.fn()}
      />
    )

    expect(screen.getByText(/保有数量と取得単価を入力すると評価損益を計算/)).toBeInTheDocument()
  })

  it('emits parsed numeric input values', () => {
    const onHoldingChange = vi.fn()

    render(
      <PortfolioBreakdownPanel
        selectedTickers={['AAPL']}
        holdings={{ AAPL: { shares: null, costBasis: null } }}
        quotes={{}}
        onHoldingChange={onHoldingChange}
      />
    )

    fireEvent.change(screen.getByLabelText('AAPL 保有数量'), { target: { value: '10' } })
    fireEvent.change(screen.getByLabelText('AAPL 取得単価'), { target: { value: '120.5' } })

    expect(onHoldingChange).toHaveBeenNthCalledWith(1, 'AAPL', 'shares', 10)
    expect(onHoldingChange).toHaveBeenNthCalledWith(2, 'AAPL', 'costBasis', 120.5)
  })

  it('renders aggregated JPY totals and fx note for ready mixed-currency positions', () => {
    const holdings: Record<string, PortfolioHoldingInput> = {
      AAPL: { shares: 10, costBasis: 100 },
      '7203.T': { shares: 20, costBasis: 2000 },
    }
    const quotes: Record<string, StockQuote> = {
      AAPL: { ticker: 'AAPL', price: 120, currency: 'USD' },
      '7203.T': { ticker: '7203.T', price: 2500, currency: 'JPY' },
    }

    render(
      <PortfolioBreakdownPanel
        selectedTickers={['AAPL', '7203.T']}
        holdings={holdings}
        quotes={quotes}
        usdJpy={150}
        onHoldingChange={vi.fn()}
      />
    )

    const summary = screen.getByText('集計').closest('aside')
    expect(summary).not.toBeNull()
    expect(within(summary!).getByText('¥230,000')).toBeInTheDocument()
    expect(within(summary!).getByText('¥190,000')).toBeInTheDocument()
    expect(within(summary!).getByText('¥40,000')).toBeInTheDocument()
    expect(screen.getByText(/1 USD = ¥150/)).toBeInTheDocument()
  })

  it('renders current prices in native quote currency', () => {
    const holdings: Record<string, PortfolioHoldingInput> = {
      AAPL: { shares: 10, costBasis: 100 },
      '7203.T': { shares: 20, costBasis: 2000 },
    }
    const quotes: Record<string, StockQuote> = {
      AAPL: { ticker: 'AAPL', price: 120, currency: 'USD' },
      '7203.T': { ticker: '7203.T', price: 2500, currency: 'JPY' },
    }

    render(
      <PortfolioBreakdownPanel
        selectedTickers={['AAPL', '7203.T']}
        holdings={holdings}
        quotes={quotes}
        usdJpy={150}
        onHoldingChange={vi.fn()}
      />
    )

    expect(screen.getByText((content) => content.includes('$120.00'))).toBeInTheDocument()
    expect(screen.getByText((content) => content.includes('¥2,500'))).toBeInTheDocument()
  })

  it('shows quote error feedback while preserving input values', () => {
    render(
      <PortfolioBreakdownPanel
        selectedTickers={['AAPL']}
        holdings={{ AAPL: { shares: 10, costBasis: 100 } }}
        quotes={{}}
        error={new Error('quote failed')}
        onHoldingChange={vi.fn()}
      />
    )

    expect(screen.getByRole('alert')).toHaveTextContent('quote failed')
    expect(screen.getByLabelText('AAPL 保有数量')).toHaveValue(10)
    expect(screen.getByLabelText('AAPL 取得単価')).toHaveValue(100)
  })
})
