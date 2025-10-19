# Implementation Transition Guide: Analysis → Development

**Transition Date:** October 17, 2025
**Phase:** Analysis Complete → MVP Development Sprint
**Target:** 9-Week MVP Delivery (3 × 3-week sprints)

---

## Executive Summary

**🎉 Congratulations!** Your analysis phase is complete. You have a comprehensive strategic foundation:

✅ **Strategic Documents Complete:**
- Product Requirements Document (PRD) with clear MVP scope
- Technical Architecture (Next.js + NestJS + Supabase + Temporalite)
- Market Research (R823M TAM, 4.3M addressable households)
- Competitive Analysis (Troli primary threat, 6-12 month differentiation window)
- Project Brief (executive summary for stakeholders)
- Analysis Review (92% completeness, minor refinements identified)

✅ **Epic Roadmap Defined:**
- Epic 1: Data Backbone (Weeks 1-3) + **Leaflet Manual Entry (Week 3)**
- Epic 2: Optimization Engine (Weeks 4-6) + **Leaflet OCR Automation (Week 4)**
- Epic 3: Shopping List Experience (Weeks 4-6, parallel to Epic 2)
- Epic 4: Account & Auth (Weeks 4-6, parallel)
- Epic 5: Feedback Loop (Weeks 7-8)
- Epic 6: Ops & Reliability (Weeks 7-9)

✅ **Success Criteria Clear:**
- 500 active users within 3 months post-launch
- ≥8% average savings (validated via receipt reconciliation)
- ≥95% product matching accuracy
- ≤30 second optimization runtime (60-item lists)

**This guide provides:**
1. **Pre-Development Checklist** (decisions to finalize before coding)
2. **Week-by-Week Sprint Plan** (9-week roadmap with deliverables)
3. **Developer Onboarding Guide** (environment setup, repo structure)
4. **Key Decision Register** (architecture choices requiring confirmation)
5. **Risk Mitigation Plan** (top 5 risks + monitoring strategy)

---

## Part 1: Pre-Development Checklist

### Critical Decisions (Finalize Before Week 1)

**✅ Completed Decisions:**
- [x] Tech stack finalized (Next.js, NestJS, Supabase, Temporalite, BetterAuth)
- [x] Hosting strategy (Vercel + Railway + Supabase)
- [x] Retailer coverage (Checkers, Pick n Pay, Shoprite, Woolworths, Makro)
- [x] MVP scope (single-store optimization, loyalty + travel modeling, receipt reconciliation)
- [x] Success metrics (8% savings, 95% accuracy, 500 users, ≤30s runtime)

**⚠️ Pending Decisions (Resolve in Next 2-3 Days):**

1. **Retailer Scraping Playbook: Create or Defer?**
   - **Option A:** Create detailed playbook now (4 hours) → comprehensive retailer-specific guides
   - **Option B:** Defer to Sprint 1 implementation (create as you build scrapers)
   - **Recommendation:** Option B (defer) — scraping details emerge during implementation; avoid premature documentation
   - **Action:** Remove references from PRD Appendix OR add placeholder "To be completed in Epic 1"

2. **Google Maps API vs. OSRM for Travel Distance**
   - **Option A:** Google Maps API ($200/month free credit, 40,000 requests) — easy integration, accurate
   - **Option B:** OSRM self-hosted (free, complex setup, requires OpenStreetMap data) — cost-effective long-term
   - **Recommendation:** Option A for MVP (speed to market), migrate to OSRM in Phase 2 if needed
   - **Action:** Confirm Google Maps API key setup (Google Cloud Console)

3. **Monorepo Tool: Nx with pnpm Workspaces**
   - **Chosen:** Nx (powerful build system, excellent caching, TypeScript-first)
   - **Benefits:** Smart build orchestration, dependency graph visualization, powerful generators
   - **Why Nx:** Better for TypeScript monorepos, superior task scheduling, built-in project.json configurations
   - **Action:** Nx monorepo structure initialized (see Developer Onboarding section)

4. **Authentication Flow: Magic Link vs. Password vs. OAuth**
   - **Current Plan:** BetterAuth (supports all methods)
   - **Decision Needed:** Which auth method(s) to enable for MVP?
   - **Recommendation:** Password + Google OAuth (covers 90% of users, skip magic link for MVP)
   - **Action:** Configure BetterAuth providers in `apps/api/src/auth/auth.config.ts`

5. **CSV Import Format: Strict vs. Flexible Parsing**
   - **Strict:** Require exact column headers ("Item, Qty, Size, Brand Lock, Substitution Tolerance")
   - **Flexible:** Auto-detect columns, suggest mappings ("Did you mean 'Item' → 'Product Name'?")
   - **Recommendation:** Strict for MVP (reduce edge cases), add flexibility in Phase 1.5
   - **Action:** Document CSV template in UI + provide downloadable example

### Environment Setup Checklist

**🔧 Infrastructure Setup (Week 0 - Before Coding Starts):**

- [ ] **Supabase Project Created**
  - [ ] Create project: https://supabase.com/dashboard
  - [ ] Note connection string: `postgresql://postgres:[password]@[host]:5432/postgres`
  - [ ] Enable pg-boss extension: `CREATE EXTENSION IF NOT EXISTS pg_boss;`
  - [ ] Configure storage bucket: `receipts` (restricted, user-only access)

- [ ] **Vercel Account Ready**
  - [ ] Connect GitHub repo to Vercel
  - [ ] Configure Next.js app deployment (`apps/web`)
  - [ ] Set environment variables (Supabase URL, anon key, API endpoint)

- [ ] **Railway Account**
  - [ ] Sign up: https://railway.app (free $5/month credit)
  - [ ] Deploy NestJS API (`apps/api`)
  - [ ] Deploy Temporalite scheduler (Docker container)
  - [ ] Deploy Playwright scrapers (background workers)

- [ ] **Google Cloud Console**
  - [ ] Enable Maps JavaScript API + Distance Matrix API
  - [ ] Create API key (restrict to Vercel domains for security)
  - [ ] Set monthly budget alert ($50 to avoid overages)

- [ ] **BetterAuth Configuration**
  - [ ] Install BetterAuth in `apps/api`
  - [ ] Configure providers (password, Google OAuth)
  - [ ] Set up JWT secret (generate secure 32-char string)

