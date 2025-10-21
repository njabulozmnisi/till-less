# DDD Implementation Migration Guide - TillLess

## Document Control
- **Version**: 1.0
- **Last Updated**: 2025-10-21
- **Purpose**: Step-by-step guide for migrating TillLess to DDD architecture
- **Related**: [DDD Design](./ddd-design.md), [Context Mapping](./ddd-context-mapping.md)

---

## 1. Migration Overview

**Strategy**: Strangler Fig Pattern - gradually replace old architecture with DDD, allowing both to coexist during transition.

**Timeline**: 8-12 weeks total
**Team Size**: 2-3 developers
**Risk**: Medium (mitigated by incremental approach)

---

## 2. Prerequisites

### 2.1 Team Preparation
- [ ] All developers read DDD Design document
- [ ] 2-hour DDD workshop completed
- [ ] Ubiquitous Language glossary reviewed and understood
- [ ] Context boundaries agreed upon by team

### 2.2 Technical Setup
- [ ] NestJS monorepo structure confirmed
- [ ] Prisma ORM configured
- [ ] pg-boss event bus set up
- [ ] Testing infrastructure ready (Vitest, Playwright)

---

## 3. Phase 1: Foundation (Weeks 1-2)

### Week 1: Directory Structure & Shared Kernel

**Goal**: Set up the physical structure for DDD code

#### Step 1.1: Create Bounded Context Directories

```bash
# Create context directories
mkdir -p src/contexts/{basket-optimization,product-matching,retailer-integration,shopping-list,user-preferences,shared-kernel}

# Create DDD layers within each context
for context in basket-optimization product-matching retailer-integration shopping-list user-preferences; do
  mkdir -p src/contexts/$context/{domain,application,infrastructure,presentation}
  mkdir -p src/contexts/$context/domain/{aggregates,entities,value-objects,services,events,repositories}
  mkdir -p src/contexts/$context/application/{commands,queries,handlers,event-handlers,services}
  mkdir -p src/contexts/$context/infrastructure/{repositories,acl,persistence}
  mkdir -p src/contexts/$context/presentation/{controllers,dtos}
done

# Create shared kernel structure
mkdir -p src/contexts/shared-kernel/{value-objects,types,utils,enums}
```

#### Step 1.2: Implement Shared Kernel Value Objects

Start with most commonly used value objects:

**Priority Order:**
1. `Money` (used in 4+ contexts)
2. `Quantity` & `UnitOfMeasure` (used in 3+ contexts)
3. `ProductIdentifier` (used in Product Matching, Optimization)
4. `Location` (used in User Preferences, Optimization)

**Template for Value Objects:**
```typescript
// shared-kernel/value-objects/money.vo.ts
import { ValueObject } from '../utils/value-object.base';

interface MoneyProps {
  amount: number;
  currency: Currency;
}

export class Money extends ValueObject<MoneyProps> {
  // Implementation from DDD Context Mapping doc
}
```

**Test First:**
```typescript
// shared-kernel/value-objects/money.vo.spec.ts
describe('Money Value Object', () => {
  it('should create valid money instance', () => {
    const money = Money.create(25.99, Currency.ZAR);
    expect(money.amount).toBe(25.99);
  });

  it('should throw on negative amount', () => {
    expect(() => Money.create(-10)).toThrow(DomainException);
  });

  it('should add two money amounts', () => {
    const a = Money.create(10);
    const b = Money.create(15);
    const result = a.add(b);
    expect(result.amount).toBe(25);
  });
});
```

#### Step 1.3: Document Code Map

Create a code map showing where existing code will move:

| Existing Code | New Location | Notes |
|---------------|--------------|-------|
| `src/modules/optimization/` | `contexts/basket-optimization/` | Refactor into aggregates |
| `src/modules/products/` | `contexts/product-matching/` | Split canonical from retailer items |
| `src/modules/scrapers/` | `contexts/retailer-integration/` | Keep scraper logic, extract aggregates |
| `src/modules/users/` | `contexts/user-preferences/` | Extract preferences from user account |
| `src/modules/lists/` | `contexts/shopping-list/` | Simple CRUD to aggregate |

### Week 2: Set Up Integration Infrastructure

#### Step 2.1: Implement Event Bus

**Install pg-boss:**
```bash
pnpm add pg-boss
pnpm add -D @types/pg-boss
```

**Configure Event Bus Module:**
```typescript
// shared-kernel/infrastructure/event-bus/event-bus.module.ts
// Implementation from Context Mapping doc
```

#### Step 2.2: Create Base Classes

**AggregateRoot:**
```typescript
// shared-kernel/utils/aggregate-root.base.ts
export abstract class AggregateRoot<T extends ValueObject> {
  protected readonly id: T;
  private uncommittedEvents: DomainEvent[] = [];

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
}
```

