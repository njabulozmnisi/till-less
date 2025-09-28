# Project TillLess - Brainstorming Session Results

**Session Topic:** Personal shopping optimization system for South African supermarkets
**Date:** 2025-09-24
**Participant:** User
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

## Executive Summary

**Session Goals:** Broad exploration of Project TillLess architecture, data sources, workflows, algorithms, and future enhancements

**Techniques Used:** First Principles Thinking, Mind Mapping, SCAMPER Method (Substitute & Combine), Role Playing

**Total Ideas Generated:** 50+ across technical architecture, data sources, optimization approaches, and user experience

**Key Themes Identified:**
- Transform from "price calculator" to "household food & spend assistant"
- Combine shopping optimization with meal planning and purchase history
- Balance price savings with convenience and effort minimization
- Handle real-world messiness through graceful degradation and user feedback loops
- Leverage South African market specifics (loyalty programs, retailer APIs, local context)

---

## Idea Categorization

### Immediate Opportunities
*Ideas ready to implement now*

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

### Future Innovations
*Ideas requiring development/research*

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

### Moonshots
*Ambitious, transformative concepts*

1. **Household Food & Budget Concierge**
   - Description: AI-powered monthly food planning that optimizes nutrition, budget, and preferences
   - Transformative potential: Eliminates food planning cognitive load entirely
   - Challenges to overcome: Complex ML, nutritional expertise, behavior change adoption

2. **Real-time Market Intelligence Network**
   - Description: Live price monitoring across all SA retailers with instant notifications
   - Transformative potential: Never miss a deal, perfect market timing
   - Challenges to overcome: Massive data infrastructure, retailer relationships, cost scalability

### Insights & Learnings

- **Total Cost Optimization**: Price is just one component; time, effort, and convenience are equally important
- **South African Context**: Loyalty programs, specific retailers, and local shopping patterns require tailored solutions
- **Data Quality vs Coverage**: Better to have accurate data for fewer stores than unreliable data for many
- **User Evolution**: Needs change from basic price comparison to sophisticated household management over time
- **Real-world Messiness**: Stock-outs, price changes, and human preferences require graceful degradation strategies

---

## Action Planning

### Top 3 Priority Ideas

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

## Reflection & Follow-up

### What Worked Well
- First principles thinking revealed the true optimization problem beyond just price
- Mind mapping created clear system architecture with defined component boundaries
- SCAMPER method generated creative alternatives and combination possibilities
- Role playing uncovered real-world usage insights after initial novelty wears off

### Areas for Further Exploration
- **Technical Architecture**: Deep dive into scraping strategies, API alternatives, data freshness challenges
- **Business Model**: How to sustain development costs, potential revenue streams, partnership opportunities
- **User Research**: Validate assumptions with other SA households, understand shopping behavior patterns
- **Competitive Analysis**: Research existing solutions globally and locally, identify differentiation opportunities

### Recommended Follow-up Techniques
- **Assumption Reversal**: Challenge core assumptions about user behavior and technical approaches
- **Five Whys**: Deep dive into specific technical challenges (e.g., why is product matching so hard?)
- **Morphological Analysis**: Systematic exploration of technical architecture combinations
- **Time Shifting**: How would you build this with 2019 technology? 2030 technology?

### Questions That Emerged
- How accurate does price data need to be for users to trust the system?
- What's the minimum viable accuracy for product matching across retailers?
- How do we handle the cold start problem with no historical data?
- Should we focus on mobile-first or web-first for the SA market?
- How do we balance automation with user control over substitutions and preferences?

### Next Session Planning
- **Suggested topics:** Technical deep-dive into scraping architecture, competitive analysis of existing solutions, user interview insights
- **Recommended timeframe:** 2-3 weeks after MVP development begins
- **Preparation needed:** Technical prototype results, user feedback from early testing, competitive research completion

---

*Session facilitated using the BMAD-METHOD™ brainstorming framework*
