# Dynamic Retailer Plugin Architecture

**Date:** 2025-01-19
**Status:** Architecture Specification
**Priority:** 🔴 CRITICAL - Foundation for entire system

---

## 1. Executive Summary

**Problem:** Current architecture hardcodes retailers (`RETAILERS.CHECKERS`, `RETAILERS.PICK_N_PAY`, etc.), making it difficult to:
- Add new retailers without code changes
- Remove retailers dynamically
- Support multiple ingestion methods per retailer
- Extend with new ingestion strategies in the future

**Solution:** Implement a **plugin-based, database-driven retailer management system** where:
- Retailers are **data**, not code
- Ingestion methods are **strategies**, not hardcoded logic
- Adding a retailer is a **configuration task**, not a development task
- The system is **open for extension, closed for modification**

---

## 2. Core Principles

### 2.1 Design Principles

**1. Data-Driven Configuration**
```
Retailers live in the database, not in constants files.
Configuration changes don't require deployments.
```

**2. Strategy Pattern for Ingestion**
```
Each ingestion method (scraping, API, CSV, manual) is a pluggable strategy.
New strategies can be added without modifying existing code.
```

**3. Retailer Adapters**
```
Each retailer has an adapter that handles retailer-specific logic.
Adapters are discovered dynamically at runtime.
```

**4. Admin-Driven Management**
```
Non-technical users can add/remove/configure retailers via admin UI.
No code changes needed for retailer lifecycle management.
```

---

## 3. Architecture Overview

### 3.1 System Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                         Admin UI                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Retailer Management Dashboard                            │  │
│  │  - Add Retailer  - Configure Ingestion  - Enable/Disable │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Retailer Registry Service                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  - Load retailers from DB                                 │  │
│  │  - Validate retailer configuration                        │  │
│  │  - Discover and register adapters                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Ingestion Strategy Factory                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Strategy Router: Select strategy based on retailer config│  │
│  │                                                            │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │  │
│  │  │ Scraper  │  │   API    │  │   CSV    │  │  Manual  │ │  │
│  │  │ Strategy │  │ Strategy │  │ Strategy │  │ Strategy │ │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │  │
│  │  (Playwright)   (HTTP Client) (File Upload)  (Web Form) │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Retailer Adapters                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Each retailer has an adapter (discovered dynamically)    │  │
│  │                                                            │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │  │
│  │  │  Checkers  │  │ Pick n Pay │  │  Shoprite  │  ...    │  │
│  │  │  Adapter   │  │  Adapter   │  │  Adapter   │         │  │
│  │  └────────────┘  └────────────┘  └────────────┘         │  │
│  │  - Parse HTML      - API Auth      - Price format       │  │
│  │  - Extract prices  - Map fields    - Category mapping   │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Canonical Product Registry                      │
│                     (Database Storage)                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Database Schema

### 4.1 Retailer Configuration Schema

