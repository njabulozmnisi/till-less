# Edge Case Handling Architecture

**Status:** Approved for Implementation
**Priority:** 🟡 HIGH (Sprint 1, Weeks 1-2)
**Estimated Time:** 1 day documentation + 3 days implementation
**Related PRD:** §7.1, §12 Risks & Mitigations

---

## 1. Overview

This document specifies handling for edge cases in shopping list management and optimization to ensure robust, user-friendly behavior when unexpected situations occur.

**Principle:** Fail gracefully with actionable feedback. Never silently ignore edge cases.

---

## 2. Edge Cases Reference Table

| # | Edge Case | Frequency | Severity | Handling Strategy |
|---|-----------|-----------|----------|-------------------|
| 1 | Duplicate Items | High | Low | Merge quantities + warn |
| 2 | Invalid Units | Medium | Low | Fuzzy match + default to 'count' |
| 3 | All Retailers Out of Stock | Low | High | Partial optimization + warn |
| 4 | Stale Price Data (>4h) | Medium | Medium | Trigger refresh + show timestamp |
| 5 | Extreme Quantities (>100) | Low | Low | Reject with validation error |
| 6 | Empty Shopping List | Medium | Low | Reject with actionable message |
| 7 | Substitution Needed | Medium | Medium | Find similar + flag for review |
| 8 | Travel Distance Exceeds Max | Low | Medium | Filter + show closest |

---

## 3. Detailed Edge Case Specifications

### EDGE CASE 1: Duplicate Items

**Scenario:** User enters same item multiple times (e.g., "Milk 2L" twice in CSV or UI)

**Detection:**
```typescript
function isDuplicate(item1: ShoppingListItem, item2: ShoppingListItem): boolean {
  const normalize = (name: string) => name.toLowerCase().trim();
  return normalize(item1.name) === normalize(item2.name) && item1.unit === item2.unit;
}
```

**Handling:**
1. Detect duplicates by `normalizedName + unit` key
2. Merge quantities: `quantity = sum(all duplicates)`
3. Keep first occurrence's other properties (brand, substituteAllowed, mustHave)
4. Generate warning: `"Duplicate item '{name}' detected, quantities merged (now {total})"`

**Implementation:**

```typescript
// libs/shared/src/utils/list-normalization.ts

export interface DeduplicationResult {
  deduplicated: ShoppingListItem[];
  warnings: string[];
}

export function deduplicateItems(items: ShoppingListItem[]): DeduplicationResult {
  const itemMap = new Map<string, ShoppingListItem>();
  const warnings: string[] = [];

  items.forEach((item, index) => {
    const key = `${item.name.toLowerCase().trim()}-${item.unit}`;

    if (itemMap.has(key)) {
      const existing = itemMap.get(key)!;
      existing.quantity += item.quantity;
      warnings.push(
        `Duplicate item '${item.name}' detected, quantities merged (now ${existing.quantity})`
      );
    } else {
      itemMap.set(key, { ...item });
    }
  });

  return {
    deduplicated: Array.from(itemMap.values()),
    warnings,
  };
}
```

**UI Display:**
- Show badge on item: `"Merged (2 entries)"`
- Display warning toast on list save
- Allow user to undo merge (split back to separate items)

**Test Cases:**
```typescript
describe('deduplicateItems', () => {
  it('should merge duplicate items', () => {
    const items = [
      { name: 'Milk', quantity: 2, unit: 'L' },
      { name: 'Milk', quantity: 1, unit: 'L' },
    ];

    const result = deduplicateItems(items);

    expect(result.deduplicated).toHaveLength(1);
    expect(result.deduplicated[0].quantity).toBe(3);
    expect(result.warnings).toHaveLength(1);
  });

  it('should not merge items with different units', () => {
    const items = [
      { name: 'Milk', quantity: 2, unit: 'L' },
      { name: 'Milk', quantity: 500, unit: 'ml' },
    ];

    const result = deduplicateItems(items);

    expect(result.deduplicated).toHaveLength(2);
  });
});
```

