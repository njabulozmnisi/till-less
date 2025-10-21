# Context Mapping & Integration Patterns - TillLess DDD

## Document Control
- **Version**: 1.0
- **Last Updated**: 2025-10-21
- **Purpose**: Define how bounded contexts integrate and communicate
- **Related**: [DDD Design](./ddd-design.md), [Ubiquitous Language](./ddd-ubiquitous-language.md)

---

## 1. Introduction to Context Mapping

In Domain-Driven Design, **bounded contexts** must integrate to deliver end-to-end functionality. Context mapping defines:
- **Relationships** between contexts (who depends on whom)
- **Integration patterns** (how data flows between contexts)
- **Translation boundaries** (where model transformation occurs)
- **Communication mechanisms** (sync/async, events/API calls)

This document provides the complete integration blueprint for TillLess bounded contexts.

---

## 2. Context Map Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                  USER-FACING CONTEXTS                                │
│  (Start here - user initiates actions in these contexts)             │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌──────────────────────┐
│  User Preferences    │         │   Shopping List      │
│  Context             │         │   Context            │
│  ─────────────       │         │   ─────────────      │
│  👤 UserProfile      │         │   📝 ShoppingList    │
│  💳 LoyaltyCard      │         │   📦 ListItem        │
│  📍 Location         │         │   🔄 SubstitutionTol │
└────────┬─────────────┘         └────────┬─────────────┘
         │                                │
         │ U/D: Provides preferences     │ U/D: Provides items
         │ (Upstream/Downstream)          │
         └────────────┬───────────────────┘
                      │
                      ↓
         ┌────────────────────────────────────┐
         │   Basket Optimization Context      │
         │   ─────────────────────────        │
         │   🎯 CORE DOMAIN                   │
         │   OptimizationRun, BasketPlan      │
         │   RetailerOption, Substitution     │
         └──────┬──────────────┬──────────────┘
                │              │
                │              │
      ACL ←─────┘              └─────→ ACL
      (Anti-Corruption Layer)         (Anti-Corruption Layer)
                │                      │
                ↓                      ↓
    ┌───────────────────────┐  ┌─────────────────────────┐
    │ Product Matching      │  │ Retailer Integration    │
    │ Context               │  │ Context                 │
    │ ─────────────         │  │ ─────────────           │
    │ 🔗 CORE DOMAIN        │  │ 📦 SUPPORT DOMAIN       │
    │ CanonicalProduct      │  │ RetailerCatalog         │
    │ MatchingWorkflow      │  │ PricingSnapshot         │
    └───────────────────────┘  └─────────────────────────┘
                │                      │
                │                      │
                │  PL: ProductMapped   │
                │  (Published Language)│
                └──────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                  GENERIC CONTEXTS                                    │
│  (Use off-the-shelf solutions)                                       │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌──────────────────────┐
│  Identity & Access   │         │  Receipt Management  │
│  Context             │         │  Context             │
│  ─────────────       │         │  ─────────────       │
│  🔐 BetterAuth       │         │  🧾 ReceiptUpload    │
│  Session, Role       │         │  Reconciliation      │
└──────────────────────┘         └──────────────────────┘
```

---

## 3. Context Relationships

### 3.1 Relationship Types (DDD Patterns)

| Pattern | Description | When to Use | Example in TillLess |
|---------|-------------|-------------|---------------------|
| **Upstream/Downstream (U/D)** | One context (upstream) provides data/services that another (downstream) consumes | Clear supplier-consumer relationship | Shopping List (U) → Basket Optimization (D) |
| **Anti-Corruption Layer (ACL)** | Translation layer protecting a context from external model changes | Consuming from unstable or complex external models | Basket Optimization uses ACL to consume Product Matching |
| **Shared Kernel (SK)** | Small set of models/value objects shared across contexts | Truly universal concepts with stable definitions | `Money`, `UnitOfMeasure`, `ProductIdentifier` |
| **Published Language (PL)** | Well-defined contract (events/DTOs) published by one context for others to consume | Multiple contexts need to react to events | `ItemPriceUpdated` event published by Retailer Integration |
| **Customer-Supplier** | Supplier provides service; customer requirements influence supplier roadmap | Collaborative teams with negotiated contracts | Product Matching (Supplier) ↔ Basket Optimization (Customer) |
| **Conformist** | Downstream context fully conforms to upstream model (no translation) | Upstream model is stable and fits downstream needs | Receipt Management conforms to User Preferences (user ID) |

### 3.2 Context Relationship Matrix

| Context A | Context B | Relationship | Pattern | Sync/Async | Notes |
|-----------|-----------|--------------|---------|------------|-------|
| User Preferences | Basket Optimization | A → B (U/D) | Upstream/Downstream | Sync (API) | Preferences fetched at optimization start |
| Shopping List | Basket Optimization | A → B (U/D) | Upstream/Downstream | Sync (API) | List fetched at optimization start |
| Basket Optimization | Product Matching | A ← B (U/D + ACL) | Customer-Supplier + ACL | Sync (API) | ACL translates canonical products |
| Basket Optimization | Retailer Integration | A ← B (U/D + ACL) | Customer-Supplier + ACL | Sync (API) | ACL translates pricing snapshots |
| Product Matching | Retailer Integration | A ← B (PL) | Published Language | Async (Events) | Retailer Integration publishes `RetailerItemIngested` |
| Retailer Integration | Product Matching | A → B (PL) | Published Language | Async (Events) | Product Matching publishes `ProductMappingCompleted` |
| All Contexts | Shared Kernel | Shared | Shared Kernel | N/A | Common value objects (`Money`, `UnitOfMeasure`) |
| Identity & Access | All Contexts | A → B | Conformist | Sync (Middleware) | All contexts use `UserId` from IAM |

---

## 4. Integration Mechanisms

### 4.1 Synchronous Integration (API Calls)

**Use When:**
- Immediate response required
- Data is needed to complete current operation
- Strong consistency required

**Example: Basket Optimization fetches Shopping List**

```typescript
// basket-optimization/application/commands/run-optimization.command-handler.ts