```prisma
// libs/database/prisma/schema.prisma

model Retailer {
  id              String   @id @default(uuid())
  slug            String   @unique  // e.g., "checkers", "pick-n-pay"
  name            String              // e.g., "Checkers"
  displayName     String              // e.g., "Checkers Sixty60"

  // Status
  isActive        Boolean  @default(true)
  isVisible       Boolean  @default(true)  // Show in UI

  // Branding
  logoUrl         String?
  brandColor      String?  // Hex color for UI
  websiteUrl      String?

  // Contact
  supportEmail    String?
  supportPhone    String?

  // Metadata
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  createdBy       String?  // Admin user ID

  // Relations
  ingestionConfigs   RetailerIngestionConfig[]
  stores             Store[]
  items              RetailerItem[]
  loyaltyPrograms    LoyaltyProgram[]

  @@map("retailers")
}

model RetailerIngestionConfig {
  id              String   @id @default(uuid())
  retailerId      String

  // Ingestion Strategy
  strategy        IngestionStrategy  // SCRAPER, API, CSV_UPLOAD, MANUAL
  priority        Int      @default(0)  // Higher priority strategies tried first
  isActive        Boolean  @default(true)

  // Strategy-Specific Configuration (JSON)
  config          Json     // { url, selectors, apiKey, etc. }

  // Scheduling
  cadence         String?  // Cron expression: "0 */4 * * *" = every 4 hours
  lastRun         DateTime?
  nextRun         DateTime?

  // Health
  successCount    Int      @default(0)
  failureCount    Int      @default(0)
  lastError       String?
  lastErrorAt     DateTime?

  // Metadata
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  retailer        Retailer @relation(fields: [retailerId], references: [id], onDelete: Cascade)

  @@map("retailer_ingestion_configs")
}

enum IngestionStrategy {
  SCRAPER        // Playwright-based web scraping
  API            // HTTP API integration
  CSV_UPLOAD     // Periodic CSV file upload
  MANUAL         // Manual data entry via admin UI
  WEBHOOK        // Retailer pushes data to us
  RSS_FEED       // RSS/Atom feed parsing
  EMAIL_SCRAPER  // Parse promotional emails
}

model Store {
  id              String   @id @default(uuid())
  retailerId      String

  // Store Info
  name            String
  code            String?  // Store code (e.g., "JHB001")

  // Location
  address         String
  city            String
  province        String
  postalCode      String?
  latitude        Decimal?
  longitude       Decimal?

  // Contact
  phone           String?
  email           String?

  // Operating Hours (JSON)
  hours           Json?    // { "monday": "08:00-20:00", ... }

  // Services
  hasDelivery     Boolean  @default(false)
  hasClickCollect Boolean  @default(false)

  // Status
  isActive        Boolean  @default(true)

  // Metadata
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  retailer        Retailer @relation(fields: [retailerId], references: [id], onDelete: Cascade)

  @@unique([retailerId, code])
  @@map("stores")
}

model LoyaltyProgram {
  id              String   @id @default(uuid())
  retailerId      String

  // Program Info
  name            String   // e.g., "Xtra Savings"
  description     String?

  // Signup
  signupUrl       String?
  requiresCard    Boolean  @default(true)

  // Benefits
  discountType    String?  // PERCENTAGE, FIXED_AMOUNT, POINTS
  averageSavings  Decimal? // Average % savings

  // Status
  isActive        Boolean  @default(true)

  // Metadata
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  retailer        Retailer @relation(fields: [retailerId], references: [id], onDelete: Cascade)

  @@unique([retailerId, name])
  @@map("loyalty_programs")
}
```

### 4.2 Example Retailer Configuration (JSON)

**Scraper Strategy Config:**
```json
{
  "strategy": "SCRAPER",
  "config": {
    "baseUrl": "https://www.checkers.co.za",
    "categoryUrls": [
      "/groceries/dairy-eggs-milk",
      "/groceries/bakery",
      "/groceries/meat-seafood"
    ],
    "selectors": {
      "productCard": ".product-card",
      "name": ".product-name",
      "price": ".product-price",
      "loyaltyPrice": ".xtra-price",
      "image": ".product-image img",
      "inStock": ".stock-status"
    },
    "pagination": {
      "type": "load-more",
      "buttonSelector": ".load-more-btn"
    },
    "rateLimit": {
      "requestsPerSecond": 2,
      "concurrentRequests": 3
    },
    "headers": {
      "User-Agent": "TillLess/1.0 (+https://tillless.co.za/bot)"
    }
  },
  "cadence": "0 */4 * * *"
}
```

**API Strategy Config:**
```json
{
  "strategy": "API",
  "config": {
    "baseUrl": "https://api.retailer.com/v2",
    "endpoints": {
      "products": "/products",
      "prices": "/prices",
      "stock": "/inventory"
    },
    "authentication": {
      "type": "oauth2",
      "clientId": "{{SECRET:RETAILER_CLIENT_ID}}",
      "clientSecret": "{{SECRET:RETAILER_CLIENT_SECRET}}",
      "tokenUrl": "https://auth.retailer.com/oauth/token"
    },
    "rateLimit": {
      "requestsPerMinute": 60
    },
    "fieldMapping": {
      "productId": "sku",
      "productName": "name",
      "price": "pricing.retail",
      "loyaltyPrice": "pricing.member"
    }
  },
  "cadence": "0 */2 * * *"
}
```

**CSV Upload Strategy Config:**
```json
{
  "strategy": "CSV_UPLOAD",
  "config": {
    "uploadPath": "/admin/retailers/{retailerId}/upload",
    "requiredColumns": ["sku", "name", "price", "category"],
    "optionalColumns": ["loyaltyPrice", "size", "unit", "brand"],
    "validation": {
      "maxFileSize": "10MB",
      "allowedFormats": ["csv", "xlsx"],
      "requireHeader": true
    },
    "fieldMapping": {
      "sku": "Product Code",
      "name": "Product Name",
      "price": "Retail Price",
      "loyaltyPrice": "Member Price"
    }
  },
  "cadence": null
}
```