- [ ] **Monitoring & Alerting**
  - [ ] Set up Sentry (error tracking): https://sentry.io
  - [ ] Configure Supabase alerts (database CPU >80%, storage >400MB)
  - [ ] Temporalite dashboard (local access via http://localhost:8233)

### Repository Structure Setup

**📁 Monorepo Structure (Nx):**

```
tillless/
├── apps/
│   ├── web/                  # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/          # App Router (Next.js 14+)
│   │   │   ├── components/   # React components
│   │   │   ├── lib/          # Client utilities
│   │   │   └── styles/       # Tailwind CSS
│   │   ├── package.json
│   │   └── project.json      # Nx project config
│   ├── api/                  # NestJS backend
│   │   ├── src/
│   │   │   ├── modules/      # Feature modules (optimization, scrapers, auth)
│   │   │   └── main.ts       # Bootstrap
│   │   ├── package.json
│   │   └── project.json      # Nx project config
│   └── admin/                # Admin panel (leaflet entry, OCR)
│       ├── src/
│       ├── package.json
│       └── project.json      # Nx project config
├── libs/
│   ├── database/             # Prisma schema + database client
│   │   ├── prisma/
│   │   │   └── schema.prisma # Database schema
│   │   ├── src/
│   │   │   └── client.ts     # Prisma client singleton
│   │   ├── package.json
│   │   └── project.json      # Nx project config
│   ├── shared/               # Shared TypeScript types
│   │   └── src/
│   │       ├── types/        # TypeScript interfaces
│   │       ├── utils/        # Utility functions
│   │       └── constants/    # Shared constants
│   ├── scrapers/             # Playwright scraping workers
│   │   └── src/
│   │       ├── checkers.ts   # Checkers Sixty60 scraper
│   │       ├── pickpay.ts    # Pick n Pay scraper
│   │       └── base.ts       # Shared scraping utilities
│   ├── ocr/                  # OCR service (Week 4)
│   │   └── src/
│   │       ├── azure-ocr.service.ts  # Azure Computer Vision
│   │       ├── tesseract.service.ts  # Tesseract fallback
│   │       └── parser.ts     # NLP parsing
│   └── config/               # Shared config (ESLint, Prettier, tsconfig)
├── docs/                     # All documentation (PRD, architecture, etc.)
├── tools/                    # Build scripts, custom generators
├── .github/
│   └── workflows/
│       └── ci.yml            # GitHub Actions (build, test, deploy)
├── nx.json                   # Nx workspace config
├── package.json              # Root package.json (workspaces)
└── README.md
```

**Action:** Create this structure via:
```bash
npx create-turbo@latest
# Select: pnpm, TypeScript, basic template
# Then manually add apps/api (NestJS), libs/scrapers, libs/shared
```

---

## Part 2: Week-by-Week Sprint Plan (9 Weeks to MVP)

### **Sprint 1: Data Backbone Foundations (Weeks 1-3)**

#### Week 1: Infrastructure & Schema Setup

**Epic 1, Story 1.1: Data Backbone Bootstrap**

**Deliverables:**
- [ ] Monorepo initialized (Nx, pnpm workspaces)
- [ ] Supabase project configured (Postgres, pg-boss extension)
- [ ] Prisma schema created (Canonical Product Registry tables)
- [ ] Initial migration run (`prisma migrate dev --name init`)
- [ ] Seed data: 50 common products (milk, bread, eggs, etc.) with dummy prices

**Developer Tasks:**
1. Initialize Nx workspace: `npx create-nx-workspace@latest tillless --preset=ts`
2. Set up Supabase:
   - Create project, note connection string
   - Run: `CREATE EXTENSION IF NOT EXISTS pg_boss;`
3. Create Prisma schema in `apps/api/prisma/schema.prisma`:
   ```prisma
   model Product {
     id            String   @id @default(uuid())
     name          String
     brand         String?
     category      String
     gtinBarcode   String?  @unique
     createdAt     DateTime @default(now())
     updatedAt     DateTime @updatedAt

     retailerPrices RetailerPrice[]
   }

   model RetailerPrice {
     id           String   @id @default(uuid())
     productId    String
     product      Product  @relation(fields: [productId], references: [id])
     retailer     String   // "Checkers", "PickNPay", etc.
     price        Float
     loyaltyPrice Float?
     promoPrice   Float?
     unitSize     String
     inStock      Boolean  @default(true)
     lastScraped  DateTime @default(now())
     createdAt    DateTime @default(now())
     updatedAt    DateTime @updatedAt
   }

   model User {
     id          String   @id @default(uuid())
     email       String   @unique
     name        String?
     loyaltyCards Json?   // {"xtraSavings": "1234...", "smartShopper": "5678..."}
     homeLocation Json?   // {lat: -26.2041, lng: 28.0473} Johannesburg
     preferences  Json?   // {maxStores: 1, maxDistance: 10, timeValuePerHour: 100}
     createdAt    DateTime @default(now())
     updatedAt    DateTime @updatedAt
   }
   ```
4. Run migration: `pnpm --filter @tillless/api prisma migrate dev --name init`
5. Seed database with 50 products (manual SQL or Prisma seed script)

**Success Criteria:**
- Prisma schema deployed to Supabase
- 50 seed products queryable via Prisma Client
- CI/CD pipeline runs migrations on deploy

---

#### Week 2: Scraper Foundation (Checkers + Pick n Pay)

**Epic 1, Story 1.2: Shoprite & Pick n Pay Ingestion**

**Deliverables:**
- [ ] Playwright scrapers built for Checkers Sixty60 and Pick n Pay
- [ ] Scrapers output structured JSON (product name, price, loyalty price, stock status)
- [ ] pg-boss queue configured (scrapers push results to queue)
- [ ] Normalization worker consumes queue, matches products to CPR

**Developer Tasks:**
1. Create scraper base class in `libs/scrapers/src/base.ts`:
   ```typescript
   export abstract class RetailerScraper {
     abstract retailerName: string;
     abstract scrape(): Promise<ScrapedProduct[]>;

     async run() {
       const products = await this.scrape();
       await this.pushToQueue(products);
     }

     private async pushToQueue(products: ScrapedProduct[]) {
       // pg-boss.send('product-ingestion', {retailer, products})
     }
   }
   ```

2. Implement Checkers scraper (`libs/scrapers/src/checkers.ts`):
   ```typescript
   export class CheckersScraper extends RetailerScraper {
     retailerName = 'Checkers';

     async scrape() {
       const browser = await playwright.chromium.launch();
       const page = await browser.newPage();
       await page.goto('https://www.sixty60.co.za/...');

       // Extract products, prices, loyalty pricing
       const products = await page.$$eval('.product-card', cards =>
         cards.map(card => ({
           name: card.querySelector('.name').textContent,
           price: parseFloat(card.querySelector('.price').textContent),
           loyaltyPrice: card.querySelector('.xtra-price')?.textContent,
           // ...
         }))
       );

       await browser.close();
       return products;
     }
   }
   ```

3. Set up pg-boss queue in `apps/api/src/modules/ingestion/queue.service.ts`:
   ```typescript
   @Injectable()
   export class QueueService {
     private boss: PgBoss;

     async onModuleInit() {
       this.boss = new PgBoss(process.env.DATABASE_URL);
       await this.boss.start();

       // Worker: consume product-ingestion jobs
       await this.boss.work('product-ingestion', async (job) => {
         const {retailer, products} = job.data;
         await this.normalizationService.matchProducts(retailer, products);
       });
     }
   }
   ```

4. Implement normalization worker (match scraped products to CPR):
   ```typescript
   @Injectable()
   export class NormalizationService {
     async matchProducts(retailer: string, scrapedProducts: ScrapedProduct[]) {
       for (const scraped of scrapedProducts) {
         // Heuristic matching: normalize string, check brand, size
         const match = await this.findBestMatch(scraped);

         if (match) {
           await prisma.retailerPrice.upsert({
             where: {productId_retailer: {productId: match.id, retailer}},
             update: {price: scraped.price, loyaltyPrice: scraped.loyaltyPrice},
             create: {productId: match.id, retailer, price: scraped.price, ...}
           });
         } else {
           // Low confidence — queue for manual review
           await prisma.unmatchedProduct.create({retailer, scrapedData: scraped});
         }
       }
     }
   }
   ```

**Success Criteria:**
- Scrapers run successfully for Checkers + Pick n Pay (200+ products each)
- 85% of products auto-matched to CPR (15% queued for manual review)
- pg-boss queue processing <5 seconds per 100 products

---

#### Week 3: Scraper Expansion + Monitoring + Leaflet Admin Panel

**Epic 1, Story 1.3: Woolworths, Makro, Shoprite** + **Story 1.4: Ingestion Monitoring Dashboard** + **Leaflet Manual Entry System**

**Deliverables:**
- [ ] Scrapers built for Woolworths, Shoprite, Makro (3 additional retailers)
- [ ] All 5 retailers scraped successfully (1,000+ products total)
- [ ] Temporalite workflows scheduled (2-4 hour cadence per retailer)
- [ ] Monitoring dashboard (Grafana or simple Next.js admin panel)
- [ ] **NEW: Manual leaflet entry admin panel** (for Food Lover's Market, Spars)

**Developer Tasks:**
1. Replicate scraper pattern for Woolworths, Shoprite, Makro (similar to Week 2)
2. Configure Temporalite workflows in `apps/api/src/modules/scheduling/`:
   ```typescript
   @Workflow()
   export class ScraperWorkflow {
     @WorkflowMethod()
     async runScrapers() {
       // Run Checkers scraper every 2 hours
       await this.checkersScraper.run();
       await sleep('2 hours');

       // Repeat for each retailer with staggered timing
     }
   }
   ```
3. Build monitoring dashboard (Next.js admin panel at `/admin`):
   - Show last scrape timestamp per retailer
   - Display success/failure counts (24-hour window)
   - Alert if scraper fails 3x in a row (email via SendGrid)

4. **NEW: Build leaflet ingestion system (manual entry MVP):**

   **a) Add database schema (Prisma):**
   ```prisma
   model Leaflet {
     id            String   @id @default(uuid())
     retailer      String   // "FoodLoversMarket", "SparRandburg"
     weekStart     DateTime
     weekEnd       DateTime
     status        String   // "pending", "processing", "completed"
     dataSource    String   // "manual", "ocr"
     uploadedBy    String?  // userId
     createdAt     DateTime @default(now())
     updatedAt     DateTime @updatedAt
     items         LeafletItem[]
   }

   model LeafletItem {
     id               String   @id @default(uuid())
     leafletId        String
     leaflet          Leaflet  @relation(fields: [leafletId], references: [id])
     rawText          String
     productName      String?
     brand            String?
     size             String?
     price            Float?
     matchedProductId String?
     matchConfidence  Float?
     manuallyReviewed Boolean  @default(false)
     createdAt        DateTime @default(now())
     updatedAt        DateTime @updatedAt
   }

   model LeafletReviewQueue {
     id            String      @id @default(uuid())
     leafletItemId String      @unique
     leafletItem   LeafletItem @relation(fields: [leafletItemId], references: [id])
     reason        String      // "no_cpr_match", "low_confidence"
     priority      Int         // 1-5
     reviewedBy    String?
     reviewedAt    DateTime?
     createdAt     DateTime    @default(now())
   }
   ```

   **b) Add `dataSource` field to RetailerPrice:**
   ```prisma
   model RetailerPrice {
     // ... existing fields ...
     dataSource   String  @default("scraper") // "scraper", "leaflet_manual", "leaflet_ocr"
     validUntil   DateTime? // For leaflets: end of week (Sunday)
   }
   ```

   **c) Build admin panel (`apps/web/src/app/admin/leaflets/page.tsx`):**
   - Manual entry form: retailer selector, week range, dynamic item fields
   - CSV bulk import option (optional for speed)
   - Submit → API processes items

   **d) Create API endpoint (`apps/api/src/modules/leaflets/`):**
   - `POST /api/admin/leaflets` (create leaflet + items)
   - Process items: parse, match to CPR, update RetailerPrice
   - Queue low-confidence items for review

   **e) Build review queue (`apps/web/src/app/admin/review-queue/page.tsx`):**
   - Display unmatched items
   - Suggest top 5 CPR matches
   - Admin manually links item to CPR

