import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema/index'

type Database = ReturnType<typeof drizzle<typeof schema>>

let instance: Database | undefined

function createDb(): Database {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set')
  }

  const client = postgres(connectionString, { max: 10 })
  return drizzle(client, { schema })
}

export function getDb(): Database {
  instance ??= createDb()
  return instance
}

export const db = new Proxy({} as Database, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver)
  }
})

export type { Database }