---

## 5. Ingestion Strategy Pattern

### 5.1 Strategy Interface

```typescript
// packages/ingestion-core/src/strategies/base-strategy.ts

export interface IngestionStrategy {
  /**
   * Unique identifier for this strategy
   */
  readonly name: IngestionStrategyType;

  /**
   * Validate configuration before execution
   */
  validateConfig(config: unknown): Promise<ValidationResult>;

  /**
   * Execute the ingestion process
   */
  execute(
    retailer: Retailer,
    config: RetailerIngestionConfig
  ): Promise<IngestionResult>;

  /**
   * Test connectivity/auth without full ingestion
   */
  testConnection(config: RetailerIngestionConfig): Promise<TestResult>;

  /**
   * Get configuration schema for admin UI
   */
  getConfigSchema(): JSONSchema;
}

export interface IngestionResult {
  success: boolean;
  itemsIngested: number;
  itemsSkipped: number;
  errors: IngestionError[];
  duration: number;
  metadata?: Record<string, unknown>;
}

export interface IngestionError {
  severity: 'error' | 'warning';
  message: string;
  context?: unknown;
}
```

### 5.2 Strategy Implementations

**Scraper Strategy:**
```typescript
// packages/ingestion-strategies/src/scraper-strategy.ts

import { IngestionStrategy } from '@tillless/ingestion-core';
import { Browser, Page } from 'playwright';

export class ScraperStrategy implements IngestionStrategy {
  readonly name = 'SCRAPER';

  async execute(retailer: Retailer, config: RetailerIngestionConfig): Promise<IngestionResult> {
    const scraperConfig = config.config as ScraperConfig;
    const adapter = this.getAdapter(retailer.slug);

    const browser = await this.launchBrowser();
    const results: Product[] = [];

    try {
      for (const categoryUrl of scraperConfig.categoryUrls) {
        const page = await browser.newPage();
        const products = await adapter.scrapePage(page, categoryUrl, scraperConfig.selectors);
        results.push(...products);
      }

      return {
        success: true,
        itemsIngested: results.length,
        itemsSkipped: 0,
        errors: [],
        duration: Date.now() - startTime,
      };
    } finally {
      await browser.close();
    }
  }

  private getAdapter(retailerSlug: string): RetailerAdapter {
    // Dynamic adapter discovery
    return AdapterRegistry.get(retailerSlug);
  }
}
```

**API Strategy:**
```typescript
// packages/ingestion-strategies/src/api-strategy.ts

export class ApiStrategy implements IngestionStrategy {
  readonly name = 'API';

  async execute(retailer: Retailer, config: RetailerIngestionConfig): Promise<IngestionResult> {
    const apiConfig = config.config as ApiConfig;
    const adapter = AdapterRegistry.get(retailer.slug);

    // Authenticate
    const auth = await this.authenticate(apiConfig.authentication);

    // Fetch data
    const products = await this.fetchProducts(apiConfig, auth);

    // Transform using adapter
    const transformed = products.map(p => adapter.transformApiResponse(p));

    return {
      success: true,
      itemsIngested: transformed.length,
      itemsSkipped: 0,
      errors: [],
      duration: Date.now() - startTime,
    };
  }
}
```

**CSV Upload Strategy:**
```typescript
// packages/ingestion-strategies/src/csv-upload-strategy.ts

export class CsvUploadStrategy implements IngestionStrategy {
  readonly name = 'CSV_UPLOAD';

  async execute(retailer: Retailer, config: RetailerIngestionConfig): Promise<IngestionResult> {
    const csvConfig = config.config as CsvUploadConfig;
    const adapter = AdapterRegistry.get(retailer.slug);

    // Wait for admin to upload file (this strategy is passive)
    // Actual execution happens via admin UI upload endpoint

    throw new Error('CSV_UPLOAD strategy requires manual file upload via admin UI');
  }

  async processUpload(file: Buffer, retailer: Retailer, config: CsvUploadConfig): Promise<IngestionResult> {
    const parsed = await this.parseCsv(file, config);
    const adapter = AdapterRegistry.get(retailer.slug);

    const transformed = parsed.map(row => adapter.transformCsvRow(row, config.fieldMapping));

    return {
      success: true,
      itemsIngested: transformed.length,
      itemsSkipped: 0,
      errors: [],
      duration: Date.now() - startTime,
    };
  }
}
```

### 5.3 Strategy Registry

