# Getting started

## Prerequisites

- Node.js (see `.nvmrc`)
- pnpm 10.x (see `package.json` → `devEngines`)
- Docker (for local Postgres)

## First-time setup

From the repository root:

```bash
pnpm install
cp .env.example .env
pnpm db:up
pnpm db:migrate
pnpm dev
```

`pnpm dev` starts packages and apps that define a `dev` script.

## Environment variables

Copy the platform example to the repo root:

```bash
cp .env.example .env
```

At minimum, set:

- `DATABASE_URL` — local Postgres connection string
- `BETTER_AUTH_SECRET` — random secret (`openssl rand -base64 32`)
- `BETTER_AUTH_URL` — public URL of the app that uses `@t42/auth`

When an app keeps its own env file, set `T42_ENV_APP` to that app's directory name so `pnpm db:*` loads `apps/<app>/.env` instead of the root `.env`.

See [architecture.md#environment-variables](architecture.md#environment-variables) for details.

## Daily workflow

```bash
pnpm dev          # start dev servers
pnpm typecheck    # type-check the monorepo
pnpm test         # run tests
pnpm verify       # lint + typecheck + build + test
```

## Database

| Command | Description |
|---------|-------------|
| `pnpm db:up` | Start Postgres via Docker Compose |
| `pnpm db:down` | Stop Postgres |
| `pnpm db:migrate` | Platform migrations (`packages/db`) |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm db:reset` | Drop volume, recreate DB, re-run migrations |

After platform schema changes:

```bash
pnpm db:generate
```

## Troubleshooting

**`DATABASE_URL is not set`** — copy and fill in `.env`.

**Port 5432 in use** — stop other Postgres instances or change the Docker port mapping.

**Migrations fail on fresh DB** — run `pnpm db:reset` to recreate the local database.
