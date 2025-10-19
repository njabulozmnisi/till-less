# Updated 9-Week Sprint Plan: OCR in Week 4

**Date:** October 17, 2025
**Change:** Moved OCR automation from Phase 1.5 (Month 6) to **Week 4** of MVP sprint

---

## 🎯 **Why This Change?**

**Original Plan:** Wait until Month 6 to add OCR (after validating demand with manual entry)

**New Plan:** Add OCR in Week 4 (alongside optimization engine development)

**Rationale:**
1. ✅ **Azure free tier is truly free forever** (5,000 transactions/month, no credit card)
2. ✅ **Setup takes only 4 hours** (not a major time investment)
3. ✅ **Massive headroom** (supports 78 retailers vs. your need for 2-5)
4. ✅ **Better user experience earlier** (upload leaflet vs. manual entry from Day 1)
5. ✅ **Food Lover's Market can launch in MVP** (not Phase 1.5)

**Trade-off:** Week 4 becomes busier (optimization engine + OCR), but both are backend tasks that can be done in parallel if needed.

---

## 📅 **Updated Sprint Breakdown**

### **Sprint 1: Data Backbone (Weeks 1-3)**

#### Week 1: Infrastructure & Schema Setup
- Monorepo initialization (Nx)
- Supabase Postgres setup
- Prisma schema (CPR tables)
- Seed 50 common products

#### Week 2: Scraper Foundation
- Checkers + Pick n Pay scrapers (Playwright)
- pg-boss ingestion queue
- Normalization worker (CPR matching)

#### Week 3: Scraper Expansion + **Leaflet Manual Entry** ⭐ NEW
- Woolworths, Shoprite, Makro scrapers
- Temporalite scheduling (2-4 hour cadence)
- Monitoring dashboard
- **NEW: Manual leaflet entry admin panel**
  - Database schema (Leaflet, LeafletItem, LeafletReviewQueue tables)
  - Admin form (retailer selector, item fields)
  - API endpoint (process items, match to CPR)
  - Review queue UI (manually link unmatched items)

**Time Added:** +3 hours (database schema 30min, admin panel 1.5h, API 1h)

---

### **Sprint 2: Optimization Engine + Frontend (Weeks 4-6)**

#### Week 4: Optimization Algorithm Core + **OCR Automation** ⭐ NEW
- Optimization API endpoint
- Basket cost calculation (price + loyalty + travel)
- Single-store recommendation
- **NEW: Azure Computer Vision OCR integration**
  - Azure free tier setup (10 min)
  - Install Azure SDK
  - OCR service (text extraction from PDF/images)
  - NLP parsing (regex patterns for SA leaflet formats)
  - OCR endpoint (upload leaflet → extract → parse → match to CPR)
  - Update admin panel (add OCR upload option)

**Time Added:** +4 hours (Azure setup 10min, OCR service 2h, endpoint 1h, admin panel update 1h)

**Success Criteria:**
- ✅ Optimization API <15s runtime
- ✅ Loyalty + travel cost integrated
- ✅ **OCR processes 4-page leaflet in <30 seconds**
- ✅ **80%+ auto-match rate** (20% manual review queue)
- ✅ **Azure free tier working** (zero cost)

#### Week 5: Frontend Shopping List + Results UI
- Shopping list input form (Next.js)
- CSV import functionality
- Results dashboard (item comparison table)

#### Week 6: User Auth + Preferences
- BetterAuth integration (password + Google OAuth)
- User registration/login flow
- Preferences page (loyalty cards, home location, effort tolerance)

---

### **Sprint 3: Feedback Loop + Launch Prep (Weeks 7-9)**

#### Week 7: Receipt Reconciliation
- Receipt upload UI
- Manual total entry
- Variance tracking (predicted vs. actual)

#### Week 8: Analytics + Savings Dashboard
- User savings dashboard
- Accuracy metrics
- Historical trends

#### Week 9: Deployment + Beta Launch
- Production deployment (Vercel + Railway)
- CI/CD pipeline (GitHub Actions)
- Monitoring & alerting (Sentry, Supabase alerts)
- Beta launch (20 Gauteng households recruited)

---

## 🔧 **Technical Details: OCR Implementation**

### Azure Computer Vision Free Tier

**Setup (10 minutes):**
1. Create free Azure account (no credit card): https://azure.microsoft.com/free/
2. Create Computer Vision resource (Pricing Tier: **F0 Free**)
3. Get API key and endpoint
4. Add to `.env`:
   ```bash
   AZURE_COMPUTER_VISION_KEY=your-key-here
   AZURE_COMPUTER_VISION_ENDPOINT=https://your-endpoint.cognitiveservices.azure.com/
   ```

**Free Tier Limits:**
- 5,000 transactions/month (forever, not a trial)
- You need: ~16 leaflets/month (4 per week)
- **Headroom: 312x more than needed**

**Accuracy:**
- OCR text extraction: 95% (Azure)
- NLP parsing: 90% (regex patterns)
- Combined auto-match: 80-85% (15-20% manual review)

### Database Schema Additions (Week 3)

