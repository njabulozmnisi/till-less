# Project TillLess - Brainstorming Session Results

**Session Topic:** Personal shopping optimization system for South African supermarkets
**Initial Session:** 2025-09-24
**Enhancement Session:** 2025-10-22 (Category Grouping)
**Participant:** Njabulo Mnisi
**Facilitator:** Mary (Business Analyst)

## Session Context

**Project:** TillLess - Personal tool to optimize monthly shopping in South Africa
**Core Goals:**
- Find most affordable price for each item
- Identify single store with cheapest full basket
- Consider promotions, loyalty pricing, pack sizes
- Handle out-of-stock gracefully with substitutions

**Technical Context:**
- Stack: TypeScript (Next.js, Node.js) or Python (Django)
- Budget: Limited/no paid APIs for MVP
- Target Stores: Checkers, Shoprite, Pick n Pay, Woolworths, Makro
- Geographic Scope: Johannesburg, Pretoria, Gauteng, South Africa
- Purpose: Personal use first, not SaaS

---

## Brainstorming Session

### Technique 1: First Principles Thinking

**Core Problem Definition:**
Turn a fixed list of needed goods into a complete basket at the lowest all-in cost (money + time/effort) with minimal uncertainty and no unpleasant surprises.

**Fundamental Components Identified:**

**Need:** Specific items/quantities that must be acquired this month

**Objective:** Minimize total cost = prices paid + travel/delivery/time effort + risk of not finding items

**Constraints:**
- Must complete the list (no missing items)
- Respect quality/brand/size tolerances (substitution boundaries)
- Stay within budget and reasonable effort (number of stops)

**Sources of Friction:**
- Price dispersion: same item varies across stores and over time
- Opaque promotions & pack sizes: "3 for RX", loyalty prices, size tricks
- Limited information at decision time: stockouts, branch-level price differences
- Hidden costs: fuel/time or delivery fees can erase savings
- Cognitive load: manually comparing all this is exhausting

**Success Condition:**
Given list and tolerances, the plan reliably yields complete basket with lowest verifiable all-in cost, with transparent trade-offs explanation

**Essential Data Elements Identified:**

**🛒 Item Data (Demand Side):**
- Identity: product name → canonical product mapping
- Quantity & size: units needed, acceptable pack sizes
- Substitution tolerance: brand flexibility, size tolerance
- Priority: must-have vs. nice-to-have
- Constraints: dietary requirements, quality thresholds

**🏬 Store Data (Supply Side):**
- Catalog: items stocked with product metadata
- Price info: base price, unit size, per-unit cost
- Promotions: bundle offers, loyalty pricing, expiry dates
- Availability/stock: reliable availability status
- Additional costs: delivery fees, pickup costs, loyalty value
- Location context: distance, delivery coverage

**👤 User Preference Data:**
- Loyalty programs: store cards held (Xtra, Smart Shopper, W Rewards)
- Effort tolerance: max store trips, travel willingness for savings
- Substitution policy: generic brands, larger packs acceptance
- Value of time: R/hour equivalent for travel time
- Budget limits: hard caps vs. soft preferences

**⏱️ Shopping Context Data:**
- Timing: date (promotions), time of day (store hours)
- Location: starting point, store distances, delivery coverage
- Frequency: monthly vs. weekly impact on pack sizes
- Market signals: seasonality effects

---

### Technique 2: Mind Mapping - Visual System Organization

**Central Hub: Project TillLess (Shopping Optimizer)**

**Major System Components Identified:**

**1. User Input & Preferences**
- Enter shopping list (manual, import, voice)
- Set substitution rules (brands, sizes)
- Define effort tolerance (stores, distance)
- Configure loyalty cards & budget

**2. Data Collection & Integration**
- Store catalogs (products, pack sizes)
- Price feeds & promotions (scraping/APIs/flyers)
- Stock availability (when possible)
- Store metadata (location, delivery fees, opening hours)

**3. Optimization Engine**
- Price matching (normalize products across stores)
- Basket cost calculation (single store)
- Item-by-item cheapest match (multi-store option)
- Apply promotions, loyalty, substitutions
- Compute total cost = price + travel/delivery + effort

**4. Output & Visualization**
- Cheapest store (complete basket)
- Itemized breakdown per store
- Savings vs. alternatives
- Missing items & suggested substitutions
- Clear, transparent explanations ("why this store wins")

**5. Learning & Tracking (Future)**
- Historical spend tracking
- Price trend analysis
- Personalized recommendations ("buy in bulk", "wait for promo")
- Insights into monthly habits

**Critical Data Flows & Dependencies:**

**Sequential Flow:**
User Input → Product Resolution → Data Collection → Optimization Engine → Output → Learning

**Key Dependencies:**

**A) Optimization Engine ⇐ Data Collection**
- Canonical product mapping (item ↔ product_id across stores)
- Offer sets per store (price, size, unit conversions, promo rules, stock status)
- Store metadata (location, hours, delivery zones for cost calculations)

**B) Optimization Engine ⇐ User Input**
- List specification (items, quantities, priorities)
- Constraints (brand locks, size tolerance, substitution rules)
- Cost model parameters (time value R/hour, max stores/distance, budget cap)
- Loyalty program status (cards owned/enabled)

**C) Output ⇐ Optimization Engine**
- Deterministic breakdown (line items, applied promos, substitutions, totals)
- Rationales (why winner beats alternatives: savings, fewer gaps, proximity)
- Contingency plans (plan B for stockouts/expired promos)

**D) Learning ⇐ Output + User Input + Data Collection**
- User feedback (accept/reject substitutions, flag mismatches, adjust tolerances)
- Reality checks (receipt reconciliation vs. predictions)
- Historical patterns (trends, recurring items, seasonality)

**E) Data Collection ⇐ Learning**
- Quality improvements (better matching models, retailer-specific parsers)
- Prioritization (crawl frequency based on purchase patterns and volatility)

**Critical Feedback Loops:**
- Correction loop: User corrections → improved product mapping
- Reality check: Receipt variance → adjusted reliability scores
- Preference evolution: Usage patterns → auto-tuned tolerances
- Refresh optimization: Price volatility → dynamic crawl frequency

---

### Technique 3: SCAMPER Method - Systematic Solution Generation

**S - SUBSTITUTE:**

**🔎 Data Sources Alternatives:**
- Public APIs (Checkers Sixty60, Woolworths online behind their apps)
- Crowdsourced receipt uploads with OCR price capture
- Retailer-published CSV catalogs for specials
- 3rd-party aggregators (PriceCheck SA, Google Shopping) as fallbacks

