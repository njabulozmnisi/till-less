# 2. Requirements

## 2.1 Functional Requirements

### Core Shopping List & Category Management (FR1-FR15)

**FR1:** The system SHALL allow authenticated users to create multiple shopping lists with unique names and optional total budget amounts.

**FR2:** The system SHALL allow users to add items to shopping lists by product name, with auto-complete suggestions from the product database.

**FR3:** The system SHALL support adding items not in the product database with manual entry (product name, size, barcode if available).

**FR4:** The system SHALL automatically categorize added items into a 2.5-level category hierarchy (Level 1: 5-8 core categories, Level 2: sub-categories, Level 2.5: strategy tags) with ≥85% accuracy using keyword matching or ML.

**FR5:** The system SHALL flag auto-categorization with confidence <80% and prompt users to confirm or override the suggested category.

**FR6:** The system SHALL allow users to manually override auto-categorized items and reassign them to any category.

**FR7:** The system SHALL preserve original auto-categorization in an audit field when users override categories (for future ML training).

**FR8:** The system SHALL allow users to set budget allocations per Level 1 category within a shopping list.

**FR9:** The system SHALL calculate current spend per category by summing (price × quantity) for all items in that category using the most recent price data.

**FR10:** The system SHALL display category budget status with visual indicators: Green (spend <80% of budget), Yellow (80-100%), Red (>100% over budget).

**FR11:** The system SHALL allow users to edit item quantities, delete items, and add notes to items.

**FR12:** The system SHALL support searching for products across all retailers with filters (category, brand, price range).

**FR13:** The system SHALL store recent items per user in local storage and display them as quick-add suggestions.

**FR14:** The system SHALL allow users to clone existing shopping lists to create new lists with the same items.

**FR15:** The system SHALL support CSV import of shopping lists with format: product name, quantity, category (optional).

### Dynamic Retailer Management (FR16-FR27)

**FR16:** The system SHALL store retailer configuration in a database table with fields: id, name, slug, logoUrl, websiteUrl, enabled (boolean), dataSource (enum: WEB_SCRAPE, API, PDF, MANUAL, CROWDSOURCED), scrapingConfig (JSON).

**FR17:** The system SHALL provide an admin UI to enable/disable retailers without code changes.

**FR18:** The system SHALL provide an admin UI to configure retailer data sources and update scrapingConfig JSON (base URL, CSS selectors, API endpoints, etc.).

**FR19:** The system SHALL exclude disabled retailers from optimization calculations and UI displays.

**FR20:** The system SHALL support multiple data acquisition strategies per retailer: web scraping (Playwright/Cheerio), API, PDF OCR, manual entry, crowdsourced submissions.

**FR21:** The system SHALL implement a pluggable data acquisition framework using the Strategy pattern with a common interface (IDataAcquisitionStrategy).

**FR22:** The system SHALL select the appropriate data acquisition strategy based on the retailer's configured dataSource field.

**FR23:** The system SHALL log all data acquisition attempts with timestamp, retailer, strategy used, success/failure status, and error messages to Sentry.

**FR24:** The system SHALL provide an admin UI to upload retailer logos to Supabase Storage and update the logoUrl field.

**FR25:** The system SHALL allow adding new retailers via admin UI with all configuration fields (name, websiteUrl, dataSource, scrapingConfig).

**FR26:** The system SHALL validate retailer configuration on save (e.g., scrapingConfig must be valid JSON, required fields present).

**FR27:** The system SHALL display retailer data source type in user-facing UI with badges (web, PDF, manual, crowdsourced icons).

### Web Scraping & Price Collection (FR28-FR35)

**FR28:** The system SHALL scrape enabled retailers with dataSource = WEB_SCRAPE daily at 2 AM SAST using a scheduled cron job.

**FR29:** The system SHALL use Playwright (headless Chrome) for JavaScript-heavy retailer sites and Cheerio (HTML parsing) for static sites as configured per retailer.

**FR30:** The system SHALL extract product name, price, loyalty price (if available), and in-stock status using CSS selectors from scrapingConfig.

**FR31:** The system SHALL match extracted product names to existing Product records using fuzzy matching (Levenshtein distance) or exact barcode matching.

**FR32:** The system SHALL create new Product records for unmatched scraped products with extracted name, price, and retailer reference.

**FR33:** The system SHALL store price snapshots in a Prices table with fields: productId, retailerId, price, loyaltyPrice, inStock, source (WEB_SCRAPE), confidence (1.0 for scraped), snapshotDate.

