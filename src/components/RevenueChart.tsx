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
import { formatValue, formatValueShort } from '../utils/format'

export function formatYoYGrowth(current: number, previous: number): string {
  if (previous === 0) return 'N/A'
  const growth = ((current - previous) / Math.abs(previous)) * 100
  const sign = growth >= 0 ? '+' : ''
  return `${sign}${growth.toFixed(1)}%`
}

interface RevenueChartProps {
  data: CompanyFinancials
  metric?: 'revenue' | 'operatingIncome' | 'netIncome'
}

const METRIC_LABELS = {
  revenue: '売上高',
  operatingIncome: '営業利益',
  netIncome: '純利益',
}

export default function RevenueChart({ data, metric = 'revenue' }: RevenueChartProps) {
  const currency = data.annualData[0]?.currency ?? 'USD'

  const chartData = [...data.annualData]
    .sort((a, b) => a.year - b.year)
    .map(d => ({
      year: d.year,
      value: d[metric],
    }))

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        No data available
      </div>
    )
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">
        {data.company.name} — {METRIC_LABELS[metric]}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis dataKey="year" tickFormatter={v => `${v}年`} />
          <YAxis
            tickFormatter={v => formatValueShort(v, currency)}
            width={72}
          />
          <Tooltip
            formatter={(value: number) => [formatValue(value, currency), METRIC_LABELS[metric]]}
            labelFormatter={label => `${label}年`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            name={METRIC_LABELS[metric]}
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ fill: '#6366f1', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
