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
