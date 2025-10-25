# 16. Testing Strategy

## 16.1 Unit Tests (Vitest)

```typescript
// libs/shared/src/utils/categorizer.test.ts
describe('ProductCategorizer', () => {
  it('should categorize milk as dairy', () => {
    const result = categorize('milk');
    expect(result.category).toBe('dairy-eggs');
    expect(result.confidence).toBeGreaterThan(0.9);
  });
});
```

## 16.2 Integration Tests (Testcontainers)

```typescript
// apps/api/test/shopping.integration.test.ts
describe('Shopping API', () => {
  let container: PostgreSqlContainer;
  
  beforeAll(async () => {
    container = await new PostgreSqlContainer().start();
    // Setup DB
  });
  
  it('should create shopping list', async () => {
    const result = await trpc.shopping.createList.mutate({
      name: 'Test List',
    });
    expect(result.id).toBeDefined();
  });
});
```

## 16.3 E2E Tests (Playwright)

```typescript
// apps/web/e2e/shopping-flow.spec.ts
test('user can create list and add items', async ({ page }) => {
  await page.goto('/dashboard');
  await page.click('text=New List');
  await page.fill('[name=name]', 'Groceries');
  await page.click('text=Create');
  
  await page.click('text=Add Item');
  await page.fill('[name=product]', 'milk');
  await page.press('[name=product]', 'Enter');
  
  await expect(page.locator('text=milk')).toBeVisible();
});
```
