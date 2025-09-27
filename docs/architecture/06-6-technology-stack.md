## 6. Technology Stack
| Layer | Tech Choice | Rationale |
| --- | --- | --- |
| Scrapers | TypeScript + Playwright + pnpm | Strong browser automation support, reuse shared TypeScript utilities, easy packaging via Docker. |
| Scheduler | Temporalite (self-hosted) or GitHub Actions cron | Free-to-run orchestration with retries and visibility; definitions stay in TypeScript. |
| Queue | `pg-boss` on Supabase Postgres | Queue built on existing Postgres instance; works within Supabase free tier without extra services. |
| Data Storage | Supabase Postgres 14 + Prisma | Managed Postgres plus Prisma schema management for type-safe access. |
| Cache / Rate Limits | Upstash Redis (free tier) or in-DB counters | Provides distributed locks and rate limiting without paid infra. |
| Backend & Optimisation | NestJS (TypeScript) + Prisma + mathjs | Consistent TypeScript stack, modular architecture, numerical helpers for optimisation. |
| Frontend | Next.js (TypeScript, App Router) | Mature React meta-framework with Vercel hobby tier hosting. |
| Auth | Supabase Auth (JWT) | Built-in auth provider integrates with frontend and backend easily. |
| Object Storage | Supabase Storage + CDN (e.g., Cloudflare) | Affordable S3-compatible storage with signed URL support. |
| Analytics | Metabase (Docker) or Supabase Dashboard | OSS analytics deployable on free Render/railway tiers. |
| Observability | OpenTelemetry SDK + Grafana Cloud free tier | Centralised metrics/logs/traces without cost. |
| CI/CD | GitHub Actions + Docker | Free per repo; automates lint/test/build/deploy pipelines. |