```typescript
// packages/ingestion-core/src/strategy-registry.ts

export class StrategyRegistry {
  private static strategies = new Map<IngestionStrategyType, IngestionStrategy>();

  static register(strategy: IngestionStrategy): void {
    this.strategies.set(strategy.name, strategy);
  }

  static get(name: IngestionStrategyType): IngestionStrategy {
    const strategy = this.strategies.get(name);
    if (!strategy) {
      throw new Error(`Unknown ingestion strategy: ${name}`);
    }
    return strategy;
  }

  static getAll(): IngestionStrategy[] {
    return Array.from(this.strategies.values());
  }
}

// Auto-register all strategies on module load
StrategyRegistry.register(new ScraperStrategy());
StrategyRegistry.register(new ApiStrategy());
StrategyRegistry.register(new CsvUploadStrategy());
StrategyRegistry.register(new ManualStrategy());
StrategyRegistry.register(new WebhookStrategy());
StrategyRegistry.register(new RssFeedStrategy());
StrategyRegistry.register(new EmailScraperStrategy());
```

---

## 6. Retailer Adapter System

### 6.1 Adapter Interface

```typescript
// packages/retailer-adapters/src/base-adapter.ts

export interface RetailerAdapter {
  /**
   * Retailer slug this adapter handles
   */
  readonly retailerSlug: string;

  /**
   * Scraping-specific methods
   */
  scrapePage?(page: Page, url: string, selectors: Selectors): Promise<Product[]>;

  /**
   * API-specific methods
   */
  transformApiResponse?(apiData: unknown): Product;

  /**
   * CSV-specific methods
   */
  transformCsvRow?(row: Record<string, string>, mapping: FieldMapping): Product;

  /**
   * Product normalization (common across all strategies)
   */
  normalizeProduct(raw: RawProduct): NormalizedProduct;

  /**
   * Price extraction (handles retailer-specific formats)
   */
  extractPrice(priceString: string): number;

  /**
   * Category mapping (retailer taxonomy → our taxonomy)
   */
  mapCategory(retailerCategory: string): string;
}
```

### 6.2 Example Adapter

```typescript
// packages/retailer-adapters/src/adapters/checkers-adapter.ts

export class CheckersAdapter implements RetailerAdapter {
  readonly retailerSlug = 'checkers';

  async scrapePage(page: Page, url: string, selectors: Selectors): Promise<Product[]> {
    await page.goto(url);

    const productCards = await page.locator(selectors.productCard).all();
    const products: Product[] = [];

    for (const card of productCards) {
      const name = await card.locator(selectors.name).textContent();
      const priceText = await card.locator(selectors.price).textContent();
      const loyaltyPriceText = await card.locator(selectors.loyaltyPrice).textContent();

      products.push({
        name: name.trim(),
        price: this.extractPrice(priceText),
        loyaltyPrice: loyaltyPriceText ? this.extractPrice(loyaltyPriceText) : undefined,
        // ... more fields
      });
    }

    return products;
  }

  extractPrice(priceString: string): number {
    // Checkers-specific: "R 12.99" or "R12.99" or "1299c"
    const cleaned = priceString.replace(/[R\s]/g, '');

    if (cleaned.endsWith('c')) {
      // Cents notation: "1299c" = R12.99
      return parseInt(cleaned.replace('c', ''), 10) / 100;
    }

    return parseFloat(cleaned);
  }

  mapCategory(retailerCategory: string): string {
    const mapping = {
      'Dairy, Eggs & Milk': 'dairy',
      'Bakery': 'bakery',
      'Meat & Seafood': 'meat-seafood',
      // ... more mappings
    };

    return mapping[retailerCategory] || 'uncategorized';
  }
}
```

### 6.3 Adapter Registry

```typescript
// packages/retailer-adapters/src/adapter-registry.ts

export class AdapterRegistry {
  private static adapters = new Map<string, RetailerAdapter>();

  static register(adapter: RetailerAdapter): void {
    this.adapters.set(adapter.retailerSlug, adapter);
  }

  static get(retailerSlug: string): RetailerAdapter {
    const adapter = this.adapters.get(retailerSlug);

    if (!adapter) {
      // Fallback to generic adapter
      console.warn(`No adapter found for ${retailerSlug}, using GenericAdapter`);
      return new GenericAdapter(retailerSlug);
    }

    return adapter;
  }

  static has(retailerSlug: string): boolean {
    return this.adapters.has(retailerSlug);
  }
}

// Auto-register all adapters
AdapterRegistry.register(new CheckersAdapter());
AdapterRegistry.register(new PickNPayAdapter());
AdapterRegistry.register(new ShopriteAdapter());
AdapterRegistry.register(new WoolworthsAdapter());
AdapterRegistry.register(new MakroAdapter());
```