**Repository Interface:**
```typescript
// shared-kernel/repositories/repository.interface.ts
export interface IRepository<T extends AggregateRoot<any>> {
  save(aggregate: T): Promise<void>;
  findById(id: ValueObject): Promise<T | null>;
}
```

---

## 4. Phase 2: Extract Core Domains (Weeks 3-6)

### Week 3-4: Product Matching Context

**Why First**: Highest complexity, provides foundation for Optimization context

#### Step 3.1: Extract CanonicalProduct Aggregate

**Test First (TDD Approach):**
```typescript
// contexts/product-matching/domain/aggregates/canonical-product.spec.ts

describe('CanonicalProduct Aggregate', () => {
  describe('creation', () => {
    it('should create canonical product with valid data', () => {
      const product = CanonicalProduct.create({
        name: 'Clover Milk 1L',
        brand: 'Clover',
        category: Category.create('DAIRY'),
        quantity: Quantity.create(1, UnitOfMeasure.LITERS),
        priceMode: PriceMode.ITEM
      });

      expect(product.name).toBe('Clover Milk 1L');
      expect(product.brand).toBe('Clover');
    });
  });

  describe('aliases', () => {
    it('should add product alias', () => {
      const product = createTestProduct();
      const alias = ProductAlias.create({
        type: AliasType.GTIN,
        value: '6001087424691'
      });

      product.addAlias(alias);

      expect(product.aliases).toHaveLength(1);
      expect(product.getUncommittedEvents()).toContainEventType(AliasAdded);
    });

    it('should prevent duplicate aliases', () => {
      const product = createTestProduct();
      const alias = ProductAlias.create({
        type: AliasType.GTIN,
        value: '6001087424691'
      });

      product.addAlias(alias);

      expect(() => product.addAlias(alias)).toThrow(DomainException);
    });
  });
});
```

**Implementation:**
```typescript
// contexts/product-matching/domain/aggregates/canonical-product.aggregate.ts

export class CanonicalProduct extends AggregateRoot<ProductId> {
  private name: ProductName;
  private brand: Brand;
  private category: Category;
  private baseQuantity: Quantity;
  private priceMode: PriceMode;
  private aliases: ProductAlias[] = [];

  static create(params: CreateProductParams): CanonicalProduct {
    const product = new CanonicalProduct(ProductId.generate());
    product.apply(new ProductCreated(/* ... */));
    return product;
  }

  addAlias(alias: ProductAlias): void {
    this.ensureAliasIsUnique(alias);
    this.aliases.push(alias);
    this.apply(new AliasAdded(this.id, alias));
  }

  private ensureAliasIsUnique(alias: ProductAlias): void {
    const exists = this.aliases.some(a => a.equals(alias));
    if (exists) {
      throw new DomainException('Duplicate alias');
    }
  }

  protected handleEvent(event: DomainEvent): void {
    if (event instanceof ProductCreated) {
      this.name = event.name;
      this.brand = event.brand;
      // ... set other properties
    } else if (event instanceof AliasAdded) {
      // Event already applied in addAlias
    }
  }
}
```

#### Step 3.2: Implement Repository

**Interface:**
```typescript
// contexts/product-matching/domain/repositories/canonical-product.repository.interface.ts

export interface ICanonicalProductRepository {
  save(product: CanonicalProduct): Promise<void>;
  findById(id: ProductId): Promise<CanonicalProduct | null>;
  findByGTIN(gtin: string): Promise<CanonicalProduct | null>;
  findByCategoryAndBrand(category: Category, brand: Brand): Promise<CanonicalProduct[]>;
}
```

**Prisma Implementation:**
```typescript
// contexts/product-matching/infrastructure/repositories/prisma-canonical-product.repository.ts

@Injectable()
export class PrismaCanonicalProductRepository implements ICanonicalProductRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBus
  ) {}

  async save(product: CanonicalProduct): Promise<void> {
    const data = this.toPersistence(product);

    await this.prisma.canonicalProduct.upsert({
      where: { id: product.getId().value },
      update: data,
      create: data
    });

    // Publish domain events
    const events = product.getUncommittedEvents();
    for (const event of events) {
      await this.eventBus.publish(event);
    }

    product.clearEvents();
  }

  async findById(id: ProductId): Promise<CanonicalProduct | null> {
    const data = await this.prisma.canonicalProduct.findUnique({
      where: { id: id.value },
      include: { aliases: true }
    });

    return data ? this.toDomain(data) : null;
  }

  private toPersistence(product: CanonicalProduct): any {
    // Map aggregate to Prisma model
  }

  private toDomain(data: any): CanonicalProduct {
    // Reconstruct aggregate from Prisma data
  }
}
```

#### Step 3.3: Migrate Existing Code

**Strategy**: Dual-write pattern

