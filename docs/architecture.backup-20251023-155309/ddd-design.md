# Domain-Driven Design (DDD) Architecture for TillLess

## Document Control
- **Version**: 1.0
- **Last Updated**: 2025-10-21
- **Status**: Approved - Implementation Pending
- **Audience**: Engineering Team, Product Team, Technical Leadership

---

## 1. Executive Summary

TillLess is transitioning from a component-based architecture to a **Domain-Driven Design (DDD)** architecture. This strategic shift aligns technical boundaries with business capabilities, ensuring the system remains maintainable and scalable as complexity grows.

### Why DDD?

**Business Alignment**
- Shared language between product, engineering, and domain experts
- Clear ownership of business rules within bounded contexts
- Easier onboarding for new team members

**Technical Benefits**
- Domain logic isolated from infrastructure concerns
- Pure domain models that are highly testable
- Independent context evolution (change scraping without touching optimization)
- Natural path to microservices if needed

**Current Pain Points DDD Solves**
- Business logic scattered across NestJS services and controllers
- Tight coupling between data models (Prisma) and business rules
- Unclear boundaries between subsystems (scraping, matching, optimization)
- Difficulty testing complex business scenarios without database

---

## 2. Strategic Domain Identification

### 2.1 Bounded Contexts Overview

We've identified **7 bounded contexts** organized by strategic importance:

```
┌─────────────────────────────────────────────────────────────┐
│                    CORE DOMAINS                              │
│  (Competitive Advantage - Invest Heavily)                    │
├─────────────────────────────────────────────────────────────┤
│  🎯 Basket Optimization Context                              │
│     - Multi-retailer basket optimization                     │
│     - Substitution logic                                     │
│     - Cost calculation with travel/loyalty factors           │
│                                                              │
│  🔗 Product Matching Context                                 │
│     - Canonical product mapping                              │
│     - Fuzzy matching algorithms                              │
│     - Human review queue                                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 SUPPORTING DOMAINS                           │
│  (Essential but not differentiating)                         │
├─────────────────────────────────────────────────────────────┤
│  📦 Retailer Integration Context                             │
│     - Web scraping orchestration                             │
│     - Price snapshot storage                                 │
│     - Delta detection                                        │
│                                                              │
│  📝 Shopping List Context                                    │
│     - List CRUD operations                                   │
│     - Item management                                        │
│     - Substitution preferences                               │
│                                                              │
│  👤 User Preferences Context                                 │
│     - Profile management                                     │
│     - Loyalty cards                                          │
│     - Location and effort tolerances                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  GENERIC DOMAINS                             │
│  (Commodity - use off-the-shelf solutions)                   │
├─────────────────────────────────────────────────────────────┤
│  🔐 Identity & Access Context                                │
│     - BetterAuth integration                                 │
│     - Minimal custom code                                    │
│                                                              │
│  🧾 Receipt Management Context                               │
│     - Supabase Storage integration                           │
│     - Simple CRUD service                                    │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Context Boundaries Decision Matrix

| Context | Core/Support/Generic | Invest Level | Complexity | Change Frequency |
|---------|---------------------|--------------|------------|------------------|
| Basket Optimization | **Core** | High | High | Medium |
| Product Matching | **Core** | High | Very High | Medium |
| Retailer Integration | Support | Medium | Medium | High |
| Shopping List | Support | Low | Low | Low |
| User Preferences | Support | Low | Low | Medium |
| Identity & Access | Generic | Minimal | Low | Low |
| Receipt Management | Generic | Minimal | Low | Low |

---

## 3. Core Domain Models

### 3.1 Basket Optimization Context 🎯

**Purpose**: The heart of TillLess - delivers personalized shopping recommendations that save users money while respecting their constraints.

#### Ubiquitous Language

| Term | Definition | Example |
|------|------------|---------|
| **OptimizationRun** | A single execution of the basket optimization algorithm for a user's shopping list | "Run 42 for user njabulo@example.com" |
| **BasketPlan** | A recommended shopping strategy for a specific retailer, including items, costs, and substitutions | "Checkers plan: R1,234.50 total, 3 substitutions, 5km travel" |
| **RetailerOption** | One possible basket plan for a specific retailer | "Pick n Pay option: R1,189.00 but missing 2 items" |
| **Substitution** | A product replacement suggested when the exact item is unavailable or expensive | "Clover milk → Parmalat milk (R2 cheaper, same size)" |
| **TravelCostFactor** | The monetary cost of traveling to a retailer based on distance and user's value-of-time | "20km to Makro = R80 in fuel + time" |
| **SavingsBreakdown** | Detailed comparison between baseline cost and optimized cost | "Baseline: R1,500, Optimized: R1,234, Savings: 17.7%" |
| **PromotionApplication** | The act of applying a retailer promotion or loyalty discount to a basket item | "Buy 2 Get 1 Free applied to bread" |

#### Aggregates

**OptimizationRun** (Aggregate Root)
```typescript
class OptimizationRun {
  // Identity
  private optimizationId: OptimizationId;

  // Snapshots (immutable copies at time of optimization)
  private shoppingListSnapshot: ShoppingListSnapshot;
  private userPreferencesSnapshot: UserPreferencesSnapshot;

  // Results
  private retailerOptions: Map<RetailerId, RetailerOption>;
  private selectedPlan?: BasketPlan;

  // Metadata
  private optimizationMetadata: OptimizationMetadata;
  private status: OptimizationStatus; // PENDING | RUNNING | COMPLETED | FAILED