**⚙️ Optimization Approaches:**
- Heuristics/greedy algorithms (incremental best choices vs. exhaustive)
- Constraint solvers (linear programming for complex promos + substitutions)
- Approximation algorithms (sacrifice accuracy for speed with large baskets)
- Machine learning ranking (learn "cheapest store probability" from history)

**🖥️ User Interaction Methods:**
- OCR scanning of past receipts → auto-generate baseline lists
- Voice input ("Add 2L Coke, 5kg maize meal")
- Recurring lists from history ("repeat last month's basket?")
- Integration with existing apps (Google Keep, iOS Reminders, Todoist)

**🛠️ Technology Stack:**
- Low-code/no-code platforms (Retool, n8n, Airtable) for MVP
- Performance languages (Rust/Go) for optimization engine
- Serverless architecture (AWS Lambda, Supabase Edge) vs. full backend
- Mobile-first approach (React Native/Flutter) for pocket usage

**Key Substitution Insights:**
- Crowdsourcing could reduce scraping maintenance burden
- Greedy algorithms could simplify early optimization versions
- Receipt scanning could eliminate manual list entry friction
- No-code platforms could accelerate MVP development

**C - COMBINE:**

**🗂️ Combine Data Sources:**
- Retailer catalogs + crowdsourced receipts → scrape when possible, patch gaps with uploads
- Weekly leaflets + in-store APIs → combine promo flyers with live prices
- Online + physical store prices → track both (often differ significantly)
- PriceCheck/aggregator feeds + own scrapers → redundancy & error checking

**⚖️ Combine Optimization Objectives:**
- Price + Time + Effort → balance savings vs. extra store trips
- Price + Quality → factor in brand preferences for certain staples
- Price + Loyalty points value → account for rewards accumulation
- Basket completion rate + cost → sometimes "everything in stock" beats cheaper but incomplete

**📲 Combine User Touchpoints:**
- Shopping list + receipt import → system learns AND verifies predictions
- Mobile app + WhatsApp bot → capture input however convenient
- Monthly planner + real-time alerts → pre-plan but adapt to price shifts
- Family lists + shared account → merge household needs into one basket

**🛠️ Combine Technologies:**
- OCR + embeddings → receipts become structured, cross-retailer mapped data
- Playwright scraping + Supabase functions → async workers feed lightweight backend
- No-code dashboards + custom backend → fast UI while refining optimization core
- Geo APIs + pricing engine → automatically factor travel costs per store

**🥘 Combine Shopping + Meal Planning:**
- Recipe-driven baskets → start with meals, generate ingredient requirements
- Daily → Weekly → Monthly planning → roll up optimized across timeframes
- Price-aware recipe suggestions → "chicken cheaper than beef this month"
- Pantry intelligence → track what you have, prevent duplicate purchases
- Consumption rate estimation → predict when staples need replenishing

**📖 Combine Recipes + Purchase History:**
- Personal recipe library within TillLess
- History-driven monthly prompts → "repeat last month? try 2 new recipes?"
- Ingredient mapping → learn staples vs. special buys
- Smart substitutions → swap expensive ingredients when budget tight

**✨ Combined Value Propositions:**
- Cheapest AND Most Convenient Store
- Personalized Smart Suggestions → "add one more Coke for 3-for-2"
- Crowdsourced Market Intelligence → receipt uploads improve accuracy for all
- Budget Guardian + Monthly Food Concierge → decide what to eat, buy, where to get it

**Key Insight:** TillLess transforms from "price calculator" to "household food & spend assistant" - combining shopping optimization + meal planning + purchase history into automated monthly guidance.

---

### Technique 4: Role Playing - Multiple Stakeholder Perspectives

**PRIMARY USER (6 months experience):**

**💚 What I'd Love Most:**
- Zero guesswork confidence → "Am I overpaying?" answered with receipt-level clarity
- Cheapest full basket at a glance → one button, one answer
- Meal-driven lists → pick meals, system generates optimized grocery list
- Deep personalization → remembers brown bread weekly, chicken bulk bi-monthly
- Savings tracker → month-to-month Rand savings progress visibility

**😅 Still Frustrating:**
- Data freshness gaps → yesterday's scraped prices may be outdated at store
- Stock unpredictability → "in stock" online but out at branch breaks the plan
- Meal fatigue → over-suggesting same optimized recipes gets boring
- Effort trade-offs → sometimes want convenience over savings, system should know my mood

**🤔 Unexpected Needs Emerged:**
- Pantry sync → know what's home already, avoid duplicate suggestions
- Batch cooking adaptation → accommodate bulk-cook weekends vs daily cooking
- Budget nudges → "R200 over budget, here are 3 swaps to fix it"
- Nutrition balance → "is this meal plan healthy?" not just affordable

**🛒 Changed Shopping Habits:**
- Less impulse buying → stick to optimized basket more strictly
- More bulk purchasing → system spots deals, I stockpile staples
- Consistent meal planning → smoother family meals, fewer "what's for dinner?" moments
- Store loyalty shift → if Checkers wins 4/6 months, becomes my default
- Data-driven mindset → trust system over memory, shopping feels systematic not stressful

**Overall Experience:** TillLess became quiet household CFO + meal assistant. Love the confidence and reduced stress, but crave better handling of real-world messiness (stockouts, cravings, variety). More human flexibility = higher retention.

---

## Enhancement Session: Category Grouping & Budget Intelligence (2025-10-22)

### Session Context

**Enhancement Goal:** Transform shopping list experience from item-by-item optimization to category-based budget intelligence

**Problem Statement:** Users struggle with "Where is my money actually going?" - 40 individual item decisions create cognitive overload. Need category-level visibility and surgical optimization capabilities.

**DDD Integration:** Incorporate category grouping within existing architecture using Domain-Driven Design principles

---

### Technique 5: Category-Focused First Principles Analysis

**Core Insight: Categories = Budget Lens**

Users don't think in 37 micro-decisions — they think in 5–7 budget buckets.

**12 Fundamental Value Drivers Identified:**

