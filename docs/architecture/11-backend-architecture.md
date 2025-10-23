# 11. Backend Architecture

## 11.1 NestJS Module Structure

```
apps/api/src/
├── main.ts
├── app.module.ts
├── shopping/
│   ├── shopping.module.ts
│   ├── shopping.service.ts
│   ├── shopping.router.ts
│   ├── shopping.repository.ts
│   └── dto/
├── retailer/
│   ├── retailer.module.ts
│   ├── retailer.service.ts
│   ├── retailer.router.ts
│   └── strategies/
│       ├── web-scraper.strategy.ts
│       ├── pdf-ocr.strategy.ts
│       └── manual-entry.strategy.ts
├── optimization/
│   ├── optimization.module.ts
│   ├── optimization.service.ts          # Orchestrator (facade pattern)
│   ├── optimization.router.ts
│   └── engine/
│       ├── category-assignment.strategy.ts  # Core optimization algorithm
│       ├── travel-cost.calculator.ts        # Distance & cost calculations
│       ├── persona-threshold.service.ts     # Threshold nudge logic
│       └── optimization-result.builder.ts   # Result aggregation
├── crowdsourcing/
│   ├── crowdsourcing.module.ts
│   └── submission.service.ts
├── auth/
│   ├── auth.module.ts
│   ├── auth.guard.ts
│   └── supabase.strategy.ts
└── common/
    ├── prisma.service.ts
    ├── redis.service.ts
    └── decorators/
```

## 11.2 Dependency Injection

```typescript
@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    CacheModule,
  ],
  providers: [
    PrismaService,
    RedisService,
    ShoppingService,
    RetailerService,
    OptimizationService,
  ],
})
export class AppModule {}
```

## 11.3 Optimization Module Detailed Design

**Problem:** The original OptimizationService combined multiple responsibilities (category assignment, travel cost calculation, persona threshold logic) in a single service, making it difficult for AI agents to implement and test.

**Solution:** Apply Single Responsibility Principle by breaking it into focused sub-services orchestrated by a facade.

### 11.3.1 Service Breakdown

```
apps/api/src/optimization/
├── optimization.module.ts              # Module definition with all providers
├── optimization.service.ts             # Facade/Orchestrator (~80 lines)
├── optimization.router.ts              # tRPC router (~60 lines)
├── optimization.repository.ts          # Data access layer
└── engine/
    ├── category-assignment.strategy.ts # Core algorithm (~120 lines)
    ├── travel-cost.calculator.ts       # Haversine + cost math (~80 lines)
    ├── persona-threshold.service.ts    # Threshold nudge logic (~100 lines)
    └── optimization-result.builder.ts  # Result aggregation (~60 lines)
```

### 11.3.2 OptimizationService (Facade Pattern)

**Responsibility:** Orchestrate optimization workflow, manage caching, handle errors

```typescript
// apps/api/src/optimization/optimization.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../common/redis.service';
import { CategoryAssignmentStrategy } from './engine/category-assignment.strategy';
import { TravelCostCalculator } from './engine/travel-cost.calculator';
import { PersonaThresholdService } from './engine/persona-threshold.service';
import { OptimizationResultBuilder } from './engine/optimization-result.builder';
import { OptimizationRequest, OptimizationResult } from '@tillless/types';

@Injectable()
export class OptimizationService {
  private readonly logger = new Logger(OptimizationService.name);

  constructor(
    private readonly redis: RedisService,
    private readonly categoryAssignment: CategoryAssignmentStrategy,
    private readonly travelCostCalculator: TravelCostCalculator,
    private readonly personaThreshold: PersonaThresholdService,
    private readonly resultBuilder: OptimizationResultBuilder,
  ) {}

  async optimize(request: OptimizationRequest): Promise<OptimizationResult> {
    const cacheKey = `opt:${request.shoppingListId}`;

    // Try cache (non-blocking)
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        this.logger.debug(`Cache HIT for ${cacheKey}`);
        return JSON.parse(cached);
      }
    } catch (error) {
      this.logger.warn(`Redis unavailable: ${error.message}. Running without cache.`);
    }

    // Step 1: Calculate travel costs for all retailers
    const travelCosts = await this.travelCostCalculator.calculateAll(
      request.userLocation,
      request.availableRetailers
    );

    // Step 2: Assign categories to optimal retailers
    const assignments = await this.categoryAssignment.assignCategories(
      request.categories,
      request.availableRetailers,
      travelCosts,
      request.loyaltyCards
    );

    // Step 3: Generate threshold nudges based on persona
    const nudges = await this.personaThreshold.generateNudges(
      assignments,
      request.personaType,
      travelCosts
    );

    // Step 4: Build final optimization result
    const result = this.resultBuilder.build(assignments, nudges, travelCosts);

    // Cache result (fire-and-forget)
    this.cacheResult(cacheKey, result).catch(error => {
      this.logger.warn(`Failed to cache: ${error.message}`);
    });

    return result;
  }

  private async cacheResult(key: string, result: OptimizationResult): Promise<void> {
    await this.redis.setex(key, 300, JSON.stringify(result)); // 5-minute TTL
  }

  async invalidateCache(shoppingListId: string): Promise<void> {
    await this.redis.del(`opt:${shoppingListId}`);
  }
}
```

