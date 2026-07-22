# T42 Starter

TypeScript monorepo starter with auth, database, shared UI, and a reference Studio app.

## Quick start

```bash
pnpm install
cp apps/studio/.env.example apps/studio/.env
pnpm db:up
pnpm db:migrate
pnpm studio:db:migrate
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Common commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Studio and packages with a dev script |
| `pnpm verify` | lint + typecheck + build + test |
| `pnpm db:up` | Start local Postgres (Docker) |
| `pnpm db:migrate` | Run platform migrations |
| `pnpm studio:db:migrate` | Run Studio migrations |
| `pnpm db:reset` | Reset local Postgres volume and re-migrate |

## Repository layout

```
apps/          Deployable applications (studio is the default)
packages/      Shared db, auth, validators, ui, observability, …
docs/          Architecture, deployment, and conventions
```

## Documentation

- [Getting started](docs/getting-started.md)
- [Architecture](docs/architecture.md)
- [Deployment](docs/deployment.md)
- [Studio app](apps/studio/README.md)

## What's included

- **Platform packages**: `@t42/auth`, `@t42/db`, `@t42/validators`, `@t42/ui`, `@t42/observability`
- **Studio**: Next.js reference app with auth, task board, and developer guide
- **Tooling**: Turborepo, pnpm catalog, Biome, Vitest, Drizzle
