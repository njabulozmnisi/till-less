# 14. Deployment Architecture

## 14.1 Vercel (Frontend)

**Build Command:** `nx build web`
**Output Directory:** `dist/apps/web/.next`
**Environment Variables:**
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 14.2 Railway (Backend)

**Dockerfile:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/apps/api ./
CMD ["node", "main.js"]
```

**Environment Variables:**
- `DATABASE_URL`
- `REDIS_URL`
- `SUPABASE_JWT_SECRET`
- `GCP_VISION_API_KEY`

## 14.3 Infrastructure Cost Breakdown

| Service | Free Tier | Expected Usage | Monthly Cost |
|---------|-----------|----------------|--------------|
| Vercel | 100GB bandwidth | ~50GB | R0 |
| Railway | 500 hours, 512MB RAM | ~400 hours | R0 |
| Supabase | 500MB DB, 1GB storage | ~300MB | R0 |
| Upstash Redis | 10K commands/day | ~5K/day | R0 |
| GCP Vision | 1000 requests/month | ~500/month | R0 |
| Sentry | 5K errors/month | ~1K/month | R0 |
| **Total** | | | **~R0-150** |