@Injectable()
export class RunOptimizationCommandHandler {
  constructor(
    private readonly shoppingListClient: ShoppingListClient, // API client
    private readonly optimizationService: OptimizationService
  ) {}

  async execute(command: RunOptimizationCommand): Promise<OptimizationResult> {
    // Synchronous fetch - optimization cannot proceed without list
    const shoppingList = await this.shoppingListClient
      .getShoppingList(command.shoppingListId);

    // Execute optimization with fetched data
    const run = await this.optimizationService.optimize(shoppingList);

    return run.toResult();
  }
}
```

**Technology**: NestJS HTTP module, internal API calls (REST/GraphQL)

---

### 4.2 Asynchronous Integration (Domain Events)

**Use When:**
- No immediate response needed
- Multiple contexts need to react to same event
- Eventual consistency is acceptable

**Example: Retailer Integration publishes ItemPriceUpdated**

```typescript
// retailer-integration/domain/aggregates/pricing-snapshot.aggregate.ts

export class PricingSnapshot extends AggregateRoot {
  updatePrice(newPrice: Money): void {
    if (!this.price.equals(newPrice)) {
      const oldPrice = this.price;
      this.price = newPrice;

      // Publish domain event
      this.apply(new ItemPriceUpdated(
        this.retailerItemId,
        oldPrice,
        newPrice,
        new Date()
      ));
    }
  }
}
```

```typescript
// basket-optimization/application/event-handlers/item-price-updated.handler.ts

@Injectable()
export class ItemPriceUpdatedHandler {
  constructor(
    private readonly optimizationCacheService: OptimizationCacheService
  ) {}

  @OnEvent(ItemPriceUpdated.name)
  async handle(event: ItemPriceUpdated): Promise<void> {
    // Invalidate cached optimization results that used old price
    await this.optimizationCacheService.invalidateByRetailerItem(
      event.retailerItemId
    );

    // Optionally: notify users who have this item on their lists
  }
}
```

**Technology**: NestJS EventEmitter2 (in-process) + pg-boss (persistent queue for cross-context events)

---

## 5. Anti-Corruption Layers (ACL)

### 5.1 Purpose of ACL

An **Anti-Corruption Layer** protects a bounded context from:
- **External model changes** - Upstream context changes don't break downstream
- **Leaky abstractions** - Downstream doesn't adopt upstream concepts that don't belong
- **Tight coupling** - Contexts can evolve independently

### 5.2 ACL Pattern Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Basket Optimization Context (Protected by ACL)              │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Domain Layer (Pure Business Logic)                │     │
│  │  ─────────────────────────────────                 │     │
│  │  OptimizationRun knows about:                       │     │
│  │  - OptimizationProduct (internal model)            │     │
│  │  - OptimizationPriceData (internal model)          │     │
│  │                                                     │     │
│  │  Does NOT know about:                               │     │
│  │  - CanonicalProduct (Product Matching model) ❌    │     │
│  │  - PricingSnapshot (Retailer Integration model) ❌ │     │
│  └────────────────────────────────────────────────────┘     │
│                          ↑                                   │
│                          │ Uses internal models              │
│                          │                                   │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Application Layer (Use Cases)                     │     │
│  │  ─────────────────────────────                     │     │
│  │  Calls ACL to fetch data                           │     │
│  └────────────────────────────────────────────────────┘     │
│                          ↑                                   │
│                          │                                   │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Infrastructure Layer (ACL Implementation)         │     │
│  │  ─────────────────────────────────────────         │     │
│  │  ProductMatchingACL: translates                    │     │
│  │    CanonicalProduct → OptimizationProduct          │     │
│  │                                                     │     │
│  │  RetailerIntegrationACL: translates                │     │
│  │    PricingSnapshot → OptimizationPriceData         │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                          ↓
          External API Calls to Other Contexts
```

