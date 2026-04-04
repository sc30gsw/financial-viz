import { useQuery } from '@tanstack/react-query'
import { upfetch } from '../libs/upfetch'
import type { StockQuote } from '../types/financial'

export function useExchangeRate(): number | undefined {
  const { data } = useQuery({
    queryKey: ['quote', 'USDJPY=X'],
    queryFn: (): Promise<StockQuote> => upfetch<StockQuote>('/quote/USDJPY=X'),
    staleTime: 60 * 60 * 1000,
  })
  return data?.price
}
