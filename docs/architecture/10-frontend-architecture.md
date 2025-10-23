# 10. Frontend Architecture

## 10.1 Next.js App Router Structure

```
apps/web/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Authenticated layout
│   │   ├── page.tsx             # Category dashboard
│   │   ├── lists/
│   │   │   └── [id]/
│   │   │       └── page.tsx     # List detail
│   │   ├── optimize/
│   │   │   └── [id]/
│   │   │       └── page.tsx     # Optimization results
│   │   └── profile/
│   │       └── page.tsx         # User settings
│   ├── onboarding/
│   │   └── page.tsx             # 5-step wizard
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Tailwind + CSS variables
│   └── api/
│       └── trpc/
│           └── [trpc]/
│               └── route.ts     # tRPC endpoint
├── components/
│   ├── ui/                      # Shadcn components
│   ├── category-card.tsx
│   ├── shopping-list.tsx
│   └── theme-provider.tsx
└── lib/
    ├── trpc.ts                  # tRPC client setup
    └── utils.ts
```

## 10.2 State Management

**TanStack Query for Server State:**
```typescript
// apps/web/lib/hooks/use-shopping-list.ts
export function useShoppingList(id: string) {
  return trpc.shopping.getList.useQuery(
    { id },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000,
    }
  );
}
```

**Zustand for Client State:**
```typescript
// apps/web/lib/stores/ui-store.ts
export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  activeCategory: null,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
```
