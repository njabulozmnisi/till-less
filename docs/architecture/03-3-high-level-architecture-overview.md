## 3. High-Level Architecture Overview
```
┌───────────┐     ┌──────────────────┐     ┌────────────────┐     ┌────────────────┐
│ Web Scrapers├──▶│ Ingestion Queue  ├──▶ │ Normalisation & │──▶  │ Canonical       │
│ (Playwright│     │ (RabbitMQ/SQS)   │     │ Matching Workers│     │ Product Registry │
│  Workers)  │     └──────────────────┘     └────────────────┘     │ (Postgres)       │
└─────▲──────┘                                                   ┌─┴────────────────┐
      │                                                           │ Optimisation     │
      │                                                           │ Service (Node)   │
      │                                                           └─▲─────┬─────────┘
┌─────┴────┐                                                    ┌──┴──┐  │
│ Scheduler│                                                    │ REST│  │
│ (Airflow │                                                    │/Graph│  │
│ /Cron)   │                                                    │  API │  │
└──────────┘                                                    └──▲──┘  │
                                                                   │     │
                   ┌──────────────────────────┐                    │     │
                   │ Frontend Web App (Next.js)│◀──────────────────┘     │
                   │ + Auth & Preferences      │                          │
                   └──────────────┬───────────┘                          │
                                  │                                      │
                                  ▼                                      │
                        ┌──────────────────────┐   Receipts / Feedback   │
                        │ Object Storage (S3 /│◀─────────────────────────┘
                        │ Supabase Storage)    │
                        └──────────────────────┘
```
