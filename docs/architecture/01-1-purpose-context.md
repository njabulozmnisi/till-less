## 1. Purpose & Context
This document translates the TillLess MVP business requirements (`docs/prd.md`) into a technical architecture that supports data ingestion, normalisation, optimisation, and user experience delivery for Gauteng-based shoppers. It focuses on low-cost infrastructure, maintainable ingestion pipelines, and transparency in optimisation decisions.

**Scheduler Selection**: The MVP will use Temporalite (the open-source single-node Temporal server) running in Docker Compose for orchestration. Temporalite provides durable workflows, retries, and a web UI without recurring cost. GitHub Actions cron remains a fallback for lightweight periodic triggers (e.g., nightly full refresh) when Temporalite is offline.

**Auth Provider**: BetterAuth (open-source) will handle user authentication/authorisation, issuing JWTs consumed by the NestJS API and Next.js frontend. Supabase Auth references from earlier drafts are replaced by BetterAuth to keep the stack vendor-neutral while remaining free-tier friendly.