**Success Criteria:**
- All 5 online retailers scraped successfully (Checkers, PnP, Shoprite, Woolworths, Makro)
- Temporalite running 24/7 (Docker Compose on Railway)
- Monitoring dashboard shows green status (95% scraper uptime)
- **Manual leaflet entry working** (admin can enter 20-item Food Lover's leaflet in 10 min)
- **Leaflet prices appear in optimization results** (integrated with RetailerPrice table)

---

### **Sprint 2: Optimization Engine + Frontend (Weeks 4-6)**

#### Week 4: Optimization Algorithm Core + OCR Automation

**Epic 2, Story 2.1: Optimization Service Foundation** + **Leaflet OCR Automation (Azure Free Tier)**

**Deliverables:**
- [ ] Optimization API endpoint (`POST /api/optimize`)
- [ ] Basket cost calculation (price + loyalty + promotions + travel)
- [ ] Single-store recommendation (cheapest total cost)
- [ ] **NEW: OCR leaflet processing** (Azure Computer Vision free tier)
- [ ] **NEW: Automated leaflet parsing** (NLP regex patterns for SA retailers)

**Developer Tasks:**

**Part A: Optimization Engine (Same as before)**

1. Create optimization module in `apps/api/src/modules/optimization/`:
   ```typescript
   @Injectable()
   export class OptimizationService {
     async optimizeBasket(req: OptimizationRequest): Promise<OptimizationResult> {
       const {shoppingList, userId} = req;
       const user = await prisma.user.findUnique({where: {id: userId}});

       const results = await Promise.all(
         RETAILERS.map(retailer => this.calculateBasketCost(shoppingList, retailer, user))
       );

       // Sort by total cost (ascending), return cheapest
       return results.sort((a, b) => a.totalCost - b.totalCost)[0];
     }

     private async calculateBasketCost(list, retailer, user) {
       let subtotal = 0;
       let loyaltySavings = 0;
       let travelCost = 0;

       for (const item of list) {
         const product = await this.matchItem(item, retailer);
         const price = user.hasLoyaltyCard(retailer) ? product.loyaltyPrice : product.price;
         subtotal += price * item.quantity;

         if (product.loyaltyPrice < product.price) {
           loyaltySavings += (product.price - product.loyaltyPrice) * item.quantity;
         }
       }

       // Calculate travel cost (Google Maps API)
       const distance = await this.getDistance(user.homeLocation, retailer.location);
       travelCost = (distance * user.preferences.costPerKm) +
                    (distance / 60 * user.preferences.timeValuePerHour);

       return {
         retailer,
         subtotal,
         loyaltySavings,
         travelCost,
         totalCost: subtotal - loyaltySavings + travelCost
       };
     }
   }
   ```

2. Expose REST endpoint:
   ```typescript
   @Controller('optimize')
   export class OptimizationController {
     @Post()
     async optimize(@Body() req: OptimizationRequest) {
       return this.optimizationService.optimizeBasket(req);
     }
   }
   ```

**Part B: OCR Automation (Azure Computer Vision Free Tier)**

2. **Set up Azure Computer Vision (10 minutes):**

   **a) Create free Azure account:**
   - Go to: https://azure.microsoft.com/free/
   - Sign up (no credit card required for free tier)
   - Navigate to Azure Portal

   **b) Create Computer Vision resource:**
   - Search "Computer Vision" → Create
   - **Pricing Tier:** F0 (Free) ← CRITICAL!
   - Region: South Africa North or West Europe
   - Deploy (1 minute)

   **c) Get API credentials:**
   - Go to resource → "Keys and Endpoint"
   - Copy Key 1 and Endpoint URL
   - Add to `.env`:
     ```bash
     AZURE_COMPUTER_VISION_KEY=your-key-here
     AZURE_COMPUTER_VISION_ENDPOINT=https://your-endpoint.cognitiveservices.azure.com/
     ```

3. **Install Azure SDK:**
   ```bash
   pnpm add @azure/cognitiveservices-computervision @azure/ms-rest-js
   pnpm add pdf-poppler sharp  # For PDF-to-image conversion
   ```

