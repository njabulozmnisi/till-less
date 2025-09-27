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
