/**
 * Canonical Product Registry domain types regenerated for Phase 1 schema update.
 * These interfaces align with db/migrations/20241007_0001_cpr_phase1.sql and
 * should be kept in sync with ingestion/output contracts.
 */

export type RetailerCode =
  | 'checkers'
  | 'pnp'
  | 'shoprite'
  | 'woolworths'
  | 'foodlovers'
  | 'makro';

export type PriceMode = 'per_item' | 'per_weight';

export type AvailabilityStatus = 'in_stock' | 'limited' | 'out_of_stock' | 'unknown';

export type PromoType =
  | 'multibuy'
  | 'combo'
  | 'loyalty'
  | 'markdown'
  | 'bulk_deal'
  | 'other';

export interface Store {
  id: string;
  retailerId: string;
  retailerStoreId?: string;
  name: string;
  geoPoint?: { lat: number; lng: number };
  deliveryAreas?: string[];
  services?: string[];
  hours?: Record<string, { open: string; close: string } | null>;
  pricingRegion?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  categoryId: string;
  priceMode: PriceMode;
  baseQtyValue?: number;
  baseQtyUom?: 'ml' | 'l' | 'g' | 'kg' | 'ct';
  unitCount?: number;
  notes?: string | null;
}

export interface ProductAlias {
  id: string;
  productId: string;
  aliasType: 'gtin' | 'barcode' | 'normalized_name' | 'manual_override' | 'other';
  value: string;
}

export interface RetailerItem {
  id: string;
  retailerId: string;
  productId: string;
  retailerSku?: string;
  storeId?: string;
  productNameRaw?: string;
  brandRaw?: string;
  packSizeRaw?: string;
  unitCountRaw?: string;
  availability: AvailabilityStatus;
  contentHash?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RetailerItemPrice {
  id: string;
  retailerItemId: string;
  scrapeTs: string;
  price: number;
  loyaltyPrice?: number | null;
  pricePerUom?: number | null;
  promoFlag?: boolean;
  promoType?: PromoType | null;
  promoBadgeRaw?: string | null;
  promoStart?: string | null;
  promoEnd?: string | null;
  imageUrl?: string | null;
}

export interface StoreRegion {
  id: string;
  storeId: string;
  pricingRegion: string;
  deliveryAreas?: string[];
  servicesOverride?: string[];
}

export interface CanonicalRetailerSnapshot {
  retailer: RetailerCode;
  store: Store;
  product: Product;
  retailerItem: RetailerItem;
  price: RetailerItemPrice;
}
