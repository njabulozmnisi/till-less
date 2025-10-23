## 6. Technology Stack

**Version Reference:** See `docs/architecture/technology-versions.md` for complete version specifications and update policies.

| Layer | Tech Choice | Versions | Rationale |
| --- | --- | --- | --- |
| Runtime | Node.js LTS + pnpm | Node.js **20.11.1**, pnpm **9.14.2** | LTS support until 2026, workspace-native package manager |
| Scrapers | TypeScript + Playwright | Playwright **1.49.1**, TypeScript **5.7.2** | Shared language across stack, reliable browser automation, docker-friendly |
| Scheduler | Temporalite + GitHub Actions cron fallback | Temporalite **0.3.0**, @temporalio/worker **1.11.3** | Durable, observable orchestration running locally for free; GitHub cron provides safety net for nightly jobs |
| Queue | pg-boss (Supabase Postgres) | pg-boss **10.1.5** | Queue built directly on Postgres, no extra infra, compatible with free tier |
| Data Storage | Supabase Postgres + Prisma ORM | PostgreSQL **15.10**, Prisma **6.2.1** | Managed Postgres with migrations and typed access via Prisma |
| Auth | BetterAuth (self-hosted) | better-auth **1.0.7** | Open-source auth provider issuing JWTs/refresh tokens; integrates with Next.js/NestJS without vendor lock-in |
| Backend & Optimisation | NestJS + Prisma + mathjs | NestJS **10.4.15**, mathjs **13.2.2** | Modular architecture, dependency injection, strong typing; math helpers for optimisation rules |
| Frontend | Next.js + Redux Toolkit + BetterAuth | Next.js **15.1.3**, React **18.3.1**, Redux Toolkit **2.5.0** | App Router + RSC, Redux for state management, RTK Query for data fetching/caching, BetterAuth SDK handles auth flows |
| Frontend Proxy | Next.js API Routes | Next.js **15.1.3** | BFF (Backend for Frontend) pattern: API routes proxy calls to NestJS backend, enabling request transformation, caching, and simplified client logic |
| UI Components | shadcn/ui + Tailwind CSS | Tailwind **3.4.17**, Radix UI **latest** | Accessible components built on Radix UI primitives, utility-first styling |
| Cache / Rate Limits | Upstash Redis or Postgres advisory locks | Redis **7.4** (Upstash managed) | Lightweight caching and throttling without managed service cost |
| Object Storage | Supabase Storage + CDN | - | S3-compatible storage with signed URLs; free-tier friendly |
| Analytics | Metabase OSS on Railway/Render | Latest stable | Quick dashboarding over Postgres without licensing fees |
| Observability | OpenTelemetry + Grafana Cloud/Logtail | @opentelemetry/sdk-node **0.55.0** | Centralised metrics/logs/traces within cost constraints |
| Testing | Vitest + Playwright + Testing Library | Vitest **2.1.8**, Playwright **1.49.1** | Fast unit testing, reliable E2E testing, component testing |
| CI/CD | GitHub Actions + Docker | Docker **27.4.0** | Free automation for lint/test/build/deploy pipelines |

**Note:** All versions use exact pinning (no semver ranges) to ensure reproducible builds. See version management policies in `docs/architecture/technology-versions.md`.
