## 3. High-Level Architecture Overview
```
┌───────────┐     ┌──────────────────┐     ┌──────────────────┐     ┌────────────────┐
│ Web Scrapers├──▶│  pg-boss Queue   ├──▶ │ Normalisation &   │──▶  │ Canonical       │
│ (Playwright│     │  (Supabase)      │     │ Matching Workers   │     │ Product Registry │
│  Workers)  │     └──────────────────┘     └──────────────────┘     │ (Postgres +     │
└─────▲──────┘                                                   ┌─┴────────────────┐
      │                                                           │ Prisma Client    │
      │                                                           │ & NestJS         │
      │                                                           └─▲─────┬─────────┘
┌─────┴────┐                                                    ┌──┴──┐  │
│ Scheduler│                                                    │ REST│  │
│ (Temporal│                                                    │/Graph│  │
│  /Cron)  │                                                    │  API │  │
└──────────┘                                                    └──▲──┘  │
                                                                   │     │
                   ┌──────────────────────────┐                    │     │
                   │ Frontend Web App (Next.js)│◀──────────────────┘     │
                   │ + BetterAuth SDK          │                          │
                   └──────────────┬───────────┘                          │
                                  │                                      │
                                  ▼                                      │
                        ┌──────────────────────┐   Receipts / Feedback   │
                        │ Supabase Storage /   │◀────────────────────────┘
                        │ CDN-backed downloads │
                        └──────────────────────┘
```
