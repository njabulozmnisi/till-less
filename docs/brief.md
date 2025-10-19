# Project Brief: TillLess

**Date:** October 2025
**Version:** 1.0
**Status:** Active Development
**Owner:** Product Team

---

## Executive Summary

**TillLess** is a personal shopping optimization platform for South African households that analyzes shopping lists across multiple retailers (Checkers, Pick n Pay, Shoprite, Woolworths, Makro) to recommend the cheapest complete basket while accounting for loyalty pricing, travel costs, and user preferences. The MVP targets budget-conscious Gauteng families doing monthly R3,000+ grocery shops, delivering ≥8% average savings (R240+ per shop) with ≤10 minutes of user effort.

**Key Value Proposition:** Unlike item-level price checkers (PriceCheck) or single-retailer delivery apps (Checkers Sixty60), TillLess provides **transparent total cost optimization** — surfacing the absolute cheapest way to complete your monthly shop across all major stores, factoring in loyalty card benefits, travel effort, and smart substitutions.

**Target Market:** 4.3 million tech-comfortable South African households (25% of 17.2M total households) spending >R2,000/month on groceries, with potential TAM of R823 million based on R15.93 average monthly willingness-to-pay.

---

## Problem Statement

### Current State & Pain Points

South African grocery shoppers face a complex, frustrating optimization problem:

1. **Price Opacity Across Retailers**
   - Same products vary 15-40% in price across Checkers, Pick n Pay, Shoprite, Woolworths, Makro
   - Weekly promotions change constantly ("3 for R50", "Buy 2 Get 1 Free")
   - Loyalty pricing adds another layer (Xtra Savings 10-25% discounts on select items)

2. **Manual Cross-Checking is Time-Consuming & Error-Prone**
   - Browsing 5 retailer websites/apps takes 60+ minutes per monthly shop
   - Pack size conversions are mentally taxing (500ml vs 2L, 1kg vs 2.5kg bags)
   - Promotion math is complex (loyalty card + bulk deal + size conversion)

3. **Existing Tools Are Incomplete**
   - **Price comparison apps** (PriceCheck, Troli): Show item-level prices but don't optimize whole baskets
   - **Retailer delivery apps** (Sixty60, asap!): Single-store only, can't compare across retailers
   - **Deal aggregators** (Cataloguespecials): Passive browsing, no shopping list integration
   - **None account for travel costs**: Cheapest store 20km away may not be worth R180 savings

### Impact (Quantified)

- **Financial:** Average SA household spends R3,500/month on groceries. Manual optimization (if attempted) captures 3-5% savings; algorithmic optimization can achieve 8-15% (R280-525/month = R3,360-6,300/year)
- **Time:** Shoppers waste 60+ minutes/month comparing prices manually (R100-150 opportunity cost at R150/hour value of time)
- **Cognitive Load:** Decision fatigue from evaluating hundreds of product×retailer combinations leads to suboptimal "default store" loyalty

### Why Existing Solutions Fall Short

- **PriceCheck:** Item comparison only; users must manually aggregate basket totals and calculate travel costs
- **Troli:** Claims 25% savings but lacks transparency (methodology unknown); no evident loyalty/travel cost modeling
- **Checkers Sixty60 / Pick n Pay asap!:** Optimized for speed (60-min delivery), not savings; single-retailer lock-in
- **Basket (US):** Closest analog internationally, but crowdsourced data has cold-start problem and no SA presence; lacks loyalty program integration

**Gap:** No solution optimizes complete baskets across multiple SA retailers while factoring loyalty pricing, travel costs, substitution preferences, and transparent trade-off explanations.

### Urgency & Importance

- **Economic Pressure:** SA inflation (especially food inflation) makes grocery optimization critical for household budgets
- **Market Timing:** Competitors (Troli) gaining traction, but feature gaps create 6-12 month window for differentiation
- **Behavioral Shift:** COVID accelerated online grocery adoption; users now comfortable with digital shopping tools
- **Loyalty Program Complexity:** Retailers pushing Xtra Savings, Smart Shopper, WRewards — shoppers need help maximizing value

---

## Proposed Solution

### Core Concept

TillLess is a **"Monthly Shopping CFO"** that transforms a user's shopping list into an optimized procurement plan:

1. User inputs shopping list (manual entry or CSV import): items, quantities, brand preferences, substitution tolerance
2. TillLess ingests latest retailer pricing via compliant web scraping (Playwright workers, 2-4 hour cadence)
3. Optimization engine calculates total basket cost per retailer, applying:
   - Loyalty pricing (Xtra Savings, Smart Shopper, WRewards, mCard)
   - Promotions (3-for-2, bulk discounts, size-based deals)
   - Travel cost model (distance × user-configurable R/km rate + time value R/hour)
   - Substitution logic (brand flexibility, size tolerance)