1. **Keep old code running** (don't delete yet)
2. **Write new aggregate alongside old code**
3. **Write to both old and new models**
4. **Read from new model, fall back to old**
5. **Monitor for discrepancies**
6. **Delete old code when confident**

**Example Dual-Write Service:**
```typescript
@Injectable()
export class ProductMigrationService {
  constructor(
    private readonly oldProductService: OldProductService, // existing
    private readonly newRepository: ICanonicalProductRepository // new DDD
  ) {}

  async createProduct(params: CreateProductParams): Promise<Product> {
    // Write to old model (for safety)
    const oldProduct = await this.oldProductService.create(params);

    // Write to new DDD aggregate
    try {
      const newProduct = CanonicalProduct.create(params);
      await this.newRepository.save(newProduct);
    } catch (error) {
      // Log error but don't fail (old model is source of truth during migration)
      logger.error('Failed to create DDD product', error);
    }

    return oldProduct;
  }
}
```

### Week 5-6: Basket Optimization Context

Follow same TDD approach:
1. Extract `OptimizationRun` aggregate (tests first)
2. Implement repository
3. Extract domain services (OptimizationEngine, SubstitutionMatcher)
4. Create ACLs for Product Matching and Retailer Integration
5. Dual-write pattern for migration

---

## 5. Phase 3: Supporting Domains (Weeks 7-10)

**Priority Order:**
1. Retailer Integration (Week 7)
2. Shopping List (Week 8)
3. User Preferences (Week 8)
4. Event Wiring (Weeks 9-10)

**Lower Complexity - Can Move Faster**

---

## 6. Phase 4: Refinement (Weeks 11-12)

### Week 11: Remove Old Code

**Criteria for Deletion:**
- New DDD code handles 100% of use cases
- No discrepancies between old/new for 2+ weeks
- All tests passing with DDD code
- Team confident in new implementation

**Process:**
1. Feature flag old code paths
2. Monitor metrics (error rates, performance)
3. Disable old code for 10% of requests
4. Gradually increase to 100%
5. Delete old code

### Week 12: Optimization & Documentation

- [ ] Add CQRS read models for optimization results
- [ ] Optimize repository queries (N+1, caching)
- [ ] Add domain event sourcing (optional)
- [ ] Performance testing
- [ ] Update all documentation
- [ ] Team retrospective on DDD adoption

---

## 7. Daily Development Workflow

### 7.1 Adding a New Feature

**Example: Add "Favorite Products" feature**

**Step 1: Identify Bounded Context**
→ This belongs in **Shopping List Context** (user's personal product preferences)

**Step 2: Write Domain Test**
```typescript
describe('ShoppingList Aggregate - Favorites', () => {
  it('should add product to favorites', () => {
    const list = createTestShoppingList();
    const productId = ProductId.create('product-123');

    list.addFavoriteProduct(productId);

    expect(list.favoriteProducts).toContain(productId);
    expect(list.getUncommittedEvents()).toContainEventType(ProductFavorited);
  });
});
```

**Step 3: Implement in Aggregate**
```typescript
// shopping-list/domain/aggregates/shopping-list.aggregate.ts

export class ShoppingList extends AggregateRoot<ListId> {
  private favoriteProducts: ProductId[] = [];

  addFavoriteProduct(productId: ProductId): void {
    if (this.favoriteProducts.some(id => id.equals(productId))) {
      throw new DomainException('Product already favorited');
    }

    this.favoriteProducts.push(productId);
    this.apply(new ProductFavorited(this.id, productId));
  }
}
```

**Step 4: Add Application Command**
```typescript
// shopping-list/application/commands/add-favorite-product.command.ts

export class AddFavoriteProductCommand {
  constructor(
    public readonly userId: string,
    public readonly listId: string,
    public readonly productId: string
  ) {}
}

@Injectable()
export class AddFavoriteProductHandler {
  async execute(command: AddFavoriteProductCommand): Promise<void> {
    const list = await this.repository.findById(ListId.fromString(command.listId));
    if (!list) throw new NotFoundException();

    list.addFavoriteProduct(ProductId.fromString(command.productId));

    await this.repository.save(list);
  }
}
```

**Step 5: Add API Endpoint**
```typescript
// shopping-list/presentation/controllers/shopping-list.controller.ts

@Post(':listId/favorites')
async addFavorite(
  @Param('listId') listId: string,
  @Body() dto: AddFavoriteDto
): Promise<void> {
  const command = new AddFavoriteProductCommand(
    this.getCurrentUserId(),
    listId,
    dto.productId
  );

  await this.commandBus.execute(command);
}
```

---

## 8. Common Migration Challenges

### Challenge 1: Existing Code Too Coupled to Prisma

**Problem**: Business logic mixed with Prisma queries

**Before (Bad):**
```typescript
async optimizeBasket(listId: string): Promise<Result> {
  const list = await prisma.shoppingList.findUnique({
    where: { id: listId },
    include: { items: { include: { product: true } } }
  });

  // Business logic mixed with Prisma model
  const total = list.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // More business logic...
}
```

**After (Good):**
```typescript
async optimizeBasket(listId: string): Promise<Result> {
  // Repository loads aggregate
  const list = await this.repository.findById(ListId.fromString(listId));

  // Domain aggregate encapsulates business logic
  const total = list.calculateTotal();

  // More domain operations...
}
```

**Migration Strategy**:
1. Extract business logic to domain services first
2. Create aggregate with same logic
3. Repository handles Prisma interaction
4. Delete old service code

### Challenge 2: Team Unfamiliar with DDD

**Solution**:
- Pair programming (experienced + learning)
- Code reviews focus on DDD patterns
- Weekly "DDD Office Hours" for questions
- Celebrate wins (aggregate that prevented bug, clear domain event flow)

### Challenge 3: Performance Concerns

**Problem**: Worried DDD adds overhead

**Reality**:
- Domain models are in-memory (fast)
- Repository pattern enables caching
- Event sourcing is optional
- Proper read models (CQRS) faster than complex joins

**Benchmark**: Track before/after for critical paths

---

## 9. Testing Strategy During Migration

### Unit Tests (Domain Layer)
```typescript
// Pure domain logic - no database, no framework
describe('OptimizationRun', () => {
  it('should calculate savings correctly', () => {
    const run = createTestOptimizationRun();
    run.selectPlan(RetailerId.create('checkers'));

    const savings = run.calculateSavings();

    expect(savings.percentageSavings.value).toBeGreaterThan(0);
  });
});
```

### Integration Tests (Application Layer)
```typescript
// With repository, database
describe('RunOptimizationCommandHandler (Integration)', () => {
  it('should persist optimization run', async () => {
    const command = new RunOptimizationCommand(/* ... */);
    const result = await handler.execute(command);

    const saved = await repository.findById(result.optimizationId);
    expect(saved).toBeDefined();
  });
});
```

### E2E Tests (API Level)
```typescript
// Full stack test
describe('POST /api/optimization/run', () => {
  it('should return optimization results', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/optimization/run')
      .send({ listId: 'list-123' })
      .expect(200);

    expect(response.body.retailerOptions).toHaveLength(5);
  });
});
```

---

## 10. Success Metrics

Track these metrics weekly to measure migration progress:

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Code in Domain Layer** | 80%+ | Count lines in `domain/` vs total |
| **Test Coverage (Domain)** | 90%+ | Vitest coverage report |
| **Dependencies** | Domain → Infrastructure (not reverse) | `madge --circular src/` |
| **Event Usage** | 10+ events published | Event bus logs |
| **Old Code Removed** | 100% by Week 12 | Git stats |

---

## 11. Rollback Plan

If DDD migration causes critical issues:

**Level 1: Feature Flag Off**
- Disable DDD code paths via feature flag
- Fall back to old implementation
- Time: 5 minutes

**Level 2: Code Revert**
- Revert git commits for specific context
- Old code still present (not deleted)
- Time: 30 minutes

**Level 3: Full Rollback**
- Restore database schema to pre-DDD state
- Deploy previous version
- Time: 2 hours

---

## 12. Quick Start Checklist

Use this checklist to get started with DDD migration:

### Week 1
- [ ] Create directory structure (`mkdir -p src/contexts/...`)
- [ ] Implement `Money` value object with tests
- [ ] Implement `Quantity` and `UnitOfMeasure` value objects
- [ ] Create `AggregateRoot` and `DomainEvent` base classes
- [ ] Set up Event Bus module (pg-boss)

### Week 2
- [ ] Review existing code map (what goes where)
- [ ] Create first aggregate test (CanonicalProduct)
- [ ] Implement first aggregate (CanonicalProduct)
- [ ] Implement first repository (PrismaCanonicalProductRepository)
- [ ] Add first domain event (ProductCreated)

### Week 3
- [ ] Team demo: Show working aggregate with tests
- [ ] Start dual-write pattern for CanonicalProduct
- [ ] Monitor discrepancies between old/new models
- [ ] Add more Product Matching aggregates (MatchingWorkflow)

**Continue week by week following Phase 2-4 timeline above**

---

## 13. Resources & References

- [DDD Design Document](./ddd-design.md)
- [Ubiquitous Language Glossary](./ddd-ubiquitous-language.md)
- [Context Mapping & Integration](./ddd-context-mapping.md)
- [Eric Evans - Domain-Driven Design (Blue Book)](https://www.domainlanguage.com/ddd/)
- [Vaughn Vernon - Implementing DDD (Red Book)](https://vaughnvernon.co/?page_id=168)

---

**Document Owner**: Winston (Architect)
**Last Updated**: 2025-10-21
**Support**: #ddd-migration Slack channel
