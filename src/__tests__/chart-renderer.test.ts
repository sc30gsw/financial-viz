import { describe, it, expect } from 'vitest'
import { formatValue } from '../utils/format'
import { formatYoYGrowth } from '../components/RevenueChart'

describe('formatValue', () => {
  it('formats large JPY in 兆円', () => {
    expect(formatValue(30_000_000_000_000, 'JPY')).toBe('30.0兆円')
  })

  it('formats JPY in 億円', () => {
    expect(formatValue(100_000_000_000, 'JPY')).toBe('1,000億円')
  })

  it('formats USD in billions', () => {
    expect(formatValue(365_000_000_000, 'USD')).toBe('$365.0B')
  })

  it('handles zero JPY', () => {
    expect(formatValue(0, 'JPY')).toBe('0億円')
  })

  it('formats small USD in millions', () => {
    expect(formatValue(500_000_000, 'USD')).toBe('$500M')
  })
})

describe('formatYoYGrowth', () => {
  it('returns positive growth percentage', () => {
    expect(formatYoYGrowth(110, 100)).toBe('+10.0%')
  })

  it('returns negative growth percentage', () => {
    expect(formatYoYGrowth(90, 100)).toBe('-10.0%')
  })

  it('returns 0.0% when unchanged', () => {
    expect(formatYoYGrowth(100, 100)).toBe('+0.0%')
  })

  it('returns N/A when previous is 0', () => {
    expect(formatYoYGrowth(100, 0)).toBe('N/A')
  })
})