4. **Create OCR Service (`apps/api/src/modules/leaflets/ocr.service.ts`):**

   ```typescript
   import { Injectable } from '@nestjs/common';
   import { ComputerVisionClient } from '@azure/cognitiveservices-computervision';
   import { ApiKeyCredentials } from '@azure/ms-rest-js';
   import { exec } from 'child_process';
   import { promisify } from 'util';
   import * as fs from 'fs/promises';
   import * as path from 'path';
   import sharp from 'sharp';

   const execAsync = promisify(exec);

   @Injectable()
   export class OCRService {
     private client: ComputerVisionClient;

     constructor() {
       const credentials = new ApiKeyCredentials({
         inHeader: {
           'Ocp-Apim-Subscription-Key': process.env.AZURE_COMPUTER_VISION_KEY
         }
       });

       this.client = new ComputerVisionClient(
         credentials,
         process.env.AZURE_COMPUTER_VISION_ENDPOINT
       );
     }

     /**
      * Extract text from image using Azure Computer Vision
      * FREE: 5,000 transactions/month (supports 78 retailers)
      */
     async extractText(imageBuffer: Buffer): Promise<string> {
       const result = await this.client.readInStream(imageBuffer);
       const operationLocation = result.operationLocation;
       const operationId = operationLocation.split('/').slice(-1)[0];

       // Poll for result
       let readResult = await this.client.getReadResult(operationId);
       while (readResult.status === 'running' || readResult.status === 'notStarted') {
         await this.sleep(500);
         readResult = await this.client.getReadResult(operationId);
       }

       if (readResult.status === 'failed') {
         throw new Error('OCR failed');
       }

       // Extract all text lines
       const lines: string[] = [];
       for (const page of readResult.analyzeResult.readResults) {
         for (const line of page.lines) {
           lines.push(line.text);
         }
       }

       return lines.join('\n');
     }

     /**
      * Process PDF: convert to images, OCR each page
      */
     async extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
       const tempDir = '/tmp/tillless-ocr';
       await fs.mkdir(tempDir, { recursive: true });
       const pdfPath = path.join(tempDir, `leaflet-${Date.now()}.pdf`);
       await fs.writeFile(pdfPath, pdfBuffer);

       try {
         // Convert PDF to images (requires poppler: brew install poppler)
         const outputPrefix = path.join(tempDir, 'page');
         await execAsync(`pdftoppm -png "${pdfPath}" "${outputPrefix}"`);

         // Read generated images
         const files = await fs.readdir(tempDir);
         const imageFiles = files
           .filter(f => f.startsWith('page-') && f.endsWith('.png'))
           .sort();

         // OCR each page
         const allText: string[] = [];
         for (const imageFile of imageFiles) {
           const imagePath = path.join(tempDir, imageFile);
           const imageBuffer = await fs.readFile(imagePath);

           // Compress image (optional, reduces processing time)
           const compressedBuffer = await sharp(imageBuffer)
             .resize(2000, null, { withoutEnlargement: true })
             .jpeg({ quality: 85 })
             .toBuffer();

           const pageText = await this.extractText(compressedBuffer);
           allText.push(pageText);

           await fs.unlink(imagePath);
         }

         await fs.unlink(pdfPath);

         return allText.join('\n\n--- PAGE BREAK ---\n\n');
       } catch (error) {
         console.error('PDF processing error:', error);
         throw new Error('PDF to image conversion failed');
       }
     }

     /**
      * Parse leaflet text into structured items (SA retailer formats)
      */
     parseLeafletText(rawText: string): Array<{
       productName: string;
       brand?: string;
       size: string;
       price: number;
       confidence: number;
       rawLine: string;
     }> {
       const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
       const items = [];

       for (const line of lines) {
         // Pattern 1: "Nescafe Gold 200g R89.99" or "Nescafe Gold 200g - R89.99"
         let match = line.match(/^(.+?)\s+(\d+(?:g|kg|ml|l|ea|pack))\s*[-–]?\s*R?\s*(\d+[.,]\d{2})$/i);

         if (match) {
           const [, productName, size, priceStr] = match;
           items.push({
             productName: productName.trim(),
             size: size.trim(),
             price: parseFloat(priceStr.replace(',', '.')),
             confidence: 0.9,
             rawLine: line
           });
           continue;
         }

         // Pattern 2: "2 for R50" or "3 for R100" promotions
         const promoMatch = line.match(/^(.+?)\s+(\d+)\s*for\s*R?\s*(\d+[.,]?\d*)$/i);
         if (promoMatch) {
           const [, productName, quantity, totalPrice] = promoMatch;
           const unitPrice = parseFloat(totalPrice.replace(',', '.')) / parseInt(quantity);
           items.push({
             productName: productName.trim(),
             size: 'promo',
             price: unitPrice,
             confidence: 0.85,
             rawLine: line + ` (${quantity} for R${totalPrice})`
           });
           continue;
         }

         // Pattern 3: Fallback — just product, size, price somewhere in line
         const fallbackMatch = line.match(/(.+?)\s+(\d+[a-z]+).*?R?\s*(\d+[.,]\d{2})/i);
         if (fallbackMatch) {
           const [, productName, size, priceStr] = fallbackMatch;
           items.push({
             productName: productName.trim(),
             size: size.trim(),
             price: parseFloat(priceStr.replace(',', '.')),
             confidence: 0.6,
             rawLine: line
           });
         }
       }

       return items.filter(item => item.productName && item.productName.length > 0);
     }

     private sleep(ms: number): Promise<void> {
       return new Promise(resolve => setTimeout(resolve, ms));
     }
   }
   ```

5. **Update Leaflet Controller (add OCR endpoint):**

   ```typescript
   @Controller('admin/leaflets')
   @UseGuards(AdminGuard)
   export class LeafletsController {
     constructor(
       private leafletsService: LeafletsService,
       private ocrService: OCRService
     ) {}

     // Existing manual entry endpoint...

     @Post('ocr')
     @UseInterceptors(FileInterceptor('file'))
     async processLeafletOCR(
       @UploadedFile() file: Express.Multer.File,
       @Body() dto: { retailer: string; weekStart: string }
     ) {
       // 1. Extract text via OCR
       const rawText = file.mimetype === 'application/pdf'
         ? await this.ocrService.extractTextFromPDF(file.buffer)
         : await this.ocrService.extractText(file.buffer);

       // 2. Parse text into structured items
       const parsedItems = this.ocrService.parseLeafletText(rawText);

       // 3. Create leaflet record
       const leaflet = await this.prisma.leaflet.create({
         data: {
           retailer: dto.retailer,
           weekStart: new Date(dto.weekStart),
           weekEnd: new Date(new Date(dto.weekStart).getTime() + 6 * 24 * 60 * 60 * 1000),
           status: 'processing',
           dataSource: 'ocr',
           pdfUrl: `uploads/${file.filename}` // Store in Supabase Storage
         }
       });

       // 4. Process each parsed item (same as manual flow)
       let reviewQueueCount = 0;
       for (const item of parsedItems) {
         const leafletItem = await this.prisma.leafletItem.create({
           data: {
             leafletId: leaflet.id,
             rawText: `${item.productName} ${item.size} - R${item.price}`,
             productName: item.productName,
             size: item.size,
             price: item.price,
             ocrConfidence: item.confidence
           }
         });

         // Match to CPR
         const match = await this.normalization.findBestMatch(item);

         if (match && match.confidence > 0.8 && item.confidence > 0.8) {
           // High-confidence OCR + CPR match → auto-link
           await this.prisma.leafletItem.update({
             where: { id: leafletItem.id },
             data: { matchedProductId: match.productId, matchConfidence: match.confidence }
           });

           await this.prisma.retailerPrice.upsert({
             where: { productId_retailer: { productId: match.productId, retailer: dto.retailer } },
             update: { price: item.price, dataSource: 'leaflet_ocr' },
             create: {
               productId: match.productId,
               retailer: dto.retailer,
               price: item.price,
               dataSource: 'leaflet_ocr',
               unitSize: item.size,
               inStock: true
             }
           });
         } else {
           // Low confidence → queue for review
           await this.prisma.leafletReviewQueue.create({
             data: {
               leafletItemId: leafletItem.id,
               reason: item.confidence < 0.8 ? 'low_ocr_confidence' : 'low_cpr_match',
               priority: item.confidence < 0.5 ? 5 : 3
             }
           });
           reviewQueueCount++;
         }
       }

       await this.prisma.leaflet.update({
         where: { id: leaflet.id },
         data: { status: 'completed' }
       });

       return {
         success: true,
         leafletId: leaflet.id,
         itemsExtracted: parsedItems.length,
         autoMatched: parsedItems.length - reviewQueueCount,
         reviewQueueCount
       };
     }
   }
   ```

