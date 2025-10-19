# @tillless/database

Shared database library with Prisma schema, migrations, and database utilities.

## Contents
- Prisma schema (CPR tables, Leaflet tables, User tables)
- Database migrations
- Seed scripts (50 common SA products)
- Database client utilities

## Usage

```typescript
import { prisma } from '@tillless/database';

const products = await prisma.canonicalProduct.findMany();
```

## Development

```bash
# Generate Prisma client
nx run database:prisma-generate

# Create migration
nx run database:prisma-migrate

# Seed database
nx run database:seed
```

## Database
- **Provider:** Supabase Postgres
- **Free Tier:** 500MB storage, 2GB bandwidth/month