**FR34:** The system SHALL rate-limit scraping to max 1 request per second per retailer to avoid detection and comply with polite scraping practices.

**FR35:** The system SHALL rotate user-agent strings and respect robots.txt directives for all scraping activities.

### Loyalty Pricing Integration (FR36-FR42)

**FR36:** The system SHALL allow users to add loyalty cards to their profile with fields: retailer, cardNumber (encrypted), cardType (Xtra Savings, Smart Shopper, WRewards, etc.), active (boolean).

**FR37:** The system SHALL encrypt loyalty card numbers using AES-256 encryption before storing in the database.

**FR38:** The system SHALL display loyalty card numbers partially masked (e.g., ****1234) in the UI for security.

**FR39:** The system SHALL allow users to activate/deactivate loyalty cards without deleting them.

**FR40:** The system SHALL use loyaltyPrice instead of regular price when calculating basket costs for retailers where the user has an active loyalty card.

**FR41:** The system SHALL display loyalty savings separately in optimization results (e.g., "Regular: R45.99, Xtra Savings: R38.99, You save: R7.00").

**FR42:** The system SHALL suggest adding a loyalty card if optimization detects significant savings (≥R50 per basket) available with a loyalty program.

### Domain-Driven Design (DDD) Principles (FR43)

**FR43:** The system architecture SHALL implement DDD tactical patterns including:
- Bounded Contexts: Shopping, Retailer, Optimization, Crowdsourcing, Auth
- Aggregate Roots: ShoppingList, Retailer, OptimizationResult, Submission, User
- Value Objects: Money, Distance, Percentage, CategoryBudget
- Domain Events: PriceUpdatedEvent, OptimizationCompletedEvent, ItemCategorizedEvent
- Repositories: Abstract data access behind repository interfaces

### Optimization Engine (FR44-FR58)

**FR44:** The system SHALL provide 4 optimization personas: Thrifty (savingsThreshold: R10, travelThreshold: 15 min), Balanced (R30, 10 min), Premium Fresh (R50, 5 min), Time Saver (R100, 0 min).

**FR45:** The system SHALL allow users to select their optimization persona during onboarding and change it in profile settings.

**FR46:** The system SHALL assign each Level 1 category to the retailer with the lowest total cost for items in that category (using loyalty price if user has card).

**FR47:** The system SHALL calculate travel cost for each retailer using Haversine formula for distance, adjusted by 1.3 road factor, with fuel cost = distance × 2 (round trip) × 8L/100km × R24/L.

**FR48:** The system SHALL add travel cost to category cost when comparing retailers, unless the category is already assigned to that retailer.

**FR49:** The system SHALL only suggest switching a category to a different retailer if savings ≥ user's persona savingsThreshold AND travel time ≤ persona travelThreshold.

**FR50:** The system SHALL generate threshold nudges for category switches that exceed persona thresholds with message format: "Save R{amount} on {category} by switching to {retailer} ({travelTime} min away)".

**FR51:** The system SHALL sort threshold nudges by savings amount descending (highest savings first).

**FR52:** The system SHALL cache optimization results in the database with 5-minute TTL to avoid re-computation for repeated requests.

**FR53:** The system SHALL invalidate cached optimization results when the user's persona changes or shopping list items are modified.

**FR54:** The system SHALL complete optimization calculations in <2 seconds for shopping lists with up to 40 items across 5 categories and 4 retailers.

