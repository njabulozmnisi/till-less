/**
 * Retailer Constants
 *
 * @deprecated This file contains hardcoded retailer constants and will be removed in v2.0.0
 *
 * **Migration Guide:**
 *
 * Instead of using hardcoded constants, retailers are now managed dynamically via the database.
 *
 * **Old Way (Deprecated):**
 * ```typescript
 * import { RETAILERS } from '@tillless/shared';
 * const items = await getRetailerItems(RETAILERS.CHECKERS);
 * ```
 *
 * **New Way (Dynamic):**
 * ```typescript
 * import { RetailerRegistryService } from '@tillless/backend';
 * const retailer = await retailerRegistry.getBySlug('checkers');
 * const items = await getRetailerItems(retailer.id);
 * ```
 *
 * **Frontend Usage:**
 * ```typescript
 * import { useGetActiveRetailersQuery } from '@/store/api/retailersApi';
 * const { data: retailers } = useGetActiveRetailersQuery();
 * ```
 *
 * **Benefits of Dynamic Retailers:**
 * - Add/remove retailers via admin UI (no code deployment)
 * - Support multiple ingestion methods per retailer
 * - Easy to extend with new retailers
 * - Database-driven configuration
 *
 * See: `docs/architecture/dynamic-retailer-plugin-architecture.md` for full details.
 */

/**
 * @deprecated Use database-driven retailers instead. This will be removed in v2.0.0
 *
 * Initial seed retailers for Phase 1.
 * These slugs match the database retailer.slug values after seeding.
 */
export const RETAILERS = {
  CHECKERS: 'checkers',
  PICK_N_PAY: 'pick-n-pay',
  SHOPRITE: 'shoprite',
  WOOLWORTHS: 'woolworths',
  MAKRO: 'makro',
} as const;

/**
 * @deprecated Use Prisma Retailer type from '@tillless/database' instead
 */
export type Retailer = typeof RETAILERS[keyof typeof RETAILERS];

/**
 * @deprecated Fetch retailer names from database using RetailerRegistryService
 *
 * Example:
 * ```typescript
 * const retailers = await retailerRegistry.getActiveRetailers();
 * const names = retailers.map(r => ({ [r.slug]: r.displayName }));
 * ```
 */
export const RETAILER_NAMES: Record<Retailer, string> = {
  [RETAILERS.CHECKERS]: 'Checkers',
  [RETAILERS.PICK_N_PAY]: 'Pick n Pay',
  [RETAILERS.SHOPRITE]: 'Shoprite',
  [RETAILERS.WOOLWORTHS]: 'Woolworths',
  [RETAILERS.MAKRO]: 'Makro',
};

/**
 * @deprecated Fetch active retailers from database
 *
 * Example:
 * ```typescript
 * const activeRetailers = await retailerRegistry.getActiveRetailers();
 * const slugs = activeRetailers.map(r => r.slug);
 * ```
 */
export const RETAILER_LIST: Retailer[] = Object.values(RETAILERS);

// ============================================================================
// NEW: Migration Helpers (Temporary - Remove in v2.0.0)
// ============================================================================

/**
 * Helper to check if a retailer slug is valid
 * This is a temporary bridge until all code uses database-driven retailers
 *
 * @deprecated Will be removed in v2.0.0 - Use database validation instead
 */
export function isValidRetailerSlug(slug: string): slug is Retailer {
  return RETAILER_LIST.includes(slug as Retailer);
}
