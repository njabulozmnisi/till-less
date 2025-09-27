# TillLess Product Requirements Document (PRD)

## 1. Executive Summary
TillLess is a personal shopping optimisation assistant designed for South African households who complete large monthly grocery runs. The MVP will ingest a user-provided shopping list, collect pricing and promotion data from five priority retailers (Checkers/Sixty60, Pick n Pay, Shoprite, Woolworths, Makro), and recommend the cheapest viable basket with transparent trade-offs that include loyalty pricing and travel effort.

The goal of Phase 1 is to prove that TillLess can reliably surface meaningful savings (>8% per monthly shop) while keeping user effort low (≤10 minutes of interaction) and providing clear explanations of pricing decisions.

## 2. Background & Problem Statement
- South African grocery shoppers face high price volatility, opaque promotions, and inconsistent stock information across retailers.
- Manual cross-checking of prices, loyalty deals, and pack sizes is time consuming and error prone.
- Existing tools focus on price comparison without accounting for whole-basket completion, travel effort, or personalized substitution preferences.

TillLess addresses these gaps by normalising retailer data, modelling total cost (price + promotions + loyalty + travel effort + stock risk), and delivering a confident shopping plan for the month.

## 3. Goals & Success Metrics
### 3.1 Primary Goals
1. Provide a deterministic cheapest-basket recommendation for a user’s shopping list across the five retailers.
2. Surface item-level savings insights and explain why the winning store combination is optimal.
3. Reduce cognitive load by automating data gathering, product normalisation, and promo calculations.

### 3.2 Success Metrics (MVP)
- **Savings**: ≥8% average total basket savings vs. user’s baseline store.
- **Completion**: ≥95% of items matched to retailer products; ≤5% manual override rate.
- **Effort**: User completes planning workflow in ≤10 minutes.
- **Trust**: ≥80% of recommendations accepted (measured via post-shop feedback).
- **Accuracy**: ≤3% variance between predicted and actual till receipts for monitored baskets.

## 4. Target Users & Personas
### 4.1 Primary Persona – Thandi (Budget-Conscious Parent)
- Lives in Gauteng, shops monthly for a family of four.
- Comfortable with smartphones, holds loyalty cards (Xtra Savings, Smart Shopper, WRewards, mCard).
- Wants to stretch budget while avoiding multi-store runs unless savings are substantial.

### 4.2 Secondary Persona – Bongani (Bulk Buyer / Side Hustler)
- Purchases household staples plus bulk items for resale (Makro focused).
- Sensitive to promo timing and carton sizes.
- Needs visibility into delivery vs. pickup logistics.

### 4.3 Future Persona (Phase 2) – Sipho (Health-Conscious Professional)
- Cares about nutrition, variety, and meal planning integration.
- Requires substitution guidance linked to dietary constraints.

## 5. Scope (Phase 1 MVP)
### 5.1 In-Scope
- Manual shopping list input (web form & CSV import) with item name, quantity, size, substitution tolerance, must-have flag.
- Canonical Product Registry (CPR) expansion supporting five retailers + loyalty price fields.
- Scraping/ingestion pipelines with cadence grid for each retailer.
- Single-store optimisation engine that:
  - Normalises products across retailers using receipt data + heuristics.
  - Calculates basket totals including loyalty prices, promo multipliers, and unit conversions.
  - Factors user time cost and maximum stores (default 1 store, ability to evaluate best single store).
- Output UI (web) showing:
  - Recommended store and total cost breakdown.
  - Itemised price comparison table across retailers.
  - Highlighted promotions applied and savings explanation.
- Basic receipt reconciliation flow to capture actual paid prices for feedback (manual upload).

### 5.2 Out of Scope (Phase 1)
- Automated receipt OCR ingestion (planned for Phase 1.5/2).
- Real-time stock verification via retailer APIs.
- Meal planning, recipe generation, or pantry management features.
- Native mobile applications (responsive web only).
- Multi-store route optimisation (consider Phase 2).

## 6. Assumptions & Dependencies
- Access to retailer web endpoints can be maintained through compliant scraping cadence (no legal/API restrictions).
- Users possess loyalty cards and can toggle them in the app.
- Travel cost model uses simple heuristics (distance via Google Maps API or static rate tables) within Gauteng.
- De-normalised product caches refreshed every ≤4 hours for staples are sufficient for MVP accuracy.
- Infrastructure budget limits prohibit paid data feeds; reliance on scrapers and voluntary receipt uploads.

Dependencies include stable scraping infrastructure, CP Registry schema changes (Phase 1 migration), and ingestion monitoring dashboards.

## 7. Detailed Requirements
### 7.1 Functional Requirements
1. **Account & Preferences**
   - Users create profiles storing loyalty cards, home location, effort tolerance (max stores, max distance), and value-of-time setting.
   - Ability to update preferences and toggle cards per run.

2. **Shopping List Management**
   - Manual entry (line items with quantity, preferred brand, size, substitution tolerance) and CSV import (standard template).
   - Validation ensuring units recognised (ml, g, kg, counts) and flagged unknown items for review.
   - Save/reuse past lists; clone last month’s list with adjustments.

