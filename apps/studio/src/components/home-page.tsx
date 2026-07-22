'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { AuthForms } from '@/components/auth-forms'
import { authClient } from '@/lib/auth-client'

export function HomePage() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()

  useEffect(() => {
    if (!isPending && session) {
      router.replace('/board')
    }
  }, [isPending, session, router])

  if (isPending) {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6 py-12 text-sm text-muted-foreground">
        Loading…
      </main>
    )
  }

  if (session) {
    return null
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-12 sm:px-8">
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Studio
      </p>

      <header className="mt-6 space-y-4 border-b border-border pb-10">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Welcome
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
          <strong className="font-semibold text-foreground">T42</strong>
          &nbsp;is a TypeScript-first monorepo starter with auth, database,
          shared UI, and a reference Studio app to help you build maintainable
          full-stack products.
        </p>
        <p className="text-sm text-muted-foreground">
          Sign in to open your task board and developer guide.
        </p>
      </header>

      <section className="mt-10 max-w-sm">
        <AuthForms />
      </section>

      <p className="mt-8 text-sm text-muted-foreground">
        Already signed in elsewhere?{' '}
        <Link href="/board" className="underline">
          Go to board
        </Link>
      </p>
    </main>
  )
}
