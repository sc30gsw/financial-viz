import { useQueries, keepPreviousData } from '@tanstack/react-query'
import { upfetch } from '../api/fetch-client'
import type { CompanyFinancials } from '../types/financial'

interface UseFinancialQueryResult {
  data: CompanyFinancials[]
  isLoading: boolean
  error: Error | null
}

export function useFinancialQuery(tickers: string[]): UseFinancialQueryResult {
  const results = useQueries({
    queries: tickers.map(ticker => ({
      queryKey: ['financials', ticker],
      queryFn: (): Promise<CompanyFinancials> => upfetch<CompanyFinancials>(`/financials/${ticker}`),
      staleTime: 5 * 60 * 1000,
      placeholderData: keepPreviousData,
    })),
  })

  return {
    data: results.flatMap(r => (r.data ? [r.data] : [])),
    isLoading: results.some(r => r.isLoading),
    error: (results.find(r => r.error)?.error as Error | null | undefined) ?? null,
  }
}
