## 6. Technology Stack
| Layer | Tech Choice | Rationale |
| --- | --- | --- |
| Scrapers | TypeScript + Playwright + pnpm | Shared language across stack, reliable browser automation, docker-friendly. |
| Scheduler | Temporalite (Docker Compose) with TypeScript workflows; GitHub Actions cron fallback | Durable, observable orchestration running locally for free; GitHub cron provides safety net for nightly jobs. |
| Queue | `pg-boss` (Supabase Postgres) | Queue built directly on Postgres, no extra infra, compatible with free tier. |
| Data Storage | Supabase Postgres 14 + Prisma ORM | Managed Postgres with migrations and typed access via Prisma. |
| Auth | BetterAuth (self-hosted) | Open-source auth provider issuing JWTs/refresh tokens; integrates with Next.js/NestJS without vendor lock-in. |
| Backend & Optimisation | NestJS (TypeScript) + Prisma + mathjs | Modular architecture, dependency injection, strong typing; math helpers for optimisation rules. |
| Frontend | Next.js (TypeScript) + Redux + RTK Query + BetterAuth | Mature React framework deployed on Vercel hobby tier; Redux for state management, RTK Query for data fetching/caching, BetterAuth SDK handles auth flows. |
| Frontend Proxy | Next.js API Routes | BFF (Backend for Frontend) pattern: API routes proxy calls to NestJS backend, enabling request transformation, caching, and simplified client logic. |
| Cache / Rate Limits | Upstash Redis (free tier) or Postgres advisory locks | Lightweight caching and throttling without managed service cost. |
| Object Storage | Supabase Storage + CDN (e.g., Cloudflare) | S3-compatible storage with signed URLs; free-tier friendly. |
| Analytics | Metabase OSS on Railway/Render free tier | Quick dashboarding over Postgres without licensing fees. |
| Observability | OpenTelemetry SDK + Grafana Cloud/Logtail free tiers | Centralised metrics/logs/traces within cost constraints. |
| CI/CD | GitHub Actions + Docker | Free automation for lint/test/build/deploy pipelines.