  // Factory Method
  static create(params: {
    userId: UserId;
    shoppingList: ShoppingList;
    preferences: UserPreferences;
  }): OptimizationRun;

  // Business Methods
  executeOptimization(
    catalogPrices: Map<RetailerId, ProductPricing[]>,
    optimizationEngine: OptimizationEngine
  ): void;

  selectPlan(retailerId: RetailerId): void;

  calculateSavings(): SavingsBreakdown;

  // Invariants
  private ensureOnlyOnePlanSelected(): void;
  private ensureOptimizationCompleted(): void;
}
```

**BasketPlan** (Entity within OptimizationRun)
```typescript
class BasketPlan {
  private readonly retailer: Retailer;
  private readonly totalCost: Money;
  private readonly fulfilledItems: BasketItem[];
  private readonly unfulfilledItems: UnfulfilledItem[];
  private readonly substitutions: Substitution[];
  private readonly appliedPromotions: PromotionApplication[];
  private readonly travelCost: TravelCost;
  private readonly assumptions: Assumption[];

  calculateSavingsVsBaseline(baseline: Money): SavingsBreakdown;

  getCompletionRate(): Percentage;

  hasUnfulfilledCriticalItems(): boolean;

  estimateTotalEffort(): EffortScore;
}
```

#### Value Objects

```typescript
class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: Currency = Currency.ZAR
  ) {
    if (amount < 0) throw new DomainException('Money cannot be negative');
  }

  add(other: Money): Money;
  subtract(other: Money): Money;
  multiply(factor: number): Money;
  isGreaterThan(other: Money): boolean;
  equals(other: Money): boolean;
}

class UnitPrice {
  constructor(
    public readonly price: Money,
    public readonly quantity: number,
    public readonly unit: UnitOfMeasure
  ) {}

  compareWith(other: UnitPrice): number;
  normalize(): UnitPrice; // Convert to standard unit (e.g., ml → L)
}

class TravelCost {
  constructor(
    public readonly distance: Distance,
    public readonly travelTime: Duration,
    public readonly monetaryCost: Money
  ) {}

  static calculate(
    userLocation: Location,
    storeLocation: Location,
    valueOfTime: Money // per hour
  ): TravelCost;
}

class SavingsBreakdown {
  constructor(
    public readonly baselineCost: Money,
    public readonly optimizedCost: Money,
    public readonly absoluteSavings: Money,
    public readonly percentageSavings: Percentage,
    public readonly savingsSources: SavingsSource[]
  ) {}
}
```

#### Domain Services

```typescript
@Injectable()
class OptimizationEngine {
  /**
   * Core algorithm: finds the best basket plan across all retailers
   * considering price, availability, promotions, loyalty, and travel cost
   */
  optimize(
    shoppingList: ShoppingListSnapshot,
    preferences: UserPreferencesSnapshot,
    catalogPrices: Map<RetailerId, ProductPricing[]>
  ): Map<RetailerId, RetailerOption>;
}

@Injectable()
class SubstitutionMatcher {
  /**
   * Finds acceptable product substitutions when exact match is unavailable
   * or significantly more expensive at a given retailer
   */
  findSubstitutes(
    requestedItem: ShoppingListItem,
    availableProducts: CanonicalProduct[],
    tolerance: SubstitutionTolerance
  ): Substitution[];
}

@Injectable()
class PromotionApplicator {
  /**
   * Applies retailer promotions and loyalty discounts to basket items
   * Handles complex promo rules (Buy X Get Y, Bundle deals, Tiered discounts)
   */
  applyPromotions(
    basketItems: BasketItem[],
    availablePromotions: Promotion[],
    loyaltyCards: LoyaltyCard[]
  ): PromotionApplication[];
}

@Injectable()
class TravelCostCalculator {
  /**
   * Computes the total cost of traveling to a retailer
   * including fuel, time value, and effort factors
   */
  calculate(
    userLocation: Location,
    storeLocation: Location,
    preferences: TravelPreferences
  ): TravelCost;
}
```

#### Domain Events

```typescript
class OptimizationRequested extends DomainEvent {
  constructor(
    public readonly optimizationId: OptimizationId,
    public readonly userId: UserId,
    public readonly shoppingListId: ShoppingListId,
    public readonly requestedAt: Date
  ) { super(); }
}

class OptimizationCompleted extends DomainEvent {
  constructor(
    public readonly optimizationId: OptimizationId,
    public readonly retailerOptionsCount: number,
    public readonly bestRetailer: RetailerId,
    public readonly estimatedSavings: Money,
    public readonly completedAt: Date
  ) { super(); }
}

class BasketPlanConfirmed extends DomainEvent {
  constructor(
    public readonly optimizationId: OptimizationId,
    public readonly selectedRetailer: RetailerId,
    public readonly totalCost: Money,
    public readonly confirmedAt: Date
  ) { super(); }
}

