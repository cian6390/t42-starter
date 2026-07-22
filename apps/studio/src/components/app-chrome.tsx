'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AuthStatus } from '@/components/auth-status'

export function AppChrome() {
  const pathname = usePathname()

  const linkClass = (href: string) =>
    pathname === href
      ? 'font-medium text-foreground'
      : 'text-muted-foreground hover:text-foreground'

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-6">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Studio
          </p>
          <nav className="flex gap-4 text-sm">
            <Link href="/guide" className={linkClass('/guide')}>
              Guide
            </Link>
            <Link href="/board" className={linkClass('/board')}>
              Board
            </Link>
          </nav>
        </div>
        <AuthStatus />
      </div>
    </header>
  )
}