### 5.3 ACL Implementation Example

#### Product Matching ACL

**Purpose**: Translate `CanonicalProduct` (Product Matching's model) into `OptimizationProduct` (Basket Optimization's model)

```typescript
// basket-optimization/infrastructure/acl/product-matching.acl.ts

/**
 * Anti-Corruption Layer for Product Matching Context
 *
 * Protects Basket Optimization domain from Product Matching model changes.
 * Translates external CanonicalProduct into internal OptimizationProduct.
 */
@Injectable()
export class ProductMatchingACL {
  constructor(
    private readonly productMatchingClient: ProductMatchingClient
  ) {}

  /**
   * Fetch products needed for optimization, translated to internal model
   */
  async getProductsForOptimization(
    productIds: CanonicalProductId[]
  ): Promise<Map<CanonicalProductId, OptimizationProduct>> {
    // Call external context API
    const canonicalProducts = await this.productMatchingClient
      .getProductsByIds(productIds);

    // Translate to internal model
    const productMap = new Map<CanonicalProductId, OptimizationProduct>();

    for (const canonical of canonicalProducts) {
      const optimizationProduct = this.translateToOptimizationProduct(canonical);
      productMap.set(canonical.id, optimizationProduct);
    }

    return productMap;
  }

  /**
   * Translation logic: CanonicalProduct → OptimizationProduct
   */
  private translateToOptimizationProduct(
    canonical: CanonicalProduct
  ): OptimizationProduct {
    return OptimizationProduct.create({
      canonicalId: canonical.id,
      name: canonical.name,
      brand: canonical.brand,
      category: this.translateCategory(canonical.category),
      baseQuantity: new Quantity(
        canonical.baseQuantity.value,
        canonical.baseQuantity.unit
      ),
      priceMode: canonical.priceMode,
      // Only include fields relevant to optimization
      // Drop Product Matching specific fields (aliases, matching stats, etc.)
    });
  }

  /**
   * Category translation (Product Matching taxonomy → Optimization taxonomy)
   */
  private translateCategory(externalCategory: string): OptimizationCategory {
    // Map external category codes to internal optimization categories
    const categoryMap: Record<string, OptimizationCategory> = {
      'dairy-milk': OptimizationCategory.DAIRY,
      'dairy-cheese': OptimizationCategory.DAIRY,
      'bakery-bread': OptimizationCategory.BAKERY,
      'produce-fresh': OptimizationCategory.FRESH_PRODUCE,
      // ... more mappings
    };

    return categoryMap[externalCategory] ?? OptimizationCategory.OTHER;
  }
}
```

#### Retailer Integration ACL

**Purpose**: Translate `PricingSnapshot` (Retailer Integration's model) into `OptimizationPriceData` (Basket Optimization's model)

```typescript
// basket-optimization/infrastructure/acl/retailer-integration.acl.ts

/**
 * Anti-Corruption Layer for Retailer Integration Context
 *
 * Protects Basket Optimization from Retailer Integration model changes.
 * Translates pricing snapshots into optimization-ready price data.
 */
@Injectable()
export class RetailerIntegrationACL {
  constructor(
    private readonly pricingClient: PricingClient
  ) {}

  /**
   * Fetch latest pricing for products at a retailer
   */
  async getLatestPricing(
    retailerId: RetailerId,
    productIds: CanonicalProductId[]
  ): Promise<Map<CanonicalProductId, OptimizationPriceData>> {
    // Call external context API
    const snapshots = await this.pricingClient
      .getLatestSnapshots(retailerId, productIds);

    // Translate to internal model
    const pricingMap = new Map<CanonicalProductId, OptimizationPriceData>();

    for (const snapshot of snapshots) {
      const priceData = this.translateToPriceData(snapshot);
      pricingMap.set(snapshot.canonicalProductId, priceData);
    }

    return pricingMap;
  }

  /**
   * Translation logic: PricingSnapshot → OptimizationPriceData
   */
  private translateToPriceData(
    snapshot: PricingSnapshot
  ): OptimizationPriceData {
    return OptimizationPriceData.create({
      canonicalProductId: snapshot.canonicalProductId,
      retailerId: snapshot.retailerId,
      price: snapshot.price,
      loyaltyPrice: snapshot.loyaltyPrice,
      effectivePrice: this.calculateEffectivePrice(snapshot),
      promotion: snapshot.promotion
        ? this.translatePromotion(snapshot.promotion)
        : undefined,
      availability: snapshot.availability,
      // Drop retailer-specific fields not needed for optimization
    });
  }

  /**
   * Calculate the best price considering loyalty and promotions
   */
  private calculateEffectivePrice(snapshot: PricingSnapshot): Money {
    // Business logic for determining which price applies
    if (snapshot.promotion && snapshot.promotion.isActive()) {
      return snapshot.promotion.getDiscountedPrice(snapshot.price);
    }

    if (snapshot.loyaltyPrice) {
      return snapshot.loyaltyPrice;
    }

    return snapshot.price;
  }

  /**
   * Translate promotion to optimization-specific format
   */
  private translatePromotion(
    externalPromo: RetailerPromotion
  ): OptimizationPromotion {
    // Simplify complex retailer promotion rules to what optimization needs
    return OptimizationPromotion.create({
      type: this.translatePromotionType(externalPromo.type),
      discountValue: externalPromo.discountValue,
      validUntil: externalPromo.validUntil,
      requiresLoyaltyCard: externalPromo.requiresLoyaltyCard,
    });
  }
}
```

