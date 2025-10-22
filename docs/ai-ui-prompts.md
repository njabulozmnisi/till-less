# AI UI Generation Prompts for TillLess

**Document Purpose:** This document contains comprehensive, copy-paste ready prompts for AI-driven frontend development tools (Vercel v0, Lovable.ai, Bolt.new, etc.) to scaffold TillLess UI components and pages.

**Generated:** 2025-10-22
**Based on:** `docs/front-end-spec.md` v2.0, `docs/architecture/frontend-architecture.md`, `docs/prd.md`

---

## Table of Contents

1. [Project Context & Global Instructions](#1-project-context--global-instructions)
2. [Component Prompts](#2-component-prompts)
   - [2.1 Dashboard (Home)](#21-dashboard-home)
   - [2.2 Shopping List Creator](#22-shopping-list-creator)
   - [2.3 Optimization Configuration](#23-optimization-configuration)
   - [2.4 Results Dashboard](#24-results-dashboard)
   - [2.5 Loyalty Card Management](#25-loyalty-card-management)
3. [Custom Component Prompts](#3-custom-component-prompts)
   - [3.1 CategoryCard Component](#31-categorycard-component)
   - [3.2 ThresholdNudge Component](#32-thresholdnudge-component)
   - [3.3 ItemRow Component](#33-itemrow-component)
4. [Usage Guidelines](#4-usage-guidelines)

---

## 1. Project Context & Global Instructions

### **Context (Include in ALL prompts):**

```markdown
**Project:** TillLess - Grocery Shopping Optimization Platform for South African Shoppers

**Tech Stack:**
- **Framework:** Next.js 15.1.3 (App Router, React Server Components)
- **React:** 18.3.1
- **TypeScript:** 5.7.2 (Strict mode)
- **Styling:** Tailwind CSS 3.4.17 with OKLCH color space
- **UI Library:** shadcn/ui (Radix UI primitives + Tailwind)
- **Icons:** Lucide React 0.469.0
- **Fonts:** Inter Variable (primary), JetBrains Mono Variable (monospace for prices)
- **Animation:** Framer Motion 11.15.0
- **Forms:** React Hook Form 7.54.2 + Zod 3.24.1
- **State Management:** Redux Toolkit 2.5.0 + RTK Query
- **Auth:** BetterAuth 1.0.7

**Design System (Tailwind v4 + OKLCH):**

```css
/* Color Variables */
--primary: oklch(65% 0.15 145);           /* Fresh Green - Savings */
--secondary: oklch(55% 0.12 200);         /* Deep Teal - Trust */
--accent: oklch(70% 0.15 55);             /* Warm Amber - Nudges */
--success: oklch(65% 0.15 145);
--warning: oklch(70% 0.15 55);
--error: oklch(60% 0.20 25);
--foreground: oklch(15% 0 0);             /* Near black */
--muted-foreground: oklch(50% 0 0);       /* Mid gray */
--border: oklch(90% 0 0);
```

**Typography:**
- Primary: `font-sans` (Inter Variable) for all UI text, headings, body
- Monospace: `font-mono tabular-nums` (JetBrains Mono Variable) for prices, numbers

**Key Design Principles:**
1. **Mobile-First**: Design for 375px mobile, enhance for tablet (768px+) and desktop (1024px+)
2. **WCAG AA Compliance**: All text must meet 4.5:1 contrast ratio minimum
3. **Touch Targets**: Minimum 44x44px on mobile (use `min-h-11` for shadcn buttons)
4. **Accessibility First**: Always include proper ARIA labels, semantic HTML, keyboard navigation
5. **South African Context**: Use "R" for Rand currency (e.g., "R 127.50" with space)
6. **Performance**: Use Next.js Image component, lazy load below-fold content, code splitting

**Constraints:**
- Use ONLY shadcn/ui components (do NOT install other UI libraries)
- All colors must use OKLCH format via Tailwind CSS variables
- All prices must use `font-mono tabular-nums` for alignment
- Include `prefers-reduced-motion` support for animations
- Never use deprecated React features (avoid defaultProps, componentWillMount, etc.)
```

---

## 2. Component Prompts

### 2.1 Dashboard (Home)

```markdown
## High-Level Goal
Create the TillLess Dashboard (home page) - a mobile-first responsive landing page that provides quick access to start a new optimization, repeat the last shop, view recent savings stats, and access account features.

## Detailed Step-by-Step Instructions

### File Structure
1. Create `apps/web/src/app/(auth)/dashboard/page.tsx` (Next.js App Router page)
2. Create `apps/web/src/components/features/dashboard/SavingsSummaryCard.tsx`
3. Create `apps/web/src/components/features/dashboard/RecentActivityFeed.tsx`
4. Create `apps/web/src/components/features/dashboard/DataFreshnessIndicator.tsx`

### Dashboard Page Layout (page.tsx)
1. Use Next.js App Router with `export default function DashboardPage()`
2. Fetch user's recent optimization data using RTK Query (mock data acceptable for initial build)
3. Render layout with:
   - **Hero Section** (mobile: full-width, desktop: max-w-7xl centered):
     - Page title `<h1>` "Welcome back, {userName}" (text-3xl md:text-4xl font-bold)
     - Two primary CTAs:
       - "Start New Optimization" (Button variant="default", size="lg", full-width on mobile, auto on desktop)
       - "Repeat Last Shop" (Button variant="outline", size="lg", secondary)
   - **SavingsSummaryCard** component (shows total savings to date, last shop stats)
   - **RecentActivityFeed** component (list of past shopping lists with quick actions)
   - **DataFreshnessIndicator** component (shows when retailer data was last updated)

### SavingsSummaryCard Component
1. Use shadcn/ui `Card`, `CardHeader`, `CardTitle`, `CardContent`
2. Display:
   - Large number: Total savings to date (use `font-mono tabular-nums text-4xl font-bold text-success`)
   - Format with Rand symbol: "R 1,234.50" (space after R)
   - Subtext: "Last month you saved R 237 at Checkers" (text-sm text-muted-foreground)
   - Optional: Use Framer Motion `CountUp` animation for savings number (0 → final value, 1s duration)
3. Responsive:
   - Mobile: Full-width card, p-6
   - Desktop: Half-width (grid-cols-1 md:grid-cols-2), p-8

### RecentActivityFeed Component
1. Use shadcn/ui `Card` with list of shopping lists
2. Each item shows:
   - List name (text-base font-semibold)
   - Date (text-sm text-muted-foreground, relative time like "2 days ago")
   - Item count (Badge with "24 items")
   - Savings (text-success font-mono, "Saved R 127")
   - Quick action: "View" or "Clone" button (Button variant="ghost" size="sm")
3. Limit to 5 most recent items
4. Mobile: Vertical stack, Desktop: 2-column grid

### DataFreshnessIndicator Component
1. Use shadcn/ui `Badge` with colored dot indicator
2. Logic:
   - Fresh (<2hr): Green dot + "Updated 1h ago"
   - Acceptable (2-6hr): Yellow dot + "Updated 4h ago"
   - Stale (>6hr): Red dot + "Updated 8h ago" + Alert message
3. Include Tooltip (shadcn/ui `Tooltip`) with exact timestamp on hover
4. Color dots using `before:` pseudo-element:
   ```tsx
   <Badge className="before:w-2 before:h-2 before:rounded-full before:bg-green-500">
   ```

### Accessibility Requirements
- Semantic HTML: `<main>`, `<section>`, `<h1>` for page title
- All buttons have visible labels (no icon-only without `aria-label`)
- Focus indicators: Use `focus-visible:ring-2 focus-visible:ring-primary`
- Keyboard navigation: Tab through CTAs, activity items
- Screen reader: "Skip to main content" link at top

### Responsive Behavior
- **Mobile (< 768px)**: Single column, stacked cards, full-width CTAs, bottom-aligned actions
- **Tablet (768px - 1023px)**: 2-column grid for savings + activity, horizontal nav
- **Desktop (≥1024px)**: Max-width container (max-w-7xl), 3-column layout for stats, sidebar nav

### Data Structure (Mock)
```typescript
interface DashboardData {
  user: { name: string; totalSavings: number }
  recentOptimizations: {
    id: string
    listName: string
    date: string
    itemCount: number
    savings: number
    retailer: string
  }[]
  dataFreshness: { lastUpdated: Date; retailer: string }[]
}
```

## Code Examples, Data Structures & Constraints

**API Endpoint (RTK Query):**
```typescript
// store/api/dashboardApi.ts
export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardData: builder.query<DashboardData, void>({
      query: () => '/api/dashboard',
      providesTags: ['Dashboard'],
    }),
  }),
})
```

**Tailwind Classes (Mobile-First):**
```tsx
// Hero section
<section className="px-4 py-8 md:px-8 lg:py-12">
  <h1 className="text-3xl md:text-4xl font-bold mb-4">Welcome back, Thandi</h1>
  <div className="flex flex-col md:flex-row gap-4">
    <Button className="w-full md:w-auto">Start New Optimization</Button>
    <Button variant="outline" className="w-full md:w-auto">Repeat Last Shop</Button>
  </div>
</section>

// Savings card
<Card className="p-6 md:p-8">
  <CardHeader>
    <CardTitle>Total Savings</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="font-mono tabular-nums text-4xl font-bold text-success">
      R 1,234.50
    </p>
    <p className="text-sm text-muted-foreground mt-2">
      Last month you saved R 237 at Checkers
    </p>
  </CardContent>
</Card>
```

**Do NOT:**
- Use external UI libraries (MUI, Ant Design, etc.) - only shadcn/ui
- Use `px` for font sizes - always use Tailwind rem classes (text-base, text-lg, etc.)
- Hardcode colors - always use OKLCH variables (bg-primary, text-success, etc.)
- Create non-responsive layouts - always mobile-first with md:, lg: breakpoints

## Define Strict Scope

**Files to CREATE:**
- `apps/web/src/app/(auth)/dashboard/page.tsx`
- `apps/web/src/components/features/dashboard/SavingsSummaryCard.tsx`
- `apps/web/src/components/features/dashboard/RecentActivityFeed.tsx`
- `apps/web/src/components/features/dashboard/DataFreshnessIndicator.tsx`
- `apps/web/src/store/api/dashboardApi.ts` (RTK Query endpoints)

**Files to MODIFY (if needed):**
- `apps/web/src/store/api/baseApi.ts` (add dashboard tag)

**Files to LEAVE UNTOUCHED:**
- All other page components
- Layout files (layout.tsx)
- Any existing components not listed above
- Store slices (authSlice, uiSlice, etc.)

**Testing Requirements:**
- Add basic Playwright E2E test in `tests/e2e/dashboard.spec.ts`
- Test: Page loads, CTAs are clickable, savings number renders, recent activity shows ≤5 items
```

---

### 2.2 Shopping List Creator

```markdown
## High-Level Goal
Create the Shopping List Creator page - a mobile-optimized form interface that allows users to build their shopping list via manual entry or CSV import, with inline validation and smart suggestions.

## Detailed Step-by-Step Instructions

### File Structure
1. Create `apps/web/src/app/(auth)/lists/new/page.tsx`
2. Create `apps/web/src/components/features/shopping-lists/ShoppingListForm.tsx`
3. Create `apps/web/src/components/features/shopping-lists/ItemInputRow.tsx`
4. Create `apps/web/src/components/features/shopping-lists/CSVImportDialog.tsx`
5. Create Zod validation schema in `apps/web/src/lib/validators/shoppingListSchema.ts`

### Shopping List Page (page.tsx)
1. Use Next.js App Router, server component wrapper
2. Include breadcrumb navigation: "Dashboard > My Lists > Create New List"
3. Render `ShoppingListForm` component in centered container (max-w-4xl)
4. Include sticky bottom action bar on mobile with "Save Draft" and "Run Optimization" buttons

### ShoppingListForm Component
1. Use React Hook Form with Zod validation:
   ```typescript
   const form = useForm<ShoppingList>({
     resolver: zodResolver(shoppingListSchema),
     defaultValues: { name: '', items: [] },
   })
   ```
2. Form fields:
   - **List Name** (Input, required, max 100 chars, autofocus)
   - **Item List** (Dynamic array of ItemInputRow components)
   - **Bulk Actions Bar**: CSV Import button, Paste from clipboard, Clear all
3. Keyboard shortcuts:
   - Enter in last item → Add new item row
   - Cmd/Ctrl + S → Save draft
4. Auto-save to localStorage every 30 seconds (prevent data loss)
5. Validation:
   - List name required
   - Minimum 3 items to run optimization
   - Each item needs: name (required), quantity (number >0), unit (g/kg/ml/L/pcs)

### ItemInputRow Component
1. Single row with 4 inline inputs (mobile: stacked, desktop: flex row):
   - **Product Name** (Input with autocomplete, shows previously used items)
   - **Quantity** (Input type="number", min=0.01)
   - **Unit** (Select: g, kg, ml, L, pcs, boxes)
   - **Brand Preference** (Input, optional, placeholder="Optional")
   - **Delete button** (Button variant="ghost" size="icon" with TrashIcon, aria-label="Delete item")
2. Validation errors show inline below each field (text-sm text-error)
3. Responsive:
   - Mobile: 2-column grid (name + quantity on row 1, unit + brand on row 2, delete bottom-right)
   - Desktop: 5-column flex row (name, quantity, unit, brand, delete)

### CSVImportDialog Component
1. Use shadcn/ui `Dialog` with file upload:
   ```tsx
   <Dialog>
     <DialogTrigger asChild>
       <Button variant="outline">Import CSV</Button>
     </DialogTrigger>
     <DialogContent>
       <DialogHeader>
         <DialogTitle>Import Shopping List</DialogTitle>
         <DialogDescription>Upload a CSV file (max 2MB)</DialogDescription>
       </DialogHeader>
       {/* File dropzone */}
       <DialogFooter>
         <Button variant="outline">Download Template</Button>
         <Button>Import</Button>
       </DialogFooter>
     </DialogContent>
   </Dialog>
   ```
2. CSV format: `name,quantity,unit,brand` (header row required)
3. Validation:
   - File size <2MB
   - Valid CSV format
   - Parse errors show line numbers (e.g., "Row 5: Missing quantity")
4. Preview table before confirming import (show first 10 rows)

### Accessibility Requirements
- Form labels: All inputs have visible `<label>` (not just placeholder)
- Error messages: Associate errors with inputs using `aria-describedby`
- Required fields: Mark with `*` and `aria-required="true"`
- Focus management: After adding item, focus moves to new item name input
- Screen reader: Announce "X items added" after CSV import

### Responsive Behavior
- **Mobile**: Single column, stacked item rows, sticky bottom action bar with full-width buttons
- **Tablet**: 2-column layout for item grid (name+quantity, unit+brand)
- **Desktop**: Full 5-column layout, sidebar with quick stats (item count, estimated time)

## Code Examples, Data Structures & Constraints

**Zod Schema:**
```typescript
// lib/validators/shoppingListSchema.ts
import { z } from 'zod'

export const shoppingListItemSchema = z.object({
  name: z.string().min(1, 'Product name required').max(100),
  quantity: z.number().positive('Quantity must be greater than 0'),
  unit: z.enum(['g', 'kg', 'ml', 'L', 'pcs', 'boxes']),
  brand: z.string().max(50).optional(),
})

export const shoppingListSchema = z.object({
  name: z.string().min(1, 'List name required').max(100),
  items: z.array(shoppingListItemSchema).min(3, 'Add at least 3 items to optimize'),
})

export type ShoppingList = z.infer<typeof shoppingListSchema>
```

**RTK Query Mutation:**
```typescript
// store/api/listsApi.ts
export const listsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createList: builder.mutation<{ id: string }, ShoppingList>({
      query: (list) => ({
        url: '/api/lists',
        method: 'POST',
        body: list,
      }),
      invalidatesTags: ['Lists'],
    }),
  }),
})
```

**Do NOT:**
- Use uncontrolled inputs (always use React Hook Form register)
- Submit form without validation
- Allow empty or invalid items in the list
- Use file upload without size/type validation
- Create custom CSV parser (use papaparse or similar library)

## Define Strict Scope

**Files to CREATE:**
- `apps/web/src/app/(auth)/lists/new/page.tsx`
- `apps/web/src/components/features/shopping-lists/ShoppingListForm.tsx`
- `apps/web/src/components/features/shopping-lists/ItemInputRow.tsx`
- `apps/web/src/components/features/shopping-lists/CSVImportDialog.tsx`
- `apps/web/src/lib/validators/shoppingListSchema.ts`

**Dependencies to ADD (if not present):**
```json
"papaparse": "^5.4.1",
"@types/papaparse": "^5.3.14"
```

**Files to LEAVE UNTOUCHED:**
- Dashboard page
- Optimization results pages
- Any global layouts
```

---

### 2.3 Optimization Configuration

```markdown
## High-Level Goal
Create the Optimization Configuration screen - where users customize their optimization parameters (loyalty cards, store preferences, travel cost) before running the optimization algorithm.

## Detailed Step-by-Step Instructions

### File Structure
1. Create `apps/web/src/app/(auth)/optimization/configure/page.tsx`
2. Create `apps/web/src/components/features/optimization/LoyaltyCardToggles.tsx`
3. Create `apps/web/src/components/features/optimization/StorePreferences.tsx`
4. Create `apps/web/src/components/features/optimization/TravelCostEstimator.tsx`

### Configuration Page (page.tsx)
1. Receive shopping list ID via query param or route param
2. Fetch user's saved preferences (loyalty cards, max stores, max distance)
3. Use React Hook Form for configuration form
4. Include progress stepper showing: "List Complete → **Configure** → Running → Results"
5. Bottom action bar: "Back to Edit List" (secondary), "Find Best Prices" (primary, disabled until valid config)

### LoyaltyCardToggles Component
1. Display all available South African retailer loyalty programs:
   - Checkers Xtra Savings
   - Pick n Pay Smart Shopper
   - Woolworths WRewards
   - Makro mCard
2. For each program, show:
   - Retailer logo (32x32px, rounded)
   - Program name (text-base font-semibold)
   - Card number (masked, e.g., "****1234", text-sm text-muted-foreground)
   - Toggle switch (shadcn/ui `Switch` component)
   - Last verified date (text-xs text-muted-foreground, "Verified 2 weeks ago")
3. Warning badge if card not verified in >90 days (Badge variant="warning", "Needs verification")
4. "Add New Card" button at bottom (Button variant="outline")

### StorePreferences Component
1. **Max Number of Stores** (Slider, 1-3 stores):
   ```tsx
   <div>
     <label className="text-sm font-medium">Max stores to visit</label>
     <Slider
       min={1}
       max={3}
       step={1}
       value={[maxStores]}
       onValueChange={([value]) => setMaxStores(value)}
       className="mt-2"
     />
     <p className="text-sm text-muted-foreground mt-1">
       {maxStores === 1 ? 'Single store (simplest)' : `Up to ${maxStores} stores`}
     </p>
   </div>
   ```
2. **Max Travel Distance** (Slider, 5km - 30km, 5km increments):
   - Show estimated fuel cost based on distance (calculated: distance * 2 * R15/km)
   - Update in real-time as slider moves
3. **Store Exclusions** (Optional, checkboxes to exclude specific retailers)

### TravelCostEstimator Component
1. Calculate estimated travel cost:
   - Input: User's home location (fetch from preferences, default: Johannesburg central)
   - Display: "Estimated travel cost: R 45 (15km round trip)"
2. Show map or list of nearby stores with distances:
   - Checkers: 3.2km
   - Pick n Pay: 5.8km
   - Woolworths: 7.1km
3. Option to update home location (Button variant="ghost", "Change location")

### Accessibility Requirements
- All form controls have visible labels
- Sliders have `aria-valuemin`, `aria-valuemax`, `aria-valuenow`
- Toggle switches have `aria-label` (e.g., "Enable Checkers Xtra Savings card")
- Keyboard navigation: Tab through all interactive elements
- Focus indicators on all controls

### Responsive Behavior
- **Mobile**: Single column, full-width sliders, stacked loyalty card toggles, bottom sticky action bar
- **Tablet**: 2-column layout (loyalty cards on left, preferences on right)
- **Desktop**: 3-column layout with sidebar showing live preview of selected config

## Code Examples, Data Structures & Constraints

**Form State:**
```typescript
interface OptimizationConfig {
  listId: string
  loyaltyCards: { retailerId: string; enabled: boolean }[]
  maxStores: number // 1-3
  maxDistance: number // km, 5-30
  travelCostPerKm: number // R/km, default 15
  excludedRetailers: string[]
}
```

**RTK Query:**
```typescript
export const optimizationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    runOptimization: builder.mutation<OptimizationResult, OptimizationConfig>({
      query: (config) => ({
        url: '/api/optimization/run',
        method: 'POST',
        body: config,
      }),
    }),
  }),
})
```

**Do NOT:**
- Allow optimization to run with no loyalty cards enabled
- Show retailer options for retailers user hasn't added cards for
- Use hardcoded travel costs (fetch from API or user preferences)
- Forget to persist config choices for next time

## Define Strict Scope

**Files to CREATE:**
- `apps/web/src/app/(auth)/optimization/configure/page.tsx`
- `apps/web/src/components/features/optimization/LoyaltyCardToggles.tsx`
- `apps/web/src/components/features/optimization/StorePreferences.tsx`
- `apps/web/src/components/features/optimization/TravelCostEstimator.tsx`

**Files to MODIFY:**
- `apps/web/src/store/api/optimizationApi.ts` (add runOptimization mutation)
- `apps/web/src/store/slices/optimizationSlice.ts` (save config to Redux)

**Files to LEAVE UNTOUCHED:**
- Shopping list pages
- Dashboard
- Results pages
```

