import type { CompanyFinancials } from '../types/financial'
import { formatValue } from '../utils/format'

interface StrategyPanelProps {
  data: CompanyFinancials
  businessSummary?: string
  sector?: string
  industry?: string
  usdJpy?: number
}

function margin(part: number, total: number): string {
  if (total === 0) return '—'
  return `${((part / total) * 100).toFixed(1)}%`
}

export default function StrategyPanel({ data, businessSummary, sector, industry, usdJpy }: StrategyPanelProps) {
  const latest = data.annualData[0]
  const isUSD = latest?.currency === 'USD'
  const converted = isUSD && usdJpy != null
  const fmt = (v: number) => formatValue(converted ? v * usdJpy! : v, converted ? 'JPY' : (latest?.currency ?? 'USD'))

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">
        {data.company.name}
      </h3>
      <div className="flex gap-2 mb-3 flex-wrap">
        <span className="text-xs px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
          {data.company.exchange}
        </span>
        <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
          {data.company.ticker}
        </span>
        {sector && (
          <span className="text-xs px-2 py-0.5 rounded bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
            {sector}
          </span>
        )}
        {industry && (
          <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
            {industry}
          </span>
        )}
      </div>

      {businessSummary && (
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3 mb-3">
          {businessSummary}
        </p>
      )}

      {latest && (
        <div className="mt-2 pt-3 border-t border-gray-100 dark:border-gray-700 space-y-1.5">
          <p className="text-xs text-gray-400 mb-2">
            {latest.year}年度 実績
            {converted && <span className="ml-1 text-blue-400">USD→円換算済</span>}
          </p>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">売上高</span>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{fmt(latest.revenue)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              営業利益
              <span className="ml-1 text-gray-400">({margin(latest.operatingIncome, latest.revenue)})</span>
            </span>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{fmt(latest.operatingIncome)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              純利益
              <span className="ml-1 text-gray-400">({margin(latest.netIncome, latest.revenue)})</span>
            </span>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{fmt(latest.netIncome)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
