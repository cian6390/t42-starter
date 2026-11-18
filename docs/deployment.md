# Deployment

Each app under `apps/` deploys on its own. Platform migrations live in `packages/db` and run against that environment's `DATABASE_URL`.

## Prerequisites

- A host for the app
- Postgres with a connection string
- Environment variables configured for that environment

## Required environment variables

Platform packages expect:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Postgres connection string |
| `BETTER_AUTH_SECRET` | Auth secret (`openssl rand -base64 32`) |
| `BETTER_AUTH_URL` | Public URL of the app |

See `.env.example` for the local platform set. App-specific variables belong in that app's environment.

## Migrations

Run platform migrations against the target database before the app serves traffic:

```bash
# Point DATABASE_URL at the target database, then from the repo root:
pnpm db:migrate
```

Set `T42_ENV_APP` when the connection string lives in `apps/<app>/.env` instead of the root `.env`.

- **Platform migrations** (`packages/db`) — auth and shared tables. Run on every new environment.
- **App migrations** — live with the app that owns them. Run when that app's schema changes.

Keep migration journals in version control. Do not edit applied migration files.

Database connections in `@t42/db` are initialized lazily at runtime, so package builds do not require a live database.