### 5.4 Benefits of ACL

| Benefit | Description | Example |
|---------|-------------|---------|
| **Isolation** | Basket Optimization doesn't break when Product Matching changes its `CanonicalProduct` model | Product Matching adds new field `organicCertified` - Basket Optimization unaffected |
| **Clarity** | Optimization domain models only contain fields relevant to optimization | `OptimizationProduct` has no `aliases` or `matchingStats` (Product Matching concerns) |
| **Testing** | Can test ACL translation logic independently | Test: CanonicalProduct with complex category tree → simplified OptimizationCategory |
| **Evolution** | Contexts can use different data models that suit their needs | Product Matching uses hierarchical categories; Optimization uses flat categories |

---

## 6. Shared Kernel

### 6.1 What Belongs in Shared Kernel

**Criteria for Shared Kernel inclusion:**
- ✅ Used by **3+ contexts**
- ✅ **Stable definition** (rarely changes)
- ✅ **Universal concept** (same meaning everywhere)
- ❌ **NOT business logic** (value objects only, no aggregates/services)

### 6.2 Shared Kernel Contents

**Location**: `src/contexts/shared-kernel/`

```
shared-kernel/
  value-objects/
    money.vo.ts              # Monetary amounts (R 25.99 ZAR)
    unit-of-measure.vo.ts    # Units (ml, l, g, kg, units)
    quantity.vo.ts           # Amount + unit (1 L, 500 g)
    product-identifier.vo.ts # GTIN, EAN, SKU
    location.vo.ts           # Lat/lng coordinates
    percentage.vo.ts         # 0-100% values

  types/
    common.types.ts          # TypeScript type aliases (UUID, DateISO)

  utils/
    domain-exception.ts      # Base exception for domain errors
    value-object.base.ts     # Abstract base class for value objects

  enums/
    currency.enum.ts         # ZAR, USD, EUR
    retailer-id.enum.ts      # checkers, pnp, woolworths, makro
```

### 6.3 Shared Value Object Example

```typescript
// shared-kernel/value-objects/money.vo.ts

import { ValueObject } from '../utils/value-object.base';
import { Currency } from '../enums/currency.enum';

interface MoneyProps {
  amount: number;
  currency: Currency;
}

export class Money extends ValueObject<MoneyProps> {
  get amount(): number {
    return this.props.amount;
  }

  get currency(): Currency {
    return this.props.currency;
  }

  /**
   * Create Money value object
   * @throws DomainException if amount is negative
   */
  static create(amount: number, currency: Currency = Currency.ZAR): Money {
    if (amount < 0) {
      throw new DomainException('Money amount cannot be negative');
    }

    return new Money({ amount, currency });
  }

  /**
   * Add two money amounts (must be same currency)
   */
  add(other: Money): Money {
    this.ensureSameCurrency(other);
    return Money.create(this.amount + other.amount, this.currency);
  }

  /**
   * Subtract (must be same currency, result cannot be negative)
   */
  subtract(other: Money): Money {
    this.ensureSameCurrency(other);
    const result = this.amount - other.amount;

    if (result < 0) {
      throw new DomainException('Money subtraction resulted in negative amount');
    }

    return Money.create(result, this.currency);
  }

  /**
   * Multiply by scalar
   */
  multiply(factor: number): Money {
    return Money.create(this.amount * factor, this.currency);
  }

  /**
   * Compare amounts
   */
  isGreaterThan(other: Money): boolean {
    this.ensureSameCurrency(other);
    return this.amount > other.amount;
  }

  isLessThan(other: Money): boolean {
    this.ensureSameCurrency(other);
    return this.amount < other.amount;
  }

  /**
   * Format for display
   */
  toString(): string {
    return `R ${this.amount.toFixed(2)} ${this.currency}`;
  }

  /**
   * Value object equality (amount + currency)
   */
  protected equalsCore(other: Money): boolean {
    return (
      this.amount === other.amount &&
      this.currency === other.currency
    );
  }

  private ensureSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new DomainException(
        `Cannot operate on different currencies: ${this.currency} vs ${other.currency}`
      );
    }
  }
}
```