1. **Spend Visibility** - "Where is my money actually going?" Users can't see which categories (meat, produce, cleaning) drive spend
2. **Budget Control** - Need clear budget lenses (e.g., "meat is 42% of basket") with category-level caps and alerts
3. **Surgical Optimization** - If one category is disproportionately pricey at a retailer, split just that category to another store while keeping everything else single-store
4. **Promo Exploitation** - Deals are often category-specific (3-for-2 on detergents, chicken promo). Category view exposes bundle math and stock-up opportunities
5. **Smart Substitutions** - Users think in categories ("any white fish", "any green veg"). Category view enables tolerances and brand flexibility per category instead of per item
6. **Quality Trade-offs** - Fresh produce/meat quality varies by store. Category grouping lets users apply quality weights (e.g., "Woolies produce premium, accept higher unit price")
7. **Cognitive Load Reduction** - Comparing 40 individual prices is exhausting. Category roll-ups shrink the problem to 5–8 intuitive decisions
8. **Physical Shopping Flow** - In-store navigation is category-based; grouping mirrors how people shop. Faster pick paths; clearer pickup vs delivery decisions per category
9. **Budgeting & Envelopes** - Many families budget by category. Enables caps and alerts ("cleaning over R250 → suggest swaps")
10. **Price Volatility Tracking** - Some categories swing more (meat, dairy). Category histories highlight where effort pays off
11. **Stock Risk Management** - If a store is often out of stock in one category (e.g., produce), user can re-route just that category
12. **Household Collaboration** - Easy to delegate categories ("I'll grab meat, you grab pantry") with clear cost accountability per person

**Key Pattern:** All 12 drivers point to the same conclusion: **categories are how humans actually budget and shop**, not item-by-item.

**Category Portfolio Concept:**

Over 3+ months, patterns emerge:
- "Produce, Meat, Dairy from Woolies"
- "Cleaning, Frozen, Pantry from Checkers"

This creates **emotional progression:**
- "Comparing groceries" → "Optimizing for me" → "TillLess knows my buying personality"

**The 2.5-Level Hierarchy Model:**

- **Level 1 (Required)** - 5–8 core buckets: Fresh Produce, Meat, Fish, Dairy & Eggs, Bakery, Pantry/Dry, Frozen, Household/Cleaning, Toiletries
- **Level 2 (Optional)** - Sub-buckets: Meat → Premium cuts, Mince & Value, Chicken, Braai/Processed
- **Level 2.5 (Lightweight tags)** - Strategy tags: bulk-friendly, brand-locked, nutrition-critical, kid-approved

**Guardrails Against Taxonomy Creep:**
- Cap visible sub-buckets at 3 per category
- "Reset to default taxonomy" button
- Impact summaries: "Sub-category rules saved you R184 this month"

---

### Technique 6: Category Enhancement SCAMPER

Building on the original SCAMPER analysis, this session applied all 7 SCAMPER elements specifically to category grouping:

#### **A - ADAPT (from other domains):**

**Stock Portfolio Rebalancing → Category Spend Rebalancing**
- "Your target for Meat is 22% of spend, but you're at 29% this quarter. Two swaps could rebalance and save ~R110/mo."
- High intelligence, low UX complexity

**Fitness Habit Streaks → Optimization Streaks**
- "🏆 7-week Fresh Produce streak! You've saved R482 over this period."
- Creates emotional streak protection, builds habits without childish gamification

**Netflix Recommendation Engine → Category Strategy Recommendations**
- "Families like yours save most by: Woolies Produce + Checkers Pantry. Try it this month?"
- Social proof + discovery of better strategies

**Zero-Based Budgeting → Zero-Based Category Planning**
- "Your Pantry spend crept up 11%. Reduce by R80 with these swaps or bulk moves?"
- Monthly reset ritual, prevents budget bloat

**Supply Chain Lead Time → Stock-Cycle Suggestions**
- "Buy laundry detergent every 7 weeks — promo cycle aligned. Skip this month."
- Reduces waste, aligns purchases with promo patterns

**Envelope Budgeting → Category Envelopes**
- Digital category envelopes with rollover rules
- "Category: Snacks — R120 left. Proceed with Woolies or switch to cheaper PnP to stay within envelope?"

**Waze/Uber Routing → Store Routing for Categories**
- "On your commute, stop at Checkers for Meat + Pantry — adds +3 minutes, saves R46."
- Turns TillLess into a life optimizer, not just an app

#### **M - MODIFY/MAGNIFY/MINIFY (enhance or simplify):**

**MAGNIFY: Category-First Shopping List View**
- Primary view = category totals with store winners:
  ```
  🥩 Meat — R412 (Woolies best, Checkers -R28 alt)
  🥬 Produce — R186 (Shoprite best, PnP -R7 alt)
  🥫 Pantry — R344 (Checkers best)
  ```
- Tap → drill down into items only when needed
- **The "iPhone Moment"** - Interface inversion that could define TillLess' identity

**MINIFY: One Micro-Decision Daily**
- "🚨 Category Move of the Day: Switch DAIRY to Checkers — save R12 with zero extra travel. Apply?"
- Builds retention through micro-habits like Apple Fitness rings

**MODIFY: Optimization Personas**
- **Thrifty**: Price-first, substitutions allowed, multi-store optimization
- **Balanced**: Price + quality weighted, moderate splits, 1-2 stores preferred
- **Premium Fresh**: Quality-first for fresh categories, accept higher prices
- **Time Saver**: Single-store preference, minimal decisions

**MAGNIFY: Visual Win Feedback**
- "🔥 Pantry category saved you R96 this month"
- Trend graphs per category
- Green/yellow/red budget states

**ALTER: Quarterly/Yearly Time Scale**
- "YTD Pantry Spend: R7,812 (down 9% vs last year)"
- "Annual Meat Trend: +13% — want new strategy recs?"
- Users remember "We saved R2,600 this year" not individual R12 discounts

#### **P - PUT TO OTHER USES (category data platform):**

**Meta Insight:** The category system is not just a UI layer — it is a **data spine** that can unlock:

**B2C Use Cases:**
- **Financial Export/Budget Sync** - Auto-sync to YNAB/22Seven, envelope budgets from actual patterns
- **Nutrition & Wellness** - Protein tracking by category, nutrition goals tied to meal plans
- **Sustainability Scoring** - Lower-carbon swaps, less plastic categories, ESG ratings per category
- **Pantry Auto-Replenishment** - Auto-generate refill basket every 30/45 days, one-tap approval

**B2B Use Cases:**
- **Retailer Category Insights** - "Woolies losing produce share to Checkers in Johannesburg East"
- **Brand Category Analytics** - "PnP deodorant sales spike when promos align with detergent cycles"
- **Predictive Stockout Alerts** - "Produce volatility up 18% — expect price spike or stockouts"

**AI/Platform Expansion:**
- **Smart Home Integration** - Smart fridge suggestions, Alexa routines for category top-ups
- **Personalized Ad Marketplace** - Brands pay for opt-in category offers, user gets cashback
- **Insurance/Credit Scoring** - "Household financial stability index" from category discipline

