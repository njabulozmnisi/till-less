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
