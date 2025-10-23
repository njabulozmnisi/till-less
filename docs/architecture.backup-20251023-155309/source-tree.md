# Source Tree & Module Layout

This structure guides engineers on where to place Phase 1 code. The repository follows a pnpm workspace layout so ingestion workers, backend services, and shared libraries live under `apps/` and `packages/`.

```
.
├── apps/
│   ├── backend/              # NestJS application (REST/GraphQL, Prisma, BetterAuth guards)
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   ├── prisma/
│   │   │   └── main.ts
│   │   └── test/
│   ├── optimisation-worker/  # Temporal activities for optimisation
│   ├── temporal-orchestrator/ # Temporalite workflow definitions & registrations
│   ├── web/                  # Next.js frontend (App Router + Redux + RTK Query)
│   │   ├── src/
│   │   │   ├── app/         # Next.js pages and API routes (BFF)
│   │   │   ├── store/       # Redux store, slices, and RTK Query APIs
│   │   │   ├── components/  # React components (shadcn/ui + custom)
│   │   │   ├── lib/         # Utilities and helpers
│   │   │   └── types/       # TypeScript type definitions
│   │   └── public/
│   └── ingestion-dashboard/  # (Optional) Ops dashboard UI
├── packages/
│   ├── ingestion-workers/    # Playwright scrapers by retailer (each in subfolder)
│   │   ├── checkers/
│   │   ├── shoprite/
│   │   └── pnp/
│   ├── ingestion-shared/     # Shared scraping utils (auth, content hash, throttling)
│   ├── queue-consumers/      # NestJS module exposing pg-boss consumers & mappers
│   ├── data-access/          # Prisma client wrappers + SQL helpers
│   └── types/                # Shared TypeScript types (payload contracts, enums)
├── scripts/
│   ├── temporal/             # CLI helpers for workflows (trigger, replay)
│   └── db/                   # Migration runners & verification scripts
├── docs/                     # Product & architecture documentation
├── db/
│   ├── migrations/           # SQL migration files
│   └── README.md
└── web-bundles/              # BMAD agent resources
```

## Conventions
- Scraper workers belong under `packages/ingestion-workers/<retailer>/` with entry point `index.ts` and Playwright logic in `worker.ts`.
- Temporal workflows and activities live in `apps/temporal-orchestrator/src/`.
- pg-boss consumer logic is exported from `packages/queue-consumers/` and imported by the backend app.
- Shared TypeScript contracts live in `packages/types/ingestion.ts` and are versioned alongside workers and consumers.
- Tests sit next to code using `*.spec.ts`; long-running integration tests can live under `test/` folders.
- pnpm scripts should orchestrate runs (`pnpm --filter ingestion-workers...`).

Keep new folders aligned with this structure to avoid scattering ingestion logic across the repo.
