# TillLess Phase 1 Architecture

## 1. Purpose & Context
This document translates the TillLess MVP business requirements (`docs/prd.md`) into a technical architecture that supports data ingestion, normalisation, optimisation, and user experience delivery for Gauteng-based shoppers. It focuses on low-cost infrastructure, maintainable ingestion pipelines, and transparency in optimisation decisions.

**Scheduler Selection**: Temporalite (the single-node open-source Temporal server) will orchestrate scraper workflows locally via Docker Compose, providing durable retries and observability without ongoing cost. GitHub Actions cron jobs remain as a safety net for nightly refreshes when Temporalite is unavailable.

**Auth Provider**: BetterAuth (open-source) issues JWTs and refresh tokens for the Next.js frontend and NestJS backend, replacing previous Supabase Auth references to keep the stack vendor-neutral while staying within free-tier limits.

## 2. Guiding Constraints
- Limited budget: leverage free/open-source hosting tiers (Supabase, Vercel hobby, Temporalite, Upstash free).
- No paid product feeds; rely on compliant web scraping plus optional receipt uploads.
- Target geography: Gauteng (Johannesburg + Pretoria) with option to expand.
- Initial retailer set: Checkers/Sixty60, Pick n Pay, Shoprite, Woolworths, Makro (Food Lover's optional Phase 1.5).
- MVP performance target: ≤30 seconds per optimisation request for lists ≤60 items.
- Data freshness: 2–4 hour cadences for staples, higher frequency during promos.

## 3. High-Level Architecture Overview
```
┌───────────┐     ┌──────────────────┐     ┌──────────────────┐     ┌────────────────┐
│ Web Scrapers├──▶│  pg-boss Queue   ├──▶ │ Normalisation &   │──▶  │ Canonical       │
│ (Playwright│     │  (Supabase)      │     │ Matching Workers   │     │ Product Registry │
│  Workers)  │     └──────────────────┘     └──────────────────┘     │ (Postgres +     │
└─────▲──────┘                                                   ┌─┴────────────────┐
      │                                                           │ Prisma Client    │
      │                                                           │ & NestJS         │
      │                                                           └─▲─────┬─────────┘
┌─────┴────┐                                                    ┌──┴──┐  │
│ Scheduler│                                                    │ REST│  │
│ (Temporal│                                                    │/Graph│  │
│  /Cron)  │                                                    │  API │  │
└──────────┘                                                    └──▲──┘  │
                                                                   │     │
                   ┌──────────────────────────┐                    │     │
                   │ Frontend Web App (Next.js)│◀──────────────────┘     │
                   │ + BetterAuth SDK          │                          │
                   └──────────────┬───────────┘                          │
                                  │                                      │
                                  ▼                                      │
                        ┌──────────────────────┐   Receipts / Feedback   │
                        │ Supabase Storage /   │◀────────────────────────┘
                        │ CDN-backed downloads │
                        └──────────────────────┘
```

## 4. Component Breakdown
### 4.1 Data Ingestion Layer
- **Scraper Workers** (`docs/retailer-scraping-playbook.md`): TypeScript Playwright workers packaged as Docker jobs. Each worker targets a specific retailer/store region and emits structured payloads.
- **Scheduler**: Temporalite workflows (TypeScript) coordinate cadence grids with retry/backoff policies; GitHub Actions cron jobs trigger backup nightly syncs.
- **Ingestion Queue**: `pg-boss` (Postgres-backed queue) running inside Supabase Postgres. Provides retries, scheduling, and fits the free tier.
- **Delta Detection**: Workers compute `content_hash`; unchanged payloads short-circuit to avoid redundant writes.

### 4.2 Normalisation & Matching
- **Matching Workers**: NestJS microservice consuming `pg-boss` jobs. Shared utilities handle name normalisation, pack parsing, and brand dictionaries. Low-confidence matches are enqueued for manual review.
- **Human Review Console**: Protected Next.js admin route surfacing `product_matching_queue` entries for analysts to approve/override.

### 4.3 Canonical Product Registry (CPR)
- **Database**: Supabase Postgres 14+. Schema per `docs/canonical-product-registry.md` and migration `db/migrations/20241007_0001_cpr_phase1.sql`.
- **Tables**: Retailers, stores, retailer_items, retailer_item_price snapshots, canonical products, aliases, matching queue.
- **Retention**: Maintain 6 months of price snapshots (monthly partitions). Export older data to Supabase Storage if needed.

### 4.4 Optimisation Service
- **Service**: NestJS module using Prisma ORM and TypeScript domain logic. Utilises `mathjs`/custom utilities for unit conversions and promotion evaluation.
- **Processing Pipeline**:
  - Query canonical products and latest prices via Prisma.
  - Apply substitution rules, compute unit prices, evaluate promotions.
  - Incorporate travel/time cost heuristics (precomputed matrix in Postgres or optional OSRM microservice).
  - Produce best-store recommendation with explanations and fallback options.

### 4.5 API & Backend Gateway
- Single NestJS application hosting REST/GraphQL endpoints for optimisation, list management, preferences, receipt feedback, and admin review.
- Authentication via BetterAuth-issued JWTs validated with NestJS guards; roles/scopes drawn from BetterAuth claims.
- Rate limiting through NestJS interceptors backed by Upstash Redis (or Postgres counters for minimal infra).
- Receipt upload endpoints issue pre-signed URLs against Supabase Storage; validation enforces file types and size limits.

### 4.6 Frontend Web Application
- Next.js (TypeScript, App Router) deployed on Vercel hobby tier.
- Integrates BetterAuth SDK for authentication and session refresh.
- Provides shopping list workflow, preference management, optimisation results, savings history, and receipts dashboard.
- Communicates with NestJS backend via REST/GraphQL using fetch or React Query.

### 4.7 Storage & Files
- **Supabase Postgres**: Primary OLTP store hosting CPR and application data.
- **Prisma ORM**: Generates typed client shared across backend services.
- **Upstash Redis (optional)**: Free tier caching and rate-limit counters.
- **Supabase Storage**: Stores receipt images and exports (accessed via signed URLs).
- **Temporalite SQLite**: Persists workflow state; bind to Docker volume for durability with backups to Supabase Storage.

### 4.8 Observability & Ops
- **Monitoring**: Temporalite UI for workflow health, Supabase dashboards for DB metrics, optional Grafana Cloud for metrics via OpenTelemetry.
- **Alerting**: GitHub Actions + Slack webhook for ingestion failures or latency breaches; BetterAuth hooks for auth anomalies.
- **Tracing & Logs**: `@nestjs/terminus` health checks plus OpenTelemetry instrumentation piped to Grafana Cloud or Logtail free tier.
- **Runbooks**: Link to `db/README.md` for migrations; orchestration steps captured in `docs/ops/temporalite-runbook.md`; maintain optimisation/auth troubleshooting guides within `docs/ops/`.

## 5. Key Data Flows
Same as sharded `docs/architecture/05-5-key-data-flows.md`.

## 6. Technology Stack

**📋 Complete Version Specifications:** See `docs/architecture/technology-versions.md` for exact versions, update policies, and security SLAs.

**📦 Package Templates:** See `docs/architecture/package-json-templates/` for ready-to-use package.json files.

| Layer | Tech Choice | Versions | Rationale |
| --- | --- | --- | --- |
| Runtime | Node.js LTS + pnpm | Node.js **20.11.1**, pnpm **9.14.2** | LTS support until 2026, workspace-native package manager |
| Scrapers | TypeScript + Playwright | Playwright **1.49.1**, TypeScript **5.7.2** | Shared language across stack, reliable browser automation, Docker-friendly |
| Scheduler | Temporalite + GitHub Actions cron | Temporalite **0.3.0**, @temporalio/worker **1.11.3** | Durable orchestration with retries; backup cron for nightly jobs |
| Queue | pg-boss (Supabase Postgres) | pg-boss **10.1.5** | Queue built on existing Postgres, no extra services, free-tier compatible |
| Data Storage | Supabase Postgres + Prisma ORM | PostgreSQL **15.10**, Prisma **6.2.1** | Managed Postgres with type-safe access |
| Auth | BetterAuth (self-hosted) | better-auth **1.0.7** | Open-source JWT provider, integrates with Next.js/NestJS without vendor lock-in |
| Backend & Optimisation | NestJS + Prisma + mathjs | NestJS **10.4.15**, mathjs **13.2.2** | Modular architecture, DI, strong typing; numerical helpers for optimisation |
| Frontend | Next.js + Redux Toolkit + BetterAuth | Next.js **15.1.3**, React **18.3.1**, Redux **2.5.0** | App Router + RSC, Redux for state, RTK Query for data, BetterAuth SDK for auth |
| UI Components | shadcn/ui + Tailwind CSS | Tailwind **3.4.17**, Radix UI **latest** | Accessible components on Radix UI primitives, utility-first styling |
| Cache / Rate Limits | Upstash Redis or Postgres | Redis **7.4** (Upstash managed) | Lightweight caching and throttling without paid infra |
| Object Storage | Supabase Storage + CDN | - | Affordable S3-compatible storage with signed URLs |
| Analytics | Metabase OSS | Latest stable | Quick dashboards over Postgres without licensing fees |
| Observability | OpenTelemetry + Grafana Cloud | @opentelemetry/sdk-node **0.55.0** | Centralised metrics/logs/traces within free tiers |
| Testing | Vitest + Playwright + Testing Library | Vitest **2.1.8**, Playwright **1.49.1** | Fast unit testing, reliable E2E, component testing |
| CI/CD | GitHub Actions + Docker | Docker **27.4.0** | Free automation for lint/test/build/deploy

**Version Management:** All versions use exact pinning (no semver ranges) to ensure reproducible builds. Security updates follow defined SLAs in technology-versions.md.

## 7. Non-Functional Considerations
- **Performance**: Cache canonical catalog snapshots per run; precompute unit prices. Use worker pools and queue concurrency controls.
- **Scalability**: Independently scale scrapers, queue consumers, and backend services. pg-boss supports horizontal job processors; Vercel auto-scales Next.js.
- **Reliability**: Temporalite retries failed workflows; pg-boss retries configurable with dead-letter handling. Nightly full refresh ensures consistency.
- **Security**: Enforce HTTPS end-to-end; manage secrets via BetterAuth + Supabase secret store; restrict receipt storage via signed URLs.
- **Privacy**: Store minimal PII, provide account deletion, purge receipts after 90 days.
- **Compliance**: Display price-variability disclaimers; adhere to polite scraping cadence and document data sources for legal review.

## 8. Deployment & Environments
- **Environments**: Dev (Docker Compose: Temporalite, Postgres, Redis, NestJS, Next.js), Staging (Supabase project + Render/ Railway services), Production (separate Supabase instance + production Vercel/Render).
- **Temporalite Setup**: `docker-compose up temporalite` with workflows registered from the ingestion repo; persistent volume mounted for SQLite DB.
- **CI/CD**: GitHub Actions runs lint/tests, applies Prisma migrations (via `supabase db push`), builds Docker images, and deploys to Render/Vercel.
- **Infrastructure as Code**: Terraform or Supabase config for reproducible environments; Compose files for local dev.
- **Secret Management**: GitHub Actions secrets, BetterAuth environment vars, Supabase secret store; rotate quarterly.

## 9. Monitoring & Alerting
- Track ingestion job completion, queue depth, per-retailer SKU counts, last scrape timestamp.
- Monitor optimisation latency, error rates, and savings variance.
- Instrument BetterAuth for sign-in failures and suspicious activity.
- Trigger Slack/Email alerts for two consecutive ingestion failures, queue backlog thresholds, or optimisation P95 latency >25s.

## 10. Roadmap & Phase Transitions
Aligned with sharded `docs/architecture/10-10-roadmap-phase-transitions.md`.

## 11. Open Technical Questions
Aligned with sharded `docs/architecture/11-11-open-technical-questions.md` (updated to reflect Temporalite/BetterAuth usage as needed).

## 12. References
- PRD: `docs/prd.md`
- Frontend Specification: `docs/front-end-spec.md`
- Frontend Architecture (Redux + RTK Query): `docs/architecture/frontend-architecture.md`
- API Routes BFF Pattern: `docs/architecture/api-routes-bff.md`
- CPR Blueprint: `docs/canonical-product-registry.md`
- Scraping Playbook: `docs/retailer-scraping-playbook.md`
- Migration Runbook: `db/README.md`
- Story 1.1: `docs/stories/1.1.data-backbone-bootstrap.md`
