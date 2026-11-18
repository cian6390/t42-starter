import { defineConfig } from 'drizzle-kit'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL is not set. Run `pnpm db:migrate` from the repo root — it loads .env, or apps/<app>/.env when T42_ENV_APP is set — or export DATABASE_URL first.'
  )
}

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl
  },
  migrations: {
    schema: 'drizzle',
    table: '__drizzle_migrations'
  }
})
