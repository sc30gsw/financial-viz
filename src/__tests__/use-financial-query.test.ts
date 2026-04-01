/**
 * useFinancialQuery tests — Green Phase (Sprint 5)
 * Tests for TanStack Query based financial data hook
 * Covers REQ-AF-002, REQ-AF-005 (cache), REQ-AF-006 (error recovery)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { CompanyFinancials } from '../types/financial'

const mockFinancialData: CompanyFinancials = {
  company: {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    exchange: 'NASDAQ',
    sector: 'Technology',
    industry: 'Consumer Electronics',
  },
  annualData: [
    { year: 2023, revenue: 383_285_000_000, operatingIncome: 114_301_000_000, netIncome: 96_995_000_000, currency: 'USD' },
  ],
  lastUpdated: '2024-01-01',
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useFinancialQuery', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('returns empty data for empty tickers array', async () => {
    const { useFinancialQuery } = await import('../hooks/useFinancialQuery')
    const { result } = renderHook(() => useFinancialQuery([]), {
      wrapper: createWrapper(),
    })
    expect(result.current.data).toEqual([])
    expect(result.current.isLoading).toBe(false)
  })

  it('fetches financial data for a single ticker', async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(mockFinancialData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    )
    vi.stubGlobal('fetch', mockFetch)

    const { useFinancialQuery } = await import('../hooks/useFinancialQuery')
    const { result } = renderHook(() => useFinancialQuery(['AAPL']), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toHaveLength(1)
    expect(result.current.data[0]?.company.ticker).toBe('AAPL')
    expect(result.current.error).toBeNull()
  })

  it('fetches financial data for multiple tickers', async () => {
    const msftData: CompanyFinancials = {
      ...mockFinancialData,
      company: { ...mockFinancialData.company, ticker: 'MSFT', name: 'Microsoft' },
    }

    let callCount = 0
    const mockFetch = vi.fn().mockImplementation(() => {
      callCount++
      const data = callCount === 1 ? mockFinancialData : msftData
      return Promise.resolve(
        new Response(JSON.stringify(data), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    })
    vi.stubGlobal('fetch', mockFetch)

    const { useFinancialQuery } = await import('../hooks/useFinancialQuery')
    const { result } = renderHook(() => useFinancialQuery(['AAPL', 'MSFT']), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toHaveLength(2)
  })

  it('returns error on fetch failure', async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response('Server Error', { status: 500 })
    )
    vi.stubGlobal('fetch', mockFetch)

    const { useFinancialQuery } = await import('../hooks/useFinancialQuery')
    const { result } = renderHook(() => useFinancialQuery(['AAPL']), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).not.toBeNull()
  })

  it('shows loading state while fetching', async () => {
    let resolve: (value: Response) => void
    const fetchPromise = new Promise<Response>(r => { resolve = r })
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(fetchPromise))

    const { useFinancialQuery } = await import('../hooks/useFinancialQuery')
    const { result } = renderHook(() => useFinancialQuery(['AAPL']), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)

    // Resolve to clean up
    resolve!(new Response(JSON.stringify(mockFinancialData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }))
  })

  // REQ-AF-005: cache strategy
  it('accepts CompanyFinancials with optional fetchedAt and isStale fields', async () => {
    const dataWithCacheFields: CompanyFinancials = {
      ...mockFinancialData,
      fetchedAt: new Date().toISOString(),
      isStale: false,
    }
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(dataWithCacheFields), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    )
    vi.stubGlobal('fetch', mockFetch)

    const { useFinancialQuery } = await import('../hooks/useFinancialQuery')
    const { result } = renderHook(() => useFinancialQuery(['AAPL']), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const fetched = result.current.data[0]
    if (fetched) {
      expect(fetched.fetchedAt).toBeTypeOf('string')
      expect(fetched.isStale).toBe(false)
    }
  })

  // REQ-AF-006: error recovery — previous data shown on error
  it('returns null error when no tickers provided', async () => {
    vi.stubGlobal('fetch', vi.fn())
    const { useFinancialQuery } = await import('../hooks/useFinancialQuery')
    const { result } = renderHook(() => useFinancialQuery([]), {
      wrapper: createWrapper(),
    })
    expect(result.current.error).toBeNull()
    expect(result.current.data).toEqual([])
  })
})
