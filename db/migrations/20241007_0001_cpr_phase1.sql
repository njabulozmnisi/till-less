-- Migration: CPR Phase 1 Expansion
-- Description: Extend canonical product registry to support Woolworths, Makro, and Food Lover's data nuances.
-- Generated: 2024-10-07
-- Notes: Run inside a transaction on Postgres 13+.

BEGIN;

-- 1. Extend retailer enum (guarded against duplicates).
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t
        WHERE t.typname = 'retailer_code_enum'
    ) THEN
        RAISE NOTICE 'Enum retailer_code_enum missing; please create before running CPR migration.';
    ELSE
        BEGIN
            ALTER TYPE retailer_code_enum ADD VALUE IF NOT EXISTS 'woolworths';
        EXCEPTION WHEN duplicate_object THEN NULL;
        END;
        BEGIN
            ALTER TYPE retailer_code_enum ADD VALUE IF NOT EXISTS 'foodlovers';
        EXCEPTION WHEN duplicate_object THEN NULL;
        END;
        BEGIN
            ALTER TYPE retailer_code_enum ADD VALUE IF NOT EXISTS 'makro';
        EXCEPTION WHEN duplicate_object THEN NULL;
        END;
    END IF;
END;
$$;

-- 2. Product table enrichment.
ALTER TABLE product
    ADD COLUMN IF NOT EXISTS price_mode TEXT DEFAULT 'per_item'
        CHECK (price_mode IN ('per_item','per_weight')),
    ADD COLUMN IF NOT EXISTS base_qty_value NUMERIC(10,3),
    ADD COLUMN IF NOT EXISTS base_qty_uom TEXT,
    ADD COLUMN IF NOT EXISTS unit_count INTEGER;

UPDATE product
SET price_mode = COALESCE(price_mode, 'per_item');

-- 3. Store metadata enrichment.
ALTER TABLE store
    ADD COLUMN IF NOT EXISTS retailer_store_id TEXT,
    ADD COLUMN IF NOT EXISTS delivery_areas JSONB,
    ADD COLUMN IF NOT EXISTS services JSONB,
    ADD COLUMN IF NOT EXISTS hours JSONB,
    ADD COLUMN IF NOT EXISTS pricing_region TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_store_retailer_store_id
    ON store (retailer_id, retailer_store_id)
    WHERE retailer_store_id IS NOT NULL;

-- 4. Retailer item raw field capture.
ALTER TABLE retailer_item
    ADD COLUMN IF NOT EXISTS retailer_sku TEXT,
    ADD COLUMN IF NOT EXISTS product_name_raw TEXT,
    ADD COLUMN IF NOT EXISTS brand_raw TEXT,
    ADD COLUMN IF NOT EXISTS pack_size_raw TEXT,
    ADD COLUMN IF NOT EXISTS unit_count_raw TEXT,
    ADD COLUMN IF NOT EXISTS availability TEXT,
    ADD COLUMN IF NOT EXISTS content_hash TEXT;

ALTER TABLE retailer_item
    DROP CONSTRAINT IF EXISTS retailer_item_availability_chk;
ALTER TABLE retailer_item
    ADD CONSTRAINT retailer_item_availability_chk
        CHECK (availability IN ('in_stock','limited','out_of_stock','unknown'));

-- 5. Price snapshots: loyalty & promo metadata.
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
    DROP CONSTRAINT IF EXISTS retailer_item_price_promo_type_chk;
ALTER TABLE retailer_item_price
    ADD CONSTRAINT retailer_item_price_promo_type_chk
        CHECK (
            promo_type IS NULL OR
            promo_type IN ('multibuy','combo','loyalty','markdown','bulk_deal','other')
        );

COMMIT;