3. **Data Integration & Normalisation**
   - Fetch latest retailer catalogues per cadence schedule.
   - Map retailer SKUs to canonical products using heuristics (string normalisation, pack parsing, brand dictionary, optional GTIN).
   - Store loyalty price, promo metadata, and per-weight pricing as per CPR schema.

4. **Optimisation Engine**
   - Compute total basket cost per retailer with applied promos and loyalty toggles.
   - Detect unfulfilled items and suggest substitutions within tolerance.
   - Display trade-offs (e.g., “Makro saves R180 but requires 20 km travel”).

5. **Results & Reporting**
   - Present summary card (total cost, estimated savings vs. baseline, assumed travel cost).
   - Item-level comparison table with price, loyalty price, unit price, promo badges per retailer.
   - Highlight missing items and recommended substitutes.
   - Export plan to PDF or email summary.

6. **Feedback Loop**
   - Allow user to record actual till totals and upload receipt photo (stored, manual data entry for now).
   - Capture match accuracy (correct / incorrect) to refine product mapping queue.

### 7.2 Non-Functional Requirements
- **Performance**: Optimisation run completes within 30 seconds for lists up to 60 items.
- **Reliability**: Data pipelines maintain ≥95% availability; failure alerts dispatched within 5 minutes.
- **Scalability**: Architecture supports onboarding 2 additional retailers without schema refactor.
- **Security & Privacy**: Store user data securely (encryption at rest/in transit). Receipt uploads stored in restricted bucket with 90-day retention.
- **Compliance**: Adhere to retailer terms of service for data usage; include disclaimers that prices are indicative and may vary in-store.

## 8. User Journeys
### 8.1 Monthly Planner Journey (Primary Persona)
1. User logs in, verifies saved list or imports CSV.
2. Configures loyalty cards (toggle on Xtra Savings, WRewards).
3. Runs optimisation; engine fetches latest prices.
4. Results page shows recommended store (e.g., Checkers) with breakdown.
5. User reviews substitutions and confirms plan.
6. Post-shop, user enters actual totals for reconciliation.

### 8.2 Bulk Buyer Journey
1. User creates list emphasising bulk quantities (Makro items).
2. Sets tolerance for multi-store to “1” (prefers single warehouse pickup).
3. Optimiser shows Makro best for majority items, notes missing fresh produce.
4. User exports plan and schedules store visit.

## 9. Data Model & Integrations
- **Canonical Product Registry**: Extended schema (per-weight, loyalty fields) as defined in `docs/canonical-product-registry.md`.
- **Scraping Pipelines**: Retailer-specific playbooks (`docs/retailer-scraping-playbook.md`).
- **Mapping Queue**: Human review interface for low-confidence matches.
- **External APIs**: Optional Google Maps for distance estimation (subject to budget), OSRM self-hosted alternative considered.

## 10. Analytics & Telemetry
- Track optimisation run outcomes (store chosen, savings %).
- Monitor item match confidence and override frequency.
- Capture latency per optimisation execution.
- Instrument scraping jobs (success/failure counts, last scrape timestamp).

## 11. Release Plan
### Phase 1 Milestones
1. **Data Backbone (Weeks 1-3)**: Deploy CPR migration, implement scrapers for five retailers, populate canonical product dataset for top categories (milk, bread, staples, detergents, nappies, chicken, etc.).
2. **Optimisation MVP (Weeks 4-6)**: Build list input UI, optimisation engine, results dashboard.
3. **Feedback Loop (Weeks 7-8)**: Add receipt reconciliation, accuracy reporting, and savings tracking.
4. **Pilot Launch (Week 9)**: Roll out to closed beta (≤20 households in Gauteng) and gather feedback.

### Phase 1.5 Considerations
- Integrate Food Lover’s Market where available.
- Add receipt OCR pipeline for automatic product mapping updates.
- Explore multi-store route recommendations if user appetite exists.

## 12. Risks & Mitigations
| Risk | Impact | Likelihood | Mitigation |
| --- | --- | --- | --- |
| Retailer blocks scrapers | Data gaps | Medium | Polite cadence, rotate IPs, consider partner APIs |
| Product matching errors | Broken trust | High | Maintain review queue, leverage receipt feedback, tighten heuristics |
| Promo data stale | Savings inflated | Medium | Increase cadence during promos, display scrape timestamp |
| Travel cost underestimation | Misleading total cost | Medium | Allow user to adjust travel settings, show assumptions |
| Loyalty pricing misapplied | User billed more at till | Medium | Require user to confirm card ownership, highlight loyalty-only savings |

## 13. Open Questions
1. What is the minimal acceptable data freshness for users (2h vs 4h)?
2. Should we support multi-store recommendations in MVP if savings surpass threshold?
3. How will we prioritise categories beyond the seed list once coverage stabilises?
4. Do we need to model delivery fees vs. in-store pickup in MVP, or defer?

## 14. Appendices
- A. Brainstorming Session Results (`docs/brainstorming-session-results.md`)
- B. Market Research Summary (`docs/market-research.md`)
- C. CPR Extension Blueprint (`docs/canonical-product-registry.md`)
- D. Scraping Playbook (`docs/retailer-scraping-playbook.md`)

