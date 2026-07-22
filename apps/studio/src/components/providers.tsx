'use client'

import { initClientReporting } from '@t42/observability/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000
          }
        }
      })
  )

  useEffect(() => {
    initClientReporting({
      service: process.env.NEXT_PUBLIC_LOG_APP_NAME ?? 'studio'
    })
  }, [])

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