class SubstitutionSuggested extends DomainEvent {
  constructor(
    public readonly optimizationId: OptimizationId,
    public readonly originalProduct: ProductId,
    public readonly substituteProduct: ProductId,
    public readonly reason: string,
    public readonly priceDifference: Money
  ) { super(); }
}
```

---

### 3.2 Product Matching Context 🔗

**Purpose**: Maintains data quality by creating and managing the canonical product registry, matching retailer-specific items to universal products.

#### Ubiquitous Language

| Term | Definition | Example |
|------|------------|---------|
| **CanonicalProduct** | The universal representation of a product across all retailers | "Clover Full Cream Milk 1L" |
| **RetailerItem** | A retailer-specific SKU that may map to a canonical product | "Checkers SKU 12345: Clover Fresh Milk 1000ml" |
| **MatchingWorkflow** | The process of linking a retailer item to a canonical product | "Workflow #789: Match Woolworths item to canonical product" |
| **MatchConfidence** | A 0-100 score indicating how certain the system is about a product match | "92% confidence - exact GTIN match" |
| **ProductAlias** | An alternative name, GTIN, or identifier for a canonical product | "Alias: 'Full Cream Milk' → Canonical: 'Clover Full Cream Milk 1L'" |
| **ManualReview** | Human intervention required when automatic matching confidence is low | "Review queue: 47 items below 70% confidence threshold" |
| **MatchingRule** | A heuristic or algorithm used to determine product similarity | "Rule: Brand match + Pack size within 10% + Category match" |

#### Aggregates

**CanonicalProduct** (Aggregate Root)
```typescript
class CanonicalProduct {
  // Identity
  private readonly productId: ProductId;

  // Core attributes
  private name: ProductName;
  private brand: Brand;
  private category: Category;
  private baseQuantity: Quantity; // e.g., 1L, 500g
  private priceMode: PriceMode; // ITEM | WEIGHT

  // Aliases for matching
  private aliases: ProductAlias[];

  // Matching statistics
  private matchingStats: MatchingStatistics;

  // Factory Method
  static create(params: {
    name: string;
    brand: string;
    category: Category;
    quantity: Quantity;
    priceMode: PriceMode;
  }): CanonicalProduct;

  // Business Methods
  addAlias(alias: ProductAlias): void;

  removeAlias(aliasId: AliasId): void;

  updateMatchingStatistics(newMatch: MatchResult): void;

  matchesRetailerItem(item: RetailerItemSnapshot, rules: MatchingRule[]): MatchConfidence;

  // Invariants
  private ensureUniqueAliases(): void;
  private ensureValidQuantityForPriceMode(): void;
}
```

**MatchingWorkflow** (Aggregate Root)
```typescript
class MatchingWorkflow {
  // Identity
  private readonly workflowId: WorkflowId;

  // Input
  private readonly retailerItem: RetailerItemSnapshot;

  // Candidates
  private matchCandidates: MatchCandidate[];

  // Result
  private finalMatch?: CanonicalProductId;
  private confidence: MatchConfidence;
  private reviewStatus: ReviewStatus; // AUTO_MATCHED | PENDING_REVIEW | REVIEWED | REJECTED

  // Audit
  private matchingMethod: MatchingMethod;
  private reviewedBy?: UserId;
  private reviewedAt?: Date;

  // Factory Method
  static create(retailerItem: RetailerItemSnapshot): MatchingWorkflow;

  // Business Methods
  addCandidate(candidate: MatchCandidate): void;

  autoMatch(threshold: MatchConfidence): void;

  requireManualReview(reason: string): void;

  approveMatch(canonicalProductId: CanonicalProductId, reviewerId: UserId): void;

  rejectMatch(reason: string, reviewerId: UserId): void;

  // Invariants
  private ensureOnlyOneApprovedMatch(): void;
  private ensureConfidenceAboveThreshold(threshold: MatchConfidence): void;
}
```

#### Value Objects

```typescript
class MatchConfidence {
  constructor(
    public readonly score: number, // 0-100
    public readonly factors: MatchingFactor[],
    public readonly method: MatchingMethod
  ) {
    if (score < 0 || score > 100) throw new DomainException('Invalid confidence score');
  }

  isAboveThreshold(threshold: number): boolean;

  isPerfectMatch(): boolean;

  requiresManualReview(): boolean;
}

class ProductIdentifier {
  constructor(
    public readonly type: IdentifierType, // GTIN | EAN | SKU
    public readonly value: string
  ) {}

  equals(other: ProductIdentifier): boolean;
}

class NormalizedName {
  constructor(public readonly value: string) {}

  static fromRawName(raw: string): NormalizedName {
    // Remove special chars, normalize spacing, lowercase, etc.
  }

  similarity(other: NormalizedName): number; // 0-100
}
```

#### Domain Services

```typescript
@Injectable()
class ProductMatcher {
  /**
   * Executes matching algorithms to find canonical products
   * that correspond to a retailer item
   */
  match(
    retailerItem: RetailerItemSnapshot,
    canonicalProducts: CanonicalProduct[],
    rules: MatchingRule[]
  ): MatchCandidate[];
}

@Injectable()
class NameNormalizer {
  /**
   * Cleans and standardizes product names for matching
   * Handles pack size parsing, brand extraction, etc.
   */
  normalize(rawName: string): NormalizedProductName;

  extractPackSize(name: string): Quantity | null;

  extractBrand(name: string): string | null;
}

@Injectable()
class ConfidenceScorer {
  /**
   * Evaluates the quality of a product match based on multiple factors
   * (name similarity, GTIN match, brand match, pack size, category)
   */
  score(
    retailerItem: RetailerItemSnapshot,
    canonicalProduct: CanonicalProduct
  ): MatchConfidence;
}
```

#### Domain Events

```typescript
class RetailerItemIngested extends DomainEvent {
  constructor(
    public readonly retailerId: RetailerId,
    public readonly itemSku: string,
    public readonly ingestedAt: Date
  ) { super(); }
}

