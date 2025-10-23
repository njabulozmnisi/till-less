## 11. Open Technical Questions
1. Should travel cost calculation rely on a third-party API (billing risk) or static rate table + OSRM self-hosted service?
2. What minimum viable manual review tooling is needed (versus building full admin console)?
3. How to balance Postgres costs with snapshot retention—partitioning vs. external cold storage?
4. Do we need real-time notifications (e.g., Slack, email) when massive promos appear, or is daily digest sufficient?
5. When should we migrate from Temporalite to managed Temporal Cloud to support HA/stateful upgrades?
6. What BetterAuth deployment model (single instance vs. multi-region) best supports future growth while staying free-tier friendly?
