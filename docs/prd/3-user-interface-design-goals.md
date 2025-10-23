# 3. User Interface Design Goals

## 3.1 Overall UX Vision

**"The iPhone Moment: Category-First Simplicity"**

TillLess transforms grocery shopping from a 40-item decision gauntlet into a 5-8 category strategy session. The core UX principle is **progressive disclosure**: users see category-level insights first (budget, savings opportunities, store recommendations), drill down only when needed, and trust the AI to handle item-level matching.

**Key UX Principles:**
- **Category-first interface** - Default view shows 5-8 core categories with budget vs. spend, savings opportunities, and optimal retailers per category
- **Threshold-aware nudges** - Only surface recommendations when savings ≥R30 AND travel ≤10 minutes (persona-dependent)
- **Zero-state magic** - First-time users start with 3-5 common items per category to demonstrate value immediately (no empty basket frustration)
- **Trust through transparency** - Show AI confidence scores, alternative matches, and "why this recommendation" explanations
- **Management by exception** - Default state assumes AI got it right; users intervene only when needed (red flags, preferences, constraints)

**Emotional Journey:**
1. **Skepticism** (first visit): "Another price comparison app?"
2. **Surprise** (first optimization): "Wait, I can save R240 just by splitting dairy and produce?"
3. **Trust** (third use): "I'll just accept the recommendations, they're always good"
4. **Advocacy** (after 3 months): "This is how I grocery shop now" + referring friends

---

## 3.2 Key Interaction Paradigms

1. **Category Cards as Primary UI Element**
   - Each category displays: Budget target, current spend, potential savings, recommended retailer(s), item count
   - Visual indicators: Green (on budget, optimized), Yellow (savings opportunity ≥R30), Red (over budget or critical issue)
   - Tap to expand: See sub-categories, individual items, alternative retailers, AI explanations

2. **Persona-Driven Defaults**
   - User selects optimization persona (Thrifty, Balanced, Premium Fresh, Time Saver) at onboarding
   - Persona sets default thresholds (e.g., Thrifty: show all savings ≥R10, Premium Fresh: only ≥R50 if same travel)
   - Persona adapts over time based on user acceptance patterns

3. **Threshold Nudge Pattern**
   - Recommendations appear as dismissible cards: "Save R42 on Dairy by switching to Checkers (5 min away)"
   - User can: Accept (1-tap), Dismiss (swipe), Set constraint ("Never recommend this retailer")
   - Dismissed nudges train the AI preference model

4. **Loyalty Integration as Contextual Layer**
   - Loyalty card status shown per retailer: "Xtra Savings Active" badge
   - Prices display loyalty discount: ~~R45.99~~ **R38.99** (Xtra Savings)
   - Onboarding wizard prompts for loyalty card numbers (optional)

5. **Progressive Disclosure for Item Details**
   - Default view: Category cards only
   - Tap category: See sub-categories and top items
   - Tap item: See product details, alternatives, price history, OCR confidence if crowdsourced
   - Long-press item: Quick actions (delete, substitute, add note)

6. **Shopping List Export as Final Step**
   - After optimization accepted, user exports to: PDF, Checkers Sixty60, Pick n Pay Asap, Woolworths Dash
   - Export includes: Store-grouped lists, map with optimal route, estimated total per store

---

## 3.3 Core Screens and Views

**MVP Phase 1 Screens:**

1. **Onboarding Flow** (5 screens)
   - Welcome + value prop (show R240 average savings)
   - Persona selection (Thrifty, Balanced, Premium Fresh, Time Saver) with illustrations
   - Location + retailers (select preferred retailers, auto-detect location)
   - Loyalty cards (optional, scan/manual entry)
   - Zero-state basket seed (3-5 common items per category)

2. **Category Dashboard** (Primary screen - 80% of user time)
   - Header: Total budget, total spend, total savings, persona badge
   - Category cards (5-8): Budget, spend, savings opportunity, recommended retailer, item count
   - Floating action button: "Add Item" or "Optimize Now"
   - Bottom nav: Dashboard, Lists, History, Profile

3. **Category Detail View**
   - Category header: Name, budget, spend, savings, retailer recommendation
   - Sub-categories (if applicable): Expand/collapse accordion
   - Item list: Product name, price, retailer, loyalty badge, AI confidence score
   - Actions: Add item, bulk edit, set category budget

