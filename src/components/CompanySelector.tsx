interface Company {
  ticker: string
  label: string
}

const PRESET_COMPANIES = [
  { ticker: '7203.T', label: 'トヨタ自動車 (7203.T)' },
  { ticker: '9984.T', label: 'ソフトバンクG (9984.T)' },
  { ticker: '6758.T', label: 'ソニーグループ (6758.T)' },
  { ticker: 'AAPL', label: 'Apple (AAPL)' },
  { ticker: 'MSFT', label: 'Microsoft (MSFT)' },
  { ticker: 'GOOGL', label: 'Alphabet (GOOGL)' },
] as const satisfies readonly Company[]

interface CompanySelectorProps {
  selected: string[]
  onChange: (tickers: string[]) => void
}

export default function CompanySelector({ selected, onChange }: CompanySelectorProps) {
  const toggle = (ticker: string) => {
    if (selected.includes(ticker)) {
      onChange(selected.filter(t => t !== ticker))
    } else {
      onChange([...selected, ticker])
    }
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
        企業を選択
      </h2>
      <div className="flex flex-wrap gap-2">
        {PRESET_COMPANIES.map(c => (
          <button
            key={c.ticker}
            onClick={() => toggle(c.ticker)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selected.includes(c.ticker)
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  )
}