class MatchingCompleted extends DomainEvent {
  constructor(
    public readonly workflowId: WorkflowId,
    public readonly retailerItemId: RetailerItemId,
    public readonly canonicalProductId: CanonicalProductId,
    public readonly confidence: MatchConfidence,
    public readonly completedAt: Date
  ) { super(); }
}

class ManualReviewRequired extends DomainEvent {
  constructor(
    public readonly workflowId: WorkflowId,
    public readonly retailerItemId: RetailerItemId,
    public readonly reason: string,
    public readonly topCandidates: MatchCandidate[],
    public readonly requestedAt: Date
  ) { super(); }
}

class ProductMappingApproved extends DomainEvent {
  constructor(
    public readonly workflowId: WorkflowId,
    public readonly approvedBy: UserId,
    public readonly canonicalProductId: CanonicalProductId,
    public readonly approvedAt: Date
  ) { super(); }
}
```

---

### 3.3 Retailer Integration Context 📦

**Purpose**: Manages the extraction, normalization, and storage of retailer catalog data, providing the raw pricing information used by optimization.

#### Ubiquitous Language

| Term | Definition | Example |
|------|------------|---------|
| **RetailerCatalog** | The complete set of products available from a retailer at a point in time | "Checkers catalog snapshot 2025-10-21" |
| **ScrapingWorkflow** | An automated job that extracts product data from a retailer's website/API | "Temporalite workflow: scrape-checkers-daily" |
| **PricingSnapshot** | A time-stamped record of an item's price, loyalty price, and promotion | "Clover Milk @ R25.99 on 2025-10-21 10:30 AM" |
| **DeltaDetection** | Comparison of current scrape results with previous data to identify changes | "Price changed: R25.99 → R23.99 (promo detected)" |
| **ContentHash** | A fingerprint of product data used to detect changes without full comparison | "SHA256 hash of SKU 12345 data" |
| **Promotion** | A temporary price reduction or special offer | "Buy 2 Get 1 Free on bread, valid until 2025-10-25" |
| **Availability** | The stock status of a product at a retailer | "IN_STOCK | OUT_OF_STOCK | LIMITED" |

#### Aggregates

**RetailerCatalog** (Aggregate Root)
```typescript
class RetailerCatalog {
  // Identity
  private readonly catalogId: CatalogId;
  private readonly retailerId: RetailerId;

  // Version
  private readonly catalogVersion: CatalogVersion;
  private readonly scrapedAt: Date;

  // Items
  private items: Map<string, RetailerItem>;

  // Metadata
  private scrapingMetadata: ScrapingMetadata;
  private deltaStats: DeltaStatistics;

  // Factory Method
  static create(
    retailerId: RetailerId,
    items: RetailerItem[],
    metadata: ScrapingMetadata
  ): RetailerCatalog;

  // Business Methods
  addItem(item: RetailerItem): void;

  updateItem(sku: string, updatedItem: RetailerItem): void;

  detectDeltas(previousCatalog: RetailerCatalog): DeltaReport;

  getItemCount(): number;

  getItemsBySku(skus: string[]): RetailerItem[];
}
```

**PricingSnapshot** (Aggregate Root)
```typescript
class PricingSnapshot {
  // Identity
  private readonly snapshotId: SnapshotId;
  private readonly retailerItemId: RetailerItemId;

  // Timestamp
  private readonly scrapeTimestamp: Date;

  // Pricing
  private readonly price: Money;
  private readonly loyaltyPrice?: Money;
  private readonly pricePerUnit: UnitPrice;

  // Promotion
  private readonly promotion?: Promotion;

  // Availability
  private readonly availability: Availability;

  // Image
  private readonly imageUrl?: string;

  // Factory Method
  static create(params: {
    retailerItemId: RetailerItemId;
    price: Money;
    loyaltyPrice?: Money;
    promotion?: Promotion;
    availability: Availability;
  }): PricingSnapshot;

  // Business Methods
  hasPromotion(): boolean;

  hasLoyaltyDiscount(): boolean;

  isAvailable(): boolean;

  getEffectivePrice(hasLoyaltyCard: boolean): Money;

  compareTo(other: PricingSnapshot): PriceComparison;
}
```

#### Domain Events

```typescript
class CatalogScrapingStarted extends DomainEvent {
  constructor(
    public readonly retailerId: RetailerId,
    public readonly startedAt: Date,
    public readonly expectedItemCount: number
  ) { super(); }
}

class ItemPriceUpdated extends DomainEvent {
  constructor(
    public readonly retailerItemId: RetailerItemId,
    public readonly previousPrice: Money,
    public readonly newPrice: Money,
    public readonly updatedAt: Date
  ) { super(); }
}

class PromotionDetected extends DomainEvent {
  constructor(
    public readonly retailerItemId: RetailerItemId,
    public readonly promotionType: PromotionType,
    public readonly discountAmount: Money,
    public readonly validUntil: Date
  ) { super(); }
}

class ScrapingFailed extends DomainEvent {
  constructor(
    public readonly retailerId: RetailerId,
    public readonly error: string,
    public readonly failedAt: Date
  ) { super(); }
}
```

---

## 4. Context Mapping & Integration

### 4.1 Context Relationship Diagram

```
┌─────────────────────────────────────────────────────────────┐
│           User Preferences Context (U)                       │
│                                                              │
│   UserProfile, LoyaltyCard, ShoppingPreferences             │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        │ U/D (Upstream/Downstream)
                        │ User provides preferences
                        ↓