---

## 7. Admin UI Specification

### 7.1 Retailer Management Dashboard

**Route:** `/admin/retailers`

**Features:**
- List all retailers (active + inactive)
- Quick enable/disable toggle
- Add new retailer button
- Edit retailer configuration
- View ingestion health metrics

**UI Components:**
```typescript
// apps/web/src/app/(admin)/retailers/page.tsx

export default function RetailersPage() {
  const { data: retailers } = useGetRetailersQuery();

  return (
    <div>
      <h1>Retailer Management</h1>

      <Button onClick={() => openModal('add-retailer')}>
        + Add Retailer
      </Button>

      <Table>
        <thead>
          <tr>
            <th>Retailer</th>
            <th>Status</th>
            <th>Ingestion Methods</th>
            <th>Last Run</th>
            <th>Success Rate</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {retailers.map(r => (
            <tr key={r.id}>
              <td>
                <img src={r.logoUrl} className="w-8 h-8" />
                {r.displayName}
              </td>
              <td>
                <Toggle checked={r.isActive} onChange={() => toggleRetailer(r.id)} />
              </td>
              <td>
                {r.ingestionConfigs.map(c => (
                  <Badge>{c.strategy}</Badge>
                ))}
              </td>
              <td>{formatDate(r.lastRun)}</td>
              <td>{calculateSuccessRate(r)}%</td>
              <td>
                <Button onClick={() => editRetailer(r.id)}>Edit</Button>
                <Button onClick={() => testIngestion(r.id)}>Test</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
```

### 7.2 Add Retailer Wizard

**Step 1: Basic Information**
```
- Retailer Name: [Checkers        ]
- Display Name:  [Checkers Sixty60]
- Slug:          [checkers         ] (auto-generated, editable)
- Website URL:   [https://www.checkers.co.za]
- Logo Upload:   [Choose File]
- Brand Color:   [#FF6B00] (color picker)
```

**Step 2: Ingestion Configuration**
```
Strategy: [Dropdown: Scraper, API, CSV Upload, Manual]

(If Scraper selected)
  Base URL:         [https://www.checkers.co.za]
  Category URLs:    [+ Add URL]
    - /groceries/dairy
    - /groceries/bakery

  Selectors (JSON): [Code editor with schema validation]

  Cadence:          [Every 4 hours ▼]

(If API selected)
  API Base URL:     [https://api.checkers.com]
  Auth Type:        [OAuth 2.0 ▼]
  Client ID:        [secret]
  Client Secret:    [secret]
  Field Mapping:    [Visual mapper]

(If CSV Upload selected)
  Required Columns: [sku, name, price]
  Optional Columns: [loyaltyPrice, brand]
  Upload Schedule:  [Manual / Automated]
```

**Step 3: Store Locations (Optional)**
```
Import Stores from: [CSV Upload / Manual Entry / API]

If CSV:
  [Upload File]
  Expected columns: name, address, city, latitude, longitude

If Manual:
  Store Name:  [Checkers Sandton]
  Address:     [123 Main St]
  City:        [Johannesburg]
  Coordinates: [Lat: -26.xxx, Lng: 28.xxx]
  [+ Add Another Store]
```

**Step 4: Loyalty Program (Optional)**
```
Program Name:        [Xtra Savings]
Signup URL:          [https://www.checkers.co.za/xtra]
Requires Card:       [✓]
Average Savings:     [5%]
```

**Step 5: Review & Activate**
```
Review Configuration:
  ✓ Basic info complete
  ✓ Ingestion configured
  ✓ 0 stores added (optional)
  ✓ Loyalty program configured

[Test Connection] button
  → Validates scraper works / API auth succeeds

[Save as Draft] [Activate Retailer]
```

### 7.3 Configuration Management

**Edit Retailer Config:**
```
/admin/retailers/{id}/config

- Visual JSON editor with schema validation
- Live preview of configuration
- "Test Configuration" button (runs ingestion dry-run)
- Version history (track config changes)
- Rollback to previous version
```

