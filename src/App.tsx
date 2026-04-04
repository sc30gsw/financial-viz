import { useState, lazy, Suspense } from 'react'
import { Shimmer } from 'shimmer-from-structure'
import CompanySelector from './components/CompanySelector'
import StrategyPanel from './components/StrategyPanel'
import { useFinancialQuery } from './hooks/useFinancialQuery'
import { useExchangeRate } from './hooks/useExchangeRate'
import { usePortfolioQuoteQuery } from './hooks/usePortfolioQuoteQuery'
import type { PortfolioHoldingInput } from './utils/portfolio-pnl'
import PortfolioBreakdownPanel from './components/PortfolioBreakdownPanel'
import './index.css'

const ComparisonChart = lazy(() => import('./components/ComparisonChart'))
const RevenueChart = lazy(() => import('./components/RevenueChart'))
const TrendChart = lazy(() => import('./components/TrendChart'))

type Metric = 'revenue' | 'operatingIncome' | 'netIncome'

function App() {
  const [selectedTickers, setSelectedTickers] = useState<string[]>([])
  const [metric, setMetric] = useState<Metric>('revenue')
  const [holdings, setHoldings] = useState<Record<string, PortfolioHoldingInput>>({})

  const { data, isLoading, error } = useFinancialQuery(selectedTickers)
  const quoteQuery = usePortfolioQuoteQuery(selectedTickers)
  const usdJpy = useExchangeRate()

  const handleHoldingChange = (
    ticker: string,
    field: keyof PortfolioHoldingInput,
    value: number | null,
  ) => {
    setHoldings(current => ({
      ...current,
      [ticker]: {
        shares: current[ticker]?.shares ?? null,
        costBasis: current[ticker]?.costBasis ?? null,
        [field]: value,
      },
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          決算データ可視化
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          企業の売上・営業利益・純利益を比較分析 — CoDD Verification Demo
        </p>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <CompanySelector selected={selectedTickers} onChange={setSelectedTickers} />

        {selectedTickers.length > 0 && (
          <Shimmer loading={quoteQuery.isLoading}>
            <PortfolioBreakdownPanel
              selectedTickers={selectedTickers}
              holdings={holdings}
              quotes={quoteQuery.data}
              usdJpy={usdJpy}
              error={quoteQuery.error}
              onHoldingChange={handleHoldingChange}
            />
          </Shimmer>
        )}

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
            エラー: {error.message}
          </div>
        )}

        {selectedTickers.length > 0 && !isLoading && (
          <div className="flex gap-2">
            {(['revenue', 'operatingIncome', 'netIncome'] as Metric[]).map(m => (
              <button
                key={m}
                onClick={() => setMetric(m)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  metric === m
                    ? 'bg-indigo-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {m === 'revenue' ? '売上高' : m === 'operatingIncome' ? '営業利益' : '純利益'}
              </button>
            ))}
          </div>
        )}

        {selectedTickers.length > 0 && (
          <Shimmer loading={isLoading}>
            {data.length > 0 ? (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                  <Suspense fallback={null}>
                    <ComparisonChart companies={data} metric={metric} usdJpy={usdJpy} />
                  </Suspense>
                </div>

                {data.length === 1 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                    <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">
                      売上推移
                    </h3>
                    <Suspense fallback={null}>
                      <RevenueChart data={data[0]} metric={metric} />
                    </Suspense>
                  </div>
                )}

                {data.length >= 2 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                    <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">
                      時系列トレンド比較
                    </h3>
                    <Suspense fallback={null}>
                      <TrendChart companies={data} metric={metric} usdJpy={usdJpy} />
                    </Suspense>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.map(company => (
                    <StrategyPanel
                      key={company.company.ticker}
                      data={company}
                      sector={company.company.sector}
                      industry={company.company.industry}
                      usdJpy={usdJpy}
                    />
                  ))}
                </div>
              </div>
            ) : (
              // 初回ロード時のプレースホルダー（データなし）
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                  <div className="h-8 w-48 rounded mb-4 bg-gray-100 dark:bg-gray-700" />
                  <div className="h-80 rounded bg-gray-100 dark:bg-gray-700" />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                  <div className="h-8 w-48 rounded mb-4 bg-gray-100 dark:bg-gray-700" />
                  <div className="h-80 rounded bg-gray-100 dark:bg-gray-700" />
                </div>
              </div>
            )}
          </Shimmer>
        )}

        {selectedTickers.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 space-y-2">
            <div className="text-5xl">📊</div>
            <p className="text-lg font-medium">上の企業ボタンをクリックして比較を開始</p>
            <p className="text-sm">複数の企業を選択して決算データを比較できます</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
