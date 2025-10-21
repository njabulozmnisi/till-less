# Ubiquitous Language Glossary - TillLess

## Document Control
- **Version**: 1.0
- **Last Updated**: 2025-10-21
- **Purpose**: Define the shared vocabulary used by product, engineering, and domain experts
- **Related**: [DDD Design](./ddd-design.md)

---

## How to Use This Glossary

This glossary defines the **ubiquitous language** for TillLess - the precise terms used in conversations, code, documentation, and user interfaces. When writing code or discussing features:

✅ **DO**: Use these exact terms consistently
❌ **DON'T**: Use synonyms or informal variations

**Example**:
- ✅ Say: "The `OptimizationRun` completed successfully"
- ❌ Don't say: "The calculation finished" or "The recommendation process ended"

---

## Cross-Context Terms (Shared Kernel)

These terms are used across all bounded contexts and should have consistent meaning everywhere.

| Term | Definition | Example | Notes |
|------|------------|---------|-------|
| **Money** | A monetary amount with currency | `R 25.99 ZAR` | Always include currency; default is ZAR (South African Rand) |
| **UnitOfMeasure** | Standard units for product quantities | `ml`, `l`, `g`, `kg`, `units` | Normalized to lowercase standard abbreviations |
| **Quantity** | A numerical amount with a unit of measure | `1 L`, `500 g`, `12 units` | Always include both value and unit |
| **ProductIdentifier** | A unique code identifying a product | `GTIN: 6001087424691`, `SKU: CHK-12345` | Type (GTIN/EAN/SKU) + value |
| **RetailerId** | Unique identifier for a retailer | `checkers`, `pnp`, `woolworths` | Lowercase slug format |
| **UserId** | Unique identifier for a user | `user-550e8400-e29b-41d4-a716-446655440000` | UUID format |

---

## Basket Optimization Context 🎯

**Domain Purpose**: Recommend the best shopping strategy to save users money while respecting their time and effort constraints.

### Core Terms

| Term | Definition | Example | Synonyms to Avoid |
|------|------------|---------|-------------------|
| **OptimizationRun** | A single execution of the basket optimization algorithm for a user's shopping list | "Run #42 for user njabulo@example.com completed in 3.2s" | ~~calculation~~, ~~process~~, ~~recommendation job~~ |
| **BasketPlan** | A complete shopping strategy for a specific retailer, including items, costs, substitutions, and travel | "Checkers plan: R1,234.50 total, 3 substitutions, 5km travel, 98% list completion" | ~~shopping cart~~, ~~recommendation~~, ~~option~~ |
| **RetailerOption** | One possible basket plan for a specific retailer (before user selects one) | "System found 5 retailer options: Checkers (R1,234), PnP (R1,189), Woolworths (R1,450)..." | ~~alternative~~, ~~choice~~ |
| **Substitution** | A product replacement suggested when the exact requested item is unavailable or significantly more expensive | "Clover Full Cream Milk 1L → Parmalat Full Cream Milk 1L (R2 cheaper, brand flexible)" | ~~replacement~~, ~~alternative product~~, ~~swap~~ |
| **TravelCostFactor** | The monetary cost of traveling to a retailer, including fuel and the user's time value | "20km to Makro = R40 fuel + R40 time (30min @ R80/hour) = R80 travel cost" | ~~distance penalty~~, ~~travel expense~~ |
| **SavingsBreakdown** | Detailed comparison between baseline cost and optimized cost, broken down by savings sources | "Baseline: R1,500, Optimized: R1,234, Savings: R266 (17.7%) from promotions (R120), loyalty (R80), smart shopping (R66)" | ~~savings report~~, ~~cost comparison~~ |
| **PromotionApplication** | The act of applying a retailer promotion or loyalty discount to a basket item | "Buy 2 Get 1 Free promotion applied to Albany Bread: saved R13.99" | ~~discount applied~~, ~~promo used~~ |
| **Baseline** | The expected cost if the user shopped at their default retailer without optimization | "Your default is Checkers; baseline cost = R1,500" | ~~normal cost~~, ~~regular price~~ |
| **CompletionRate** | Percentage of shopping list items fulfilled by a basket plan | "Checkers plan: 58/60 items = 96.7% completion" | ~~fulfillment rate~~, ~~coverage~~ |
| **UnfulfilledItem** | A shopping list item that couldn't be matched to any available product at a retailer | "Unfulfilled: Organic quinoa (not available at Shoprite)" | ~~missing item~~, ~~unavailable product~~ |
| **EffortScore** | A calculated measure of how difficult it will be to execute a basket plan (distance, store count, time) | "Effort score: 7/10 (moderate) - 1 store, 12km, 45min estimated" | ~~difficulty~~, ~~convenience score~~ |

