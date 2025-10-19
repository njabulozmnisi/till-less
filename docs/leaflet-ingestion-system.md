# Leaflet Ingestion System: Non-Online Retailers

**Problem:** Retailers like Food Lover's Market, some Spars, independent stores publish weekly specials via PDF/print leaflets but lack comprehensive online catalogues for web scraping.

**Solution:** Hybrid leaflet ingestion pipeline supporting manual entry (MVP), OCR automation (Phase 1.5), and crowdsourcing (Phase 2).

---

## Executive Summary

**Current Architecture Gap:**
- Scraping strategy assumes online catalogues (Checkers Sixty60, Pick n Pay, Woolworths, Shoprite, Makro)
- Food Lover's Market (Phase 1.5 target) publishes weekly PDF leaflets, no scrapable online store
- Independent stores, some Spars, local butcheries have same constraint

**Proposed Solution (Phased Approach):**

| Phase | Method | Effort | Accuracy | Cost | Timeline |
|-------|--------|--------|----------|------|----------|
| **MVP** | Manual entry admin panel | High (20min/leaflet) | 100% | R0 (internal labor) | Week 3 (Sprint 1) |
| **Phase 1.5** | OCR + manual correction | Medium (5min/leaflet) | 95% | R150/month (Google Cloud Vision) | Month 6 |
| **Phase 2** | Crowdsourced upload + validation | Low (community-driven) | 98% (consensus) | R0 (gamified incentives) | Month 12 |

