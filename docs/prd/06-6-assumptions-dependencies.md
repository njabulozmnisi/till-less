## 6. Assumptions & Dependencies
- Access to retailer web endpoints can be maintained through compliant scraping cadence (no legal/API restrictions).
- Users possess loyalty cards and can toggle them in the app.
- Travel cost model uses simple heuristics (distance via Google Maps API or static rate tables) within Gauteng.
- De-normalised product caches refreshed every ≤4 hours for staples are sufficient for MVP accuracy.
- Infrastructure budget limits prohibit paid data feeds; reliance on scrapers and voluntary receipt uploads.

Dependencies include stable scraping infrastructure, CP Registry schema changes (Phase 1 migration), and ingestion monitoring dashboards.
