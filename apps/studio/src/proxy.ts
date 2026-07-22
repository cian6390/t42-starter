/**
 * Next.js Proxy — request boundary (Next.js 16+)
 *
 * ## 這是什麼？
 *
 * `proxy.ts` 是 Next.js 16 引入的**檔案慣例**，用來在請求進入 Route Handler / Page 之前
 * 執行伺服器端邏輯（redirect、rewrite、改 header、直接回應等）。
 *
 * ## 與舊版 `middleware.ts` 的關係
 *
 * - Next.js 15 及更早：使用根目錄或 `src/` 下的 `middleware.ts`，export `middleware()`。
 * - Next.js 16 起：`middleware.ts` **已棄用**，改名為 `proxy.ts`，export `proxy()`。
 * - 官方遷移：`mv middleware.ts proxy.ts`，函式名 `middleware` → `proxy`。
 * - 若舊文件仍提到 `middleware.ts`，在 Next 16 專案應改為本檔案。
 *
 * 參考：
 * - https://nextjs.org/docs/app/api-reference/file-conventions/proxy
 * - https://nextjs.org/docs/app/guides/upgrading/version-16#middleware-to-proxy
 *
 * ## 執行環境
 *
 * - Runtime：**Node.js**（Next 16 預設；`proxy` 不支援 Edge runtime）。
 * - 若必須用 Edge，暫時可保留 `middleware.ts`（官方後續會再說明遷移路徑）。
 *
 * ## 適合放在這裡的邏輯
 *
 * - 依 path / cookie / header 做 redirect 或 rewrite
 * - 設定安全或 CORS 相關的 request/response headers
 * - Rate limiting、geo、A/B 路由等「進入 app 前」的閘道行為
 *
 * ## 不適合放在這裡的邏輯
 *
 * - 業務規則、資料庫查詢 → `route.ts` / Server Actions / `@t42/*` packages
 * - 頁面 UI → `app/…/page.tsx`（各 segment 下的 page）
 * - Better Auth 的 sign-in / session API → 已由 `app/api/auth/[...all]/route.ts` 處理
 *
 * ## 檔案位置
 *
 * 必須與 `app/` 同層：`apps/studio/src/proxy.ts`（本專案使用 `src/` 目錄）。
 * 每個 Next app 只能有一個 `proxy.ts`；複雜邏輯請拆到 `src/lib/proxy/` 再 import。
 *
 * ## 目前狀態
 *
 * 注入 `x-request-id` 與 log context；未登入造訪 `/board`、`/guide` 時 server redirect 至 `/`；
 * 已登入造訪 `/` 時 redirect 至 `/board`。Client 端仍保留 `RequireAuth` / `HomePage` 作為備援。
 */

import { auth } from '@t42/auth'
import { withLogContext } from '@t42/observability/server'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const PROTECTED_PAGE_PREFIXES = ['/board', '/guide']

export async function proxy(request: NextRequest) {
  const requestId = crypto.randomUUID()

  return withLogContext(
    {
      requestId,
      path: request.nextUrl.pathname,
      method: request.method
    },
    async () => {
      const { pathname } = request.nextUrl
      const session = await auth.api.getSession({ headers: request.headers })

      if (
        PROTECTED_PAGE_PREFIXES.some(
          (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
        ) &&
        !session
      ) {
        return NextResponse.redirect(new URL('/', request.url))
      }

      if (pathname === '/' && session) {
        return NextResponse.redirect(new URL('/board', request.url))
      }

      const response = NextResponse.next()
      response.headers.set('x-request-id', requestId)
      return response
    }
  )
}

export const config = {
  matcher: [
    /*
     * 略過 Next 靜態資源與常見圖片，其餘路徑都會經過 proxy。
     * 調整 matcher 時請對照官方文件，避免攔到 `_next/static` 等內部路徑。
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
}