4. **Optimization Results Screen**
   - Summary card: Total savings, number of stores, total travel time, acceptance rate
   - Store breakdown: Per-store subtotal, item count, distance, loyalty savings
   - Threshold nudges: "Save R42 by switching Dairy to Checkers" with accept/dismiss
   - Export button: "Send to Sixty60" or "Download PDF"

5. **Shopping List Export View**
   - Store-grouped lists: Checkers (R450, 12 items), Pick n Pay (R320, 8 items)
   - Map view: Optimal route with travel time
   - Export options: PDF, Sixty60, Asap, Dash, print, share

6. **Item Search & Add**
   - Search bar with auto-complete (category-aware: "milk" suggests Dairy category)
   - Recent items, popular items, category shortcuts
   - Item card: Product name, price, retailer, loyalty badge, add button

7. **User Profile & Settings**
   - Persona selection (change anytime)
   - Loyalty cards (add/edit/remove)
   - Preferred retailers (enable/disable)
   - Threshold settings (savings threshold, travel threshold)
   - Household budget (Phase 2 feature teaser)

8. **Crowdsourced Submission Feedback** (Social integration)
   - Success toast: "Thanks for submitting! +10 points, Bread price verified"
   - Reputation dashboard: Points, badges, leaderboard (gamification)
   - Submission history: Status (pending, approved, rejected), confidence scores

**Phase 1.5 Screens (Post-MVP):**
- Category Portfolio Manager (adaptive learning, 3+ month patterns)
- 2-Store Surgical Optimization (split categories across retailers)
- Budget Tracking & Trends (monthly spend by category, savings history)

**Phase 2 Screens:**
- Household Budget Manager (multi-member, category allocations)
- Advanced Filters (dietary restrictions, brand preferences, sustainability scores)

**Phase 3/4 Screens (MCP + Voice AI):**
- Voice Conversation UI (chat-style interface with voice input)
- AI Insights Dashboard (proactive suggestions, anomaly detection)
- Autonomous Execution Logs (management by exception, approval queue)

**Phase 5 Screens (Reverse Marketplace):**
- Demand Pool Dashboard (aggregated demand, bidding status)
- Retailer Bidding Interface (for retailers to submit competitive offers)
- Attribution & Revenue Sharing (transaction tracking, commission reporting)

---

## 3.4 Branding

**Design System: Tailwind CSS v4 + Shadcn UI (October 2025)**

**Component Foundation: Shadcn UI**

Shadcn UI (latest October 2025 release) provides the foundation for all UI components:

**Why Shadcn UI:**
- **Copy-paste, not dependency**: Components live in your codebase (`components/ui/`), full customization control
- **Tailwind-native**: Built on Tailwind CSS v4, leverages all new features (OKLCH colors, container queries)
- **Radix UI primitives**: Accessible, unstyled components (Dialog, Dropdown, Tabs, etc.) with full keyboard navigation
- **TypeScript-first**: Full type safety out of the box
- **React Native compatibility**: Can adapt for NativeWind (some components work as-is, others need platform-specific versions)
- **October 2025 updates**: Enhanced form components, improved dark mode, better tree-shaking, new data tables/command palette

**Shadcn UI Components (MVP Phase 1):**

Core components to install via `npx shadcn@latest add <component>`:
- **Layout**: `card`, `separator`, `scroll-area`
- **Navigation**: `navigation-menu`, `tabs`, `breadcrumb`
- **Forms**: `form`, `input`, `label`, `select`, `checkbox`, `radio-group`, `switch`
- **Feedback**: `alert`, `toast`, `dialog`, `alert-dialog`, `badge`
- **Data Display**: `table`, `avatar`, `skeleton`, `progress`
- **Overlay**: `popover`, `dropdown-menu`, `tooltip`, `sheet` (mobile drawer)
- **Advanced**: `command` (command palette for search), `calendar` (date picker)

