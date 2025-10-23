## 4. Component Breakdown
### 4.1 Data Ingestion Layer
- **Scraper Workers** (`docs/retailer-scraping-playbook.md`): TypeScript Playwright workers packaged as Docker jobs. Each worker targets a specific retailer/store region and emits structured payloads.
- **Scheduler**: Temporalite workflows defined in TypeScript coordinate cadence grids with retry/backoff policies; GitHub Actions cron jobs trigger backup nightly syncs.
- **Ingestion Queue**: `pg-boss` (Postgres-backed queue) running inside Supabase Postgres. Provides retry semantics, scheduled jobs, and fits within the free tier.
- **Delta Detection**: Workers compute `content_hash`; unchanged payloads short-circuit to avoid redundant writes.

### 4.2 Normalisation & Matching
- **Matching Workers**: NestJS microservice consuming from `pg-boss`. Shared TypeScript utilities for name normalisation, pack parsing, and brand dictionaries. Low-confidence matches enqueued for manual review.
- **Human Review Console** (Phase 1 basic): Protected Next.js admin route surfacing `product_matching_queue` entries for analysts to approve/override.

### 4.3 Canonical Product Registry (CPR)
- **Database**: Supabase Postgres 14+. Schema per `docs/canonical-product-registry.md` and migration `db/migrations/20241007_0001_cpr_phase1.sql`.
- **Tables**: Retailers, stores, retailer_items, retailer_item_price snapshots, canonical products, aliases, matching queue.
- **Retention**: Store 6 months of price snapshots (partitioned by month). Older data can be exported to Supabase Storage if costs rise.

### 4.4 Optimisation Service
- **Service**: NestJS module leveraging Prisma ORM and TypeScript domain logic. Uses `mathjs` or custom utilities for unit conversions and promo evaluation.
- **Inputs**: Shopping list payload, user preferences, loyalty toggles.
- **Processing**:
  - Query canonical products and latest price snapshots via Prisma.
  - Apply substitution rules, compute unit prices, evaluate promotions.
  - Incorporate travel/time cost heuristics (precomputed distance matrix stored in Postgres or optional OSRM microservice).
  - Produce best-store recommendation with explanation and fallback options.
- **Outputs**: Structured JSON plan (totals, item comparisons, applied promos, assumptions).

### 4.5 API & Backend Gateway
- Single NestJS application hosting REST/GraphQL endpoints for optimisation, list management, preferences, receipt feedback, and admin review.
- Authentication via BetterAuth-issued JWTs validated through NestJS guards; roles handled through BetterAuth claims.
- Rate limiting through NestJS interceptors backed by Upstash Redis (or Postgres counters for minimal infra).
- Receipt upload endpoints issue pre-signed URLs against Supabase Storage; validation enforces file type and size limits.

### 4.6 Frontend Web Application
- **Framework**: Next.js (TypeScript, App Router) deployed on Vercel hobby tier.
- **State Management**: Redux Toolkit manages global state (user preferences, shopping lists, optimisation results, UI state).
- **Data Fetching**: RTK Query provides type-safe API calls with automatic caching, invalidation, and background refetching.
- **API Proxy Layer**: Next.js API routes (`/api/*`) act as BFF, proxying requests to NestJS backend while handling:
  - Request/response transformation for frontend-optimized payloads
  - Client-side caching headers
  - Error normalization
  - Optional request batching
- **Authentication**: BetterAuth SDK handles auth flows, storing sessions securely and refreshing tokens.
- **User Experience**: Shopping list creation, preference management, optimisation results, savings history, and receipts dashboard.

### 4.7 Storage & Files
- **Supabase Postgres**: Primary OLTP store hosting CPR and application data.
- **Prisma ORM**: Generates typed client for Postgres; shared across NestJS services.
- **Upstash Redis (optional)**: Free tier used for caching reference data and storing rate-limit counters.
- **Supabase Storage**: Stores receipt images and exports with signed URL access.
- **Temporalite SQLite**: Maintains workflow state on disk within orchestration container (backed up to persistent volume).

### 4.8 Observability & Ops
- **Monitoring**: Temporalite web UI for workflow health; Supabase dashboards for DB metrics; optional Grafana Cloud for metrics via OpenTelemetry.
- **Alerting**: GitHub Actions + Slack webhook for ingestion failures or latency breaches; BetterAuth hooks for auth anomalies.
- **Tracing & Logs**: `@nestjs/terminus` health checks plus OpenTelemetry instrumentation routed to Grafana Cloud or Logtail free tier.
- **Runbooks**: Link to `db/README.md` for migrations; orchestration steps captured in `docs/ops/temporalite-runbook.md`; maintain optimisation/auth troubleshooting guides within `docs/ops/`.
