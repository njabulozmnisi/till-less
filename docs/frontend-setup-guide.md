# TillLess Frontend Setup Guide

**Document Purpose:** Complete step-by-step guide to set up the TillLess frontend application with Next.js, TypeScript, Tailwind CSS, shadcn/ui, and all required dependencies.

**Created:** 2025-10-22
**Based on:**
- `docs/front-end-spec.md` v2.0
- `docs/architecture/frontend-architecture.md`
- `docs/design-tokens.json`

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Project Initialization](#2-project-initialization)
3. [Tailwind CSS Configuration](#3-tailwind-css-configuration)
4. [shadcn/ui Setup](#4-shadcnui-setup)
5. [Font Configuration](#5-font-configuration)
6. [Redux Toolkit & RTK Query](#6-redux-toolkit--rtk-query)
7. [Authentication (BetterAuth)](#7-authentication-betterauth)
8. [Testing Setup](#8-testing-setup)
9. [Linting & Formatting](#9-linting--formatting)
10. [Performance Monitoring](#10-performance-monitoring)
11. [Verification](#11-verification)

---

## 1. Prerequisites

### Required Software

- **Node.js**: 20.11.1 LTS or later
- **pnpm**: 9.14.2 or later
- **Git**: Latest version

### Install pnpm (if not installed)

```bash
npm install -g pnpm@9.14.2
```

### Verify Installations

```bash
node --version  # Should show v20.11.1 or later
pnpm --version  # Should show 9.14.2 or later
git --version   # Any recent version
```

---

## 2. Project Initialization

### 2.1 Create Next.js App

Navigate to the project root (`till-less/`) and create the web app:

```bash
cd /Users/njabulomnisi/Projects/Dojo/till-less

# Create Next.js app in apps/web directory
pnpm create next-app@15.1.3 apps/web --typescript --tailwind --app --src-dir --import-alias "@/*"
```

**Interactive Prompts (select these options):**
- ✔ Would you like to use TypeScript? **Yes**
- ✔ Would you like to use ESLint? **Yes**
- ✔ Would you like to use Tailwind CSS? **Yes**
- ✔ Would you like to use `src/` directory? **Yes**
- ✔ Would you like to use App Router? **Yes**
- ✔ Would you like to customize the default import alias? **No** (use default @/*)

### 2.2 Navigate to Web App

```bash
cd apps/web
```

### 2.3 Update package.json

Replace the generated `package.json` with our specifications:

```json
{
  "name": "@tillless/web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:a11y": "playwright test tests/accessibility",
    "format": "prettier --write \"**/*.{ts,tsx,md,json}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,md,json}\""
  },
  "dependencies": {
    "next": "15.1.3",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "@reduxjs/toolkit": "2.5.0",
    "react-redux": "9.1.2",
    "better-auth": "1.0.7",
    "@better-auth/react": "1.0.7",
    "react-hook-form": "7.54.2",
    "zod": "3.24.1",
    "@hookform/resolvers": "3.9.1",
    "framer-motion": "11.15.0",
    "lucide-react": "0.469.0",
    "clsx": "2.1.1",
    "tailwind-merge": "2.6.0",
    "date-fns": "4.1.0",
    "react-countup": "6.5.3",
    "sonner": "1.7.1"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "typescript": "5.7.2",
    "tailwindcss": "3.4.17",
    "postcss": "^8",
    "autoprefixer": "^10",
    "eslint": "9.17.0",
    "eslint-config-next": "15.1.3",
    "eslint-plugin-jsx-a11y": "^6.10.2",
    "prettier": "3.4.2",
    "prettier-plugin-tailwindcss": "^0.6.9",
    "@playwright/test": "1.49.1",
    "@axe-core/playwright": "^4.10.2",
    "vitest": "2.1.8",
    "@testing-library/react": "16.1.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@vitejs/plugin-react": "^4.3.4",
    "jsdom": "^25.0.1",
    "msw": "2.7.0"
  }
}
```

### 2.4 Install Dependencies

```bash
pnpm install
```

---

## 3. Tailwind CSS Configuration

### 3.1 Update tailwind.config.ts

Replace the generated `tailwind.config.ts` with our OKLCH color configuration:

```typescript
import type { Config } from "tailwindcss"
import { fontFamily } from "tailwindcss/defaultTheme"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "oklch(var(--border))",
        input: "oklch(var(--input))",
        ring: "oklch(var(--ring))",
        background: "oklch(var(--background))",
        foreground: "oklch(var(--foreground))",
        primary: {
          DEFAULT: "oklch(var(--primary))",
          foreground: "oklch(var(--primary-foreground))",
          hover: "oklch(var(--primary-hover))",
          light: "oklch(var(--primary-light))",
        },
        secondary: {
          DEFAULT: "oklch(var(--secondary))",
          foreground: "oklch(var(--secondary-foreground))",
          hover: "oklch(var(--secondary-hover))",
          light: "oklch(var(--secondary-light))",
        },
        accent: {
          DEFAULT: "oklch(var(--accent))",
          foreground: "oklch(var(--accent-foreground))",
          hover: "oklch(var(--accent-hover))",
          light: "oklch(var(--accent-light))",
        },
        success: "oklch(var(--success))",
        warning: "oklch(var(--warning))",
        error: "oklch(var(--error))",
        info: "oklch(var(--info))",
        destructive: {
          DEFAULT: "oklch(var(--destructive))",
          foreground: "oklch(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "oklch(var(--muted))",
          foreground: "oklch(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "oklch(var(--popover))",
          foreground: "oklch(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "oklch(var(--card))",
          foreground: "oklch(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", ...fontFamily.sans],
        mono: ["var(--font-jetbrains-mono)", ...fontFamily.mono],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-in-from-bottom": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in": "slide-in-from-bottom 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
```

### 3.2 Update globals.css

Replace `src/app/globals.css` with our OKLCH color variables:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Primary: Fresh Green (Savings, Success) */
    --primary: 65% 0.15 145;           /* oklch(65% 0.15 145) */
    --primary-foreground: 100% 0 0;     /* White */
    --primary-hover: 60% 0.15 145;
    --primary-light: 95% 0.05 145;

    /* Secondary: Deep Teal (Trust, Intelligence) */
    --secondary: 55% 0.12 200;
    --secondary-foreground: 100% 0 0;
    --secondary-hover: 50% 0.12 200;
    --secondary-light: 95% 0.04 200;

    /* Accent: Warm Amber (Nudges, Opportunities) */
    --accent: 70% 0.15 55;
    --accent-foreground: 15% 0 0;       /* Dark text */
    --accent-hover: 65% 0.15 55;
    --accent-light: 95% 0.05 55;

    /* Semantic Colors */
    --success: 65% 0.15 145;            /* Same as primary */
    --warning: 70% 0.15 55;             /* Same as accent */
    --error: 60% 0.20 25;               /* Warm red */
    --info: 65% 0.15 240;               /* Cool blue */

    /* Neutrals */
    --background: 100% 0 0;             /* Pure white */
    --foreground: 15% 0 0;              /* Near black */
    --muted: 96% 0 0;                   /* Light gray */
    --muted-foreground: 50% 0 0;        /* Mid gray */
    --border: 90% 0 0;
    --input: 90% 0 0;
    --ring: 65% 0.15 145;               /* Focus ring (primary) */

    /* Card */
    --card: 100% 0 0;
    --card-foreground: 15% 0 0;

    /* Popover */
    --popover: 100% 0 0;
    --popover-foreground: 15% 0 0;

    /* Destructive */
    --destructive: 60% 0.20 25;
    --destructive-foreground: 100% 0 0;

    --radius: 0.5rem;
  }

  /* Support for prefers-reduced-motion */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}
```

---

## 4. shadcn/ui Setup

### 4.1 Install shadcn/ui CLI

```bash
pnpm dlx shadcn@latest init
```

**Interactive Prompts:**
- ✔ Which style would you like to use? **Default**
- ✔ Which color would you like to use as base color? **Skip** (we have custom OKLCH colors)
- ✔ Would you like to use CSS variables for colors? **Yes**

### 4.2 Install Core Components

Install all components we'll need for MVP:

```bash
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add card
pnpm dlx shadcn@latest add input
pnpm dlx shadcn@latest add label
pnpm dlx shadcn@latest add badge
pnpm dlx shadcn@latest add progress
pnpm dlx shadcn@latest add checkbox
pnpm dlx shadcn@latest add switch
pnpm dlx shadcn@latest add select
pnpm dlx shadcn@latest add dialog
pnpm dlx shadcn@latest add sheet
pnpm dlx shadcn@latest add alert
pnpm dlx shadcn@latest add toast
pnpm dlx shadcn@latest add table
pnpm dlx shadcn@latest add dropdown-menu
pnpm dlx shadcn@latest add form
pnpm dlx shadcn@latest add slider
pnpm dlx shadcn@latest add separator
pnpm dlx shadcn@latest add scroll-area
pnpm dlx shadcn@latest add collapsible
pnpm dlx shadcn@latest add tooltip
```

### 4.3 Install tailwindcss-animate

```bash
pnpm add -D tailwindcss-animate
```

---

## 5. Font Configuration

### 5.1 Update app/layout.tsx

Replace `src/app/layout.tsx` with font configuration:

```typescript
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"

// Inter Variable Font (primary sans-serif)
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
})

// JetBrains Mono Variable Font (monospace for prices)
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  preload: true,
})

export const metadata: Metadata = {
  title: "TillLess - Smart Grocery Savings for Gauteng",
  description:
    "Optimize your grocery shopping across Checkers, Pick n Pay, Woolworths, Shoprite, and Makro. Save money with intelligent price comparison and loyalty card optimization.",
  keywords:
    "grocery savings, South Africa, Gauteng, price comparison, Checkers, Pick n Pay, Woolworths",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
```

---

## 6. Redux Toolkit & RTK Query

### 6.1 Create Store Directory Structure

```bash
mkdir -p src/store/{slices,api}
```

### 6.2 Create Store Configuration

**File: `src/store/index.ts`**

```typescript
import { configureStore } from "@reduxjs/toolkit"
import { setupListeners } from "@reduxjs/toolkit/query"
import { baseApi } from "./api/baseApi"

export const makeStore = () => {
  const store = configureStore({
    reducer: {
      // RTK Query API reducer
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
  })

  // Enable refetchOnFocus/refetchOnReconnect behaviors
  setupListeners(store.dispatch)

  return store
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore["getState"]>
export type AppDispatch = AppStore["dispatch"]
```

### 6.3 Create Typed Hooks

**File: `src/store/hooks.ts`**

```typescript
import { useDispatch, useSelector, useStore } from "react-redux"
import type { AppStore, AppDispatch, RootState } from "./index"

// Use throughout app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
export const useAppStore = useStore.withTypes<AppStore>()
```

### 6.4 Create Base API

**File: `src/store/api/baseApi.ts`**

```typescript
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "/api",
    prepareHeaders: (headers) => {
      // Add auth token if available
      const token = typeof window !== "undefined"
        ? localStorage.getItem("authToken")
        : null

      if (token) {
        headers.set("authorization", `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ["Lists", "Optimization", "Receipts", "Preferences", "LoyaltyCards", "Dashboard"],
  endpoints: () => ({}),
})
```

### 6.5 Create Store Provider

**File: `src/store/StoreProvider.tsx`**

```typescript
"use client"

import { useRef } from "react"
import { Provider } from "react-redux"
import { makeStore, AppStore } from "./index"

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const storeRef = useRef<AppStore>()
  if (!storeRef.current) {
    storeRef.current = makeStore()
  }

  return <Provider store={storeRef.current}>{children}</Provider>
}
```

### 6.6 Wrap App with Store Provider

Update `src/app/layout.tsx` to include StoreProvider:

```typescript
import StoreProvider from "@/store/StoreProvider"

export default function RootLayout({
  children,
}: {
  children: React.NodeNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  )
}
```

---

## 7. Authentication (BetterAuth)

### 7.1 Install BetterAuth

```bash
pnpm add better-auth @better-auth/react
```

### 7.2 Create Auth Configuration

**File: `src/lib/auth.ts`**

```typescript
import { betterAuth } from "better-auth"

export const auth = betterAuth({
  database: {
    // Configure database connection (Supabase PostgreSQL)
    type: "postgres",
    url: process.env.DATABASE_URL,
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    // Add social providers if needed (Google, Facebook, etc.)
  },
})
```

### 7.3 Create Auth Client

**File: `src/lib/auth-client.ts`**

```typescript
import { createAuthClient } from "@better-auth/react"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
})
```

---

## 8. Testing Setup

### 8.1 Configure Vitest

**File: `vitest.config.ts`** (create in root of apps/web)

```typescript
import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

**File: `src/test/setup.ts`**

```typescript
import "@testing-library/jest-dom"
```

### 8.2 Configure Playwright

```bash
pnpm create playwright
```

**Interactive Prompts:**
- ✔ Do you want to use TypeScript or JavaScript? **TypeScript**
- ✔ Where to put your end-to-end tests? **tests/e2e**
- ✔ Add a GitHub Actions workflow? **Yes**

**File: `playwright.config.ts`** (create in root of apps/web)

```typescript
import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
})
```

### 8.3 Create Accessibility Test

**File: `tests/accessibility/dashboard.spec.ts`**

```typescript
import { test, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

test.describe("Accessibility Tests", () => {
  test("homepage has no accessibility violations", async ({ page }) => {
    await page.goto("/")

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })
})
```

---

## 9. Linting & Formatting

### 9.1 Configure ESLint

**File: `.eslintrc.json`** (update existing)

```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:jsx-a11y/recommended"
  ],
  "plugins": ["jsx-a11y"],
  "rules": {
    "jsx-a11y/anchor-is-valid": "error",
    "jsx-a11y/alt-text": "error",
    "jsx-a11y/label-has-associated-control": "error"
  }
}
```

### 9.2 Configure Prettier

**File: `.prettierrc.json`** (create in root of apps/web)

```json
{
  "semi": false,
  "trailingComma": "es5",
  "singleQuote": false,
  "tabWidth": 2,
  "useTabs": false,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

**File: `.prettierignore`**

```
node_modules
.next
out
build
dist
```

---

## 10. Performance Monitoring

### 10.1 Install Lighthouse CI

```bash
pnpm add -D @lhci/cli
```

### 10.2 Create Lighthouse Configuration

**File: `lighthouserc.js`** (create in root of apps/web)

```javascript
module.exports = {
  ci: {
    collect: {
      startServerCommand: "pnpm build && pnpm start",
      url: ["http://localhost:3000/"],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:performance": ["warn", { minScore: 0.85 }],
        "categories:best-practices": ["warn", { minScore: 0.90 }],
      },
    },
  },
}
```

---

## 11. Verification

### 11.1 Start Development Server

```bash
pnpm dev
```

Visit http://localhost:3000 - you should see the Next.js welcome page.

### 11.2 Run Type Check

```bash
pnpm typecheck
```

Should complete with no errors.

### 11.3 Run Linter

```bash
pnpm lint
```

Should complete with no errors.

### 11.4 Run Tests

```bash
# Unit tests
pnpm test

# E2E tests (requires dev server running)
pnpm test:e2e

# Accessibility tests
pnpm test:a11y
```

### 11.5 Build Production

```bash
pnpm build
```

Should complete successfully.

---

## 12. Next Steps

After completing this setup:

1. ✅ **Verify all configurations** - Run all verification commands above
2. ⏭️ **Create first component** - Build Dashboard page using AI UI prompts
3. ⏭️ **Set up API routes** - Create Next.js API routes for BFF pattern
4. ⏭️ **Implement authentication** - Set up BetterAuth with login/signup flows
5. ⏭️ **Build component library** - Create CategoryCard, ThresholdNudge, ItemRow
6. ⏭️ **Implement user flows** - Build shopping list → optimization → results flow

---

## Troubleshooting

### Common Issues

**Issue: pnpm install fails**
- Solution: Clear cache `pnpm store prune` then reinstall

**Issue: shadcn/ui components don't match colors**
- Solution: Ensure `globals.css` has correct OKLCH variables

**Issue: Fonts not loading**
- Solution: Check `layout.tsx` has font variables in className

**Issue: TypeScript errors with Redux**
- Solution: Ensure using typed hooks from `src/store/hooks.ts`

**Issue: Tests failing**
- Solution: Run `pnpm install` to ensure all test dependencies installed

---

**Setup Complete!** 🎉

Your TillLess frontend is now ready for development with:
- ✅ Next.js 15 + TypeScript
- ✅ Tailwind CSS with OKLCH colors
- ✅ shadcn/ui component library
- ✅ Inter Variable + JetBrains Mono fonts
- ✅ Redux Toolkit + RTK Query
- ✅ BetterAuth authentication
- ✅ Vitest + Playwright testing
- ✅ Accessibility testing (axe-core)
- ✅ Lighthouse CI performance monitoring

**Reference Documents:**
- UI/UX Specification: `docs/front-end-spec.md`
- AI UI Prompts: `docs/ai-ui-prompts.md`
- Frontend Architecture: `docs/architecture/frontend-architecture.md`
- Design Tokens: `docs/design-tokens.json`
