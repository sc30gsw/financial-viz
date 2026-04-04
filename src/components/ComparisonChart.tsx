import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { CompanyFinancials } from '../types/financial'
import { formatValue, formatValueShort } from '../utils/format'

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'] as const satisfies string[]

interface ComparisonChartProps {
  companies: CompanyFinancials[]
  metric?: 'revenue' | 'operatingIncome' | 'netIncome'
  usdJpy?: number
}

const METRIC_LABELS = {
  revenue: '売上高',
  operatingIncome: '営業利益',
  netIncome: '純利益',
} as const satisfies Record<string, string>

function toJpy(value: number, currency: 'JPY' | 'USD', usdJpy: number): number {
  return currency === 'USD' ? value * usdJpy : value
}

function CustomTooltip({
  active,
  payload,
  label,
  currencyMap,
  usdJpy,
}: {
  active?: boolean
  payload?: Array<any>
  label?: string
  currencyMap: Record<string, 'JPY' | 'USD'>
  usdJpy: number | undefined
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg min-w-44">
      <p className="font-semibold text-gray-700 dark:text-gray-200 mb-2 text-sm">{label}年</p>
      {payload.map((entry: any) => {
        const key = entry.dataKey as string
        const originalCurrency = currencyMap[key] ?? 'USD'
        const isConverted = originalCurrency === 'USD' && usdJpy != null
        // entry.value is already in JPY if converted; display in JPY
        const displayValue = formatValue(entry.value ?? 0, 'JPY')
        return (
          <div key={key} className="flex items-center gap-2 text-sm py-0.5">
            <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: entry.fill }} />
            <span className="text-gray-500 dark:text-gray-400 truncate">{entry.name}</span>
            <span className="font-semibold text-gray-800 dark:text-gray-100 ml-auto pl-2 whitespace-nowrap">
              {displayValue}
              {isConverted && <span className="text-xs text-gray-400 ml-1">※</span>}
            </span>
          </div>
        )
      })}
      {usdJpy != null && Object.values(currencyMap).includes('USD') && (
        <p className="text-xs text-gray-400 mt-2 border-t border-gray-100 dark:border-gray-700 pt-1.5">
          ※ USD→JPY換算 (1$={Math.round(usdJpy)}円)
        </p>
      )}
    </div>
  )
}

export default function ComparisonChart({ companies, metric = 'revenue', usdJpy }: ComparisonChartProps) {
  if (companies.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Select at least one company to compare
      </div>
    )
  }

  // Recharts interprets '.' as nested path — sanitize ticker keys
  const safeKey = (ticker: string) => ticker.replace(/\./g, '_')

  const currencyMap: Record<string, 'JPY' | 'USD'> = Object.fromEntries(
    companies.map(c => [safeKey(c.company.ticker), c.annualData[0]?.currency ?? 'USD'])
  )

  const currencies = [...new Set(Object.values(currencyMap))]
  const hasMixed = currencies.length > 1
  const canConvert = hasMixed && usdJpy != null

  const allYears = new Set<number>()
  companies.forEach(c => c.annualData.forEach(d => allYears.add(d.year)))
  const sortedYears = [...allYears].sort()

  // Normalize all values to JPY when mixed currencies
  const chartData = sortedYears.map(year => {
    const entry: Record<string, number | string> = { year }
    companies.forEach(c => {
      const yearData = c.annualData.find(d => d.year === year)
      if (!yearData) {
        entry[safeKey(c.company.ticker)] = 0
        return
      }
      const raw = yearData[metric]
      entry[safeKey(c.company.ticker)] = canConvert
        ? toJpy(raw, yearData.currency, usdJpy!)
        : raw
    })
    return entry
  })

  const displayCurrency: 'JPY' | 'USD' = canConvert ? 'JPY' : (currencies[0] ?? 'JPY')

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">
        企業比較 — {METRIC_LABELS[metric]}
        {canConvert && (
          <span className="ml-2 text-xs font-normal text-blue-500">
            USD→円換算済 (1$={Math.round(usdJpy!)}円)
          </span>
        )}
        {hasMixed && !canConvert && (
          <span className="ml-2 text-xs font-normal text-amber-500">為替レート取得中…</span>
        )}
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis dataKey="year" tickFormatter={v => `${v}年`} />
          <YAxis
            tickFormatter={v => formatValueShort(v, displayCurrency)}
            width={72}
          />
          <Tooltip content={<CustomTooltip currencyMap={currencyMap} usdJpy={canConvert ? usdJpy : undefined} />} />
          <Legend />
          {companies.map((c, i) => (
            <Bar
              key={c.company.ticker}
              dataKey={safeKey(c.company.ticker)}
              name={c.company.name}
              fill={COLORS[i % COLORS.length]}
              radius={[3, 3, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
