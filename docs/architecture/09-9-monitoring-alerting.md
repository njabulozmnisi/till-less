## 9. Monitoring & Alerting
- Track ingestion job completion, queue depth, per-retailer SKU counts, last scrape timestamps.
- Monitor optimisation latency, error rates, and savings variance.
- Log user interactions for UX analytics (Matomo/self-hosted analytics to avoid high SaaS spend).
- Trigger alerts for: scrape failures >2 cycles, optimisation latency >25s (95th percentile), Postgres disk usage >80%.
