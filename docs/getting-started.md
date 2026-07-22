# Getting started

## Prerequisites

- Node.js (see `.nvmrc`)
- pnpm 10.x (see `package.json` → `devEngines`)
- Docker (for local Postgres)

## First-time setup

From the repository root:

```bash
pnpm install
cp apps/studio/.env.example apps/studio/.env
pnpm db:up
pnpm db:migrate
pnpm studio:db:migrate
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Environment variables live per app, not at the repo root. For local development, copy:

```bash
cp apps/studio/.env.example apps/studio/.env
```

At minimum, set:

- `DATABASE_URL` — local Postgres connection string
- `BETTER_AUTH_SECRET` — random secret (`openssl rand -base64 32`)
- `BETTER_AUTH_URL` — `http://localhost:3000` for local dev

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
| `pnpm studio:db:migrate` | Studio migrations (`apps/studio`) |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm db:reset` | Drop volume, recreate DB, re-run migrations |

After schema changes:

```bash
pnpm db:generate          # platform
pnpm studio:db:generate   # studio
```

## Troubleshooting

**`DATABASE_URL is not set`** — copy and fill in `apps/studio/.env`.

**Port 5432 in use** — stop other Postgres instances or change the Docker port mapping.

**Migrations fail on fresh DB** — run `pnpm db:reset` to recreate the local database.
