# Database Migration Runbook – CPR Phase 1

## Prerequisites
- PostgreSQL 13+
- `psql` CLI configured for the staging database (connection string via `DATABASE_URL_STAGING`).
- Staging environment backup taken within the last 24 hours.

## Apply Migration
1. Export backup (optional but recommended):
   ```bash
   pg_dump "$DATABASE_URL_STAGING" > backups/staging_$(date +%Y%m%d%H%M).sql
   ```
2. Run the migration script:
   ```bash
   psql "$DATABASE_URL_STAGING" -f db/migrations/20241007_0001_cpr_phase1.sql
   ```
3. Verify new columns/enums:
   ```bash
   psql "$DATABASE_URL_STAGING" -c "\d product" | grep price_mode
   psql "$DATABASE_URL_STAGING" -c "\d retailer_item_price" | grep loyalty_price
   ```
4. Record completion in release log (include timestamp, operator, link to backup).

## Post-migration Checks
- Confirm indexes `idx_store_retailer_store_id` exists.
- Validate enum values:
  ```sql
  SELECT unnest(enum_range(NULL::retailer_code_enum));
  ```
- Run ingestion smoke test targeting staging to ensure new fields populate without breaking existing ETL.

## Rollback Plan
If issues arise, restore from the backup taken in step 1:
```bash
psql "$DATABASE_URL_STAGING" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
psql "$DATABASE_URL_STAGING" -f backups/<backup-file>.sql
```

> Note: Enum value additions are irreversible in PostgreSQL 13; rollback requires recreating the enum by dump/restore.