**Ingestion Logs:**
```
/admin/retailers/{id}/logs

Recent Ingestion Runs:
  Date       | Strategy | Items | Duration | Status
  2025-01-19 | SCRAPER  | 1,234 | 45s      | ✓ Success
  2025-01-19 | API      | 0     | 5s       | ✗ Auth Failed

[View Details] → Shows errors, warnings, sample data
```

---

## 8. Dynamic Retailer Discovery

### 8.1 Service Layer

```typescript
// apps/backend/src/modules/retailers/retailer-registry.service.ts

@Injectable()
export class RetailerRegistryService {
  constructor(
    private prisma: PrismaService,
    private adapterRegistry: AdapterRegistry,
    private strategyRegistry: StrategyRegistry,
  ) {}

  /**
   * Load all active retailers from database
   */
  async getActiveRetailers(): Promise<Retailer[]> {
    return this.prisma.retailer.findMany({
      where: { isActive: true },
      include: {
        ingestionConfigs: { where: { isActive: true } },
        loyaltyPrograms: true,
      },
    });
  }

  /**
   * Get retailer by slug (for optimization queries)
   */
  async getBySlug(slug: string): Promise<Retailer | null> {
    return this.prisma.retailer.findUnique({
      where: { slug, isActive: true },
      include: { ingestionConfigs: true },
    });
  }

  /**
   * Execute ingestion for a specific retailer
   */
  async ingestRetailer(retailerId: string): Promise<IngestionResult> {
    const retailer = await this.prisma.retailer.findUnique({
      where: { id: retailerId },
      include: { ingestionConfigs: { where: { isActive: true } } },
    });

    if (!retailer) {
      throw new NotFoundException('Retailer not found');
    }

    // Try strategies in priority order
    const sortedConfigs = retailer.ingestionConfigs.sort((a, b) => b.priority - a.priority);

    for (const config of sortedConfigs) {
      try {
        const strategy = this.strategyRegistry.get(config.strategy);
        const result = await strategy.execute(retailer, config);

        if (result.success) {
          await this.updateIngestionStats(config.id, result);
          return result;
        }
      } catch (error) {
        await this.logIngestionError(config.id, error);
      }
    }

    throw new Error('All ingestion strategies failed');
  }
}
```

### 8.2 Scheduled Ingestion

```typescript
// apps/backend/src/modules/retailers/ingestion-scheduler.service.ts

@Injectable()
export class IngestionSchedulerService {
  @Cron('0 * * * *') // Every hour
  async runScheduledIngestions() {
    const configs = await this.prisma.retailerIngestionConfig.findMany({
      where: {
        isActive: true,
        nextRun: { lte: new Date() },
      },
      include: { retailer: true },
    });

    for (const config of configs) {
      // Queue ingestion job (use pg-boss or Temporal)
      await this.queueService.enqueue('ingestion-job', {
        retailerId: config.retailer.id,
        configId: config.id,
      });

      // Update nextRun based on cadence
      const nextRun = this.calculateNextRun(config.cadence);
      await this.prisma.retailerIngestionConfig.update({
        where: { id: config.id },
        data: { nextRun },
      });
    }
  }
}
```

---

## 9. Frontend Integration (Dynamic Retailers)

### 9.1 Retailer Selector Component

```typescript
// apps/web/src/components/features/retailers/RetailerSelector.tsx

export function RetailerSelector() {
  const { data: retailers, isLoading } = useGetActiveRetailersQuery();

  if (isLoading) return <Skeleton />;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {retailers?.map(retailer => (
        <Card
          key={retailer.id}
          className="cursor-pointer hover:shadow-lg transition-shadow"
          style={{ borderColor: retailer.brandColor }}
        >
          <img src={retailer.logoUrl} alt={retailer.name} className="h-16" />
          <h3>{retailer.displayName}</h3>
          <Badge>{retailer.loyaltyPrograms[0]?.name}</Badge>
        </Card>
      ))}
    </div>
  );
}
```

### 9.2 RTK Query API (Dynamic)

