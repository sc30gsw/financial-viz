export function formatValue(value: number, currency: 'JPY' | 'USD'): string {
  if (currency === 'JPY') {
    if (value >= 1_000_000_000_000) {
      return `${(value / 1_000_000_000_000).toFixed(1)}兆円`
    }
    return `${Math.round(value / 100_000_000).toLocaleString()}億円`
  }
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`
  }
  return `$${(value / 1_000_000).toFixed(0)}M`
}

export function formatValueShort(value: number, currency: 'JPY' | 'USD'): string {
  if (currency === 'JPY') {
    if (value >= 1_000_000_000_000) {
      return `${(value / 1_000_000_000_000).toFixed(1)}兆`
    }
    return `${Math.round(value / 100_000_000).toLocaleString()}億`
  }
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(0)}B`
  }
  return `$${(value / 1_000_000).toFixed(0)}M`
}

/** 通貨混在時のY軸用: 桁数だけ圧縮して単位を付ける */
export function formatScaleOnly(value: number): string {
  if (value === 0) return '0'
  if (value >= 1_000_000_000_000) return `${(value / 1_000_000_000_000).toFixed(0)}T`
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(0)}G`
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}M`
  return value.toLocaleString()
}
