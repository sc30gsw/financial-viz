import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { CompanyFinancials } from '../types/financial'
import { buildTrendChartData, type TrendDisplayMode } from '../utils/trend-data'
import { formatValueShort } from '../utils/format'

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6']

interface TrendChartProps {
  companies: CompanyFinancials[]
  metric?: 'revenue' | 'operatingIncome' | 'netIncome'
  usdJpy?: number
}

function sanitizeKey(ticker: string): string {
  return ticker.replace(/\./g, '_')
}

function formatGrowthRate(value: number): string {
  return (value >= 0 ? '+' : '') + value.toFixed(1) + '%'
}

function TrendTooltip({
  active,
  payload,
  label,
  hasMixed,
  usdJpy,
  mode,
}: {
  active?: boolean
  payload?: Array<any>
  label?: string
  hasMixed: boolean
  usdJpy: number | undefined
  mode: TrendDisplayMode
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg min-w-44">
      <p className="font-semibold text-gray-700 dark:text-gray-200 mb-2 text-sm">{label}年</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey as string} className="flex items-center gap-2 text-sm py-0.5">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-500 dark:text-gray-400 truncate">{entry.name}</span>
          <span className="font-semibold text-gray-800 dark:text-gray-100 ml-auto pl-2 whitespace-nowrap">
            {mode === 'yoyGrowth'
              ? formatGrowthRate(entry.value ?? 0)
              : formatValueShort(entry.value ?? 0, 'JPY')}
          </span>
        </div>
      ))}
      {hasMixed && usdJpy != null && mode === 'absolute' && (
        <p className="text-xs text-gray-400 mt-2 border-t border-gray-100 dark:border-gray-700 pt-1.5">
          ※ USD→JPY換算 (1$={Math.round(usdJpy)}円)
        </p>
      )}
    </div>
  )
}

export default function TrendChart({ companies, metric = 'revenue', usdJpy }: TrendChartProps) {
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [mode, setMode] = useState<TrendDisplayMode>('absolute')

  const hasMixed =
    companies.some(c => c.annualData.some(d => d.currency === 'USD')) &&
    companies.some(c => c.annualData.some(d => d.currency === 'JPY'))

  const { data, excludedCompanies } = buildTrendChartData(companies, metric, usdJpy, mode)

  return (
    <div>
      <div className="flex gap-2 mb-3">
        {(['absolute', 'yoyGrowth'] as TrendDisplayMode[]).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              mode === m
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {m === 'absolute' ? '絶対値' : '前年比%'}
          </button>
        ))}
      </div>

      {hasMixed && usdJpy != null && mode === 'absolute' && (
        <p className="text-xs text-amber-600 dark:text-amber-400 mb-2">
          ※ USD→JPY換算 (1$={Math.round(usdJpy)}円) で統一表示
        </p>
      )}

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} onMouseLeave={() => setActiveKey(null)}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="year" tick={{ fontSize: 12 }} />
          <YAxis
            tickFormatter={v => mode === 'yoyGrowth' ? formatGrowthRate(v) : formatValueShort(v, 'JPY')}
            tick={{ fontSize: 11 }}
            width={80}
          />
          <Tooltip
            content={<TrendTooltip hasMixed={hasMixed} usdJpy={usdJpy} mode={mode} />}
          />
          <Legend />
          {companies.map((company, idx) => {
            const key = sanitizeKey(company.company.ticker)
            const color = COLORS[idx % COLORS.length]
            const isActive = activeKey === key
            const opacity = activeKey === null ? 1 : isActive ? 1 : 0.3
            return (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={company.company.name}
                stroke={color}
                opacity={opacity}
                dot={{ r: 4, strokeWidth: 2, fill: color, stroke: color }}
                activeDot={{ r: 6, strokeWidth: 0, fill: color }}
                connectNulls={false}
                onMouseEnter={() => setActiveKey(key)}
              />
            )
          })}
        </LineChart>
      </ResponsiveContainer>

      {excludedCompanies.length > 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          ※ データ不足のため除外: {excludedCompanies.join(', ')}
        </p>
      )}
    </div>
  )
}
