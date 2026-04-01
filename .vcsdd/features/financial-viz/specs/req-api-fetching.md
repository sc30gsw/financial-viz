---
coherence:
  node_id: "req:api-fetching"
  type: requirement
  name: "API Fetching Requirements"
  depends_on:
    - id: "design:data-schema"
      relation: derives_from
    - id: "design:system-arch"
      relation: derives_from
  depended_by:
    - id: "design:fetch-layer"
    - id: "module:data-loader"
---

# API Fetching Requirements (Sprint 5)

## REQ-AF-001: モックデータの廃止

- `App.tsx` 内の `DEMO_DATA` ハードコードを完全に削除する
- データはすべてバックエンドAPIを通じてフェッチする
- `useFinancialData` フックは `useFinancialQuery` に置き換える

## REQ-AF-002: TanStack Query の導入

- `@tanstack/react-query` を依存として追加する
- `QueryClientProvider` をアプリのルートに配置する
- `useQuery` でフィナンシャルデータをフェッチする

## REQ-AF-003: up-fetch クライアントの導入

- `up-fetch` を HTTP クライアントとして使用する
- ベース URL は環境変数 `VITE_API_BASE_URL` から取得する（デフォルト: `http://localhost:3001/api`）
- レスポンスは自動で JSON パースする

## REQ-AF-004: バックエンド API サーバー

- `server/index.ts` に Express サーバーを作成する
- `GET /api/financials/:ticker` → `CompanyFinancials` を返す
- `GET /api/quote/:ticker` → `StockQuote` を返す
- 実装は既存の `src/api/yahoo-finance.ts` のロジックを再利用する

## REQ-AF-005: キャッシュ戦略（**Sprint 5 中間変更**）

- APIレスポンスは **5分間** キャッシュする（staleTime: 300,000ms）
- stale-while-revalidate 戦略を採用する
- キャッシュが陳腐化した場合、古いデータを表示しつつバックグラウンドで再フェッチする
- `CompanyFinancials` 型に `fetchedAt: string`（ISO8601）フィールドを追加する

## REQ-AF-006: エラーリカバリ（**Sprint 5 中間変更**）

- リクエスト失敗時は **最大3回** リトライする
- 最後に成功したデータはエラー後も表示し続ける（`placeholderData: keepPreviousData`）
- ネットワークエラーとサーバーエラー（4xx/5xx）を区別してメッセージを表示する
- `CompanyFinancials` 型に `isStale: boolean` フィールドを追加する

## 受け入れ基準

- [ ] アプリ起動時に DEMO_DATA を使わない
- [ ] ティッカー選択時に API からデータを取得する
- [ ] ローディング状態を表示する
- [ ] エラー時にエラーメッセージを表示する
- [ ] 5分間はキャッシュを使用し、不要なリフェッチをしない
- [ ] エラー後も最後の成功データを表示する
- [ ] fetchedAt と isStale フィールドが CompanyFinancials に存在する
