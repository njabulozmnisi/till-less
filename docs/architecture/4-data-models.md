# 4. Data Models

## 4.1 Core Domain Entities

**User**
```prisma
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  name          String?
  locationLat   Float?
  locationLng   Float?
  personaType   PersonaType @default(BALANCED)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  shoppingLists ShoppingList[]
  loyaltyCards  LoyaltyCard[]
  preferences   UserPreferences?
}

enum PersonaType {
  THRIFTY
  BALANCED
  PREMIUM_FRESH
  TIME_SAVER
}
```

**ShoppingList**
```prisma
model ShoppingList {
  id            String   @id @default(uuid())
  userId        String
  name          String
  totalBudget   Float?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  user          User     @relation(fields: [userId], references: [id])
  items         ShoppingListItem[]
  categoryBudgets CategoryBudget[]
}
```

**Product**
```prisma
model Product {
  id            String   @id @default(uuid())
  name          String
  barcode       String?  @unique
  categoryId    String
  brand         String?
  size          String?
  unit          String?
  createdAt     DateTime @default(now())
  
  category      Category @relation(fields: [categoryId], references: [id])
  prices        Price[]
}
```

**Category**
```prisma
model Category {
  id            String   @id @default(uuid())
  name          String
  slug          String   @unique
  level         Int      // 1, 2, or 2.5
  parentId      String?
  icon          String?
  
  parent        Category?  @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children      Category[] @relation("CategoryHierarchy")
  products      Product[]
}
```

**Retailer**
```prisma
model Retailer {
  id            String   @id @default(uuid())
  name          String
  slug          String   @unique
  logoUrl       String?
  websiteUrl    String
  enabled       Boolean  @default(true)
  dataSource    DataSource
  scrapingConfig Json?
  
  prices        Price[]
  loyaltyCards  LoyaltyCard[]
}

enum DataSource {
  WEB_SCRAPE
  API
  PDF
  MANUAL
  CROWDSOURCED
}
```

**Price**
```prisma
model Price {
  id            String   @id @default(uuid())
  productId     String
  retailerId    String
  price         Float
  loyaltyPrice  Float?
  inStock       Boolean  @default(true)
  source        DataSource
  confidence    Float    @default(1.0)
  snapshotDate  DateTime @default(now())
  
  product       Product  @relation(fields: [productId], references: [id])
  retailer      Retailer @relation(fields: [retailerId], references: [id])
  
  @@index([productId, retailerId, snapshotDate])
}
```

**LoyaltyCard**
```prisma
model LoyaltyCard {
  id            String   @id @default(uuid())
  userId        String
  retailerId    String
  cardNumber    String   // Encrypted
  cardType      String
  active        Boolean  @default(true)
  
  user          User     @relation(fields: [userId], references: [id])
  retailer      Retailer @relation(fields: [retailerId], references: [id])
  
  @@unique([userId, retailerId])
}
```

## 4.2 Optimization Domain

**OptimizationResult**
```prisma
model OptimizationResult {
  id                String   @id @default(uuid())
  shoppingListId    String
  totalSavings      Float
  baselineCost      Float
  optimizedCost     Float
  recommendedStores Json     // CategoryStoreAssignment[]
  travelCost        Float
  travelTime        Int      // minutes
  createdAt         DateTime @default(now())
  expiresAt         DateTime
  
  @@index([shoppingListId, createdAt])
}
```

## 4.3 TypeScript Interfaces

**CategoryStoreAssignment**
```typescript
interface CategoryStoreAssignment {
  categoryId: string;
  categoryName: string;
  retailerId: string;
  retailerName: string;
  itemCount: number;
  subtotal: Float;
  savings: Float;
  travelDistance: Float; // km
  travelTime: number; // minutes
}
```

**OptimizationRequest**
```typescript
interface OptimizationRequest {
  shoppingListId: string;
  personaType: PersonaType;
  maxStores?: number;
  maxTravelTime?: number; // minutes
  preferredRetailers?: string[];
  budgetConstraints?: CategoryBudget[];
}
```
