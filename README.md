# T42 Starter

TypeScript monorepo starter with auth, database, and shared packages.

## Quick start

```bash
pnpm install
cp .env.example .env
pnpm db:up
pnpm db:migrate
pnpm dev
```

`pnpm dev` starts every package and app that defines a `dev` script. Add an app under `apps/` when you need a deployable service.

## Common commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start packages and apps that define a dev script |
| `pnpm verify` | lint + typecheck + build + test |
| `pnpm db:up` | Start local Postgres (Docker) |
| `pnpm db:migrate` | Run platform migrations |
| `pnpm db:reset` | Reset local Postgres volume and re-migrate |

## Repository layout

```
apps/          Deployable applications
packages/      Shared db, auth, validators, ui, observability, …
docs/          Architecture, deployment, and conventions
```

## Documentation

- [Getting started](docs/getting-started.md)
- [Architecture](docs/architecture.md)
- [Deployment](docs/deployment.md)

## What's included

- **Platform packages**: `@t42/auth`, `@t42/db`, `@t42/validators`, `@t42/ui`, `@t42/observability`
- **Tooling**: Turborepo, pnpm catalog, Biome, Vitest, Drizzle
