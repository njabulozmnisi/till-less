# TillLess - Smart Grocery Shopping Optimization

> **South Africa's first AI-powered grocery shopping CFO** — helping households save 8-12% on monthly grocery bills by finding the cheapest basket across multiple retailers while accounting for loyalty pricing and travel costs.

---

## 🎯 What is TillLess?

TillLess is a **personal shopping optimization platform** for South African households that:

- 📊 Analyzes your shopping list across **5 major retailers** (Checkers, Pick n Pay, Shoprite, Woolworths, Makro)
- 💰 Recommends the **cheapest complete basket** considering:
  - Base prices + loyalty card discounts
  - Travel costs (fuel/time to store)
  - User preferences (avoid certain stores, max travel time)
- 📈 Tracks **actual savings** via receipt reconciliation
- 🤖 Processes **leaflet specials** via OCR (Azure Computer Vision)

**Target:** 500 active users in Gauteng within 3 months post-launch
**MVP Goal:** 8%+ average savings validated via receipts
**Tech Stack:** Next.js, NestJS, Nx monorepo, Supabase Postgres, Railway hosting

---

## 🏗️ Monorepo Structure (Nx)

This project uses **Nx** for monorepo management with **pnpm** workspaces.

```
tillless/
├── apps/
│   ├── web/                 # Next.js 15 frontend (includes /admin routes)
│   ├── api/                 # NestJS backend API (Railway)
│   └── backend/             # Additional backend services
├── libs/
│   ├── database/            # Prisma schema + database client
│   ├── shared/              # Shared TypeScript types, utils, constants
│   ├── scrapers/            # Playwright scraper workers (Railway)
│   └── ocr/                 # Azure OCR + Tesseract services
├── docs/                    # All documentation
├── nx.json                  # Nx workspace configuration
├── package.json             # Root dependencies
└── pnpm-workspace.yaml      # pnpm workspaces config
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥20.0.0
- **pnpm** ≥9.0.0
- **PostgreSQL** (via Supabase free tier)

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/tillless.git
cd tillless

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials (Supabase, Azure, Google Maps API)

# Generate Prisma client
pnpm nx run database:prisma-generate

# Run database migrations


pnpm nx run database:prisma-migrate

r


# Seed database with sample products
pnpm nx run database:seed
```

### Development

```bash
# Run all apps in parallel (web + api)
pnpm dev

# Or run individually
pnpm nx serve web      # Frontend at http://localhost:3000
pnpm nx serve api      # Backend at http://localhost:3001

# Admin features accessible at http://localhost:3000/admin

# Build all projects
pnpm build

# Run tests
pnpm test

# Lint all projects
pnpm lint

# View dependency graph
pnpm nx graph
```

---

## 📦 Applications & Libraries

### Apps

| Name | Description | Tech Stack | Port | Deployment |
|------|-------------|------------|------|------------|
| **web** | User-facing frontend | Next.js 14, React, Tailwind CSS | 3000 | Vercel |
| **api** | Backend REST API | NestJS, Prisma, pg-boss | 3001 | Railway |
| **admin** | Admin panel (leaflet entry, OCR) | Next.js 14, React | 3002 | Vercel |

### Libraries

| Name | Description | Used By |
|------|-------------|---------|
| **database** | Prisma schema, migrations, DB client | All apps |
| **shared** | TypeScript types, utils, constants | All apps |
| **scrapers** | Playwright scraper workers | api |
| **ocr** | Azure OCR + Tesseract services | api, admin |
| **config** | Shared ESLint, Prettier, tsconfig | All apps/libs |

---

## 🔧 Common Nx Commands

```bash
# Run a specific target for a project
nx serve web              # Run web app in dev mode
nx build api              # Build api app
nx test shared            # Run tests for shared library
nx lint database          # Lint database library

# Run multiple projects in parallel
nx run-many --target=build --projects=web,api
nx run-many --target=test --all

# Run only affected projects (based on git changes)
nx affected --target=build
nx affected --target=test

# Visualize project dependencies
nx graph

# Generate new library
nx generate @nx/js:library my-new-lib --directory=libs/my-new-lib

# Generate new Next.js app
nx generate @nx/next:application my-app --directory=apps/my-app
```

---

## 🗄️ Database Setup (Prisma + Supabase)

### 1. Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Create new project:
   - **Name:** `tillless` or `tillless-dev`
   - **Region:** EU (Frankfurt or London - closest to South Africa)
   - **Database Password:** Save this securely
3. Wait ~2 minutes for provisioning
4. Navigate to: **Project Settings → Database**
5. Copy the **Connection String** (Transaction/Direct mode, port 5432)

### 2. Configure Environment Variables

Add to `.env`:
```bash
# Database connection with pooling optimization (Supabase free tier)
DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=5"
```

