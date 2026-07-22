import { defineConfig } from 'drizzle-kit'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL is not set. Run `pnpm studio:db:migrate` from the repo root — it loads apps/studio/.env — or export DATABASE_URL first.'
  )
}

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl
  },
  migrations: {
    schema: 'drizzle',
    table: '__studio_migrations'
  }
})
