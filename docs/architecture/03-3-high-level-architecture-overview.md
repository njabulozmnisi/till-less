## 3. High-Level Architecture Overview
```
┌───────────┐     ┌──────────────────┐     ┌──────────────────┐     ┌────────────────┐
│ Web Scrapers├──▶│  pg-boss Queue   ├──▶ │ Normalisation &   │──▶  │ Canonical       │
│ (Playwright│     │  (Supabase)      │     │ Matching Workers   │     │ Product Registry │
│  Workers)  │     └──────────────────┘     └──────────────────┘     │ (Postgres +     │
└─────▲──────┘                                                   ┌─┴────────────────┐
      │                                                           │ Prisma Client    │
      │                                                           │ & NestJS Backend │
      │                                                           └─▲─────┬─────────┘
┌─────┴────┐                                                    ┌──┴──┐  │
│ Scheduler│                                                    │ REST│  │
│ (Temporal│                                                    │/Graph│  │
│  /Cron)  │                                                    │  API │  │
└──────────┘                                                    └──▲──┘  │
                                                                   │     │
                   ┌──────────────────────────┐                    │     │
                   │ Frontend (Next.js)       │                    │     │
                   │ ├─ React + Redux + RTK Q │                    │     │
                   │ └─ BetterAuth SDK        │                    │     │
                   └──────────┬───────────────┘                    │     │
                              │                                    │     │
                              ▼                                    │     │
                   ┌──────────────────────────┐                    │     │
                   │ Next.js API Routes (BFF) │────────────────────┘     │
                   │ - Proxy to NestJS        │                          │
                   │ - Transform requests     │                          │
                   │ - Cache responses        │                          │
                   └──────────┬───────────────┘                          │
                              │                                          │
                              ▼                                          │
                   ┌──────────────────────────┐   Receipts / Feedback    │
                   │ Supabase Storage /       │◀─────────────────────────┘
                   │ CDN-backed downloads     │
                   └──────────────────────────┘
```
