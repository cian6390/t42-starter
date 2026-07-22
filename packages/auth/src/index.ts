import { getDb } from '@t42/db'
import {
  account,
  session,
  user,
  userProfile,
  verification
} from '@t42/db/schema'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { bearer } from 'better-auth/plugins'

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} is not set`)
  }
  return value
}

function createAuth() {
  const socialProviders: NonNullable<
    Parameters<typeof betterAuth>[0]['socialProviders']
  > = {}

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    socialProviders.google = {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }
  }

  if (process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET) {
    socialProviders.apple = {
      clientId: process.env.APPLE_CLIENT_ID,
      clientSecret: process.env.APPLE_CLIENT_SECRET
    }
  }

  const db = getDb()

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: {
        user,
        session,
        account,
        verification
      }
    }),
    databaseHooks: {
      user: {
        create: {
          after: async (createdUser) => {
            await db.insert(userProfile).values({ userId: createdUser.id })
          }
        }
      }
    },
    secret: requireEnv('BETTER_AUTH_SECRET'),
    baseURL: requireEnv('BETTER_AUTH_URL'),
    trustedOrigins: [
      process.env.CORS_ORIGIN ?? 'http://localhost:3000',
      'exp://localhost:8081'
    ],
    emailAndPassword: {
      enabled: true
    },
    socialProviders,
    plugins: [bearer()]
  })
}

type Auth = ReturnType<typeof createAuth>

let instance: Auth | undefined

export function getAuth(): Auth {
  instance ??= createAuth()
  return instance
}

export const auth = new Proxy({} as Auth, {
  get(_target, prop, receiver) {
    return Reflect.get(getAuth(), prop, receiver)
  }
})

export type { Auth }
export type Session = Auth['$Infer']['Session']