**FR55:** The system SHALL calculate total savings as: baselineCost (single-store, cheapest overall or user's frequent retailer) - optimizedCost (multi-category assignments).

**FR56:** The system SHALL display optimization results with: category assignments (category → retailer), total savings, baseline cost, optimized cost, travel cost, number of retailers.

**FR57:** The system SHALL allow users to accept threshold nudges, which updates category assignments and recalculates optimization results.

**FR58:** The system SHALL log dismissed threshold nudges for future persona tuning and ML training.

### PDF Catalogue Processing (FR59-FR65)

**FR59:** The system SHALL allow admin users to upload PDF catalogues for retailers with dataSource = PDF via Supabase Storage.

**FR60:** The system SHALL convert PDF pages to images and send them to Google Cloud Vision API for OCR text extraction.

**FR61:** The system SHALL parse OCR text using regex and NLP to extract product names, prices, and categories from unstructured text.

**FR62:** The system SHALL calculate a confidence score (0-1) for each extracted product based on OCR quality and parsing certainty.

**FR63:** The system SHALL create a manual review queue for extractions with confidence <80%, allowing admins to correct/approve/reject entries.

**FR64:** The system SHALL create Price records for approved PDF extractions with source = PDF and the calculated confidence score.

**FR65:** The system SHALL validate extracted prices (must be >R0 and <R10,000) and flag outliers (±50% from historical average) for manual review.

### Manual Price Entry (FR66-FR70)

**FR66:** The system SHALL provide an admin UI for manual price entry with fields: retailer, product (search/select), price, loyaltyPrice (optional), date.

**FR67:** The system SHALL support bulk manual price entry via CSV upload with format: retailer slug, product barcode/name, price, loyalty price, date.

**FR68:** The system SHALL validate manual price entries with same rules as PDF extractions (price >R0, <R10,000, outlier detection).

**FR69:** The system SHALL create Price records for manual entries with source = MANUAL and confidence = 1.0.

**FR70:** The system SHALL display a data source indicator in admin price lists showing which prices are manual, scraped, PDF, or crowdsourced.

### Social Media Crowdsourcing (FR71-FR105)

**FR71:** The system SHALL monitor Twitter for #tillless hashtag mentions using Twitter API v2 (free tier, 500K tweets/month).

**FR72:** The system SHALL monitor Instagram and Facebook for #tillless hashtag using Graph API.

**FR73:** The system SHALL download images from social media posts mentioning #tillless and store them in Supabase Storage.

**FR74:** The system SHALL extract text from crowdsourced images using Google Cloud Vision API OCR.

**FR75:** The system SHALL parse OCR text to extract product name and price using regex patterns (R99.99, 99,99, etc.).

**FR76:** The system SHALL calculate OCR confidence score based on text clarity and successful price pattern matching.

**FR77:** The system SHALL create crowdsourced_submissions records with fields: platform, postUrl, contributorUsername, imageUrl, ocrConfidence, extractedPrice, status (pending/processing/approved/rejected/flagged).

**FR78:** The system SHALL group submissions by product (fuzzy name matching) and calculate price variance across submissions.

**FR79:** The system SHALL auto-approve submissions when ≥3 submissions for the same product have prices within 5% variance.

**FR80:** The system SHALL flag submissions for manual review when: OCR confidence <70%, price variance >5%, NSFW content detected, duplicate submission detected.

**FR81:** The system SHALL create a contributor_reputation record for each unique contributor with fields: username, platform, reputationScore (0-100), approvedCount, rejectedCount, totalSubmissions.

**FR82:** The system SHALL increment contributor reputation by +5 points for approved submissions, -10 for rejected submissions.

**FR83:** The system SHALL award badges to contributors: "First Contributor", "100 Points", "Top 10", "Accuracy Master" (≥95% approval rate).

**FR84:** The system SHALL display a public leaderboard showing top 10 contributors by reputation score.

**FR85:** The system SHALL allow contributors to view their profile with reputation score, badges, submission history, and approval rate.

**FR86:** The system SHALL rate-limit crowdsourced submissions to max 10 per user per hour to prevent spam.

**FR87:** The system SHALL detect duplicate image submissions using perceptual hashing and reject duplicates with error message.

**FR88:** The system SHALL filter NSFW images using Google Cloud Vision SafeSearch API and auto-reject flagged submissions.

**FR89:** The system SHALL allow admin users to review pending crowdsourced submissions with UI showing: image, OCR results, extracted price, approve/reject/edit actions.

**FR90:** The system SHALL create Price records for approved crowdsourced submissions with source = CROWDSOURCED and ocrConfidence as the confidence score.

**FR91:** The system SHALL display crowdsourced prices in user UI with badge "Community Verified" and contributor count (e.g., "3 contributors").

**FR92:** The system SHALL allow users to directly upload price photos via web UI (no social media required) as an alternative submission method.

**FR93:** The system SHALL provide a "Submit Price" button on product detail pages that opens a dialog with image upload and retailer/location fields.

**FR94:** The system SHALL send confirmation notifications to contributors when their submissions are approved, including points earned and new reputation score.

**FR95:** The system SHALL display a "Contribute" section on the home page highlighting top contributors and encouraging participation.

**FR96:** The system SHALL implement consensus validation logic that requires majority agreement (≥2 out of 3 submissions) for auto-approval.

**FR97:** The system SHALL track submission timestamps and expire pending submissions after 7 days with auto-rejection.

**FR98:** The system SHALL detect price outliers in crowdsourced submissions (±30% from current database price) and flag for manual review even if consensus exists.

**FR99:** The system SHALL allow contributors to dispute rejected submissions with a comment field, creating a review ticket for admins.

**FR100:** The system SHALL implement anti-gaming measures: max 3 submissions per product per contributor per month, prevent self-validation via multiple accounts (IP tracking).

**FR101:** The system SHALL integrate social media monitoring into the same scheduled job as web scraping (daily at 2 AM).

**FR102:** The system SHALL log all crowdsourced submissions with platform, contributor, timestamp, status, and admin actions for audit trail.

**FR103:** The system SHALL provide admin analytics dashboard showing: submissions per day, approval rate, top contributors, average OCR confidence, platform breakdown.

**FR104:** The system SHALL support multiple languages in OCR parsing for future expansion (Afrikaans, Zulu, Xhosa) in Phase 1.5.

**FR105:** The system SHALL display data freshness timestamps in user UI: "Prices last updated: 2 hours ago (web scraping), 30 min ago (community)".

---

## 2.2 Non-Functional Requirements

### Performance (NFR1-NFR5)

**NFR1:** The web application SHALL achieve Lighthouse performance score ≥90 for all core pages.

**NFR2:** The web application SHALL load initial page (First Contentful Paint) in <2 seconds on 3G connection.

**NFR3:** The API SHALL respond to simple queries (user profile, shopping list fetch) with p50 latency <200ms, p95 <500ms, p99 <1s.

**NFR4:** The optimization engine SHALL complete calculations in <2 seconds for shopping lists with ≤40 items across ≤5 categories and ≤4 retailers.

**NFR5:** The web application SHALL maintain initial JavaScript bundle size <300KB (gzipped) using code splitting and lazy loading.

### Scalability (NFR6-NFR10)

**NFR6:** The system SHALL support 500 concurrent active users in MVP phase without performance degradation.

**NFR7:** The database connection pool SHALL be configured for max 10 concurrent connections (Prisma) to stay within Supabase free tier limits.

**NFR8:** The API SHALL use Redis caching (Upstash free tier) for frequently accessed data: price snapshots (24-hour TTL), optimization results (5-minute TTL), session data.

**NFR9:** The system architecture SHALL support horizontal scaling of the API layer (multiple Railway instances) behind a load balancer for future growth.

**NFR10:** The data acquisition pipelines SHALL process up to 4 retailers × 10,000 products each = 40,000 price snapshots per day without job failures.

### Cost Constraints (NFR11-NFR13)

**NFR11:** The MVP infrastructure SHALL target total monthly cost ≤R150 (~$8 USD) including: Vercel Hobby (R0), Railway Starter (R95), Supabase Free (R0), Upstash Free (R0), Google Cloud Vision (~R50).

**NFR12:** The system SHOULD target staying within free tiers for all services; MAY require R150-300/month with stakeholder approval if user growth exceeds free limits.

**NFR13:** The system SHALL minimize Google Cloud Vision API calls by: caching OCR results, batching PDF page extractions, implementing confidence-based retry limits (max 2 retries).

### Reliability & Resilience (NFR14-NFR18)

**NFR14:** The API SHALL maintain ≥99% uptime during business hours (6 AM - 10 PM SAST) as measured by BetterUptime health checks.

**NFR15:** The system SHALL implement automatic health checks via /health endpoint that verifies database connectivity and returns HTTP 200 if healthy, 503 if unhealthy.

**NFR16:** The system SHALL log all errors to Sentry with context (user ID, request ID, retailer ID) and send alerts for critical errors (database down, authentication failures).

**NFR17:** The database SHALL be backed up automatically daily by Supabase with 7-day retention on free tier.

**NFR18:** The system SHALL implement graceful error handling for scraping failures: log error, return empty price array, continue with next retailer without crashing.

### Security & Privacy (NFR19-NFR28)

**NFR19:** The system SHALL enforce HTTPS (TLS 1.3) for all API and web traffic with automatic HTTP→HTTPS redirects.

**NFR20:** The system SHALL implement CORS restrictions allowing API requests only from web/mobile app origins (Vercel domain, Expo app).

**NFR21:** The system SHALL implement rate limiting of 100 requests per minute per IP address using Redis-backed rate limiter.

**NFR22:** The system SHALL validate all API inputs using Zod schemas to prevent SQL injection, XSS, and other injection attacks.

**NFR23:** The system SHALL hash passwords using bcrypt (Supabase Auth default) with minimum 10 rounds.

**NFR24:** The system SHALL implement JWT-based authentication with access token expiry of 15 minutes and refresh token expiry of 7 days.

**NFR25:** The system SHALL encrypt sensitive data at rest (loyalty card numbers) using AES-256 encryption via built-in database encryption or application-level encryption.

**NFR26:** The system SHALL comply with POPIA (Protection of Personal Information Act) by: storing data in EU region (GDPR/POPIA compliant), providing data export functionality, allowing user account deletion, obtaining consent at signup.

**NFR27:** The system SHALL implement row-level security (RLS) policies in Supabase Postgres to ensure users can only access their own shopping lists, loyalty cards, and optimization results.

**NFR28:** The system SHALL log all authentication events (login, logout, password reset) with IP address and timestamp for security audit trails.

### Domain-Driven Design (DDD) Architecture (NFR29-NFR33)

**NFR29:** The backend architecture SHALL implement DDD Bounded Contexts as separate NestJS modules: Shopping, Retailer, Optimization, Crowdsourcing, Auth.

**NFR30:** Each Bounded Context SHALL define Aggregate Roots that enforce invariants and maintain consistency boundaries (e.g., ShoppingList is the aggregate root for Items).

**NFR31:** The system SHALL use Value Objects for domain concepts without identity: Money (amount, currency), Distance (kilometers), Percentage (0-100), CategoryBudget (categoryId, amount).

**NFR32:** The system SHALL implement Domain Events for cross-context communication using NestJS EventEmitter: PriceUpdatedEvent, OptimizationCompletedEvent, ItemCategorizedEvent.

**NFR33:** The system SHALL abstract data access behind Repository interfaces (e.g., IShoppingListRepository, IRetailerRepository) to decouple domain logic from persistence.

### Data Quality & Integrity (NFR34-NFR37)

**NFR34:** The product auto-categorization engine SHALL achieve ≥85% accuracy on a test dataset of 200 common SA grocery products.

**NFR35:** The system SHALL maintain product-to-retailer price mappings with staleness indicator: prices >4 hours old flagged as "may be outdated".

**NFR36:** The system SHALL implement database constraints: unique indexes (user email, retailer slug, category slug), foreign key constraints, NOT NULL on required fields.

**NFR37:** The system SHALL validate price outliers (±50% from historical average) and flag for manual admin review before displaying to users.

### Accessibility (NFR38-NFR41)

**NFR38:** The web application SHALL meet WCAG AA accessibility standards including: color contrast ≥4.5:1 for text, ≥3:1 for UI components, keyboard navigation support, ARIA labels for screen readers.

**NFR39:** The web application SHALL support reduced motion preferences (prefers-reduced-motion) by disabling animations for users with this setting.

**NFR40:** The web application SHALL ensure touch targets on mobile are ≥44px × 44px for all interactive elements (buttons, links, form inputs).

**NFR41:** The web application SHALL support text resizing up to 200% without loss of functionality or content overlap.

### Social Crowdsourcing Quality (NFR42-NFR53)

**NFR42:** The crowdsourced submission OCR SHALL achieve ≥70% confidence score for auto-processing; submissions with <70% confidence SHALL be flagged for manual review.

**NFR43:** The consensus validation logic SHALL require ≥3 independent submissions with price variance ≤5% for auto-approval.

**NFR44:** The reputation system SHALL decay reputation scores by -1 point per month of inactivity to incentivize ongoing participation.

**NFR45:** The anti-spam system SHALL implement rate limiting of max 10 submissions per user per hour and max 3 submissions per product per user per month.

**NFR46:** The duplicate detection system SHALL use perceptual hashing (pHash) with Hamming distance <10 to identify duplicate images and reject with error.

**NFR47:** The NSFW filter SHALL use Google Cloud Vision SafeSearch API and auto-reject images flagged as "likely" or "very likely" NSFW.

**NFR48:** The submission review queue SHALL auto-expire pending submissions after 7 days and notify contributors of auto-rejection due to timeout.

**NFR49:** The crowdsourcing analytics dashboard SHALL display: submission volume (daily/weekly), approval rate, top contributors, average OCR confidence, platform breakdown (Twitter/Instagram/Facebook).

**NFR50:** The social media monitoring jobs SHALL respect API rate limits: Twitter API v2 free tier (500K tweets/month), Instagram/Facebook Graph API (200 requests/hour).

**NFR51:** The contributor reputation system SHALL award badges based on milestones: First Contributor (1st submission), 100 Points (100 reputation), Top 10 (leaderboard), Accuracy Master (≥95% approval rate with ≥20 submissions).

**NFR52:** The system SHALL store crowdsourced submission audit trail with: contributor username, platform, timestamp, submission status, admin actions (approve/reject/edit), admin user ID.

**NFR53:** The crowdsourced price display SHALL include transparency indicators: "Community Verified (3 contributors)" badge, last verified timestamp, contributor reputation range.

---
