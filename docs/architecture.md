# TillLess Phase 1 Architecture

## 1. Purpose & Context
This document translates the TillLess MVP business requirements (`docs/prd.md`) into a technical architecture that supports data ingestion, normalisation, optimisation, and user experience delivery for Gauteng-based shoppers. It focuses on low-cost infrastructure, maintainable ingestion pipelines, and transparency in optimisation decisions.

## 2. Guiding Constraints
- Limited budget: preference for managed-but-affordable services (Supabase, Render, Railway) and open-source tooling.
- No paid product data feeds; rely on compliant web scraping plus user-provided receipts.
- Target geography: Gauteng (Johannesburg + Pretoria) with potential expansion.
- Initial retailer set: Checkers/Sixty60, Pick n Pay, Shoprite, Woolworths, Makro (Food Lover's optional Phase 1.5).
- MVP response time: ≤30 seconds per optimisation request for lists ≤60 items.
- Data freshness: 2–4 hour cadences for core staples, with tighter loops for active promos.

## 3. High-Level Architecture Overview
```
┌───────────┐     ┌──────────────────┐     ┌────────────────┐     ┌────────────────┐
│ Web Scrapers├──▶│ Ingestion Queue  ├──▶ │ Normalisation & │──▶  │ Canonical       │
│ (Playwright│     │ (RabbitMQ/SQS)   │     │ Matching Workers│     │ Product Registry │
│  Workers)  │     └──────────────────┘     └────────────────┘     │ (Postgres)       │
└─────▲──────┘                                                   ┌─┴────────────────┐
      │                                                           │ Optimisation     │
      │                                                           │ Service (Node)   │
      │                                                           └─▲─────┬─────────┘
┌─────┴────┐                                                    ┌──┴──┐  │
│ Scheduler│                                                    │ REST│  │
│ (Airflow │                                                    │/Graph│  │
│ /Cron)   │                                                    │  API │  │
└──────────┘                                                    └──▲──┘  │
                                                                   │     │
                   ┌──────────────────────────┐                    │     │
                   │ Frontend Web App (Next.js)│◀──────────────────┘     │
                   │ + Auth & Preferences      │                          │
                   └──────────────┬───────────┘                          │
                                  │                                      │
                                  ▼                                      │
                        ┌──────────────────────┐   Receipts / Feedback   │
                        │ Object Storage (S3 /│◀─────────────────────────┘
                        │ Supabase Storage)    │
                        └──────────────────────┘
```

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

## 5. Key Data Flows
### 5.1 Catalog Ingestion Flow
1. Scheduler enqueues scrape jobs per retailer cadence.
2. Scraper fetches category/product pages, extracts payload, and publishes to ingestion queue.
3. Normalisation worker parses payload, maps to canonical products, and writes to Postgres (retailer_item/retailer_item_price).
4. Any low-confidence matches or schema anomalies logged and enqueued for manual review.
5. Monitoring emits metrics on SKU counts, promos captured, latency, error rates.

### 5.2 Optimisation Request Flow
1. User submits shopping list via frontend.
2. API validates input, loads canonical entries and latest price snapshots.
3. Optimisation engine calculates store totals, substitution suggestions, travel cost adjustments.
4. Response persisted (for analytics) and returned to frontend.
5. Frontend displays recommendation with explanation, timestamps, and savings breakdown.

### 5.3 Receipt Feedback Flow
1. User uploads receipt and enters actual spend.
2. Backend stores receipt image in object storage, logs metadata in Postgres.
3. Analyst workflow compares predicted vs. actual; mismatches feed back into matching queue for correction.
4. Aggregated variance metrics surface in analytics dashboard to monitor trust score.

## 6. Technology Stack
| Layer | Tech Choice | Rationale |
| --- | --- | --- |
| Scrapers | Node.js + Playwright | Resilient headless browser support; aligns with TypeScript stack. |
| Scheduler | Airflow (Docker) or Temporal Cloud starter | Dependency-aware DAGs; easy cadence updates. |
| Queue | RabbitMQ/SQS | Backpressure handling, retry semantics. |
| Data Storage | Supabase Postgres | Managed Postgres with auth + storage options, fits budget. |
| Cache | Upstash Redis (serverless) | Pay-per-request, handles small cache + rate limits. |
| Backend | Node.js (NestJS or Express + TypeScript) | Aligns with team skills; easy integration with Supabase. |
| Frontend | Next.js (App Router) | Rapid UI iteration, SSR for SEO and performance. |
| Object Storage | Supabase Storage / R2 | Affordable, S3-compatible. |
| Analytics | Metabase or Supabase dashboards | Quick insights from Postgres data. |
| Observability | OpenTelemetry + Grafana Cloud | Low-cost monitoring with generous free tier. |

## 7. Non-Functional Considerations
- **Performance**: Optimisation service caches canonical catalog snapshots per run; precomputes unit prices to reduce CPU load. Utilise worker pools with concurrency limits.
- **Scalability**: Separate ingestion and optimisation deployments; scale scrapers horizontally by retailer; API auto-scales on serverless platform (Render/Otterize) based on usage.
- **Reliability**: Retry failed scrapes with exponential backoff; maintain idempotency via content hashes; run nightly full refresh.
- **Security**: Enforce HTTPS; encrypt credentials using secrets manager (Supabase secrets or AWS Parameter Store); restrict receipt object storage with signed URLs.
- **Privacy**: Store minimal PII (email, loyalty selections). Provide user controls to delete account and receipts.
- **Compliance**: Include disclaimer on price variability; maintain polite scraping cadence (throttling, rotating User-Agents, obey robots guidance). Document data sources for legal review.

## 8. Deployment & Environments
- **Environments**: Dev (local Docker Compose), Staging (Supabase project + Render services), Production (separate Supabase instance + production Render/Vercel project).
- **CI/CD**: GitHub Actions running lint/test/build, applying DB migrations (via Supabase CLI) and deploying containers.
- **Infrastructure as Code**: Terraform or Supabase config files for reproducible environments.
- **Secret Management**: GitHub Actions secrets + Supabase secret store; rotate tokens quarterly.

## 9. Monitoring & Alerting
- Track ingestion job completion, queue depth, per-retailer SKU counts, last scrape timestamps.
- Monitor optimisation latency, error rates, and savings variance.
- Log user interactions for UX analytics (Matomo/self-hosted analytics to avoid high SaaS spend).
- Trigger alerts for: scrape failures >2 cycles, optimisation latency >25s (95th percentile), Postgres disk usage >80%.

## 10. Roadmap & Phase Transitions
- **Phase 1.5**: Integrate Food Lover's Market scrapers, add receipt OCR microservice (Tesseract + heuristics), support per-weight default quantity configuration.
- **Phase 2**: Multi-store routing (Graph algorithms), nutrition tagging, predictive pantry, recommendation engine (pricing trends).
- **Phase 3**: Mobile apps, retailer partnerships/APIs, anonymised market intelligence products.

## 11. Open Technical Questions
1. Should travel cost calculation rely on a third-party API (billing risk) or static rate table + OSRM self-hosted service?
2. What minimum viable manual review tooling is needed (versus building full admin console)?
3. How to balance PostgreSQL costs with snapshot retention—partitioning vs. external cold storage? 
4. Do we need real-time notifications (e.g., Slack, email) when massive promos appear, or is daily digest sufficient?

## 12. References
- PRD: `docs/prd.md`
- CPR Blueprint: `docs/canonical-product-registry.md`
- Scraping Playbook: `docs/retailer-scraping-playbook.md`
- Migration Runbook: `db/README.md`
