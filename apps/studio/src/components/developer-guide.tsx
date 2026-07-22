'use client'

import Link from 'next/link'
import { AppChrome } from '@/components/app-chrome'

const DAILY_COMMANDS = [
  { cmd: 'pnpm dev', desc: '啟動 studio 與有 dev script 的 packages' },
  { cmd: 'pnpm verify', desc: 'lint + typecheck + build + test' },
  { cmd: 'pnpm typecheck', desc: '全 monorepo 型別檢查' },
  { cmd: 'pnpm db:studio', desc: '開啟 Drizzle Studio' }
] as const

export function DeveloperGuide() {
  return (
    <>
      <AppChrome />
      <main className="mx-auto min-h-screen max-w-4xl px-6 py-12 sm:px-8">
        <section className="space-y-4">
          <h1 className="text-2xl font-bold">Developer guide</h1>
          <p className="text-muted-foreground">
            T42 monorepo 的架構、開發模式與日常指令。
          </p>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="text-xl font-semibold">Task Board</h2>
          <p className="text-muted-foreground">
            Studio 內建簡易看板，供團隊追蹤工作項；不需第三方 PM 帳號。
          </p>
          <div className="rounded-lg border border-border p-5">
            <Link href="/board" className="font-medium underline">
              Open Task Board
            </Link>
          </div>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="text-xl font-semibold">Daily commands</h2>
          <p className="text-muted-foreground">
            在 repo 根目錄執行。環境變數放在{' '}
            <code className="font-mono text-sm">apps/studio/.env</code>
            （per-app）。
          </p>
          <ul className="divide-y divide-border rounded-lg border border-border">
            {DAILY_COMMANDS.map((item) => (
              <li
                key={item.cmd}
                className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <code className="font-mono text-sm">{item.cmd}</code>
                <span className="text-sm text-muted-foreground">
                  {item.desc}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="text-xl font-semibold">Repository layout</h2>
          <pre className="overflow-x-auto rounded-lg border border-border bg-muted/30 p-5 font-mono text-sm leading-relaxed text-muted-foreground">
            {`apps/          Deployable applications (studio is the default)
packages/      Shared db, auth, validators, ui, …
docs/          Architecture, deployment, and conventions`}
          </pre>
        </section>

        <footer className="mt-12 border-t border-border pt-8">
          <p className="text-sm text-muted-foreground">
            更多細節見 <code className="font-mono">README.md</code> 與{' '}
            <code className="font-mono">docs/getting-started.md</code>。
          </p>
        </footer>
      </main>
    </>
  )
}