### Value Objects

| Term | Definition | Example |
|------|------------|---------|
| **UnitPrice** | Price per standardized unit (e.g., per liter, per kg) for comparison across pack sizes | `R 25.99/L` (1L milk @ R25.99), `R 23.99/L` (2L milk @ R47.98) |
| **TravelCost** | Distance + time + monetary cost of reaching a retailer | `Distance: 12km, Time: 20min, Cost: R48` |
| **Percentage** | A ratio expressed as a percentage (0-100) | `17.7%` savings, `96.7%` completion rate |

### Domain Events

| Event | When It Happens | What Happens Next |
|-------|----------------|-------------------|
| **OptimizationRequested** | User clicks "Find Best Prices" button | System begins fetching latest prices and executing optimization algorithm |
| **OptimizationCompleted** | Optimization algorithm finishes calculating all retailer options | Results are displayed to user; user can now select a plan |
| **BasketPlanConfirmed** | User selects a retailer plan to execute | Plan is saved to history; user can now export PDF or proceed to shopping |
| **SubstitutionSuggested** | Optimization finds a cheaper/available substitute for a requested item | User is notified and can accept/reject the substitution |

---

## Product Matching Context 🔗

**Domain Purpose**: Maintain data quality by accurately mapping retailer-specific products to universal canonical products.

### Core Terms

| Term | Definition | Example | Synonyms to Avoid |
|------|------------|---------|-------------------|
| **CanonicalProduct** | The universal, retailer-agnostic representation of a product | "Canonical: Clover Full Cream Milk 1 Litre (GTIN: 6001087424691)" | ~~master product~~, ~~global product~~, ~~standard product~~ |
| **RetailerItem** | A retailer-specific SKU with its own name, price, and attributes | "Checkers SKU CHK-12345: 'Clover Fresh Milk Full Cream 1000ml'" | ~~retailer SKU~~, ~~store item~~ |
| **MatchingWorkflow** | The process of linking a retailer item to a canonical product, either automatically or via human review | "Workflow #789: Matching Woolworths SKU WW-99887 to canonical product" | ~~mapping process~~, ~~product linking~~ |
| **MatchConfidence** | A 0-100 score indicating how certain the system is about a product match | "92% confidence - exact GTIN match + brand match + pack size match" | ~~certainty score~~, ~~match quality~~ |
| **ProductAlias** | An alternative name, GTIN, or identifier for a canonical product used in matching | "Alias: 'Full Cream Milk' → Canonical: 'Clover Full Cream Milk 1L'" | ~~alternative name~~, ~~synonym~~ |
| **ManualReview** | Human intervention required when automatic matching confidence is too low | "Manual review queue: 47 items with confidence < 70%" | ~~human check~~, ~~verification queue~~ |
| **MatchingRule** | A heuristic or algorithm used to determine if a retailer item matches a canonical product | "Rule: Brand exact match (30 pts) + Pack size within 10% (20 pts) + Category match (15 pts) = 65% confidence" | ~~matching algorithm~~, ~~similarity rule~~ |
| **ConfidenceThreshold** | The minimum match confidence required for auto-approval (no manual review) | "Auto-approve threshold: 85%; anything below goes to manual review" | ~~approval cutoff~~ |
| **MatchCandidate** | A potential canonical product that might match a retailer item | "Top candidates for Woolworths SKU: 1) Clover Milk 1L (92%), 2) Parmalat Milk 1L (78%)" | ~~possible match~~ |

### Value Objects

| Term | Definition | Example |
|------|------------|---------|
| **NormalizedName** | A cleaned, standardized product name used for fuzzy matching | Raw: `"Clover Fresh Milk Full Cream 1000ML"` → Normalized: `"clover milk full cream 1l"` |
| **MatchingFactor** | A specific attribute contributing to match confidence | `BrandMatch (30 pts)`, `GTINMatch (50 pts)`, `PackSizeMatch (20 pts)` |
| **ReviewStatus** | Current state of a matching workflow | `AUTO_MATCHED`, `PENDING_REVIEW`, `REVIEWED`, `REJECTED` |

