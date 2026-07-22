# Studio (`@t42/studio`)

T42 monorepo 內建的**開發者工作台**（Next.js，port 3000）。可選部署，也是工程慣例的**參考實作**。

通用設定步驟見 [getting-started](../../docs/getting-started.md)。

## Scripts

| 指令 | 說明 |
|------|------|
| `pnpm --filter @t42/studio dev` | 開發伺服器（Turbopack） |
| `pnpm --filter @t42/studio build` | Production build |
| `pnpm --filter @t42/studio test` | Vitest |
| `pnpm --filter @t42/studio typecheck` | `tsc --noEmit` |
| `pnpm studio:db:migrate` | Studio migration（journal：`drizzle.__studio_migrations`） |
| `pnpm studio:db:generate` | 依 `src/db/schema` 產生 migration |

根目錄 `pnpm db:migrate` 只跑**平台** migration（`packages/db`）；預設載入 `apps/studio/.env`。

## 目錄結構

```
src/
  app/                 頁面與 Route Handlers
  components/          UI（含 task-board/）
  db/
    client.ts          Drizzle（平台 auth + studio schema）
    schema/            studio.task
  drizzle/             Studio migrations
  schemas/             Studio Zod（task API；不在 @t42/validators）
  hooks/               React Query
  lib/                 tasks service、api-route、task-board helpers
```

## 主要路由

| 路徑 | 說明 |
|------|------|
| `/` | 登入 |
| `/board` | Task Board（Kanban） |
| `/guide` | Developer Guide |
| `/api/health` | Health check |
| `/api/tasks` | Task CRUD / 列表 |

## 與平台 packages 的邊界

- **平台**（每個 fork 預設）：`@t42/auth`、`@t42/db`（auth + `user_profile`）、`@t42/validators`（auth、health）
- **Studio 專屬**（可刪除 app 即移除）：`studio` schema、`src/schemas/task.ts`、本目錄 `drizzle/`

詳見 [architecture](../../docs/architecture.md#platform-boundary)。

## 部署

Vercel + Neon（獨立 `DATABASE_URL`）。首次部署需 `pnpm db:migrate` 與 `pnpm studio:db:migrate`。見 [deployment](../../docs/deployment.md)。