### 6.4 Shared Kernel Governance

**Change Policy:**
- ⚠️ **Breaking changes require approval from ALL contexts**
- ✅ **Non-breaking additions are allowed**
- ✅ **Deprecation must be announced 2 sprints in advance**

**Example Breaking Change:**
```typescript
// ❌ BREAKING - changes method signature
class Money {
  // Before
  add(other: Money): Money;

  // After (BREAKING)
  add(other: Money, roundingMode: RoundingMode): Money;
}
```

**Example Non-Breaking Addition:**
```typescript
// ✅ NON-BREAKING - adds new method
class Money {
  add(other: Money): Money; // existing method unchanged

  addWithRounding(other: Money, roundingMode: RoundingMode): Money; // new method
}
```

---

## 7. Published Language (Domain Events)

### 7.1 Event-Driven Integration

**Benefits:**
- ✅ **Loose coupling** - contexts don't call each other directly
- ✅ **Scalability** - events can be processed asynchronously
- ✅ **Auditability** - event log provides complete history
- ✅ **Multiple consumers** - many contexts can react to same event

### 7.2 Event Flow Examples

#### Example 1: Price Update Triggers Optimization Cache Invalidation

```
┌──────────────────────────────────────────────────────────────┐
│  1. Retailer Integration Context                             │
│     Scraper detects price change                             │
│     PricingSnapshot.updatePrice() called                     │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       │ Publishes event
                       ↓
┌──────────────────────────────────────────────────────────────┐
│  2. Event Bus (pg-boss)                                       │
│     ItemPriceUpdated event queued                            │
│     {                                                         │
│       retailerItemId: "item-123",                            │
│       previousPrice: Money(25.99),                           │
│       newPrice: Money(23.99),                                │
│       updatedAt: "2025-10-21T10:30:00Z"                      │
│     }                                                         │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       │ Event delivered to subscribers
                       │
         ┌─────────────┴───────────────┐
         │                             │
         ↓                             ↓
┌────────────────────┐     ┌────────────────────────┐
│ 3a. Basket         │     │ 3b. Product Matching   │
│     Optimization   │     │     Context            │
│     Context        │     │     (optional)         │
│                    │     │                        │
│ Handler:           │     │ Handler:               │
│ ItemPriceUpdated   │     │ ItemPriceUpdated       │
│ Handler            │     │ Handler                │
│                    │     │                        │
│ Action:            │     │ Action:                │
│ Invalidate cached  │     │ Update price stats     │
│ optimization runs  │     │ for this product       │
│ that used this item│     │                        │
└────────────────────┘     └────────────────────────┘
```

#### Example 2: Retailer Item Ingested Triggers Matching

```
┌──────────────────────────────────────────────────────────────┐
│  1. Retailer Integration Context                             │
│     New item scraped from retailer catalog                   │
│     RetailerCatalog.addItem() called                         │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       │ Publishes event
                       ↓
┌──────────────────────────────────────────────────────────────┐
│  2. Event Bus (pg-boss)                                       │
│     RetailerItemIngested event queued                        │
│     {                                                         │
│       retailerId: "woolworths",                              │
│       itemSku: "WW-12345",                                   │
│       itemName: "Clover Fresh Milk 1L",                      │
│       ingestedAt: "2025-10-21T06:30:00Z"                     │
│     }                                                         │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       │ Event delivered
                       ↓
┌──────────────────────────────────────────────────────────────┐
│  3. Product Matching Context                                 │
│     Handler: RetailerItemIngestedHandler                     │
│                                                              │
│     Action:                                                  │
│     - Start MatchingWorkflow for new item                    │
│     - Run fuzzy matching algorithms                          │
│     - If confidence > 85%, auto-match to canonical product   │
│     - If confidence < 85%, add to manual review queue        │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       │ If high-confidence match found
                       ↓
┌──────────────────────────────────────────────────────────────┐
│  4. Event Bus (pg-boss)                                       │
│     ProductMappingCompleted event queued                     │
│     {                                                         │
│       workflowId: "workflow-789",                            │
│       retailerItemId: "item-123",                            │
│       canonicalProductId: "product-456",                     │
│       confidence: MatchConfidence(92%),                      │
│       completedAt: "2025-10-21T06:31:00Z"                    │
│     }                                                         │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       │ Event delivered
                       ↓
┌──────────────────────────────────────────────────────────────┐
│  5. Basket Optimization Context                              │
│     Handler: ProductMappingCompletedHandler                  │
│                                                              │
│     Action:                                                  │
│     - This product can now be used in optimizations          │
│     - Refresh product availability cache                     │
└──────────────────────────────────────────────────────────────┘
```

