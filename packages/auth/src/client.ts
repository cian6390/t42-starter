import { createAuthClient } from 'better-auth/react'

export function createWebAuthClient(baseURL: string) {
  return createAuthClient({
    baseURL
  })
}

export type WebAuthClient = ReturnType<typeof createWebAuthClient>