**Platform Thinking:** Once categories become structured and behavioral, TillLess can expand horizontally without product bloat.

#### **E - ELIMINATE (remove friction):**

**Principle: "Less effort, less noise, more magic"**

1. **Eliminate Item-First Thinking** - Category totals primary, items on-demand (10× faster decisions)
2. **Eliminate Manual Store Selection** - Auto-route via portfolio, users only intervene for threshold nudges
3. **Eliminate Manual Shopping List Building** - Meal plan + pantry → 90% auto-generated shopping list for recurring staples
4. **Eliminate Constant Notifications** - Only threshold nudges: "Switch DAIRY for R42, +0 min. Apply?"
5. **Eliminate Configuration Hell** - 3-4 personas replace 20 settings sliders
6. **Eliminate "Full Basket or Nothing"** - Hybrid category routing by default
7. **Eliminate Over-Explaining** - 7-second summaries with optional drill-downs

**Result:** The holy trifecta — Less effort, less noise, more magic.

#### **R - REVERSE/REARRANGE (flip assumptions):**

**Budget → Shopping List Reversal**
- Today: Build shopping list → discover total (usually too late)
- Reversed: "My monthly grocery budget is R3,200" → TillLess builds optimized shopping list to fit
- Emotionally aligned with how families actually think: "We have R X to spend this month"

**Savings Outcome First**
- Before: User sees prices → makes decisions → finds out savings
- After: "You saved R218 this week, with 2 stores and 1 optional swap. Ready to approve?"
- Then (optional) → drill into category views → drill into item details
- Applies Apple Weather principle → show the conclusion, not the data dump first

**Meal Calendar → Shopping List Flow**
- Rearranged: User picks meals → TillLess generates categories → TillLess auto-generates shopping list
- Intent-first journey ("what we'll eat"), groceries become byproduct of planning life

**Hide All Prices (Decision-Only Mode)**
- Extreme: TillLess never shows prices unless asked
- "Switch Meat to Checkers this week? (Balanced taste, R savings, +0 min)"
- Purely "Assistant Mode," not "Dashboard Mode" — concierge, not spreadsheet

**Optimize Next Month Today**
- "Based on patterns, next month's best strategy is already prepared"
- "Next month's plan ready: Woolies Produce + Checkers Pantry + 1 bulk detergent buy. Est. monthly savings: R302."
- Moves user from reactive → proactive

**Insight:** These reversals produce "a calmer, more intentional, more human grocery experience, instead of another 'price comparison chore.'"

---

### Technique 7: Category Combination Patterns

**High-Value Combinations Identified:**

**1. Category Budgets × Household Member Assignments**
- "Dad owns meat budget, Mom owns produce budget"
- Weekly scoreboard: "Dad saved R48 by choosing Checkers Meat. Mom went over Produce by R29 at Woolies."
- Reduces conflict, increases accountability & engagement

**2. Shopping List Categories × Meal Planning Calendar**
- **Full Loop:** Recipes → Calendar → Categories → Shopping List
- Flow: Choose meals for the week → TillLess auto-generates categories → Prices by retailer → Optimized shopping list
- Closes the plan → shop → cook loop

**3. Retailer Prices × Community Quality Ratings**
- Rank categories by price AND quality sentiment
- Example: "Shoprite cheapest for produce, but Woolies 4.7★ vs Shoprite 2.8★ freshness"
- Creates trust through community validation

**4. Category Portfolios × Threshold Nudges**
- Portfolios = stability, Nudges = responsiveness
- "Your default is Woolies Produce — but Shoprite is R38 cheaper this week only. Switch or keep default?"
- Perfect balance for habit + optimization

**5. Unit Economics × Bulk Strategy Tags**
- If category tagged bulk-friendly, evaluate long-horizon unit economics
- "Pantry item with 6-week shelf life → compare R/kg over 6 weeks, not 1 basket"
- Turns TillLess into long-term optimizer, not basket optimizer

**6. Categories × Pantry Inventory**
- Tie category grouping with pantry state (from receipts, OCR, or manual toggles)
- "You have dairy for 5 more days but produce only for 2 — want a 2-category top-up trip instead of full shop?"
- Enables "micro-shops" based on real consumption

**7. Category History × Seasonality Insights**
- Combine historical spend with seasonal patterns per category
- "Meat spikes in December, vegetables price dip in spring, detergent promos every ~7 weeks"
- Auto-suggest when to buy, not just where to buy

**8. Category Optimization × Travel Route**
- "Your commute passes Checkers and Woolies — optimize Meat + Produce at no extra travel time"
- Uses real-world behavior to refine category strategy

---

### Data Model Extensions for Categories

**New Tables:**

```sql
categories (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  parent_id UUID REFERENCES categories(id), -- for hierarchy
  icon VARCHAR,
  display_order INT,
  is_system_default BOOLEAN DEFAULT true
)

category_preferences (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  category_id UUID REFERENCES categories(id),
  quality_weight DECIMAL(3,2) DEFAULT 1.0, -- 0.8-1.2 multiplier
  unit_price_ceiling DECIMAL(10,2), -- max R/kg, R/L, etc.
  store_bias JSONB, -- {"woolworths": 1.1, "checkers": 0.9}
  substitution_tolerance VARCHAR CHECK (substitution_tolerance IN ('low', 'medium', 'high')),
  budget_cap DECIMAL(10,2),
  bulk_preference BOOLEAN DEFAULT false
)

item_category_mappings (
  item_id UUID REFERENCES items(id),
  category_id UUID REFERENCES categories(id),
  confidence_score DECIMAL(3,2), -- ML-assigned confidence
  is_user_override BOOLEAN DEFAULT false
)

item_tags (
  item_id UUID REFERENCES items(id),
  tag VARCHAR, -- 'bulk-friendly', 'brand-locked', 'nutrition-critical'
  created_at TIMESTAMP DEFAULT NOW()
)

category_portfolios (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  category_id UUID REFERENCES categories(id),
  preferred_retailer_id UUID REFERENCES retailers(id),
  win_rate DECIMAL(5,2), -- % of time this retailer wins
  avg_savings DECIMAL(10,2),
  volatility_score DECIMAL(3,2), -- how often it flips
  detected_at TIMESTAMP,
  user_adopted BOOLEAN DEFAULT false
)
```

**Algorithmic Notes:**

