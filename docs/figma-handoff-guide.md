# TillLess Figma Design Handoff Guide

**Version:** 1.0
**Date:** 2025-10-19
**Author:** Sally (UX Expert)
**Purpose:** Complete guide for creating TillLess UI designs in Figma

---

## Table of Contents

1. [Project Setup Guide](#project-setup-guide)
2. [Design Tokens](#design-tokens)
3. [Component Specifications](#component-specifications)
4. [Screen Design Briefs](#screen-design-briefs)
5. [Figma Plugins & Resources](#figma-plugins--resources)
6. [Workflow & Best Practices](#workflow--best-practices)

---

## Project Setup Guide

### File Structure

Create a new Figma file named: **"TillLess - UI Design System"**

**Page Organization:**

```
📄 TillLess - UI Design System
├── 📄 Cover Page
├── 📄 Design Tokens
│   ├── Colors
│   ├── Typography
│   ├── Spacing & Layout
│   └── Icons
├── 📄 Component Library
│   ├── Foundations (Buttons, Inputs, Badges)
│   ├── Data Display (Cards, Tables)
│   ├── Feedback (Dialogs, Toasts, Alerts)
│   └── Navigation (Sidebar, Mobile Menu)
├── 📄 User Flows (Interactive Prototypes)
│   ├── Flow 1: Create List & Run Optimization
│   ├── Flow 2: Review Results & Accept Plan
│   ├── Flow 3: Receipt Reconciliation
│   └── Flow 4: Clone Previous List
├── 📄 Screen Designs - Mobile (375px width)
│   ├── 01. Dashboard
│   ├── 02. Create/Edit Shopping List
│   ├── 03. Configure Optimization
│   ├── 04. Optimization Running
│   ├── 05. Results Dashboard
│   ├── 06. Substitution Review Modal
│   ├── 07. Loyalty Cards Management
│   └── 08. Receipt Reconciliation
├── 📄 Screen Designs - Tablet (768px width)
│   └── (Same 8 screens)
├── 📄 Screen Designs - Desktop (1440px width)
│   └── (Same 8 screens)
└── 📄 Responsive Layouts
    └── Breakpoint Comparison Views
```

### Frame Setup

**Mobile Frames:**
- Width: 375px (iPhone SE)
- Alternative: 390px (iPhone 12/13)
- Height: Auto (let content define)

**Tablet Frames:**
- Width: 768px (iPad portrait)
- Height: 1024px

**Desktop Frames:**
- Width: 1440px (standard laptop)
- Height: 900px

**Auto Layout:**
- Enable Auto Layout for all frames
- Use padding: 16px (mobile), 24px (tablet), 32px (desktop)

### Naming Conventions

**Frames:**
```
[Screen Name] / [Device] / [State]
Examples:
- Dashboard / Mobile / Default
- Results Dashboard / Desktop / Loading
- Substitution Modal / Mobile / Open
```

**Components:**
```
[Category] / [Component Name] / [Variant]
Examples:
- Button / Primary / Default
- Card / Store Card / Winner
- Badge / Data Freshness / Fresh
```

**Layers:**
```
Use descriptive names with emojis for clarity:
🎨 Background
📦 Container
📝 Text
🔘 Button
🖼️ Image
```

### Grid Setup

**Mobile Grid (375px):**
- Columns: 4
- Gutter: 16px
- Margin: 16px
- Type: Stretch

**Tablet Grid (768px):**
- Columns: 12
- Gutter: 16px
- Margin: 24px
- Type: Stretch

**Desktop Grid (1440px):**
- Columns: 12
- Gutter: 24px
- Margin: Max container 1400px (20px margins on 1440px)
- Type: Center

**Baseline Grid (All):**
- Size: 8px
- Color: Subtle red (#FF000010)

---

## Design Tokens

### Color Tokens

**How to Set Up in Figma:**
1. Open Figma file
2. Go to Local Styles
3. Create Color Styles with exact names below
4. Organize into folders: Brand, Semantic, Neutral

#### Brand Colors

| Token Name | Hex Value | HSL | Usage |
|------------|-----------|-----|-------|
| `Primary/Default` | `#007B5F` | `hsl(166, 100%, 24%)` | Primary CTAs, brand elements, links |
| `Primary/Hover` | `#005F49` | `hsl(166, 100%, 19%)` | Hover state for primary elements |
| `Primary/Foreground` | `#FFFFFF` | `hsl(0, 0%, 100%)` | Text on primary backgrounds |
| `Secondary/Default` | `#F1F5F9` | `hsl(210, 40%, 96%)` | Secondary buttons, subtle backgrounds |
| `Secondary/Foreground` | `#1E293B` | `hsl(222, 47%, 18%)` | Text on secondary backgrounds |
| `Accent/Purple` | `#8B5CF6` | `hsl(262, 90%, 66%)` | Premium features, special badges |

#### Semantic Colors

| Token Name | Hex Value | HSL | Usage |
|------------|-----------|-----|-------|
| `Success/Default` | `#10B981` | `hsl(142, 71%, 45%)` | Savings, confirmations, positive feedback |
| `Success/Light` | `#D1FAE5` | `hsl(138, 76%, 90%)` | Success badge backgrounds |
| `Success/Dark` | `#065F46` | `hsl(160, 84%, 20%)` | Success text on light backgrounds |
| `Warning/Default` | `#F59E0B` | `hsl(38, 92%, 50%)` | Cautions, data staleness (yellow) |
| `Warning/Light` | `#FEF3C7` | `hsl(48, 96%, 89%)` | Warning badge backgrounds |
| `Warning/Dark` | `#92400E` | `hsl(25, 85%, 30%)` | Warning text |
| `Error/Default` | `#EF4444` | `hsl(0, 84%, 60%)` | Errors, destructive actions |
| `Error/Light` | `#FEE2E2` | `hsl(0, 86%, 94%)` | Error badge backgrounds |
| `Error/Dark` | `#991B1B` | `hsl(0, 70%, 35%)` | Error text |
| `Info/Default` | `#3B82F6` | `hsl(217, 91%, 60%)` | Informational messages |

#### Neutral Colors

| Token Name | Hex Value | HSL | Usage |
|------------|-----------|-----|-------|
| `Background` | `#FFFFFF` | `hsl(0, 0%, 100%)` | Page background |
| `Foreground` | `#0F172A` | `hsl(222, 84%, 5%)` | Primary text |
| `Card/Background` | `#FFFFFF` | `hsl(0, 0%, 100%)` | Card backgrounds |
| `Card/Foreground` | `#0F172A` | `hsl(222, 84%, 5%)` | Text on cards |
| `Muted/Background` | `#F1F5F9` | `hsl(210, 40%, 96%)` | Disabled states, subtle backgrounds |
| `Muted/Foreground` | `#64748B` | `hsl(215, 16%, 47%)` | Secondary text, placeholders |
| `Border` | `#E2E8F0` | `hsl(214, 32%, 91%)` | Borders, dividers |
| `Input` | `#E2E8F0` | `hsl(214, 32%, 91%)` | Input borders |
| `Ring` | `#007B5F` | `hsl(166, 100%, 24%)` | Focus ring color |

**Figma Setup Steps:**
1. Create a frame named "Color Palette"
2. For each color, create a square (80x80px)
3. Apply fill color
4. Click the style icon (four dots) next to Fill
5. Create new style with token name
6. Add description with usage notes

### Typography Tokens

**Font Setup:**

**Primary Font: Inter**
- Download from: https://fonts.google.com/specimen/Inter
- Install weights: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)
- Load as web font in Figma: Enable "Inter" in Font menu

**Monospace Font: JetBrains Mono**
- Download from: https://fonts.google.com/specimen/JetBrains+Mono
- Install weights: 400 (Regular)
- Use for: Code snippets, numerical data

#### Text Styles

Create these Text Styles in Figma:

| Style Name | Font | Size | Weight | Line Height | Letter Spacing | Usage |
|------------|------|------|--------|-------------|----------------|-------|
| `Heading/H1` | Inter | 36px | Bold (700) | 43px (120%) | -0.02em | Page titles |
| `Heading/H2` | Inter | 30px | Semibold (600) | 39px (130%) | -0.01em | Section headings |
| `Heading/H3` | Inter | 24px | Semibold (600) | 34px (140%) | 0 | Subsection headings |
| `Heading/H4` | Inter | 20px | Semibold (600) | 28px (140%) | 0 | Component headings |
| `Body/Default` | Inter | 16px | Regular (400) | 24px (150%) | 0 | Body text, form inputs |
| `Body/Bold` | Inter | 16px | Semibold (600) | 24px (150%) | 0 | Emphasized text, labels |
| `Small/Default` | Inter | 14px | Regular (400) | 21px (150%) | 0 | Secondary text, captions |
| `Small/Bold` | Inter | 14px | Semibold (600) | 21px (150%) | 0 | Small labels, badges |
| `Tiny/Default` | Inter | 12px | Regular (400) | 17px (140%) | 0 | Timestamps, disclaimers |
| `Button/Default` | Inter | 14px | Medium (500) | 14px (100%) | 0 | Button text |
| `Button/Large` | Inter | 16px | Medium (500) | 16px (100%) | 0 | Large button text |
| `Mono/Default` | JetBrains Mono | 14px | Regular (400) | 21px (150%) | 0 | Code, aligned numbers |

**Responsive Scaling (Mobile):**
- H1: 28px (mobile) → 36px (desktop)
- H2: 24px (mobile) → 30px (desktop)
- H3: 20px (mobile) → 24px (desktop)
- Body: 16px (same across all)

**Figma Setup Steps:**
1. Create a frame named "Typography Scale"
2. For each text style, add example text
3. Apply formatting (font, size, weight, line height)
4. Click style icon next to Type
5. Create new text style with name from table
6. Organize in folders: Heading, Body, Small, Tiny, Button, Mono

### Spacing & Layout Tokens

**Spacing Scale (based on 4px):**

| Token Name | Value | Figma Usage |
|------------|-------|-------------|
| `spacing-xs` | 4px | Tight spacing within components |
| `spacing-sm` | 8px | Small gaps (icon to text) |
| `spacing-md` | 16px | Default spacing (card padding, button padding) |
| `spacing-lg` | 24px | Section spacing (between form groups) |
| `spacing-xl` | 32px | Large spacing (between major sections) |
| `spacing-2xl` | 48px | Extra large (page section dividers) |
| `spacing-3xl` | 64px | Hero/landing page spacing |

**How to Use in Figma:**
- Use Auto Layout with spacing values from table
- Set padding: `spacing-md` (16px) for mobile, `spacing-lg` (24px) for desktop
- Set gaps between elements using Auto Layout "Spacing between items"

**Border Radius:**

| Token Name | Value | Usage |
|------------|-------|-------|
| `radius-sm` | 4px | Small elements |
| `radius-md` | 6px | Default (shadcn/ui default) |
| `radius-lg` | 8px | Cards, dialogs |
| `radius-xl` | 12px | Large cards |
| `radius-full` | 9999px | Pills, badges, avatars |

**Figma Setup:**
- Apply corner radius to rectangles
- Save as component variants with different radius values

**Shadows (Elevation):**

| Token Name | Figma Shadow | Usage |
|------------|--------------|-------|
| `shadow-sm` | X:0, Y:1, B:2, S:0, Color:#0000000D | Subtle elevation |
| `shadow-md` | X:0, Y:4, B:6, S:-1, Color:#0000001A | Default card shadow |
| `shadow-lg` | X:0, Y:10, B:15, S:-3, Color:#0000001A | Hover state, modals |
| `shadow-xl` | X:0, Y:20, B:25, S:-5, Color:#00000026 | Dialogs, popovers |

**Figma Setup:**
1. Create squares showing each shadow level
2. Apply shadow using Effect panel
3. Save as Effect Style with token name

### Icon Library

**Lucide Icons in Figma:**

**Option 1: Iconify Plugin**
1. Install Iconify plugin in Figma
2. Search for "Lucide" icon set
3. Import icons as you need them
4. Size: 24x24px default, 16x16px small, 32px large

**Option 2: Manual SVG Import**
1. Visit https://lucide.dev
2. Download SVG icons
3. Import to Figma as vectors
4. Resize to 24x24px frame
5. Create component for each icon

**Key Icons to Import:**

**Shopping:**
- ShoppingCart
- ShoppingBag
- Store
- Package

**Money:**
- DollarSign (customize to show Rand symbol)
- TrendingDown
- Coins
- Wallet

**Status:**
- CheckCircle
- AlertTriangle
- XCircle
- Info

**Data:**
- RefreshCw
- Clock
- BarChart3
- Calendar

**Actions:**
- Plus
- Trash2
- Edit
- Download
- Upload
- Search

**Navigation:**
- ChevronRight
- ChevronLeft
- Menu
- X
- Home

**Loyalty:**
- CreditCard
- Award
- Sparkles

**Icon Sizing:**
- Small: 16x16px (`h-4 w-4`)
- Default: 20x20px or 24x24px (`h-5 w-5` or `h-6 w-6`)
- Large: 32x32px (`h-8 w-8`)
- Hero: 48x48px or larger (`h-12 w-12`)

**Stroke Width:** 2px (Lucide default)

---

## Component Specifications

For each component, I'll provide detailed specifications matching shadcn/ui components.

### 1. Button Component

**Figma Component Structure:**
```
Button
├── Variant: default (primary)
├── Variant: secondary
├── Variant: ghost
├── Variant: destructive
└── Variant: outline
```

**Specifications:**

| Variant | Background | Border | Text Color | Hover State | Height | Padding |
|---------|-----------|--------|------------|-------------|--------|---------|
| Default (Primary) | `Primary/Default` (#007B5F) | None | `Primary/Foreground` (#FFF) | `Primary/Hover` (#005F49) | 40px | 16px H, 12px V |
| Secondary | `Secondary/Default` (#F1F5F9) | None | `Secondary/Foreground` (#1E293B) | Darken 5% | 40px | 16px H, 12px V |
| Ghost | Transparent | None | `Foreground` (#0F172A) | `Muted/Background` (#F1F5F9) | 40px | 16px H, 12px V |
| Destructive | `Error/Default` (#EF4444) | None | White | Darken 10% | 40px | 16px H, 12px V |
| Outline | Transparent | 1px `Border` (#E2E8F0) | `Foreground` | `Muted/Background` | 40px | 16px H, 12px V |

**Sizes:**

| Size | Height | Padding H | Text Style |
|------|--------|-----------|------------|
| Small | 36px | 12px | `Button/Default` (14px) |
| Default | 40px | 16px | `Button/Default` (14px) |
| Large | 44px | 20px | `Button/Large` (16px) |
| Icon | 40px | 8px | N/A |

**States:**
- Default
- Hover (apply hover background color)
- Active (scale 0.98)
- Focused (2px ring with `Ring` color, 2px offset)
- Disabled (50% opacity, cursor not-allowed)
- Loading (show spinner icon, disable interaction)

**Figma Setup:**
1. Create base button rectangle with Auto Layout
2. Add text layer with `Button/Default` style
3. Set padding: 16px horizontal, 12px vertical
4. Corner radius: `radius-md` (6px)
5. Create component
6. Add variants for each type
7. Add boolean property for "disabled" state
8. Add "icon-left" and "icon-right" slots using Auto Layout

**Example Buttons:**
- "Run Optimization" (Primary, Large)
- "Save Draft" (Secondary, Default)
- "Cancel" (Ghost, Default)
- "Delete List" (Destructive, Default)

### 2. Card Component

**Figma Component Structure:**
```
Card
├── Card Header
├── Card Title
├── Card Description
├── Card Content
└── Card Footer
```

**Specifications:**

| Element | Styling |
|---------|---------|
| Card Container | Background: `Card/Background` (#FFF), Border: 1px `Border` (#E2E8F0), Radius: `radius-lg` (8px), Shadow: `shadow-md` |
| Card Header | Padding: 24px (desktop), 16px (mobile), Auto Layout vertical, Gap: 4px |
| Card Title | Text: `Heading/H3` (24px Semibold), Color: `Card/Foreground` |
| Card Description | Text: `Small/Default` (14px Regular), Color: `Muted/Foreground` |
| Card Content | Padding: 24px (desktop), 16px (mobile) |
| Card Footer | Padding: 24px (desktop), 16px (mobile), Border-top: 1px `Border` (optional) |

**Variants:**

**Store Card (Winner):**
- Add left border: 4px `Success/Default` (#10B981)
- Header shows retailer logo (120x40px)
- Title: Store name (H3)
- Description: "Best overall price"
- Content: Total cost (large), savings badge, travel cost
- Shadow: `shadow-lg` on hover

**Store Card (Comparison):**
- Standard card styling
- Smaller title (H4)
- Condensed stats layout
- Interactive: Border changes to `Primary/Default` on hover

**Item Card (Mobile):**
- Full-width on mobile
- Header: Item name + price
- Content: Quantity, size, promo badge
- Footer: Actions (edit, delete)

**Figma Setup:**
1. Create frame with Auto Layout vertical
2. Add nested Auto Layout frames for Header, Content, Footer
3. Apply background, border, radius, shadow
4. Make component
5. Create variants: Default, Winner, Comparison, Interactive
6. Add hover states (increased shadow)

### 3. Badge Component

**Figma Component Structure:**
```
Badge
├── Variant: default
├── Variant: secondary
├── Variant: destructive
├── Variant: outline
└── Variant: success
```

**Specifications:**

| Variant | Background | Border | Text Color | Radius | Padding | Text Size |
|---------|-----------|--------|------------|--------|---------|-----------|
| Default | `Primary/Default` | None | White | `radius-full` | 6px H, 2px V | 12px |
| Secondary | `Secondary/Default` | None | `Secondary/Foreground` | `radius-full` | 6px H, 2px V | 12px |
| Destructive | `Error/Light` | 1px `Error/Default` | `Error/Dark` | `radius-full` | 6px H, 2px V | 12px |
| Outline | Transparent | 1px `Border` | `Foreground` | `radius-full` | 6px H, 2px V | 12px |
| Success | `Success/Light` | 1px `Success/Default` | `Success/Dark` | `radius-full` | 6px H, 2px V | 12px |

**Special Badges:**

**Data Freshness Badge:**
- Include colored dot (8px circle) before text
- Fresh (<2h): Green dot (#10B981), "Updated 1h ago"
- Acceptable (2-6h): Yellow dot (#F59E0B), "Updated 4h ago"
- Stale (>6h): Red dot (#EF4444), "Updated 8h ago"

**Promo Badge:**
- Background: `Warning/Light` (#FEF3C7)
- Border: 1px `Warning/Default` (#F59E0B)
- Text: `Warning/Dark` (#92400E)
- Icon: Sparkles (16px)
- Example: "Buy 2 Get 1 Free"

**Savings Badge:**
- Background: `Success/Light` (#D1FAE5)
- Text: `Success/Dark` (#065F46), Bold
- Prefix: "+" symbol
- Example: "+R 22.50 saved"

**Figma Setup:**
1. Create Auto Layout horizontal frame
2. Add text with `Tiny/Default` or `Small/Bold` style
3. Padding: 6px horizontal, 2px vertical
4. Corner radius: 9999px (fully rounded)
5. Create component with variants
6. For data freshness, add 8px circle as icon
7. Use Figma Variants to switch between states

### 4. Input / Form Field Component

**Figma Component Structure:**
```
Input
├── Label
├── Input Field
├── Helper Text
└── Error Message
```

**Specifications:**

| Element | Styling |
|---------|---------|
| Label | Text: `Body/Bold` (16px Semibold), Color: `Foreground`, Margin-bottom: 8px |
| Input Field | Height: 40px, Padding: 12px H, Border: 1px `Input` (#E2E8F0), Radius: `radius-md` (6px), Background: White |
| Input Text | Text: `Body/Default` (16px Regular), Color: `Foreground` |
| Placeholder | Text: `Body/Default` (16px Regular), Color: `Muted/Foreground`, Italic |
| Helper Text | Text: `Small/Default` (14px), Color: `Muted/Foreground`, Margin-top: 4px |
| Error Message | Text: `Small/Default` (14px), Color: `Error/Dark`, Margin-top: 4px, Icon: AlertTriangle (16px) |

**States:**
- Default: Border `Input` color
- Hover: Border `Border` color (slightly darker)
- Focused: Border `Primary/Default`, Ring 2px `Ring` color with 2px offset
- Error: Border `Error/Default`, show error message
- Disabled: Background `Muted/Background`, Border lighter, Text `Muted/Foreground`

**Input Types:**
- Text Input
- Number Input (with +/- buttons)
- Select Dropdown (with ChevronDown icon)
- Textarea (multi-line, min-height: 80px)
- Checkbox (16x16px, rounded 4px)
- Radio (16x16px, fully rounded)
- Switch (44x24px pill with 20x20px circle)

**Figma Setup:**
1. Create Auto Layout vertical frame
2. Add Label text layer
3. Add Input field frame (Auto Layout horizontal for icon support)
4. Add Helper/Error text layer
5. Create component
6. Add variants: Default, Hover, Focused, Error, Disabled
7. Add boolean properties for "show-label", "show-helper", "show-error"
8. For Select, add ChevronDown icon (16px) aligned right

### 5. Table Component

**Specifications:**

| Element | Styling |
|---------|---------|
| Table Container | Border: 1px `Border`, Radius: `radius-lg` (8px) |
| Table Header Row | Background: `Muted/Background` (#F1F5F9), Border-bottom: 1px `Border` |
| Table Header Cell | Padding: 12px, Text: `Small/Bold` (14px Semibold), Color: `Foreground` |
| Table Body Row | Background: White, Border-bottom: 1px `Border` (last row: none) |
| Table Body Cell | Padding: 12px, Text: `Body/Default` (16px), Color: `Foreground` |
| Hover State | Background: `Muted/Background` (very subtle) |

**Mobile Adaptation:**
- On mobile, tables convert to card layout
- Each row becomes a card with vertical stacking
- Labels shown inline with values

**Figma Setup:**
1. Use Figma Table plugin or manually create grid
2. Create header row with `Muted/Background`
3. Create body rows with alternating backgrounds (optional)
4. Make component for Table Row
5. Create variants: Default, Hover, Selected
6. For mobile, create separate Card-based layout component

### 6. Dialog / Modal Component

**Specifications:**

| Element | Styling |
|---------|---------|
| Backdrop | Background: Black 50% opacity, Blur: 4px (if supported) |
| Dialog Container | Background: White, Radius: `radius-lg` (8px), Shadow: `shadow-xl`, Max-width: 500px (mobile: full-width minus 32px margin) |
| Dialog Header | Padding: 24px 24px 16px, Border-bottom: 1px `Border` (optional) |
| Dialog Title | Text: `Heading/H3` (24px Semibold), Color: `Foreground` |
| Dialog Description | Text: `Body/Default` (16px), Color: `Muted/Foreground`, Margin-top: 8px |
| Dialog Content | Padding: 24px, Max-height: 70vh, Overflow: scroll |
| Dialog Footer | Padding: 16px 24px 24px, Border-top: 1px `Border` (optional), Buttons right-aligned with 8px gap |
| Close Button | Position: absolute top-right (16px, 16px), Size: 32x32px, Icon: X (20px), Variant: Ghost |

**Entry Animation:**
- Backdrop: Fade in (200ms)
- Dialog: Scale from 95% to 100% + Fade in (250ms)

**Exit Animation:**
- Backdrop: Fade out (200ms)
- Dialog: Scale to 95% + Fade out (200ms)

**Figma Setup:**
1. Create full-screen frame for backdrop
2. Add centered dialog container with Auto Layout vertical
3. Add Header, Content, Footer sections
4. Add close button (X icon)
5. Create component
6. Use Figma's "Smart Animate" for prototyping entry/exit

### 7. Toast / Notification Component

**Specifications:**

| Element | Styling |
|---------|---------|
| Toast Container | Width: 360px (mobile: full-width - 32px margin), Background: White, Border: 1px `Border`, Radius: `radius-lg`, Shadow: `shadow-lg`, Padding: 16px |
| Toast Icon | Size: 20px, Colors: Success (green), Error (red), Info (blue), Warning (amber) |
| Toast Title | Text: `Body/Bold` (16px Semibold), Color: `Foreground` |
| Toast Description | Text: `Small/Default` (14px), Color: `Muted/Foreground`, Margin-top: 4px |
| Close Button | Size: 20x20px, Icon: X (16px), Position: top-right |
| Progress Bar | Height: 4px, Background: `Muted/Background`, Fill: `Primary/Default`, Width animates from 100% to 0% over duration |

**Variants:**
- Success (green icon, CheckCircle)
- Error (red icon, XCircle)
- Warning (amber icon, AlertTriangle)
- Info (blue icon, Info)

**Entry Animation:** Slide in from top or bottom (300ms)
**Exit Animation:** Slide out + Fade out (200ms)
**Auto-dismiss:** After 3-5 seconds (shown by progress bar)

**Figma Setup:**
1. Create frame with Auto Layout
2. Add icon, title, description, close button
3. Add progress bar at bottom
4. Create variants for each type
5. Prototype slide-in animation using Smart Animate

### 8. Skeleton Loader Component

**Specifications:**

| Element | Styling |
|---------|---------|
| Skeleton Rectangle | Background: `Muted/Background` (#F1F5F9), Radius: `radius-md` (6px) |
| Animation | Pulse effect: Opacity 100% → 50% → 100% (1.5s loop) |

**Common Patterns:**
- Text line: Width varies (100%, 80%, 60%), Height: 16px
- Heading: Width: 200px, Height: 24px
- Avatar: Circle 40x40px
- Card: Full width, Height: 120px
- Button: Width: 100px, Height: 40px

**Figma Setup:**
1. Create rectangle with `Muted/Background`
2. Apply corner radius
3. Create components for common patterns
4. In prototype, use "While hovering" → "Opacity 50%" → loop for pulse effect

---

## Screen Design Briefs

Detailed specifications for each of the 8 key screens across mobile, tablet, and desktop.

### Screen 1: Dashboard (Home)

**Purpose:** Landing page after login, quick access to core actions and recent activity

**Layout Structure:**

**Mobile (375px):**
```
[Header: Logo + Menu]
[Hero CTA: "Start New Optimization" - Primary Button, Full Width]
[Secondary CTA: "Repeat Last Shop" - Secondary Button, Full Width]
[Savings Summary Card]
[Recent Activity Section]
  - Past List Card 1
  - Past List Card 2
  - "View All" link
[Data Health Indicator]
[Footer: Quick Links]
```

**Desktop (1440px):**
```
[Sidebar Navigation (240px width)]
[Main Content Area (Max 1160px)]
  [Header: Welcome Message + User Avatar]
  [Hero Section: 2-column]
    - Left: "Start New Optimization" CTA + "Repeat Last Shop"
    - Right: Savings Summary Card
  [Recent Activity: 3-column grid of past lists]
  [Data Health Indicator: Bottom right]
```

**Key Elements:**

1. **Header (Mobile)**
   - Logo: TillLess wordmark (120px width)
   - Hamburger menu icon (24x24px, right-aligned)
   - Background: White, Border-bottom: 1px `Border`
   - Height: 64px
   - Padding: 16px

2. **Hero CTA Section**
   - "Start New Optimization" button: Primary variant, Large size
   - "Repeat Last Shop" button: Secondary variant, Default size
   - Gap: 12px
   - Mobile: Full-width buttons, stacked
   - Desktop: Inline, left-aligned

3. **Savings Summary Card**
   - Card with slight elevation (`shadow-md`)
   - Icon: TrendingDown (32px, green)
   - Heading: "Your Total Savings"
   - Value: Large text (H2, green), animated counter (R 1,234.50)
   - Subtext: "Across 12 shopping trips this year"
   - Background gradient: White → subtle green tint

4. **Recent Activity Feed**
   - Section title: "Recent Lists" (H3)
   - Each past list as Card:
     - Header: List name + date
     - Content: "42 items, saved R 237 at Checkers"
     - Footer: "Clone" button (Ghost variant, small)
   - Mobile: Vertical stack
   - Desktop: 3-column grid

5. **Data Health Indicator**
   - Badge with colored dot
   - Text: "Prices updated 2h ago" (green dot = fresh)
   - Position: Bottom-right corner (desktop), below activity (mobile)
   - Click to show detailed modal with per-retailer timestamps

**States:**
- Default (user has past lists)
- Empty State (new user): Show onboarding message, larger CTA
- Loading: Skeleton loaders for cards

**Interactions:**
- Click "Start New Optimization" → Navigate to Create List screen
- Click "Repeat Last Shop" → Load most recent list, navigate to Configure Optimization
- Click past list card → Navigate to list detail/edit screen
- Click "Clone" → Duplicate list, navigate to editor

**Figma Notes:**
- Create 3 variants: Mobile, Tablet, Desktop
- Include empty state variant
- Add interactive prototype for navigation
- Use actual retailer logos (Checkers, Pick n Pay, etc.) - obtain from public sources or create placeholders

### Screen 2: Create/Edit Shopping List

**Purpose:** Build or modify shopping list via manual entry or CSV import

**Layout Structure:**

**Mobile (375px):**
```
[Header: "Create Shopping List" + Back button]
[List Name Input]
[Add Item Section]
  - Product Name Input
  - Quantity Input
  - Size/Unit Input
  - "Add Item" Button
[Items List (Card View)]
  - Item Card 1 (swipe to delete)
  - Item Card 2
  - ...
[Bulk Actions Bar: "Import CSV" Button]
[Bottom Action Bar (Fixed)]
  - "Save Draft" (Secondary)
  - "Run Optimization" (Primary)
```

**Desktop (1440px):**
```
[Sidebar Navigation]
[Main Content (Max 900px)]
  [Header: "Create Shopping List" + breadcrumb]
  [List Name Input (larger)]
  [Add Item Form (Horizontal Layout)]
    - Product Name | Quantity | Size | Add Button (inline)
  [Items Table]
    - Columns: Item, Quantity, Size, Actions
    - Sortable headers
    - Inline edit
  [Bulk Actions: "Import CSV" | "Clear All"]
  [Bottom Actions: "Save Draft" | "Run Optimization"]
```

**Key Elements:**

1. **Header**
   - Mobile: Back arrow (left), Title (center), Menu (right)
   - Desktop: Breadcrumb (Dashboard > My Lists > Create New)
   - Background: White, Border-bottom

2. **List Name Input**
   - Label: "List Name"
   - Input: Text field
   - Placeholder: "e.g., October Groceries"
   - Required indicator: "*"
   - Auto-save on blur

3. **Add Item Form**
   - Product Name: Text input, placeholder "Jungle Oats 1kg"
   - Quantity: Number input with +/- buttons, default: 1
   - Size/Unit: Text input, placeholder "1kg" or select dropdown (kg, g, L, ml, count)
   - Advanced (collapsible): Brand preference, Must-have checkbox, Substitution tolerance
   - "Add Item" button: Primary, icon: Plus
   - Mobile: Vertical stack
   - Desktop: Horizontal inline form

4. **Items List/Table**
   - Mobile: Card view
     - Item name (bold)
     - Quantity × Size (secondary text)
     - Actions: Edit (icon button), Delete (icon button or swipe gesture)
   - Desktop: Table view
     - Columns: Item Name, Quantity, Size, Brand (optional), Actions
     - Sortable by name, quantity
     - Inline edit: Click cell to edit
     - Delete: Trash icon button with confirmation

5. **Empty State**
   - Illustration: Shopping basket (200px)
   - Message: "Your list is empty"
   - CTA: "Add your first item above or import a CSV"

6. **CSV Import Flow**
   - Button: "Import CSV" (Secondary, icon: Upload)
   - Click opens Dialog modal:
     - Title: "Import Shopping List"
     - Drag-drop area for CSV file
     - "Download Template" link
     - Preview table showing first 5 rows
     - "Import" button (Primary)
   - Validation: Show errors inline (e.g., "Row 3: Missing quantity")

7. **Bottom Action Bar (Mobile)**
   - Fixed position at bottom
   - Background: White, Shadow: `shadow-lg`
   - Buttons: "Save Draft" (Secondary, left), "Run Optimization" (Primary, right)
   - Gap: 8px
   - Padding: 16px

**States:**
- Default (empty list)
- Populated (with items)
- Adding item (form focused)
- CSV import modal open
- Validation error (show error messages)

**Interactions:**
- Type in Product Name → Show autocomplete suggestions (previously used items)
- Click "Add Item" → Add to list, clear form, focus back to Product Name
- Swipe item card (mobile) → Reveal delete button
- Click "Import CSV" → Open modal
- Click "Run Optimization" → Validate list (min 3 items), navigate to Configure Optimization

**Figma Notes:**
- Create mobile and desktop variants
- Include empty state
- Create CSV import modal component
- Add autocomplete dropdown mockup
- Prototype "Add Item" interaction
- Show validation states (error inputs with red border and message)

### Screen 3: Configure Optimization

**Purpose:** Set optimization parameters (loyalty cards, store preferences, travel cost) before running

**Layout Structure:**

**Mobile (375px):**
```
[Stepper: List Complete → Configure → Running → Results]
  (Configure step highlighted)
[Section: Loyalty Cards]
  - Card 1: Checkers Xtra Savings (Switch ON)
  - Card 2: Pick n Pay Smart Shopper (Switch OFF)
  - + Add Card link
[Section: Store Preferences]
  - Max Stores: Slider (1-3 stores, default: 1)
  - Max Travel Distance: Select (5km, 10km, 20km, Any)
[Section: Travel Cost (Collapsible)]
  - Estimated fuel cost: R 15/km
  - Home location: "Sandton, Gauteng" (edit link)
[Bottom Actions]
  - "Back to Edit List" (Ghost)
  - "Find Best Prices" (Primary, full-width)
```

**Desktop (1440px):**
```
[Stepper: Horizontal, top of page]
[Main Content (2-column layout)]
  [Left Column (60%)]
    [Loyalty Cards Section]
      - Grid: 2-up cards
    [Store Preferences Section]
      - Inline controls
  [Right Column (40%)]
    [Travel Cost Estimator Card]
      - Map preview (optional)
      - Cost breakdown
    [Summary Card]
      - "You'll compare prices from 5 retailers"
      - "Loyalty savings applied: 2 cards"
[Bottom Actions]
  - "Back" (left), "Find Best Prices" (right, primary)
```

**Key Elements:**

1. **Stepper / Progress Indicator**
   - 4 steps: List Complete, Configure, Running, Results
   - Current step: Bold, primary color
   - Completed: Checkmark icon
   - Upcoming: Muted
   - Mobile: Vertical, left-aligned
   - Desktop: Horizontal, centered

2. **Loyalty Cards Section**
   - Title: "Loyalty Cards" (H3)
   - Each card:
     - Retailer logo (80x80px)
     - Card name: "Xtra Savings"
     - Card number: Masked "•••• 1234"
     - Status badge: "Verified" (green) or "Not Verified" (amber)
     - Switch toggle: ON/OFF
     - Last used: "Used 2 weeks ago" (small text)
   - "+ Add Card" link opens modal to add new card
   - Mobile: Full-width stacked cards
   - Desktop: 2-column grid

3. **Store Preferences Section**
   - Title: "Store Preferences" (H3)
   - Max Stores:
     - Label: "Maximum number of stores"
     - Slider: 1-3 (default: 1)
     - Helper text: "Shopping at 1 store is usually fastest"
   - Max Travel Distance:
     - Label: "How far will you travel?"
     - Select dropdown: Options: 5km, 10km, 20km, Any distance
     - Default: 10km

4. **Travel Cost Estimator (Collapsible)**
   - Title: "Travel Cost Settings" (H4)
   - Expand/collapse chevron icon
   - When expanded:
     - Home Location input: "Sandton, Gauteng" with edit icon
     - Fuel cost: Number input "R 15 per km" (editable)
     - Estimated cost preview: "Estimated travel cost to Checkers: R 45"
   - Default: Collapsed on mobile, expanded on desktop

5. **Summary Card (Desktop only)**
   - Background: `Muted/Background`
   - Icon: Info (20px)
   - Bullet points:
     - "Comparing prices from 5 retailers"
     - "Loyalty savings applied: 2 cards active"
     - "Optimizing for 1-store shopping"

6. **Bottom Actions**
   - "Back to Edit List": Ghost button, icon: ChevronLeft
   - "Find Best Prices": Primary button, Large, icon: Search (optional)
   - Mobile: Full-width stack
   - Desktop: Left/right justified

**States:**
- Default (cards loaded)
- Loading loyalty cards (skeleton loaders)
- No cards added (empty state with "+ Add Card" CTA)
- Travel cost collapsed/expanded

**Interactions:**
- Toggle loyalty card switch → Update "active cards" count in summary
- Drag slider → Update "max stores" value
- Click "Back to Edit List" → Navigate to list editor
- Click "Find Best Prices" → Validate (at least 1 loyalty card recommended, not required), start optimization, navigate to Loading screen

**Figma Notes:**
- Create stepper component (reusable across flows)
- Design loyalty card component with variants (verified/unverified, on/off)
- Create slider component (Figma slider or custom)
- Add collapsed/expanded states for Travel Cost section
- Prototype toggle interactions
- Include empty state for loyalty cards

### Screen 4: Optimization Running (Loading State)

**Purpose:** Show progress while optimization engine runs, reduce perceived wait time

**Layout Structure:**

**Mobile & Desktop (Centered):**
```
[Stepper: Running step highlighted]
[Main Content (Centered, Max 600px)]
  [Animated Spinner]
  [Progress Message]
    - "Fetching prices from Checkers..."
    - "Comparing promotions..."
    - "Calculating best basket..."
  [Time Estimate]
    - "Usually takes 15-30 seconds"
  [Fun Fact / Tip (Rotating)]
    - "Did you know? TillLess users save an average of 12% per shop"
  [Cancel Button]
    - "Cancel" (Ghost variant)
```

**Key Elements:**

1. **Stepper**
   - "Running" step highlighted with animated pulse
   - Mobile: Minimal stepper (dots only)
   - Desktop: Full stepper with labels

2. **Spinner Animation**
   - Lucide Loader2 icon (48x48px)
   - Color: Primary
   - Continuous spin animation
   - Position: Centered

3. **Progress Message**
   - Text style: H3 (24px)
   - Color: Foreground
   - Animated fade in/out as messages change
   - Messages rotate every 3-5 seconds:
     - "Fetching prices from Checkers..."
     - "Fetching prices from Pick n Pay..."
     - "Fetching prices from Shoprite..."
     - "Fetching prices from Woolworths..."
     - "Fetching prices from Makro..."
     - "Comparing promotions across retailers..."
     - "Calculating your best basket..."
     - "Almost done! Finalizing recommendations..."

4. **Time Estimate**
   - Text: "Usually takes 15-30 seconds"
   - Style: Body/Default
   - Color: Muted/Foreground
   - Position: Below progress message

5. **Fun Facts / Tips**
   - Rotate through educational content:
     - "Did you know? TillLess users save an average of 12% per shop"
     - "Tip: Add your loyalty cards for even more savings"
     - "Fun fact: Prices can vary up to 30% between retailers"
     - "Savings tip: Shopping on Wednesdays often catches the best promotions"
   - Text style: Small/Default
   - Color: Muted/Foreground
   - Icon: Sparkles (16px) before text
   - Fade in/out animation every 8 seconds

6. **Cancel Button**
   - "Cancel" or "Cancel Optimization"
   - Variant: Ghost
   - Size: Default
   - Position: Bottom center
   - On click: Confirm dialog, then return to Configure screen

**Timeout Handling:**
- If optimization exceeds 45 seconds:
   - Show message: "This is taking longer than usual..."
   - Offer option: "Send results via email when ready"
   - Or: "Continue waiting" / "Cancel and try again"

**Error State:**
- If optimization fails:
   - Show error icon (XCircle, red, 48px)
   - Message: "We're having trouble reaching [Retailer Name]"
   - Options:
     - "Re-run without [Retailer]" (Primary)
     - "Try Again" (Secondary)
     - "Go Back" (Ghost)

**Figma Notes:**
- Create animated spinner using Figma's prototype "While hovering" + rotation
- Design progress message with fade transition
- Create error state variant
- Add timeout state variant
- Prototype message rotation using multiple frames and delays

### Screen 5: Results Dashboard

**Purpose:** Display optimization results with winning store, savings breakdown, and item-level details

**Layout Structure:**

**Mobile (375px):**
```
[Header: "Results" + Filter icon]
[Winner Card (Hero)]
  - Checkers logo
  - "Best Overall Price"
  - Total: R 1,234.50
  - Savings: +R 187.20 (13%)
  - Travel Cost: R 15 (2km away)
[Tabs: "Items" | "Store Comparison"]
[Items List (Card View)]
  - Item Card 1
  - Item Card 2
  - (Expandable for details)
[Data Freshness Badge]
[Bottom Actions]
  - "Download PDF" (Secondary)
  - "Accept Plan" (Primary)
```

**Desktop (1440px):**
```
[Header: "Optimization Results"]
[Main Content (2-column)]
  [Left: Winner Card + Store Comparison (Collapsible)]
    - Winner Card (large)
    - "Compare Stores" expandable section
      - Top 3 alternatives in condensed cards
  [Right: Itemized Breakdown Table]
    - Table with columns:
      - Item | Your List | Checkers | Pick n Pay | Shoprite | Actions
    - Sortable, filterable
    - Substitutions highlighted
[Bottom Actions]
  - "Back to Configure" (Ghost)
  - "Download PDF" (Secondary)
  - "Email Plan" (Secondary)
  - "Accept Plan" (Primary)
```

**Key Elements:**

1. **Winner Card (Hero)**
   - Size: Larger than standard card
   - Background: White with subtle gradient
   - Left border: 4px green (`Success/Default`)
   - Shadow: `shadow-lg`
   - Layout (Auto Layout vertical):
     - Retailer logo (150x50px, centered)
     - Badge: "Best Overall Price" (success variant)
     - Total cost: H1 size (36px), bold, primary color
     - Savings badge: Large, green, "+R 187.20 saved (13%)"
     - Breakdown:
       - Subtotal: R 1,219.50
       - Loyalty savings: -R 0.00 (if none applied)
       - Travel cost: +R 15.00
       - Total: R 1,234.50
     - Icon row: CheckCircle (green) + "42 of 42 items available"

2. **Store Comparison Section**
   - Desktop: Expandable section below winner card
   - Mobile: Separate tab
   - Shows top 3 alternative stores:
     - Store name + logo
     - Total cost
     - Savings vs. winner (e.g., "+R 22 more expensive")
     - Quick toggle: "Switch to this store" button
   - On toggle: Instantly update winner card without re-running optimization

3. **Itemized Breakdown**
   - Desktop: Table layout
     - Columns: Item Name, Your List (Qty × Size), Winning Store Price, Unit Price, Promo Badge, Actions
     - Rows sortable by: Name, Price, Savings
     - Filter: "Show only substitutions", "Show only promo items"
   - Mobile: Card layout
     - Each item as card:
       - Item name (bold)
       - Quantity × Size (secondary)
       - Price comparison: Checkers: R 15.99, Pick n Pay: R 17.50 (strikethrough)
       - Unit price: R 15.99/kg
       - Promo badge: "Buy 2 Get 1 Free" (if applicable)
       - Expand to see all retailer prices
       - Substitution alert: "Original unavailable" (if substituted)

4. **Substitution Alerts**
   - Highlighted rows/cards (amber border)
   - Badge: "Substitution" (outline variant, amber)
   - Click to open Substitution Review Modal
   - Shows count: "3 items need review"

5. **Data Freshness Indicator**
   - Position: Top-right (desktop), below winner card (mobile)
   - Badge with colored dot + timestamp
   - Click for detailed per-retailer timestamps modal

6. **Bottom Actions**
   - "Back to Configure": Ghost, icon: ChevronLeft
   - "Download PDF": Secondary, icon: Download
   - "Email Plan": Secondary, icon: Mail
   - "Accept Plan": Primary, Large, icon: CheckCircle
   - Mobile: Fixed bottom bar, 2-column grid
   - Desktop: Right-aligned horizontal layout

**States:**
- Default (all items matched)
- With substitutions (3+ items substituted)
- Partial availability (>20% items unavailable - show warning)
- Store comparison expanded/collapsed

**Interactions:**
- Click store comparison store → Switch winner (instant update, no reload)
- Click item row → Expand to show all retailer prices
- Click "Substitution" badge → Open Substitution Review Modal
- Click data freshness badge → Show detailed timestamp modal
- Click "Download PDF" → Generate and download PDF shopping list
- Click "Email Plan" → Open modal to enter email address
- Click "Accept Plan" → Mark optimization as accepted, navigate to confirmation screen

**Figma Notes:**
- Design winner card with celebratory feel (green accents, checkmark)
- Create table component for desktop itemized breakdown
- Create card component for mobile item cards
- Design collapsible store comparison section
- Add substitution badge and alert styling
- Create export modal (email input)
- Prototype store switching interaction (instant update)
- Include states: default, with substitutions, partial availability

### Screen 6: Substitution Review Modal

**Purpose:** Review and accept/reject product substitutions suggested by the system

**Layout:**

```
[Modal Overlay (50% black)]
[Dialog Container (Max 600px)]
  [Header]
    - Title: "Review Substitution"
    - Progress: "2 of 5 substitutions"
    - Close button (X)
  [Content (2-column comparison)]
    [Left: Original Product]
      - Image placeholder (120x120px)
      - Name: "Jungle Oats Original 1kg"
      - Size: 1kg
      - Price: "Not available"
      - Status badge: "Out of stock" (red)
    [Right: Suggested Substitute]
      - Image placeholder (120x120px)
      - Name: "Jungle Oats Quick Cook 1kg"
      - Size: 1kg
      - Price: R 45.99
      - Unit price: R 45.99/kg
      - Confidence: Progress bar (85%, green)
  [Rationale Section]
    - Icon: Info (20px)
    - Text: "Same brand, similar product. Slightly different cooking time but nutritionally equivalent."
  [Impact Preview]
    - "Accepting this substitute will:"
    - Total change: +R 2.00 (vs. original)
    - Store recommendation: Unchanged
  [Footer Actions]
    - "Reject" (Destructive)
    - "Suggest Different" (Secondary)
    - "Accept Substitute" (Primary)
  [Batch Action (if multiple substitutions)]
    - "Accept All High-Confidence (3)" link
```

**Key Elements:**

1. **Modal Container**
   - Max width: 600px (mobile: full-width minus 32px margin)
   - Background: White
   - Radius: `radius-lg` (8px)
   - Shadow: `shadow-xl`
   - Padding: 24px

2. **Progress Indicator**
   - Text: "2 of 5 substitutions"
   - Style: Small/Default
   - Color: Muted/Foreground
   - Position: Below title

3. **Product Comparison (2-column)**
   - Equal width columns with vertical divider
   - Each column:
     - Product image (120x120px, placeholder if no image)
     - Product name (H4)
     - Size/quantity (Body/Default)
     - Price (H3, green for substitute, red/strikethrough for unavailable original)
     - Unit price (Small, muted)
   - Substitute column adds:
     - Confidence indicator: Progress bar or star rating (e.g., "85% match")
     - Color: Green (high >80%), Amber (medium 50-80%), Red (low <50%)

4. **Rationale Section**
   - Background: `Muted/Background` (#F1F5F9)
   - Border: 1px `Border`
   - Radius: `radius-md`
   - Padding: 16px
   - Icon: Info (blue)
   - Text: Explanation from system (e.g., "Same brand, different size", "Different brand, highly rated alternative")

5. **Impact Preview**
   - Title: "Accepting this substitute will:" (Small/Bold)
   - Bullets:
     - Price impact: "+R 2.00 vs. original" (show increase/decrease)
     - Total basket impact: "Total increases by R 2.00"
     - Store recommendation: "Winner remains Checkers" or "Winner may change to Pick n Pay"
   - Color: Green (savings), Red (increase), Muted (no change)

6. **Footer Actions**
   - Layout: 3 buttons, horizontal
   - "Reject": Destructive variant, Left-aligned
     - On click: Mark as "must-have original", re-run optimization without this substitute
   - "Suggest Different": Secondary variant, Center
     - On click: Show alternative substitutes (if available)
   - "Accept Substitute": Primary variant, Right-aligned
     - On click: Accept substitute, move to next substitution or close modal if last one

7. **Batch Actions**
   - Link: "Accept All High-Confidence (3)"
   - Position: Above footer, right-aligned
   - On click: Accept all substitutions with >80% confidence, close modal

**Alternative Substitutes View:**
- If user clicks "Suggest Different":
   - Show list of 2-3 alternative substitutes
   - Each as mini card with: Name, Price, Confidence score
   - "Select" button on each
   - "Back" button to return to main comparison

**Keyboard Navigation:**
- Arrow keys: Cycle between substitutions
- Enter: Accept current substitute
- Esc: Close modal

**Figma Notes:**
- Design modal with 2-column comparison layout
- Create product card component (reusable for original and substitute)
- Design confidence indicator (progress bar or stars)
- Add rationale card component
- Create impact preview section
- Include alternative substitutes view (separate frame)
- Prototype navigation between substitutions
- Show keyboard shortcuts hints (optional)

### Screen 7: Account - Loyalty Cards Section

**Purpose:** Manage saved loyalty programs and verify card status

**Layout:**

**Mobile (375px):**
```
[Header: "Loyalty Cards"]
[Cards Grid (1-column)]
  - Xtra Savings Card
  - Smart Shopper Card
  - WRewards Card
  - mCard
[+ Add New Card Button (Full-width)]
[Help Text]
  - "Loyalty cards help us show you the best prices"
```

**Desktop (1440px):**
```
[Sidebar Navigation]
[Main Content]
  [Header: "Loyalty Cards Management"]
  [Cards Grid (3-column)]
    - Card 1
    - Card 2
    - Card 3
    - + Add New Card (placeholder card)
  [Help Section]
    - "How loyalty cards work"
    - "Why verify your cards?"
```

**Key Elements:**

1. **Loyalty Card Component**
   - Size: Full-width (mobile), 300px width (desktop)
   - Height: 180px
   - Design: Card-like appearance mimicking physical loyalty card
   - Layout:
     - Top: Retailer logo (80x80px) + Card name
     - Middle: Masked card number "•••• •••• •••• 1234"
     - Bottom left: Verification status badge
     - Bottom right: Toggle switch (Active/Inactive)
   - Background: Gradient matching retailer brand color (subtle)
   - Border: 1px `Border`, Radius: `radius-lg`

2. **Verification Status**
   - Verified: Green badge with CheckCircle icon "Verified"
   - Unverified: Amber badge with AlertTriangle "Not Verified - Verify Now"
   - Expired: Red badge "Needs Re-verification"

3. **Card Details**
   - Retailer: Checkers
   - Program: Xtra Savings
   - Card Number: Masked "•••• •••• •••• 1234"
   - Added: "Added 3 months ago"
   - Last Used: "Used 2 weeks ago"
   - Savings Attribution: "Saved R 342 with this card this month" (green text, bold)

4. **Card Actions**
   - Toggle Switch: Active/Inactive
     - Active (green): Card will be used in optimizations
     - Inactive (gray): Card will not be used
   - Edit: Pencil icon button
     - Opens modal to edit card number, verify
   - Delete: Trash icon button
     - Confirmation dialog: "Are you sure? This card has saved you R 342."

5. **Add New Card**
   - Button: "+ Add Card" (Primary, full-width on mobile)
   - Desktop: Dashed placeholder card with "+ Add New Card" text and icon
   - On click: Open "Add Card Modal"

6. **Add Card Modal**
   - Title: "Add Loyalty Card"
   - Form fields:
     - Retailer: Select dropdown (Checkers, Pick n Pay, Shoprite, Woolworths, Makro)
     - Loyalty Program: Auto-populated based on retailer
     - Card Number: Input (with format validation)
     - Scan Barcode button (camera icon) - Phase 2 feature, show as "Coming soon"
   - Actions:
     - "Cancel" (Ghost)
     - "Add Card" (Primary)
   - After adding: Show "Verify Card" prompt
     - "We recommend verifying your card to ensure accurate pricing"
     - "Verify Now" (Primary) or "Skip for Now" (Ghost)

7. **Verification Flow**
   - Prompt: "To verify, please confirm the last 4 digits on your physical card"
   - Input: 4-digit code
   - "Verify" button
   - On success: Show success toast "Card verified!", update badge to green
   - On failure: Show error "Verification failed. Please check your card number."

8. **Usage Stats (Per Card)**
   - Show in expanded view or tooltip:
     - Times used: 12 optimizations
     - Total savings attributed: R 1,234.50
     - Last used: 2 weeks ago
     - Average savings: R 102 per trip

**Empty State:**
- No cards added yet
- Illustration: Loyalty card stack (200px)
- Message: "Add your loyalty cards to unlock better prices"
- CTA: "Add Your First Card" (Primary, Large)

**States:**
- Default (cards loaded)
- Loading (skeleton loaders)
- Empty state (no cards)
- Verification pending (unverified cards highlighted)

**Interactions:**
- Toggle switch → Activate/deactivate card, update status
- Click "Edit" → Open edit modal with card details pre-filled
- Click "Delete" → Show confirmation dialog, then remove card
- Click "+ Add Card" → Open add card modal
- Complete verification → Update badge to "Verified", show success toast

**Figma Notes:**
- Design loyalty card component with realistic card appearance
- Create variants for each retailer (different logo, gradient colors)
- Add verification status badges
- Design add card modal
- Create verification flow screens
- Include empty state
- Show usage stats tooltip or expanded view
- Prototype card activation toggle

### Screen 8: Receipt Reconciliation

**Purpose:** Upload receipt and compare predicted vs. actual costs for accuracy tracking

**Layout:**

**Mobile (375px):**
```
[Header: "Receipt Reconciliation"]
[Select Shopping Plan]
  - Dropdown: "October Groceries - Checkers (R 1,234.50)"
[Upload Receipt Section]
  - Drag-drop area (or "Take Photo" on mobile)
  - Or: "Enter Manually" link
[After Upload: Comparison View]
  [Comparison Card]
    - Predicted: R 1,234.50
    - Actual: R 1,256.80
    - Variance: +R 22.30 (1.8%)
  [Feedback Form (if variance >5%)]
    - "What caused the difference?"
    - Checkboxes: Items out of stock, Different sizes, Promo expired, Loyalty not applied, Other
    - Text area: Additional notes
  [Submit Button]
    - "Submit Feedback" (Primary)
```

**Desktop (1440px):**
```
[Main Content (Max 900px)]
  [Header: "Receipt Reconciliation"]
  [2-column Layout]
    [Left: Upload Section]
      - Shopping plan selector
      - Drag-drop upload area
      - OR Manual entry form
    [Right: Comparison View]
      - Predicted vs. Actual card
      - Variance breakdown
      - Feedback form
```

**Key Elements:**

1. **Shopping Plan Selector**
   - Label: "Which shopping trip is this receipt for?"
   - Select dropdown or searchable list:
     - "October Groceries - Checkers (R 1,234.50) - Oct 15, 2025"
     - "September Groceries - Pick n Pay (R 1,089.20) - Sep 12, 2025"
   - If no plans: "You don't have any recent shopping plans. Upload for data collection purposes?"

2. **Upload Receipt Section**
   - Drag-Drop Area:
     - Dashed border, large (300x200px minimum)
     - Icon: Upload (48px)
     - Text: "Drag and drop your receipt here, or click to browse"
     - Accepted formats: JPEG, PNG, PDF
     - Max size: 10MB
   - Mobile: Replace with "Take Photo" button using device camera
   - Alternative: "Enter Manually" link below

3. **Manual Entry Form**
   - If user clicks "Enter Manually":
     - Store name: Select dropdown (Checkers, Pick n Pay, etc.)
     - Till total: Number input "R 1,256.80"
     - Shop date: Date picker
     - Optional: Upload receipt anyway for future OCR
     - "Submit" button

4. **Comparison View**
   - Shows after receipt upload or manual entry
   - Card component with 2 columns:
     - Left: "Predicted"
       - Amount: R 1,234.50 (H2)
       - Icon: Calculator
     - Right: "Actual"
       - Amount: R 1,256.80 (H2)
       - Icon: Receipt
   - Variance row:
     - "Variance: +R 22.30 (1.8%)" (if higher, red; if lower, green)
     - Visual: Progress bar showing accuracy (98.2%)
   - Breakdown (collapsible):
     - Predicted subtotal: R 1,219.50
     - Predicted loyalty: -R 0.00
     - Predicted total: R 1,234.50
     - Actual till total: R 1,256.80
     - Difference: +R 22.30

5. **Feedback Form (Conditional)**
   - Only show if variance >5%
   - Title: "Help us improve - What caused the difference?"
   - Multiple choice (checkboxes):
     - "Items were out of stock"
     - "Bought different sizes than planned"
     - "Promotion had expired"
     - "Loyalty card discount not applied"
     - "Prices were different in-store"
     - "Other (please specify)"
   - Text area: "Additional notes (optional)"
   - Character count: 0/500

6. **Success State (Close Match)**
   - If variance <5%:
     - Show celebration message: "Great match! Our prediction was within 2%"
     - Icon: CheckCircle (green, 64px)
     - Stat: "You're helping TillLess improve accuracy for 1,200 users"
     - Confetti animation (subtle)

7. **Impact Message**
   - Always show after submission:
     - "Thank you! Your feedback helps improve predictions"
     - "Impact: You've contributed to 5 reconciliations this month"
     - Progress bar: "Help us reach 100 reconciliations!"

8. **Receipt Preview (Phase 2)**
   - After OCR processing (future feature):
     - Show extracted line items in table
     - User can correct matches
     - "This looks correct" confirmation

**Empty State:**
- No receipt uploaded yet
- Illustration: Receipt with checkmark (200px)
- Message: "Upload a receipt to track accuracy"
- Subtext: "This helps us improve predictions for everyone"

**States:**
- Default (no receipt)
- Receipt uploading (progress bar)
- Receipt uploaded (comparison view)
- Close match (<5% variance) - celebration
- Large variance (>5% variance) - feedback form
- Submitted (success message)

**Interactions:**
- Drag receipt into upload area → Show progress, process, display comparison
- Click "Take Photo" (mobile) → Open device camera, capture, upload
- Click "Enter Manually" → Show manual entry form, hide upload area
- Select variance reason checkboxes → Enable "Submit" button
- Click "Submit Feedback" → Save feedback, show success toast, navigate to dashboard

**Figma Notes:**
- Design drag-drop upload area with file hover state
- Create comparison card showing predicted vs. actual with variance
- Design feedback form with checkboxes and text area
- Create success state with celebration message
- Add manual entry form view
- Include empty state
- Prototype file upload flow (show progress bar)
- Add confetti animation mockup for close match celebration

---

## Figma Plugins & Resources

### Recommended Plugins

1. **Iconify**
   - Purpose: Access Lucide icon library directly in Figma
   - Install: Figma Community → Search "Iconify"
   - Usage: Insert Lucide icons on-demand, automatically sized

2. **Unsplash / Pexels**
   - Purpose: Stock photos for product images, empty states
   - Install: Built-in to Figma
   - Usage: Replace image placeholders with realistic product photos

3. **Content Reel**
   - Purpose: Generate realistic data (names, prices, dates)
   - Install: Figma Community
   - Usage: Populate item lists with varied data instead of "Lorem ipsum"

4. **Stark**
   - Purpose: Check accessibility (color contrast, text size)
   - Install: Figma Community
   - Usage: Validate color combinations meet WCAG AA standards

5. **Design Lint**
   - Purpose: Check for design consistency (spacing, colors, text styles)
   - Install: Figma Community
   - Usage: Run before handoff to catch inconsistencies

6. **Auto Layout Shortcuts**
   - Purpose: Speed up Auto Layout creation
   - Install: Figma Community
   - Usage: Quickly add Auto Layout to multiple frames

7. **Table Generator**
   - Purpose: Create data tables quickly
   - Install: Figma Community
   - Usage: Generate itemized price comparison tables

8. **Figmotion**
   - Purpose: Export animations to Lottie JSON for development
   - Install: Figma Community
   - Usage: Create micro-animations (loading spinners, etc.) that developers can implement

9. **Design System Organizer**
   - Purpose: Organize components, styles, and tokens
   - Install: Figma Community
   - Usage: Keep component library clean and navigable

10. **Similayer**
    - Purpose: Select all similar layers (same color, text style, etc.)
    - Install: Figma Community
    - Usage: Bulk update spacing, colors across multiple components

### External Resources

**Retailer Assets:**
- Checkers Logo: [Source from retailer website or create placeholder]
- Pick n Pay Logo: [Source from retailer website or create placeholder]
- Shoprite Logo: [Source from retailer website or create placeholder]
- Woolworths Logo: [Source from retailer website or create placeholder]
- Makro Logo: [Source from retailer website or create placeholder]

**Note:** Use official retailer logos only if licensing permits. Otherwise, create simplified placeholder versions.

**Illustrations:**
- Undraw: https://undraw.co (free illustrations for empty states)
- Storyset: https://storyset.com (customizable illustrations)
- humaaans: https://humaaans.com (people illustrations)

**Product Images:**
- Unsplash: https://unsplash.com/s/photos/groceries
- Pexels: https://pexels.com
- Placeholder: Use simple colored rectangles with product name text for MVP

**Fonts:**
- Inter: https://fonts.google.com/specimen/Inter
- JetBrains Mono: https://fonts.google.com/specimen/JetBrains+Mono
- Install locally and in Figma font menu

**Design Inspiration:**
- Dribbble: Search "e-commerce dashboard", "shopping list app", "price comparison"
- Mobbin: Browse mobile app patterns
- shadcn/ui examples: https://ui.shadcn.com/examples for component reference

---

## Workflow & Best Practices

### Design Process

**Step 1: Setup (1-2 hours)**
1. Create Figma file with page structure
2. Set up grids (mobile, tablet, desktop)
3. Create color styles from Design Tokens
4. Create text styles from Typography tokens
5. Import icons using Iconify plugin
6. Download and install fonts

**Step 2: Component Library (4-6 hours)**
1. Build foundation components (buttons, inputs, badges)
2. Create component variants (states, sizes, types)
3. Build composite components (cards, modals, tables)
4. Test components with real data (use Content Reel)
5. Organize components in library page
6. Document usage in component descriptions

**Step 3: Screen Designs (12-16 hours)**
1. Start with mobile screens (375px)
2. Design 8 key screens in mobile-first approach
3. Include all states (default, empty, loading, error)
4. Duplicate and adapt for tablet (768px)
5. Duplicate and adapt for desktop (1440px)
6. Ensure consistency across breakpoints

**Step 4: Interactive Prototypes (4-6 hours)**
1. Link mobile screens into 4 main user flows
2. Add transitions (Smart Animate for smooth motion)
3. Include micro-interactions (button hover, modal open)
4. Test prototype flow end-to-end
5. Share prototype with stakeholders for feedback

**Step 5: Handoff Preparation (2-3 hours)**
1. Run Design Lint to catch inconsistencies
2. Check accessibility with Stark plugin
3. Organize layers with clear naming
4. Add annotations for complex interactions
5. Export assets (logos, icons) for developers
6. Create developer handoff notes

### Collaboration Tips

**With Developers:**
- Use Comments feature to explain complex interactions
- Provide exact spacing values in component descriptions
- Export CSS for colors and shadows (use Figma's Inspect panel)
- Share prototype links for interactive reference

**With Stakeholders:**
- Present designs in Figma presentation mode
- Use sections to organize work-in-progress vs. final designs
- Create separate "Review" page for stakeholder-specific screens
- Schedule design review meetings with prototype walkthrough

**With Product Team:**
- Link user flows to PRD requirements
- Annotate screens with feature descriptions
- Use FigJam for collaborative brainstorming on UX problems

### Version Control

**Branching:**
- Create branches for major design iterations
- Branch naming: `feature/loyalty-cards`, `revision/dashboard-v2`
- Merge back to main file after approval

**Version History:**
- Save versions at key milestones: "Component library complete", "Mobile screens v1", "Final handoff"
- Add descriptions to versions for easy reference

**Documentation:**
- Maintain a "README" page in Figma with:
  - Project overview
  - Team members
  - Design decisions log
  - Open questions
  - Change log

### Quality Checklist

Before marking designs as "Ready for Development":

- [ ] All color styles match design tokens
- [ ] All text styles match typography scale
- [ ] Spacing uses 4px increment grid
- [ ] All touch targets meet 44x44px minimum (mobile)
- [ ] Color contrast meets WCAG AA (use Stark plugin)
- [ ] All components have variants for states (default, hover, focused, disabled)
- [ ] Auto Layout used for all responsive components
- [ ] Frames named clearly and consistently
- [ ] All screens have mobile, tablet, desktop variants
- [ ] Interactive prototype flows work end-to-end
- [ ] Accessibility annotations added for screen readers
- [ ] Design Lint passes with zero errors
- [ ] All external assets (logos, images) sourced or placeholders documented
- [ ] Developer handoff notes written
- [ ] Stakeholder approval obtained

---

## Next Steps After Figma Designs

1. **Developer Handoff Meeting**
   - Walk through designs with engineering team
   - Explain interactive flows and edge cases
   - Clarify responsive behavior and animations
   - Answer technical questions

2. **Design System in Code**
   - Developers implement shadcn/ui components
   - Match Figma designs exactly (colors, spacing, typography)
   - Create Storybook for component showcase (optional)

3. **Iterative Refinement**
   - Review implemented designs in browser
   - Test on real devices (mobile, tablet)
   - Identify gaps between design and implementation
   - Iterate based on technical constraints

4. **User Testing**
   - Conduct usability testing with clickable prototypes
   - Gather feedback on flows, clarity, and ease of use
   - Iterate designs based on user feedback

5. **Handoff for Phase 1.5 & Phase 2**
   - Maintain design system for future features
   - Design new screens for Phase 2 enhancements
   - Keep Figma file as single source of truth

---

**End of Figma Handoff Guide**

**Questions or Need Clarification?**
Contact Sally (UX Expert) or refer to the UI/UX Specification document.

**Document Version:** 1.0
**Last Updated:** 2025-10-19