### 7.3 Event Schema Definitions

**Location**: Each context publishes its events in `{context}/domain/events/`

**Event Naming Convention**: `{Entity}{PastTenseAction}` (e.g., `ProductMappingCompleted`, `ItemPriceUpdated`)

**Event Base Class:**
```typescript
// shared-kernel/utils/domain-event.base.ts

export abstract class DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventId: string;

  constructor() {
    this.occurredOn = new Date();
    this.eventId = uuidv4();
  }

  /**
   * Unique event name for routing (e.g., "ItemPriceUpdated")
   */
  abstract get eventName(): string;

  /**
   * Version for event schema evolution (e.g., "1.0", "2.0")
   */
  get version(): string {
    return '1.0';
  }
}
```

**Example Event:**
```typescript
// retailer-integration/domain/events/item-price-updated.event.ts

export class ItemPriceUpdated extends DomainEvent {
  constructor(
    public readonly retailerItemId: RetailerItemId,
    public readonly previousPrice: Money,
    public readonly newPrice: Money,
    public readonly updatedAt: Date
  ) {
    super();
  }

  get eventName(): string {
    return 'ItemPriceUpdated';
  }

  /**
   * Serialize for event bus
   */
  toJSON() {
    return {
      eventId: this.eventId,
      eventName: this.eventName,
      version: this.version,
      occurredOn: this.occurredOn.toISOString(),
      data: {
        retailerItemId: this.retailerItemId.value,
        previousPrice: {
          amount: this.previousPrice.amount,
          currency: this.previousPrice.currency,
        },
        newPrice: {
          amount: this.newPrice.amount,
          currency: this.newPrice.currency,
        },
        updatedAt: this.updatedAt.toISOString(),
      },
    };
  }

  /**
   * Deserialize from event bus
   */
  static fromJSON(json: any): ItemPriceUpdated {
    return new ItemPriceUpdated(
      RetailerItemId.fromString(json.data.retailerItemId),
      Money.create(json.data.previousPrice.amount, json.data.previousPrice.currency),
      Money.create(json.data.newPrice.amount, json.data.newPrice.currency),
      new Date(json.data.updatedAt)
    );
  }
}
```

### 7.4 Event Publishing & Handling

**Publishing Events:**
```typescript
// retailer-integration/infrastructure/repositories/pricing-snapshot.repository.ts

@Injectable()
export class PricingSnapshotRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBus
  ) {}

  async save(snapshot: PricingSnapshot): Promise<void> {
    // Persist to database
    await this.prisma.pricingSnapshot.create({
      data: this.toPersistence(snapshot),
    });

    // Publish all uncommitted domain events
    const events = snapshot.getUncommittedEvents();
    for (const event of events) {
      await this.eventBus.publish(event);
    }

    snapshot.clearEvents();
  }
}
```

**Handling Events:**
```typescript
// basket-optimization/application/event-handlers/item-price-updated.handler.ts

@Injectable()
export class ItemPriceUpdatedHandler {
  constructor(
    private readonly cacheService: OptimizationCacheService,
    private readonly logger: Logger
  ) {}

  @OnEvent(ItemPriceUpdated.name)
  async handle(event: ItemPriceUpdated): Promise<void> {
    this.logger.log(
      `Handling price update for item ${event.retailerItemId.value}: ` +
      `${event.previousPrice} → ${event.newPrice}`
    );

    // Invalidate cached optimization runs that included this item
    const invalidatedCount = await this.cacheService
      .invalidateByRetailerItem(event.retailerItemId);

    this.logger.log(
      `Invalidated ${invalidatedCount} cached optimization runs`
    );

    // Optional: Notify users who have this item on their lists
    // await this.notificationService.notifyPriceChange(event);
  }
}
```

---

## 8. Technology Choices for Integration

| Integration Pattern | Technology | Configuration | Notes |
|---------------------|------------|---------------|-------|
| **Synchronous API Calls** | NestJS HttpModule | Internal REST/GraphQL APIs | Use for immediate data needs |
| **Domain Events (In-Process)** | NestJS EventEmitter2 | `@nestjs/event-emitter` | Fast, within same Node process |
| **Domain Events (Persistent)** | pg-boss | Postgres-backed queue | Reliable, survives restarts |
| **Shared Kernel** | TypeScript NPM workspace | `@tillless/shared-kernel` | Shared value objects |
| **ACL Translation** | NestJS services | Injected into application layer | Protects domain from external models |

### 8.1 Event Bus Configuration

