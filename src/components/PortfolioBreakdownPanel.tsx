import type { StockQuote } from '../types/financial'
import {
  buildPortfolioPnlSummary,
  formatJpyAmount,
  formatNativePrice,
  formatSignedPercent,
  type PortfolioHoldingInput,
} from '../utils/portfolio-pnl'

interface PortfolioBreakdownPanelProps {
  selectedTickers: string[]
  holdings: Record<string, PortfolioHoldingInput>
  quotes: Record<string, StockQuote>
  usdJpy?: number
  isLoading?: boolean
  error?: Error | null
  onHoldingChange: (
    ticker: string,
    field: keyof PortfolioHoldingInput,
    value: number | null,
  ) => void
}

function parseInputValue(value: string): number | null {
  if (value.trim() === '') {
    return null
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function statusLabel(status: ReturnType<typeof buildPortfolioPnlSummary>['positions'][number]['status']): string {
  switch (status) {
    case 'ready':
      return '計算済み'
    case 'pending-rate':
      return 'JPY換算待ち'
    case 'missing-quote':
      return '価格取得中'
    case 'missing-input':
    default:
      return '入力待ち'
  }
}

export default function PortfolioBreakdownPanel({
  selectedTickers,
  holdings,
  quotes,
  usdJpy,
  isLoading = false,
  error = null,
  onHoldingChange,
}: PortfolioBreakdownPanelProps) {
  if (selectedTickers.length === 0) {
    return null
  }

  const summary = buildPortfolioPnlSummary(selectedTickers, holdings, quotes, usdJpy)

  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Portfolio PnL Breakdown
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            取得単価は各銘柄の現地通貨建て、1株あたりで入力します。
          </p>
        </div>
        {isLoading && (
          <div className="text-xs font-medium text-indigo-600 dark:text-indigo-300">
            価格を取得中...
          </div>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
        >
          価格取得エラー: {error.message}
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[2fr,1fr]">
        <div className="grid gap-3">
          {summary.positions.map(position => (
            <article
              key={position.ticker}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/40 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">{position.ticker}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    現在値:{' '}
                    {position.quote
                      ? formatNativePrice(position.quote.price, position.quote.currency)
                      : '取得中...'}
                  </p>
                </div>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  {statusLabel(position.status)}
                </span>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <label className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="mb-1 block">保有数量</span>
                  <input
                    aria-label={`${position.ticker} 保有数量`}
                    type="number"
                    min="0"
                    step="1"
                    value={position.shares ?? ''}
                    onChange={(event) => onHoldingChange(position.ticker, 'shares', parseInputValue(event.target.value))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  />
                </label>

                <label className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="mb-1 block">取得単価</span>
                  <input
                    aria-label={`${position.ticker} 取得単価`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={position.costBasis ?? ''}
                    onChange={(event) => onHoldingChange(position.ticker, 'costBasis', parseInputValue(event.target.value))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  />
                </label>
              </div>

              <dl className="mt-4 grid gap-3 sm:grid-cols-3">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">評価額</dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {position.marketValueJpy != null ? formatJpyAmount(position.marketValueJpy) : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">取得額</dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {position.costValueJpy != null ? formatJpyAmount(position.costValueJpy) : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">評価損益</dt>
                  <dd
                    className={`mt-1 text-sm font-semibold ${
                      (position.pnlJpy ?? 0) >= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {position.pnlJpy != null
                      ? `${formatJpyAmount(position.pnlJpy)} (${formatSignedPercent(position.pnlPct)})`
                      : '—'}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>

        <aside className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4 space-y-3">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100">集計</h4>

          {summary.readyCount === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              保有数量と取得単価を入力すると評価損益を計算します。
            </p>
          ) : (
            <dl className="space-y-3">
              <div>
                <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">合計評価額</dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {formatJpyAmount(summary.totalMarketValueJpy)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">合計取得額</dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {formatJpyAmount(summary.totalCostValueJpy)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">合計評価損益</dt>
                <dd
                  className={`mt-1 text-lg font-semibold ${
                    summary.totalPnlJpy >= 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {formatJpyAmount(summary.totalPnlJpy)}
                </dd>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  損益率 {formatSignedPercent(summary.totalPnlPct)}
                </p>
              </div>
            </dl>
          )}

          {summary.hasUsdPositions && isFinite(usdJpy ?? Number.NaN) && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              USD 建て価格は 1 USD = ¥{Math.round(usdJpy ?? 0).toLocaleString('en-US')} で JPY 換算しています。
            </p>
          )}

          {summary.hasPendingRate && !usdJpy && (
            <p className="text-xs text-amber-700 dark:text-amber-300">
              USD/JPY を取得できないため、USD ポジションは JPY換算待ちです。
            </p>
          )}
        </aside>
      </div>
    </section>
  )
}
