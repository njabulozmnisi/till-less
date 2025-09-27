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
