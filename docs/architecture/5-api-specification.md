# 5. API Specification

## 5.1 tRPC Router Structure

**Shopping Router** (`apps/api/src/shopping/shopping.router.ts`)
```typescript
export const shoppingRouter = router({
  // Shopping Lists
  createList: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(100),
      totalBudget: z.number().positive().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.shoppingList.create({
        data: {
          ...input,
          userId: ctx.user.id,
        },
      });
    }),
    
  getList: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.shoppingList.findUnique({
        where: { id: input.id },
        include: {
          items: {
            include: {
              product: {
                include: { category: true }
              }
            }
          },
          categoryBudgets: true,
        },
      });
    }),
    
  addItem: protectedProcedure
    .input(z.object({
      listId: z.string().uuid(),
      productName: z.string(),
      quantity: z.number().int().positive(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Auto-categorization logic here
      const category = await categorizeProduct(input.productName);
      // Add item...
    }),
});
```

**Retailer Router** (`apps/api/src/retailer/retailer.router.ts`)
```typescript
export const retailerRouter = router({
  list: publicProcedure
    .query(async ({ ctx }) => {
      return ctx.prisma.retailer.findMany({
        where: { enabled: true },
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          websiteUrl: true,
          dataSource: true,
        },
      });
    }),
    
  getPrices: protectedProcedure
    .input(z.object({
      productIds: z.array(z.string().uuid()),
      retailerIds: z.array(z.string().uuid()).optional(),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.price.findMany({
        where: {
          productId: { in: input.productIds },
          retailerId: input.retailerIds ? { in: input.retailerIds } : undefined,
          snapshotDate: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
        orderBy: { snapshotDate: 'desc' },
      });
    }),
});
```

**Optimization Router** (`apps/api/src/optimization/optimization.router.ts`)
```typescript
export const optimizationRouter = router({
  optimize: protectedProcedure
    .input(OptimizationRequestSchema)
    .mutation(async ({ ctx, input }) => {
      // Check cache first
      const cached = await ctx.redis.get(`opt:${input.shoppingListId}`);
      if (cached) return JSON.parse(cached);
      
      // Run optimization engine
      const result = await optimizationEngine.optimize(input);
      
      // Cache for 5 minutes
      await ctx.redis.setex(
        `opt:${input.shoppingListId}`,
        300,
        JSON.stringify(result)
      );
      
      return result;
    }),
});
```

## 5.2 REST Endpoints

**Webhooks** (`apps/api/src/webhooks/webhooks.controller.ts`)
```typescript
@Controller('webhooks')
export class WebhooksController {
  @Post('supabase-auth')
  async handleAuthWebhook(@Body() payload: any) {
    // Handle Supabase auth events
  }
  
  @Post('crowdsourced-price')
  @UseGuards(ApiKeyGuard)
  async handleCrowdsourcedPrice(@Body() payload: PriceSubmission) {
    // Process crowdsourced price submissions
  }
}
```
