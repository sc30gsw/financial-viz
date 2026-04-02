import { keepPreviousData, useQueries } from '@tanstack/react-query'
import { upfetch } from '../api/fetch-client'
import type { StockQuote } from '../types/financial'

interface UsePortfolioQuoteQueryResult {
  data: Record<string, StockQuote>
  isLoading: boolean
  error: Error | null
}

export function usePortfolioQuoteQuery(tickers: string[]): UsePortfolioQuoteQueryResult {
  const results = useQueries({
    queries: tickers.map(ticker => ({
      queryKey: ['quote', ticker],
      queryFn: (): Promise<StockQuote> => upfetch<StockQuote>(`/quote/${ticker}`),
      staleTime: 60 * 1000,
      placeholderData: keepPreviousData,
      retry: false,
    })),
  })

  return {
    data: results.reduce<Record<string, StockQuote>>((acc, result) => {
      if (result.data) {
        acc[result.data.ticker] = result.data
      }
      return acc
    }, {}),
    isLoading: results.some(result => result.isLoading),
    error: (results.find(result => result.error)?.error as Error | null | undefined) ?? null,
  }
}
