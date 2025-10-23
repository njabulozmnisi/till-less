# 4. Technical Assumptions

These technical decisions will guide the Architect and serve as constraints for implementation. All choices are driven by project goals: rapid MVP delivery, code reuse across platforms, scalability to 10K+ users, and maintainability.

---

## 4.1 Repository Structure: **Monorepo (Nrwl Nx)**

**Decision: Nx Monorepo with integrated tooling**

**Rationale:**
- **Superior dependency graph analysis**: Nx's task pipeline and affected commands optimize CI/CD (only test/build what changed)
- **Integrated generators**: Nx provides official generators for Next.js, NestJS, React Native (Expo), reducing boilerplate
- **Built-in caching**: Local and distributed computation caching speeds up builds (Nx Cloud optional)
- **Better React Native support**: `@nx/expo` plugin maintained by Nrwl
- **Module boundary enforcement**: Nx enforces architectural constraints
- **Stakeholder preference**: User explicitly prefers Nx over Turborepo

**Monorepo Structure:**
```
tillless/
├── apps/
│   ├── web/                    # Next.js 15 PWA (Tailwind v4)
│   ├── mobile/                 # Expo React Native (NativeWind)
│   └── api/                    # NestJS backend (REST + tRPC)
├── packages/
│   ├── ui/                     # Shared UI components (Tailwind + NativeWind)
│   ├── api-client/             # tRPC client + type definitions
│   ├── database/               # Prisma schema + migrations
│   ├── utils/                  # Business logic, formatters, validators
│   ├── config/                 # Shared configs (ESLint, TypeScript, Tailwind)
│   └── types/                  # Shared TypeScript types
├── libs/
│   ├── optimization-engine/    # Category optimization algorithms
│   ├── retailer-adapters/      # Pluggable scraper/API/OCR strategies
│   └── auth/                   # Shared authentication logic
├── tools/
│   └── scripts/                # Database seeding, migrations, utilities
├── nx.json                     # Nx workspace configuration
├── package.json                # Root dependencies
└── tsconfig.base.json          # Base TypeScript config
```

---

## 4.2 Service Architecture: **Modular Monolith with Clear Bounded Contexts (DDD)**

**Decision: Single NestJS backend (modular monolith) with domain-driven bounded contexts**

**Rationale:**
- **MVP speed**: Simpler deployment, single codebase, easier debugging than microservices
- **DDD principles**: Bounded contexts (Shopping, Retailers, Optimization, Auth) modeled as NestJS modules
- **Future-proof**: Clear module boundaries enable extraction to microservices if needed (Phase 2+)
- **Cost efficiency**: Single Railway/Render deployment vs. orchestrating multiple services

**Bounded Contexts (NestJS Modules):**
1. **Shopping Context** (`apps/api/src/shopping`)
   - Aggregates: ShoppingList, Category, Item
   - Services: ListService, CategoryService, ItemMatchingService
   - Repositories: ListRepository, ItemRepository

2. **Retailer Context** (`apps/api/src/retailers`)
   - Aggregates: Retailer, ProductCatalogue, PriceSnapshot
   - Services: RetailerConfigService, DataAcquisitionService (Strategy pattern)
   - Repositories: RetailerRepository, PriceRepository

3. **Optimization Context** (`apps/api/src/optimization`)
   - Aggregates: OptimizationRequest, OptimizationResult, ThresholdNudge
   - Services: OptimizationEngine, PersonaService, TravelCostService
   - Domain logic: Category-level assignment, threshold calculations

4. **Crowdsourcing Context** (`apps/api/src/crowdsourcing`)
   - Aggregates: Submission, Contributor, ReputationScore
   - Services: SocialMonitoringService, OCRService, ConsensusValidationService
   - Repositories: SubmissionRepository, ContributorRepository

5. **Auth Context** (`apps/api/src/auth`)
   - Aggregates: User, Session, LoyaltyCard
   - Services: AuthService (Supabase integration), SessionService
   - Repositories: UserRepository

**Inter-Context Communication:**
- **Domain Events**: Use NestJS EventEmitter for decoupled communication
  - Example: `PriceUpdatedEvent` published by Retailer Context, consumed by Optimization Context
- **Shared Kernel**: Common value objects (Money, Distance, Percentage) in `packages/types`

---

## 4.3 Frontend Architecture

**Web (Next.js 15):**
- **App Router**: File-based routing (`app/dashboard/page.tsx`)
- **Server Components**: Default for data fetching (reduce client bundle)
- **Client Components**: Interactive UI (`'use client'` directive)
- **API Routes**: tRPC endpoints in `app/api/trpc/[trpc]/route.ts`
- **State Management**:
  - React Context + useReducer for global state (user, cart)
  - TanStack Query (React Query) for server state (caching, optimistic updates)
- **Forms**: React Hook Form + Zod validation

**Mobile (Expo React Native):**
- **Expo Router**: File-based routing matching Next.js (`app/dashboard.tsx`)
- **State Management**: Same as web (React Context + TanStack Query)
- **Native Modules**: Expo Camera, Expo Notifications, Expo Location
- **Offline Support**: WatermelonDB (SQLite wrapper with sync)

---

## 4.4 Database & Data Layer

**Primary Database: Supabase Postgres (hosted)**

