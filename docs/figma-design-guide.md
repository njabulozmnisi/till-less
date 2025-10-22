# TillLess Figma Design Guide

**Document Purpose:** Step-by-step guide to create high-fidelity Figma designs for TillLess based on `docs/front-end-spec.md` v2.0

**Created:** 2025-10-22
**For:** Design team / Visual designers
**Based on:** Front-End Specification v2.0

---

## Table of Contents

1. [Figma Project Setup](#1-figma-project-setup)
2. [Design System Foundation](#2-design-system-foundation)
3. [Page Designs](#3-page-designs)
4. [Component Library](#4-component-library)
5. [Responsive Layouts](#5-responsive-layouts)
6. [Interactive Prototypes](#6-interactive-prototypes)
7. [Handoff Preparation](#7-handoff-preparation)

---

## 1. Figma Project Setup

### 1.1 Create New Project

1. **Go to Figma** → Create new project
2. **Name:** "TillLess MVP - UI/UX Design"
3. **Team:** Add relevant stakeholders (Product, Engineering, UX)

### 1.2 File Structure

Create **4 separate Figma files** within the project:

```
📁 TillLess MVP - UI/UX Design/
├── 📄 1. User Flows & Wireframes
├── 📄 2. High-Fidelity Screens
├── 📄 3. Component Library (Design System)
└── 📄 4. Responsive Layouts (Mobile/Tablet/Desktop)
```

### 1.3 Page Organization (within each file)

**File 1: User Flows & Wireframes**
- Page 1: Flow 1 - Create Shopping List & Run Optimization
- Page 2: Flow 2 - Review Recommendations & Accept Plan
- Page 3: Flow 3 - Post-Shop Receipt Reconciliation
- Page 4: Flow 4 - Clone Previous List

**File 2: High-Fidelity Screens**
- Page 1: Dashboard (Home)
- Page 2: Shopping Lists (Create/Edit)
- Page 3: Optimization (Configuration & Running)
- Page 4: Results (Dashboard & Substitutions)
- Page 5: Account (Loyalty Cards, Preferences)
- Page 6: Receipts (Upload & Reconciliation)

**File 3: Component Library**
- Page 1: Foundations (Colors, Typography, Spacing, Icons)
- Page 2: Atoms (Buttons, Inputs, Badges, etc.)
- Page 3: Molecules (Cards, Forms, Tables)
- Page 4: Organisms (Navigation, Modals, Complex Components)
- Page 5: TillLess Custom Components (CategoryCard, ThresholdNudge, ItemRow)

**File 4: Responsive Layouts**
- Page 1: Mobile (375px, 390px, 428px)
- Page 2: Tablet (768px, 1024px)
- Page 3: Desktop (1280px, 1440px, 1920px)

---

## 2. Design System Foundation

### 2.1 Create Color Styles

**IMPORTANT:** Figma doesn't natively support OKLCH. Use these HEX approximations and document OKLCH values in descriptions.

#### Primary Colors

1. **Create Color Style:**
   - Name: `Colors/Primary/Default`
   - HEX: `#2DB779`
   - OKLCH: `oklch(65% 0.15 145)` (add to description)
   - Usage: Primary CTAs, savings indicators, active states

2. **Primary Hover:**
   - Name: `Colors/Primary/Hover`
   - HEX: `#25A168`
   - OKLCH: `oklch(60% 0.15 145)`

3. **Primary Light:**
   - Name: `Colors/Primary/Light`
   - HEX: `#E8F7F0`
   - OKLCH: `oklch(95% 0.05 145)`

#### Secondary Colors

4. **Secondary Default:**
   - Name: `Colors/Secondary/Default`
   - HEX: `#2B7A8E`
   - OKLCH: `oklch(55% 0.12 200)`

5. **Secondary Hover:**
   - Name: `Colors/Secondary/Hover`
   - HEX: `#236671`
   - OKLCH: `oklch(50% 0.12 200)`

6. **Secondary Light:**
   - Name: `Colors/Secondary/Light`
   - HEX: `#E8F4F6`
   - OKLCH: `oklch(95% 0.04 200)`

#### Accent Colors

7. **Accent Default:**
   - Name: `Colors/Accent/Default`
   - HEX: `#E89D3C`
   - OKLCH: `oklch(70% 0.15 55)`

8. **Accent Hover:**
   - Name: `Colors/Accent/Hover`
   - HEX: `#D18A2E`
   - OKLCH: `oklch(65% 0.15 55)`

9. **Accent Light:**
   - Name: `Colors/Accent/Light`
   - HEX: `#FDF5EA`
   - OKLCH: `oklch(95% 0.05 55)`

#### Semantic Colors

10. **Success:**
    - Name: `Colors/Semantic/Success`
    - HEX: `#2DB779` (same as Primary)

11. **Warning:**
    - Name: `Colors/Semantic/Warning`
    - HEX: `#E89D3C` (same as Accent)

12. **Error:**
    - Name: `Colors/Semantic/Error`
    - HEX: `#E85D4C`
    - OKLCH: `oklch(60% 0.20 25)`

13. **Info:**
    - Name: `Colors/Semantic/Info`
    - HEX: `#4A90E2`
    - OKLCH: `oklch(65% 0.15 240)`

#### Neutral Colors

14. **Background:**
    - Name: `Colors/Neutral/Background`
    - HEX: `#FFFFFF`
    - OKLCH: `oklch(100% 0 0)`

15. **Foreground:**
    - Name: `Colors/Neutral/Foreground`
    - HEX: `#262626`
    - OKLCH: `oklch(15% 0 0)`

16. **Muted:**
    - Name: `Colors/Neutral/Muted`
    - HEX: `#F5F5F5`
    - OKLCH: `oklch(96% 0 0)`

17. **Muted Foreground:**
    - Name: `Colors/Neutral/Muted-Foreground`
    - HEX: `#808080`
    - OKLCH: `oklch(50% 0 0)`

18. **Border:**
    - Name: `Colors/Neutral/Border`
    - HEX: `#E6E6E6`
    - OKLCH: `oklch(90% 0 0)`

### 2.2 Create Typography Styles

**Fonts to install:**
1. **Inter Variable** (Google Fonts or download from inter.design)
2. **JetBrains Mono Variable** (Google Fonts or download from jetbrains.com/mono)

#### Text Styles

1. **Heading 1 (H1):**
   - Name: `Typography/Heading/H1`
   - Font: Inter Variable
   - Weight: Bold (700)
   - Size: 36px (Desktop), 30px (Mobile - create separate style)
   - Line Height: 44px (Desktop), 38px (Mobile)
   - Color: `Colors/Neutral/Foreground`

2. **Heading 2 (H2):**
   - Name: `Typography/Heading/H2`
   - Font: Inter Variable
   - Weight: Semibold (600)
   - Size: 30px (Desktop), 24px (Mobile)
   - Line Height: 38px (Desktop), 32px (Mobile)

3. **Heading 3 (H3):**
   - Name: `Typography/Heading/H3`
   - Font: Inter Variable
   - Weight: Semibold (600)
   - Size: 24px (Desktop), 20px (Mobile)
   - Line Height: 32px (Desktop), 28px (Mobile)

4. **Heading 4 (H4):**
   - Name: `Typography/Heading/H4`
   - Font: Inter Variable
   - Weight: Semibold (600)
   - Size: 20px
   - Line Height: 28px

5. **Body:**
   - Name: `Typography/Body/Default`
   - Font: Inter Variable
   - Weight: Regular (400)
   - Size: 16px
   - Line Height: 24px
   - Color: `Colors/Neutral/Foreground`

6. **Body Bold:**
   - Name: `Typography/Body/Bold`
   - Font: Inter Variable
   - Weight: Semibold (600)
   - Size: 16px
   - Line Height: 24px

7. **Small:**
   - Name: `Typography/Small/Default`
   - Font: Inter Variable
   - Weight: Regular (400)
   - Size: 14px
   - Line Height: 20px
   - Color: `Colors/Neutral/Muted-Foreground`

8. **Small Bold:**
   - Name: `Typography/Small/Bold`
   - Font: Inter Variable
   - Weight: Semibold (600)
   - Size: 14px
   - Line Height: 20px

9. **Tiny:**
   - Name: `Typography/Tiny`
   - Font: Inter Variable
   - Weight: Regular (400)
   - Size: 12px
   - Line Height: 16px

10. **Button:**
    - Name: `Typography/Button`
    - Font: Inter Variable
    - Weight: Medium (500)
    - Size: 14px
    - Line Height: 20px

11. **Price (Monospace):**
    - Name: `Typography/Price/Default`
    - Font: JetBrains Mono Variable
    - Weight: Semibold (600)
    - Size: 16px-24px (varies by context)
    - Line Height: Auto
    - Letter Spacing: 0 (tabular-nums)
    - Color: `Colors/Neutral/Foreground`

12. **Price Large (Savings):**
    - Name: `Typography/Price/Large`
    - Font: JetBrains Mono Variable
    - Weight: Bold (700)
    - Size: 48px
    - Color: `Colors/Semantic/Success`

### 2.3 Create Effect Styles

#### Shadows

1. **Shadow/Small:**
   - Name: `Effects/Shadow/Small`
   - Type: Drop Shadow
   - X: 0, Y: 1px, Blur: 3px, Spread: 0
   - Color: `#000000` at 10% opacity

2. **Shadow/Medium:**
   - Name: `Effects/Shadow/Medium`
   - Type: Drop Shadow
   - X: 0, Y: 4px, Blur: 6px, Spread: -1px
   - Color: `#000000` at 10% opacity

3. **Shadow/Large:**
   - Name: `Effects/Shadow/Large`
   - Type: Drop Shadow
   - X: 0, Y: 10px, Blur: 15px, Spread: -3px
   - Color: `#000000` at 15% opacity

4. **Shadow/Focus-Ring:**
   - Name: `Effects/Focus/Ring`
   - Type: Drop Shadow
   - X: 0, Y: 0, Blur: 0, Spread: 2px
   - Color: `Colors/Primary/Default` at 100%

### 2.4 Create Grid & Layout Styles

**Auto Layout Plugin:** Install "Auto Layout" Figma plugin

#### Spacing Scale

Create **Local Variables** for spacing:

```
Spacing/1  = 4px   (0.25rem)
Spacing/2  = 8px   (0.5rem)
Spacing/3  = 12px  (0.75rem)
Spacing/4  = 16px  (1rem)    ← Most common
Spacing/6  = 24px  (1.5rem)
Spacing/8  = 32px  (2rem)
Spacing/12 = 48px  (3rem)
Spacing/16 = 64px  (4rem)
```

#### Breakpoint Frames

Create master frames for each breakpoint:

1. **Mobile:**
   - Frame name: `📱 Mobile (375px)`
   - Width: 375px, Height: auto
   - Background: `Colors/Neutral/Background`

2. **Mobile Large:**
   - Frame name: `📱 Mobile Large (428px)`
   - Width: 428px, Height: auto

3. **Tablet:**
   - Frame name: `📱 Tablet (768px)`
   - Width: 768px, Height: auto

4. **Desktop:**
   - Frame name: `💻 Desktop (1440px)`
   - Width: 1440px, Height: auto

5. **Desktop Large:**
   - Frame name: `💻 Desktop Large (1920px)`
   - Width: 1920px, Height: auto

---

## 3. Page Designs

### 3.1 Dashboard (Home)

**Reference:** `docs/front-end-spec.md` Section 4.5.1 "Dashboard (Home)"

#### Mobile Design (375px)

**Frame Setup:**
- Create frame: `Dashboard - Mobile (375px)`
- Background: `Colors/Neutral/Background`
- Padding: 16px (all sides)

**Components to Include:**

1. **Header:**
   - Top padding: 16px
   - Welcome text: "Welcome back, Thandi" (Typography/Heading/H1 mobile)
   - Subtitle: "Let's optimize your shopping today" (Typography/Small)

2. **Hero CTAs:**
   - Stack vertically (Auto Layout, gap: 16px)
   - Button 1: "Start New Optimization" (Primary, full-width, height: 44px)
   - Button 2: "Repeat Last Shop" (Outline, full-width, height: 44px)

3. **Savings Summary Card:**
   - Card component with padding: 24px
   - Shadow: `Effects/Shadow/Medium`
   - Border radius: 8px
   - Content:
     - Title: "Total Savings" (Typography/Heading/H3)
     - Large number: "R 1,234.50" (Typography/Price/Large, color: Success)
     - Subtitle: "Last month you saved R 237 at Checkers" (Typography/Small)

4. **Recent Activity Feed:**
   - Title: "Recent Optimizations" (Typography/Heading/H3)
   - Stack of 3 activity cards (Auto Layout, gap: 12px)
   - Each card:
     - List name (Typography/Body/Bold)
     - Date (Typography/Tiny, Muted-Foreground)
     - Badge: "24 items"
     - Savings: "R 127" (Typography/Price, color: Success)
     - Action button: "Clone" (Ghost button, small)

5. **Data Freshness Indicator:**
   - Badge at bottom with colored dot
   - Text: "Prices updated 2h ago" (Typography/Tiny)
   - Color dot: Green (Fresh)

#### Desktop Design (1440px)

**Frame Setup:**
- Create frame: `Dashboard - Desktop (1440px)`
- Max-width container: 1400px (centered)
- Padding: 64px (left/right), 48px (top/bottom)

**Layout Changes:**
- 3-column grid for main content
- Hero CTAs: Side-by-side (2-column, max-width: 600px)
- Savings card: 50% width
- Recent activity: 50% width (next to savings card)
- Sidebar (optional): Quick links, user profile

### 3.2 Shopping List Creator

**Reference:** `docs/front-end-spec.md` Section 4.5.2 "Create/Edit Shopping List"

#### Mobile Design (375px)

**Frame Setup:**
- Create frame: `Shopping List - Mobile (375px)`
- Background: `Colors/Neutral/Background`

**Components:**

1. **Header with Breadcrumb:**
   - Breadcrumb: "Dashboard > My Lists > Create New" (Typography/Tiny)
   - Title: "Create Shopping List" (Typography/Heading/H1 mobile)

2. **List Name Input:**
   - Label: "List Name" (Typography/Small/Bold)
   - Input field: Full-width, height: 44px, border: 1px `Colors/Neutral/Border`
   - Placeholder: "e.g., April Groceries"

3. **Item Entry Section:**
   - Title: "Add Items" (Typography/Heading/H3)
   - Item input rows (stacked vertically):
     - Row 1: Product name + Quantity (2-column grid)
     - Row 2: Unit + Brand (2-column grid)
     - Delete icon: Top-right corner (ghost button)

4. **Bulk Actions Bar:**
   - Horizontal stack (Auto Layout, gap: 8px)
   - Button 1: "Import CSV" (Outline, small)
   - Button 2: "Paste from Clipboard" (Ghost, small)
   - Button 3: "Clear All" (Ghost, small, color: Destructive)

5. **Sticky Bottom Action Bar:**
   - Fixed to bottom of viewport
   - Background: White with top shadow
   - Padding: 16px
   - Buttons:
     - "Save Draft" (Outline, 50% width)
     - "Run Optimization" (Primary, 50% width)

#### Desktop Design (1440px)

**Layout Changes:**
- Max-width: 1200px (centered)
- Item rows: 5-column layout (Name, Quantity, Unit, Brand, Delete)
- Side panel: Quick stats (item count, estimated optimization time)
- Bottom bar: Not sticky (inline at bottom)

### 3.3 Optimization Configuration

**Reference:** `docs/front-end-spec.md` Section 4.5.3 "Configure Optimization"

#### Mobile Design (375px)

**Components:**

1. **Progress Stepper:**
   - 4 steps: List → **Configure** → Running → Results
   - Horizontal stepper with dots (active step highlighted)
   - Typography/Tiny for labels

2. **Loyalty Card Toggles:**
   - Title: "Loyalty Cards" (Typography/Heading/H3)
   - Card list (vertical stack):
     - Each card: Retailer logo + Program name + Toggle switch
     - Last verified: "Verified 2 weeks ago" (Typography/Tiny, Muted)
     - Warning badge if >90 days: "Needs verification" (Badge, Warning)

3. **Store Preferences:**
   - Title: "Store Preferences" (Typography/Heading/H3)
   - Slider 1: "Max stores to visit" (1-3, default: 1)
     - Slider component with label and value display
   - Slider 2: "Max travel distance" (5-30km, increments: 5km)
     - Real-time fuel cost estimate: "~R 45 (15km round trip)"

4. **Travel Cost Estimator:**
   - Card with map icon or list
   - Nearby stores with distances:
     - Checkers: 3.2km
     - Pick n Pay: 5.8km
     - Woolworths: 7.1km
   - Button: "Change home location" (Ghost)

5. **Bottom Actions:**
   - "Back to Edit List" (Outline)
   - "Find Best Prices" (Primary, disabled until valid config)

#### Desktop Design (1440px)

**Layout:**
- 2-column layout:
  - Left: Loyalty cards (40%)
  - Right: Preferences + Travel estimator (60%)
- Sidebar: Live preview of selected configuration

### 3.4 Results Dashboard

**Reference:** `docs/front-end-spec.md` Section 4.5.5 "Results Dashboard"

#### Mobile Design (375px)

**Critical Design - Most Important UX Moment!**

**Components:**

1. **Winner Card (Hero):**
   - Full-width card, prominent display
   - Padding: 32px
   - Background: Gradient (Primary/Light to White)
   - Shadow: `Effects/Shadow/Large`
   - Content:
     - Retailer logo: 96x96px, centered
     - Store name: (Typography/Heading/H1)
     - Total cost: "R 1,234.50" (Typography/Price/Large, size: 60px)
     - Savings: "You saved R 237 (16%)" (Typography/Heading/H3, color: Success)
     - Badge: "Prices updated 2h ago" (Badge, Warning)
     - Travel cost: "Est. travel: R 30 (10km)" (Typography/Small, Muted)
   - **Animation:** Savings number counts up from 0 → 237 (1 second)

2. **Store Comparison (Collapsible):**
   - Initially collapsed
   - Button: "Compare with other stores ▼" (Ghost)
   - When expanded:
     - Top 3 alternative stores (card stack)
     - Each card: Name, Total, Savings diff, Distance
     - "Switch to this store" button

3. **Itemized Breakdown (Card View on Mobile):**
   - Title: "Items Breakdown" (Typography/Heading/H3)
   - Filter buttons:
     - "Show substitutions only" (Checkbox)
     - "Show promos only" (Checkbox)
   - Item cards (vertical stack):
     - Product name (Typography/Body/Bold)
     - Quantity + Unit (Typography/Small, Muted)
     - Winning price (Typography/Price, Success, right-aligned)
     - Promo badge (if exists): "Buy 2 Get 1 Free" (Badge, Warning)
     - Substitution button (if exists): "Review Substitution" (Outline, small)

4. **Export Actions (Bottom Bar):**
   - Sticky bottom bar on mobile
   - Dropdown menu: "Export ▼" with options:
     - Download PDF
     - Email Plan
     - Save to History
   - Checkbox: "Remind me to upload receipt"

#### Desktop Design (1440px)

**Layout:**
- Winner card: Centered, max-width: 800px, horizontal layout (logo left, content right)
- Comparison section: Below winner, 3-column grid
- Item breakdown: Full-width table with sortable columns:
  - Columns: Item | Your List | Winning Price | Unit Price | Promo | Alternatives
  - Monospaced font for all prices (perfect alignment)
  - Hover effect on rows
  - Filter chips at top

### 3.5 Loyalty Card Management

**Reference:** `docs/front-end-spec.md` Section 4.5.7 "Account - Loyalty Cards Section"

#### Mobile Design (375px)

**Components:**

1. **Header:**
   - Breadcrumb: "Account > Loyalty Cards"
   - Title: "Loyalty Cards" (Typography/Heading/H1)
   - Description: "Manage your retailer loyalty programs" (Typography/Body)

2. **Loyalty Card Grid:**
   - Single column (full-width cards)
   - Each card:
     - Header: Retailer logo (48px) + Program name + Toggle switch
     - Card number: "****1234" (Typography/Price, masked)
     - Verification badge: "✓ Verified" (Badge, Success) or "⚠ Unverified" (Badge, Warning)
     - Last verified: "Verified 2 weeks ago" (Typography/Tiny, Muted)
     - Savings stat: "💰 Saved you R 450 historically" (Typography/Small, Success)
     - Footer actions: "Edit" | "Remove" (Ghost buttons)

3. **Floating Action Button (FAB):**
   - Fixed bottom-right corner
   - Primary button with "+" icon
   - Size: 56x56px
   - Shadow: `Effects/Shadow/Large`
   - Action: Opens "Add Card" dialog

#### Desktop Design (1440px)

**Layout:**
- 3-column grid
- "Add New Card" button in page header (not FAB)
- Cards have hover effect (shadow increase)

---

## 4. Component Library

### 4.1 shadcn/ui Components to Design

**Reference:** `docs/front-end-spec.md` Section 5 "Component Library / Design System"

Create Figma components for all shadcn/ui elements:

#### Atoms (Basic Components)

1. **Button:**
   - Variants:
     - `default` (Primary): bg-primary, text-primary-foreground
     - `secondary`: bg-secondary, text-secondary-foreground
     - `outline`: border-primary, bg-transparent
     - `ghost`: bg-transparent, hover:bg-muted
     - `destructive`: bg-error, text-white
   - Sizes:
     - `sm`: h-36px, px-12px, text-sm
     - `default`: h-40px, px-16px, text-sm
     - `lg`: h-44px, px-20px, text-base
     - `icon`: 40x40px square
   - States: Default, Hover, Active, Focused, Disabled
   - **Focus state:** 2px ring with `Colors/Primary/Default`

2. **Input:**
   - Default: h-40px, border 1px `Colors/Neutral/Border`, border-radius 6px
   - States: Default, Hover, Focused, Disabled, Error
   - Error state: border-error, with error message below

3. **Badge:**
   - Variants:
     - `default`: bg-primary/10, text-primary
     - `success`: bg-success/10, text-success
     - `warning`: bg-warning/10, text-warning
     - `destructive`: bg-error/10, text-error
     - `outline`: border 1px, transparent bg
   - Sizes: Small (20px height), Default (24px height)

4. **Progress:**
   - Track: bg-muted, h-8px, border-radius 4px
   - Fill: bg-primary (or success/warning/destructive based on value)
   - Width: 100% (responsive)

5. **Checkbox / Switch:**
   - Checkbox: 20x20px, border 2px, border-radius 4px
   - Switch: 44x24px (track), 20x20px (thumb)
   - States: Unchecked, Checked, Disabled
   - Checked color: `Colors/Primary/Default`

6. **Select / Dropdown:**
   - Trigger: Same styling as Input
   - Dropdown menu: Shadow, bg-white, border-radius 8px
   - Items: Hover state with bg-muted

#### Molecules (Compound Components)

7. **Card:**
   - Container: bg-white, border 1px `Colors/Neutral/Border`, border-radius 8px
   - Shadow: `Effects/Shadow/Small` (default), `Effects/Shadow/Medium` (hover)
   - Padding: 24px (CardHeader, CardContent, CardFooter)
   - Sections:
     - CardHeader: border-bottom 1px (optional)
     - CardContent: Main content area
     - CardFooter: border-top 1px (optional)

8. **Table:**
   - Header row: bg-muted, border-bottom 2px `Colors/Neutral/Border`
   - Body rows: border-bottom 1px, hover:bg-muted/50
   - Cell padding: 16px (vertical), 12px (horizontal)
   - Sortable header: Arrow icon on hover

9. **Dialog / Modal:**
   - Overlay: bg-black at 50% opacity
   - Content: bg-white, border-radius 12px, max-width 500px
   - Shadow: `Effects/Shadow/Large`
   - Header: DialogTitle (Typography/Heading/H3), DialogDescription (Typography/Small)
   - Footer: Action buttons (right-aligned)

10. **Alert:**
    - Variants: `default`, `success`, `warning`, `destructive`, `info`
    - Left border: 4px colored accent
    - Icon: Left-aligned (based on variant)
    - Content: AlertTitle (Typography/Body/Bold), AlertDescription (Typography/Small)

11. **Toast / Notification:**
    - Position: Bottom-center (mobile), Top-right (desktop)
    - Slide-in animation from bottom/right
    - Auto-dismiss: 3-5 seconds
    - Close button: Top-right corner (X icon)

### 4.2 TillLess Custom Components

**Reference:** `docs/ai-ui-prompts.md` Section 3 "Custom Component Prompts"

#### CategoryCard

**Design Specs:**
- Container: Card (border-radius 8px, shadow-medium)
- Hover: shadow-large, transition 200ms
- Layout:
  - Header: Icon (32x32px) + Name (H3) + Status badge (right-aligned)
  - Content:
    - Progress bar (8px height, colored based on %)
    - Budget vs. Spend (Small text, monospaced for numbers)
    - Savings opportunity badge (if exists, warning variant)
  - Footer: Retailer logo (32x32px, left) + Item count (Small text, right)

**Create Component Variants:**
- Status: on-budget | near-limit | over-budget | optimized
- With/without savings opportunity

#### ThresholdNudge

**Design Specs:**
- Container: Alert with custom styling
- Background: `Colors/Accent/Light`
- Left border: 4px `Colors/Accent/Default`
- Icon: Sparkles (20px, accent color)
- Layout:
  - Title: "💰 Savings Opportunity" (Body/Bold)
  - Description: Dynamic text with retailer and savings amount
  - Details: Distance + Travel time (Tiny, muted, with icons)
  - Actions: 3 buttons (Accept, Dismiss, Explain) - horizontal stack
- Warning variant: Add badge "Travel cost may exceed savings"

#### ItemRow

**Design Specs:**
- **Mobile (Card):**
  - Container: Card, padding 16px
  - Layout: Vertical stack
    - Row 1: Checkbox (if applicable) + Product name + Quantity/unit
    - Row 2: Retailer logo + Price (large, monospaced)
    - Row 3: Confidence indicator (dot + text)
- **Desktop (Table Row):**
  - Cells: Checkbox | Logo + Name | Price | Confidence
  - Hover: bg-muted/50
  - Price display:
    - Regular price: line-through if loyalty price exists
    - Loyalty price: Success color, larger font
    - Badge: Loyalty program name

---

## 5. Responsive Layouts

### 5.1 Mobile-First Design Strategy

**Start with 375px (iPhone SE)**, then scale up.

**Breakpoints to Design:**
1. **Mobile Small:** 375px (iPhone SE)
2. **Mobile Default:** 390px (iPhone 14)
3. **Mobile Large:** 428px (iPhone 14 Pro Max)
4. **Tablet:** 768px (iPad Portrait)
5. **Desktop:** 1440px (MacBook Pro)
6. **Desktop Large:** 1920px (External monitor)

### 5.2 Layout Patterns

#### Mobile (< 768px)
- Single column layouts
- Full-width cards
- Stacked form inputs
- Bottom sticky action bars
- Hamburger navigation (sheet drawer)
- Floating action buttons for primary actions

#### Tablet (768px - 1023px)
- 2-column grids
- Horizontal navigation (top bar or tabs)
- Side-by-side CTAs
- Cards in 2-up grid
- Dialogs: Centered (not full-screen)

#### Desktop (≥1024px)
- 3-column grids
- Persistent sidebar navigation
- Multi-column forms
- Full-width tables
- Hover states and tooltips
- Larger spacing and padding

### 5.3 Responsive Component Behavior

**Document in Figma:**

Create a "Responsive Behavior" page with before/after examples:

**Example: ItemRow Component**
- Mobile: Card layout (vertical stack)
- Desktop: Table row layout (horizontal)
- **Visual:** Show both side-by-side with annotations

**Example: Dashboard Hero CTAs**
- Mobile: Stacked (vertical), full-width
- Desktop: Side-by-side (horizontal), auto-width
- **Visual:** Show transformation

**Example: Navigation**
- Mobile: Hamburger menu → Sheet drawer (full-screen)
- Tablet: Top navigation bar (horizontal links)
- Desktop: Sidebar (persistent, collapsible)
- **Visual:** Show all 3 states

---

## 6. Interactive Prototypes

### 6.1 User Flows to Prototype

**Create interactive prototypes in File 1 (User Flows & Wireframes):**

#### Flow 1: Create Shopping List & Run Optimization

**Frames:**
1. Dashboard → Click "Start New Optimization"
2. Shopping List (empty) → Add 3 items
3. Shopping List (filled) → Click "Run Optimization"
4. Configuration → Set loyalty cards, adjust sliders
5. Configuration → Click "Find Best Prices"
6. Loading screen (30 seconds animation)
7. Results Dashboard → Show winner card

**Interactions:**
- Button clicks → Navigate to next frame
- Input fields → Show typing animation (optional)
- Slider → Show value change on drag
- Loading → Looping animation or progress bar

#### Flow 2: Review Recommendations & Accept Plan

**Frames:**
1. Results Dashboard → View winner card
2. Results → Click "Compare with other stores"
3. Comparison expanded → View alternatives
4. Results → Click "Review Substitution"
5. Substitution Modal → Show original vs. substitute
6. Substitution Modal → Click "Accept"
7. Results updated → Click "Download PDF"
8. Success toast → "Plan downloaded!"

**Interactions:**
- Collapsible sections → Expand/collapse animation
- Modal open → Overlay fade-in + modal scale-in
- Modal close → Reverse animation

#### Flow 3: Post-Shop Receipt Reconciliation

**Frames:**
1. Dashboard → Prompt "Upload receipt for last shop"
2. Receipt Upload → Click "Upload Photo"
3. File picker (mobile camera) → Simulate capture
4. Receipt Processing → Loading animation
5. Reconciliation Results → Show predicted vs. actual
6. Feedback Form → Select reason for variance
7. Success → "Thank you! Feedback submitted"

#### Flow 4: Clone Previous List

**Frames:**
1. Dashboard → Click "Repeat Last Shop"
2. Recent Lists → Select "April Groceries"
3. Shopping List (pre-filled) → Edit 2 items
4. Shopping List → Click "Run Optimization"
5. (Continue to Flow 1, frame 4)

### 6.2 Micro-interactions to Prototype

**Document these animations:**

1. **Button Hover:** Color transition (200ms ease-out)
2. **Button Active:** Scale to 98% (150ms)
3. **Card Hover:** Shadow increase (200ms)
4. **Savings Counter:** Number count-up animation (1s, ease-out)
5. **Progress Bar:** Fill animation (300ms)
6. **Toast Notification:** Slide-in from bottom (300ms), auto-dismiss after 3s
7. **Modal Open:** Overlay fade-in (200ms) + content scale-in (250ms)
8. **Accordion Expand:** Height transition (200ms ease-out), chevron rotate
9. **Loading Spinner:** Continuous rotation (600ms linear)
10. **Focus Ring:** Instant appearance on Tab key

**Create Prototype Examples:**
- Use Figma's "Smart Animate" for smooth transitions
- Set easing curves to match (ease-out for most)
- Document timing (150ms, 200ms, 300ms, etc.)

---

## 7. Handoff Preparation

### 7.1 Developer Handoff Checklist

**Before sharing with engineering team:**

- [ ] All color styles created and named consistently
- [ ] All text styles created with proper naming
- [ ] All components are variants (not separate components)
- [ ] Responsive layouts documented for all breakpoints
- [ ] Interactive prototypes working for all 4 main flows
- [ ] OKLCH color values documented in descriptions
- [ ] Auto Layout used for all flexible components
- [ ] All icons are SVG (not PNG) with consistent sizing
- [ ] Spacing follows 4px/8px grid system
- [ ] All states documented (hover, focus, active, disabled)
- [ ] Accessibility notes added (color contrast, ARIA labels)
- [ ] Design tokens exported (optional: use Figma Tokens plugin)

### 7.2 Export Assets

**What to Export:**

1. **Icons:**
   - Format: SVG
   - Naming: `icon-name.svg` (kebab-case)
   - Size: 24x24px (default), include 16px and 32px variants
   - Location: `apps/web/public/icons/`

2. **Logos:**
   - Retailer logos: SVG, 128x128px
   - TillLess logo: SVG + PNG (for social sharing)
   - Location: `apps/web/public/logos/`

3. **Images:**
   - Product images: WebP + PNG fallback
   - Max size: 800x800px
   - Compression: 85% quality
   - Location: `apps/web/public/images/`

4. **Design Tokens (JSON):**
   - Export colors, typography, spacing as JSON
   - Tool: Figma Tokens plugin or manual export
   - Location: `apps/web/src/styles/tokens.json`

### 7.3 Documentation

**Create a "Design System Documentation" page in Figma:**

**Content:**
1. **Color Usage Guide:**
   - When to use each color
   - Color contrast ratios (WCAG AA compliance)
   - OKLCH → HEX conversion table

2. **Typography Scale:**
   - Usage guidelines (when to use each style)
   - Responsive scaling (mobile vs. desktop)
   - Accessibility: Minimum font size 14px

3. **Spacing System:**
   - 4px/8px grid explanation
   - Common spacing patterns (card padding, section gaps)

4. **Component Usage:**
   - When to use each component
   - Do's and Don'ts (with visual examples)
   - Accessibility requirements per component

5. **Responsive Behavior:**
   - Breakpoint strategy
   - Component transformations (mobile → desktop)
   - Layout patterns

### 7.4 Sharing with Team

**Figma Sharing Settings:**

1. **Set permissions:**
   - Stakeholders: Can view
   - Designers: Can edit
   - Developers: Can view + comment

2. **Create Figma Dev Mode link:**
   - Share Dev Mode URL with engineering team
   - Enable "Inspect" mode for CSS extraction
   - Add code snippets (optional)

3. **Export design specs:**
   - Use Figma's "Inspect" panel for measurements
   - Export component specs as PDF (optional)

4. **Schedule design review:**
   - Invite Product, Engineering, UX for walkthrough
   - Record session (Loom or similar)
   - Gather feedback, iterate

---

## 8. Implementation Timeline

**Estimated timeline for design creation:**

### Week 1: Foundation & Setup
- **Day 1-2:** Figma project setup, color/typography styles, spacing system
- **Day 3-5:** Core components (buttons, inputs, cards, badges, etc.)

### Week 2: Page Designs (High-Fidelity)
- **Day 1:** Dashboard (mobile + desktop)
- **Day 2:** Shopping List Creator (mobile + desktop)
- **Day 3:** Optimization Configuration (mobile + desktop)
- **Day 4:** Results Dashboard (mobile + desktop) ← Most critical
- **Day 5:** Loyalty Cards + Receipts (mobile + desktop)

### Week 3: Custom Components & Responsive
- **Day 1-2:** CategoryCard, ThresholdNudge, ItemRow components
- **Day 3-4:** Responsive layouts for all breakpoints
- **Day 5:** Review and polish

### Week 4: Prototypes & Handoff
- **Day 1-2:** Interactive prototypes (4 main flows)
- **Day 3:** Micro-interactions and animations
- **Day 4:** Documentation and asset export
- **Day 5:** Design review with team, iterate on feedback

**Total:** 4 weeks for complete Figma design system + all screens + prototypes

---

## 9. Quick Start Checklist

**If you're starting today, follow this order:**

- [ ] 1. Create Figma project and file structure
- [ ] 2. Install Inter Variable and JetBrains Mono Variable fonts
- [ ] 3. Create color styles (18 colors)
- [ ] 4. Create typography styles (12 text styles)
- [ ] 5. Create effect styles (shadows, focus rings)
- [ ] 6. Create spacing variables (8 spacing values)
- [ ] 7. Create breakpoint frames (5 frames)
- [ ] 8. Design Button component (all variants and states)
- [ ] 9. Design Input component (all states)
- [ ] 10. Design Card component
- [ ] 11. Design Dashboard mobile (375px)
- [ ] 12. Design Dashboard desktop (1440px)
- [ ] 13. Design Results Dashboard mobile (MOST CRITICAL)
- [ ] 14. Design Results Dashboard desktop
- [ ] 15. Continue with remaining screens...
- [ ] 16. Create interactive prototype (Flow 1)
- [ ] 17. Add animations and micro-interactions
- [ ] 18. Export assets and documentation
- [ ] 19. Share with team for review
- [ ] 20. Iterate based on feedback

---

## 10. Resources & References

**Figma Plugins to Install:**

1. **Stark** - Accessibility checker (color contrast, focus order)
2. **Auto Layout** - Responsive layout helper
3. **Figma Tokens** - Design token management (optional)
4. **Content Reel** - Realistic content generator
5. **Iconify** - Access to Lucide icons (1400+ icons)
6. **Unsplash** - Stock photos (for product images)
7. **A11y - Color Contrast Checker** - WCAG compliance
8. **Breakpoints** - Responsive design helper

**External Resources:**

- **Inter Font:** https://rsms.me/inter/
- **JetBrains Mono Font:** https://www.jetbrains.com/lp/mono/
- **Lucide Icons:** https://lucide.dev/
- **shadcn/ui Components:** https://ui.shadcn.com/
- **OKLCH Color Picker:** https://oklch.com/
- **Tailwind CSS Docs:** https://tailwindcss.com/

**Reference Documents:**

- `docs/front-end-spec.md` - Complete UI/UX specification
- `docs/ai-ui-prompts.md` - Component implementation details
- `docs/prd.md` - Product requirements
- `docs/architecture/frontend-architecture.md` - Technical architecture

---

## 11. Support & Questions

**Need help?**

- **Design questions:** Review `docs/front-end-spec.md` Section 1-11
- **Component questions:** Check `docs/ai-ui-prompts.md` Section 3-4
- **Technical questions:** Consult with engineering team
- **Accessibility questions:** Use Stark plugin + WCAG guidelines

**Feedback:**

- Create Figma comments for design feedback
- Use GitHub Issues for bugs/requests in the codebase
- Schedule design critiques with team

---

**End of Figma Design Guide**

**Created:** 2025-10-22
**Last Updated:** 2025-10-22
**Maintained by:** TillLess UX Team
**Version:** 1.0