---

### 2.4 Results Dashboard

```markdown
## High-Level Goal
Create the Optimization Results Dashboard - the most critical UX moment where users see their recommended store, total savings, itemized price breakdown, and can review substitutions.

## Detailed Step-by-Step Instructions

### File Structure
1. Create `apps/web/src/app/(auth)/optimization/results/[id]/page.tsx`
2. Create `apps/web/src/components/features/optimization/WinnerCard.tsx`
3. Create `apps/web/src/components/features/optimization/StoreComparisonSection.tsx`
4. Create `apps/web/src/components/features/optimization/ItemizedBreakdownTable.tsx`
5. Create `apps/web/src/components/features/optimization/SubstitutionReviewModal.tsx`

### Results Page (page.tsx)
1. Fetch optimization result via RTK Query using route param `[id]`
2. Loading state: Show skeleton cards with pulse animation
3. Layout sections (mobile: stacked, desktop: grid):
   - **WinnerCard** (hero section)
   - **StoreComparisonSection** (collapsible)
   - **ItemizedBreakdownTable** (desktop: table, mobile: cards)
   - **Export Actions** (footer)

### WinnerCard Component
1. Use shadcn/ui `Card` with large prominent display:
   - Retailer logo (96x96px, centered, mobile: top, desktop: left)
   - Store name (text-3xl md:text-4xl font-bold)
   - Total cost (font-mono tabular-nums text-5xl font-bold, "R 1,234.50")
   - Savings amount and percentage (text-success, "You saved R 237 (16%)")
   - Travel cost breakdown (text-sm text-muted-foreground, "Est. travel: R 30 (10km)")
   - Data freshness badge (Badge, "Prices updated 2h ago")
2. Celebratory animation on load:
   - Use Framer Motion to animate savings number counting up (0 → final value, 1s)
   - Confetti effect (optional, subtle green particles)
3. Responsive:
   - Mobile: Full-width card, vertical layout, p-6
   - Desktop: Max-width card centered, horizontal layout with logo left, p-8

### StoreComparisonSection Component
1. Use shadcn/ui `Collapsible` (collapsed by default):
   ```tsx
   <Collapsible>
     <CollapsibleTrigger asChild>
       <Button variant="ghost">
         Compare with other stores <ChevronDown />
       </Button>
     </CollapsibleTrigger>
     <CollapsibleContent>
       {/* Comparison cards */}
     </CollapsibleContent>
   </Collapsible>
   ```
2. Show top 3 alternative stores:
   - Store name, total cost, savings vs. winner, distance
   - "Switch to this store" button (instantly swaps winner without re-running optimization)
3. Each store card uses `Card` with hover effect (hover:shadow-lg transition)

### ItemizedBreakdownTable Component
1. Desktop: Use shadcn/ui `Table` with sortable columns:
   ```tsx
   <Table>
     <TableHeader>
       <TableRow>
         <TableHead>Item</TableHead>
         <TableHead>Your List</TableHead>
         <TableHead>Winning Price</TableHead>
         <TableHead>Unit Price</TableHead>
         <TableHead>Promo</TableHead>
         <TableHead>Alternatives</TableHead>
       </TableRow>
     </TableHeader>
     <TableBody>
       {items.map(item => (
         <TableRow key={item.id}>
           <TableCell>{item.name}</TableCell>
           <TableCell className="font-mono tabular-nums">R {item.requestedPrice}</TableCell>
           <TableCell className="font-mono tabular-nums text-success">R {item.winningPrice}</TableCell>
           <TableCell className="font-mono tabular-nums text-sm text-muted-foreground">
             R {item.unitPrice}/{item.unit}
           </TableCell>
           <TableCell>
             {item.promo && <Badge variant="warning">{item.promo}</Badge>}
           </TableCell>
           <TableCell>
             {item.hasSubstitution && (
               <Button variant="ghost" size="sm">Review</Button>
             )}
           </TableCell>
         </TableRow>
       ))}
     </TableBody>
   </Table>
   ```
2. Mobile: Transform to card stack:
   ```tsx
   <div className="md:hidden space-y-4">
     {items.map(item => (
       <Card key={item.id} className="p-4">
         <div className="flex justify-between items-start">
           <div>
             <p className="font-semibold">{item.name}</p>
             <p className="text-sm text-muted-foreground">{item.quantity} {item.unit}</p>
           </div>
           <p className="font-mono tabular-nums font-semibold text-success">R {item.winningPrice}</p>
         </div>
         {item.promo && <Badge className="mt-2">{item.promo}</Badge>}
         {item.hasSubstitution && (
           <Button variant="outline" size="sm" className="mt-2 w-full">Review Substitution</Button>
         )}
       </Card>
     ))}
   </div>
   ```
3. Filtering:
   - "Show only items with substitutions" (Checkbox filter)
   - "Show only promo items" (Checkbox filter)
   - "Sort by: Savings" (Select dropdown)

### SubstitutionReviewModal Component
1. Use shadcn/ui `Dialog` with side-by-side comparison:
   ```tsx
   <Dialog>
     <DialogContent className="max-w-3xl">
       <DialogHeader>
         <DialogTitle>Review Substitution</DialogTitle>
         <DialogDescription>Original item not available</DialogDescription>
       </DialogHeader>
       <div className="grid md:grid-cols-2 gap-4">
         {/* Original Product Card */}
         <Card className="p-4 opacity-60">
           <CardHeader>
             <CardTitle className="text-sm text-muted-foreground">Original (unavailable)</CardTitle>
           </CardHeader>
           <CardContent>
             <p className="font-semibold">{original.name}</p>
             <p className="text-sm">{original.size}</p>
             <p className="font-mono tabular-nums line-through">R {original.price}</p>
           </CardContent>
         </Card>
         {/* Substitute Product Card */}
         <Card className="p-4 border-primary">
           <CardHeader>
             <CardTitle className="text-sm text-primary">Suggested Substitute</CardTitle>
           </CardHeader>
           <CardContent>
             <p className="font-semibold">{substitute.name}</p>
             <p className="text-sm">{substitute.size}</p>
             <p className="font-mono tabular-nums text-success">R {substitute.price}</p>
             <Badge className="mt-2">Better unit price</Badge>
           </CardContent>
         </Card>
       </div>
       <div className="mt-4 p-4 bg-muted rounded-md">
         <p className="text-sm font-medium">Why this substitute?</p>
         <p className="text-sm text-muted-foreground mt-1">{substitutionRationale}</p>
       </div>
       <div className="mt-4 p-4 bg-accent-light rounded-md flex items-start gap-2">
         <AlertTriangle className="h-5 w-5 text-accent" />
         <div>
           <p className="text-sm font-medium">Impact on total cost</p>
           <p className="text-sm text-muted-foreground">
             Accepting this substitute will {impactDirection} your total by R {impactAmount}
           </p>
         </div>
       </div>
       <DialogFooter>
         <Button variant="outline">Mark as Must-Have Original</Button>
         <Button variant="default">Accept Substitute</Button>
       </DialogFooter>
     </DialogContent>
   </Dialog>
   ```
2. Handle actions:
   - Accept: Update optimization result, close modal
   - Reject: Mark item as "must have", offer to re-run optimization
3. Show confidence indicator (Progress bar, High/Medium/Low)

### Export Actions
1. Bottom action bar with:
   - "Download PDF" (Button with DownloadIcon)
   - "Email Plan" (Button with MailIcon)
   - "Save to History" (Button variant="outline")
   - "Remind me to upload receipt" (Checkbox + DatePicker)
2. Use shadcn/ui `DropdownMenu` for export options on mobile (consolidated)

### Accessibility Requirements
- Table: Use proper `<th scope="col">` for headers
- Sortable columns: Include `aria-sort` attributes
- Substitution modal: Trap focus within dialog, Escape to close
- Export actions: Keyboard accessible (Enter/Space to activate)
- Screen reader: Announce savings amount on page load

### Responsive Behavior
- **Mobile**: Stacked layout, card-based item display, bottom sticky action bar, full-screen modal
- **Tablet**: 2-column layout for winner + comparison, table view with horizontal scroll
- **Desktop**: 3-column layout with sidebar, full table view, centered modals (max-w-3xl)

## Code Examples, Data Structures & Constraints

**Data Structure:**
```typescript
interface OptimizationResult {
  id: string
  winningStore: {
    retailerId: string
    name: string
    logo: string
    totalCost: number
    savings: number
    savingsPercent: number
    travelCost: number
    distance: number
  }
  alternativeStores: {
    retailerId: string
    name: string
    totalCost: number
    savingsDiff: number
    distance: number
  }[]
  items: {
    id: string
    name: string
    quantity: number
    unit: string
    requestedPrice: number
    winningPrice: number
    unitPrice: number
    promo?: string
    hasSubstitution: boolean
    substitution?: {
      original: Product
      substitute: Product
      rationale: string
      confidence: 'high' | 'medium' | 'low'
    }
  }[]
  dataFreshness: { retailer: string; lastUpdated: Date }[]
}
```

**Do NOT:**
- Show prices without Rand symbol (R)
- Use non-monospaced fonts for prices (breaks alignment)
- Allow substitution acceptance without showing impact
- Forget to handle "no substitutions needed" case

## Define Strict Scope

**Files to CREATE:**
- `apps/web/src/app/(auth)/optimization/results/[id]/page.tsx`
- `apps/web/src/components/features/optimization/WinnerCard.tsx`
- `apps/web/src/components/features/optimization/StoreComparisonSection.tsx`
- `apps/web/src/components/features/optimization/ItemizedBreakdownTable.tsx`
- `apps/web/src/components/features/optimization/SubstitutionReviewModal.tsx`

**Files to MODIFY:**
- `apps/web/src/store/api/optimizationApi.ts` (add getOptimizationResult query)

**Files to LEAVE UNTOUCHED:**
- Configuration page
- Dashboard
- Shopping list pages
```

