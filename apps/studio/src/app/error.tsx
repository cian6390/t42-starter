'use client'

import { reportClientError } from '@t42/observability/client'
import { useEffect } from 'react'

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    reportClientError(error, {
      boundary: 'app/error',
      digest: error.digest
    })
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-md border px-4 py-2 text-sm"
      >
        Try again
      </button>
    </div>
  )
}
