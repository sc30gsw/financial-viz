import { useQuery } from '@tanstack/react-query'
import { upfetch } from '../api/fetch-client'
import type { StockQuote } from '../types/financial'

export function useExchangeRate(): number | undefined {
  const { data } = useQuery({
    queryKey: ['quote', 'USDJPY=X'],
    queryFn: (): Promise<StockQuote> => upfetch('/quote/USDJPY=X'),
    staleTime: 60 * 60 * 1000,
  })
  return data?.price
}