**Portfolio Detection:**
```
For a category C:
  win_rate(store_x, category_C) ≥ 70% across rolling 3 months
  AND average_savings ≥ threshold (e.g., R30)
  AND volatility ≤ tolerance (e.g., 0.3)
→ Trigger portfolio suggestion
```

**Per-Sub-Category Optimization:**
1. Pre-grouping: Map items → (category, sub-category)
2. Per-sub-category optimization: Apply unique weights/constraints to compute per-retailer totals
3. Surgical split suggestion: If single sub-category drives most price deltas at another retailer (and store-count limit allows), propose category-level split only
4. Global basket assembly: Merge chosen retailers across sub-categories, enforce max-store constraint, re-opt if constraint hit

---

## Executive Summary

**Session Goals:**
- Initial: Broad exploration of Project TillLess architecture, data sources, workflows, algorithms
- Enhancement: Category-based budget intelligence and surgical optimization capabilities

**Techniques Used:**
- First Principles Thinking
- Mind Mapping
- SCAMPER Method (full: Substitute, Combine, Adapt, Modify, Put to Other Uses, Eliminate, Reverse)
- Role Playing
- Category-Focused Analysis
- Combination Patterns

**Total Ideas Generated:** 120+ across technical architecture, data sources, optimization approaches, user experience, and category intelligence

**Key Themes Identified:**
- Transform from "price calculator" to "household food & spend assistant"
- Combine shopping optimization with meal planning and purchase history
- **Category grouping as budget lens** - reduces 40 decisions to 5-8 category decisions
- **Surgical optimization** - enables hybrid baskets (mostly one store, selectively split categories)
- **Category portfolios** create habit formation and emotional progression
- **Category system as data spine** - unlocks B2C, B2B, and AI capabilities horizontally
- Balance price savings with convenience and effort minimization
- Handle real-world messiness through graceful degradation and user feedback loops
- Leverage South African market specifics (loyalty programs, retailer APIs, local context)

---

## Idea Categorization (Consolidated & Enhanced)

### Immediate Opportunities
*Ideas ready to implement now*

**Foundational Features:**

1. **Manual Shopping List + Basic Price Scraping MVP**
   - Description: Simple web scraper for major SA retailers with manual list input
   - Why immediate: Validates core value prop with minimal complexity
   - Resources needed: TypeScript/Python, basic web scraping, simple UI

2. **Receipt OCR for Product Mapping**
   - Description: Use OCR to extract purchases and build product database
   - Why immediate: Solves product normalization problem with real data
   - Resources needed: OCR library, image processing, data storage

3. **Single-Store Basket Optimization**
   - Description: Focus on "cheapest complete basket at one store" first
   - Why immediate: Simpler algorithm, immediate user value, fewer dependencies
   - Resources needed: Basic optimization logic, price comparison engine

**Category Enhancement Features (New):**

4. **2.5-Level Category Hierarchy**
   - Description: Level 1 (5-8 core), Level 2 (sub-buckets), Level 2.5 (strategy tags)
   - Why immediate: Foundation for all category features
   - Resources needed: Database schema, category service, seed data

5. **Category-First Shopping List View ("The iPhone Moment")**
   - Description: "🥩 Meat — R412 (Woolies best, Checkers -R28 alt)" as main surface
   - Why immediate: Signature UX differentiator, defines TillLess identity
   - Resources needed: UI/UX design, frontend implementation

6. **Optimization Personas**
   - Description: Thrifty | Balanced | Premium Fresh | Time Saver
   - Why immediate: Personalization without configuration hell, onboarding simplicity
   - Resources needed: Persona logic service, onboarding flow

7. **Quality-Weighted Category Scores**
   - Description: Store-category quality factors (0.8–1.2)
   - Why immediate: Low complexity, high value for fresh categories
   - Resources needed: Quality score data model, simple multiplier logic

8. **Strategy Tags**
   - Description: bulk-friendly, brand-locked, nutrition-critical
   - Why immediate: Enables smart behavior without complexity
   - Resources needed: Tag system in data model

9. **Threshold Nudges**
   - Description: Only surface if savings > R30 and travel ≤ 10 min
   - Why immediate: Retention engine with minimal noise
   - Resources needed: Nudge logic, notification UI

10. **Cost per Meal/Serving Display**
    - Description: "Schnitzel costs R24/serving at Checkers vs R27 at Woolies"
    - Why immediate: More intuitive than raw prices for meal planning
    - Resources needed: Recipe/meal linkage, serving cost calculator

### Future Innovations
*Ideas requiring development/research*

**Original Innovations:**

1. **Crowdsourced Price Intelligence Platform**
   - Description: Users upload receipts to build community price database
   - Development needed: User incentivization, data validation, privacy controls
   - Timeline estimate: 6-12 months after MVP

2. **Meal Planning Integration with Recipe Engine**
   - Description: Generate shopping lists from weekly meal plans and recipes
   - Development needed: Recipe database, nutritional analysis, meal planning UX
   - Timeline estimate: 12-18 months

3. **Predictive Pantry Management**
   - Description: Track consumption rates and predict restocking needs
   - Development needed: IoT integration, consumption modeling, inventory tracking
   - Timeline estimate: 18-24 months

**Category Enhancement Innovations:**

4. **Category Portfolio Discovery & Auto-Adoption**
   - Description: Auto-suggest after 3-month pattern with one-tap adoption
   - Development needed: Pattern detection algorithm (70% win rate threshold), portfolio state management
   - Timeline estimate: 2-3 months

5. **Auto-Suggested Category Splits**
   - Description: "Create 'Premium cuts' and 'Mince & value' rules?" when system detects price/quality divergence
   - Development needed: Divergence detection ML, split recommendation engine
   - Timeline estimate: 3-4 months

6. **Category Budgets × Household Member Assignments**
   - Description: "Dad owns meat budget" with weekly scoreboard
   - Development needed: Multi-user system, household roles, scoreboard analytics
   - Timeline estimate: 2-3 months

7. **Shopping List Categories × Meal Planning Calendar**
   - Description: Recipes → Calendar → Categories → Shopping List → Basket (fully linked)
   - Development needed: Recipe database, calendar UI, ingredient extraction, category mapping
   - Timeline estimate: 4-6 months

8. **Retailer Prices × Community Quality Ratings**
   - Description: "Shoprite cheapest but 1.9★ lower freshness than Woolies"
   - Development needed: Rating collection system, moderation, aggregation algorithm
   - Timeline estimate: 3-5 months

9. **Category Portfolios × Threshold Nudges**
   - Description: Stable defaults with contextual exceptions
   - Development needed: Exception detection, contextual nudge generation
   - Timeline estimate: 2 months (builds on portfolio foundation)