---

### EDGE CASE 2: Invalid Units

**Scenario:** User enters unrecognized unit (e.g., "handful", "pinch", "bunch")

**Recognized Units:**
- Volume: `ml`, `L`
- Weight: `g`, `kg`
- Count: `count`, `loaf`, `pack`, `dozen`

**Fuzzy Matching Aliases:**
```typescript
const UNIT_ALIASES: Record<string, string> = {
  'liter': 'L', 'litre': 'L', 'litres': 'L', 'liters': 'L',
  'gram': 'g', 'grams': 'g',
  'kilogram': 'kg', 'kilograms': 'kg', 'kgs': 'kg',
  'dozen': 'count',
  'loaves': 'loaf',
  'packs': 'pack',
};
```

**Handling:**
1. Check if unit in recognized list → accept as-is
2. Check if unit in aliases → normalize + warn
3. Else → default to 'count' + warn

**Implementation:**

```typescript
// libs/shared/src/utils/unit-normalization.ts

export interface UnitNormalizationResult {
  normalizedUnit: string;
  warning?: string;
}

const RECOGNIZED_UNITS = ['ml', 'L', 'g', 'kg', 'count', 'loaf', 'pack'];

export function normalizeUnit(unit: string): UnitNormalizationResult {
  const lowerUnit = unit.toLowerCase().trim();

  // Check if already recognized
  if (RECOGNIZED_UNITS.includes(lowerUnit)) {
    return { normalizedUnit: lowerUnit };
  }

  // Check aliases (fuzzy match)
  if (UNIT_ALIASES[lowerUnit]) {
    return {
      normalizedUnit: UNIT_ALIASES[lowerUnit],
      warning: `Normalized '${unit}' to '${UNIT_ALIASES[lowerUnit]}'`,
    };
  }

  // Unknown unit - default to 'count'
  return {
    normalizedUnit: 'count',
    warning: `Unknown unit '${unit}', assumed 'count'`,
  };
}
```

**UI Display:**
- Show warning icon next to item with tooltip
- Display all warnings in summary panel
- Allow user to manually correct unit

**Test Cases:**
```typescript
describe('normalizeUnit', () => {
  it('should accept recognized units', () => {
    expect(normalizeUnit('L')).toEqual({ normalizedUnit: 'L' });
  });

  it('should normalize aliases', () => {
    const result = normalizeUnit('liter');
    expect(result.normalizedUnit).toBe('L');
    expect(result.warning).toContain('Normalized');
  });

  it('should default unknown units to count', () => {
    const result = normalizeUnit('handful');
    expect(result.normalizedUnit).toBe('count');
    expect(result.warning).toContain('Unknown unit');
  });
});
```

---

### EDGE CASE 3: All Retailers Out of Stock

**Scenario:** Item exists in catalog but `inStock=false` for ALL retailers

**Handling:**
1. Mark item as "unfulfilled"
2. Continue optimization with available items
3. If item has `mustHave=true` → throw `BasketIncompleteException`
4. If item has `substituteAllowed=true` → attempt substitution
5. Show warning: "X items unavailable: [list]"

**Implementation:**

