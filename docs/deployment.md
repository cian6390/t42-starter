# Deployment

Studio deploys to **Vercel** with a **Neon** Postgres database.

## Prerequisites

- Vercel project linked to `apps/studio`
- Neon project with a connection string
- Environment variables configured in Vercel

## Required environment variables

Set these in the Vercel project (or via `apps/studio/.env` for local production builds):

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon Postgres connection string |
| `BETTER_AUTH_SECRET` | Auth secret (`openssl rand -base64 32`) |
| `BETTER_AUTH_URL` | Production URL (e.g. `https://your-app.vercel.app`) |
| `NEXT_PUBLIC_APP_URL` | Same as `BETTER_AUTH_URL` for client-side links |

Optional: OAuth provider keys, Resend email keys, observability settings (see `apps/studio/.env.example`).

## First deploy

1. Create a Neon database and copy `DATABASE_URL`.
2. Configure environment variables in Vercel.
3. Run migrations against the production database:

```bash
# Point DATABASE_URL to Neon, then from repo root:
pnpm db:migrate
pnpm studio:db:migrate
```

4. Deploy Studio:

```bash
pnpm --filter @t42/studio build
```

Or push to the branch connected to Vercel for automatic deploys.

## Migration strategy

- **Platform migrations** (`packages/db`) — auth and shared tables. Run on every new environment.
- **Studio migrations** (`apps/studio`) — app-specific tables. Run when Studio schema changes.

Keep migration journals in version control. Do not edit applied migration files.

## Local production build

```bash
cp apps/studio/.env.example apps/studio/.env
# fill in values
pnpm --filter @t42/studio build
pnpm --filter @t42/studio start
```

Database connections are initialized lazily at runtime, so builds do not require a live database.
