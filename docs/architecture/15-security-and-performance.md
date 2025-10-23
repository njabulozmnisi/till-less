# 15. Security and Performance

## 15.1 Security Measures

**Authentication:**
- Supabase Auth with JWT tokens
- Row-level security (RLS) on Postgres
- Encrypted loyalty card storage (AES-256-GCM)

**API Security:**
- tRPC middleware for auth checks
- Rate limiting (100 req/min per IP)
- CORS configuration (Vercel domain only)
- Input validation with Zod schemas

**Data Protection:**
- HTTPS everywhere (TLS 1.3)
- Secrets in Railway/Vercel env vars
- No secrets in git (`.env` in `.gitignore`)
- POPIA compliance (EU data residency)

## 15.2 Performance Optimizations

**Frontend:**
- React Server Components (reduce bundle)
- Lazy loading with `next/dynamic`
- Image optimization with `next/image`
- Route prefetching
- CSS bundle <50KB gzipped

**Backend:**
- Redis caching (5-min TTL for optimization)
- Database connection pooling
- Prisma query optimization
- Background jobs for scraping

**Target Metrics:**
- Lighthouse score: ≥90
- Optimization time: <2s
- API response: <500ms (p95)
