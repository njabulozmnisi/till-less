# Canonical Product Registry (CPR) – Phase 1 Expansion

## 1. Overview
The Canonical Product Registry (CPR) normalises retailer-specific catalogue data into a single product graph used by the optimisation engine. Phase 1 expands support from the initial three retailers to a five-retailer set (Checkers, Pick n Pay, Shoprite, Woolworths, Makro) with an optional Phase 1.5 addition (Food Lover's Market). The registry keeps historical price/availability snapshots while exposing a canonical view of products, packs, and store coverage.

Goals for this iteration:
- Extend core enums/references to include new retailers.
- Capture per-weight pricing, loyalty tiers, and bulk pack structures.
- Preserve time-series price data with richer metadata (promos, availability).
- Maintain deterministic matching pipelines and review queues for low-confidence maps.

## 2. Entity Relationship Summary
```
+--------------+      +-----------------+      +-----------------------+
|   retailer   |1    n|     store        |1    n| retailer_store_region |
+--------------+------+-+---------------+-+      +-----------------------+
| id (PK)      |        | id (PK)       |        | id (PK)               |
| code (uniq)  |        | retailer_id FK|        | store_id FK           |
| name         |        | name          |        | pricing_region        |
+--------------+        | geo_point     |        | delivery_areas JSON   |
                        | services JSON |        | services_override JSON|
                        | hours JSON    |        +-----------------------+
                        +---------------+
                               |
                               |1
                               |    n
                        +---------------+
                        | retailer_item |
                        +---------------+
                        | id (PK)       |
                        | retailer_id FK|
                        | store_id FK?  |
                        | retailer_sku  |
                        | product_id FK |
                        | product_hash  |
                        | availability  |
                        | content_hash  |
                        +---------------+
                               |
                               |1
                               |    n
                        +--------------------+
                        | retailer_item_price|
                        +--------------------+
                        | id (PK)            |
                        | retailer_item_id FK|
                        | scrape_ts          |
                        | price              |
                        | loyalty_price      |
                        | price_per_uom      |
                        | promo_flag         |
                        | promo_type         |
                        | promo_badge_raw    |
                        | promo_start        |
                        | promo_end          |
                        | image_url          |
                        +--------------------+
                               ^
                               |
                      +----------------+
                      |  product       |
                      +----------------+
                      | id (PK)        |
                      | name           |
                      | brand          |
                      | category_id FK |
                      | price_mode     |
                      | base_qty_value |
                      | base_qty_uom   |
                      | unit_count     |
                      | notes          |
                      +----------------+
                               |
                               |1
                               |    n
                      +-----------------+
                      | product_alias   |
                      +-----------------+
                      | id (PK)         |
                      | product_id FK   |
                      | alias_type      |
                      | value           |
                      +-----------------+
```

### Relationship highlights
- `retailer` → `store`: 1-to-many. Stores inherit delivery areas, services, and regional pricing metadata.
- `store` → `retailer_item`: Optional link; most items belong to retailer-wide catalogues, but Makro and Food Lover's need branch-specific entries.
- `retailer_item` tracks the canonical linkage between a retailer SKU and a `product`. A nullable `store_id` accommodates national vs. regional pricing.
- `retailer_item_price` stores time-series snapshots per scrape run, enabling promo tracking and delta analysis.
- `product` captures the canonical representation, now extended with `price_mode` to distinguish per-item vs per-weight products.
- `product_alias` retains GTINs, EANs, fuzzy-normalised names, and manual review overrides used by the matching service.

## 3. Field Reference (Delta-Focused)

### 3.1 `retailer`
- **New codes**: `woolworths`, `foodlovers`, `makro` (append to enum or reference table).

### 3.2 `store`
- `retailer_store_id` (string, unique per retailer) – e.g., `WW-1234`, `MAKRO-Centurion`.
- `geo_point` (geometry / lat-long) – already present.
- **New optional JSON columns**:
  - `delivery_areas` (array of suburbs/postcodes).
  - `services` (pickup/delivery/warehouse flags).
  - `hours` (structured weekly schedule).
  - `pricing_region` (string) – anchor for regional catalogues.

### 3.3 `product`
- `price_mode` (enum: `per_item`, `per_weight`; default `per_item`).
- `base_qty_value` (numeric) and `base_qty_uom` (`ml`, `l`, `g`, `kg`, `ct`) ensure unit-price normalisation.
- `unit_count` (int) for pack counts (e.g., Makro carton outer quantity).

### 3.4 `retailer_item`
- `retailer_sku` (string) – retains raw retailer SKU/codes.
- `product_name_raw` / `brand_raw` / `pack_size_raw` / `unit_count_raw` (text) – persisted for audit and re-matching.
- `availability` (enum: `in_stock`, `limited`, `out_of_stock`, `unknown`).
- `content_hash` (text) – checksum of scraped payload to detect deltas.

### 3.5 `retailer_item_price`
- `price` NUMERIC(10,2) – default shelf/carton price.
- `loyalty_price` NUMERIC(10,2) – loyalty-adjusted price (WRewards, mCard, Xtra, Smart Shopper).
- `price_per_uom` NUMERIC(10,2) – explicit per-weight/volume price if provided (`per kg`, `per 100g`).
- `promo_flag` BOOLEAN, `promo_type` (enum: `multibuy`, `combo`, `loyalty`, `markdown`, `bulk_deal`, `other`).
- `promo_badge_raw` TEXT – raw badge/copy for manual review.
- `promo_start`, `promo_end` TIMESTAMP WITH TIME ZONE – promo window when exposed.
- `image_url` TEXT – latest product imagery reference.
- `scrape_ts` TIMESTAMP WITH TIME ZONE – snapshot time (existing field, reiterated for clarity).

### 3.6 Matching Support Tables
- `product_matching_queue` – unchanged but note new heuristics:
  - Woolworths: rely on normalised `brand_raw` dictionary (Essentials, Signature, Simple Truth).
  - Makro: parse pack strings (regex) to computed `unit_count` × inner size; prefer case GTINs when available.
  - Food Lover's: heavier weight on category context + fuzzy core name.

## 4. Matching & Normalisation Rules (Addenda)
- **Private labels**: Normalise `brand` to retailer umbrella (`Woolworths`) and store sub-brand in `product.variant` or alias metadata.
- **Bulk packs (Makro)**: Regex `^(?:(\d+)\s*[xX]\s*)?(\d+(?:\.\d+)?)\s*(ml|l|g|kg|ct)$` → compute base quantity = outer × inner; persist in canonical units.
- **Per-weight (Food Lover's)**: Set `price_mode='per_weight'`, store `price_per_uom` and `uom`; basket calculations must either accept user weight input or default assumptions.
- **Human review thresholds**: Confidence < 0.85 or conflicting GTINs auto-queue; maintain audit trail for overrides.

## 5. Migration Outline (PostgreSQL)
```sql
BEGIN;

-- 1. Extend retailer codes
ALTER TYPE retailer_code_enum ADD VALUE IF NOT EXISTS 'woolworths';
ALTER TYPE retailer_code_enum ADD VALUE IF NOT EXISTS 'foodlovers';
ALTER TYPE retailer_code_enum ADD VALUE IF NOT EXISTS 'makro';
-- If enum alteration is painful, migrate to lookup table:
-- INSERT INTO retailer (code, name) VALUES ('woolworths','Woolworths'), ...

-- 2. Product table updates
ALTER TABLE product
    ADD COLUMN IF NOT EXISTS price_mode TEXT DEFAULT 'per_item'
        CHECK (price_mode IN ('per_item','per_weight')),
    ADD COLUMN IF NOT EXISTS base_qty_value NUMERIC(10,3),
    ADD COLUMN IF NOT EXISTS base_qty_uom TEXT,
    ADD COLUMN IF NOT EXISTS unit_count INTEGER;

-- Normalise existing rows
UPDATE product
SET price_mode = COALESCE(price_mode,'per_item');

-- 3. Store metadata enrichment
ALTER TABLE store
    ADD COLUMN IF NOT EXISTS retailer_store_id TEXT,
    ADD COLUMN IF NOT EXISTS delivery_areas JSONB,
    ADD COLUMN IF NOT EXISTS services JSONB,
    ADD COLUMN IF NOT EXISTS hours JSONB,
    ADD COLUMN IF NOT EXISTS pricing_region TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_store_retailer_store_id
    ON store (retailer_id, retailer_store_id) WHERE retailer_store_id IS NOT NULL;

-- 4. Retailer item raw fields
ALTER TABLE retailer_item
    ADD COLUMN IF NOT EXISTS product_name_raw TEXT,
    ADD COLUMN IF NOT EXISTS brand_raw TEXT,
    ADD COLUMN IF NOT EXISTS pack_size_raw TEXT,
    ADD COLUMN IF NOT EXISTS unit_count_raw TEXT,
    ADD COLUMN IF NOT EXISTS availability TEXT,
    ADD COLUMN IF NOT EXISTS content_hash TEXT,
    ADD COLUMN IF NOT EXISTS retailer_sku TEXT;
ALTER TABLE retailer_item
    ADD CONSTRAINT retailer_item_availability_chk
        CHECK (availability IN ('in_stock','limited','out_of_stock','unknown'));

-- 5. Price snapshot enrichment
ALTER TABLE retailer_item_price
    ADD COLUMN IF NOT EXISTS loyalty_price NUMERIC(10,2),
    ADD COLUMN IF NOT EXISTS price_per_uom NUMERIC(10,2),
    ADD COLUMN IF NOT EXISTS promo_flag BOOLEAN,
    ADD COLUMN IF NOT EXISTS promo_type TEXT,
    ADD COLUMN IF NOT EXISTS promo_badge_raw TEXT,
    ADD COLUMN IF NOT EXISTS promo_start TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS promo_end TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE retailer_item_price
    ADD CONSTRAINT retailer_item_price_promo_type_chk
        CHECK (promo_type IS NULL OR promo_type IN ('multibuy','combo','loyalty','markdown','bulk_deal','other'));

COMMIT;
```

### Data Backfill Notes
1. Populate `retailer_store_id` using existing external IDs (if missing, derive from scrape context).
2. Derive `base_qty_value` / `base_qty_uom` / `unit_count` from canonical records; ensure unit conversions (ml ↔ L, g ↔ kg) are applied consistently.
3. For per-weight items ingested pre-migration, set `price_mode='per_weight'` and `price_per_uom=price` for those records.
4. Recompute `content_hash` for newly stored raw fields to avoid false deltas.

## 6. Implementation Checklist
- [ ] Apply schema migration in staging and regenerate ORM/TypeScript types.
- [ ] Update ingestion mappers to populate new raw fields and enums.
- [ ] Extend unit-price calculator to respect `price_mode` and `price_per_uom`.
- [ ] Validate loyalty-price toggles via feature flags per retailer.
- [ ] Regression-test matching confidence thresholds with new private-label dictionaries.
```