```typescript
// apps/backend/src/optimization/optimization.service.ts

export class OptimizationService {
  async optimizeBasket(
    listId: string,
    preferences: UserPreferences
  ): Promise<OptimizationResult> {
    const items = await this.getShoppingListItems(listId);
    const unfulfilledItems: ShoppingListItem[] = [];
    const availableItems: Array<{ item: ShoppingListItem; prices: RetailerPrice[] }> = [];

    for (const item of items) {
      const retailerPrices = await this.getRetailerPrices(item);
      const inStockRetailers = retailerPrices.filter((r) => r.inStock);

      if (inStockRetailers.length === 0) {
        // Out of stock at all retailers
        if (item.mustHave) {
          throw new BasketIncompleteException({
            message: 'Required items are out of stock',
            unfulfilledItems: [item.name],
          });
        }

        if (item.substituteAllowed) {
          const substitute = await this.findSubstitute(item);
          if (substitute) {
            availableItems.push({ item: substitute, prices: await this.getRetailerPrices(substitute) });
            continue;
          }
        }

        unfulfilledItems.push(item);
      } else {
        availableItems.push({ item, prices: inStockRetailers });
      }
    }

    // Optimize with available items
    const result = this.computeOptimal(availableItems, preferences);

    // Add warning
    if (unfulfilledItems.length > 0) {
      result.warnings.push(
        `${unfulfilledItems.length} item(s) unavailable across all retailers: ${unfulfilledItems
          .map((i) => i.name)
          .join(', ')}`
      );
    }

    result.unfulfilledItems = unfulfilledItems;
    return result;
  }
}

export class BasketIncompleteException extends HttpException {
  constructor(public readonly details: { message: string; unfulfilledItems: string[] }) {
    super(details, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}
```

**UI Display:**
- Show warning banner: "Some items are out of stock"
- List unfulfilled items with option to remove or substitute
- If `mustHave` items missing, disable "Proceed" button

---

### EDGE CASE 4: Stale Price Data (>4 hours)

**Scenario:** Price data last scraped >4 hours ago (PRD requirement)

**Detection:**
```typescript
function isPriceFresh(lastScraped: Date, maxAgeHours = 4): boolean {
  const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
  return Date.now() - lastScraped.getTime() < maxAgeMs;
}
```

**Handling:**
1. Check freshness when fetching prices
2. If stale → trigger background refresh (async)
3. Show timestamp prominently: "Prices updated 6 hours ago"
4. Optionally: prompt user to wait for refresh (5-10 min)

**Implementation:**

```typescript
// apps/backend/src/optimization/price-fetching.service.ts

export class PriceFetchingService {
  async getPricesWithFreshness(
    itemId: string,
    retailerId: string
  ): Promise<RetailerPriceWithFreshness> {
    const price = await this.prisma.retailerItem.findUnique({
      where: { retailerId_sku: { retailerId, sku: itemId } },
    });

    if (!price) {
      return { price: null, isFresh: false, lastScraped: null };
    }

    const fresh = isPriceFresh(price.lastScraped);

    if (!fresh) {
      // Trigger background refresh (don't wait)
      this.scraperQueue.add('refresh-item', {
        retailerId,
        sku: itemId,
        priority: 'high',
      });
    }

    return {
      ...price,
      isFresh: fresh,
      warning: fresh ? null : `Price updated ${formatDistanceToNow(price.lastScraped)} ago`,
    };
  }
}
```

**UI Display:**
- Show timestamp on optimization results page
- If prices stale: show warning badge + option to "Refresh Now"
- Disable "Refresh Now" if refresh already in progress

---

### EDGE CASE 5: Extreme Quantities (>100)

**Scenario:** User enters quantity >100 (e.g., "999 eggs")

**Validation:**
- **Warn:** If quantity > 50: "Large quantity detected, please confirm"
- **Reject:** If quantity > 100: "Quantity exceeds maximum (100)"
- **Exception:** If retailer is Makro (bulk buyer), allow up to 500

**Implementation:**

```typescript
// libs/shared/src/utils/quantity-validator.ts

export interface QuantityValidationResult {
  valid: boolean;
  error?: string;
  warning?: string;
}

export function validateQuantity(
  quantity: number,
  retailerId?: string
): QuantityValidationResult {
  if (quantity <= 0) {
    return { valid: false, error: 'Quantity must be a positive number' };
  }

  const maxQuantity = retailerId === 'makro' ? 500 : 100;

  if (quantity > maxQuantity) {
    return {
      valid: false,
      error: `Quantity exceeds maximum (${maxQuantity})`,
    };
  }

  if (quantity > 50) {
    return {
      valid: true,
      warning: 'Large quantity detected. Please confirm this is correct.',
    };
  }

  return { valid: true };
}
```

