/**
 * fetch-client tests — Green Phase (Sprint 5)
 * Tests for up-fetch based HTTP client configuration
 * Note: URL construction is covered by use-financial-query integration tests
 */
import { describe, it, expect, vi, afterEach } from 'vitest'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe('fetch-client', () => {
  it('should export an upfetch function', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true, status: 200,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve({}),
      body: null,
    }))
    const { upfetch } = await import('../api/fetch-client')
    expect(upfetch).toBeDefined()
    expect(typeof upfetch).toBe('function')
  })

  it('should propagate network errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    const { upfetch } = await import('../api/fetch-client')
    await expect(upfetch('/financials/INVALID')).rejects.toThrow()
  })

  it('should invoke underlying fetch when called', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new TypeError('test-sentinel'))
    vi.stubGlobal('fetch', mockFetch)
    const { upfetch } = await import('../api/fetch-client')

    try { await upfetch('/financials/AAPL') } catch { /* expected rejection */ }

    expect(mockFetch).toHaveBeenCalled()
  })
})