### Domain Events

| Event | When It Happens | What Happens Next |
|-------|----------------|-------------------|
| **RetailerItemIngested** | New item scraped from a retailer catalog | Matching workflow is triggered to find canonical product |
| **MatchingCompleted** | High-confidence match found automatically | Retailer item is linked to canonical product; available for optimization |
| **ManualReviewRequired** | Match confidence below threshold | Item added to review queue; analyst must approve/reject |
| **ProductMappingApproved** | Human reviewer confirms a product match | Retailer item linked to canonical product; matching rules may be updated |

---

## Retailer Integration Context 📦

**Domain Purpose**: Extract, normalize, and track pricing data from retailer websites, providing fresh catalog information for optimization.

### Core Terms

| Term | Definition | Example | Synonyms to Avoid |
|------|------------|---------|-------------------|
| **RetailerCatalog** | The complete set of products available from a retailer at a specific point in time | "Checkers catalog snapshot 2025-10-21 06:30 AM: 8,472 items" | ~~product list~~, ~~inventory~~ |
| **ScrapingWorkflow** | An automated job that extracts product data from a retailer's website or API | "Temporalite workflow: `scrape-checkers-daily` runs every morning at 6 AM" | ~~data extraction~~, ~~crawler job~~ |
| **PricingSnapshot** | A time-stamped record of an item's price, loyalty price, promotion, and availability | "Clover Milk @ Checkers: R25.99 (loyalty: R23.99), promo: Buy 2 Save R5, timestamp: 2025-10-21 10:30 AM" | ~~price record~~, ~~price point~~ |
| **DeltaDetection** | Comparison of current scrape data with previous data to identify changes (price changes, new promos, stock outs) | "Delta detected: Clover Milk price changed R25.99 → R23.99, promotion added" | ~~change detection~~, ~~diff~~ |
| **ContentHash** | A SHA256 fingerprint of retailer item data used to quickly detect if anything changed | `SHA256: a3b4c5d6...` (computed from SKU + name + price + promo + availability) | ~~checksum~~, ~~data fingerprint~~ |
| **Promotion** | A temporary price reduction or special offer at a retailer | "Buy 2 Get 1 Free on Albany Bread, valid 2025-10-20 to 2025-10-25" | ~~sale~~, ~~discount~~, ~~special~~ |
| **Availability** | The stock status of a product at a retailer | `IN_STOCK`, `OUT_OF_STOCK`, `LIMITED` (low stock) | ~~stock status~~ |
| **ScrapingCadence** | The schedule for running scraping workflows (e.g., daily, weekly, hourly) | "Checkers: Daily @ 6 AM, Woolworths: 3x per day (morning, noon, evening)" | ~~scraping schedule~~ |
| **RetailerRegion** | Geographic area with specific pricing (some retailers have regional pricing) | "Makro Centurion vs Makro Cape Town may have different prices" | ~~pricing region~~ |

### Value Objects

| Term | Definition | Example |
|------|------------|---------|
| **ScrapeMetadata** | Info about a scrape run (timestamp, item count, duration, errors) | `Timestamp: 2025-10-21 06:30, Items: 8472, Duration: 12min, Errors: 3` |
| **PromotionType** | Category of promotion | `BUY_X_GET_Y`, `PERCENTAGE_OFF`, `FIXED_AMOUNT_OFF`, `BUNDLE_DEAL` |
| **DeltaStatistics** | Summary of changes detected | `Price changes: 127, New promos: 43, Stock outs: 18, New items: 5` |

### Domain Events

| Event | When It Happens | What Happens Next |
|-------|----------------|-------------------|
| **CatalogScrapingStarted** | Scraping workflow begins execution | Monitoring dashboards updated; logs start recording progress |
| **ItemPriceUpdated** | Price change detected for an item | New pricing snapshot created; Product Matching context notified; Basket Optimization results may be invalidated |
| **PromotionDetected** | New promotion found for an item | Promotion record created; users may be notified if item is on their wishlist |
| **ScrapingFailed** | Scraping workflow encounters an error | Alert sent to ops team; retry scheduled; users see stale data warning |

---

## Shopping List Context 📝

**Domain Purpose**: Allow users to create, manage, and reuse shopping lists with item preferences and substitution rules.

