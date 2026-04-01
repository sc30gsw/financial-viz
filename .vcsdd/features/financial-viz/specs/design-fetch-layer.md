---
coherence:
  node_id: "design:fetch-layer"
  type: design
  name: "Fetch Layer Design"
  depends_on:
    - id: "req:api-fetching"
      relation: derives_from
    - id: "design:data-schema"
      relation: derives_from
    - id: "design:system-arch"
      relation: derives_from
  depended_by:
    - id: "module:data-loader"
---

# Fetch Layer Design (Sprint 5)

## Architecture

```
Browser
  └─ React App (Vite)
       ├─ QueryProvider (QueryClient)
       │    └─ useFinancialQuery (TanStack Query)
       │         └─ upfetch (up-fetch client)
       │              └─ HTTP → localhost:3001/api
       └─ Components

Server (Node.js)
  └─ Express (server/index.ts)
       ├─ GET /api/financials/:ticker
       │    └─ yahoo-finance.ts → yahoo-finance2
       └─ GET /api/quote/:ticker
            └─ yahoo-finance.ts → yahoo-finance2
```

## up-fetch クライアント (`src/api/fetch-client.ts`)

```typescript
import { up } from 'up-fetch'

export const upfetch = up(fetch, () => ({
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api',
}))
```

## TanStack Query フック (`src/hooks/useFinancialQuery.ts`)

```typescript
export function useFinancialQuery(tickers: string[]) {
  return useQueries({
    queries: tickers.map(ticker => ({
      queryKey: ['financials', ticker],
      queryFn: () => upfetch(`/financials/${ticker}`),
      staleTime: 5 * 60 * 1000, // 5分
    })),
    combine: results => ({
      data: results.flatMap(r => r.data ? [r.data] : []),
      isLoading: results.some(r => r.isLoading),
      error: results.find(r => r.error)?.error ?? null,
    }),
  })
}
```

## QueryProvider (`src/providers/QueryProvider.tsx`)

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 3, staleTime: 5 * 60 * 1000 },
  },
})
```

## レイヤー変更点

| 旧 | 新 |
|----|----|
| `App.tsx` の DEMO_DATA | バックエンド API |
| `useFinancialData` (useState+useEffect) | `useFinancialQuery` (TanStack Query) |
| yahoo-finance2 直呼び出し（Node.js専用） | Express サーバー経由 |
| 単純な fetch/Promise | up-fetch クライアント |

## Purity Boundaries

- `src/api/fetch-client.ts`: up-fetch インスタンス設定（副作用なし）
- `src/hooks/useFinancialQuery.ts`: TanStack Query フック
- `server/index.ts`: Express ルート（副作用: ネットワーク、yahoo-finance2）
