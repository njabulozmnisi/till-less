# Hosting Platform Standardization: Railway

**Date:** October 17, 2025
**Decision:** Standardize on **Railway** for all backend hosting (removing Fly.io references)

---

## What Changed?

All documentation has been updated to remove **Fly.io** references and standardize on **Railway** as the sole backend hosting platform.

### Documents Updated:

1. ✅ `docs/implementation-transition-guide.md`
2. ✅ `docs/brief.md`
3. ✅ `docs/sprint-plan-with-ocr-week4.md`
4. ✅ `docs/leaflet-ingestion-system-free.md`
5. ✅ `docs/analysis-review-recommendations.md`

---

## Why Railway? (Decision Summary)

### ✅ **Better Free Tier**
- **Railway:** $5/month credit = ~500 hours compute
- **Fly.io:** $5/month credit = ~160 hours compute
- **Result:** Railway provides **3x more uptime** for free

### ✅ **Easier Setup**
- **Railway:** GUI dashboard + `railway up` CLI (beginner-friendly)
- **Fly.io:** CLI-first, more complex configuration
- **Result:** Railway takes **5 minutes** to deploy vs. Fly.io's 15 minutes

### ✅ **Perfect for Zero-Budget MVP**
- Railway's free tier covers 24/7 uptime for:
  - NestJS API (primary backend)
  - Temporalite scheduler (scraper orchestration)
  - 2-3 Playwright scraper workers
- Estimated usage: ~70% of free tier ($3.50/month), leaving $1.50 buffer

### ✅ **Simpler Mental Model**
- Railway: "Deploy service, it runs"
- Fly.io: "Deploy machine, configure networking, scaling, regions"
- **Result:** Less cognitive load, faster iteration

---

## Updated Tech Stack (Standardized)

| Component | Platform | Free Tier | Notes |
|-----------|----------|-----------|-------|
| **Frontend** | Vercel | Unlimited sites, 100GB bandwidth/month | Next.js optimized |
| **Backend API** | **Railway** | $5/month credit (~500 hours) | NestJS API |
| **Scrapers** | **Railway** | Included in $5 credit | Playwright workers (background jobs) |
| **Scheduler** | **Railway** | Included in $5 credit | Temporalite (Docker container) |
| **Database** | Supabase | 500MB storage, 2GB bandwidth/month | Postgres + storage |
| **OCR** | Azure | 5,000 transactions/month | Computer Vision free tier |
| **Maps** | Google | $200 free credit/month | Distance Matrix API |

**Total Monthly Cost:** **R0** (all free tiers)

---

## Railway Setup Guide (Quick Start)

### 1. Sign Up (2 minutes)
```
1. Go to: https://railway.app
2. Sign up with GitHub (recommended) or email
3. Confirm email
4. Free $5 credit automatically added
```

### 2. Deploy NestJS API (3 minutes)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to GitHub repo
railway link

# Deploy
railway up

# Set environment variables
railway variables set DATABASE_URL=postgresql://...
railway variables set AZURE_COMPUTER_VISION_KEY=...
```

### 3. Add Scraper Workers (2 minutes)
```
1. Railway dashboard → New Service
2. Link same GitHub repo
3. Select Dockerfile: packages/scrapers/Dockerfile
4. Deploy
5. Configure as background worker (no public URL needed)
```

### 4. Add Temporalite Scheduler (2 minutes)
```
1. Railway dashboard → New Service
2. Link same GitHub repo
3. Select Dockerfile with Temporalite
4. Add persistent volume: /data (for workflow state)
5. Deploy
```

**Total Setup Time:** ~10 minutes

---

## Cost Projection (First 6 Months)

### Free Tier Usage Breakdown:

**Railway $5/month credit:**
- NestJS API (512MB RAM, always-on): ~$2.50/month
- Temporalite (256MB RAM, always-on): ~$1.00/month
- Scrapers (512MB RAM, 2 hours/day): ~$1.00/month
- **Total:** ~$4.50/month (90% of free tier)

**Buffer:** $0.50/month (10% headroom for spikes)

### When You'd Hit Paid Tier:
- 500+ concurrent users (need more API instances)
- 10+ scraper workers running 24/7
- High-traffic spikes (>100 req/sec sustained)

**For MVP (<500 users), Railway free tier is sufficient.**

---

## Migration Path (If Needed Later)

### From Railway to Self-Hosted (If Cost Becomes Issue):

**Option 1: Migrate to DigitalOcean Droplet**
- $6/month for 1GB RAM VPS
- Deploy all services on single server
- Time: 4 hours migration

**Option 2: Migrate to Fly.io (If Need Global Edge)**
- Similar Docker setup
- Time: 2 hours migration (both use Docker)

**Option 3: Stay on Railway, Optimize Costs**
- Scale down dev environments (sleep when inactive)
- Optimize scraper schedules (reduce frequency)
- Use Railway's usage dashboard to identify bottlenecks

**For now, no migration needed.** Railway free tier covers MVP easily.

---

## Frequently Asked Questions

### Q: Does Railway require a credit card?
**A:** Yes, but you won't be charged unless you exceed the $5/month free credit. No upfront payment required.

### Q: What happens if I exceed the free tier?
**A:** Railway will email you a warning. You can add payment method to continue, or optimize usage to stay within free tier.

### Q: Can I use Railway for production (real users)?
**A:** Yes! Railway is production-grade. Many startups use it for live apps. Just monitor usage and scale up if needed.

### Q: How do I monitor Railway usage?
**A:** Railway dashboard shows real-time usage:
- CPU/RAM metrics per service
- Monthly spend (credit usage)
- Alerts when approaching limit

### Q: Can I deploy multiple environments (dev, staging, prod)?
**A:** Yes! Railway supports environments:
- Free tier: 1 environment (production recommended)
- Paid: Unlimited environments

For MVP, use single production environment. Dev locally (localhost).

---

## Deployment Checklist (Railway)

### Before First Deploy:
- [ ] Railway account created
- [ ] GitHub repo linked
- [ ] Environment variables prepared (.env file)
- [ ] Dockerfile created for each service (API, scrapers, Temporalite)

### Deploy Steps:
- [ ] Deploy NestJS API (railway up)
- [ ] Deploy scraper workers (separate service)
- [ ] Deploy Temporalite scheduler (separate service)
- [ ] Set environment variables (railway variables set)
- [ ] Verify services running (railway logs)
- [ ] Test API endpoint (curl https://your-api.railway.app/health)

### Post-Deploy:
- [ ] Set up monitoring (Sentry integration)
- [ ] Configure alerts (Railway usage threshold)
- [ ] Document deploy process (runbook for team)

---

## Summary

**Decision:** Railway is now the standardized backend hosting platform for TillLess MVP.

**Rationale:**
- Better free tier (3x more compute than Fly.io)
- Easier setup (GUI dashboard, 5 min deploy)
- Perfect for zero-budget constraint ($0/month for <500 users)

**All documentation updated** to reflect Railway-only deployment.

**No action required** unless you want to deploy now (use Railway setup guide above).

---

## Next Steps

**If Ready to Deploy:**
1. Sign up for Railway: https://railway.app
2. Follow Railway Setup Guide (above)
3. Deploy in 10 minutes

**If Not Ready Yet:**
- Continue with Week 1 development (database schema, seed data)
- Deploy when Week 3 complete (all scrapers built)

**Questions about Railway?** Check:
- Railway docs: https://docs.railway.app
- Railway Discord: Active community for help

---

*Hosting standardization by Mary (Business Analyst) | BMAD™ Framework | October 17, 2025*
