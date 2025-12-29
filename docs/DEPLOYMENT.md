# TillLess Deployment Guide

This guide covers deploying the TillLess application to production environments using Vercel (frontend) and Railway (backend API).

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
4. [Backend Deployment (Railway)](#backend-deployment-railway)
5. [Database Migrations](#database-migrations)
6. [Health Checks & Monitoring](#health-checks--monitoring)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- GitHub repository with TillLess code
- Vercel account (free tier)
- Railway account (free tier)
- Supabase project with PostgreSQL database
- Sentry account (optional, for error tracking)

---

## Environment Variables

### Frontend (Vercel)

Configure these in **Vercel Dashboard → Project Settings → Environment Variables**:

```bash
# Auth API URL (production)
NEXT_PUBLIC_AUTH_URL=https://your-api.railway.app/api/auth

# Sentry (optional)
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### Backend (Railway)

Configure these in **Railway Dashboard → Project → Variables**:

```bash
# Database (Supabase - use pooler URL)
DATABASE_URL=postgresql://postgres.PROJECT_REF:PASSWORD@aws-1-eu-west-1.pooler.supabase.com:5432/postgres

# Authentication
BETTER_AUTH_SECRET=your-32-char-secret  # Generate: openssl rand -base64 32
BETTER_AUTH_URL=https://your-api.railway.app/api/auth

# Frontend URL (for CORS)
FRONTEND_URL=https://your-app.vercel.app

# Sentry (optional)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Node environment
NODE_ENV=production
PORT=3001
```

---

## Frontend Deployment (Vercel)

### Initial Setup

1. **Connect GitHub Repository**
   - Go to https://vercel.com/new
   - Import your GitHub repository: `njabulozmnisi/till-less`
   - Select your repository

2. **Configure Project Settings**
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `pnpm nx build web`
   - **Output Directory**: `dist/apps/web/.next`
   - **Install Command**: `pnpm install`

3. **Add Environment Variables**
   - Add the variables listed above in the Vercel dashboard
   - Set for **Production**, **Preview**, and **Development** environments

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically deploy on every push to `main` branch

### Vercel Configuration File

The project includes a `vercel.json` file at the root:

```json
{
  "buildCommand": "pnpm nx build web",
  "devCommand": "pnpm nx serve web",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "outputDirectory": "dist/apps/web/.next"
}
```

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to production
vercel --prod
```

---

## Backend Deployment (Railway)

### Initial Setup

1. **Create New Project**
   - Go to https://railway.app/new
   - Click "Deploy from GitHub repo"
   - Select your repository: `njabulozmnisi/till-less`

2. **Configure Build Settings**
   - **Root Directory**: Leave empty (monorepo root)
   - **Build Command**: `pnpm install && pnpm nx build api`
   - **Start Command**: `npx prisma migrate deploy --schema=libs/database/prisma/schema.prisma && node dist/apps/api/main.js`
   - **Watch Paths**: `apps/api/**`, `libs/**`

3. **Add Environment Variables**
   - Go to **Variables** tab
   - Add all variables listed in the Backend section above

4. **Enable Public Networking**
   - Go to **Settings** → **Networking**
   - Click "Generate Domain" to get a public URL (e.g., `your-api.railway.app`)

5. **Health Check**
   - Railway will automatically use `/api/health` endpoint
   - Configure in `railway.json` (already included)

### Railway Configuration File

The project includes a `railway.json` file at the root:

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm install && pnpm nx build api"
  },
  "deploy": {
    "startCommand": "npx prisma migrate deploy --schema=libs/database/prisma/schema.prisma && node dist/apps/api/main.js",
    "healthcheckPath": "/api/health",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### Manual Deployment

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up
```

---

## Database Migrations

Migrations are automatically applied on Railway deployment via the start command:

```bash
npx prisma migrate deploy --schema=libs/database/prisma/schema.prisma && node dist/apps/api/main.js
```

### Manual Migration

To manually run migrations in production:

```bash
# Via Railway CLI
railway run npx prisma migrate deploy --schema=libs/database/prisma/schema.prisma

# Or via environment variable
DATABASE_URL="your-supabase-url" npx prisma migrate deploy --schema=libs/database/prisma/schema.prisma
```

---

## Health Checks & Monitoring

### Health Check Endpoints

The API provides three health check endpoints:

1. **`GET /api/health`** - General health check with database status
   ```json
   {
     "status": "ok",
     "timestamp": "2025-12-29T12:00:00.000Z",
     "database": "connected",
     "uptime": 12345.67
   }
   ```

2. **`GET /api/health/ready`** - Readiness probe (app ready to serve traffic)
   ```json
   {
     "status": "ready",
     "timestamp": "2025-12-29T12:00:00.000Z"
   }
   ```

3. **`GET /api/health/live`** - Liveness probe (app is alive)
   ```json
   {
     "status": "alive",
     "timestamp": "2025-12-29T12:00:00.000Z"
   }
   ```

### Monitoring with Railway

Railway automatically monitors:
- Health check endpoint (`/api/health`)
- CPU & Memory usage
- Deployment logs
- Crash detection & auto-restart

### Monitoring with Vercel

Vercel automatically provides:
- Build logs
- Runtime logs
- Deployment analytics
- Error tracking (if Sentry configured)

---

## CI/CD Pipeline

### GitHub Actions Workflow

The project includes a CI workflow (`.github/workflows/ci.yml`) that runs on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

**Workflow Steps:**
1. Lint all projects (`pnpm nx run-many --target=lint --all`)
2. Type check all projects (`pnpm nx run-many --target=build --all`)
3. Run tests (`pnpm nx run-many --target=test --all`)
4. Upload coverage reports to Codecov

### Automatic Deployments

- **Vercel**: Auto-deploys on push to `main` branch
- **Railway**: Auto-deploys on push to `main` branch

### Branch Protection

Recommended branch protection rules for `main`:
- Require status checks to pass before merging
- Require CI workflow to pass
- Require pull request reviews
- Require linear history

---

## Troubleshooting

### Frontend Issues

**Problem**: Build fails on Vercel
**Solution**:
- Check build logs in Vercel dashboard
- Ensure `pnpm` version matches local (9.x)
- Verify all environment variables are set
- Run `pnpm nx build web` locally to test

**Problem**: API requests fail (CORS errors)
**Solution**:
- Verify `NEXT_PUBLIC_AUTH_URL` points to Railway API
- Check Railway API has `FRONTEND_URL` set correctly
- Ensure CORS is enabled in API (`apps/api/src/main.ts`)

### Backend Issues

**Problem**: Database connection fails
**Solution**:
- Verify `DATABASE_URL` in Railway variables
- Use Supabase **pooler** URL (not direct connection)
- Check Supabase project is running
- Test connection: `railway run npx prisma db execute --stdin`

**Problem**: Migrations fail on deployment
**Solution**:
- Check Railway deployment logs
- Ensure migrations are compatible with Supabase
- Run migrations manually: `railway run npx prisma migrate deploy`
- Verify `libs/database/prisma/schema.prisma` path is correct

**Problem**: Health check fails
**Solution**:
- Test endpoint: `curl https://your-api.railway.app/api/health`
- Check database connection in logs
- Verify `HealthModule` is imported in `AppModule`
- Check Railway health check timeout (300s default)

### CI/CD Issues

**Problem**: GitHub Actions CI fails
**Solution**:
- Check workflow logs in GitHub Actions tab
- Ensure all dependencies install correctly
- Verify test database is available (uses in-memory/mock DB)
- Run tests locally: `pnpm nx run-many --target=test --all`

**Problem**: Auto-deployment not working
**Solution**:
- Verify Vercel/Railway is connected to correct branch
- Check deployment logs for errors
- Ensure GitHub integration is active
- Re-link repository if needed

---

## Post-Deployment Checklist

- [ ] Frontend accessible at Vercel URL
- [ ] Backend API accessible at Railway URL
- [ ] Health check endpoint returns 200 OK
- [ ] Database migrations applied successfully
- [ ] Environment variables configured correctly
- [ ] CORS working between frontend and backend
- [ ] Authentication flow works end-to-end
- [ ] CI/CD pipeline runs successfully
- [ ] Error tracking configured (Sentry)
- [ ] Custom domain configured (optional)

---

## Support

For deployment issues:
- Check Railway/Vercel status pages
- Review deployment logs
- Test health check endpoints
- Verify environment variables

**Documentation:**
- Vercel: https://vercel.com/docs
- Railway: https://docs.railway.app
- Nx: https://nx.dev/recipes/deployment
