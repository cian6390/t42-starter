# Architecture

## Monorepo layout

```
apps/          Deployable applications
packages/      Shared libraries consumed by apps
docs/          Project documentation
scripts/       Repo-level automation
```

### Apps

| App | Package | Description |
|-----|---------|-------------|
| Studio | `@t42/studio` | Next.js reference app (auth, task board, developer guide) |

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

Each fork of this starter gets a **platform layer** and optional **app-specific** code.

**Platform** (keep when adding new apps):

- `@t42/auth`, `@t42/db`, `@t42/validators`
- Migrations in `packages/db/drizzle/`

**Studio-specific** (safe to remove with the Studio app):

- `studio` database schema
- `apps/studio/src/schemas/task.ts`
- `apps/studio/drizzle/`

Studio reuses platform auth tables and adds its own `studio.task` table.

## Environment variables

Variables are scoped per deployable app:

```
apps/studio/.env     # Studio (default for db:* scripts)
```

The root `.env.example` only points to the per-app examples. Do not commit `.env` files.

Scripts like `pnpm db:migrate` load `apps/studio/.env` by default via `scripts/run-with-app-env.mjs`. Override the target app with `T42_ENV_APP`.

## Database schemas

| Schema | Owner | Tables |
|--------|-------|--------|
| `auth` | Platform | user, session, account, verification |
| `public` | Platform | user_profile |
| `studio` | Studio app | task |

Local Postgres runs via Docker Compose (`pnpm db:up`). Default database name: `t42`.

## Request flow (Studio)

```
Browser → proxy.ts → Route Handler / Page
                  → @t42/auth (session)
                  → @t42/db or apps/studio db client
```

`proxy.ts` is the Next.js 16 replacement for `middleware.ts`. It handles auth redirects and request logging.