┌─────────────────────────────────────────────────────────────┐
│          Shopping List Context (U)                           │
│                                                              │
│   ShoppingList, ListItem, SubstitutionTolerance             │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        │ U/D
                        │ List provides items to optimize
                        ↓
┌─────────────────────────────────────────────────────────────┐
│       Basket Optimization Context (CORE)                     │
│                                                              │
│   OptimizationRun, BasketPlan, RetailerOption               │
│                                                              │
└──────────┬────────────────────────────────────┬─────────────┘
           │                                    │
           │ ACL (Anti-Corruption Layer)       │ ACL
           │ Consume canonical products         │ Consume pricing
           ↓                                    ↓
┌──────────────────────────────┐    ┌──────────────────────────┐
│  Product Matching Context    │    │ Retailer Integration Ctx │
│  (CORE)                      │←───┤ (SUPPORT)                │
│                              │ PL │                          │
│  CanonicalProduct,           │    │ RetailerCatalog,         │
│  MatchingWorkflow            │    │ PricingSnapshot          │
│                              │    │                          │
└──────────────────────────────┘    └──────────────────────────┘
       Published Language (PL):
       ProductMapped event →
```

**Legend:**
- **U/D** = Upstream/Downstream (Customer-Supplier relationship)
- **ACL** = Anti-Corruption Layer (translation boundary)
- **PL** = Published Language (shared events/contracts)

### 4.2 Integration Patterns

#### Anti-Corruption Layers (ACL)

**Purpose**: Protect core domains from external data models and changes.

**Example: Basket Optimization → Product Matching ACL**

```typescript
// basket-optimization/infrastructure/acl/product-matching.acl.ts

/**
 * Translates Product Matching domain models into
 * Basket Optimization-specific models
 */
@Injectable()
export class ProductMatchingACL {
  constructor(
    private readonly productMatchingClient: ProductMatchingClient
  ) {}

  async getOptimizationProducts(
    productIds: CanonicalProductId[]
  ): Promise<OptimizationProduct[]> {
    // Fetch from Product Matching context
    const canonicalProducts = await this.productMatchingClient
      .getProductsByIds(productIds);

    // Translate to Optimization-specific model
    return canonicalProducts.map(cp =>
      OptimizationProduct.fromCanonical(cp)
    );
  }
}
```

**Example: Basket Optimization → Retailer Integration ACL**

```typescript
// basket-optimization/infrastructure/acl/retailer-integration.acl.ts

@Injectable()
export class RetailerIntegrationACL {
  constructor(
    private readonly pricingClient: PricingClient
  ) {}

  async getLatestPricing(
    retailerId: RetailerId,
    productIds: CanonicalProductId[]
  ): Promise<Map<CanonicalProductId, OptimizationPriceData>> {
    // Fetch pricing snapshots
    const snapshots = await this.pricingClient
      .getLatestSnapshots(retailerId, productIds);

    // Translate to Optimization-specific pricing model
    const pricingMap = new Map();
    for (const snapshot of snapshots) {
      const priceData = OptimizationPriceData.fromSnapshot(snapshot);
      pricingMap.set(snapshot.canonicalProductId, priceData);
    }

    return pricingMap;
  }
}
```

#### Shared Kernel

**Purpose**: Share common value objects and types across all contexts.

**Location**: `src/contexts/shared-kernel/`

**Shared Value Objects:**
```typescript
// shared-kernel/value-objects/money.vo.ts
export class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: Currency = Currency.ZAR
  ) {}
  // ... methods
}

// shared-kernel/value-objects/unit-of-measure.vo.ts
export enum UnitOfMeasure {
  MILLILITERS = 'ml',
  LITERS = 'l',
  GRAMS = 'g',
  KILOGRAMS = 'kg',
  UNITS = 'units'
}

// shared-kernel/value-objects/product-identifier.vo.ts
export class ProductIdentifier {
  constructor(
    public readonly type: IdentifierType,
    public readonly value: string
  ) {}
}
```

**Usage Guidelines:**
- Keep shared kernel **minimal** (only truly shared concepts)
- Version carefully (changes affect all contexts)
- Document breaking changes in shared kernel changelog

#### Published Language (Events)

**Purpose**: Asynchronous communication between contexts via domain events.

**Event Bus**: Postgres-backed `pg-boss` for reliable event delivery

**Key Inter-Context Events:**

```typescript
// Retailer Integration → Product Matching
class RetailerItemIngested extends DomainEvent {
  // Product Matching listens and starts matching workflow
}

// Product Matching → Basket Optimization
class ProductMappingCompleted extends DomainEvent {
  // Optimization can now use this product in recommendations
}

// Retailer Integration → Basket Optimization
class ItemPriceUpdated extends DomainEvent {
  // Optimization may invalidate cached results
}
```

**Event Handler Example:**

```typescript
// product-matching/application/event-handlers/retailer-item-ingested.handler.ts

@Injectable()
export class RetailerItemIngestedHandler {
  constructor(
    private readonly matchingService: MatchingApplicationService
  ) {}

