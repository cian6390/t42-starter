import { createWebAuthClient } from '@t42/auth/client'

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export const authClient = createWebAuthClient(appUrl)