**pg-boss Setup:**
```typescript
// shared-kernel/infrastructure/event-bus/pg-boss-event-bus.module.ts

@Module({
  providers: [
    {
      provide: 'PG_BOSS',
      useFactory: async () => {
        const boss = new PgBoss({
          connectionString: process.env.DATABASE_URL,
          schema: 'event_bus', // Separate schema for event queue
        });
        await boss.start();
        return boss;
      },
    },
    EventBus,
  ],
  exports: [EventBus],
})
export class EventBusModule {}
```

**Event Bus Service:**
```typescript
// shared-kernel/infrastructure/event-bus/event-bus.service.ts

@Injectable()
export class EventBus {
  constructor(@Inject('PG_BOSS') private readonly boss: PgBoss) {}

  /**
   * Publish domain event to pg-boss queue
   */
  async publish(event: DomainEvent): Promise<void> {
    await this.boss.send(
      event.eventName, // Queue name
      event.toJSON(),  // Event payload
      {
        retryLimit: 3,
        retryDelay: 60, // 1 minute
        expireInSeconds: 3600, // 1 hour
      }
    );
  }

  /**
   * Subscribe to domain events
   */
  async subscribe<T extends DomainEvent>(
    eventName: string,
    handler: (event: T) => Promise<void>
  ): Promise<void> {
    await this.boss.work(
      eventName,
      { teamSize: 5, teamConcurrency: 2 },
      async (job) => {
        const event = this.deserializeEvent(eventName, job.data);
        await handler(event as T);
      }
    );
  }

  private deserializeEvent(eventName: string, data: any): DomainEvent {
    // Map event names to event classes
    const eventMap: Record<string, any> = {
      'ItemPriceUpdated': ItemPriceUpdated,
      'ProductMappingCompleted': ProductMappingCompleted,
      'RetailerItemIngested': RetailerItemIngested,
      // ... more events
    };

    const EventClass = eventMap[eventName];
    if (!EventClass) {
      throw new Error(`Unknown event: ${eventName}`);
    }

    return EventClass.fromJSON(data);
  }
}
```

---

## 9. Integration Testing Strategy

### 9.1 Testing ACL Translation

**Goal**: Verify ACL correctly translates external models to internal models

```typescript
// basket-optimization/infrastructure/acl/product-matching.acl.spec.ts

describe('ProductMatchingACL', () => {
  let acl: ProductMatchingACL;
  let mockClient: ProductMatchingClient;

  beforeEach(() => {
    mockClient = createMockProductMatchingClient();
    acl = new ProductMatchingACL(mockClient);
  });

  it('should translate CanonicalProduct to OptimizationProduct', async () => {
    // Arrange
    const canonicalProduct = createMockCanonicalProduct({
      id: 'product-123',
      name: 'Clover Milk 1L',
      brand: 'Clover',
      category: 'dairy-milk',
      baseQuantity: { value: 1, unit: 'l' },
      // Product Matching specific fields
      aliases: [/* ... */],
      matchingStats: {/* ... */},
    });

    mockClient.getProductsByIds = jest.fn().mockResolvedValue([canonicalProduct]);

    // Act
    const result = await acl.getProductsForOptimization(['product-123']);

    // Assert
    const optimizationProduct = result.get('product-123');
    expect(optimizationProduct).toBeDefined();
    expect(optimizationProduct.name).toBe('Clover Milk 1L');
    expect(optimizationProduct.brand).toBe('Clover');
    expect(optimizationProduct.category).toBe(OptimizationCategory.DAIRY);

    // Verify Product Matching specific fields are NOT in optimization model
    expect(optimizationProduct).not.toHaveProperty('aliases');
    expect(optimizationProduct).not.toHaveProperty('matchingStats');
  });

  it('should map external categories to internal optimization categories', async () => {
    const testCases = [
      { external: 'dairy-milk', expected: OptimizationCategory.DAIRY },
      { external: 'bakery-bread', expected: OptimizationCategory.BAKERY },
      { external: 'unknown-category', expected: OptimizationCategory.OTHER },
    ];

    for (const { external, expected } of testCases) {
      const canonical = createMockCanonicalProduct({ category: external });
      mockClient.getProductsByIds = jest.fn().mockResolvedValue([canonical]);

      const result = await acl.getProductsForOptimization(['product-123']);
      const product = result.get('product-123');

      expect(product.category).toBe(expected);
    }
  });
});
```

### 9.2 Testing Event Flows

**Goal**: Verify events are published and handled correctly across contexts