**Rationale:**
- **Cost**: Free tier supports 500MB database, 2GB file storage
- **Features**: Built-in auth, real-time subscriptions, row-level security
- **Compatibility**: Standard Postgres (no vendor lock-in)

**ORM: Prisma**

**Rationale:**
- **Type safety**: Auto-generated TypeScript types from schema
- **Migrations**: Declarative schema with version-controlled migrations
- **Developer Experience**: Intuitive API

**Caching Layer: Redis (Upstash)**

**Use cases:**
- Session storage (JWT blacklist, rate limiting)
- Price cache (reduce database load, 24-hour TTL)
- Optimization results cache (5-minute TTL)

---

## 4.5 API Design

**Primary: tRPC (Type-safe RPC)**

**Rationale:**
- **End-to-end type safety**: Frontend gets TypeScript types auto-generated from backend procedures
- **No code generation**: Types inferred at compile time
- **Works in both Next.js and React Native**: Single API client

**tRPC Router Structure:**
```typescript
// apps/api/src/trpc/routers/
├── shopping.router.ts      // Shopping list CRUD, item management
├── retailers.router.ts     // Retailer config, price lookups
├── optimization.router.ts  // Optimize basket, get nudges
├── crowdsourcing.router.ts // Submit prices, reputation
└── auth.router.ts          // Login, register, logout
```

**Secondary: REST API (for external integrations)**

Use cases: Webhooks, third-party integrations, MCP server (Phase 3/4)

---

## 4.6 Authentication & Authorization

**Auth Provider: Supabase Auth**

**Rationale:**
- **Free tier**: Unlimited users
- **Features**: Email/password, magic links, social OAuth
- **Session management**: JWT tokens, refresh tokens

**Auth Flow:**
1. User signs up/logs in via Supabase Auth
2. Supabase returns JWT access token + refresh token
3. Frontend stores tokens in httpOnly cookies (web) or secure storage (React Native)
4. Backend validates JWT on each request (NestJS Guard)
5. Row-level security policies enforce data isolation

---

## 4.7 Testing Requirements

**Testing Pyramid: Unit + Integration + E2E**

**Unit Tests (70% coverage target):**
- **Framework**: Vitest (faster than Jest, ESM-native)
- **Scope**: Business logic, domain services, UI components
- **CI**: Run on every PR via `nx affected:test`

**Integration Tests (20% coverage target):**
- **Framework**: Vitest + Testcontainers (Postgres container)
- **Scope**: API endpoints, retailer adapters, optimization engine
- **CI**: Run on main branch commits

**E2E Tests (10% coverage target):**
- **Framework**: Playwright (web), Detox (React Native - Phase 1.5)
- **Scope**: Critical journeys (Onboarding → Add items → Optimize → Export)
- **CI**: Run on release candidates, nightly builds

---

## 4.8 Deployment & Infrastructure

**Hosting:**

| Service                   | Platform         | Tier          | Cost    |
| ------------------------- | ---------------- | ------------- | ------- |
| **Web (Next.js PWA)**     | Vercel           | Hobby (free)  | R0      |
| **API (NestJS)**          | Railway          | Starter ($5)  | R95     |
| **Database (Postgres)**   | Supabase         | Free tier     | R0      |
| **Redis (Cache)**         | Upstash          | Free tier     | R0      |
| **File Storage**          | Supabase Storage | Free (2GB)    | R0      |
| **OCR (Vision API)**      | GCP              | Pay-as-you-go | ~R50/mo |
| **Monitoring (Sentry)**   | Sentry           | Developer     | R0      |
| **Analytics (PostHog)**   | PostHog          | Free tier     | R0      |
| **Total (MVP)**           |                  |               | ~R150   |

**CI/CD:**
- **GitHub Actions**: Nx caching + affected commands
- **Pipeline**: Lint → Typecheck → Test → Build → Deploy
- **Preview deployments**: Vercel creates preview URL for every PR

---

## 4.9 Performance Requirements

**Web (Next.js PWA):**
- **Lighthouse score**: ≥90
- **Metrics**: FCP <2s, LCP <3s, TTI <4s, CLS <0.1 (on 3G)
- **Bundle size**: <300KB initial JS bundle (gzipped)

**API (NestJS):**
- **Response time**: p50 <200ms, p95 <500ms, p99 <1s
- **Throughput**: 100 req/s per instance

**Mobile (React Native):**
- **App size**: <50MB (iOS IPA, Android APK)
- **Startup time**: <2s on mid-range devices
- **Scroll performance**: 60 FPS

---

## 4.10 Security Requirements

**Application Security:**
- **HTTPS only**: Enforce TLS 1.3
- **CORS**: Restrict API to web/mobile origins only
- **Rate limiting**: 100 req/min per IP
- **Input validation**: Zod schemas for all API inputs
- **SQL injection prevention**: Prisma parameterized queries

**Authentication Security:**
- **Password hashing**: bcrypt (Supabase default)
- **JWT expiry**: Access token 15 min, refresh token 7 days
- **Token rotation**: Refresh tokens rotated on use

**Data Privacy (POPIA Compliance):**
- **Data residency**: Supabase EU region
- **PII encryption**: Encrypt loyalty card numbers at rest
- **Data retention**: Delete inactive users after 24 months
- **User consent**: POPIA-compliant consent flow at signup
- **Data export/deletion**: Users can download or delete their data

---