```typescript
// apps/web/src/store/api/retailersApi.ts

export const retailersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getActiveRetailers: builder.query<Retailer[], void>({
      query: () => '/retailers?active=true',
      providesTags: ['Retailer'],
    }),

    getRetailerBySlug: builder.query<Retailer, string>({
      query: (slug) => `/retailers/${slug}`,
      providesTags: (_result, _error, slug) => [{ type: 'Retailer', id: slug }],
    }),

    // Admin endpoints
    createRetailer: builder.mutation<Retailer, CreateRetailerDto>({
      query: (body) => ({
        url: '/admin/retailers',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Retailer'],
    }),

    updateRetailerConfig: builder.mutation<Retailer, { id: string; config: IngestionConfig }>({
      query: ({ id, config }) => ({
        url: `/admin/retailers/${id}/config`,
        method: 'PATCH',
        body: config,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Retailer', id }],
    }),

    testIngestion: builder.mutation<TestResult, string>({
      query: (retailerId) => ({
        url: `/admin/retailers/${retailerId}/test-ingestion`,
        method: 'POST',
      }),
    }),
  }),
});
```

---

## 10. Migration Path (Hardcoded → Dynamic)

### 10.1 Phase 1: Seed Database with Initial Retailers

```typescript
// libs/database/prisma/seeds/retailers.seed.ts

export async function seedRetailers(prisma: PrismaClient) {
  const retailers = [
    {
      slug: 'checkers',
      name: 'Checkers',
      displayName: 'Checkers Sixty60',
      websiteUrl: 'https://www.checkers.co.za',
      brandColor: '#FF6B00',
      isActive: true,
      ingestionConfigs: {
        create: [
          {
            strategy: 'SCRAPER',
            priority: 1,
            config: {
              baseUrl: 'https://www.checkers.co.za',
              selectors: { /* ... */ },
            },
            cadence: '0 */4 * * *',
          },
        ],
      },
      loyaltyPrograms: {
        create: [
          {
            name: 'Xtra Savings',
            requiresCard: true,
            averageSavings: 5.0,
          },
        ],
      },
    },
    // ... Pick n Pay, Shoprite, Woolworths, Makro
  ];

  for (const retailer of retailers) {
    await prisma.retailer.upsert({
      where: { slug: retailer.slug },
      update: retailer,
      create: retailer,
    });
  }
}
```

### 10.2 Phase 2: Deprecate Hardcoded Constants

```typescript
// libs/shared/src/constants/retailers.ts (DEPRECATED)

/**
 * @deprecated Use RetailerRegistryService.getActiveRetailers() instead
 * This constant will be removed in v2.0.0
 */
export const RETAILERS = {
  CHECKERS: 'checkers',
  PICK_N_PAY: 'pick-n-pay',
  // ...
} as const;
```

### 10.3 Phase 3: Update Code References

**Before:**
```typescript
import { RETAILERS } from '@tillless/shared';

const checkersItems = await getRetailerItems(RETAILERS.CHECKERS);
```

**After:**
```typescript
const checkers = await retailerRegistry.getBySlug('checkers');
const checkersItems = await getRetailerItems(checkers.id);
```

---

## 11. Extensibility Examples

### 11.1 Adding a New Retailer (Woolworths Food)

**Admin Action:**
1. Go to `/admin/retailers`
2. Click "Add Retailer"
3. Fill in:
   - Name: Woolworths Food
   - Slug: woolworths-food
   - Website: https://www.woolworths.co.za/cat/Food
4. Select strategy: SCRAPER
5. Configure selectors (or upload CSV)
6. Click "Test Connection" → ✓ Success
7. Click "Activate Retailer"

**Result:** Woolworths Food now appears in:
- Optimization queries
- Retailer selector UI
- Scheduled ingestion jobs

**No code changes needed!**

### 11.2 Adding a New Ingestion Method (WhatsApp Bot)

**Step 1: Implement Strategy**
```typescript
// packages/ingestion-strategies/src/whatsapp-strategy.ts

export class WhatsAppStrategy implements IngestionStrategy {
  readonly name = 'WHATSAPP';

  async execute(retailer: Retailer, config: RetailerIngestionConfig): Promise<IngestionResult> {
    // Connect to WhatsApp Business API
    // Parse messages with price lists
    // Extract products
  }
}
```

**Step 2: Register Strategy**
```typescript
StrategyRegistry.register(new WhatsAppStrategy());
```

**Step 3: Add to Enum**
```prisma
enum IngestionStrategy {
  // ... existing strategies
  WHATSAPP  // NEW
}
```

**Step 4: Use in Admin UI**
```
Strategy: [WhatsApp Bot ▼]
  Phone Number: [+27 xxx]
  Expected Format: [Price list with #price tags]
```

**Result:** Any retailer can now use WhatsApp ingestion!

---

## 12. Testing Strategy

### 12.1 Unit Tests