6. **Update Admin Panel (add OCR upload option):**

   In `apps/web/src/app/admin/leaflets/page.tsx`, add:

   ```tsx
   const [uploadMethod, setUploadMethod] = useState<'manual' | 'ocr'>('ocr');
   const [file, setFile] = useState<File | null>(null);

   const handleOCRUpload = async () => {
     const formData = new FormData();
     formData.append('file', file);
     formData.append('retailer', retailer);
     formData.append('weekStart', weekStart);

     const res = await fetch('/api/admin/leaflets/ocr', {
       method: 'POST',
       body: formData
     });

     const result = await res.json();
     alert(`OCR Success! ${result.itemsExtracted} items found, ${result.autoMatched} auto-matched, ${result.reviewQueueCount} need review.`);
   };

   return (
     <div>
       <div className="mb-4">
         <label className="mr-4">
           <input type="radio" value="ocr" checked={uploadMethod === 'ocr'} onChange={(e) => setUploadMethod(e.target.value as any)} />
           Upload Leaflet (OCR - Recommended)
         </label>
         <label>
           <input type="radio" value="manual" checked={uploadMethod === 'manual'} onChange={(e) => setUploadMethod(e.target.value as any)} />
           Manual Entry
         </label>
       </div>

       {uploadMethod === 'ocr' && (
         <div className="border p-4 rounded mb-4">
           <h2 className="font-semibold mb-2">Upload Leaflet PDF/Image</h2>
           <input
             type="file"
             accept="application/pdf,image/*"
             onChange={(e) => setFile(e.target.files[0])}
             className="mb-2"
           />
           <button
             onClick={handleOCRUpload}
             className="bg-blue-500 text-white px-4 py-2 rounded"
           >
             Upload & Process with OCR (FREE - Azure)
           </button>
           <p className="text-sm text-gray-500 mt-2">
             Azure free tier: 5,000 leaflets/month (supports 78 retailers)
           </p>
         </div>
       )}

       {uploadMethod === 'manual' && (
         {/* Existing manual entry form */}
       )}
     </div>
   );
   ```

**Success Criteria:**
- Optimization API returns cheapest store for 60-item basket in <15 seconds
- Loyalty pricing applied correctly (validated via test cases)
- Travel cost calculated accurately (Google Maps Distance Matrix API)
- **OCR processes Food Lover's Market 4-page leaflet in <30 seconds**
- **80%+ auto-match rate** (20% queued for manual review)
- **Azure free tier confirmed working** (no costs incurred)

---

#### Week 5: Frontend Shopping List + Results UI

**Epic 3, Story 3.1: Shopping List UI** + **Story 3.3: Optimization Results UI**

**Deliverables:**
- [ ] Shopping list input form (Next.js, React Hook Form)
- [ ] CSV import functionality
- [ ] Results dashboard (recommended store, item comparison table)

**Developer Tasks:**
1. Create shopping list form in `apps/web/src/app/shop/page.tsx`:
   ```tsx
   export default function ShoppingListPage() {
     const { register, handleSubmit } = useForm();

     const onSubmit = async (data) => {
       const res = await fetch('/api/optimize', {
         method: 'POST',
         body: JSON.stringify({shoppingList: data.items, userId: '...'})
       });
       const result = await res.json();
       // Display results
     };

     return (
       <form onSubmit={handleSubmit(onSubmit)}>
         <input {...register('items.0.name')} placeholder="Item name" />
         <input {...register('items.0.quantity')} type="number" />
         {/* Repeat for multiple items */}
         <button type="submit">Optimize My Basket</button>
       </form>
     );
   }
   ```

2. Add CSV import:
   ```tsx
   const handleCSVUpload = (file: File) => {
     Papa.parse(file, {
       header: true,
       complete: (results) => {
         // results.data = [{Item: "Milk", Qty: "2", ...}, ...]
         setItems(results.data);
       }
     });
   };
   ```

3. Build results dashboard (`apps/web/src/app/results/page.tsx`):
   ```tsx
   export default function ResultsPage({result}: {result: OptimizationResult}) {
     return (
       <div>
         <h1>Recommended Store: {result.retailer}</h1>
         <p>Total Cost: R{result.totalCost} (Savings: R{result.savings})</p>

         <table>
           <thead>
             <tr><th>Item</th><th>Checkers</th><th>Pick n Pay</th>...</tr>
           </thead>
           <tbody>
             {result.items.map(item => (
               <tr>
                 <td>{item.name}</td>
                 <td>R{item.prices.Checkers}</td>
                 <td>R{item.prices.PickNPay}</td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>
     );
   }
   ```

**Success Criteria:**
- Users can manually enter 10-item list in <2 minutes
- CSV import works for 60-item lists (format validation)
- Results page loads in <1 second, shows clear recommendation

---

#### Week 6: User Auth + Preferences

**Epic 4, Story 4.1: BetterAuth Integration** + **Story 3.2: Preferences & Loyalty UI**

**Deliverables:**
- [ ] BetterAuth configured (password + Google OAuth)
- [ ] User registration/login flow
- [ ] Preferences page (loyalty cards, home location, effort tolerance)

**Developer Tasks:**
1. Configure BetterAuth in `apps/api/src/auth/auth.config.ts`:
   ```typescript
   export const authConfig = {
     secret: process.env.AUTH_SECRET,
     providers: [
       passwordProvider(),
       googleProvider({
         clientId: process.env.GOOGLE_CLIENT_ID,
         clientSecret: process.env.GOOGLE_CLIENT_SECRET
       })
     ],
     database: {
       // Prisma adapter for User table
     }
   };
   ```

2. Create login/register pages (`apps/web/src/app/auth/login/page.tsx`)

3. Build preferences page (`apps/web/src/app/preferences/page.tsx`):
   ```tsx
   export default function PreferencesPage() {
     return (
       <form>
         <h2>Loyalty Cards</h2>
         <label><input type="checkbox" /> Xtra Savings (Checkers)</label>
         <label><input type="checkbox" /> Smart Shopper (Pick n Pay)</label>

         <h2>Home Location</h2>
         <input type="text" placeholder="Enter address" />
         {/* Use Google Maps Autocomplete */}

         <h2>Effort Tolerance</h2>
         <label>Max Stores: <input type="number" min="1" max="3" /></label>
         <label>Max Distance: <input type="number" /> km</label>
         <label>Time Value: R<input type="number" /> per hour</label>
       </form>
     );
   }
   ```

**Success Criteria:**
- Users can register and log in (password or Google OAuth)
- Preferences saved to database, loaded on optimization requests
- Loyalty cards applied correctly in optimization (test with Xtra Savings enabled/disabled)

---

### **Sprint 3: Feedback Loop + Launch Prep (Weeks 7-9)**

#### Week 7: Receipt Reconciliation

**Epic 5, Story 5.1: Receipt Upload Pipeline**

**Deliverables:**
- [ ] Receipt upload UI (photo/PDF upload)
- [ ] Manual total entry (user inputs actual amount paid)
- [ ] Variance tracking (predicted vs. actual)

**Developer Tasks:**
1. Create receipt upload component:
   ```tsx
   export default function ReceiptUpload() {
     const [file, setFile] = useState<File | null>(null);

     const handleUpload = async () => {
       const formData = new FormData();
       formData.append('receipt', file);
       formData.append('actualTotal', actualTotal);

       await fetch('/api/receipts/upload', {method: 'POST', body: formData});
     };

     return (
       <div>
         <input type="file" accept="image/*,application/pdf" onChange={(e) => setFile(e.target.files[0])} />
         <input type="number" placeholder="Actual total paid (R)" value={actualTotal} onChange={...} />
         <button onClick={handleUpload}>Upload Receipt</button>
       </div>
     );
   }
   ```