**UI Display:**
- Show warning dialog on quantity >50
- Block save/submit on quantity >100 (or >500 for Makro)

---

### EDGE CASE 6: Empty Shopping List

**Scenario:** User runs optimization with 0 items

**Handling:**
- **Reject:** Return HTTP 400 Bad Request
- **Message:** "Cannot optimize empty list. Please add at least 1 item."
- **UI:** Disable "Optimize" button when list is empty

**Implementation:**

```typescript
// apps/backend/src/optimization/optimization.controller.ts

@Post('run')
async runOptimization(@Body() dto: OptimizationRequestDto) {
  const list = await this.listsService.getById(dto.listId);

  if (!list || list.items.length === 0) {
    throw new BadRequestException({
      error: 'EMPTY_LIST',
      message: 'Cannot optimize empty list. Please add at least 1 item.',
    });
  }

  return this.optimizationService.optimize(dto);
}
```

**Frontend:**
```typescript
<Button
  onClick={handleOptimize}
  disabled={items.length === 0}
>
  {items.length === 0 ? 'Add items to optimize' : 'Optimize'}
</Button>
```

---

### EDGE CASE 7: Substitution Needed

**Scenario:** Preferred item not available, `substituteAllowed=true`

**Substitution Strategy:**
1. **Exact Match:** Same brand, different size → prefer closest size
2. **Category Match:** Same category, different brand → prefer similar price
3. **Fallback:** No match → flag for manual review

**Implementation:**

```typescript
// apps/backend/src/optimization/substitution.service.ts

export class SubstitutionService {
  async findSubstitute(item: ShoppingListItem): Promise<Substitution | null> {
    // Step 1: Try same brand, different size
    if (item.preferredBrand) {
      const sameBrand = await this.prisma.retailerItem.findMany({
        where: {
          name: { contains: item.preferredBrand, mode: 'insensitive' },
          category: item.category,
          inStock: true,
        },
      });

      if (sameBrand.length > 0) {
        const closest = sameBrand.sort((a, b) =>
          Math.abs(a.price - item.estimatedPrice) - Math.abs(b.price - item.estimatedPrice)
        )[0];

        return {
          originalItemId: item.id,
          suggestedItem: {
            id: closest.id,
            name: closest.name,
            price: closest.price,
            reason: `Same brand (${item.preferredBrand}), similar price`,
          },
        };
      }
    }

    // Step 2: Try same category, similar price (±20%)
    const sameCategory = await this.prisma.retailerItem.findMany({
      where: {
        category: item.category,
        price: {
          gte: item.estimatedPrice * 0.8,
          lte: item.estimatedPrice * 1.2,
        },
        inStock: true,
      },
      take: 5,
      orderBy: { price: 'asc' },
    });

    if (sameCategory.length > 0) {
      return {
        originalItemId: item.id,
        suggestedItem: {
          id: sameCategory[0].id,
          name: sameCategory[0].name,
          price: sameCategory[0].price,
          reason: 'Similar price in same category',
        },
      };
    }

    // Step 3: No match - flag for manual review
    return null;
  }
}
```

**UI Display:**
- Show substitutions in separate section
- Display: "Original → Substitute (Reason)"
- Allow user to accept/reject each substitution

---

### EDGE CASE 8: Travel Distance Exceeds Max

**Scenario:** User sets `maxTravelDistance=10km` but optimal store is 15km away

**Handling:**
1. **Filter:** Exclude retailers beyond max distance
2. **Fallback:** If ALL retailers exceed max → show closest + warning
3. **Override Prompt:** "Best store is 15km (exceeds your 10km limit). Show anyway?"

**Implementation:**