**Custom TillLess Components (built on Shadcn primitives):**
- **CategoryCard**: `Card` + custom layout for budget/spend/savings
- **ThresholdNudge**: `Alert` + dismiss action + accept button
- **OptimizationResultCard**: `Card` + `Badge` for savings, retailer logos
- **ShoppingListItem**: Custom component with `Checkbox` + price display
- **PersonaSelector**: `RadioGroup` with illustrated cards
- **RetailerToggle**: `Switch` with retailer branding

**Color Palette (Tailwind v4 + Shadcn UI theme):**

Shadcn UI uses CSS variables for theming, compatible with Tailwind v4's OKLCH color space:

```css
/* app/globals.css - Shadcn UI + TillLess custom theme */
@layer base {
  :root {
    /* Shadcn UI base colors (customized for TillLess) */
    --background: oklch(100% 0 0); /* White */
    --foreground: oklch(20% 0 0); /* Almost black */

    --card: oklch(100% 0 0);
    --card-foreground: oklch(20% 0 0);

    --popover: oklch(100% 0 0);
    --popover-foreground: oklch(20% 0 0);

    /* TillLess brand colors (OKLCH for perceptual uniformity) */
    --primary: oklch(65% 0.15 145); /* Fresh green - savings, optimization */
    --primary-foreground: oklch(100% 0 0); /* White text on green */

    --secondary: oklch(55% 0.15 245); /* Deep blue - trust, intelligence */
    --secondary-foreground: oklch(100% 0 0);

    --accent: oklch(65% 0.15 35); /* Warm orange - nudges, alerts */
    --accent-foreground: oklch(100% 0 0);

    /* Semantic status colors */
    --success: oklch(65% 0.15 145); /* Green - on budget */
    --warning: oklch(75% 0.12 85); /* Yellow - savings opportunity */
    --destructive: oklch(55% 0.20 25); /* Red - over budget/alert */
    --destructive-foreground: oklch(100% 0 0);

    /* Neutral grays (Shadcn UI defaults) */
    --muted: oklch(96% 0 0);
    --muted-foreground: oklch(45% 0 0);

    --border: oklch(90% 0 0);
    --input: oklch(90% 0 0);
    --ring: oklch(65% 0.15 145); /* Focus ring matches primary */

    --radius: 0.5rem; /* 8px default border radius */
  }

  .dark {
    --background: oklch(15% 0 0); /* Dark background */
    --foreground: oklch(98% 0 0); /* Near white text */

    --card: oklch(20% 0 0);
    --card-foreground: oklch(98% 0 0);

    --popover: oklch(20% 0 0);
    --popover-foreground: oklch(98% 0 0);

    /* Brand colors adjusted for dark mode readability */
    --primary: oklch(70% 0.15 145); /* Slightly lighter green */
    --primary-foreground: oklch(15% 0 0); /* Dark text on green */

    --secondary: oklch(60% 0.15 245);
    --secondary-foreground: oklch(15% 0 0);

    --accent: oklch(70% 0.15 35);
    --accent-foreground: oklch(15% 0 0);

    --muted: oklch(25% 0 0);
    --muted-foreground: oklch(65% 0 0);

    --border: oklch(30% 0 0);
    --input: oklch(30% 0 0);
    --ring: oklch(70% 0.15 145);
  }
}
```

**Typography (Tailwind v4 + Shadcn UI):**

Shadcn UI uses Tailwind's typography plugin and default font stack:

- **Headings**: `font-sans font-bold` (Geist Sans on Vercel, fallback to system sans-serif)
- **Body**: `text-base leading-relaxed` (16px minimum, 1.5 line height)
- **Numbers**: `font-mono tabular-nums` (Geist Mono for prices, tabular alignment)
- **Responsive type**: `text-sm md:text-base lg:text-lg` (Tailwind responsive utilities)