2. Store receipt in Supabase Storage:
   ```typescript
   @Post('upload')
   async uploadReceipt(@UploadedFile() file, @Body() body) {
     const {actualTotal, optimizationId} = body;

     // Upload to Supabase Storage
     const {data} = await supabase.storage.from('receipts').upload(`${userId}/${Date.now()}.pdf`, file);

     // Save metadata
     await prisma.receipt.create({
       data: {userId, optimizationId, actualTotal, predictedTotal, receiptUrl: data.path}
     });

     // Calculate variance
     const variance = Math.abs(predictedTotal - actualTotal) / predictedTotal;
     if (variance > 0.05) {
       // >5% variance — queue for product mapping review
       await this.queueMappingReview(optimizationId);
     }
   }
   ```

**Success Criteria:**
- Users can upload receipt photos (stored in Supabase)
- Variance calculated (predicted vs. actual)
- High-variance cases queued for manual product mapping review

---

#### Week 8: Analytics + Savings Dashboard

**Epic 5, Story 5.2: Savings Analytics Dashboard**

**Deliverables:**
- [ ] User savings dashboard (monthly Rand saved, historical trends)
- [ ] Accuracy metrics (average variance, prediction confidence)

**Developer Tasks:**
1. Build savings dashboard (`apps/web/src/app/dashboard/page.tsx`):
   ```tsx
   export default function SavingsDashboard({userId}: {userId: string}) {
     const [stats, setStats] = useState<SavingsStats | null>(null);

     useEffect(() => {
       fetch(`/api/users/${userId}/savings`)
         .then(res => res.json())
         .then(setStats);
     }, [userId]);

     return (
       <div>
         <h1>Your Savings This Month: R{stats?.monthlySavings}</h1>
         <p>Total Saved (All Time): R{stats?.totalSaved}</p>
         <p>Average Prediction Accuracy: {stats?.avgAccuracy}%</p>

         <LineChart data={stats?.monthlyTrend} />
       </div>
     );
   }
   ```

2. Create savings API endpoint:
   ```typescript
   @Get('users/:id/savings')
   async getUserSavings(@Param('id') userId: string) {
     const receipts = await prisma.receipt.findMany({where: {userId}});

     const totalSaved = receipts.reduce((sum, r) => sum + (r.predictedTotal - r.actualTotal), 0);
     const avgVariance = receipts.reduce((sum, r) => sum + Math.abs(r.predictedTotal - r.actualTotal) / r.predictedTotal, 0) / receipts.length;

     return {
       monthlySavings: /* filter by this month */,
       totalSaved,
       avgAccuracy: (1 - avgVariance) * 100
     };
   }
   ```

**Success Criteria:**
- Dashboard shows total savings (R-value, accurate to receipts)
- Prediction accuracy visible (% variance, target >95%)
- User can see monthly trend (chart showing savings over time)

---

#### Week 9: Deployment + Beta Launch

**Epic 6, Story 6.1: CI/CD & Deployment** + **Story 6.2: Ops Runbooks**

**Deliverables:**
- [ ] Production deployment (Vercel + Railway)
- [ ] CI/CD pipeline (GitHub Actions: build → test → deploy)
- [ ] Monitoring & alerting (Sentry, Supabase alerts)
- [ ] Beta launch (20 Gauteng households recruited)

**Developer Tasks:**
1. Set up GitHub Actions (`.github/workflows/ci.yml`):
   ```yaml
   name: CI/CD
   on: [push, pull_request]
   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: pnpm/action-setup@v2
         - run: pnpm install
         - run: pnpm build
         - run: pnpm test

     deploy-frontend:
       needs: build
       if: github.ref == 'refs/heads/main'
       runs-on: ubuntu-latest
       steps:
         - run: vercel deploy --prod

     deploy-backend:
       needs: build
       if: github.ref == 'refs/heads/main'
       runs-on: ubuntu-latest
       steps:
         - run: railway up
   ```

2. Configure monitoring:
   - Sentry: Add DSN to environment variables
   - Supabase: Set alerts (CPU >80%, storage >400MB)
   - Temporalite: Monitor scraper success rate (dashboard at localhost:8233)

3. Create ops runbook (`docs/ops-runbook.md`):
   ```markdown
   # TillLess Ops Runbook

   ## Incident Response

   ### Scraper Failure (All Retailers Down)
   1. Check Temporalite dashboard (http://localhost:8233)
   2. Restart scrapers: `railway restart scraper-worker`
   3. Check retailer websites (are they blocking us?)
   4. If blocked: Rotate IP, reduce cadence

   ### Database Connection Errors
   1. Check Supabase status page
   2. Verify connection string in environment variables
   3. Restart API: `railway restart api`

   ### High Prediction Variance (>10%)
   1. Check recent receipts in admin panel
   2. Identify mismatched products
   3. Add to manual review queue
   4. Update product mapping heuristics
   ```

4. Beta recruitment:
   - Post on Reddit r/PersonalFinanceZA: "Beta testers wanted for grocery savings app"
   - TikTok/Instagram: "Save R200+/month on groceries — join our beta"
   - Target: 20 Gauteng households, diverse (Thandi, Bongani personas)

**Success Criteria:**
- CI/CD pipeline green (all tests passing, auto-deploy on main branch)
- Production deployment stable (>99% uptime)
- 20 beta users recruited, onboarded, first optimization run completed

---

## Part 3: Developer Onboarding Guide

### Environment Setup (1-2 Hours)

**Prerequisites:**
- Node.js 20+ (LTS)
- pnpm 8+
- Docker Desktop (for Temporalite local dev)
- Git

**Step-by-Step Setup:**