10. **Unit Economics × Bulk Strategy Tags**
    - Description: Long-horizon R/kg for bulk-friendly categories with 6-week shelf life
    - Development needed: Shelf life database, long-horizon optimization algorithm
    - Timeline estimate: 2-3 months

11. **Categories × Pantry Inventory**
    - Description: "Dairy for 5 days, produce for 2 — want top-up trip?"
    - Development needed: Receipt OCR, inventory tracking, consumption prediction
    - Timeline estimate: 4-6 months

12. **Category History × Seasonality Insights**
    - Description: "Meat spikes December, detergent promos every 7 weeks"
    - Development needed: Time-series analysis, seasonality detection, promo cycle tracking
    - Timeline estimate: 3-4 months

13. **Category Optimization × Travel Route**
    - Description: "Commute passes Checkers + Woolies — optimize at no extra travel"
    - Development needed: Maps integration, route calculation, location permissions
    - Timeline estimate: 2-3 months

14. **Category Spend Rebalancing**
    - Description: "Target: Meat 22%, actual 29%. Rebalance + save R110/mo"
    - Development needed: Target allocation system, rebalancing recommendations
    - Timeline estimate: 2 months

15. **Zero-Based Category Planning**
    - Description: "Pantry up 11%. Reduce R80 with these swaps?"
    - Development needed: Spend drift detection, swap recommendation engine
    - Timeline estimate: 2 months

16. **Optimization Streaks & Visual Feedback**
    - Description: "🏆 7-week Fresh Produce streak! Saved R482"
    - Development needed: Streak tracking, visual feedback, green/yellow/red states
    - Timeline estimate: 1-2 months

17. **Quarterly/Yearly Portfolio Reports**
    - Description: "YTD Pantry: R7,812 (down 9% vs last year)"
    - Development needed: Historical analytics, YoY comparison, trend visualization
    - Timeline estimate: 1-2 months

### Moonshots
*Ambitious, transformative concepts*

**Original Moonshots:**

1. **Household Food & Budget Concierge**
   - Description: AI-powered monthly food planning that optimizes nutrition, budget, and preferences
   - Transformative potential: Eliminates food planning cognitive load entirely
   - Challenges to overcome: Complex ML, nutritional expertise, behavior change adoption

2. **Real-time Market Intelligence Network**
   - Description: Live price monitoring across all SA retailers with instant notifications
   - Transformative potential: Never miss a deal, perfect market timing
   - Challenges to overcome: Massive data infrastructure, retailer relationships, cost scalability

**Category-Enabled Moonshots:**

3. **Retailer Competition Marketplace**
   - Description: Retailers "bid" for your category business via TillLess marketplace
   - Transformative potential: Complete power shift from retailers to consumers, creates B2B revenue stream
   - Challenges to overcome: Retailer partnerships, API integrations, legal/competitive dynamics, pricing models

4. **Financial Export/Budget Sync Ecosystem**
   - Description: Auto-sync to YNAB/22Seven, envelope budgets from actual category patterns
   - Transformative potential: Cross-domain value (grocery + finance), stickiness through integration
   - Challenges to overcome: Third-party API partnerships, data security, category mapping across systems

5. **Predictive Price/Stock Intelligence Engine**
   - Description: "Produce volatility up 18% — expect spike" using time-series ML
   - Transformative potential: Evolve from reactive → predictive → advisory
   - Challenges to overcome: Time-series ML models, data quality/volume, accuracy thresholds

6. **Retailer Category Insights B2B Platform**
   - Description: Sell anonymized category analytics to retailers/brands
   - Transformative potential: High-margin B2B revenue without consumer UX overhead
   - Challenges to overcome: Anonymization, privacy compliance, data scale, sales channel development

7. **Nutrition & Wellness Integration**
   - Description: Protein tracking by category, nutrition goals tied to meal plans
   - Transformative potential: Expand addressable market to health-conscious segment
   - Challenges to overcome: Nutrition database, accuracy verification, wellness expertise

8. **Sustainability & ESG Scoring**
   - Description: Lower-carbon swaps, less plastic categories, ESG ratings per category
   - Transformative potential: Brand differentiation, values-driven loyalty
   - Challenges to overcome: Carbon data sourcing, ESG scoring methodology, greenwashing risks

9. **Pantry Auto-Replenishment System**
   - Description: Auto-generate refill basket every 30/45 days with one-tap approval
   - Transformative potential: Zero cognitive load grocery maintenance, subscription-like recurring revenue
   - Challenges to overcome: Consumption prediction accuracy, user trust in automation

10. **Smart Home & IoT Ecosystem**
    - Description: Smart fridge suggestions, Alexa routines, category data as heart of smart kitchen
    - Transformative potential: Platform play, ecosystem lock-in
    - Challenges to overcome: IoT partnerships, device integration complexity, hardware dependencies

11. **Personal Spending Clusters (AI Categories)**
    - Description: K-means auto-generate "Braai Staples", "Smoothie Stuff" from behavior
    - Transformative potential: Ultra-personalization, zero manual configuration
    - Challenges to overcome: ML model training, cluster stability, interpretability

12. **Event-Based Dynamic Categories**
    - Description: "Braai Season", "Back-to-School" triggered contextually by date + patterns
    - Transformative potential: Proactive life assistance, emotional relevance
    - Challenges to overcome: Event detection accuracy, timing sensitivity, relevance filtering

13. **Budget → Basket Reversal System**
    - Description: "My budget is R3,200" → TillLess builds optimized basket within budget
    - Transformative potential: Emotionally aligned with how families actually think
    - Challenges to overcome: Reverse optimization algorithm, basket generation from budget constraints

14. **Voice → Summary → App Flow**
    - Description: Voice-first journey, app-second ("Plan next week's dinners" → "Done — summary sent")
    - Transformative potential: MCP + AI assistant territory, hands-free grocery planning
    - Challenges to overcome: Voice recognition accuracy, context understanding, natural conversation flow

### Insights & Learnings (Consolidated)

**Core Principles:**

- **Total Cost Optimization**: Price is just one component; time, effort, and convenience are equally important
- **South African Context**: Loyalty programs, specific retailers, and local shopping patterns require tailored solutions
- **Data Quality vs Coverage**: Better to have accurate data for fewer stores than unreliable data for many
- **User Evolution**: Needs change from basic price comparison to sophisticated household management over time
- **Real-world Messiness**: Stock-outs, price changes, and human preferences require graceful degradation strategies