### Core Terms

| Term | Definition | Example | Synonyms to Avoid |
|------|------------|---------|-------------------|
| **ShoppingList** | A collection of items a user wants to purchase | "My Monthly Groceries List: 45 items, created 2025-10-01, last used 2025-10-15" | ~~cart~~, ~~basket~~ (those are for basket plans) |
| **ListItem** | A single item on a shopping list with quantity, brand preference, and substitution tolerance | "Clover Milk 1L, qty: 2, brand: flexible, substitution: any milk OK" | ~~product~~, ~~item~~ (too generic) |
| **SubstitutionTolerance** | How flexible a user is about replacing a specific item | `STRICT` (exact match only), `FLEXIBLE` (same category/brand OK), `ANY` (anything works) | ~~replacement flexibility~~ |
| **PreferredBrand** | User's preferred brand for an item (may be ignored if significantly more expensive) | "Preferred: Clover, but will accept Parmalat if R5+ cheaper" | ~~brand preference~~ |
| **ListTemplate** | A reusable shopping list (e.g., monthly groceries, party supplies) | "Template: 'Monthly Groceries' - clone and modify each month" | ~~saved list~~ |
| **ItemPriority** | How important an item is to the user's shopping trip | `MUST_HAVE` (critical), `PREFERRED` (would like), `OPTIONAL` (nice to have) | ~~importance level~~ |

### Domain Events

| Event | When It Happens | What Happens Next |
|-------|----------------|-------------------|
| **ShoppingListCreated** | User creates a new list | Empty list ready for items to be added |
| **ItemAddedToList** | User adds an item to a list | Item saved; can now be used in optimization |
| **ItemRemovedFromList** | User deletes an item from a list | Item removed; optimization results invalidated |
| **ListCloned** | User duplicates an existing list | New list created with same items; user can modify independently |

---

## User Preferences Context 👤

**Domain Purpose**: Manage user profile data including loyalty cards, location, and shopping effort constraints.

### Core Terms

| Term | Definition | Example | Synonyms to Avoid |
|------|------------|---------|-------------------|
| **UserProfile** | Complete user account with personal preferences and constraints | "Profile for njabulo@example.com: Home in Centurion, 3 loyalty cards, max 2 stores, R80/hour time value" | ~~user account~~, ~~settings~~ |
| **LoyaltyCard** | A retailer loyalty program membership that unlocks special pricing | "Checkers Xtra Savings: Card #4532-XXXX-1234, active" | ~~rewards card~~, ~~membership~~ |
| **HomeLocation** | User's primary location (used for travel distance calculations) | "Lat: -25.8653, Lng: 28.1809 (Centurion, Gauteng)" | ~~address~~, ~~coordinates~~ |
| **EffortTolerance** | How much effort (distance, time, store count) a user is willing to expend to save money | "Max 2 stores, max 15km per store, willing to spend 1 hour total" | ~~shopping constraints~~ |
| **ValueOfTime** | How much the user's time is worth per hour (used in travel cost calculations) | "R80/hour - 30min travel = R40 time cost" | ~~hourly rate~~, ~~time value~~ |
| **PreferredRetailer** | User's default retailer when no optimization is run | "Default: Checkers Hypermarket Centurion" | ~~favorite store~~ |
| **MaxStores** | Maximum number of different stores user is willing to visit for one shopping trip | "Max 2 stores - willing to split shopping between Makro and Woolworths" | ~~store limit~~ |
| **MaxDistance** | Maximum distance (in km) user is willing to travel to a single store | "Max 15km - won't drive to Makro if it's 20km away" | ~~distance limit~~ |

### Domain Events

| Event | When It Happens | What Happens Next |
|-------|----------------|-------------------|
| **ProfileCreated** | New user signs up | Empty profile created; user prompted to add preferences |
| **LoyaltyCardAdded** | User links a loyalty card | Card saved; optimizations can now apply loyalty pricing |
| **PreferencesUpdated** | User changes location, effort tolerance, or time value | Optimization results may change; cached results invalidated |

---

## Identity & Access Context 🔐

**Domain Purpose**: Authenticate users and control access to features (minimal - mostly BetterAuth integration).

### Core Terms