```prisma
model Leaflet {
  id         String   @id @default(uuid())
  retailer   String   // "FoodLoversMarket", "SparRandburg"
  weekStart  DateTime
  weekEnd    DateTime
  status     String   // "pending", "processing", "completed"
  dataSource String   // "manual", "ocr"
  uploadedBy String?  // userId
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  items      LeafletItem[]
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
  ocrConfidence    Float?   // OCR confidence score (0-1)
  matchedProductId String?
  matchConfidence  Float?   // CPR match confidence (0-1)
  manuallyReviewed Boolean  @default(false)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

model LeafletReviewQueue {
  id            String      @id @default(uuid())
  leafletItemId String      @unique
  leafletItem   LeafletItem @relation(fields: [leafletItemId], references: [id])
  reason        String      // "low_ocr_confidence", "no_cpr_match"
  priority      Int         // 1-5 (5 = high priority)
  reviewedBy    String?
  reviewedAt    DateTime?
  createdAt     DateTime    @default(now())
}

// Update existing model
model RetailerPrice {
  // ... existing fields ...
  dataSource  String    @default("scraper") // "scraper", "leaflet_manual", "leaflet_ocr"
  validUntil  DateTime? // For leaflets: end of week (Sunday)
}
```

### Code Components (Week 4)

**New Files to Create:**
1. `apps/api/src/modules/leaflets/ocr.service.ts` (OCR extraction + parsing)
2. `apps/api/src/modules/leaflets/leaflets.controller.ts` (OCR endpoint)
3. `apps/web/src/app/admin/leaflets/page.tsx` (upload UI)

**Dependencies to Install:**
```bash
pnpm add @azure/cognitiveservices-computervision @azure/ms-rest-js
pnpm add pdf-poppler sharp  # PDF-to-image conversion
```

**External Tools Needed:**
- `poppler-utils` (for PDF-to-image conversion)
  - macOS: `brew install poppler`
  - Linux: `apt-get install poppler-utils`
  - Already included in Railway if using Alpine Linux Docker base

---

## 📊 **Updated Week-by-Week KPIs**

| Week | Metric | Target | How to Measure |
|------|--------|--------|----------------|
| **Week 1** | Database schema deployed | ✅ Complete | Prisma migrations run successfully |
| **Week 2** | Scrapers operational | 2 retailers (Checkers, PnP), 85% match rate | Scraper logs, normalization success % |
| **Week 3** | All retailers + leaflet manual | 5 retailers, **manual leaflet entry working** | Monitoring dashboard, admin can enter 20-item leaflet in 10 min |
| **Week 4** | Optimization API + **OCR** | <15s runtime, **80%+ OCR auto-match** | API logs, OCR processes 4-page leaflet in <30s |
| **Week 5** | Frontend functional | Users can input list, see results | Manual testing, beta user feedback |
| **Week 6** | Auth & preferences | Users can register, save preferences | User count, preference completion rate |
| **Week 7** | Receipt reconciliation | Users upload receipts, variance calculated | Receipt upload count, avg variance |
| **Week 8** | Savings dashboard | Users see R-value saved, accuracy % | Dashboard views, engagement metrics |
| **Week 9** | Beta launch | 20 users onboarded, 10+ optimizations run | User signups, optimization API calls |

---

## 🎯 **Updated Success Criteria (Week 9)**