**Category-Specific Learnings:**

- **Category = Budget Lens**: Users think in 5-8 buckets, not 40 items. This reduces cognitive load from overwhelming to intuitive. Categories mirror how households actually budget and plan.

- **Surgical Optimization > All-or-Nothing**: Category splits enable "mostly one store, selectively split" hybrid baskets that balance price, quality, effort. Turns "all or nothing" store choice into surgical optimizations.

- **Quality ≠ Price**: Fresh categories (produce, meat) have explicit quality differences across retailers. Category grouping enables quality weights per retailer (e.g., "Woolies produce premium, accept higher unit price") that item-level optimization can't capture.

- **Portfolios = Habit Formation**: Stable default strategies discovered from 3+ months of behavior create emotional progression: "Comparing groceries" → "Optimizing for me" → "TillLess knows my buying personality." This is habit-forming and sticky.

- **The Category System is a Data Spine**: Once structured, categories unlock B2C (budgeting, nutrition, automation), B2B (retailer analytics, brand marketplace), and AI (forecasting, predictive planning) horizontally without product bloat. It's a platform, not just a feature.

- **Elimination Creates Magic**: "Less effort, less noise, more magic" — removing item-first thinking, manual store selection, and configuration hell elevates the experience from tool to trusted advisor.

- **Reversals Redefine Categories**: Budget → Basket, Savings Outcome First, and Meal Calendar → Basket create a calmer, more intentional grocery experience vs. "price comparison chore." These interface inversions could make competitors look outdated.

- **The "iPhone Moment"**: Category-First Shopping List View could be the interface inversion that defines TillLess' identity. The moment people see this screen, they understand what makes TillLess different.

- **Data-Driven Nudges Build Trust**: Auto-suggested splits and portfolio recommendations backed by "saved R286 over 3 months" create trust through measurable impact, not marketing claims.

- **Households Budget by Category**: Many families budget by category ("cleaning over R250 → suggest swaps") and delegate by category ("I'll grab meat, you grab pantry"). Category view enables both naturally.

- **Receipt Reconciliation = Trust**: Category totals match how receipts summarize, making verification simpler and building confidence in TillLess' recommendations.

- **The 2.5-Level Sweet Spot**: Level 1 (5-8 core categories) + Level 2 (optional sub-buckets) + Level 2.5 (strategy tags) balances power with simplicity. Avoids taxonomy hell while enabling nuanced optimization.

---

## Action Planning (Enhanced)

### Phase 1: MVP Foundation (Weeks 1-10)

#### #1 Priority: Manual Shopping List + Basic Price Scraping MVP
- **Rationale**: Validates core hypothesis with minimal complexity and maximum learning
- **Next steps**: Set up web scraping for 2-3 major retailers (Checkers, Pick n Pay, Shoprite)
- **Resources needed**: Weekend development time, basic hosting, scraping infrastructure
- **Timeline**: 4-6 weeks for functional MVP

#### #2 Priority: Receipt OCR for Product Database
- **Rationale**: Solves the hardest problem (product normalization) with real user data
- **Next steps**: Research OCR libraries, build receipt parsing pipeline, create product mapping logic
- **Resources needed**: OCR service/library, image processing capabilities, database design
- **Timeline**: 6-8 weeks parallel to MVP development

#### #3 Priority: Single-Store Optimization Algorithm
- **Rationale**: Core value proposition - must nail the "cheapest complete basket" calculation
- **Next steps**: Design optimization logic, handle promotions and loyalty pricing, build comparison engine
- **Resources needed**: Algorithm design, promotion rule engine, price calculation logic
- **Timeline**: 8-10 weeks after initial data collection is stable

---

### Phase 2: Category Intelligence Layer (2-Week Sprint)

**One-Sentence MVP Vision:**
> "TillLess helps households master their grocery spending through clear category intelligence, smart store routing, and high-signal decisions that lead to meaningful savings."

**Competitive Positioning:**

| Competitor | They Deliver | TillLess Delivers |
|------------|-------------|-------------------|
| **Troli** | price comparison | **price mastery** |
| **EasiShop** | store vs store | **category clarity + hybrid portfolios** |
| **PriceCheck** | item search | **meal-to-budget journey** |

**You own:** The budget lens and the clarity narrative — that's a moat.

---

#### #1 Priority: Category-First Shopping List View (Signature UX) - Week 1

- **Rationale**: Flagship differentiator — the moment people see this screen, they get what makes TillLess different. This aligns with how real household budgeting works (not "milk, eggs, bread," but "We're spending too much on PANTRY")
- **Next steps**:
  - Design: Wireframe category-first shopping list screen (5-8 category cards with totals, retailer winners, drill-down affordance)
  - Data Model: Define `categories` table (id, name, parent_id, order), `category_prefs` (quality_weight, store_bias)
  - Algorithm: Build category aggregation logic (sum shopping list items → category totals per retailer)
  - UI Implementation: Category cards → tap to drill into items
  - Testing: User testing with 5-10 target users to validate clarity and speed of decisions
- **Resources needed**:
  - UI/UX designer (3-5 days wireframing + prototyping)
  - Frontend developer (5-7 days implementation)
  - Backend developer (3-5 days category service)
  - Database engineer (2 days schema design)
- **Timeline**: Week 1 sprint (7 working days)

#### #2 Priority: Optimization Personas + Category Portfolios - Week 2

- **Rationale**: Creates trust + personalization without complexity. This is the backbone of repeat behavior — users choose once (Thrifty/Balanced/Premium Fresh/Time Saver), and the engine adapts. Combined with portfolio discovery after 3 months, it creates the emotional progression from "comparing groceries" to "TillLess knows my buying personality"
- **Next steps**:
  - Design: Persona selection onboarding (clear descriptions with visual identity for each persona)
  - Algorithm: Map personas to optimization rules:
    - **Thrifty**: Price-first, high substitution tolerance, multi-store optimization
    - **Balanced**: Price + quality weighted, moderate splits, 1-2 stores preferred
    - **Premium Fresh**: Quality-first for fresh categories, accept higher prices
    - **Time Saver**: Single-store preference, minimal decisions, time > savings
  - Portfolio Engine: 3-month pattern detection (70% win rate + savings delta + low volatility threshold)
  - One-Tap Adoption: "Adopt as Default Strategy" button with plain-language benefit framing
  - Auto-Routing: System assigns stores to categories based on persona + portfolio