1. **Clone Repository**
   ```bash
   git clone https://github.com/your-org/till-less.git
   cd till-less
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables**
   - Copy `.env.example` to `.env` in each app:
     ```bash
     cp apps/web/.env.example apps/web/.env
     cp apps/api/.env.example apps/api/.env
     ```
   - Fill in values:
     ```env
     # apps/web/.env
     NEXT_PUBLIC_API_URL=http://localhost:3001
     NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

     # apps/api/.env
     DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
     AUTH_SECRET=your-32-char-secret
     GOOGLE_CLIENT_ID=...
     GOOGLE_CLIENT_SECRET=...
     GOOGLE_MAPS_API_KEY=...
     ```

4. **Set Up Database**
   ```bash
   cd apps/api
   pnpm prisma generate
   pnpm prisma migrate dev --name init
   pnpm prisma db seed  # Seed 50 products
   ```

5. **Start Development Servers**
   ```bash
   # Terminal 1: Frontend (Next.js)
   pnpm --filter @tillless/web dev
   # → http://localhost:3000

   # Terminal 2: Backend (NestJS)
   pnpm --filter @tillless/api dev
   # → http://localhost:3001

   # Terminal 3: Temporalite (Scheduler)
   docker-compose up temporalite
   # → Dashboard: http://localhost:8233
   ```

6. **Verify Setup**
   - Open http://localhost:3000 (Next.js frontend loads)
   - API health check: http://localhost:3001/health (returns 200 OK)
   - Temporalite UI: http://localhost:8233 (workflows visible)

**Troubleshooting:**
- **Database connection error:** Verify Supabase URL and password in `.env`
- **pnpm install fails:** Clear cache (`pnpm store prune`), retry
- **Temporalite won't start:** Ensure Docker Desktop is running, port 8233 available

---

## Part 4: Key Architecture Decisions Register

**Decisions Requiring Confirmation Before Coding:**

| Decision | Options | Recommendation | Rationale | Status |
|----------|---------|---------------|-----------|--------|
| **Monorepo Tool** | Turborepo, Nx, pnpm Workspaces | Nx | Powerful build system, excellent caching, TypeScript-first | ✅ Decided |
| **Auth Method** | Password, Magic Link, OAuth | Password + Google OAuth | Covers 90% users, avoid magic link complexity | ⚠️ Pending |
| **Travel Distance API** | Google Maps, OSRM | Google Maps (MVP), migrate to OSRM (Phase 2) | Speed to market, $200 free credit sufficient | ⚠️ Pending |
| **CSV Format** | Strict headers, Flexible parsing | Strict (MVP), flexible (Phase 1.5) | Reduce edge cases, faster validation | ⚠️ Pending |
| **Scraping Playbook** | Create now, Defer to Sprint 1 | Defer to Sprint 1 | Details emerge during implementation | ⚠️ Pending |
| **Receipt Storage** | Supabase Storage, S3, Local | Supabase Storage | Fits free tier, integrated with Postgres | ✅ Decided |
| **Caching Layer** | Redis (Upstash), Supabase Edge Functions | Upstash Redis | 10K commands/day free, low latency | ✅ Decided |
| **Optimization Algorithm** | Greedy, Linear Programming | Greedy (MVP), LP (Phase 2) | Fast (≤15s), sufficient for single-store optimization | ✅ Decided |

**Action Items:**
1. Finalize ⚠️ Pending decisions (team consensus or solo decision if bootstrapping)
2. Document in `docs/architecture-decisions.md` (ADR format)
3. Update architecture diagram if decisions change infrastructure

---

## Part 5: Risk Mitigation Plan

### Top 5 Risks + Monitoring Strategy

| Risk | Mitigation | Monitoring | Alert Trigger |
|------|-----------|-----------|---------------|
| **1. Retailer Scraper Blocking** | Polite cadence (2-4h), IP rotation, fallback to receipts | Scraper success rate dashboard | <80% success (24h window) → email alert |
| **2. Product Matching Errors** | Heuristics + receipt feedback loop, manual review queue | Prediction variance tracking | >10% avg variance → flag for review |
| **3. Troli Feature Parity** | Speed to market (9-week sprint), transparency differentiation | Weekly competitive monitoring (Troli app, social media) | New Troli feature detected → strategy review |
| **4. User Behavior Inertia** | Effort-aware optimization, transparent trade-offs, savings dashboard | Recommendation acceptance rate | <50% acceptance → UX iteration |
| **5. Data Freshness Trade-off** | Display last-scraped timestamp, receipt reconciliation, 2-4h cadence | Scraper lag time (time since last successful scrape) | >6 hours lag → increase cadence or alert users |

**Weekly Risk Review (Every Friday):**
1. Review scraper success rate (target: >95%)
2. Check prediction variance (target: <5% avg)
3. Monitor Troli feature launches (competitive intel)
4. Analyze acceptance rate (target: >70%)
5. Assess data freshness (target: <4h average lag)

**Escalation Path:**
- **Low severity:** Log in ops dashboard, fix in next sprint
- **Medium severity:** Email tech lead, fix within 48 hours
- **High severity:** Page on-call (scraper total failure, database down), fix within 4 hours

---

## Part 6: Definition of Done (DoD) Checklist

**For Each User Story to be Considered "Done":**

- [ ] **Code Complete**
  - [ ] Feature implemented per acceptance criteria
  - [ ] Unit tests written (≥80% coverage for critical paths)
  - [ ] Integration tests pass (API endpoints, database queries)
  - [ ] Code reviewed (PR approved by 1+ developer if team, self-review if solo)

- [ ] **Quality Assurance**
  - [ ] Manual testing completed (happy path + edge cases)
  - [ ] Performance validated (optimization <30s, page load <2s)
  - [ ] Accessibility checked (keyboard nav, ARIA labels for forms)
  - [ ] Browser tested (Chrome, Safari, Firefox latest 2 versions)

- [ ] **Documentation**
  - [ ] API endpoints documented (Swagger/OpenAPI or inline comments)
  - [ ] User-facing features documented (in-app help text or docs site)
  - [ ] Ops runbook updated (if introduces new failure modes)

- [ ] **Deployment**
  - [ ] Deployed to staging (Vercel preview or Railway staging environment)
  - [ ] Smoke tested in staging (basic flow works end-to-end)
  - [ ] Merged to main, auto-deployed to production
  - [ ] Production smoke test (verify in prod, no rollback needed)

- [ ] **User Validation**
  - [ ] Feature dogfooded by team (if applicable)
  - [ ] Beta user feedback collected (for key features like optimization)
  - [ ] Metrics instrumented (track usage, errors, performance)

**Sprint DoD (At End of Each 3-Week Sprint):**
- [ ] All stories in sprint marked "Done" per above criteria
- [ ] Demo prepared (showcase completed features to stakeholders/team)
- [ ] Retro completed (what went well, what to improve, action items)
- [ ] Next sprint planned (stories prioritized, estimates refined)

---

## Part 7: Success Metrics Dashboard (How to Track Progress)

**Week-by-Week KPIs to Monitor:**

| Week | Metric | Target | How to Measure |
|------|--------|--------|----------------|
| **Week 1** | Database schema deployed | ✅ Complete | Prisma migrations run successfully |
| **Week 2** | Scrapers operational | 2 retailers (Checkers, PnP), 85% match rate | Scraper logs, normalization success % |
| **Week 3** | All retailers scraped | 5 retailers, 1,000+ products, 95% uptime | Monitoring dashboard, product count |
| **Week 4** | Optimization API live | <15s runtime for 60-item basket | API logs, Sentry performance tracking |
| **Week 5** | Frontend functional | Users can input list, see results | Manual testing, beta user feedback |
| **Week 6** | Auth & preferences | Users can register, save preferences | User count, preference completion rate |
| **Week 7** | Receipt reconciliation | Users upload receipts, variance calculated | Receipt upload count, avg variance |
| **Week 8** | Savings dashboard | Users see R-value saved, accuracy % | Dashboard views, engagement metrics |
| **Week 9** | Beta launch | 20 users onboarded, 10+ optimizations run | User signups, optimization API calls |

**Post-Launch Success Metrics (Months 1-3):**

| Metric | Month 1 Target | Month 2 Target | Month 3 Target | How to Measure |
|--------|---------------|---------------|---------------|----------------|
| **Active Users** | 100 | 300 | 500 | Monthly active users (≥1 optimization/month) |
| **Average Savings** | 5% | 7% | 8% | Predicted savings / baseline store cost |
| **Prediction Accuracy** | 90% | 93% | 95% | (1 - avg variance) × 100 |
| **Recommendation Acceptance** | 60% | 70% | 80% | % users shopping at recommended store (via receipt uploads) |
| **Receipt Upload Rate** | 20% | 30% | 40% | % users uploading ≥1 receipt/month |
| **NPS Score** | 30 | 40 | 50 | Net Promoter Score (in-app survey) |

**Instrumentation:**
- Use Mixpanel or Amplitude for product analytics (free tier: 20M events/month)
- Track events: `optimization_started`, `optimization_completed`, `receipt_uploaded`, `recommendation_accepted`
- Set up funnels: Signup → Preferences Set → First Optimization → Receipt Upload

---

## Part 8: Communication & Collaboration

### For Solo Developers

**Weekly Cadence:**
- **Monday:** Review last week's progress, plan this week's stories
- **Wednesday:** Mid-week check-in (are you on track? blockers?)
- **Friday:** Deploy to staging, manual testing, retro notes

**Documentation Habits:**
- Commit messages: Use conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`)
- PRs (even solo): Write PR description explaining "why" (for future you)
- Decision log: Update `docs/architecture-decisions.md` when making tech choices

**Accountability:**
- Set daily goals (e.g., "Today: Implement Checkers scraper")
- Track in todo.md or GitHub Projects (Kanban board)
- Celebrate wins (shipped a feature? Tweet about it, share in community)

### For Small Teams (2-4 Developers)

**Daily Standup (15 min, async or sync):**
- Yesterday: What did you ship?
- Today: What will you ship?
- Blockers: Anything stuck?

**Sprint Ceremonies:**
- **Sprint Planning (Monday Week 1, 4, 7):** Prioritize stories, assign owners, estimate points
- **Sprint Review (Friday Week 3, 6, 9):** Demo completed features, gather feedback
- **Sprint Retro (Friday Week 3, 6, 9):** What went well? What to improve? Action items.