  @OnEvent(RetailerItemIngested.name)
  async handle(event: RetailerItemIngested): Promise<void> {
    // Trigger matching workflow for newly ingested item
    await this.matchingService.startMatchingWorkflow({
      retailerId: event.retailerId,
      itemSku: event.itemSku
    });
  }
}
```

---

## 5. Implementation Strategy

### 5.1 Migration Approach: Strangler Fig Pattern

We'll gradually refactor the existing codebase to DDD, allowing the old and new architectures to coexist during transition.

**Phase 1: Foundation (Weeks 1-2)**
1. ✅ Create DDD architecture document (this document)
2. ✅ Create ubiquitous language glossary
3. Set up bounded context directory structure
4. Identify and map existing code to contexts
5. Document context integration points

**Phase 2: Extract Core Domains (Weeks 3-6)**
1. **Product Matching Context** (Weeks 3-4)
   - Extract `CanonicalProduct` aggregate
   - Implement `MatchingWorkflow` aggregate
   - Build ACL from existing Prisma models
   - Add domain events and repository
   - Write comprehensive domain tests

2. **Basket Optimization Context** (Weeks 5-6)
   - Extract `OptimizationRun` aggregate
   - Implement `BasketPlan` entity and value objects
   - Extract domain services (engine, matcher, calculator)
   - Add ACLs to Product Matching and Retailer Integration
   - Write domain logic tests

**Phase 3: Supporting Domains (Weeks 7-10)**
1. **Retailer Integration Context** (Week 7)
   - Extract `RetailerCatalog` and `PricingSnapshot` aggregates
   - Implement domain events for price changes
   - Build repository over existing Prisma schema

2. **Shopping List & User Preferences Contexts** (Week 8)
   - Extract `ShoppingList` and `UserProfile` aggregates
   - Simple CRUD with domain events

3. **Integration & Events** (Weeks 9-10)
   - Wire up domain events across contexts
   - Implement event handlers for cross-context workflows
   - Add observability for event flows

**Phase 4: Refinement (Weeks 11-12)**
1. Add CQRS read models for optimization results
2. Optimize repository queries
3. Add domain event sourcing (optional)
4. Performance testing and tuning
5. Documentation updates

### 5.2 Directory Structure

```
src/
  contexts/
    shared-kernel/
      value-objects/
        money.vo.ts
        unit-of-measure.vo.ts
        product-identifier.vo.ts
        quantity.vo.ts
      types/
        common.types.ts
      utils/
        domain-exception.ts

    basket-optimization/
      domain/
        aggregates/
          optimization-run.aggregate.ts
          optimization-run.spec.ts
        entities/
          basket-plan.entity.ts
          retailer-option.entity.ts
          substitution.entity.ts
        value-objects/
          unit-price.vo.ts
          savings-breakdown.vo.ts
          travel-cost.vo.ts
        services/
          optimization-engine.service.ts
          substitution-matcher.service.ts
          promotion-applicator.service.ts
          travel-cost-calculator.service.ts
        events/
          optimization-requested.event.ts
          optimization-completed.event.ts
          basket-plan-confirmed.event.ts
        repositories/
          optimization-run.repository.interface.ts

      application/
        commands/
          run-optimization.command.ts
          select-basket-plan.command.ts
        queries/
          get-optimization-result.query.ts
          get-optimization-history.query.ts
        handlers/
          optimization.command-handler.ts
          optimization.query-handler.ts
        services/
          optimization-application.service.ts

      infrastructure/
        repositories/
          prisma-optimization-run.repository.ts
        persistence/
          optimization.prisma (context-specific schema)
        acl/
          product-matching.acl.ts
          retailer-integration.acl.ts

      presentation/
        controllers/
          optimization.controller.ts
        dtos/
          run-optimization.dto.ts
          optimization-result.dto.ts

    product-matching/
      domain/
        aggregates/
          canonical-product.aggregate.ts
          matching-workflow.aggregate.ts
        entities/
          product-alias.entity.ts
          match-candidate.entity.ts
        value-objects/
          match-confidence.vo.ts
          normalized-name.vo.ts
        services/
          product-matcher.service.ts
          name-normalizer.service.ts
          confidence-scorer.service.ts
        events/
          retailer-item-ingested.event.ts
          matching-completed.event.ts
          manual-review-required.event.ts
        repositories/
          canonical-product.repository.interface.ts
          matching-workflow.repository.interface.ts

      application/
        commands/
          create-canonical-product.command.ts
          approve-product-match.command.ts
        queries/
          get-matching-queue.query.ts
        handlers/
          [... handlers ...]
        event-handlers/
          retailer-item-ingested.handler.ts

      infrastructure/
        repositories/
          prisma-canonical-product.repository.ts
          prisma-matching-workflow.repository.ts
        acl/
          retailer-integration.acl.ts

      presentation/
        controllers/
          product-matching.controller.ts
          matching-review.controller.ts

    retailer-integration/
      domain/
        aggregates/
          retailer-catalog.aggregate.ts
          pricing-snapshot.aggregate.ts
        entities/
          retailer-item.entity.ts
          promotion.entity.ts
        value-objects/
          availability.vo.ts
          content-hash.vo.ts
        services/
          delta-detector.service.ts
          price-normalizer.service.ts
        events/
          catalog-scraping-started.event.ts
          item-price-updated.event.ts
          promotion-detected.event.ts
        repositories/
          retailer-catalog.repository.interface.ts

      application/
        commands/
          ingest-catalog.command.ts
        handlers/
          [... handlers ...]

      infrastructure/
        repositories/
          prisma-catalog.repository.ts
        scrapers/
          [... retailer-specific scrapers ...]

      presentation/
        controllers/
          catalog-admin.controller.ts

    shopping-list/
      [... similar structure ...]

    user-preferences/
      [... similar structure ...]

    identity-access/
      [... minimal - mostly BetterAuth integration ...]

    receipt-management/
      [... minimal - Supabase Storage wrapper ...]