**Iconography:**
- **Primary**: Lucide React (Shadcn UI's default icon library, successor to Heroicons)
  - 1000+ icons, tree-shakable, consistent design language
  - Example: `import { ShoppingCart, AlertCircle, Check } from 'lucide-react'`
- **Custom category icons**: Custom SVG illustrations where Lucide insufficient

**Tone:**
- Friendly but competent ("Your smart shopping assistant")
- Data-driven but not robotic (show personality in zero states, error messages)
- Empowering ("You saved R240 this week!")

**Brand Differentiation:**
- vs. PriceCheck: **Category intelligence**, not just item comparison
- vs. Troli: **Multi-retailer optimization**, not just list management
- vs. Sixty60: **Savings-first**, not just convenience
- vs. Zapper: **Proactive optimization**, not just loyalty tracking

---

## 3.5 Accessibility

**Target: WCAG AA Compliance**

Requirements:
- Color contrast ratios ≥4.5:1 (text), ≥3:1 (UI components)
- Keyboard navigation support (tab order, focus indicators)
- Screen reader compatibility (ARIA labels, semantic HTML)
- Touch targets ≥44px × 44px (mobile)
- Reduced motion support (respect `prefers-reduced-motion`)
- Text resizing up to 200% without loss of functionality
- Alternative text for all images (especially OCR-sourced product images)

**South African Context:**
- Support for Afrikaans, Zulu, Xhosa language options (Phase 1.5)
- Data-conscious design (optimize image sizes, lazy loading, offline mode)

---

## 3.6 Target Device and Platforms

**MVP Phase 1: Progressive Web App (PWA) - Web Responsive**

**Primary Platform: Next.js 15 + Tailwind CSS v4 + Shadcn UI (October 2025)**
- Desktop: 1280px+ (research, detailed analysis, household management)
- Tablet: 768px-1279px (comfortable shopping list editing)
- Mobile: 320px-767px (PRIMARY use case - on-the-go shopping)

**PWA Features (MVP Phase 1):**
- Service worker with offline support (Next.js built-in PWA support)
- App manifest for "Add to Home Screen" (iOS Safari, Android Chrome)
- Push notifications (price drop alerts, threshold nudges) - Web Push API
- Background sync for shopping list updates when connectivity restored
- Local storage persistence for basket data (IndexedDB via Dexie.js)

**Technical Requirements:**
- **Mobile-first Tailwind approach**: Design for 320px first, enhance for larger screens
- **Touch-optimized interactions**:
  - Minimum touch targets: `min-h-11 min-w-11` (44px × 44px using Tailwind's spacing scale)
  - Swipe gestures for dismiss actions (Framer Motion or React Aria)
  - Long-press for quick actions (React Aria `useLongPress`)
- **Performance**:
  - Target <3s initial load on 3G (Next.js automatic code splitting)
  - Lighthouse score ≥90 (Performance, Accessibility, Best Practices, SEO)
  - Tailwind v4's improved build performance (faster compilation, smaller CSS bundle)
- **Responsive images**: Next.js `<Image>` component with automatic optimization
- **Prefetching**: Next.js Link prefetching for instant navigation

**Phase 1.5: React Native (Expo) - Cross-Platform Mobile Apps**

**Why React Native + Expo:**
- **Code sharing**: 80-90% code reuse between web (Next.js) and mobile (React Native)
- **Shared design system**: NativeWind (Tailwind CSS for React Native) ensures visual consistency
- **Expo advantages**: OTA updates, managed workflow, Expo Router, EAS Build

**Platform Support:**
- **iOS**: iPhone 12+ (iOS 15+) - App Store distribution
- **Android**: Android 10+ (API 29+) - Google Play Store distribution

**Native Features (React Native advantages over PWA):**
1. **Camera Integration**: Barcode scanning, receipt OCR, crowdsourced price photo submission
2. **Push Notifications**: Richer notifications than Web Push
3. **Location Services**: Background location, geofencing for retailer proximity alerts
4. **Offline-First**: Better offline experience (instant app launch, no browser chrome)
5. **Performance**: Native UI components, smoother animations

**NativeWind (Tailwind for React Native):**
- Use same Tailwind v4 config for web and mobile
- Unified component library: `<View className="bg-primary p-4 rounded-lg" />`
- Platform-specific styles: `className="shadow-md ios:shadow-sm android:elevation-2"`

**Browser Support (PWA - MVP):**
- **Chrome/Edge 90+** (primary - best PWA support)
- **Safari 15+** (iOS users - improved PWA support in iOS 15+)
- **Firefox 88+** (limited PWA support, acceptable graceful degradation)

**React Native Support (Phase 1.5):**
- **iOS**: 15.0+ (iPhone 12, iPhone SE 2022+)
- **Android**: 10+ (API 29+, ~85% market coverage in South Africa)

---
