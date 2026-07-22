import * as platformSchema from '@t42/db/schema'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as studioSchema from './schema'

type StudioDatabase = ReturnType<
  typeof drizzle<typeof platformSchema & typeof studioSchema>
>

let instance: StudioDatabase | undefined

function createDb(): StudioDatabase {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set')
  }

  const client = postgres(connectionString, { max: 10 })
  return drizzle(client, {
    schema: { ...platformSchema, ...studioSchema }
  })
}

export function getDb(): StudioDatabase {
  instance ??= createDb()
  return instance
}

/** Studio app DB — platform auth + studio schema on Studio's DATABASE_URL. */
export const db = new Proxy({} as StudioDatabase, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver)
  }
})

export type { StudioDatabase }