```

### 5.3 Key Technical Decisions

#### Repository Pattern

```typescript
// Interface in domain layer
export interface IOptimizationRunRepository {
  save(run: OptimizationRun): Promise<void>;
  findById(id: OptimizationId): Promise<OptimizationRun | null>;
  findByUserId(userId: UserId, limit: number): Promise<OptimizationRun[]>;
}

// Implementation in infrastructure layer
@Injectable()
export class PrismaOptimizationRunRepository implements IOptimizationRunRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBus
  ) {}

  async save(run: OptimizationRun): Promise<void> {
    const data = this.toPersistence(run);
    await this.prisma.optimizationRun.upsert({
      where: { id: run.id.value },
      update: data,
      create: data
    });

    // Publish domain events after persistence
    const events = run.getUncommittedEvents();
    await this.eventBus.publishAll(events);
    run.clearEvents();
  }

  async findById(id: OptimizationId): Promise<OptimizationRun | null> {
    const data = await this.prisma.optimizationRun.findUnique({
      where: { id: id.value },
      include: { retailerOptions: true, selectedPlan: true }
    });

    return data ? this.toDomain(data) : null;
  }

  private toPersistence(run: OptimizationRun): any {
    // Map domain model to Prisma schema
  }

  private toDomain(data: any): OptimizationRun {
    // Reconstruct domain aggregate from Prisma data
  }
}
```

#### Aggregate Root Base Class

```typescript
export abstract class AggregateRoot<T extends ValueObject> {
  protected readonly id: T;
  private uncommittedEvents: DomainEvent[] = [];

  protected constructor(id: T) {
    this.id = id;
  }

  protected apply(event: DomainEvent): void {
    this.uncommittedEvents.push(event);
    this.handleEvent(event);
  }

  protected abstract handleEvent(event: DomainEvent): void;

  public getUncommittedEvents(): DomainEvent[] {
    return [...this.uncommittedEvents];
  }

  public clearEvents(): void {
    this.uncommittedEvents = [];
  }

  public getId(): T {
    return this.id;
  }
}
```

#### Domain Event Base Class

```typescript
export abstract class DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventId: string;

  constructor() {
    this.occurredOn = new Date();
    this.eventId = uuidv4();
  }

  abstract get eventName(): string;
}
```

---

## 6. Testing Strategy

### 6.1 Domain Model Tests (Unit Tests)

**Goal**: 100% coverage of domain logic without any infrastructure dependencies

```typescript
// basket-optimization/domain/aggregates/optimization-run.spec.ts