```typescript
// Integration test: Retailer Integration → Product Matching event flow

describe('RetailerItemIngested Event Flow (Integration)', () => {
  let eventBus: EventBus;
  let retailerIntegrationService: RetailerCatalogService;
  let productMatchingService: MatchingApplicationService;

  beforeEach(async () => {
    // Set up test environment with real event bus (pg-boss in test mode)
    const module = await Test.createTestingModule({
      imports: [
        RetailerIntegrationModule,
        ProductMatchingModule,
        EventBusModule.forTest(), // Uses in-memory pg-boss
      ],
    }).compile();

    eventBus = module.get(EventBus);
    retailerIntegrationService = module.get(RetailerCatalogService);
    productMatchingService = module.get(MatchingApplicationService);
  });

  it('should trigger matching workflow when retailer item ingested', async (done) => {
    // Arrange
    const newRetailerItem = {
      retailerId: 'woolworths',
      sku: 'WW-12345',
      name: 'Clover Milk 1L',
      price: Money.create(25.99),
    };

    // Set up event listener
    await eventBus.subscribe(
      RetailerItemIngested.name,
      async (event: RetailerItemIngested) => {
        // Verify event was published
        expect(event.retailerId).toBe('woolworths');
        expect(event.itemSku).toBe('WW-12345');

        // Wait for Product Matching to process event
        await new Promise(resolve => setTimeout(resolve, 500));

        // Verify matching workflow was created
        const workflows = await productMatchingService.getWorkflowsByRetailerItem(
          'woolworths',
          'WW-12345'
        );

        expect(workflows).toHaveLength(1);
        expect(workflows[0].status).toBeOneOf(['AUTO_MATCHED', 'PENDING_REVIEW']);

        done();
      }
    );

    // Act
    await retailerIntegrationService.ingestCatalogItem(newRetailerItem);
  });
});
```

---

## 10. Migration Strategy

### 10.1 Incremental Integration Refactoring

**Phase 1: Add ACLs (Week 1)**
- Create ACL services for each context boundary
- Initially, ACLs just pass through to existing code
- Gradually add translation logic

**Phase 2: Implement Event Bus (Week 2)**
- Set up pg-boss event infrastructure
- Start publishing domain events (dual-write: events + old sync calls)
- Add event handlers alongside old code

**Phase 3: Remove Direct Dependencies (Weeks 3-4)**
- Replace direct Prisma queries with ACL calls
- Replace synchronous notifications with event subscriptions
- Remove unused old code

### 10.2 Rollback Plan

If integration changes cause issues:
1. **ACLs**: ACLs can be toggled to bypass translation (pass-through mode)
2. **Events**: Event handlers can be disabled; fall back to sync calls
3. **Database**: Shared Postgres (no schema migration needed)

---

## 11. Monitoring & Observability

### 11.1 Integration Health Metrics

| Metric | What to Monitor | Alert Threshold |
|--------|----------------|-----------------|
| **ACL Translation Failures** | Errors in ACL translation logic | > 1% error rate |
| **Event Queue Lag** | Delay between event publish and handling | > 5 minutes |
| **Event Failures** | Events that failed after max retries | > 10 failures/hour |
| **API Call Latency** | Time taken for inter-context API calls | > 2 seconds |

### 11.2 Observability Stack

```typescript
// Add OpenTelemetry tracing to ACL calls

@Injectable()
export class ProductMatchingACL {
  constructor(
    private readonly tracer: Tracer,
    private readonly client: ProductMatchingClient
  ) {}

  async getProductsForOptimization(
    productIds: CanonicalProductId[]
  ): Promise<Map<CanonicalProductId, OptimizationProduct>> {
    return this.tracer.startActiveSpan('acl.product-matching.get-products', async (span) => {
      span.setAttribute('product.count', productIds.length);

      try {
        const products = await this.client.getProductsByIds(productIds);
        span.setAttribute('products.fetched', products.length);

        const translated = products.map(p => this.translateToOptimizationProduct(p));
        span.setStatus({ code: SpanStatusCode.OK });

        return translated;
      } catch (error) {
        span.recordException(error);
        span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
        throw error;
      } finally {
        span.end();
      }
    });
  }
}
```

---

## 12. Summary & Quick Reference

### Context Relationship Cheat Sheet

| Downstream Context | Upstream Context | Pattern | Mechanism |
|-------------------|------------------|---------|-----------|
| Basket Optimization | Shopping List | U/D | Sync API |
| Basket Optimization | User Preferences | U/D | Sync API |
| Basket Optimization | Product Matching | U/D + ACL | Sync API + Translation |
| Basket Optimization | Retailer Integration | U/D + ACL | Sync API + Translation |
| Product Matching | Retailer Integration | PL | Async Events |
| All Contexts | Shared Kernel | SK | Direct Import |

### When to Use What

| Use Case | Pattern | Example |
|----------|---------|---------|
| Need data to complete current operation | Sync API + ACL | Optimization fetches products for recommendation |
| React to changes in another context | Async Events | Price change invalidates cached results |
| Universal value object used everywhere | Shared Kernel | `Money`, `UnitOfMeasure` |
| Protect domain from external changes | ACL | Translate CanonicalProduct → OptimizationProduct |

---

**Document Owner**: Winston (Architect)
**Last Updated**: 2025-10-21
**Next Review**: After Phase 1 implementation (Product Matching context)
