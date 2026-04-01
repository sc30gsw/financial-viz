import { useState, useEffect } from 'react'
import { fetchFinancials } from '../api/yahoo-finance'
import type { CompanyFinancials } from '../types/financial'

interface UseFinancialDataResult {
  data: CompanyFinancials[]
  loading: boolean
  error: string | null
}

export function useFinancialData(tickers: string[]): UseFinancialDataResult {
  const [data, setData] = useState<CompanyFinancials[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (tickers.length === 0) {
      setData([])
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.all(tickers.map(ticker => fetchFinancials(ticker)))
      .then(results => {
        if (!cancelled) {
          setData(results)
          setLoading(false)
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch financial data')
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [tickers.join(',')])

  return { data, loading, error }
}
