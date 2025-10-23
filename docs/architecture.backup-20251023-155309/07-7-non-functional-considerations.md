## 7. Non-Functional Considerations
- **Performance**: Optimisation service caches canonical catalog snapshots per run; precomputes unit prices to reduce CPU load. Utilise worker pools with concurrency limits.
- **Scalability**: Separate ingestion and optimisation deployments; scale scrapers horizontally by retailer; API auto-scales on serverless platform (Render/Otterize) based on usage.
- **Reliability**: Retry failed scrapes with exponential backoff; maintain idempotency via content hashes; run nightly full refresh.
- **Security**: Enforce HTTPS; encrypt credentials using secrets manager (Supabase secrets or AWS Parameter Store); restrict receipt object storage with signed URLs.
- **Privacy**: Store minimal PII (email, loyalty selections). Provide user controls to delete account and receipts.
- **Compliance**: Include disclaimer on price variability; maintain polite scraping cadence (throttling, rotating User-Agents, obey robots guidance). Document data sources for legal review.