```typescript
// apps/backend/src/optimization/distance-filtering.service.ts

export class DistanceFilteringService {
  async filterRetailersByDistance(
    retailers: Retailer[],
    homeLocation: Location,
    maxDistance: number
  ): Promise<FilteredRetailersResult> {
    const withDistances = await Promise.all(
      retailers.map(async (retailer) => ({
        retailer,
        distance: await this.mapsService.getDistance(homeLocation, retailer.location),
      }))
    );

    const withinRange = withDistances.filter((r) => r.distance <= maxDistance);

    if (withinRange.length === 0) {
      // All exceed max distance - return closest with warning
      const closest = withDistances.sort((a, b) => a.distance - b.distance)[0];

      return {
        retailers: [closest.retailer],
        warning: `Closest store is ${closest.distance}km (exceeds your ${maxDistance}km limit)`,
      };
    }

    return {
      retailers: withinRange.map((r) => r.retailer),
      warning: null,
    };
  }
}
```

**UI Display:**
- Show warning banner if distance exceeded
- Provide option to adjust max distance setting
- Highlight travel distance in red if >max

---

## 4. Error Codes & Messages

### Error Code Taxonomy

| Code | HTTP Status | User Message | Technical Details |
|------|-------------|--------------|-------------------|
| `DUPLICATE_ITEMS` | 200 (warning) | "Duplicate items merged" | In validationWarnings |
| `INVALID_UNIT` | 200 (warning) | "Unknown unit normalized" | In validationWarnings |
| `OUT_OF_STOCK` | 200 (warning) | "Some items unavailable" | In warnings |
| `MUST_HAVE_UNAVAILABLE` | 422 | "Required items out of stock" | BasketIncompleteException |
| `STALE_PRICES` | 200 (warning) | "Prices may be outdated" | In warnings |
| `QUANTITY_EXCEEDED` | 400 | "Quantity too high" | Validation error |
| `EMPTY_LIST` | 400 | "Cannot optimize empty list" | Validation error |
| `DISTANCE_EXCEEDED` | 200 (warning) | "Store exceeds max distance" | In warnings |

---

## 5. Testing Strategy

### Unit Tests

Each edge case requires:
- Positive test (edge case handled correctly)
- Negative test (edge case detected)
- Boundary test (edge of threshold)

Example:
```typescript
describe('Edge Cases', () => {
  describe('Duplicate Items', () => {
    it('should merge duplicates');
    it('should generate warning');
    it('should not merge different units');
  });

  describe('Invalid Units', () => {
    it('should normalize aliases');
    it('should default unknown to count');
    it('should accept recognized units');
  });

  // ... more edge cases
});
```

### Integration Tests

Test full flow with edge cases:
```typescript
it('should optimize with duplicate items merged', async () => {
  const list = await createList([
    { name: 'Milk', quantity: 2, unit: 'L' },
    { name: 'Milk', quantity: 1, unit: 'L' },
  ]);

  const result = await optimizeBasket(list.id);

  expect(result.warnings).toContain('Duplicate item');
  // Should only have 1 Milk entry with quantity=3
});
```

---

## 6. Success Criteria

- ✅ All 8 edge cases have documented handling
- ✅ Implementation code provided for each
- ✅ User-friendly error messages defined
- ✅ UI mockups for edge case displays
- ✅ Test cases cover all scenarios
- ✅ No edge case causes silent failure
- ✅ All edge cases logged for monitoring

---

## 7. Monitoring & Alerts

Track edge case frequency:
```typescript
// Metrics
edgeCaseCounter.inc({ type: 'duplicate_items', severity: 'low' });
edgeCaseCounter.inc({ type: 'out_of_stock', severity: 'high' });

// Alerts
if (outOfStockRate > 0.3) {
  sendAlert('High out-of-stock rate (>30%)');
}
```

---

## 8. Related Documentation

- **CSV Import:** `docs/architecture/csv-import-backend.md` (Duplicate detection, unit validation)
- **Optimization Service:** `docs/architecture.md` §4.4 (Substitution logic, stock handling)
- **PRD:** `docs/prd.md` §12 (Risks & Mitigations)