4. Results page shows:
   - **Recommended store** with total cost breakdown (price + loyalty savings - travel cost = net total)
   - **Item-level comparison table** across all 5 retailers (price, unit price, promo badges)
   - **Substitution suggestions** for out-of-stock or higher-priced items
   - **Trade-off transparency:** "Makro saves R180 but requires 20km travel (45min, R85 fuel) — net R95 savings"
5. Post-shop: User uploads receipt → reconciliation → accuracy tracking → product mapping improvement (feedback loop)

### Key Differentiators

1. **Total Cost Modeling** (vs. item-level price comparison)
   - Only TillLess factors loyalty + promotions + travel + time into a unified recommendation
   - Transparent breakdown (not black-box like Troli's "25% savings" claim)

2. **Loyalty Program Mastery** (vs. generic price tools)
   - Xtra Savings, Smart Shopper, WRewards, mCard pricing integrated
   - Shows side-by-side: "With Xtra Savings at Checkers: R2,850 (15% loyalty discount applied)"

3. **Effort-Aware Optimization** (vs. cheapest-price-only tools)
   - User sets time value (R100/hour) and max stores (1-3)
   - Recommendations balance savings vs. convenience

4. **Smart Substitutions** (vs. exact-match-only competitors)
   - Brand flexibility: "Nescafe unavailable; Ricoffy suggested (same size, R15 cheaper)"
   - Size tolerance: "500ml out of stock; recommend 2×250ml (R5 more but available)"

5. **Receipt Reconciliation Intelligence** (vs. static data)
   - Users upload receipts → TillLess learns actual prices → improves mapping accuracy
   - Network effects: more receipts → better product matching → more accurate recommendations

### Why This Will Succeed

1. **Proven Model Internationally:** Basket (US) validates whole-basket optimization with 20% average user savings and 165K store coverage
2. **Unmet SA Market Need:** Brainstorming + market research confirmed no existing solution addresses monthly bulk shopping optimization
3. **Technical Feasibility:** Playwright scraping + NestJS optimization engine + Supabase Postgres proven in Phase 0 prototyping
4. **Differentiation Window:** Troli has first-mover advantage but lacks loyalty/travel modeling — 6-12 month window to capture power users
5. **Monetization Path:** Freemium (free MVP) → subscription (premium features like multi-store routing, meal planning) → B2B data licensing (anonymized pricing trends to CPG brands)

### High-Level Vision

**Phase 1 (MVP - 3 months):** Single-store basket optimization with loyalty/travel modeling for 5 retailers (Checkers, PnP, Shoprite, Woolworths, Makro)

**Phase 1.5 (6 months):** Receipt OCR, price alerts, Food Lover's Market integration, multi-store route optimization

**Phase 2 (12 months):** Meal planning integration (recipe → ingredient list → optimized shopping), pantry management, predictive restocking

**Long-term Vision:** "Household Food & Budget Concierge" — AI-powered monthly food planning that optimizes nutrition, budget, and preferences; eliminates food planning cognitive load entirely

---

## Target Users

### Primary User Segment: Thandi (Budget-Conscious Parent)

**Demographic Profile:**
- Age: 30-45
- Location: Gauteng (Johannesburg, Pretoria suburbs)
- Household: Family of 4 (2 adults, 2 children)
- Income: Middle-class (R25,000-50,000/month household income)
- Tech comfort: Smartphone owner, uses WhatsApp/banking apps daily, comfortable with online shopping

**Current Behaviors & Workflows:**
- Shops monthly for bulk groceries (R3,000-4,500/month spend)
- Holds 2-3 loyalty cards (Xtra Savings, Smart Shopper, WRewards)
- Currently defaults to 1-2 "habitual stores" (e.g., always Checkers, occasionally Pick n Pay for specials)
- Browses retailer apps/flyers for promotions but finds manual comparison exhausting
- Values time (works full-time, limited capacity for multi-store trips)

**Specific Needs & Pain Points:**
- **Budget pressure:** Food inflation squeezing household finances; needs to maximize grocery Rands
- **Time scarcity:** 10-15 minutes max for planning; cannot spend 60+ minutes comparing prices
- **Trust:** Skeptical of "savings claims" without transparent breakdowns
- **Convenience vs. savings trade-off:** Willing to travel for significant savings (R200+), but not for marginal gains (R30)
- **Loyalty confusion:** Holds multiple cards but unclear which to use where for maximum benefit

**Goals:**
- Save ≥R200/month on groceries without extra effort
- Reduce decision fatigue (want confident "right answer" for where to shop)
- Maximize loyalty card benefits (currently underutilized)
- Complete shopping list with minimal stockouts/substitutions

### Secondary User Segment: Bongani (Bulk Buyer / Side Hustler)

**Demographic Profile:**
- Age: 25-40
- Location: Gauteng (urban/peri-urban)
- Household: Single or small family
- Income: Entrepreneurial (R15,000-35,000/month, variable)
- Side hustle: Resells bulk items (Makro purchases) or runs spaza shop

**Current Behaviors & Workflows:**
- Shops bulk at Makro (carton sizes, wholesale pricing)
- Highly price-sensitive (margins matter for resale)
- Willing to travel 20-40km for significant savings (R300+)
- Tracks prices manually (spreadsheets, notes)
- Less loyalty card focused (more interested in absolute lowest price)

**Specific Needs & Pain Points:**
- **Margin optimization:** Every Rand saved = profit increase for resale
- **Bulk deal detection:** Needs to spot "buy 10 get 2 free" type offers
- **Stock availability:** Makro stockouts force expensive pivots to other retailers
- **Delivery vs. pickup math:** Balance fuel cost vs. delivery fees for heavy items

**Goals:**
- Maximize savings on bulk purchases (R500-1000+ savings per trip)
- Identify best retailer for specific product categories (Makro for staples, Shoprite for promos)
- Minimize wasted trips (know stock availability before traveling)

---

## Goals & Success Metrics

### Business Objectives

- **Adoption:** Onboard 500 active users within 3 months of MVP launch (Gauteng-focused)
- **Engagement:** Achieve 60% monthly active user retention (users running ≥1 optimization per month)
- **Savings Delivery:** Demonstrate ≥8% average savings vs. user's baseline store (validated via receipt reconciliation)
- **Data Quality:** Achieve 95% product matching accuracy (≤5% manual override rate)
- **Efficiency:** Complete optimization runs in ≤30 seconds for lists up to 60 items
- **Feedback Loop:** Capture 40% receipt upload rate (users uploading ≥1 receipt per month to improve accuracy)

### User Success Metrics

- **Time to Value:** Users complete first optimization in ≤10 minutes (signup → list input → results)
- **Savings Realization:** ≥80% of recommendations accepted (user actually shops at recommended store)
- **Prediction Accuracy:** ≤3% variance between predicted basket cost and actual till receipt
- **User Satisfaction:** NPS ≥50 within 6 months (higher trust than competitors via transparency)
- **Recommendation Confidence:** 95% of items matched to retailer products (≤5% "manual search required" fallback)

### Key Performance Indicators (KPIs)

- **Average Savings per Basket:** R240+ (8% of R3,000 average basket), target R360 (12%) by Month 6
- **Monthly Active Users (MAU):** 500 (Month 3) → 2,000 (Month 6) → 5,000 (Month 12)
- **Receipt Upload Rate:** 40% of users upload ≥1 receipt/month (validates predictions, improves mapping)
- **Optimization Completion Rate:** ≥70% of users who start optimization complete it (low abandonment)
- **Retailer Coverage Quality:** 95% product availability (items in stock at ≥1 retailer for 95% of lists)
- **Scraping Uptime:** 95% data pipeline availability (scrapers run successfully, alerts within 5min of failure)

---

## MVP Scope

### Core Features (Must Have)

- **Shopping List Management**
  - Manual entry (item name, quantity, size, brand preference, substitution tolerance, must-have flag)
  - CSV import (standard template: "Item, Qty, Size, Brand Lock, Substitution Tolerance")
  - Save/reuse past lists (clone last month's list with edits)

- **Multi-Retailer Price Ingestion**
  - Web scrapers (Playwright workers) for Checkers, Pick n Pay, Shoprite, Woolworths, Makro
  - Cadence scheduling (Temporalite orchestration: 2-4 hour refresh for staples, higher frequency during promo weeks)
  - Product matching (canonical product registry + heuristics: string normalization, pack parsing, brand dictionary, optional GTIN)

- **Loyalty Pricing Integration**
  - User profile: toggle loyalty cards (Xtra Savings, Smart Shopper, WRewards, mCard, Makro membership)
  - Fetch loyalty-specific pricing (if available via scraping or manual entry)
  - Show loyalty discount impact: "With Xtra Savings: R2,850 (R450 loyalty savings applied)"

- **Optimization Engine**
  - Single-store basket cost calculation (price + promotions + loyalty - travel cost = total)
  - Travel cost model: distance (Google Maps API or static tables) × R/km rate + time (user-configurable R/hour value)
  - Substitution logic: suggest alternatives within tolerance (brand flexibility, size conversion, "must-have" items never substituted)
  - Results ranking: cheapest total cost (default), option to view nearest store, option to view "best availability" (fewest missing items)

- **Results Dashboard (Web UI)**
  - Recommended store card: total cost, savings vs. baseline (user's habitual store), travel cost breakdown
  - Item-level comparison table: 5-column matrix (Item | Checkers | PnP | Shoprite | Woolies | Makro) with prices, unit prices, promo badges
  - Missing items highlight: "3 items unavailable at Checkers; alternatives suggested below"
  - Substitution recommendations: "Nescafe 200g (R89) unavailable → Suggest Ricoffy 200g (R74, 17% savings)"
  - Export options: PDF summary, email plan

- **Receipt Reconciliation (Feedback Loop)**
  - Manual receipt upload (photo/PDF)
  - User enters actual totals paid per retailer
  - Variance analysis: "Predicted R2,850, actual R2,920 (3% variance) — adjusting product mapping"
  - Queue low-confidence matches for manual review (human-in-the-loop for edge cases)

- **User Profile & Preferences**
  - Loyalty card toggles (enable/disable per optimization run)
  - Home location (for distance calculation)
  - Effort tolerance: max stores willing to visit (default 1), max distance (default 10km)
  - Time value setting (R/hour equivalent for travel time, default R100/hour)

### Out of Scope for MVP

- **Mobile Apps (iOS/Android):** Web-first MVP; responsive web design only (mobile apps Phase 1.5)
- **Receipt OCR Automation:** Phase 1.5 feature (MVP requires manual receipt entry)
- **Real-Time Stock Verification:** No live stock APIs; rely on "last scraped" data + user feedback
- **Meal Planning Integration:** Phase 2 (recipe → shopping list generation)
- **Multi-Store Route Optimization:** Phase 1.5 (currently recommend single best store; multi-store splitting later)
- **Native Delivery Integration:** Planning-only MVP (no Uber Direct/Mr D fulfillment)
- **Pantry Management / Consumption Tracking:** Phase 2 features
- **Social Features (Shared Lists, Family Accounts):** Phase 2
- **Paid Subscription Model:** Free MVP (monetization planning for Phase 2)

### MVP Success Criteria

**MVP is successful if:**
1. **500 active users** (Gauteng) within 3 months post-launch
2. **≥8% average savings** demonstrated (validated via receipt reconciliation)
3. **≥95% product matching accuracy** (≤5% manual override rate)
4. **≤30 second optimization runtime** for 60-item lists
5. **≥70% recommendation acceptance rate** (users shop at TillLess-recommended store)
6. **NPS ≥40** (early trust signals vs. competitors)

**Key Validation Questions Answered:**
- Does whole-basket optimization deliver meaningful savings (>R200/month)?
- Can web scraping provide reliable, fresh data (95% uptime)?
- Do users trust and act on recommendations (acceptance rate >70%)?
- Is loyalty pricing integration a differentiator (vs. Troli's unknown approach)?

---

## Post-MVP Vision

### Phase 2 Features (Months 6-12)

**Receipt OCR Pipeline**
- Automate receipt uploads (photo → structured data via Google Cloud Vision / Mindee)
- Passive crowdsourcing (like Basket): user receipts improve product mapping for all users
- Accelerates feedback loop (from manual entry to automated variance tracking)

**Price Alerts & Notifications**
- Push notifications when favorited items drop in price ("Nescafe 200g now R69 at Woolworths — 22% off!")
- Promo expiry warnings ("Xtra Savings deal ends tomorrow — shop now to save R85")
- Habit-forming feature (matches Troli's price alerts)

**Multi-Store Route Optimization**
- For users willing to visit 2-3 stores for maximum savings (>R300)
- Calculate optimal route: "Buy staples at Makro (R1,200), fresh produce at Woolworths (R650) — total R1,850 vs. R2,100 single-store"
- Google Maps integration for turn-by-turn routing

**Food Lover's Market Integration**
- Expand retailer coverage to 6 (add Food Lover's Market where available)
- Specialty produce pricing often beats major chains

### Long-Term Vision (1-2 Years)

**"Household Food & Budget Concierge"**
- AI-powered meal planning: "Pick 20 dinners, 5 breakfasts, 3 snacks → TillLess generates ingredient list → optimizes sourcing across retailers"
- Nutrition awareness: "This meal plan meets 90% of daily iron, 85% calcium; suggest iron-rich substitutes?"
- Budget guardrails: "R3,000 budget set; current plan R3,200 — here are 5 swaps to fit budget"
- Pantry integration: "You have 2kg rice at home; reducing rice quantity in this month's list"
- Consumption prediction: "You typically consume 2L milk every 5 days; suggest restocking in 3 days"

**Transformation:** From "price calculator" → "household food CFO + meal assistant" — comprehensive monthly food planning eliminating all decision fatigue

### Expansion Opportunities

**Geographic Expansion:**
- Beyond Gauteng: Cape Town, Durban, other metros (requires scraper geo-targeting)
- National coverage (challenges: regional pricing variations, store availability)
- International: Other African markets (Kenya, Nigeria — adapt to local retailers)

**B2B Opportunities:**
- **Retailer Partnerships:** License optimization engine to Shoprite/PnP (white-label "loyalty optimizer" in their apps)
- **Fintech Integrations:** Partner with banks (FNB, Capitec) — embed TillLess in banking apps to reduce customer grocery spend
- **Data Licensing:** Sell anonymized pricing trends, basket insights to CPG brands and market research firms

**Product Extensions:**
- **Non-Grocery Optimization:** Extend to household essentials (toiletries, cleaning products) at Dis-Chem, Clicks, pharmacies
- **Bulk Buying Clubs:** "Pool orders with neighbors for Makro wholesale pricing (10+ unit threshold)"
- **Cashback Integration:** Partner with eBucks, Discovery Miles to factor rewards into total cost model

---

## Technical Considerations

### Platform Requirements

- **Target Platforms:** Web (responsive design for mobile browsers); native mobile apps (iOS/Android) deferred to Phase 1.5
- **Browser Support:** Modern browsers (Chrome, Safari, Firefox, Edge); last 2 versions
- **Performance Requirements:**
  - Optimization engine: ≤30 seconds for 60-item lists (target: ≤15 seconds)
  - Page load: ≤2 seconds for results dashboard (optimized queries, CDN for assets)
  - Scraping cadence: 2-4 hour refresh for staples; 1-hour for promo-heavy categories (dairy, snacks)
  - API response time: ≤500ms for 95th percentile (REST/GraphQL endpoints)

### Technology Preferences

**Frontend:**
- **Framework:** Next.js 14+ (App Router, React Server Components, TypeScript)
- **Styling:** Tailwind CSS (rapid prototyping, consistent design system)
- **State Management:** Zustand or React Context (avoid Redux complexity for MVP)
- **Forms:** React Hook Form + Zod validation (CSV import, shopping list entry)

**Backend:**
- **Framework:** NestJS (TypeScript, modular architecture, GraphQL/REST dual support)
- **ORM:** Prisma Client (type-safe database access, migration management)
- **Queue:** pg-boss (Postgres-backed job queue, fits Supabase free tier, retry/scheduling built-in)
- **Scheduler:** Temporalite (single-node Temporal, Docker Compose local dev, durable workflows for scraping)

**Database:**
- **Primary DB:** Supabase Postgres (free tier: 500MB storage, 2GB bandwidth/month)
- **Schema:** Canonical Product Registry (extended with loyalty pricing, per-weight fields)
- **Caching:** Redis (Upstash free tier: 10,000 commands/day) for product lookups, optimization results

**Hosting/Infrastructure:**
- **Frontend:** Vercel (Next.js optimized, free hobby tier, global CDN)
- **Backend:** Railway (NestJS deployment, free $5/month credit ~500 hours)
- **Database:** Supabase (managed Postgres, free tier sufficient for MVP)
- **Scrapers:** Docker containers (Railway background workers)
- **Scheduler:** Temporalite (Docker Compose, self-hosted on Railway)

### Architecture Considerations

**Repository Structure:**
- **Monorepo (Nx):** Shared TypeScript types between frontend/backend, unified CI/CD, powerful build orchestration
- **Libraries:** `apps/web` (Next.js), `apps/api` (NestJS), `apps/admin` (admin panel), `libs/shared` (types/utils), `libs/scrapers` (Playwright workers), `libs/ocr` (OCR service), `libs/database` (Prisma)

**Service Architecture:**
- **API Layer:** NestJS REST/GraphQL (unified endpoint for frontend, supports future mobile apps)
- **Optimization Engine:** Isolated service (called by API, modular for algorithm iteration)
- **Scraping Workers:** Playwright Docker containers (scheduled by Temporalite, push results to pg-boss queue)
- **Normalization Workers:** Consume pg-boss queue, match products to Canonical Product Registry, store results

**Integration Requirements:**
- **Google Maps API (or OSRM):** Distance/time calculation (budget: OSRM self-hosted free, Maps API $200/month credit)
- **Receipt OCR (Phase 1.5):** Google Cloud Vision or Mindee (evaluate cost: ~$1.50/1000 images)
- **Email Service:** Resend or SendGrid (transactional emails, free tier sufficient)

**Security/Compliance:**
- **POPIA Compliance:** User data encrypted at rest (Supabase default) and in transit (HTTPS)
- **Receipt Storage:** 90-day retention, stored in Supabase Storage (restricted bucket, user-only access)
- **Scraping Compliance:** Polite cadence (respect robots.txt, rate limits), rotate IPs if needed (avoid blocking)
- **Authentication:** BetterAuth (open-source, JWT + refresh tokens, replaces Supabase Auth for vendor-neutrality)

---

## Constraints & Assumptions

### Constraints

**Budget:**
- **Infrastructure:** R0/month (free tiers: Vercel, Supabase, Railway, Azure; Google Maps API $200 free credit)
- **No paid product feeds:** Reliance on web scraping (retailer APIs unavailable or prohibitively expensive)
- **MVP self-funded:** Bootstrapped (no VC funding); Phase 2 may explore seed funding if traction proven

**Timeline:**
- **MVP Delivery:** 9 weeks (3-week sprints: Data Backbone → Optimization MVP → Feedback Loop + UI)
- **Pilot Launch:** Week 10 (closed beta: ≤20 Gauteng households for validation)
- **Public Launch:** Month 4 (post-pilot refinement)

**Resources:**
- **Team:** Solo developer (initial) or 2-person team (1 FE, 1 BE/scraping specialist)
- **Time Commitment:** 20-30 hours/week (side project or focused sprint)
- **No design resources:** Use Tailwind UI components, Shadcn UI (avoid custom design complexity)

**Technical:**
- **Scraping Sustainability:** Retailers may block scrapers (mitigation: polite cadence, IP rotation, fallback to crowdsourcing)
- **Data Freshness:** 2-4 hour cadence may miss flash deals (trade-off: accuracy vs. infrastructure cost)
- **Geographic Limitation:** Gauteng-only MVP (scraper geo-targeting, product availability varies by region)

### Key Assumptions

- **User Behavior:** Shoppers willing to invest 10 minutes planning for R200+ monthly savings
- **Loyalty Card Ownership:** ≥70% of target users hold 2+ loyalty cards (Xtra Savings, Smart Shopper common in Gauteng)
- **Travel Willingness:** Users accept 5-10km travel for R150+ savings; reject 20km+ for <R100 savings
- **Scraping Feasibility:** Retailers won't aggressively block scrapers if cadence is polite (2-4 hour intervals, user-agent rotation)
- **Product Matching Accuracy:** Heuristics (string normalization, brand dictionaries) achieve 90% accuracy; receipt feedback improves to 95%
- **Basket Size:** Average monthly list = 40-60 items (R3,000-4,500 spend); optimization scales to 100 items
- **Stock Availability:** Scraped data (last 2-4 hours) is 85-90% accurate for in-stock status (validated via user feedback)
- **Competitive Window:** 6-12 months before Troli or new entrant matches loyalty/travel cost modeling features

---

## Risks & Open Questions

### Key Risks

- **Retailer Scraper Blocking (High Impact, Medium Likelihood):**
  - *Description:* Checkers, Pick n Pay, or other retailers detect and block TillLess scrapers via IP bans, CAPTCHA, or API restrictions
  - *Impact:* Data gaps → inaccurate recommendations → user trust loss
  - *Mitigation:* Polite cadence, IP rotation (residential proxies), fallback to crowdsourced receipt data (Phase 1.5 OCR), explore retailer API partnerships

- **Product Matching Errors (High Impact, High Likelihood Initially):**
  - *Description:* Heuristics fail to correctly map user items to retailer SKUs (e.g., "Nescafe Gold" → matched to "Nescafe Classic")
  - *Impact:* Inaccurate pricing → wrong recommendations → user dissatisfaction
  - *Mitigation:* Maintain manual review queue (low-confidence matches), receipt reconciliation feedback loop, incremental heuristic tuning, GTIN integration where available

- **Troli Feature Parity (Medium Impact, Medium Likelihood):**
  - *Description:* Troli adds loyalty pricing, travel cost modeling, or receipt reconciliation before TillLess MVP launch
  - *Impact:* Differentiation window closes; TillLess becomes "me-too" product
  - *Mitigation:* Speed to market (9-week MVP sprint), transparency positioning (open methodology vs. Troli black box), technical depth (algorithmic optimization vs. simple comparison)

- **User Behavior Inertia (Medium Impact, High Likelihood):**
  - *Description:* Users stick to "habitual stores" despite TillLess showing R200+ savings (convenience, loyalty, trust in known store)
  - *Impact:* Low recommendation acceptance rate (<50%); savings unrealized
  - *Mitigation:* Effort-aware optimization (balance savings vs. convenience), transparent trade-offs ("Save R85 with 5min extra travel — worth it?"), gradual behavior change nudges (monthly savings dashboard, gamification)

- **Data Freshness Trade-off (Low Impact, Medium Likelihood):**
  - *Description:* 2-4 hour scraping cadence means prices/promos may be outdated at shopping time
  - *Impact:* "Predicted R2,850, actual R2,920" (3-5% variance) → trust erosion if frequent
  - *Mitigation:* Display last-scraped timestamp, set user expectations ("Prices as of 2 hours ago; confirm in-store"), receipt reconciliation to track variance and adjust

- **Loyalty Pricing Opacity (Medium Impact, High Likelihood):**
  - *Description:* Some retailers (Woolworths, Makro) don't clearly expose loyalty pricing on web; scraping may miss personalized discounts
  - *Impact:* Underestimated savings → users perceive TillLess as less valuable
  - *Mitigation:* User education ("Enable WRewards in-app for personalized pricing"), manual loyalty price entry (user inputs known card discounts), retailer API partnerships (official pricing feeds)

### Open Questions

- **Minimum Acceptable Data Freshness:** Is 2-4 hour cadence sufficient, or do users need 1-hour (or real-time) updates? (Impacts infrastructure cost and scraping complexity)
- **Multi-Store Acceptance:** What savings threshold justifies visiting 2 stores vs. 1? (R150? R300? Varies by user — need user testing)
- **Delivery vs. Pickup Preference:** Should MVP include delivery fee modeling (Sixty60 R30 delivery vs. R50 fuel for pickup)? Or defer to Phase 2?
- **Loyalty Card Verification:** How to confirm user owns claimed loyalty cards? (Trust-based vs. require card number entry vs. API verification?)
- **Geographic Pricing Variations:** Do Checkers prices in Sandton differ from Soweto? (Impacts scraper geo-targeting and accuracy)
- **GTIN Coverage in SA:** What % of products have accessible GTINs (barcodes) for exact matching? (Pilot with select categories to assess)
- **Receipt Reconciliation Incentives:** Will users voluntarily upload receipts (40% target)? Or need rewards (R5 Uber voucher per receipt)? (Test in pilot)

### Areas Needing Further Research

- **Retailer API Feasibility:** Confirm whether Shoprite, Pick n Pay, Woolworths offer loyalty pricing APIs (even if paid) — partnership potential
- **OSRM vs. Google Maps Cost-Benefit:** Self-hosted OSRM (free, complex setup) vs. Google Maps API ($200 credit/month, simple integration) — evaluate accuracy and cost
- **OCR Accuracy for SA Receipts:** Test Google Cloud Vision vs. Mindee on SA retailer receipts (font styles, formatting) — which achieves >95% accuracy?
- **Crowdsourcing Cold-Start Mitigation:** If scraping fails, can crowdsourced receipt data (Basket model) fill gaps? (Research Basket's data quality and critical mass requirements)
- **Competitive Response War-Gaming:** How would Shoprite respond to TillLess? (Block scrapers, launch own cross-banner optimizer, acquire TillLess?) — scenario planning
- **User Segmentation Deep-Dive:** Beyond Thandi/Bongani, are there other high-value personas? (e.g., health-conscious professionals, eco-friendly shoppers) — user interviews needed

---

## Appendices

### A. Research Summary

**Market Research Findings (September 2025):**
- **TAM:** R823 million (4.3M tech-comfortable households × R15.93 monthly WTP)
- **SAM:** R206 million (Gauteng metros, 25% of TAM)
- **SOM:** R20.6 million (10% market share target in 3 years)
- **Key Insight:** 8-15% achievable savings on R3,500 basket = R280-525/month value; users willing to pay 2-5% of savings (R5.60-26.25/month)

**Competitive Analysis (October 2025):**
- **Troli:** Main threat (viral growth, 25% savings claim but opaque methodology; unclear loyalty/travel integration)
- **PriceCheck:** Established (2006) but item-level only (no basket optimization)
- **Checkers Sixty60:** Delivery leader (47% growth) but single-retailer, convenience-focused
- **Basket (US):** International reference model (whole-basket optimization, 20% savings, crowdsourced data)
- **Gap:** No SA solution optimizes whole baskets with loyalty + travel + substitution modeling

**Brainstorming Insights (September 2025):**
- **First Principles:** True optimization = minimize (price + travel/time + effort + stockout risk) for complete basket
- **SCAMPER Highlights:** Combine meal planning + shopping optimization; crowdsource via receipts; multi-store routing for max savings
- **Role-Play User Feedback:** Need pantry sync, budget nudges, nutrition balance (Phase 2 features); must handle real-world messiness (stockouts, cravings)

### B. Stakeholder Input

**User Interviews (Informal, Pre-Project):**
- **Thandi (Budget-Conscious Parent):** "I hold Xtra Savings and Smart Shopper but never know which to use where. If TillLess told me 'Use Xtra at Checkers for milk, Smart Shopper at PnP for bread,' I'd save hours and Rands."
- **Bongani (Bulk Buyer):** "Makro is usually cheapest for bulk, but sometimes Shoprite has crazy promos. I need to know before I drive 30km to Makro, only to find out I missed a better deal."

**Technical Advisor Feedback:**
- "Playwright scraping is solid for MVP, but you'll hit rate limits. Plan for IP rotation or proxy services by Month 6. Also, Temporalite is great for local dev, but consider managed Temporal Cloud if scaling beyond 10K scraping jobs/day."

### C. References

**Documentation:**
- Product Requirements Document: `docs/prd.md`
- Technical Architecture: `docs/architecture.md`
- Canonical Product Registry Spec: `docs/canonical-product-registry.md`
- Retailer Scraping Playbook: `docs/retailer-scraping-playbook.md`
- Epic Overview: `docs/stories/0.0-epics-overview.md`
- Competitive Analysis: `docs/competitor-analysis.md`
- Market Research: `docs/market-research.md`
- Brainstorming Results: `docs/brainstorming-session-results.md`

**External Tools/Services:**
- Supabase: https://supabase.com
- Vercel: https://vercel.com
- Temporalite: https://github.com/temporalio/temporalite
- BetterAuth: https://www.better-auth.com
- Playwright: https://playwright.dev
- Prisma: https://www.prisma.io

---

## Next Steps

### Immediate Actions

1. **Set Up Development Environment** (Week 1)
   - Initialize Nx monorepo (`apps/web`, `apps/api`, `apps/admin`, `libs/shared`, `libs/scrapers`, `libs/ocr`, `libs/database`)
   - Configure Supabase project (Postgres DB, authentication schema, storage buckets)
   - Deploy Temporalite locally (Docker Compose for scraping orchestration)

2. **Implement Data Backbone** (Weeks 1-3, Epic 1)
   - Migrate Canonical Product Registry schema to Supabase (Prisma migrations)
   - Build Playwright scrapers for Checkers, Pick n Pay (start with 2 retailers, add Shoprite/Woolworths/Makro incrementally)
   - Set up pg-boss ingestion queue + normalization workers
   - Create ingestion monitoring dashboard (Grafana or simple Next.js admin panel)

3. **Build Optimization Engine** (Weeks 4-6, Epic 2)
   - Implement basket cost calculation (price + loyalty + promotions + travel)
   - Develop substitution logic (brand flexibility, size tolerance)
   - Expose REST/GraphQL API endpoints (NestJS)
   - Write integration tests (mock retailer data, validate cost calculations)

4. **Develop Frontend UI** (Weeks 4-6, Epic 3)
   - Shopping list input form (Next.js, React Hook Form, CSV import)
   - User preferences page (loyalty cards, home location, effort tolerance)
   - Optimization results dashboard (item comparison table, recommendations, trade-offs)
   - Export functionality (PDF generation, email summary)

5. **Launch Closed Beta Pilot** (Week 9)
   - Recruit 20 Gauteng households (friends, family, Reddit r/PersonalFinanceZA)
   - Onboard users, gather feedback (usability, accuracy, savings validation)
   - Iterate based on pilot findings (Weeks 10-11)

6. **Public MVP Launch** (Month 4)
   - Marketing push (TikTok, Instagram, Reddit, Facebook groups)
   - Content marketing (blog posts: "How to maximize Xtra Savings," "True cost of grocery shopping")
   - Track KPIs (500 users, 8% savings, 95% accuracy, NPS ≥40)

### PM Handoff

This Project Brief provides the full context for **TillLess**. The next phase is to create a detailed Product Requirements Document (PRD) that translates this vision into executable specifications.

**Recommended Next Steps:**
1. Review this brief thoroughly; ask clarifying questions or suggest improvements
2. Start PRD generation: expand on functional requirements, user flows, edge cases, acceptance criteria
3. Collaborate on architectural decisions (confirm tech stack, finalize API contracts, data schema)
4. Define Epic breakdowns and story point estimates for 9-week sprint plan

**Key Questions for PRD Development:**
- Detailed user flows for each persona (Thandi, Bongani) — step-by-step journey maps
- Edge case handling (What if all 5 retailers are out of stock for a must-have item? How to handle?)
- API contracts (REST vs. GraphQL for optimization endpoint? Request/response schema?)
- Acceptance criteria for each Epic (How do we validate Epic 2 Optimization Engine is "done"?)

Let's collaborate to turn this brief into a bulletproof PRD and ship the MVP in 9 weeks! 🚀

---

*Project Brief created using BMAD™ Framework | Version 1.0 | October 2025*
