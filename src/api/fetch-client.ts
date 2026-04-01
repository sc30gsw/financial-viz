import { up } from 'up-fetch'

export const upfetch = up(fetch, () => ({
  baseUrl: (import.meta as { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL ?? 'http://localhost:3001/api',
}))
