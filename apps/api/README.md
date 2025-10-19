# TillLess API (Backend)

NestJS backend API for TillLess shopping optimization platform.

## Stack
- **Framework:** NestJS
- **Language:** TypeScript
- **Database:** Prisma ORM + Supabase Postgres
- **Queue:** pg-boss (Postgres-based job queue)
- **Auth:** BetterAuth integration

## Development

```bash
# Run dev server
nx serve api

# Build
nx build api

# Lint
nx lint api

# Test
nx test api
```

## Deployment
- **Platform:** Railway
- **Database:** Supabase Postgres