**Collaboration Tools:**
- **GitHub Projects:** Kanban board (Backlog → In Progress → Review → Done)
- **Slack/Discord:** Async chat (avoid meetings when possible)
- **Loom:** Record video demos for async feedback

**Code Review Guidelines:**
- Review PRs within 24 hours
- Use PR template (What changed? Why? How to test? Screenshots)
- Approval required before merge (1+ approver)

---

## Part 9: Go-to-Market Preview (Beta → Public Launch)

### Beta Launch (Week 9)

**Target:** 20 Gauteng households (friends, family, early adopters)

**Recruitment Channels:**
1. **Reddit r/PersonalFinanceZA:**
   - Post: "Beta testers wanted: Save R200+/month on groceries with TillLess (Gauteng-based, free tool)"
   - Offer: First 20 users get lifetime free access (if we launch paid tier later)

2. **TikTok/Instagram:**
   - Video: "I built a tool that saves R200+ on groceries by comparing all 5 major retailers — want early access?"
   - Call-to-action: "Comment 'SAVE' for beta invite"

3. **WhatsApp Groups:**
   - Family, friends, local community groups
   - Personal invite: "Hey! I built this grocery savings tool, would love your feedback"

**Onboarding Flow:**
1. Email invite with signup link (limited to 20 beta codes)
2. First login: Guided tutorial (add 10-item list → run optimization → see savings)
3. Week 1 check-in: "How was your first shop? Upload receipt to improve accuracy"
4. Week 4 survey: NPS, feature requests, pain points

**Success Criteria (Beta):**
- 15/20 users complete ≥1 optimization (75% activation)
- 8/20 users upload ≥1 receipt (40% engagement)
- NPS ≥30 (early trust signals)
- 5+ qualitative insights for iteration

---

### Public Launch (Month 4)

**Marketing Channels:**
1. **Content Marketing:**
   - Blog: "How to maximize Xtra Savings vs. Smart Shopper" (SEO: "xtra savings vs smart shopper")
   - Blog: "The true cost of grocery shopping in South Africa" (data journalism, shareable)
   - Blog: "We saved 50 families R12,000 in 3 months — here's how"

2. **Social Media:**
   - TikTok: "Grocery haul: R2,850 vs. R3,200 — TillLess saved me R350" (before/after receipts)
   - Instagram Reels: "5 mistakes you're making with your Xtra Savings card"
   - Twitter threads: "Why Makro isn't always the cheapest (data analysis)"

3. **Partnerships:**
   - Reach out to banks (FNB, Capitec): "We help your customers save on groceries (largest expense category)"
   - Pitch to 22seven (budgeting app): "Integrate TillLess to optimize users' grocery spend"
   - Contact Discovery Vitality: "Reward users for healthier shopping choices via TillLess"

**Launch Week Activities:**
- Day 1: Product Hunt launch (aim for #3 Product of the Day)
- Day 2-3: PR outreach (BusinessTech, MyBroadband, TimesLive)
- Day 4-5: Reddit AMA (r/PersonalFinanceZA: "I built a tool that saves R200+/month on groceries, AMA")
- Day 6-7: Paid ads test (Facebook, Google, R500 budget) — measure CAC, LTV

**Success Criteria (Month 4):**
- 500 signups (from 20 beta users → 500 public users)
- 200 monthly active users (40% activation rate)
- ≥8% average savings (validated via receipts)
- NPS ≥40 (higher trust than competitors)

---

## Part 10: Quick Reference Checklists

### Pre-Sprint Checklist (Week 0)

- [ ] All pending decisions finalized (auth methods, Maps API, CSV format)
- [ ] Supabase project created, connection string saved
- [ ] Vercel + Railway accounts set up
- [ ] Google Cloud Console: Maps API enabled, key generated
- [ ] BetterAuth secret generated (32-char secure string)
- [ ] Monorepo initialized (Nx, pnpm workspaces)
- [ ] CI/CD pipeline configured (GitHub Actions `.github/workflows/ci.yml`)
- [ ] Team aligned on sprint goals (if team; solo: personal commitment)

### Sprint 1 Checklist (Weeks 1-3)

- [ ] Week 1: Database schema deployed, 50 seed products
- [ ] Week 2: Checkers + Pick n Pay scrapers operational, 85% match rate
- [ ] Week 3: All 5 retailers scraped, Temporalite scheduled, monitoring dashboard live, **manual leaflet entry admin panel built**

### Sprint 2 Checklist (Weeks 4-6)

- [ ] Week 4: Optimization API live, <15s runtime, loyalty + travel cost integrated, **Azure OCR automation working (80%+ auto-match)**
- [ ] Week 5: Shopping list UI functional, CSV import working, results dashboard built
- [ ] Week 6: BetterAuth login/register, preferences page, loyalty cards saved

### Sprint 3 Checklist (Weeks 7-9)

- [ ] Week 7: Receipt upload working, variance calculated, Supabase Storage integrated
- [ ] Week 8: Savings dashboard live, historical trends visible, accuracy metrics shown
- [ ] Week 9: Production deployed, CI/CD green, 20 beta users recruited and onboarded

### Definition of Done (Every Story)

- [ ] Code complete, tests passing (≥80% coverage critical paths)
- [ ] Manual testing done (happy path + edge cases)
- [ ] Deployed to staging, smoke tested
- [ ] Merged to main, auto-deployed to production
- [ ] Metrics instrumented (events tracked in Mixpanel/Amplitude)

### Weekly Risk Review (Every Friday)

- [ ] Scraper success rate >95%?
- [ ] Prediction variance <5% avg?
- [ ] Troli competitive intel updated (new features detected)?
- [ ] Recommendation acceptance rate >70%?
- [ ] Data freshness <4h average lag?

---

## Conclusion: You're Ready to Ship! 🚀

**What You've Accomplished:**
- ✅ Comprehensive analysis (PRD, architecture, market research, competitive intel, project brief)
- ✅ Clear 9-week roadmap (3 sprints, epic breakdown, story-level detail)
- ✅ Technical decisions made (stack, hosting, tools)
- ✅ Success metrics defined (8% savings, 95% accuracy, 500 users, NPS ≥40)
- ✅ Risk mitigation plan (top 5 risks, monitoring strategy)

**What Comes Next:**
1. **Finalize Pending Decisions** (2-3 hours: auth, Maps API, CSV format)
2. **Set Up Infrastructure** (Week 0: Supabase, Vercel, Railway, monorepo init)
3. **Sprint 1 Kickoff** (Week 1: Database schema, seed data, first scrapers)
4. **Ship MVP** (Week 9: Beta launch, 20 users, first optimizations)
5. **Iterate & Scale** (Months 1-3: 500 users, 8% savings, public launch)

**Key Mindset Shifts for Implementation:**
- **Analysis → Execution:** Stop planning, start coding (you have enough detail)
- **Perfect → Done:** Ship 80% solutions, iterate based on user feedback
- **Theory → Reality:** Some decisions will change during implementation (that's normal)
- **Solo → Community:** Share progress publicly (TikTok, Twitter, Reddit) — build in public for accountability and early users

**Final Reminder:**
You've done the hard work of strategic thinking. The MVP is well-scoped, technically feasible, and competitively differentiated. Trust the plan, execute with discipline, and ship in 9 weeks.

**When in doubt:**
- Re-read the PRD (your north star for scope)
- Check the competitive analysis (remember: transparency + loyalty + travel = differentiation)
- Review the project brief (executive summary of "why this matters")
- Trust the 9-week sprint plan (it's realistic, validated against similar projects)

**Let's build TillLess and save South African families R200+/month on groceries!** 💪

---

*Implementation Transition Guide created by Mary (Business Analyst) | BMAD™ Framework | October 17, 2025*