### 11.3.3 CategoryAssignmentStrategy

**Responsibility:** Core optimization algorithm - assign each category to cheapest retailer considering travel cost

```typescript
// apps/api/src/optimization/engine/category-assignment.strategy.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CategoryAssignment, TravelCost, LoyaltyCard } from '@tillless/types';

@Injectable()
export class CategoryAssignmentStrategy {
  constructor(private readonly prisma: PrismaService) {}

  async assignCategories(
    categories: Array<{ categoryId: string; items: any[] }>,
    retailers: string[],
    travelCosts: Map<string, TravelCost>,
    loyaltyCards: LoyaltyCard[]
  ): Promise<CategoryAssignment[]> {
    const assignments: CategoryAssignment[] = [];

    for (const category of categories) {
      // Fetch prices for all items in this category across all retailers
      const prices = await this.fetchPricesForCategory(
        category.items,
        retailers,
        loyaltyCards
      );

      // Calculate total cost per retailer for this category
      const retailerCosts = this.calculateRetailerCosts(prices, retailers, loyaltyCards);

      // Find retailer with lowest total cost (price + travel)
      let bestRetailer: string | null = null;
      let bestCost = Infinity;

      for (const retailerId of retailers) {
        const categorySubtotal = retailerCosts.get(retailerId) || Infinity;
        const travelCost = travelCosts.get(retailerId)?.cost || 0;
        const totalCost = categorySubtotal + travelCost;

        if (totalCost < bestCost) {
          bestCost = totalCost;
          bestRetailer = retailerId;
        }
      }

      if (bestRetailer) {
        assignments.push({
          categoryId: category.categoryId,
          retailerId: bestRetailer,
          subtotal: retailerCosts.get(bestRetailer)!,
          itemCount: category.items.length,
          savings: this.calculateSavings(retailerCosts, bestRetailer),
        });
      }
    }

    return assignments;
  }

  private async fetchPricesForCategory(
    items: any[],
    retailers: string[],
    loyaltyCards: LoyaltyCard[]
  ): Promise<Map<string, Map<string, number>>> {
    // Returns Map<productId, Map<retailerId, price>>
    const productIds = items.map(item => item.productId);

    const prices = await this.prisma.price.findMany({
      where: {
        productId: { in: productIds },
        retailerId: { in: retailers },
        snapshotDate: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
      },
      orderBy: { snapshotDate: 'desc' },
    });

    const priceMap = new Map<string, Map<string, number>>();

    for (const price of prices) {
      if (!priceMap.has(price.productId)) {
        priceMap.set(price.productId, new Map());
      }

      // Use loyalty price if user has card for this retailer
      const hasLoyaltyCard = loyaltyCards.some(card => card.retailerId === price.retailerId);
      const effectivePrice = hasLoyaltyCard && price.loyaltyPrice
        ? price.loyaltyPrice
        : price.price;

      priceMap.get(price.productId)!.set(price.retailerId, effectivePrice);
    }

    return priceMap;
  }

  private calculateRetailerCosts(
    prices: Map<string, Map<string, number>>,
    retailers: string[],
    loyaltyCards: LoyaltyCard[]
  ): Map<string, number> {
    const costs = new Map<string, number>();

    for (const retailerId of retailers) {
      let total = 0;
      for (const [productId, retailerPrices] of prices.entries()) {
        total += retailerPrices.get(retailerId) || 0;
      }
      costs.set(retailerId, total);
    }

    return costs;
  }

  private calculateSavings(retailerCosts: Map<string, number>, bestRetailer: string): number {
    const bestCost = retailerCosts.get(bestRetailer)!;
    const allCosts = Array.from(retailerCosts.values());
    const baseline = Math.max(...allCosts); // Most expensive retailer
    return baseline - bestCost;
  }
}
```

