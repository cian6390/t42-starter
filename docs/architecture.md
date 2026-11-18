# Architecture

## Monorepo layout

```
apps/          Deployable applications
packages/      Shared libraries consumed by apps
docs/          Project documentation
scripts/       Repo-level automation
```

### Apps

Deployable applications live in `apps/`. This repo has no apps yet. Add one under `apps/<name>`, give it its own `.env`, and set `T42_ENV_APP=<name>` when `pnpm db:*` should load that file.

### Packages

| Package | Purpose |
|---------|---------|
| `@t42/auth` | better-auth configuration |
| `@t42/db` | Platform Drizzle schema and client (auth, user_profile) |
| `@t42/validators` | Shared Zod schemas (auth forms, health API) |
| `@t42/ui` | Shared UI components (shadcn-style) |
| `@t42/observability` | Structured logging (server + client) |
| `@t42/email` | Email templates (Resend) |
| `@t42/shared` | Shared TypeScript types |
| `@t42/tsconfig` | Shared TypeScript configs |

## Platform boundary

Shared platform code lives in packages and is reused by every app:

- `@t42/auth`, `@t42/db`, `@t42/validators`
- Migrations in `packages/db/drizzle/`

App-specific schemas, migrations, and route handlers belong in that app.

## Environment variables

`pnpm db:*` loads the repo-root `.env` by default:

```
.env                 # default for db:* scripts
apps/<app>/.env      # when T42_ENV_APP=<app>
```

Do not commit `.env` files. See `.env.example` for the platform variables.

Scripts like `pnpm db:migrate` load that file via `scripts/run-with-app-env.mjs`.

## Database schemas

| Schema | Owner | Tables |
|--------|-------|--------|
| `auth` | Platform | user, session, account, verification |
| `public` | Platform | user_profile |

Local Postgres runs via Docker Compose (`pnpm db:up`). Default database name: `t42`.

## Request flow

```
App route / handler
  → @t42/auth (session)
  → @t42/db
```