describe('OptimizationRun Aggregate', () => {
  describe('creation', () => {
    it('should create optimization run with valid parameters', () => {
      const run = OptimizationRun.create({
        userId: UserId.create(),
        shoppingList: createMockShoppingList(),
        preferences: createMockPreferences()
      });

      expect(run.status).toBe(OptimizationStatus.PENDING);
      expect(run.getUncommittedEvents()).toHaveLength(1);
      expect(run.getUncommittedEvents()[0]).toBeInstanceOf(OptimizationRequested);
    });
  });

  describe('selectPlan', () => {
    it('should select a valid retailer plan', () => {
      const run = createOptimizationRunWithResults();
      const retailerId = RetailerId.fromString('checkers');

      run.selectPlan(retailerId);

      expect(run.selectedPlan).toBeDefined();
      expect(run.selectedPlan.retailer.id).toEqual(retailerId);
    });

    it('should throw when selecting invalid retailer', () => {
      const run = createOptimizationRunWithResults();
      const invalidId = RetailerId.fromString('invalid');

      expect(() => run.selectPlan(invalidId))
        .toThrow(DomainException);
    });

    it('should emit BasketPlanConfirmed event', () => {
      const run = createOptimizationRunWithResults();
      run.selectPlan(RetailerId.fromString('checkers'));

      const events = run.getUncommittedEvents();
      const confirmedEvent = events.find(e => e instanceof BasketPlanConfirmed);
      expect(confirmedEvent).toBeDefined();
    });
  });

  describe('calculateSavings', () => {
    it('should calculate savings correctly', () => {
      const run = createOptimizationRunWithResults();
      run.selectPlan(RetailerId.fromString('checkers'));

      const savings = run.calculateSavings();

      expect(savings.absoluteSavings.amount).toBeGreaterThan(0);
      expect(savings.percentageSavings.value).toBeGreaterThan(0);
    });

    it('should throw when no plan selected', () => {
      const run = createOptimizationRunWithResults();

      expect(() => run.calculateSavings())
        .toThrow(DomainException);
    });
  });
});
```

### 6.2 Domain Service Tests

```typescript
describe('SubstitutionMatcher Service', () => {
  let matcher: SubstitutionMatcher;

  beforeEach(() => {
    matcher = new SubstitutionMatcher();
  });

  it('should find exact brand match as best substitute', () => {
    const requestedItem = createRequestedItem('Clover Milk 1L');
    const availableProducts = [
      createProduct('Clover Milk 1L'),
      createProduct('Parmalat Milk 1L')
    ];
    const tolerance = SubstitutionTolerance.STRICT;

    const substitutes = matcher.findSubstitutes(
      requestedItem,
      availableProducts,
      tolerance
    );

    expect(substitutes[0].product.name).toBe('Clover Milk 1L');
  });

  it('should respect substitution tolerance level', () => {
    const requestedItem = createRequestedItem('Clover Milk 1L');
    const availableProducts = [
      createProduct('Parmalat Milk 1L'),
      createProduct('Woolworths Milk 1L')
    ];

    const strictSubstitutes = matcher.findSubstitutes(
      requestedItem,
      availableProducts,
      SubstitutionTolerance.STRICT
    );
    expect(strictSubstitutes).toHaveLength(0);

    const flexibleSubstitutes = matcher.findSubstitutes(
      requestedItem,
      availableProducts,
      SubstitutionTolerance.FLEXIBLE
    );
    expect(flexibleSubstitutes.length).toBeGreaterThan(0);
  });
});
```

### 6.3 Integration Tests (Application Layer)

```typescript
describe('RunOptimizationCommandHandler (Integration)', () => {
  let handler: RunOptimizationCommandHandler;
  let repository: IOptimizationRunRepository;

  beforeEach(() => {
    // Use in-memory repository for testing
    repository = new InMemoryOptimizationRunRepository();
    handler = new RunOptimizationCommandHandler(
      repository,
      mockOptimizationEngine,
      mockProductMatchingACL,
      mockRetailerIntegrationACL
    );
  });

  it('should execute optimization and persist results', async () => {
    const command = new RunOptimizationCommand({
      userId: 'user-123',
      shoppingListId: 'list-456'
    });

    const result = await handler.execute(command);

    expect(result.optimizationId).toBeDefined();
    expect(result.retailerOptionsCount).toBeGreaterThan(0);

    // Verify persistence
    const saved = await repository.findById(
      OptimizationId.fromString(result.optimizationId)
    );
    expect(saved).toBeDefined();
  });
});
```

---

## 7. Benefits & Trade-offs

### 7.1 Benefits

**Business Value**
- ✅ Shared language between product and engineering teams
- ✅ Faster feature development (clear domain boundaries)
- ✅ Easier onboarding for new developers

**Technical Quality**
- ✅ **Highly testable**: Domain models test without database/framework
- ✅ **Maintainable**: Business logic isolated from infrastructure
- ✅ **Evolvable**: Change database, framework, or API without touching domain
- ✅ **Scalable**: Contexts can become microservices if needed

**Developer Experience**
- ✅ Clear ownership (teams can own specific contexts)
- ✅ Reduced cognitive load (smaller, focused modules)
- ✅ Confidence in changes (domain tests catch business rule violations)

### 7.2 Trade-offs

**Complexity**
- ⚠️ More classes and files (aggregates, value objects, repositories)
- ⚠️ Steeper learning curve for team members new to DDD
- ⚠️ Need to maintain mapping between domain models and Prisma schemas

**Performance Considerations**
- ⚠️ Potential overhead from domain model → persistence model mapping
- ⚠️ Event publishing adds latency to writes
- ✅ **Mitigation**: Use read models (CQRS) for queries; optimize repositories

**Migration Effort**
- ⚠️ 8-12 weeks to fully refactor existing codebase
- ⚠️ Need to maintain old and new code during transition
- ✅ **Mitigation**: Strangler Fig pattern allows gradual migration

---

## 8. Success Criteria

### Code Quality Metrics
- **Domain Coverage**: 80%+ of business logic in `domain/` directories
- **Test Coverage**: 90%+ unit test coverage for domain models
- **Dependency Direction**: Infrastructure depends on domain (never reverse)

### Developer Experience
- **Onboarding Time**: New developers locate and modify business rules within 1 day
- **Change Isolation**: Feature changes touch 1-2 contexts max (not entire codebase)
- **Build Time**: No degradation vs. current architecture

### Business Impact
- **Feature Velocity**: 20% faster story completion after migration complete
- **Bug Rate**: 30% reduction in domain logic bugs (caught by domain tests)
- **Flexibility**: Ability to add new retailer without touching optimization code

---

## 9. References & Resources

### DDD Books
- **Domain-Driven Design** by Eric Evans (Blue Book)
- **Implementing Domain-Driven Design** by Vaughn Vernon (Red Book)
- **Domain-Driven Design Distilled** by Vaughn Vernon (Quick start)

### Online Resources
- [DDD Community](https://dddcommunity.org/)
- [Martin Fowler's DDD articles](https://martinfowler.com/tags/domain%20driven%20design.html)
- [Microsoft DDD Guide](https://docs.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/)

### TillLess-Specific Docs
- [Product Requirements (PRD)](../prd/index.md)
- [Component Breakdown](./04-4-component-breakdown.md)
- [Technology Stack](./06-6-technology-stack.md)
- [Canonical Product Registry](../canonical-product-registry.md)

---

## 10. Next Steps

### Immediate Actions (This Week)
1. ✅ Review and approve this DDD design document
2. Create ubiquitous language glossary document
3. Create context mapping diagram (visual)
4. Schedule DDD workshop with team (2-hour session)

### Short-Term (Next 2 Weeks)
1. Set up bounded context directory structure in codebase
2. Start Product Matching context refactoring (highest priority)
3. Write first domain model tests for `CanonicalProduct` aggregate
4. Document ACL patterns with concrete examples

### Medium-Term (Next 4-8 Weeks)
1. Complete Product Matching context migration
2. Complete Basket Optimization context migration
3. Wire up domain events between contexts
4. Add CQRS read models for optimization results

### Long-Term (2-3 Months)
1. Complete all supporting contexts
2. Remove old code (complete Strangler Fig migration)
3. Retrospective and optimization
4. Document lessons learned

---

**Document Status**: ✅ Approved for Implementation
**Next Review Date**: 2025-11-04 (2 weeks after implementation start)
**Owner**: Winston (Architect)
**Stakeholders**: Engineering Team, Product Manager
