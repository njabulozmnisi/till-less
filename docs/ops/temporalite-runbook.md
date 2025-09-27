# Temporalite Orchestration Runbook

## Purpose
Provide repeatable instructions for managing the Temporalite (Temporal single-node) instance that orchestrates TillLess ingestion workflows.

## Components
- **Temporalite container**: Runs the Temporal server with embedded SQLite storage.
- **Worker services**: TypeScript workers (scrapers, pg-boss consumers) registering activities/workflows.
- **CLI tools**: `temporal` CLI (via Docker image) for scheduling and introspection.

## Prerequisites
- Docker / Docker Compose installed.
- Repository cloned with Temporal workflow definitions (`infra/orchestration` package).
- Environment variables (.env) containing Temporalite namespace, Postgres connection string, BetterAuth credentials for workers.

## Start Temporalite Locally
```bash
cd infra/orchestration
Docker compose up temporalite
```
- Temporalite UI available at `http://localhost:8233/` (default credentials not required).
- SQLite DB volume mounted at `./.temporal-data/` for persistence; back up weekly to Supabase Storage.

## Register Workers
```bash
pnpm install
pnpm temporal:worker --worker checkers-ingestion
```
- Workers automatically register activities and start polling queues.
- Ensure `.env` exports `DATABASE_URL` (Supabase), `PG_BOSS_QUEUE` name, and retailer auth secrets.

## Trigger Workflow Manually
```bash
pnpm temporal:workflow --workflow CheckersIngestionWorkflow --input '{"storeId":"sixty60-jhb","forceRefresh":true}'
```
- Monitor run via Temporal UI; verify `CheckersIngestionWorkflow` completes within SLA.
- On success, Confirm pg-boss job metrics and new rows in `retailer_item_price`.

## Schedule Cadence
Temporalite supports schedules via CLI (Temporal 1.20+).
```bash
pnpm temporal:schedule create checkers-hourly \
  --workflow CheckersIngestionWorkflow \
  --schedule "every 2h between 06:00-22:00 Africa/Johannesburg"
```
- Confirm schedule existence: `pnpm temporal:schedule list`.
- GitHub Actions fallback runs nightly using `pnpm temporal:workflow --workflow ...` if Temporalite offline.

## Health Checks
- Temporal UI: review failed runs, retry count, latency.
- CLI metrics: `pnpm temporal:workflow list --status running` should be empty outside execution windows.
- Monitor pg-boss dashboard (`SELECT * FROM pgboss.dashboard()`) for stuck jobs.

## Recovery
1. Stop workers (`Ctrl+C`).
2. Restart Temporalite container.
3. Restore SQLite DB from latest backup if corruption occurs.
4. Re-register workers and re-run pending workflows.

## Alerting Hooks
- GitHub Actions workflow posts to Slack on two consecutive failures (status from Temporal CLI).
- Optional: configure Grafana OnCall using Temporal metrics exporter when deployed.

## References
- Temporalite docs: https://docs.temporal.io/temporalite
- Workflow source: `infra/orchestration/src/workflows/checkersIngestionWorkflow.ts`
- Queue config: `apps/nest-backend/src/queues/pgboss.config.ts`