### 11.3.4 TravelCostCalculator

**Responsibility:** Calculate distance and travel cost using Haversine formula

```typescript
// apps/api/src/optimization/engine/travel-cost.calculator.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TravelCost, Coordinates } from '@tillless/types';

@Injectable()
export class TravelCostCalculator {
  private readonly FUEL_COST_PER_LITER = 24; // R24/L as of 2025
  private readonly FUEL_CONSUMPTION = 8; // 8L/100km average
  private readonly ROAD_FACTOR = 1.3; // Adjust for actual road distance

  constructor(private readonly prisma: PrismaService) {}

  async calculateAll(
    userLocation: Coordinates,
    retailerIds: string[]
  ): Promise<Map<string, TravelCost>> {
    // Fetch retailer locations from database
    const retailers = await this.prisma.retailer.findMany({
      where: { id: { in: retailerIds } },
      select: { id: true, name: true, locationLat: true, locationLng: true },
    });

    const travelCosts = new Map<string, TravelCost>();

    for (const retailer of retailers) {
      if (!retailer.locationLat || !retailer.locationLng) {
        continue; // Skip retailers without location data
      }

      const distance = this.haversineDistance(
        userLocation,
        { lat: retailer.locationLat, lng: retailer.locationLng }
      );

      const adjustedDistance = distance * this.ROAD_FACTOR; // km
      const roundTripDistance = adjustedDistance * 2; // km
      const fuelUsed = (roundTripDistance / 100) * this.FUEL_CONSUMPTION; // liters
      const fuelCost = fuelUsed * this.FUEL_COST_PER_LITER; // Rands

      travelCosts.set(retailer.id, {
        retailerId: retailer.id,
        distance: adjustedDistance,
        travelTime: this.estimateTravelTime(adjustedDistance), // minutes
        cost: fuelCost,
      });
    }

    return travelCosts;
  }

  private haversineDistance(coord1: Coordinates, coord2: Coordinates): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(coord2.lat - coord1.lat);
    const dLng = this.toRadians(coord2.lng - coord1.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(coord1.lat)) *
        Math.cos(this.toRadians(coord2.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private estimateTravelTime(distanceKm: number): number {
    // Average speed: 40 km/h (urban driving)
    return Math.ceil((distanceKm / 40) * 60); // minutes
  }
}
```

### 11.3.5 PersonaThresholdService

**Responsibility:** Generate threshold nudges based on user persona

```typescript
// apps/api/src/optimization/engine/persona-threshold.service.ts
import { Injectable } from '@nestjs/common';
import { CategoryAssignment, PersonaType, ThresholdNudge, TravelCost } from '@tillless/types';

interface PersonaThresholds {
  savingsThreshold: number; // Minimum R savings to suggest switch
  travelThreshold: number;  // Maximum minutes willing to travel
}

@Injectable()
export class PersonaThresholdService {
  private readonly thresholds: Record<PersonaType, PersonaThresholds> = {
    THRIFTY: { savingsThreshold: 10, travelThreshold: 15 },
    BALANCED: { savingsThreshold: 30, travelThreshold: 10 },
    PREMIUM_FRESH: { savingsThreshold: 50, travelThreshold: 5 },
    TIME_SAVER: { savingsThreshold: 100, travelThreshold: 0 },
  };

  async generateNudges(
    assignments: CategoryAssignment[],
    personaType: PersonaType,
    travelCosts: Map<string, TravelCost>
  ): Promise<ThresholdNudge[]> {
    const persona = this.thresholds[personaType];
    const nudges: ThresholdNudge[] = [];

    for (const assignment of assignments) {
      // Check if savings exceed persona threshold
      if (assignment.savings >= persona.savingsThreshold) {
        const travel = travelCosts.get(assignment.retailerId);

        // Check if travel time is acceptable
        if (travel && travel.travelTime <= persona.travelThreshold) {
          nudges.push({
            categoryId: assignment.categoryId,
            currentRetailer: assignment.retailerId,
            suggestedRetailer: assignment.retailerId, // Already optimal
            savings: assignment.savings,
            travelTime: travel.travelTime,
            message: `Save R${assignment.savings} on ${assignment.categoryId} by shopping at ${assignment.retailerId} (${travel.travelTime} min away)`,
            accepted: false,
          });
        }
      }
    }

    // Sort nudges by savings (highest first)
    return nudges.sort((a, b) => b.savings - a.savings);
  }

  getPersonaThresholds(personaType: PersonaType): PersonaThresholds {
    return this.thresholds[personaType];
  }
}
```