**MVP is successful if:**
1. ✅ 500 active users (Gauteng) within 3 months post-launch
2. ✅ ≥8% average savings (validated via receipt reconciliation)
3. ✅ ≥95% product matching accuracy (≤5% manual override rate)
4. ✅ ≤30 second optimization runtime for 60-item lists
5. ✅ ≥70% recommendation acceptance rate
6. ✅ NPS ≥40 (early trust signals)
7. ✅ **NEW: Leaflet retailers (Food Lover's Market) included in optimization**
8. ✅ **NEW: 80%+ OCR auto-match rate (validates Azure free tier choice)**

---

## 💰 **Cost Breakdown (Still Zero Budget)**

| Component | Original Plan | Updated Plan | Cost |
|-----------|--------------|--------------|------|
| **Web Scraping** | Playwright workers (5 retailers) | Same | **R0** |
| **Leaflet Ingestion (Manual)** | Phase 1.5 (Month 6) | **Week 3** | **R0** (internal labor: 20 min/week) |
| **Leaflet Ingestion (OCR)** | Phase 1.5 (Month 6) | **Week 4** | **R0** (Azure free tier: 5,000/month) |
| **Infrastructure** | Vercel + Railway/Supabase | Same | **R0** (free tiers) |
| **Total** | R0 | **R0** | ✅ Zero budget maintained |

**Key Insight:** Moving OCR forward doesn't increase costs (Azure free tier is truly free forever).

---

## 🚨 **Risks & Mitigation**

### New Risk: Week 4 Complexity

**Risk:** Week 4 becomes overloaded (optimization engine + OCR = 2 major features)

**Mitigation:**
- Optimization engine is primary focus (4 hours)
- OCR is secondary (4 hours)
- If time-constrained: OCR can slip to Week 5 (still way ahead of Month 6 original plan)
- Both are backend tasks (can work in parallel if 2 developers)

### Existing Risks (Unchanged)

1. **Retailer Scraper Blocking** (Medium → High)
   - Mitigation: Polite cadence, IP rotation, fallback to leaflets if blocked

2. **Product Matching Errors** (High)
   - Mitigation: Receipt reconciliation feedback loop, manual review queue

3. **Troli Feature Parity** (Medium)
   - Mitigation: Speed to market (9 weeks), transparency differentiation

4. **Azure Free Tier Policy Change** (Low, NEW)
   - Mitigation: Fallback to Tesseract OCR (2 hours migration, self-hosted, unlimited)

---

## ✅ **Action Items (Updated)**

### Week 3 (This Week, If Starting Now)

- [ ] **Add leaflet database schema** (30 min)
  - Prisma migration: Leaflet, LeafletItem, LeafletReviewQueue tables
  - Update RetailerPrice: add `dataSource` field

- [ ] **Build manual entry admin panel** (2 hours)
  - Form: retailer selector, week range, dynamic item fields
  - API endpoint: process items, match to CPR
  - Review queue UI: display unmatched items

- [ ] **Test with sample leaflet** (30 min)
  - Download Food Lover's Market leaflet (PDF or print)
  - Manually enter 20 items
  - Verify prices appear in optimization results

### Week 4 (Next Week)

- [ ] **Set up Azure Computer Vision** (10 min)
  - Create free Azure account (no credit card)
  - Create Computer Vision resource (F0 Free tier)
  - Copy API key and endpoint to `.env`

- [ ] **Install OCR dependencies** (5 min)
  ```bash
  pnpm add @azure/cognitiveservices-computervision @azure/ms-rest-js
  pnpm add pdf-poppler sharp
  brew install poppler  # macOS (or apt-get on Linux)
  ```

- [ ] **Build OCR service** (2 hours)
  - Create `ocr.service.ts` (text extraction + NLP parsing)
  - Implement regex patterns for SA leaflet formats

- [ ] **Add OCR endpoint** (1 hour)
  - `POST /api/admin/leaflets/ocr` (upload → extract → parse → match)

- [ ] **Update admin panel** (1 hour)
  - Add radio button: "Manual Entry" vs. "Upload Leaflet (OCR)"
  - File upload input (PDF/image)
  - Display OCR results: items extracted, auto-matched, review queue count

- [ ] **Test OCR pipeline** (30 min)
  - Upload Food Lover's Market PDF leaflet
  - Verify 80%+ auto-match rate
  - Review queued items, manually link to CPR

---

## 🎉 **Summary: What Changed?**

### Before (Original Plan)
- **Week 3:** Scrapers only (no leaflet support)
- **Week 4:** Optimization engine only
- **Month 6 (Phase 1.5):** Add leaflet manual entry
- **Month 6 (Phase 1.5):** Add OCR automation (if 3+ leaflet retailers validated)

### After (Updated Plan)
- **Week 3:** Scrapers + **manual leaflet entry admin panel**
- **Week 4:** Optimization engine + **Azure OCR automation**
- **Month 6 (Phase 1.5):** ~~Add leaflets~~ → ✅ Already done! Focus on multi-store routing, meal planning instead

### Benefits
1. ✅ **Food Lover's Market launches in MVP** (not Phase 1.5)
2. ✅ **Better user experience from Day 1** (upload leaflet vs. manual entry)
3. ✅ **Faster validation** (test OCR accuracy in Week 4, iterate immediately)
4. ✅ **No added cost** (Azure free tier is free forever)
5. ✅ **Competitive advantage sooner** (Troli doesn't have leaflet support)

### Trade-offs
1. ⚠️ **Week 3-4 slightly busier** (+7 hours total: 3h manual entry, 4h OCR)
2. ⚠️ **Dependency on Azure** (mitigation: Tesseract fallback ready in 2 hours)

---

## 📚 **Reference Documents**

- **Full Implementation Guide:** `docs/implementation-transition-guide.md` (updated with OCR in Week 4)
- **Leaflet Ingestion System (Free):** `docs/leaflet-ingestion-system-free.md` (Azure vs. Tesseract comparison)
- **Leaflet Ingestion System (Original):** `docs/leaflet-ingestion-system.md` (manual → OCR → crowdsourcing roadmap)

---

## 🚀 **Ready to Start?**

**Your revised 9-week sprint plan is locked in:**
- Week 3: Manual leaflet entry (+3 hours)
- Week 4: OCR automation (+4 hours)
- Zero cost increase
- Food Lover's Market launches in MVP

**Next Steps:**
1. Review updated `docs/implementation-transition-guide.md` (full details)
2. Start Week 1 (database schema, seed data)
3. Or jump to Week 3 if you want to prototype leaflet system first

**Questions? Want me to generate specific code for any component?** I'm ready to help! 🎯

---

*Sprint plan updated by Mary (Business Analyst) | BMAD™ Framework | October 17, 2025*