**Connection Format Notes:**
- Use `pgbouncer=true` for connection pooling
- Limit connections to 5 (Supabase free tier optimization)
- Do NOT use session pooler (port 6543) for migrations

### 3. Run Migrations

```bash
# Generate Prisma client (creates TypeScript types)
pnpm nx run database:prisma-generate

# Create and apply migration (development)
pnpm nx run database:prisma-migrate
# When prompted, name migration (e.g., "init")

# Deploy migration (production - Railway/CI)
pnpm nx run database:prisma-deploy

# Seed database (50 common SA products)
pnpm nx run database:seed
```

### 4. Verify Database Connection

After running migrations, check Supabase dashboard:
- Navigate to: **Table Editor**
- Verify tables exist: `users`, `retailers`, `stores`, `loyalty_programs`, `products`, `retailer_items`

**Monitoring:**
- Free tier limits: 500MB database, 1GB storage, 2GB bandwidth/month
- Monitor usage in Supabase dashboard → Usage
- Connection pooling reduces connection overhead

---

## 🔑 Environment Variables

Create a `.env` file in the root with:

```bash
# Database (Supabase)
DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres"

# Azure Computer Vision (OCR - Week 4)
AZURE_COMPUTER_VISION_KEY="your-azure-key"
AZURE_COMPUTER_VISION_ENDPOINT="https://your-endpoint.cognitiveservices.azure.com/"

# Google Maps API (Travel Distance)
GOOGLE_MAPS_API_KEY="your-google-maps-key"

# BetterAuth (Authentication)
BETTER_AUTH_SECRET="your-32-char-secret"
BETTER_AUTH_URL="http://localhost:3001/api/auth"

# Railway (Production)
RAILWAY_ENVIRONMENT="production"
```

---

## 🚢 Deployment

### Frontend (Vercel)

```bash
# Connect GitHub repo to Vercel
# Auto-deploys on push to main branch

# Manual deploy
nx build web
vercel deploy --prod
```

### Backend (Railway)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy API
nx build api
railway up

# Deploy scrapers (background worker)
nx build scrapers
railway up --service scrapers
```

### Environment Variables (Railway)

```bash
railway variables set DATABASE_URL=postgresql://...
railway variables set AZURE_COMPUTER_VISION_KEY=...
railway variables set GOOGLE_MAPS_API_KEY=...
```

---

## 📚 Documentation

- **[Project Brief](docs/brief.md)** - Executive summary, problem statement, solution overview
- **[Implementation Guide](docs/implementation-transition-guide.md)** - Full 9-week sprint plan with code examples
- **[Sprint Plan (OCR Week 4)](docs/sprint-plan-with-ocr-week4.md)** - Updated timeline with OCR automation
- **[Hosting Standardization](docs/hosting-railway-standardization.md)** - Railway setup guide
- **[Leaflet Ingestion (Free)](docs/leaflet-ingestion-system-free.md)** - Azure OCR vs Tesseract comparison
- **[Competitive Analysis](docs/competitor-analysis.md)** - Market research, Troli threat analysis

---

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests for specific project
nx test web
nx test api
nx test shared

# Run tests in watch mode
nx test web --watch

# Run tests with coverage
nx test api --codeCoverage
```

---

## 🎯 Sprint Plan Overview

### Sprint 1: Data Backbone (Weeks 1-3)
- Week 1: Infrastructure setup (Nx monorepo, Supabase, Prisma schema)
- Week 2: Scraper foundation (Checkers, PnP scrapers, pg-boss queue)
- Week 3: Scraper expansion (Woolworths, Shoprite, Makro) + **Leaflet manual entry**

### Sprint 2: Optimization Engine + Frontend (Weeks 4-6)
- Week 4: Optimization algorithm + **Azure OCR automation**
- Week 5: Shopping list input UI, results dashboard
- Week 6: User auth (BetterAuth), preferences

### Sprint 3: Feedback Loop + Launch (Weeks 7-9)
- Week 7: Receipt reconciliation
- Week 8: Savings dashboard, analytics
- Week 9: Production deployment, beta launch (20 users)

---

## 🤝 Contributing

This is an MVP project. Contributions welcome after initial launch (Week 9).

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

MIT License - see LICENSE file for details

---

## 💬 Support

- **Documentation Issues:** Open issue at https://github.com/yourusername/tillless/issues
- **Technical Questions:** Check `docs/` folder first
- **Nx Help:** https://nx.dev/getting-started/intro

---

## 🎉 Acknowledgments

- **Business Analysis:** BMAD™ Framework by Mary (Business Analyst)
- **Tech Stack Inspiration:** Vercel, Nx, NestJS communities
- **South African Retailers:** Checkers, Pick n Pay, Woolworths, Shoprite, Makro

---

**Built with ❤️ for South African households trying to stretch their Rands further.**

*Last Updated: October 17, 2025*