```typescript
// packages/retailer-adapters/__tests__/checkers-adapter.test.ts

describe('CheckersAdapter', () => {
  it('should extract price from "R 12.99"', () => {
    const adapter = new CheckersAdapter();
    expect(adapter.extractPrice('R 12.99')).toBe(12.99);
  });

  it('should extract price from "1299c"', () => {
    const adapter = new CheckersAdapter();
    expect(adapter.extractPrice('1299c')).toBe(12.99);
  });

  it('should map category correctly', () => {
    const adapter = new CheckersAdapter();
    expect(adapter.mapCategory('Dairy, Eggs & Milk')).toBe('dairy');
  });
});
```

### 12.2 Integration Tests

```typescript
describe('RetailerRegistryService', () => {
  it('should load active retailers from database', async () => {
    const retailers = await service.getActiveRetailers();
    expect(retailers).toHaveLength(5);
    expect(retailers[0]).toHaveProperty('ingestionConfigs');
  });

  it('should execute ingestion for retailer', async () => {
    const result = await service.ingestRetailer('checkers-id');
    expect(result.success).toBe(true);
    expect(result.itemsIngested).toBeGreaterThan(0);
  });
});
```

### 12.3 E2E Tests (Admin UI)

```typescript
test('Admin can add new retailer', async ({ page }) => {
  await page.goto('/admin/retailers');
  await page.click('button:has-text("Add Retailer")');

  await page.fill('[name="name"]', 'Test Retailer');
  await page.fill('[name="slug"]', 'test-retailer');
  await page.selectOption('[name="strategy"]', 'CSV_UPLOAD');

  await page.click('button:has-text("Activate Retailer")');

  await expect(page.locator('text=Test Retailer')).toBeVisible();
});
```

---

## 13. Performance Considerations

### 13.1 Caching

```typescript
// Cache active retailers for 5 minutes
@Cacheable({ ttl: 300 })
async getActiveRetailers(): Promise<Retailer[]> {
  return this.prisma.retailer.findMany({ where: { isActive: true } });
}
```

### 13.2 Lazy Loading Adapters

```typescript
// Don't load all adapters upfront, load on-demand
class AdapterRegistry {
  private static loadAdapter(slug: string): RetailerAdapter {
    // Dynamic import
    const AdapterClass = require(`./adapters/${slug}-adapter`).default;
    return new AdapterClass();
  }
}
```

---

## 14. Security Considerations

### 14.1 Admin Access Control

```typescript
@UseGuards(AdminGuard)
@Controller('admin/retailers')
export class AdminRetailersController {
  // Only admins can manage retailers
}
```

### 14.2 Configuration Validation

```typescript
// Validate retailer config before saving
async validateConfig(config: unknown): Promise<void> {
  // Check for malicious selectors (XSS in scraper config)
  // Validate URLs (no internal network URLs)
  // Sanitize API keys
}
```

### 14.3 Secrets Management

```
API keys stored in config should reference secrets:
  "apiKey": "{{SECRET:RETAILER_API_KEY}}"

Actual values stored in secure vault (Supabase Vault / AWS Secrets Manager)
```

---

## 15. Implementation Timeline

| Phase | Tasks | Duration |
|-------|-------|----------|
| **Phase 1: Foundation** | Database schema, base interfaces | 3 days |
| **Phase 2: Strategy Pattern** | Implement 3 strategies (Scraper, API, CSV) | 5 days |
| **Phase 3: Adapter System** | Create 5 retailer adapters | 5 days |
| **Phase 4: Admin UI** | Retailer management dashboard | 7 days |
| **Phase 5: Migration** | Seed database, update code references | 2 days |
| **Phase 6: Testing** | Unit, integration, E2E tests | 3 days |
| **Total** | | **25 days (~5 weeks)** |

---

## 16. Success Criteria

**Dynamic Retailer Management:**
- ✅ Add new retailer via admin UI (no code deployment)
- ✅ Remove retailer via admin UI (immediately reflected in optimization)
- ✅ Change ingestion strategy without code changes

**Extensibility:**
- ✅ New ingestion strategy added in <1 day
- ✅ New retailer adapter created in <2 days
- ✅ System supports 20+ retailers without performance degradation

**Admin Experience:**
- ✅ Non-technical admin can add retailer in <10 minutes
- ✅ Configuration validation catches 90%+ errors before activation
- ✅ Test connection feature works for all strategies

---

**Author:** Claude Code - Architect Agent
**Review Status:** Pending stakeholder approval
**Next Steps:** Get feedback → Update Prisma schema → Implement Phase 1
