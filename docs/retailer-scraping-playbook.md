# Retailer Scraping Playbook – Phase 1

This playbook guides ingestion runs for the five Phase-1 retailers (Checkers, Pick n Pay, Shoprite, Woolworths, Makro) with an optional Phase-1.5 retailer (Food Lover's Market). It aligns field outputs to the Canonical Product Registry (CPR) schema and defines cadence, promo handling, and bot-hygiene expectations.

---

## 1. Shared Principles
- **Output contract**: Every scraper yields the base feed shape (`retailer`, `store_id`, `retailer_sku`, `product_name_raw`, `pack_size_raw`, `price`, `loyalty_price`, `promo_*`, `availability`, `category_breadcrumbs_raw`, `image_url`, `scrape_ts`, `content_hash`).
- **Delta detection**: Regenerate `content_hash` using stable ordering and trimmed text to reduce false positives.
- **Retry budget**: Max three retries per URL with exponential backoff; throttle to ≤ 8 concurrent requests per domain unless otherwise specified.
- **Anti-bot hygiene**: Rotate User-Agent, respect robots.txt (note some APIs expose JSON endpoints despite disallow sections—coordinate with legal before bypassing). Honour rate caps using per-retailer guidelines.
- **Error logging**: Emit structured logs (retailer, url, status_code, error_type, attempt, timestamp) for ingestion dashboard.

---

## 2. Retailer Playbooks

### 2.1 Checkers / Sixty60
- **Entry points**: Sixty60 GraphQL endpoints (require auth token) + public web PDP backups. Seed categories via `/categories` query; item detail via `productDetail` (GraphQL).
- **Auth**: Session cookie & bearer token from mobile app login flow (rotate monthly). Store credentials in secrets manager.
- **Cadence**: Core staples every 2–4h, long-tail nightly.
- **Promos**: Fields `wasPrice`, `multiBuy` present in JSON; map to `promo_flag`, `promo_type`. Loyalty pricing tied to Xtra Savings—toggle via GraphQL flag.
- **Availability**: `stockLevel` values (`AVAILABLE`, `LIMITED`, `OUT_OF_STOCK`). Map to enum.
- **Special notes**: Regional pricing driven by store branch; store_id = branch GUID. Use store list endpoint to refresh weekly.

### 2.2 Pick n Pay
- **Entry points**: `https://www.pnp.co.za/pnpstorefront/pnp/en/` (SAP Hybris) + JSON API `pnp/v1/products`. Category crawl via sitemap `products.xml` or `/c/{category}?pageSize=...`.
- **Auth**: Public for browsing; loyalty price visible when `smartshopper=true` query param included.
- **Cadence**: 2–4h for staples; 12h for long-tail. Promotions often flip at midnight.
- **Promos**: Parse `promotionType` and `promotionText`. Multi-buy combos appear as `xForY`; map to `promo_type='multibuy'`.
- **Availability**: Use `stock.stockLevelStatus` (values `inStock`, `lowStock`, `outOfStock`).
- **Anti-bot**: Respect 3 req/sec; rotate IPs daily.

### 2.3 Shoprite
- **Entry points**: Checkers & Shoprite share backend; for Shoprite use `https://www.shoprite.co.za/` endpoints (`/graphql`). Category iterations similar to Sixty60 but store-specific.
- **Auth**: Session tokens from web login flow optional; many endpoints anonymous.
- **Cadence**: Align with Checkers: 2–4h staples.
- **Promos**: Parse `promotionBadges` array, `price.type`. Loyalty price flagged as `xtraSavingsPrice`.
- **Availability**: `storeAvailability` returns booleans per store; prefer store of interest.
- **Notes**: Ensure `retailer` field uses `shoprite` to differentiate from Checkers despite shared API.

### 2.4 Woolworths (WRewards)
- **Entry points**: `https://www.woolworths.co.za/api/v3/` (REST) for product listing. Category seeds via `/category/{id}/products?page=...`.
- **Auth**: Public for browse; WRewards prices require loyalty flag (`wrewards=true`).
- **Cadence**: Staples 2–4h; WRewards promos re-check every 60–90 minutes until expiry.
- **Promos**: Fields: `promotionType` (`WREWARDS_DISCOUNT`, `MULTIBUY`, `PRICE_DROP`). Capture `promotionBadge` text, `promotionEndDate` if available. Map to `promo_*` fields.
- **Availability**: `stockStatus` (`IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`, `UNAVAILABLE`). Map to enum.
- **Pack parsing**: Pay attention to private label naming; store raw brand for normalisation.
- **Anti-bot**: They rate limit aggressively; cap to 2 req/sec, random jitter 300–700 ms.

### 2.5 Makro (mCard / mRewards)
- **Entry points**: `https://www.makro.co.za/` PDPs with embedded JSON-LD; Bulk API `https://api.makro.co.za/mrest/v2/products`. Category seeds from `/groceries/c/{category}`.
- **Auth**: Public; loyalty price appears when `cardType` param set to `mcard`.
- **Cadence**: Generally 6–12h; when promo badge detected, poll every 90 minutes until badge disappears.
- **Promos**: Look for `badge` text (`Buy More Save More`, `Bulk Deal`). Some endpoints provide `promotionStartDate`/`promotionEndDate`.
- **Availability**: Warehouse vs. store availability (`stock.availableQuantity`). Map `>0` to `in_stock`; handle `null` as `unknown`.
- **Bulk handling**: Parse `packInfo` (e.g., `6 x 2L`) before pushing to CPR; recompute per-unit price in canonical layer.
- **Anti-bot**: Vary headers; limit to 1 req/sec outside business hours to avoid blocks.

### 2.6 Food Lover's Market (Phase 1.5)
- **Entry points**: Regional microsites (`https://www.foodloversmarket.co.za/stores/{region}`) with store-specific pricing. Some partners run via OneCart; prefer direct store pages.
- **Auth**: Public.
- **Cadence**: Fresh produce 2–4h during trading hours (06:00–20:00). Non-produce daily.
- **Promos**: Multibuy combos in plain-text (e.g., `3 for R45`). Capture raw badge string for later parsing.
- **Availability**: Often missing; default to `unknown`. When present, parse `Available today` cues.
- **Per-weight pricing**: Many items display `R per kg`. Store `price_mode='per_weight'`, `price_per_uom`, `uom='kg'`.
- **Anti-bot**: Distribute requests evenly over stores to avoid hammering single endpoints.

---

## 3. Scheduling Grid (Ops Ready)
| Job | Retailers | Frequency | Window | Remarks |
| --- | --- | --- | --- | --- |
| Core staples crawl | All five | 2–4h | 06:00–22:00 SAST | Prioritise category seed list; capture promos each run |
| WRewards promo sweep | Woolworths | 60–90m | Promo-active | Re-queue flagged SKUs until promo_end |
| Bulk sweep | Makro | 6–12h (base) | 00:00–23:00 | Increase to 90m during active promo |
| Produce sweep | Food Lover's | 2–4h | Store hours | Weight-priced items only |
| Long tail crawl | All | 12–24h | Overnight | Fill catalog gaps without daytime load |
| Store metadata sync | All | Weekly + on change | Off-peak | Trigger on 404/redirect or detection of new stores |

---

## 4. Data Quality & Monitoring
- **Anomaly detection**: Raise alerts for >20% price swings within 24h unless promo flagged.
- **Coverage tracking**: Dashboard metrics per retailer (SKU count, last scrape time, promo coverage, failure rate).
- **Manual review**: Feed low-confidence matches and promo badge parsing issues into the analyst queue daily.
- **Receipts feedback loop**: When OCR pipeline flags discrepancies, prioritise those SKUs in next crawl.

---

## 5. Next Actions
1. Configure orchestration (Airflow/Cron) using the scheduling grid above.
2. Implement loyalty toggles per retailer with secrets-driven credentials.
3. Update ingestion mappers to populate new CPR fields (per-weight, promo enums, raw text).
4. Add monitoring hooks (Prometheus/Grafana) for scrape latency, failure rate, and per-retailer throughput.