---

### 2.5 Loyalty Card Management

```markdown
## High-Level Goal
Create the Loyalty Card Management page - where users add, verify, and manage their South African retailer loyalty cards to unlock accurate pricing and promotions.

## Detailed Step-by-Step Instructions

### File Structure
1. Create `apps/web/src/app/(auth)/account/loyalty-cards/page.tsx`
2. Create `apps/web/src/components/features/account/LoyaltyCardGrid.tsx`
3. Create `apps/web/src/components/features/account/AddCardDialog.tsx`
4. Create `apps/web/src/components/features/account/VerifyCardDialog.tsx`

### Loyalty Cards Page (page.tsx)
1. Breadcrumb: "Account > Loyalty Cards"
2. Page header with title "Loyalty Cards" and description "Manage your retailer loyalty programs"
3. Render `LoyaltyCardGrid` component
4. "Add New Card" button (Button variant="default", floating action button on mobile)

### LoyaltyCardGrid Component
1. Display user's saved loyalty cards in responsive grid:
   - Mobile: 1 column (full-width cards)
   - Tablet: 2 columns
   - Desktop: 3 columns
2. Each card shows:
   ```tsx
   <Card className="p-6 hover:shadow-md transition-shadow">
     <CardHeader className="flex flex-row items-center justify-between p-0 mb-4">
       <div className="flex items-center gap-3">
         <img src={card.retailerLogo} alt="" className="h-12 w-12 rounded-full" />
         <div>
           <CardTitle className="text-base">{card.programName}</CardTitle>
           <p className="text-sm text-muted-foreground">{card.retailerName}</p>
         </div>
       </div>
       <Switch
         checked={card.enabled}
         onCheckedChange={(enabled) => updateCard(card.id, { enabled })}
         aria-label={`Toggle ${card.programName}`}
       />
     </CardHeader>
     <CardContent className="p-0 space-y-2">
       <div>
         <p className="text-xs text-muted-foreground">Card Number</p>
         <p className="font-mono text-sm">****{card.lastFourDigits}</p>
       </div>
       <div className="flex items-center gap-2">
         {card.verified ? (
           <Badge variant="success" className="text-xs">
             <CheckCircle className="h-3 w-3 mr-1" /> Verified
           </Badge>
         ) : (
           <Badge variant="warning" className="text-xs">
             <AlertCircle className="h-3 w-3 mr-1" /> Unverified
           </Badge>
         )}
         <span className="text-xs text-muted-foreground">
           {card.lastVerified ? `Verified ${formatDistanceToNow(card.lastVerified)} ago` : 'Never verified'}
         </span>
       </div>
       {!card.verified && (
         <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => openVerifyDialog(card.id)}>
           Verify Card
         </Button>
       )}
       {card.verified && (
         <p className="text-xs text-muted-foreground">
           💰 Saved you R {card.totalSavings} historically
         </p>
       )}
     </CardContent>
     <CardFooter className="p-0 pt-4 flex justify-between">
       <Button variant="ghost" size="sm" onClick={() => openEditDialog(card.id)}>
         Edit
       </Button>
       <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteCard(card.id)}>
         Remove
       </Button>
     </CardFooter>
   </Card>
   ```

### AddCardDialog Component
1. Use shadcn/ui `Dialog` with form:
   ```tsx
   <Dialog>
     <DialogTrigger asChild>
       <Button>Add New Card</Button>
     </DialogTrigger>
     <DialogContent>
       <DialogHeader>
         <DialogTitle>Add Loyalty Card</DialogTitle>
         <DialogDescription>Enter your loyalty program details</DialogDescription>
       </DialogHeader>
       <form onSubmit={handleSubmit} className="space-y-4">
         <div>
           <label className="text-sm font-medium">Retailer</label>
           <Select onValueChange={(value) => setRetailerId(value)}>
             <SelectTrigger>
               <SelectValue placeholder="Select retailer" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="checkers">Checkers (Xtra Savings)</SelectItem>
               <SelectItem value="pnp">Pick n Pay (Smart Shopper)</SelectItem>
               <SelectItem value="woolworths">Woolworths (WRewards)</SelectItem>
               <SelectItem value="makro">Makro (mCard)</SelectItem>
             </SelectContent>
           </Select>
         </div>
         <div>
           <label htmlFor="cardNumber" className="text-sm font-medium">Card Number</label>
           <Input
             id="cardNumber"
             type="text"
             placeholder="Enter card number"
             value={cardNumber}
             onChange={(e) => setCardNumber(e.target.value)}
             maxLength={20}
             required
           />
           <p className="text-xs text-muted-foreground mt-1">
             Find this on your physical card or in the app
           </p>
         </div>
         <div className="flex items-center gap-2">
           <Checkbox id="verifyNow" checked={verifyNow} onCheckedChange={setVerifyNow} />
           <label htmlFor="verifyNow" className="text-sm">
             Verify card immediately (recommended)
           </label>
         </div>
       </form>
       <DialogFooter>
         <Button variant="outline" onClick={() => closeDialog()}>Cancel</Button>
         <Button onClick={handleSubmit}>Add Card</Button>
       </DialogFooter>
     </DialogContent>
   </Dialog>
   ```
2. Validation:
   - Retailer selection required
   - Card number format validation (alphanumeric, 10-20 chars)
   - Duplicate detection (warn if card already exists)

### VerifyCardDialog Component
1. Flow for card verification:
   - Step 1: Enter full card number
   - Step 2: Backend validates with retailer API (if available) or flags for manual review
   - Step 3: Show success/failure message
2. Use `Dialog` with multi-step form (Stepper UI)
3. Success state:
   ```tsx
   <div className="text-center p-6">
     <CheckCircle className="h-16 w-16 mx-auto text-success mb-4" />
     <h3 className="text-lg font-semibold">Card Verified!</h3>
     <p className="text-sm text-muted-foreground mt-2">
       Your {card.programName} card is now active and will be used for pricing.
     </p>
   </div>
   ```

### Accessibility Requirements
- Card grid: Use semantic markup (not just divs)
- Switch controls: Proper `aria-label` for each toggle
- Form inputs: Associated labels (htmlFor + id)
- Dialogs: Focus trap, Escape to close, focus first input on open
- Error messages: Announce to screen readers via `aria-live="polite"`

### Responsive Behavior
- **Mobile**: Single column grid, floating "Add" button (fixed bottom-right), full-screen dialogs
- **Tablet**: 2-column grid, regular "Add" button in header
- **Desktop**: 3-column grid, dialogs centered with max-w-md

## Code Examples, Data Structures & Constraints

**Data Structure:**
```typescript
interface LoyaltyCard {
  id: string
  retailerId: string
  retailerName: string
  retailerLogo: string
  programName: string // "Xtra Savings", "Smart Shopper", etc.
  cardNumber: string // Encrypted in DB, only last 4 shown
  lastFourDigits: string
  verified: boolean
  lastVerified?: Date
  enabled: boolean
  totalSavings: number // Historical savings using this card
}
```

**RTK Query:**
```typescript
export const loyaltyCardsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLoyaltyCards: builder.query<LoyaltyCard[], void>({
      query: () => '/api/account/loyalty-cards',
      providesTags: ['LoyaltyCards'],
    }),
    addLoyaltyCard: builder.mutation<LoyaltyCard, Omit<LoyaltyCard, 'id'>>({
      query: (card) => ({
        url: '/api/account/loyalty-cards',
        method: 'POST',
        body: card,
      }),
      invalidatesTags: ['LoyaltyCards'],
    }),
    updateLoyaltyCard: builder.mutation<LoyaltyCard, { id: string; updates: Partial<LoyaltyCard> }>({
      query: ({ id, updates }) => ({
        url: `/api/account/loyalty-cards/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: ['LoyaltyCards'],
    }),
    deleteLoyaltyCard: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/account/loyalty-cards/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['LoyaltyCards'],
    }),
  }),
})
```

**Do NOT:**
- Display full card numbers (security risk) - always mask
- Allow unverified cards to be used in optimization (warn user)
- Skip validation on card number format
- Forget to handle API errors gracefully

## Define Strict Scope

**Files to CREATE:**
- `apps/web/src/app/(auth)/account/loyalty-cards/page.tsx`
- `apps/web/src/components/features/account/LoyaltyCardGrid.tsx`
- `apps/web/src/components/features/account/AddCardDialog.tsx`
- `apps/web/src/components/features/account/VerifyCardDialog.tsx`

**Files to MODIFY:**
- `apps/web/src/store/api/baseApi.ts` (add LoyaltyCards tag)

**Files to LEAVE UNTOUCHED:**
- Dashboard
- Shopping list pages
- Optimization pages
```

---

## 3. Custom Component Prompts

### 3.1 CategoryCard Component

```markdown
## High-Level Goal
Create a reusable `CategoryCard` component that displays a grocery category with budget tracking, spending visualization, savings opportunities, and retailer recommendations.

## Detailed Step-by-Step Instructions

1. Create `apps/web/src/components/features/dashboard/CategoryCard.tsx`
2. Component accepts these props:
   ```typescript
   interface CategoryCardProps {
     id: string
     name: string
     icon: LucideIcon // From lucide-react
     budget: number
     spend: number
     savingsOpportunity?: {
       amount: number
       retailer: string
       distance: string
     }
     itemCount: number
     retailerLogo: string
     status: 'on-budget' | 'near-limit' | 'over-budget' | 'optimized'
     onClick: () => void
   }
   ```
3. Layout structure (shadcn/ui `Card`):
   - **Header**: Icon + Category name + Status badge
   - **Content**: Progress bar (budget vs. spend) + Savings opportunity badge (if exists)
   - **Footer**: Retailer logo + Item count
4. Status badge variants:
   - `on-budget`: Badge variant="success", "✓ On Budget"
   - `near-limit`: Badge variant="warning", "⚠ Near Limit"
   - `over-budget`: Badge variant="destructive", "✕ Over Budget"
   - `optimized`: Badge variant="success", "✓ Optimized"
5. Progress bar color logic:
   ```typescript
   const percentage = (spend / budget) * 100
   const progressColor = percentage < 80 ? 'success' : percentage <= 100 ? 'warning' : 'destructive'
   ```
6. Hover effect: `hover:shadow-md transition-shadow cursor-pointer`

## Code Examples, Data Structures & Constraints

**Full Implementation:**
```tsx
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { LucideIcon } from "lucide-react"

interface CategoryCardProps {
  id: string
  name: string
  icon: LucideIcon
  budget: number
  spend: number
  savingsOpportunity?: {
    amount: number
    retailer: string
    distance: string
  }
  itemCount: number
  retailerLogo: string
  status: 'on-budget' | 'near-limit' | 'over-budget' | 'optimized'
  onClick: () => void
}

export function CategoryCard({
  name,
  icon: Icon,
  budget,
  spend,
  savingsOpportunity,
  itemCount,
  retailerLogo,
  status,
  onClick
}: CategoryCardProps) {
  const percentage = (spend / budget) * 100
  const progressVariant = percentage < 80 ? 'success' : percentage <= 100 ? 'warning' : 'destructive'

  const statusBadge = {
    'on-budget': <Badge variant="success">✓ On Budget</Badge>,
    'near-limit': <Badge variant="warning">⚠ Near Limit</Badge>,
    'over-budget': <Badge variant="destructive">✕ Over Budget</Badge>,
    'optimized': <Badge variant="success">✓ Optimized</Badge>,
  }

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-8 w-8" />
          <h3 className="font-semibold">{name}</h3>
        </div>
        {statusBadge[status]}
      </CardHeader>

      <CardContent className="space-y-3">
        <Progress value={percentage} variant={progressVariant} />

        <div className="flex justify-between text-sm">
          <span>Budget: R {budget.toFixed(2)}</span>
          <span className={percentage > 100 ? 'text-destructive font-medium' : ''}>
            Spend: R {spend.toFixed(2)}
          </span>
        </div>

        {savingsOpportunity && (
          <Badge variant="warning" className="w-full justify-start">
            💰 Save R {savingsOpportunity.amount} → {savingsOpportunity.retailer}
            <span className="text-xs ml-1">({savingsOpportunity.distance})</span>
          </Badge>
        )}
      </CardContent>

      <CardFooter className="flex justify-between items-center">
        <img src={retailerLogo} alt="" className="h-8 w-8 rounded-full" />
        <span className="text-sm text-muted-foreground">📦 {itemCount} items</span>
      </CardFooter>
    </Card>
  )
}
```

**Do NOT:**
- Use hardcoded colors (always use Tailwind utilities with OKLCH variables)
- Forget to handle missing `savingsOpportunity` (optional prop)
- Use non-tabular fonts for budget/spend numbers (should use `font-mono tabular-nums`)

## Define Strict Scope

**Files to CREATE:**
- `apps/web/src/components/features/dashboard/CategoryCard.tsx`

**Dependencies Required:**
- shadcn/ui: `card`, `badge`, `progress`
- lucide-react (already installed)

**Do NOT modify:**
- Any other component files
- Store slices or API files
```

---

### 3.2 ThresholdNudge Component

```markdown
## High-Level Goal
Create a `ThresholdNudge` component that intelligently prompts users to consider switching stores when savings opportunities exceed their configured travel cost threshold.

## Detailed Step-by-Step Instructions

1. Create `apps/web/src/components/features/optimization/ThresholdNudge.tsx`
2. Component props:
   ```typescript
   interface ThresholdNudgeProps {
     id: string
     categoryName: string
     savingsAmount: number
     retailer: string
     distance: string
     travelTime: string
     isOutsideThreshold?: boolean
     onAccept: () => void
     onDismiss: () => void
     onExplain: () => void
   }
   ```
3. Use shadcn/ui `Alert` with custom styling:
   - Left border accent color (4px, `border-l-accent`)
   - Background: `bg-accent-light`
   - Icon: `<Sparkles>` from lucide-react
4. Content structure:
   - **Title**: "💰 Savings Opportunity" (text-base font-semibold)
   - **Description**: "Switch to {retailer} for {categoryName} and save R {savingsAmount}"
   - **Details**: Distance + Travel time (text-xs text-muted-foreground)
   - **Actions**: 3 buttons (Accept, Dismiss, Explain)
5. If `isOutsideThreshold === true`, add warning badge:
   - Badge variant="warning", "Travel cost may exceed savings"

## Code Examples, Data Structures & Constraints

**Full Implementation:**
```tsx
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, MapPin, Clock } from "lucide-react"

interface ThresholdNudgeProps {
  id: string
  categoryName: string
  savingsAmount: number
  retailer: string
  distance: string
  travelTime: string
  isOutsideThreshold?: boolean
  onAccept: () => void
  onDismiss: () => void
  onExplain: () => void
}

export function ThresholdNudge({
  categoryName,
  savingsAmount,
  retailer,
  distance,
  travelTime,
  isOutsideThreshold = false,
  onAccept,
  onDismiss,
  onExplain
}: ThresholdNudgeProps) {
  return (
    <Alert className="border-l-4 border-l-accent bg-accent-light">
      <div className="flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-accent mt-0.5" />
        <div className="flex-1 space-y-2">
          <AlertTitle className="text-base font-semibold flex items-center gap-2">
            💰 Savings Opportunity
            {isOutsideThreshold && (
              <Badge variant="warning" className="text-xs">Travel cost may exceed savings</Badge>
            )}
          </AlertTitle>
          <AlertDescription className="text-sm">
            Switch to <span className="font-semibold">{retailer}</span> for {categoryName} and save{' '}
            <span className="font-mono font-semibold text-accent">R {savingsAmount.toFixed(2)}</span>
          </AlertDescription>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {distance}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {travelTime}
            </span>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Button size="sm" onClick={onAccept}>Accept</Button>
            <Button variant="outline" size="sm" onClick={onDismiss}>Dismiss</Button>
            <Button variant="ghost" size="sm" onClick={onExplain}>Explain</Button>
          </div>
        </div>
      </div>
    </Alert>
  )
}
```

**Do NOT:**
- Show nudge if `savingsAmount < 10` (too small to matter)
- Forget to handle `isOutsideThreshold` warning badge
- Use non-monospaced font for savings amount

## Define Strict Scope

**Files to CREATE:**
- `apps/web/src/components/features/optimization/ThresholdNudge.tsx`

**Dependencies Required:**
- shadcn/ui: `alert`, `button`, `badge`
- lucide-react: `Sparkles`, `MapPin`, `Clock`
```

---

### 3.3 ItemRow Component

```markdown
## High-Level Goal
Create a flexible `ItemRow` component that displays a shopping list item with retailer price, loyalty pricing, confidence indicator, and optional checkbox for selection.

## Detailed Step-by-Step Instructions

1. Create `apps/web/src/components/features/shopping-lists/ItemRow.tsx`
2. Component props:
   ```typescript
   interface ItemRowProps {
     id: string
     name: string
     regularPrice: number
     loyaltyPrice?: number
     loyaltyProgram?: string
     retailerLogo: string
     quantity: number
     unit: string
     confidence: number // 0-100
     isChecked?: boolean
     onCheck?: (checked: boolean) => void
     onClick?: () => void
   }
   ```
3. Layout (responsive):
   - Mobile: Card-based layout (vertical stack)
   - Desktop: Table row layout (horizontal)
4. Price display:
   - If `loyaltyPrice` exists, show both with strikethrough on regular:
     ```tsx
     <div>
       <span className="font-mono text-sm line-through text-muted-foreground">R {regularPrice}</span>
       <span className="font-mono text-lg font-semibold text-success ml-2">R {loyaltyPrice}</span>
       <Badge variant="outline" className="ml-2 text-xs">{loyaltyProgram}</Badge>
     </div>
     ```
   - If no loyalty price, show regular price only
5. Confidence indicator:
   - High (≥80): Green circle + "High confidence"
   - Medium (50-79): Yellow circle + "Medium confidence"
   - Low (<50): Red circle + "Low confidence - review needed"
6. Optional checkbox (if `onCheck` prop provided):
   - Use shadcn/ui `Checkbox`
   - Position: left side of row (desktop), top-right corner (mobile)

## Code Examples, Data Structures & Constraints

**Full Implementation:**
```tsx
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

interface ItemRowProps {
  id: string
  name: string
  regularPrice: number
  loyaltyPrice?: number
  loyaltyProgram?: string
  retailerLogo: string
  quantity: number
  unit: string
  confidence: number // 0-100
  isChecked?: boolean
  onCheck?: (checked: boolean) => void
  onClick?: () => void
}

export function ItemRow({
  id,
  name,
  regularPrice,
  loyaltyPrice,
  loyaltyProgram,
  retailerLogo,
  quantity,
  unit,
  confidence,
  isChecked = false,
  onCheck,
  onClick
}: ItemRowProps) {
  const confidenceColor = confidence >= 80 ? 'success' : confidence >= 50 ? 'warning' : 'destructive'
  const confidenceLabel = confidence >= 80 ? 'High' : confidence >= 50 ? 'Medium' : 'Low - Review'

  return (
    <>
      {/* Mobile Card View */}
      <div className="md:hidden p-4 border rounded-lg hover:bg-muted/50 cursor-pointer" onClick={onClick}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {onCheck && (
              <Checkbox
                checked={isChecked}
                onCheckedChange={onCheck}
                onClick={(e) => e.stopPropagation()}
              />
            )}
            <div className="flex-1">
              <p className="font-semibold">{name}</p>
              <p className="text-sm text-muted-foreground">{quantity} {unit}</p>
              <div className="flex items-center gap-2 mt-2">
                <img src={retailerLogo} alt="" className="h-6 w-6 rounded-full" />
                {loyaltyPrice ? (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm line-through text-muted-foreground">
                      R {regularPrice.toFixed(2)}
                    </span>
                    <span className="font-mono font-semibold text-success">
                      R {loyaltyPrice.toFixed(2)}
                    </span>
                    <Badge variant="outline" className="text-xs">{loyaltyProgram}</Badge>
                  </div>
                ) : (
                  <span className="font-mono font-semibold">R {regularPrice.toFixed(2)}</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className={`w-2 h-2 rounded-full bg-${confidenceColor}`} />
                <span className="text-xs text-muted-foreground">{confidenceLabel} confidence</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Table Row */}
      <tr className="hidden md:table-row hover:bg-muted/50 cursor-pointer" onClick={onClick}>
        {onCheck && (
          <td className="p-4">
            <Checkbox
              checked={isChecked}
              onCheckedChange={onCheck}
              onClick={(e) => e.stopPropagation()}
            />
          </td>
        )}
        <td className="p-4">
          <div className="flex items-center gap-2">
            <img src={retailerLogo} alt="" className="h-8 w-8 rounded-full" />
            <div>
              <p className="font-semibold">{name}</p>
              <p className="text-sm text-muted-foreground">{quantity} {unit}</p>
            </div>
          </div>
        </td>
        <td className="p-4">
          {loyaltyPrice ? (
            <div>
              <span className="font-mono text-sm line-through text-muted-foreground">
                R {regularPrice.toFixed(2)}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-lg font-semibold text-success">
                  R {loyaltyPrice.toFixed(2)}
                </span>
                <Badge variant="outline" className="text-xs">{loyaltyProgram}</Badge>
              </div>
            </div>
          ) : (
            <span className="font-mono text-lg font-semibold">R {regularPrice.toFixed(2)}</span>
          )}
        </td>
        <td className="p-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full bg-${confidenceColor}`} />
            <span className="text-sm">{confidenceLabel}</span>
          </div>
        </td>
      </tr>
    </>
  )
}
```

**Do NOT:**
- Show loyalty badge if `loyaltyPrice` is undefined
- Forget to use `tabular-nums` for price alignment
- Make row clickable if `onClick` is not provided

## Define Strict Scope

**Files to CREATE:**
- `apps/web/src/components/features/shopping-lists/ItemRow.tsx`

**Dependencies Required:**
- shadcn/ui: `checkbox`, `badge`
```

---

## 4. Usage Guidelines

### For AI Code Generation Tools (Vercel v0, Lovable.ai, Bolt.new)

1. **Copy the entire "Project Context & Global Instructions" section** at the beginning of EVERY prompt you send to the AI tool.

2. **Select ONE component/page prompt** from sections 2 or 3 based on what you want to build.

3. **Paste both sections together** into the AI tool's input.

4. **Review generated code** for:
   - Proper use of shadcn/ui components (not other libraries)
   - OKLCH color variables (not hardcoded hex)
   - Mobile-first responsive design (base styles, then `md:`, `lg:`)
   - Accessibility (ARIA labels, semantic HTML, keyboard navigation)
   - TypeScript strict mode compliance

5. **Iterate incrementally**:
   - Build ONE component at a time
   - Test in isolation before integrating
   - Add to Storybook for visual review (if using)

6. **Human review required** for:
   - Security (authentication, data validation)
   - Performance (bundle size, lazy loading)
   - Accessibility testing (screen readers, keyboard nav)
   - Cross-browser compatibility

### Example Workflow

```bash
# Step 1: Generate Dashboard page
[Paste Context + Dashboard prompt into v0.dev]
→ Review generated code
→ Copy to `apps/web/src/app/(auth)/dashboard/page.tsx`
→ Test locally: `pnpm dev`

# Step 2: Generate CategoryCard component
[Paste Context + CategoryCard prompt into v0.dev]
→ Review generated code
→ Copy to `apps/web/src/components/features/dashboard/CategoryCard.tsx`
→ Import in Dashboard page
→ Test with mock data

# Step 3: Run accessibility audit
pnpm test:a11y
→ Fix any violations found
→ Manual screen reader test

# Step 4: Commit changes
git add .
git commit -m "feat: add dashboard with CategoryCard component"
```

### Important Reminders

- **All AI-generated code requires human review** - do not deploy without testing
- **Never commit secrets or API keys** - use environment variables
- **Test on real devices** - emulators don't catch all issues
- **Run linting and type-checking** before committing: `pnpm lint && pnpm typecheck`
- **Follow Git Flow** - create feature branch, commit incrementally, PR for review

---

**End of AI UI Generation Prompts**

**Last Updated:** 2025-10-22
**Maintained by:** TillLess UX Team
**Questions?** See `docs/front-end-spec.md` or `docs/architecture/frontend-architecture.md`
