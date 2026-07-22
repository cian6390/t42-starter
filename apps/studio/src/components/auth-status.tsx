'use client'

import { Button } from '@t42/ui/components/button'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export function AuthStatus() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <span className="text-sm text-muted-foreground" aria-live="polite">
        …
      </span>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-sm text-muted-foreground sm:inline">
        {session.user.email ?? session.user.name}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={async () => {
          await authClient.signOut()
          router.push('/')
          router.refresh()
        }}
      >
        Sign out
      </Button>
    </div>
  )
}