### 11.3.6 OptimizationResultBuilder

**Responsibility:** Aggregate all results into final OptimizationResult object

```typescript
// apps/api/src/optimization/engine/optimization-result.builder.ts
import { Injectable } from '@nestjs/common';
import { CategoryAssignment, ThresholdNudge, TravelCost, OptimizationResult } from '@tillless/types';

@Injectable()
export class OptimizationResultBuilder {
  build(
    assignments: CategoryAssignment[],
    nudges: ThresholdNudge[],
    travelCosts: Map<string, TravelCost>
  ): OptimizationResult {
    // Calculate baseline cost (shopping at single most expensive retailer)
    const totalsByRetailer = new Map<string, number>();
    for (const assignment of assignments) {
      const current = totalsByRetailer.get(assignment.retailerId) || 0;
      totalsByRetailer.set(assignment.retailerId, current + assignment.subtotal);
    }

    const baselineCost = Math.max(...Array.from(totalsByRetailer.values()));

    // Calculate optimized cost (sum of all category subtotals + unique travel costs)
    const uniqueRetailers = new Set(assignments.map(a => a.retailerId));
    const optimizedCategoryCost = assignments.reduce((sum, a) => sum + a.subtotal, 0);
    const totalTravelCost = Array.from(uniqueRetailers).reduce(
      (sum, id) => sum + (travelCosts.get(id)?.cost || 0),
      0
    );
    const optimizedCost = optimizedCategoryCost + totalTravelCost;

    // Calculate total savings
    const totalSavings = baselineCost - optimizedCost;

    return {
      shoppingListId: '', // Will be set by OptimizationService
      assignments,
      nudges,
      baselineCost,
      optimizedCost,
      totalSavings,
      travelCost: totalTravelCost,
      storeCount: uniqueRetailers.size,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    };
  }
}
```

### 11.3.7 OptimizationModule Provider Configuration

```typescript
// apps/api/src/optimization/optimization.module.ts
import { Module } from '@nestjs/common';
import { OptimizationService } from './optimization.service';
import { OptimizationRouter } from './optimization.router';
import { CategoryAssignmentStrategy } from './engine/category-assignment.strategy';
import { TravelCostCalculator } from './engine/travel-cost.calculator';
import { PersonaThresholdService } from './engine/persona-threshold.service';
import { OptimizationResultBuilder } from './engine/optimization-result.builder';
import { PrismaModule } from '../common/prisma.module';
import { RedisModule } from '../common/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  providers: [
    // Facade (orchestrator)
    OptimizationService,

    // Sub-services (single responsibility)
    CategoryAssignmentStrategy,
    TravelCostCalculator,
    PersonaThresholdService,
    OptimizationResultBuilder,

    // Router
    OptimizationRouter,
  ],
  exports: [OptimizationService],
})
export class OptimizationModule {}
```

**Benefits of This Design:**

1. **Single Responsibility:** Each class has one clear job (~60-120 lines each)
2. **Testability:** Each sub-service can be unit tested in isolation with mocked dependencies
3. **AI Agent Friendly:** Clear boundaries, explicit interfaces, manageable complexity
4. **Maintainability:** Changes to travel cost logic don't affect category assignment
5. **Reusability:** TravelCostCalculator can be used by other modules (e.g., retailer proximity search)
6. **Type Safety:** All dependencies injected via constructor, fully typed with interfaces
7. **Performance:** Facade pattern allows easy addition of parallel execution (Promise.all)
