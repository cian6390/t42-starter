'use client'

import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { authClient } from '@/lib/auth-client'

export function RequireAuth({ children }: { children: ReactNode }): ReactNode {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()

  useEffect(() => {
    if (!isPending && !session) {
      router.replace('/')
    }
  }, [isPending, session, router])

  if (isPending) {
    return (
      <main className="mx-auto min-h-screen max-w-6xl px-6 py-12 text-sm text-muted-foreground">
        Loading…
      </main>
    )
  }

  if (!session) {
    return null
  }

  return children
}
