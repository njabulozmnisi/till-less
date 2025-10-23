# 5. Epic List

Below is the high-level list of all epics for the TillLess MVP. Each epic delivers a significant end-to-end increment of functionality that can be deployed and tested. Epics are logically sequential, building upon previous epics' foundations.

**Total MVP Timeline: 16 weeks (320 hours @ 20 hours/week)**

---

## Epic 1: Foundation & Authentication Infrastructure
**Duration:** 2 weeks
**Goal:** Establish project infrastructure, authentication system, and basic user management to enable subsequent feature development.

**Deliverables:**
- Nx monorepo with Next.js (web), NestJS (api), shared packages
- Supabase Postgres database with Prisma ORM
- Supabase Auth integration (email/password, OAuth)
- User registration, login, logout, session management
- Basic user profile (name, email, location)
- CI/CD pipeline (GitHub Actions, Vercel, Railway)
- Development environment setup
- Health check endpoint + monitoring (Sentry)

---

## Epic 2: Retailer Management & Dynamic Configuration
**Duration:** 2 weeks
**Goal:** Enable database-driven retailer management with pluggable data acquisition strategies for multiple data sources.

**Deliverables:**
- Retailer configuration database schema
- Admin UI for retailer management (enable/disable, configure data sources)
- Pluggable data acquisition framework (Strategy pattern)
- Web scraping adapter (Playwright + Cheerio) for 2 retailers
- Retailer service API (tRPC)
- Price snapshot storage
- Initial product seed data (200+ SA grocery items)
- Retailer logo upload + display

---

## Epic 3: Category System & Shopping List Management
**Duration:** 2 weeks
**Goal:** Implement 2.5-level category hierarchy and core shopping list CRUD with auto-categorization.

**Deliverables:**
- Category database schema (2.5-level hierarchy)
- Category seed data (5-8 Level 1 categories)
- Shopping list CRUD
- Item CRUD with auto-categorization (85% accuracy)
- Manual category override
- Category budget allocation
- Category card UI
- Search & add item UI

---

## Epic 4: Optimization Engine & Persona-Driven Recommendations
**Duration:** 2.5 weeks
**Goal:** Build category-level optimization engine with persona-driven thresholds and travel cost modeling.

**Deliverables:**
- Optimization algorithm (category-level assignment)
- Persona system (4 personas with thresholds)
- Travel cost calculator
- Loyalty pricing integration
- Loyalty card management UI
- Optimization results screen
- Threshold nudges UI
- Export to PDF
- Results caching (5-minute TTL)

---

## Epic 5: PDF Catalogue Processing & Manual Price Entry
**Duration:** 2 weeks
**Goal:** Enable price data acquisition from non-ecommerce retailers via PDF OCR and manual admin entry.

**Deliverables:**
- PDF upload UI (admin)
- Google Cloud Vision OCR integration
- PDF parsing pipeline
- Manual review queue (confidence <80%)
- Manual price entry UI (CSV + web form)
- Price validation rules (outlier detection)
- Price history tracking
- Retailer data source indicator in UI

---

## Epic 6: Social Media Crowdsourcing & Image OCR
**Duration:** 2.5 weeks
**Goal:** Enable crowdsourced price submissions via #tillless hashtag with image OCR, reputation system, and gamification.

**Deliverables:**
- Social media monitoring (Twitter, Instagram, Facebook)
- Hashtag tracking (#tillless)
- Image OCR (Google Cloud Vision)
- Submission database schema
- Consensus validation (3+ submissions, 5% variance)
- Contributor reputation system
- Submission review queue
- Direct upload UI
- Contributor profile + leaderboard
- Anti-spam detection
- Gamification (badges, points)

---

## Epic 7: Onboarding & Persona Selection
**Duration:** 1.5 weeks
**Goal:** Create seamless onboarding flow with persona selection, location setup, loyalty cards, and zero-state basket seed.

**Deliverables:**
- Welcome screen (value prop)
- Persona selection UI
- Location + retailer proximity setup
- Loyalty card input screen
- Zero-state basket seed (3-5 items per category)
- Onboarding progress tracking
- Skip/back navigation

---

## Epic 8: UI/UX Polish & Accessibility
**Duration:** 1.5 weeks
**Goal:** Achieve WCAG AA compliance, optimize performance, and polish UI for production readiness.

**Deliverables:**
- WCAG AA compliance (color contrast, keyboard nav, screen readers)
- Responsive design refinements
- Dark mode toggle
- Loading states (Skeleton components)
- Error handling (Toast, error boundaries)
- Empty states
- Performance optimization (Lighthouse ≥90)
- Touch target sizing (≥44px)
- PWA manifest
- Offline support

---

## Epic Summary Table

| Epic | Title                               | Duration | Key Deliverables                                                      |
| ---- | ----------------------------------- | -------- | --------------------------------------------------------------------- |
| 1    | Foundation & Authentication         | 2 weeks  | Nx monorepo, Supabase Auth, CI/CD, health check                      |
| 2    | Retailer Management                 | 2 weeks  | Dynamic retailer config, web scraping, price storage                 |
| 3    | Category System & Shopping Lists    | 2 weeks  | 2.5-level categories, list CRUD, auto-categorization                 |
| 4    | Optimization Engine                 | 2.5 wks  | Category optimization, personas, loyalty, export                      |
| 5    | PDF Catalogue Processing            | 2 weeks  | PDF OCR, manual entry, price validation                              |
| 6    | Social Crowdsourcing                | 2.5 wks  | Social monitoring, image OCR, reputation, gamification               |
| 7    | Onboarding & Persona Selection      | 1.5 wks  | 5-screen wizard, zero-state seed, location setup                     |
| 8    | UI/UX Polish & Accessibility        | 1.5 wks  | WCAG AA, dark mode, PWA, performance, offline                        |

**Total: 16 weeks**

---

**Post-MVP Epics (Phase 1.5+):**

- **Epic 9:** Surgical Optimization (2-store category splits)
- **Epic 10:** Category Portfolios (adaptive learning)
- **Epic 11:** Household Budgets (multi-member)
- **Epic 12:** React Native Mobile App (Expo + NativeWind)
- **Epic 13:** Advanced Analytics (price trends, savings history)

**Phase 5 (Reverse Marketplace):**
- **Epic 14:** Demand Aggregation & Retailer Bidding API

**Phase 3/4 (MCP + Voice AI):**
- **Epic 15:** MCP Server & Voice Assistant Integration

---