**Immediate Action (MVP):**
Build lightweight admin panel for manual leaflet entry (2-3 hours development, supports Food Lover's Market launch in Phase 1.5).

---

## Part 1: Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                   Leaflet Ingestion Pipeline                │
└─────────────────────────────────────────────────────────────┘

INPUT METHODS:
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ Admin Panel  │   │ OCR Pipeline │   │ Crowdsourced │
│ (Manual)     │   │ (Automated)  │   │ (Community)  │
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │                  │                  │
       └──────────────────┼──────────────────┘
                          ▼
              ┌───────────────────────┐
              │  Leaflet Processing   │
              │  - Validate format    │
              │  - Normalize product  │
              │  - Match to CPR       │
              └───────────┬───────────┘
                          ▼
              ┌───────────────────────┐
              │ Low-Confidence Queue  │
              │ (Manual Review)       │
              └───────────┬───────────┘
                          ▼
              ┌───────────────────────┐
              │  Canonical Product    │
              │  Registry (CPR)       │
              │  + RetailerPrice      │
              └───────────────────────┘
                          ▼
              ┌───────────────────────┐
              │  Optimization Engine  │
              │  (includes leaflet    │
              │   retailer prices)    │
              └───────────────────────┘
```

### Integration with Existing Architecture

**No Changes to Optimization Engine:**
- Leaflet-sourced prices stored in `RetailerPrice` table (same as scraped prices)
- `dataSource` field added: `'scraper' | 'leaflet_manual' | 'leaflet_ocr' | 'crowdsourced'`
- Optimization engine treats all sources equally (price is price)

**New Database Tables:**

```prisma
model Leaflet {
  id            String   @id @default(uuid())
  retailer      String   // "FoodLoversMarket", "SparRandburg", etc.
  weekStart     DateTime // Monday of the week this leaflet covers
  weekEnd       DateTime // Sunday
  pdfUrl        String?  // URL to original PDF (if available)
  imageUrl      String?  // URL to uploaded image
  status        String   // "pending", "processing", "completed", "failed"
  dataSource    String   // "manual", "ocr", "crowdsourced"
  uploadedBy    String?  // userId (if manual/crowdsourced)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  items         LeafletItem[]
}

model LeafletItem {
  id               String   @id @default(uuid())
  leafletId        String
  leaflet          Leaflet  @relation(fields: [leafletId], references: [id])

  // Raw extracted data
  rawText          String   // e.g., "Nescafe Gold 200g - R89.99"
  ocrConfidence    Float?   // 0-1 confidence score (if OCR)

  // Parsed data
  productName      String?  // "Nescafe Gold"
  brand            String?  // "Nescafe"
  size             String?  // "200g"
  price            Float?   // 89.99
  promoType        String?  // "each", "2-for-R100", "buy-2-get-1-free"

  // Matching to CPR
  matchedProductId String?  // Link to Product.id in CPR
  matchConfidence  Float?   // 0-1 confidence score
  manuallyReviewed Boolean  @default(false)

  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

model LeafletReviewQueue {
  id          String   @id @default(uuid())
  leafletItemId String @unique
  leafletItem LeafletItem @relation(fields: [leafletItemId], references: [id])
  reason      String   // "low_ocr_confidence", "no_cpr_match", "ambiguous_promo"
  priority    Int      // 1-5 (5 = high priority, blocks optimization)
  reviewedBy  String?  // userId who reviewed
  reviewedAt  DateTime?
  createdAt   DateTime @default(now())
}
```

---

## Part 2: MVP Solution (Manual Entry Admin Panel)

### Why Manual Entry for MVP?

**Pros:**
- ✅ **Fast to build:** 2-3 hours (simple form, no OCR integration)
- ✅ **100% accurate:** Human validation, no OCR errors
- ✅ **Zero cost:** No API fees, internal labor only
- ✅ **Flexible:** Handles any leaflet format (PDF, image, print)
- ✅ **Validates demand:** Prove Food Lover's Market users exist before investing in automation

**Cons:**
- ❌ **Labor intensive:** 20 min/leaflet (50-100 items) = 1.5-3 hours/week per retailer
- ❌ **Doesn't scale:** Can't support 20+ leaflet retailers without hiring
- ❌ **Delayed updates:** Depends on manual data entry (vs. automated scraping)

**Mitigation:** Start with 1-2 leaflet retailers (Food Lover's Market + local Spar), automate in Phase 1.5 once validated.

---

### Implementation Guide (MVP)

**Step 1: Add Admin Panel Route (Next.js)**

Create `apps/web/src/app/admin/leaflets/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';

export default function LeafletEntryPage() {
  const { register, control, handleSubmit } = useForm({
    defaultValues: {
      retailer: 'FoodLoversMarket',
      weekStart: '',
      items: [{ rawText: '', productName: '', size: '', price: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const onSubmit = async (data: any) => {
    // POST to API: /api/admin/leaflets
    const res = await fetch('/api/admin/leaflets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (res.ok) {
      alert('Leaflet submitted! Items will be matched to CPR.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Manual Leaflet Entry</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Retailer Selection */}
        <div className="mb-4">
          <label className="block font-medium mb-2">Retailer</label>
          <select {...register('retailer')} className="border p-2 rounded w-full">
            <option value="FoodLoversMarket">Food Lover's Market</option>
            <option value="SparRandburg">Spar Randburg</option>
            <option value="LocalButchery">Local Butchery</option>
          </select>
        </div>

        {/* Week Range */}
        <div className="mb-4">
          <label className="block font-medium mb-2">Week Start (Monday)</label>
          <input type="date" {...register('weekStart')} className="border p-2 rounded" />
        </div>

        {/* Leaflet Items */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Leaflet Items</h2>
          {fields.map((field, index) => (
            <div key={field.id} className="border p-4 mb-2 rounded bg-gray-50">
              <div className="grid grid-cols-4 gap-2">
                <input
                  {...register(`items.${index}.productName`)}
                  placeholder="Product name"
                  className="border p-2 rounded"
                />
                <input
                  {...register(`items.${index}.brand`)}
                  placeholder="Brand (optional)"
                  className="border p-2 rounded"
                />
                <input
                  {...register(`items.${index}.size`)}
                  placeholder="Size (e.g., 200g)"
                  className="border p-2 rounded"
                />
                <input
                  {...register(`items.${index}.price`)}
                  placeholder="Price (R)"
                  type="number"
                  step="0.01"
                  className="border p-2 rounded"
                />
              </div>
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-red-500 text-sm mt-2"
              >
                Remove item
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => append({ productName: '', size: '', price: '' })}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
          >
            + Add Item
          </button>
        </div>

        {/* Submit */}
        <button type="submit" className="bg-green-500 text-white px-6 py-2 rounded">
          Submit Leaflet
        </button>
      </form>
    </div>
  );
}
```

**Step 2: API Endpoint (NestJS)**

Create `apps/api/src/modules/leaflets/leaflets.controller.ts`:

```typescript
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { LeafletsService } from './leaflets.service';
import { AdminGuard } from '../auth/admin.guard';

@Controller('admin/leaflets')
@UseGuards(AdminGuard) // Protect: only admins can enter leaflets
export class LeafletsController {
  constructor(private leafletsService: LeafletsService) {}

  @Post()
  async createLeaflet(@Body() dto: CreateLeafletDto) {
    return this.leafletsService.createLeaflet(dto);
  }
}
```

**Step 3: Leaflet Processing Service**

Create `apps/api/src/modules/leaflets/leaflets.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NormalizationService } from '../ingestion/normalization.service';

@Injectable()
export class LeafletsService {
  constructor(
    private prisma: PrismaService,
    private normalization: NormalizationService
  ) {}

  async createLeaflet(dto: CreateLeafletDto) {
    const { retailer, weekStart, items } = dto;

    // 1. Create Leaflet record
    const leaflet = await this.prisma.leaflet.create({
      data: {
        retailer,
        weekStart: new Date(weekStart),
        weekEnd: new Date(new Date(weekStart).getTime() + 6 * 24 * 60 * 60 * 1000), // +6 days
        status: 'processing',
        dataSource: 'manual'
      }
    });

    // 2. Process each item
    for (const item of items) {
      const leafletItem = await this.prisma.leafletItem.create({
        data: {
          leafletId: leaflet.id,
          rawText: `${item.productName} ${item.size} - R${item.price}`,
          productName: item.productName,
          brand: item.brand,
          size: item.size,
          price: parseFloat(item.price),
          promoType: 'each' // Default for manual entry
        }
      });

      // 3. Attempt to match to CPR
      const match = await this.normalization.findBestMatch({
        name: item.productName,
        brand: item.brand,
        size: item.size
      });

      if (match && match.confidence > 0.8) {
        // High-confidence match: auto-link to CPR
        await this.prisma.leafletItem.update({
          where: { id: leafletItem.id },
          data: {
            matchedProductId: match.productId,
            matchConfidence: match.confidence
          }
        });

        // 4. Upsert RetailerPrice (so optimization engine can use it)
        await this.prisma.retailerPrice.upsert({
          where: {
            productId_retailer: {
              productId: match.productId,
              retailer: retailer
            }
          },
          update: {
            price: parseFloat(item.price),
            promoPrice: null, // Manual entry doesn't distinguish promo yet
            lastScraped: new Date(),
            dataSource: 'leaflet_manual'
          },
          create: {
            productId: match.productId,
            retailer: retailer,
            price: parseFloat(item.price),
            unitSize: item.size,
            inStock: true,
            lastScraped: new Date(),
            dataSource: 'leaflet_manual'
          }
        });
      } else {
        // Low-confidence match: queue for manual review
        await this.prisma.leafletReviewQueue.create({
          data: {
            leafletItemId: leafletItem.id,
            reason: match ? 'low_confidence_match' : 'no_cpr_match',
            priority: 3 // Medium priority
          }
        });
      }
    }

    // 5. Mark leaflet as completed
    await this.prisma.leaflet.update({
      where: { id: leaflet.id },
      data: { status: 'completed' }
    });

    return { success: true, leafletId: leaflet.id };
  }
}
```

**Step 4: Manual Review Queue UI**

Create `apps/web/src/app/admin/review-queue/page.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';

export default function ReviewQueuePage() {
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    fetch('/api/admin/review-queue')
      .then(res => res.json())
      .then(setQueue);
  }, []);

  const handleReview = async (itemId: string, productId: string) => {
    await fetch(`/api/admin/review-queue/${itemId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchedProductId: productId })
    });

    // Remove from queue
    setQueue(queue.filter(item => item.id !== itemId));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Manual Review Queue</h1>

      {queue.length === 0 && <p>No items pending review!</p>}

      {queue.map((item: any) => (
        <div key={item.id} className="border p-4 mb-2 rounded">
          <p><strong>Raw Text:</strong> {item.leafletItem.rawText}</p>
          <p><strong>Parsed:</strong> {item.leafletItem.productName} ({item.leafletItem.size}) - R{item.leafletItem.price}</p>
          <p className="text-red-500"><strong>Reason:</strong> {item.reason}</p>

          {/* Suggest matches from CPR */}
          <div className="mt-2">
            <p className="font-medium">Suggested matches:</p>
            {/* Fetch top 5 CPR products matching name */}
            <button
              onClick={() => handleReview(item.id, 'suggested-product-id')}
              className="bg-green-500 text-white px-3 py-1 rounded mr-2"
            >
              Match to Product X
            </button>
            <button className="bg-gray-300 px-3 py-1 rounded">Skip</button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

### MVP Workflow (Weekly Leaflet Entry)

**Every Monday Morning (Food Lover's Market publishes new leaflet):**

1. **Admin downloads PDF leaflet** from Food Lover's Market website or receives email
2. **Open TillLess admin panel** (`/admin/leaflets`)
3. **Select retailer:** "Food Lover's Market"
4. **Set week range:** Monday (today) → Sunday (+6 days)
5. **Manually enter items:**
   - Copy-paste or type: "Nescafe Gold 200g - R89.99"
   - Parse into fields: Product Name = "Nescafe Gold", Size = "200g", Price = "89.99"
   - Repeat for all ~50-100 items (15-20 minutes)
6. **Submit leaflet** → API processes:
   - Attempts auto-match to CPR (85-90% success rate)
   - Queues low-confidence items for review
   - Updates `RetailerPrice` table with new prices
7. **Review queue:** Admin checks queued items (5 minutes), manually links to CPR
8. **Done!** Food Lover's Market prices now available in optimization engine

**Time Investment:** 20-25 min/week per leaflet retailer

---

## Part 3: Phase 1.5 Solution (OCR Automation)

### Why OCR in Phase 1.5?

**Trigger:** Once 3+ leaflet retailers validated (Food Lover's Market + 2 Spars), manual entry becomes bottleneck (60+ min/week).

**ROI Calculation:**
- **Manual labor:** 3 retailers × 20 min/week = 60 min/week = 50 hours/year
- **OCR cost:** Google Cloud Vision = R1.50/1,000 images (3 leaflets/week × 52 weeks = 156 images/year = R0.23/year)
- **Developer time:** 8 hours to build OCR pipeline (amortized over 1 year = R4,000 saved in labor @ R100/hour)

**Decision:** Automate in Phase 1.5 once manual entry proven valuable.

---

### OCR Pipeline Architecture

```
PDF/Image Upload (Admin Panel)
         ↓
Google Cloud Vision API (OCR)
         ↓
Text Extraction (raw strings)
         ↓
NLP Parsing (regex + heuristics)
   - Product name: "Nescafe Gold"
   - Size: "200g"
   - Price: "R89.99"
         ↓
Match to CPR (same as manual flow)
         ↓
High-confidence → RetailerPrice
Low-confidence → Review Queue
```

---

### Implementation Guide (Phase 1.5)

**Step 1: Install Google Cloud Vision**

```bash
pnpm add @google-cloud/vision
```

**Step 2: Configure Google Cloud Project**

1. Enable Vision API: https://console.cloud.google.com/apis/library/vision.googleapis.com
2. Create service account, download JSON key
3. Add to `.env`:
   ```env
   GOOGLE_CLOUD_VISION_KEY_PATH=/path/to/service-account.json
   ```

**Step 3: Upload UI (PDF/Image)**

Update `apps/web/src/app/admin/leaflets/page.tsx`:

```tsx
const [uploadMethod, setUploadMethod] = useState<'manual' | 'ocr'>('manual');
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
  alert(`OCR processed! ${result.itemsExtracted} items extracted, ${result.reviewQueueCount} need review.`);
};

return (
  <div>
    <div className="mb-4">
      <label className="mr-4">
        <input type="radio" value="manual" checked={uploadMethod === 'manual'} onChange={(e) => setUploadMethod(e.target.value as any)} />
        Manual Entry
      </label>
      <label>
        <input type="radio" value="ocr" checked={uploadMethod === 'ocr'} onChange={(e) => setUploadMethod(e.target.value as any)} />
        Upload Leaflet (OCR)
      </label>
    </div>

    {uploadMethod === 'ocr' && (
      <div>
        <input type="file" accept="application/pdf,image/*" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={handleOCRUpload} className="bg-blue-500 text-white px-4 py-2 rounded">
          Upload & Process with OCR
        </button>
      </div>
    )}

    {uploadMethod === 'manual' && (
      {/* Existing manual entry form */}
    )}
  </div>
);
```

**Step 4: OCR Processing Endpoint**

Create `apps/api/src/modules/leaflets/ocr.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import vision from '@google-cloud/vision';

@Injectable()
export class OCRService {
  private client: vision.ImageAnnotatorClient;

  constructor() {
    this.client = new vision.ImageAnnotatorClient({
      keyFilename: process.env.GOOGLE_CLOUD_VISION_KEY_PATH
    });
  }

  async extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
    // Convert PDF to images (use pdf-lib or pdf2pic)
    // For simplicity, assume single-page or pre-converted to image

    const [result] = await this.client.textDetection(pdfBuffer);
    const fullText = result.fullTextAnnotation?.text || '';
    return fullText;
  }

  parseLeafletText(rawText: string): Array<{ productName: string; size: string; price: string; confidence: number }> {
    const lines = rawText.split('\n');
    const items = [];

    for (const line of lines) {
      // Regex pattern: "Product Name Size - Price"
      // Example: "Nescafe Gold 200g - R89.99"
      const match = line.match(/^(.+?)\s+(\d+(?:g|kg|ml|l|ea))\s*[-–]\s*R?(\d+(?:\.\d{2})?)$/i);

      if (match) {
        const [, productName, size, price] = match;
        items.push({
          productName: productName.trim(),
          size: size.trim(),
          price: price.trim(),
          confidence: 0.9 // Assume high confidence if regex matched
        });
      } else {
        // Fallback: weaker pattern (just price at end)
        const weakMatch = line.match(/^(.+)\s+R?(\d+(?:\.\d{2})?)$/);
        if (weakMatch) {
          items.push({
            productName: weakMatch[1].trim(),
            size: 'unknown',
            price: weakMatch[2].trim(),
            confidence: 0.6 // Lower confidence
          });
        }
      }
    }

    return items;
  }
}
```

**Step 5: OCR Controller**

```typescript
@Post('ocr')
@UseInterceptors(FileInterceptor('file'))
async processLeafletOCR(
  @UploadedFile() file: Express.Multer.File,
  @Body() dto: { retailer: string; weekStart: string }
) {
  // 1. Extract text via OCR
  const rawText = await this.ocrService.extractTextFromPDF(file.buffer);

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
        price: parseFloat(item.price),
        ocrConfidence: item.confidence
      }
    });

    // Match to CPR
    const match = await this.normalization.findBestMatch(item);

    if (match && match.confidence > 0.8 && item.confidence > 0.8) {
      // High-confidence OCR + high-confidence CPR match → auto-link
      await this.prisma.leafletItem.update({
        where: { id: leafletItem.id },
        data: { matchedProductId: match.productId, matchConfidence: match.confidence }
      });

      await this.prisma.retailerPrice.upsert({
        where: { productId_retailer: { productId: match.productId, retailer: dto.retailer } },
        update: { price: parseFloat(item.price), dataSource: 'leaflet_ocr' },
        create: { productId: match.productId, retailer: dto.retailer, price: parseFloat(item.price), dataSource: 'leaflet_ocr', unitSize: item.size, inStock: true }
      });
    } else {
      // Low confidence → queue for review
      await this.prisma.leafletReviewQueue.create({
        data: {
          leafletItemId: leafletItem.id,
          reason: item.confidence < 0.8 ? 'low_ocr_confidence' : 'low_cpr_match_confidence',
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
    reviewQueueCount
  };
}
```

---

### OCR Workflow (Phase 1.5)

**Every Monday (Automated with Human Review):**

1. **Admin uploads PDF leaflet** (Food Lover's Market, Spar, etc.)
2. **OCR extracts text** (15-30 seconds processing)
3. **NLP parses items** (regex patterns extract product, size, price)
4. **Auto-matching:**
   - High-confidence OCR (>80%) + high-confidence CPR match (>80%) → Auto-linked to CPR, prices updated
   - Low-confidence → Queued for manual review
5. **Admin reviews queue** (5-10 minutes, only ambiguous items)
6. **Done!** Time reduced from 20 min → 5-10 min per leaflet (50% time savings)

**Expected Accuracy:**
- OCR text extraction: 95% (Google Cloud Vision)
- NLP parsing: 85% (regex patterns for common formats)
- Combined auto-match rate: 80% (20% require manual review)

---

## Part 4: Phase 2 Solution (Crowdsourcing)

### Why Crowdsourcing?

**Trigger:** When 10+ leaflet retailers (too many for internal team to manage, even with OCR).

**Model:** Community-driven leaflet digitization (inspired by OpenStreetMap, Wikipedia).

**Mechanism:**
1. **Users upload leaflet photos** (via mobile app, in-app camera)
2. **Multiple users validate same item** (consensus: 3 users must agree on price)
3. **Gamification:** Points, leaderboard, badges ("Leaflet Champion")
4. **Quality control:** High-reputation users' uploads auto-approved; new users require validation

---

### Crowdsourcing Architecture

```
User Uploads Leaflet Photo (Mobile App)
         ↓
OCR Extracts Items (same as Phase 1.5)
         ↓
Multiple Users Validate Each Item
   User A: "Nescafe Gold 200g - R89.99" ✅
   User B: "Nescafe Gold 200g - R89.99" ✅
   User C: "Nescafe Gold 200g - R90.99" ❌
   → Consensus: R89.99 (2/3 votes)
         ↓
Validated Items → RetailerPrice
Disputed Items → Review Queue
         ↓
Contributor Earns Points (+10 points)
```

---

### Implementation Sketch (Phase 2)

**Gamification Database Tables:**

```prisma
model ContributorProfile {
  id              String   @id @default(uuid())
  userId          String   @unique
  points          Int      @default(0)
  rank            String   // "Rookie", "Contributor", "Expert", "Champion"
  leafletsUploaded Int     @default(0)
  validationsCorrect Int   @default(0)
  validationsIncorrect Int @default(0)
  accuracyRate    Float    @default(0.0) // validationsCorrect / (correct + incorrect)
}

model LeafletValidation {
  id            String   @id @default(uuid())
  leafletItemId String
  userId        String
  productName   String
  size          String
  price         Float
  agreedWithConsensus Boolean?
  createdAt     DateTime @default(now())
}
```

**Mobile App Feature:**

```tsx
// Mobile app: Leaflet Upload Screen
export default function LeafletUploadScreen() {
  const [photo, setPhoto] = useState(null);

  const handleCapture = async () => {
    const result = await ImagePicker.launchCameraAsync();
    setPhoto(result.uri);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('photo', photo);
    formData.append('retailer', selectedRetailer);

    await fetch('/api/leaflets/crowdsourced', {
      method: 'POST',
      body: formData
    });

    alert('Thanks! You earned +10 points. Review other uploads to earn more!');
  };

  return (
    <View>
      <Button title="Take Photo of Leaflet" onPress={handleCapture} />
      {photo && <Image source={{ uri: photo }} />}
      <Button title="Upload & Earn Points" onPress={handleUpload} />
    </View>
  );
}
```

**Validation Flow:**

```tsx
// Mobile app: Validate Uploads Screen
export default function ValidationScreen() {
  const [item, setItem] = useState(null);

  useEffect(() => {
    // Fetch random unvalidated item
    fetch('/api/leaflets/validate/next')
      .then(res => res.json())
      .then(setItem);
  }, []);

  const handleValidate = async (isCorrect: boolean) => {
    await fetch(`/api/leaflets/validate/${item.id}`, {
      method: 'POST',
      body: JSON.stringify({ isCorrect })
    });

    alert(isCorrect ? '+5 points!' : 'Thanks for flagging!');
    // Load next item
  };

  return (
    <View>
      <Text>Is this correct?</Text>
      <Text>{item?.productName} {item?.size} - R{item?.price}</Text>
      <Button title="Yes ✅" onPress={() => handleValidate(true)} />
      <Button title="No ❌ (Flag for Review)" onPress={() => handleValidate(false)} />
    </View>
  );
}
```

---

## Part 5: Integration with Optimization Engine

**Key Point:** Optimization engine doesn't care about data source (scraper vs. leaflet).

**Unified Pricing Table:**

```prisma
model RetailerPrice {
  // ... existing fields ...

  dataSource  String  // "scraper", "leaflet_manual", "leaflet_ocr", "crowdsourced"
  lastScraped DateTime @default(now()) // For leaflets: last time leaflet was entered
  validUntil  DateTime? // For leaflets: end of week (Sunday); for scrapers: lastScraped + 4 hours
}
```

**Optimization Query (No Changes Needed):**

```typescript
// apps/api/src/modules/optimization/optimization.service.ts

async getRetailerPrice(productId: string, retailer: string): Promise<number> {
  const price = await this.prisma.retailerPrice.findUnique({
    where: { productId_retailer: { productId, retailer } }
  });

  // Check freshness (optional: warn if stale)
  if (price.validUntil && price.validUntil < new Date()) {
    console.warn(`Price for ${productId} at ${retailer} is stale (expired ${price.validUntil})`);
  }

  return price?.price || null;
}
```

**Frontend Display (Transparency):**

```tsx
// Show data source to user (build trust)
<table>
  <thead>
    <tr><th>Item</th><th>Checkers</th><th>Food Lover's</th></tr>
  </thead>
  <tbody>
    <tr>
      <td>Nescafe Gold 200g</td>
      <td>
        R89.99
        <span className="text-xs text-gray-500">(online, 2h ago)</span>
      </td>
      <td>
        R85.99
        <span className="text-xs text-gray-500">(leaflet, Mon-Sun)</span>
      </td>
    </tr>
  </tbody>
</table>
```

---

## Part 6: Cost-Benefit Analysis

| Method | Setup Time | Recurring Time/Week | Cost/Year | Accuracy | Scalability |
|--------|-----------|---------------------|-----------|----------|-------------|
| **Manual Entry (MVP)** | 2-3 hours | 20 min/retailer × 2 = 40 min | R0 | 100% | Low (max 5 retailers) |
| **OCR (Phase 1.5)** | 8 hours | 5 min/retailer × 5 = 25 min | R150 (OCR API) | 95% | Medium (10-15 retailers) |
| **Crowdsourcing (Phase 2)** | 40 hours | 0 min (community-driven) | R0 | 98% (consensus) | High (unlimited) |

**ROI Timeline:**

- **Week 1-12 (MVP):** Manual entry (2 retailers: Food Lover's + Spar) = 40 min/week = 33 hours/year
- **Month 6-12 (Phase 1.5):** OCR automation (5 retailers) = 25 min/week = 22 hours/year, ROI break-even after 8 weeks
- **Month 12+ (Phase 2):** Crowdsourcing (10+ retailers) = 0 min/week (community-driven), infinite ROI

---

## Part 7: Practical Recommendations

### For MVP (Next 2 Weeks)

**✅ DO:**
1. Build manual entry admin panel (2-3 hours development)
2. Start with Food Lover's Market only (validate demand)
3. Set up weekly routine: Monday morning leaflet entry (20 min)
4. Track time investment (is 20 min/week worth it? do users care about Food Lover's?)

**❌ DON'T:**
- Build OCR pipeline in MVP (premature optimization, unproven demand)
- Add crowdsourcing (no user base yet)
- Support 5+ leaflet retailers (manual entry doesn't scale, validate first)

---

### For Phase 1.5 (Month 6)

**✅ TRIGGER: Build OCR automation when:**
- 3+ leaflet retailers validated (users actively requesting Food Lover's, Spar, local stores)
- Manual entry taking >60 min/week (bottleneck)

**✅ DO:**
1. Integrate Google Cloud Vision API (8 hours development)
2. Build NLP parsing (regex patterns for common leaflet formats)
3. Test OCR accuracy on 10 sample leaflets (aim for 85%+ auto-match rate)
4. Keep manual review queue (human-in-the-loop for edge cases)

**❌ DON'T:**
- Build custom OCR (Google Cloud Vision is R150/year, not worth building from scratch)
- Eliminate manual review (always keep safety net for ambiguous items)

---

### For Phase 2 (Month 12)

**✅ TRIGGER: Build crowdsourcing when:**
- 10+ leaflet retailers in roadmap (OCR manual review bottleneck)
- User base >1,000 (critical mass for community contributions)

**✅ DO:**
1. Launch mobile app (native iOS/Android for camera access)
2. Implement gamification (points, leaderboard, badges)
3. Quality control: consensus mechanism (3 users must agree)
4. Pilot with 50 power users (test validation accuracy)

**❌ DON'T:**
- Launch crowdsourcing without mobile app (desktop upload too friction-heavy)
- Skip quality control (bad data worse than no data)

---

## Part 8: Updated Architecture Diagram

### Full System (All Data Sources)

```
┌────────────────────────────────────────────────────────────┐
│                   DATA INGESTION LAYER                      │
└────────────────────────────────────────────────────────────┘

        ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
        │  Web Scrapers│      │   Leaflet    │      │ Crowdsourced │
        │  (Playwright)│      │   Pipeline   │      │  Community   │
        │              │      │  (Manual/OCR)│      │  (Phase 2)   │
        └──────┬───────┘      └──────┬───────┘      └──────┬───────┘
               │                     │                     │
               └─────────────────────┼─────────────────────┘
                                     ▼
                    ┌────────────────────────────────┐
                    │  Normalization & Matching      │
                    │  - String normalization        │
                    │  - Brand/size parsing          │
                    │  - CPR matching (heuristics)   │
                    └────────────┬───────────────────┘
                                 ▼
                    ┌────────────────────────────────┐
                    │  Canonical Product Registry    │
                    │  (Products + RetailerPrices)   │
                    │                                │
                    │  dataSource field:             │
                    │  - scraper                     │
                    │  - leaflet_manual              │
                    │  - leaflet_ocr                 │
                    │  - crowdsourced                │
                    └────────────┬───────────────────┘
                                 ▼
                    ┌────────────────────────────────┐
                    │   Optimization Engine          │
                    │   (No changes needed!)         │
                    │   Uses all prices equally      │
                    └────────────────────────────────┘
```

---

## Part 9: Action Items Summary

### Immediate (This Week - MVP)

- [ ] **Design Database Schema** (30 min)
  - Add `Leaflet`, `LeafletItem`, `LeafletReviewQueue` tables to Prisma schema
  - Add `dataSource` field to `RetailerPrice` table
  - Run migration

- [ ] **Build Admin Panel** (2-3 hours)
  - Manual leaflet entry form (`/admin/leaflets`)
  - Retailer selector (Food Lover's Market, Spar, etc.)
  - Dynamic item fields (product name, size, price)
  - Submit → API processes

- [ ] **API Endpoint** (1-2 hours)
  - `POST /api/admin/leaflets` (manual entry)
  - Process items: parse, match to CPR, update RetailerPrice
  - Queue low-confidence items for review

- [ ] **Manual Review Queue** (1 hour)
  - `/admin/review-queue` page
  - Display unmatched items, suggest CPR products
  - Admin links item to CPR manually

- [ ] **Test with Food Lover's Market** (Week 2)
  - Download this week's leaflet
  - Enter 20 items manually (test flow)
  - Verify prices appear in optimization results

### Phase 1.5 (Month 6 - OCR Automation)

- [ ] **Google Cloud Vision Setup** (30 min)
  - Enable Vision API, create service account
  - Add key to environment variables

- [ ] **OCR Service** (4 hours)
  - Build text extraction (PDF → text via OCR)
  - NLP parsing (regex patterns for product/size/price)
  - Confidence scoring

- [ ] **Upload UI** (2 hours)
  - File upload (PDF/image)
  - OCR processing indicator ("Processing... 20 seconds")
  - Results preview (extracted items, confidence scores)

- [ ] **Test & Tune** (2 hours)
  - Test on 10 sample leaflets (Food Lover's, Spar, local stores)
  - Tune regex patterns (improve parsing accuracy)
  - Measure auto-match rate (target: 80%)

### Phase 2 (Month 12 - Crowdsourcing)

- [ ] **Mobile App Development** (40 hours)
  - Camera integration (capture leaflet photos)
  - Upload + validation flows
  - Gamification (points, leaderboard)

- [ ] **Consensus Mechanism** (8 hours)
  - Multiple users validate same item
  - Aggregate votes, resolve disputes
  - Reputation system (high-reputation users auto-approved)

- [ ] **Pilot with Power Users** (2 weeks)
  - Recruit 50 beta users
  - Test crowdsourcing accuracy (measure consensus rate)
  - Iterate based on feedback

---

## Conclusion

**You now have a complete leaflet ingestion solution spanning MVP → Phase 2:**

✅ **MVP (Manual Entry):** Fast to build (2-3 hours), validates demand, supports Food Lover's Market launch in Phase 1.5

✅ **Phase 1.5 (OCR):** Automates 80% of leaflet entry, reduces time from 20min → 5min per retailer, costs R150/year

✅ **Phase 2 (Crowdsourcing):** Scales to unlimited retailers, community-driven, zero recurring cost

**Integration is seamless:** Optimization engine treats scraped prices and leaflet prices identically (unified `RetailerPrice` table).

**Next Steps:**
1. Add Prisma schema for leaflet tables (15 min)
2. Build manual entry admin panel (2 hours)
3. Test with Food Lover's Market leaflet (Week 2)
4. Decide on OCR automation timing (Month 6 if 3+ leaflet retailers validated)

---

**Want me to help you with any specific part?**
- Generate the Prisma schema additions?
- Code the manual entry form in full detail?
- Design the OCR parsing regex patterns?
- Something else?