- **Resources needed**:
  - Backend ML/analytics engineer (5-7 days pattern detection algorithm)
  - Backend developer (5-7 days persona logic service, auto-routing algorithm)
  - Frontend developer (3-5 days onboarding flow, portfolio adoption UI)
  - Copywriter (2 days persona descriptions, adoption messaging)
- **Timeline**: Week 2 sprint (7 working days)

#### #3 Priority: Cost-per-Meal + Threshold Nudges - Week 2 Stretch Goal

- **Rationale**: This is the retention engine — small, meaningful wins that reinforce mastery. Cost-per-meal makes optimization more intuitive for meal planning ("Schnitzel costs R24/serving"). Threshold nudges (only if savings > R30 and travel ≤ 10 min) create high-signal decisions without notification fatigue
- **Next steps**:
  - Cost-per-Meal: Link shopping list items to recipes/meals, calculate serving cost, display alongside category totals
  - Threshold Logic: Only surface nudges if savings ≥ R30 AND travel time ≤ +10 min AND category switch (not item noise)
  - Nudge UI: Card format: "Switch Dairy to Checkers — save R38 (no extra travel). [Apply] [Not today]"
  - Daily micro-decision scheduler
  - Analytics: Track nudge acceptance rate, track savings realized, optimize threshold over time
- **Resources needed**:
  - Recipe/meal database (partnership or build lightweight version)
  - Backend developer (5-7 days nudge engine, threshold logic)
  - Frontend developer (3 days nudge UI, daily scheduler)
  - Analytics engineer (2 days tracking instrumentation)
- **Timeline**: Week 2 sprint (7 working days) - stretch goal if time allows after #2

---

## Reflection & Follow-up (Consolidated)

### What Worked Well

**Initial Session:**
- First principles thinking revealed the true optimization problem beyond just price
- Mind mapping created clear system architecture with defined component boundaries
- SCAMPER method generated creative alternatives and combination possibilities
- Role playing uncovered real-world usage insights after initial novelty wears off

**Enhancement Session:**
- Category-focused first principles surfaced 12 fundamental value drivers immediately
- Full SCAMPER application (all 7 elements) forced exploration of angles not naturally considered (especially Eliminate and Reverse)
- Hybrid goal (explore + implement) allowed both creative expansion and practical grounding
- Building on previous ideas created natural progression and deeper insights
- Real-world context (DDD architecture, SA retailers, actual user pain points) kept ideas grounded and actionable

### Areas for Further Exploration

**Foundational Questions:**
- **Technical Architecture**: Deep dive into scraping strategies, API alternatives, data freshness challenges
- **Business Model**: How to sustain development costs, potential revenue streams, partnership opportunities
- **User Research**: Validate assumptions with other SA households, understand shopping behavior patterns
- **Competitive Analysis**: Research existing solutions globally and locally, identify differentiation opportunities

**Category-Specific Deep Dives:**
- **DDD Domain Modeling**: How do categories map to bounded contexts? Is Category a shared kernel or does each context (ShoppingList, Budget, Planning, Analytics) have its own category representation?
- **Data Architecture**: Event sourcing for category changes? CQRS for read/write optimization? How to handle category aggregations at scale?
- **Machine Learning Implementation**: Specific algorithms for portfolio pattern detection, auto-suggested splits, personal spending clusters
- **Community Quality Ratings**: Moderation strategy, rating solicitation UX, trust/reputation systems to prevent gaming
- **Retailer Partnership Models**: What's in it for retailers? API access terms? Data sharing agreements? B2B pricing strategy?
- **Privacy & Ethics**: Anonymization techniques for B2B insights, user consent for data usage, transparency in algorithmic recommendations

### Recommended Follow-up Techniques

**Foundational:**
- **Assumption Reversal**: Challenge core assumptions about user behavior and technical approaches
- **Five Whys**: Deep dive into specific technical challenges (e.g., why is product matching so hard? Why do categories create habit formation?)
- **Time Shifting**: How would you build this with 2019 technology? 2030 technology?

**Category-Specific:**
- **Morphological Analysis**: Map implementation variables (DDD contexts, data models, UI patterns) across the 2.5-level hierarchy to identify all possible combinations
- **Forced Relationships**: Connect seemingly unrelated concepts (e.g., "What if categories + blockchain?" or "What if categories + social media?")
- **User Story Mapping**: Break down the 90-second user journey into detailed user stories with acceptance criteria

### Questions That Emerged

**Original Questions:**
- How accurate does price data need to be for users to trust the system?
- What's the minimum viable accuracy for product matching across retailers?
- How do we handle the cold start problem with no historical data?
- Should we focus on mobile-first or web-first for the SA market?
- How do we balance automation with user control over substitutions and preferences?

**Category Enhancement Questions:**
- How do we handle products that span multiple categories? (e.g., "Greek yogurt" = Dairy or Breakfast or Health Foods?)
- What's the minimum viable recipe database to enable cost-per-meal? Partnership vs build vs scrape?
- How do we measure category "quality" objectively? Community ratings only, or combine with freshness data, return rates, etc.?
- Should category portfolios be shareable? ("Try my Woolies/Checkers portfolio")
- How do we handle regional differences in retailer quality? (Woolies produce in Cape Town ≠ Woolies produce in Joburg)
- What's the rollback strategy if auto-routing gets it wrong? User override → permanent change or one-time exception?
- How do we prevent "portfolio lock-in" where users never reconsider their defaults even when better options emerge?
- Should we allow custom category creation from day 1 or force users to start with templates?
- How do we handle "special occasion" categories that don't fit the weekly pattern? (e.g., "Birthday party" category)
- What's the business model balance between B2C (user subscriptions?) and B2B (retailer insights)?

### Next Session Planning

**Suggested topics:**
- **Immediate (this week)**: DDD Domain Modeling Workshop to align technical implementation with domain concepts
- **Week 2-3**: User Research Planning - interview script for category mental models, prototype testing plan for category-first UI
- **Month 2**: Go-to-Market Strategy once MVP is in development - positioning against Troli/EasiShop, messaging framework, early adopter targeting

**Recommended timeframe:**
- DDD modeling: This week before implementation begins
- User research: Week 2-3 to validate category-first UI and persona resonance
- GTM strategy: Month 2 once MVP development is underway

**Preparation needed:**
- Review DDD patterns in existing till-less codebase
- Gather competitive analysis (Troli, EasiShop, PriceCheck screenshots and feature lists)
- Recruit 5-10 target users for interviews/testing
- Draft technical architecture options doc for discussion (event sourcing vs RDBMS, CQRS patterns, category aggregation strategies)

---

*Session facilitated using the BMAD-METHOD™ brainstorming framework*