| Term | Definition | Example |
|------|------------|---------|
| **Session** | Authenticated user session with JWT token | "Session for user-123, expires 2025-10-21 18:00" |
| **RefreshToken** | Long-lived token used to obtain new access tokens | "Refresh token valid for 30 days" |
| **Role** | User permission level | `USER`, `ADMIN`, `ANALYST` (for product matching review) |

---

## Receipt Management Context 🧾

**Domain Purpose**: Handle receipt upload and reconciliation for tracking actual spending vs. predicted spending.

### Core Terms

| Term | Definition | Example |
|------|------------|---------|
| **ReceiptUpload** | A photo or scan of a physical receipt | "Receipt from Checkers 2025-10-15, uploaded on 2025-10-16" |
| **ActualTotal** | What the user actually paid at the till | "Predicted: R1,234.50, Actual: R1,198.23 (R36 better than expected!)" |
| **Reconciliation** | Comparison of predicted basket cost vs. actual till total | "Reconciliation for Run #42: 96% accurate, R36 variance" |

---

## Naming Conventions

### Aggregates
- PascalCase
- Noun (singular)
- Examples: `OptimizationRun`, `CanonicalProduct`, `ShoppingList`

### Entities
- PascalCase
- Noun (singular)
- Examples: `BasketPlan`, `RetailerOption`, `ListItem`

### Value Objects
- PascalCase
- Noun (singular)
- Examples: `Money`, `UnitPrice`, `MatchConfidence`

### Domain Events
- PascalCase
- Past tense verb + object
- Examples: `OptimizationCompleted`, `ItemPriceUpdated`, `ProductMappingApproved`

### Domain Services
- PascalCase
- Noun describing the service
- Examples: `OptimizationEngine`, `ProductMatcher`, `TravelCostCalculator`

### Repositories
- PascalCase
- `{Aggregate}Repository` format
- Examples: `OptimizationRunRepository`, `CanonicalProductRepository`

---

## Usage Guidelines

### In Code
```typescript
// ✅ CORRECT - uses ubiquitous language
class OptimizationRun {
  selectPlan(retailerId: RetailerId): void {
    const option = this.retailerOptions.find(r => r.retailerId.equals(retailerId));
    this.selectedPlan = option.basketPlan;
    this.apply(new BasketPlanConfirmed(this.optimizationId, this.selectedPlan));
  }
}

// ❌ INCORRECT - uses informal language
class RecommendationProcess {
  pickStore(storeId: string): void {
    const choice = this.storeOptions.find(s => s.id === storeId);
    this.chosenOption = choice.shoppingCart;
    this.addEvent(new UserPickedStore(this.id, this.chosenOption));
  }
}
```

### In Documentation
```markdown
✅ CORRECT:
"The OptimizationRun aggregate calculates RetailerOptions for each retailer,
considering TravelCostFactors and available Promotions."

❌ INCORRECT:
"The recommendation system figures out the best stores for shopping,
looking at how far away they are and what deals they have."
```

### In User Interfaces
```
✅ CORRECT:
"Your Basket Plan for Checkers: R1,234.50 total"
"3 Substitutions suggested"

❌ INCORRECT:
"Your shopping cart total: R1,234.50"
"3 items replaced"
```

---

## Glossary Maintenance

### When to Add Terms
- New feature introduces a new domain concept
- Team frequently uses a term not in the glossary
- Confusion arises about what a term means

### When to Update Terms
- Definition is inaccurate or incomplete
- Better example is available
- Synonyms need to be added to "avoid" list

### Process
1. Propose change in team meeting or PR review
2. Update this document
3. Search codebase for outdated usage
4. Update code, tests, and docs to use new definition

---

## Quick Reference Card

**Print this section and put it on your desk:**

### Top 10 Most Important Terms

1. **OptimizationRun** - The process of finding the best shopping plan
2. **BasketPlan** - A complete shopping strategy for one retailer
3. **CanonicalProduct** - Universal product representation (all retailers)
4. **RetailerItem** - Retailer-specific product SKU
5. **Substitution** - Acceptable product replacement
6. **TravelCostFactor** - Cost of getting to a store (fuel + time)
7. **MatchingWorkflow** - Linking retailer item to canonical product
8. **PricingSnapshot** - Time-stamped price/promo record
9. **ShoppingList** - User's list of items to buy
10. **SavingsBreakdown** - Detailed comparison of costs

---

**Document Owner**: Winston (Architect)
**Last Reviewed**: 2025-10-21
**Next Review**: 2025-11-21
