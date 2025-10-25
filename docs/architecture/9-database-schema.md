# 9. Database Schema

## 9.1 Complete Prisma Schema

See Data Models section (4.1-4.3) for detailed schemas.

**Key Indexes:**
```prisma
@@index([productId, retailerId, snapshotDate]) // Price queries
@@index([userId, createdAt]) // User shopping lists
@@index([categoryId, level]) // Category hierarchy
@@index([shoppingListId, createdAt]) // Optimization results
```

**Encryption:**
```prisma
// Loyalty card numbers encrypted at application level
// using AES-256-GCM before storage
cardNumber String // Stored as base64-encoded ciphertext
```

## 9.2 Migration Strategy

**Initial Migration:** (`libs/database/prisma/migrations/001_init/migration.sql`)
- Creates all tables with proper constraints
- Seeds initial 5-8 Level 1 categories
- Seeds 200+ common SA products

**Seed Data:** (`libs/database/prisma/seed.ts`)
```typescript
const categories = [
  { name: 'Dairy & Eggs', level: 1, icon: '🥛' },
  { name: 'Fresh Produce', level: 1, icon: '🥬' },
  { name: 'Meat & Seafood', level: 1, icon: '🥩' },
  { name: 'Pantry Staples', level: 1, icon: '🍚' },
  { name: 'Beverages', level: 1, icon: '🧃' },
];
```
