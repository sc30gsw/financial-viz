import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { StockQuote } from '../types/financial'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('usePortfolioQuoteQuery', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('returns empty data for empty tickers array', async () => {
    const { usePortfolioQuoteQuery } = await import('../hooks/usePortfolioQuoteQuery')
    const { result } = renderHook(() => usePortfolioQuoteQuery([]), {
      wrapper: createWrapper(),
    })

    expect(result.current.data).toEqual({})
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('fetches quote data for multiple tickers', async () => {
    const responses: StockQuote[] = [
      { ticker: 'AAPL', price: 120, currency: 'USD' },
      { ticker: '7203.T', price: 2500, currency: 'JPY' },
    ]

    let index = 0
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => {
      const body = responses[index++]
      return Promise.resolve(
        new Response(JSON.stringify(body), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    }))

    const { usePortfolioQuoteQuery } = await import('../hooks/usePortfolioQuoteQuery')
    const { result } = renderHook(() => usePortfolioQuoteQuery(['AAPL', '7203.T']), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data.AAPL?.price).toBe(120)
    expect(result.current.data['7203.T']?.price).toBe(2500)
  })

  it('returns error on quote fetch failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response('Server Error', { status: 500 })
    ))

    const { usePortfolioQuoteQuery } = await import('../hooks/usePortfolioQuoteQuery')
    const { result } = renderHook(() => usePortfolioQuoteQuery(['AAPL']), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).not.toBeNull()
  })
})
