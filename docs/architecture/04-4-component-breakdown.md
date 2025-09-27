## 4. Component Breakdown
### 4.1 Data Ingestion Layer
- **Scraper Workers** (`docs/retailer-scraping-playbook.md`): TypeScript Playwright workers packaged as Docker jobs. Each worker targets a specific retailer/store region and emits structured payloads.
- **Scheduler**: Temporalite (self-hosted Temporal single-node) or GitHub Actions cron triggers recur jobs on free tiers; orchestration definitions live in TypeScript for consistency with the codebase.
- **Ingestion Queue**: `pg-boss` (Postgres-backed queue) running inside Supabase Postgres. Provides retry semantics, scheduled jobs, and works entirely within the free Supabase tier.
- **Delta Detection**: Workers compute `content_hash`; unchanged payloads short-circuit to avoid redundant writes.

### 4.2 Normalisation & Matching
- **Matching Workers**: NestJS microservice (TypeScript) consuming from `pg-boss`. Uses shared utilities for name normalisation, pack parsing, and brand dictionaries. Low-confidence matches enqueued for manual review.
- **Human Review Console** (Phase 1 basic): Lightweight Next.js admin route (protected) surfacing `product_matching_queue` entries for analysts to approve/override.

### 4.3 Canonical Product Registry (CPR)
- **Database**: Supabase Postgres 14+. Schema per `docs/canonical-product-registry.md` and migration `db/migrations/20241007_0001_cpr_phase1.sql`.
- **Tables**: Retailers, stores, retailer_items, retailer_item_price snapshots, canonical products, aliases, matching queue.
- **Retention**: Store 6 months of price snapshots (partitioned by month using native partitioning). Older data exported to Supabase storage if necessary.

### 4.4 Optimisation Service
- **Service**: NestJS module leveraging TypeScript business logic and Prisma ORM. Utilises `mathjs`/custom utilities for unit conversions, and optional `linear-programming` libraries for promo evaluation.
- **Inputs**: Shopping list payload, user preferences, loyalty toggles.
- **Processing**:
  - Query canonical products and latest price snapshots via Prisma.
  - Apply substitution rules, compute unit prices, evaluate promotions.
  - Incorporate travel/time cost heuristics (precomputed distance matrix stored in Postgres or on-demand OSRM microservice when available).
  - Produce best-store recommendation with explanation and fallback options.
- **Outputs**: Structured JSON plan (totals, item comparisons, applied promos, assumptions).

### 4.5 API & Backend Gateway
- Single NestJS application hosting REST/GraphQL endpoints for optimisation, list management, preferences, receipt feedback, and admin review.
- Authentication via Supabase Auth JWTs (verified using NestJS guards). Rate limiting handled through NestJS interceptors backed by Upstash Redis or in-DB counters depending on cost profile.
- Receipt upload endpoints issue pre-signed URLs against Supabase Storage; validation ensures safe file types and size limits.

### 4.6 Frontend Web Application
- Next.js (TypeScript, App Router) deployed on Vercel hobby tier.
- Provides shopping list experience, preference management, optimisation results, savings history, and receipts dashboard.
- Communicates with NestJS backend via REST/GraphQL; leverages Supabase Auth client for session handling.

### 4.7 Storage & Files
- **Supabase Postgres**: Primary OLTP store hosting CPR and application data.
- **Prisma ORM**: Generates typed client for Postgres; shared across backend services.
- **Upstash Redis (optional)**: Free tier supports caching frequently accessed reference data and storing rate-limit counters.
- **Supabase Storage**: Holds receipt images and export files.
- **GitHub Actions Artifacts**: Store deployment bundles when using static hosting pipelines.

### 4.8 Observability & Ops
- **Monitoring**: Temporalite UI (if used) plus Supabase dashboards. Optional Grafana Cloud free tier collecting metrics via OpenTelemetry exporters in NestJS services.
- **Alerting**: Slack webhook triggered by GitHub Actions or Supabase functions when ingestion failures occur twice consecutively or optimisation latency exceeds thresholds.
- **Tracing & Logs**: `@nestjs/terminus` health checks plus OpenTelemetry instrumentation piped to Grafana Cloud or Logtail free tier.
- **Runbooks**: Link to `db/README.md` for migrations and maintain ingestion/optimisation troubleshooting guides within `docs/ops/` (to be created).
