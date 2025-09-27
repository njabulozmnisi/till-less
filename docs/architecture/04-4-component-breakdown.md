## 4. Component Breakdown
### 4.1 Data Ingestion Layer
- **Scraper Workers** (`docs/retailer-scraping-playbook.md`): Playwright-based Node runners packaged as Docker jobs. One worker per retailer, parameterised by store/region.
- **Scheduler**: Airflow (self-hosted) or lightweight Temporal/CronJobs triggers cadence grid jobs.
- **Ingestion Queue**: RabbitMQ (if self-hosted) or AWS SQS for decoupling retries and smoothing load.
- **Delta Detection**: Workers compute `content_hash`; unchanged payloads short-circuit to reduce writes.

### 4.2 Normalisation & Matching
- **Matching Workers**: Node/TypeScript workers applying heuristics (string normalisation, regex pack parsing, brand dictionaries) to map retailer offers to CPR products. Low confidence matches queued for manual review UI.
- **Human Review Console** (Phase 1 basic): Internal admin panel that reads `product_matching_queue` and lets analysts confirm/override mappings.

### 4.3 Canonical Product Registry (CPR)
- **Database**: Postgres 14 (Supabase managed). Schema per `docs/canonical-product-registry.md` and migration `db/migrations/20241007_0001_cpr_phase1.sql`.
- **Tables**: Retailers, stores, retailer_items, retailer_item_price snapshots, canonical products, aliases, matching queue.
- **Retention**: Keep 6 months of price snapshots (partitioned by month) to allow trend analysis; older data archived to cold storage if costs rise.

### 4.4 Optimisation Service
- **Service**: Node.js (TypeScript) service exposing optimisation logic via REST or GraphQL (e.g., Apollo Server). Runs cost calculations, applies promo rules, and generates explanations.
- **Inputs**: Shopping list payload, user preferences, loyalty toggles.
- **Processing**:
  - Fetch canonical products & current price snapshots per retailer.
  - Apply substitution rules, compute unit prices, evaluate promos (multibuy eligibility, loyalty discounts).
  - Incorporate travel/time cost heuristics (precomputed distance matrix or on-demand OSRM lookup).
  - Produce best-single-store recommendation + fallback alternatives if gaps exist.
- **Outputs**: Structured plan with store recommendation, item comparison table, savings summary, assumptions.

### 4.5 API & Backend Gateway
- Combines optimisation endpoints, list management, preference storage, and feedback ingestion.
- Provides authentication (Supabase Auth or Auth0 free tier) and rate limiting (Express middleware + Redis for counters).
- Hosts receipt upload endpoints (validated file types, size limits).

### 4.6 Frontend Web Application
- Built with Next.js (TypeScript) for SSR/SSG balance, deployed on Vercel or Render free tier.
- Features: shopping list UI, preference settings, optimisation results, savings history dashboard, receipt reconciliation form.
- Integrates with backend via REST/GraphQL; uses Supabase Auth client or NextAuth.

### 4.7 Storage & Files
- **Postgres**: Primary data store.
- **Redis / Upstash**: Optional caching for frequent lookups (e.g., canonical product metadata) and rate limiting.
- **Object Storage**: AWS S3, Supabase Storage, or Cloudflare R2 for receipt images.
- **Logs & Metrics**: CloudWatch, OpenTelemetry collector, or Grafana Cloud free tier.

### 4.8 Observability & Ops
- **Monitoring**: Prometheus + Grafana (or hosted alternatives) for scrape success metrics, queue depth, optimisation latency.
- **Alerting**: Opsgenie/Slack webhook for ingestion failures >2 consecutive runs.
- **Tracing**: OpenTelemetry instrumentation in optimisation service to track request timing.
- **Runbooks**: Link to `db/README.md` for migrations; create additional runbooks for scraping & optimisation troubleshooting.
