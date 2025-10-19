# Frontend Architecture (Next.js + Redux + RTK Query)

This document details the frontend architecture for TillLess, focusing on state management, data fetching, and the BFF (Backend for Frontend) pattern using Next.js API routes.

## 1. Technology Stack

- **Framework**: Next.js 14+ (App Router, TypeScript)
- **State Management**: Redux Toolkit (@reduxjs/toolkit)
- **Data Fetching**: RTK Query (included in Redux Toolkit)
- **UI Components**: shadcn/ui (Radix UI + Tailwind CSS)
- **Styling**: Tailwind CSS v3+
- **Authentication**: BetterAuth SDK
- **Icons**: Lucide React
- **Animation**: Framer Motion
- **Forms**: React Hook Form + Zod validation
- **Testing**: Vitest, React Testing Library, Playwright

## 2. Directory Structure

```
apps/web/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── (auth)/              # Auth-protected routes group
│   │   │   ├── dashboard/
│   │   │   ├── lists/
│   │   │   ├── optimization/
│   │   │   └── receipts/
│   │   ├── (public)/            # Public routes group
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── api/                 # Next.js API Routes (BFF)
│   │   │   ├── lists/
│   │   │   ├── optimization/
│   │   │   ├── preferences/
│   │   │   ├── receipts/
│   │   │   └── retailers/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/              # React components
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── features/            # Feature-specific components
│   │   │   ├── shopping-lists/
│   │   │   ├── optimization/
│   │   │   ├── receipts/
│   │   │   └── preferences/
│   │   ├── layouts/
│   │   └── shared/
│   ├── store/                   # Redux store configuration
│   │   ├── index.ts             # Store setup & configuration
│   │   ├── hooks.ts             # Typed useDispatch/useSelector
│   │   ├── slices/              # Redux slices
│   │   │   ├── authSlice.ts
│   │   │   ├── uiSlice.ts
│   │   │   ├── preferencesSlice.ts
│   │   │   └── optimizationSlice.ts
│   │   └── api/                 # RTK Query API definitions
│   │       ├── baseApi.ts       # Base RTK Query setup
│   │       ├── listsApi.ts
│   │       ├── optimizationApi.ts
│   │       ├── receiptsApi.ts
│   │       └── preferencesApi.ts
│   ├── lib/                     # Utilities & helpers
│   │   ├── auth.ts
│   │   ├── validators.ts
│   │   └── formatters.ts
│   ├── types/                   # TypeScript type definitions
│   │   ├── api.ts
│   │   ├── models.ts
│   │   └── ui.ts
│   └── middleware.ts            # Next.js middleware (auth checks)
├── public/
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 3. Redux Store Architecture

### 3.1 Store Configuration

```typescript
// store/index.ts
import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { baseApi } from './api/baseApi'
import authReducer from './slices/authSlice'
import uiReducer from './slices/uiSlice'
import preferencesReducer from './slices/preferencesSlice'
import optimizationReducer from './slices/optimizationSlice'

export const makeStore = () => {
  const store = configureStore({
    reducer: {
      // RTK Query API reducer
      [baseApi.reducerPath]: baseApi.reducer,

      // Feature reducers
      auth: authReducer,
      ui: uiReducer,
      preferences: preferencesReducer,
      optimization: optimizationReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
  })

  // Enable refetchOnFocus/refetchOnReconnect behaviors
  setupListeners(store.dispatch)

  return store
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
```

### 3.2 Redux Slices

#### Auth Slice
```typescript
// store/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface User {
  id: string
  email: string
  name: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  sessionToken: string | null
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  sessionToken: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
    setSessionToken: (state, action: PayloadAction<string>) => {
      state.sessionToken = action.payload
    },
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.sessionToken = null
    },
  },
})

export const { setUser, setSessionToken, logout } = authSlice.actions
export default authSlice.reducer
```

#### UI Slice
```typescript
// store/slices/uiSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark' | 'system'
  activeModal: string | null
  toasts: Array<{
    id: string
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
  }>
}

const initialState: UIState = {
  sidebarOpen: true,
  theme: 'system',
  activeModal: null,
  toasts: [],
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setTheme: (state, action: PayloadAction<UIState['theme']>) => {
      state.theme = action.payload
    },
    openModal: (state, action: PayloadAction<string>) => {
      state.activeModal = action.payload
    },
    closeModal: (state) => {
      state.activeModal = null
    },
    addToast: (state, action: PayloadAction<Omit<UIState['toasts'][0], 'id'>>) => {
      state.toasts.push({
        ...action.payload,
        id: `toast-${Date.now()}`,
      })
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload)
    },
  },
})

export const { toggleSidebar, setTheme, openModal, closeModal, addToast, removeToast } = uiSlice.actions
export default uiSlice.reducer
```

#### Preferences Slice
```typescript
// store/slices/preferencesSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface LoyaltyCard {
  retailerId: string
  cardNumber: string
  enabled: boolean
}

interface PreferencesState {
  homeLocation: {
    lat: number
    lng: number
    address: string
  } | null
  loyaltyCards: LoyaltyCard[]
  maxStores: number
  maxTravelDistance: number
  valueOfTime: number // R per hour
}

const initialState: PreferencesState = {
  homeLocation: null,
  loyaltyCards: [],
  maxStores: 1,
  maxTravelDistance: 20, // km
  valueOfTime: 150, // R150/hour default
}

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    setHomeLocation: (state, action: PayloadAction<PreferencesState['homeLocation']>) => {
      state.homeLocation = action.payload
    },
    addLoyaltyCard: (state, action: PayloadAction<LoyaltyCard>) => {
      state.loyaltyCards.push(action.payload)
    },
    updateLoyaltyCard: (state, action: PayloadAction<{ retailerId: string; enabled: boolean }>) => {
      const card = state.loyaltyCards.find((c) => c.retailerId === action.payload.retailerId)
      if (card) {
        card.enabled = action.payload.enabled
      }
    },
    removeLoyaltyCard: (state, action: PayloadAction<string>) => {
      state.loyaltyCards = state.loyaltyCards.filter((c) => c.retailerId !== action.payload)
    },
    setMaxStores: (state, action: PayloadAction<number>) => {
      state.maxStores = action.payload
    },
    setMaxTravelDistance: (state, action: PayloadAction<number>) => {
      state.maxTravelDistance = action.payload
    },
    setValueOfTime: (state, action: PayloadAction<number>) => {
      state.valueOfTime = action.payload
    },
  },
})

export const {
  setHomeLocation,
  addLoyaltyCard,
  updateLoyaltyCard,
  removeLoyaltyCard,
  setMaxStores,
  setMaxTravelDistance,
  setValueOfTime,
} = preferencesSlice.actions
export default preferencesSlice.reducer
```

#### Optimization Slice
```typescript
// store/slices/optimizationSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface OptimizationState {
  currentListId: string | null
  lastOptimizationResult: any | null
  optimizationInProgress: boolean
  selectedSubstitutions: Record<string, string> // itemId -> substitutionId
}

const initialState: OptimizationState = {
  currentListId: null,
  lastOptimizationResult: null,
  optimizationInProgress: false,
  selectedSubstitutions: {},
}

const optimizationSlice = createSlice({
  name: 'optimization',
  initialState,
  reducers: {
    setCurrentList: (state, action: PayloadAction<string>) => {
      state.currentListId = action.payload
    },
    setOptimizationResult: (state, action: PayloadAction<any>) => {
      state.lastOptimizationResult = action.payload
      state.optimizationInProgress = false
    },
    startOptimization: (state) => {
      state.optimizationInProgress = true
    },
    selectSubstitution: (state, action: PayloadAction<{ itemId: string; substitutionId: string }>) => {
      state.selectedSubstitutions[action.payload.itemId] = action.payload.substitutionId
    },
    clearOptimization: (state) => {
      state.lastOptimizationResult = null
      state.selectedSubstitutions = {}
    },
  },
})

export const {
  setCurrentList,
  setOptimizationResult,
  startOptimization,
  selectSubstitution,
  clearOptimization,
} = optimizationSlice.actions
export default optimizationSlice.reducer
```

## 4. RTK Query API Configuration

### 4.1 Base API Setup

```typescript
// store/api/baseApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../index'

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api', // Points to Next.js API routes
    prepareHeaders: (headers, { getState }) => {
      // Add auth token from Redux state
      const token = (getState() as RootState).auth.sessionToken
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['ShoppingList', 'OptimizationResult', 'Receipt', 'Preferences', 'Retailer'],
  endpoints: () => ({}), // Endpoints defined in separate files via injection
})
```

### 4.2 Shopping Lists API

```typescript
// store/api/listsApi.ts
import { baseApi } from './baseApi'

export interface ShoppingListItem {
  id: string
  name: string
  quantity: number
  unit: string
  preferredBrand?: string
  substituteAllowed: boolean
  mustHave: boolean
}

export interface ShoppingList {
  id: string
  name: string
  items: ShoppingListItem[]
  createdAt: string
  updatedAt: string
}

export const listsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLists: builder.query<ShoppingList[], void>({
      query: () => '/lists',
      providesTags: ['ShoppingList'],
    }),
    getListById: builder.query<ShoppingList, string>({
      query: (id) => `/lists/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'ShoppingList', id }],
    }),
    createList: builder.mutation<ShoppingList, Partial<ShoppingList>>({
      query: (body) => ({
        url: '/lists',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ShoppingList'],
    }),
    updateList: builder.mutation<ShoppingList, { id: string; data: Partial<ShoppingList> }>({
      query: ({ id, data }) => ({
        url: `/lists/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'ShoppingList', id }],
    }),
    deleteList: builder.mutation<void, string>({
      query: (id) => ({
        url: `/lists/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ShoppingList'],
    }),
    importListFromCsv: builder.mutation<ShoppingList, FormData>({
      query: (formData) => ({
        url: '/lists/import',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['ShoppingList'],
    }),
  }),
})

export const {
  useGetListsQuery,
  useGetListByIdQuery,
  useCreateListMutation,
  useUpdateListMutation,
  useDeleteListMutation,
  useImportListFromCsvMutation,
} = listsApi
```

### 4.3 Optimization API

```typescript
// store/api/optimizationApi.ts
import { baseApi } from './baseApi'

export interface OptimizationRequest {
  listId: string
  preferences: {
    loyaltyCards: string[] // retailer IDs with enabled cards
    maxStores: number
    maxTravelDistance: number
    valueOfTime: number
  }
}

export interface OptimizationResult {
  id: string
  listId: string
  recommendedStore: {
    retailerId: string
    retailerName: string
    totalCost: number
    savingsVsBaseline: number
    travelCost: number
    travelDistance: number
  }
  itemComparisons: Array<{
    itemId: string
    itemName: string
    prices: Record<string, { price: number; loyaltyPrice?: number; inStock: boolean }>
    selectedRetailer: string
    appliedPromos: string[]
  }>
  substitutions: Array<{
    originalItemId: string
    suggestedItem: {
      id: string
      name: string
      price: number
      reason: string
    }
  }>
  assumptions: string[]
  createdAt: string
}

export const optimizationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    runOptimization: builder.mutation<OptimizationResult, OptimizationRequest>({
      query: (body) => ({
        url: '/optimization/run',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['OptimizationResult'],
    }),
    getOptimizationHistory: builder.query<OptimizationResult[], { listId?: string; limit?: number }>({
      query: ({ listId, limit = 10 }) => ({
        url: '/optimization/history',
        params: { listId, limit },
      }),
      providesTags: ['OptimizationResult'],
    }),
    getOptimizationById: builder.query<OptimizationResult, string>({
      query: (id) => `/optimization/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'OptimizationResult', id }],
    }),
  }),
})

export const {
  useRunOptimizationMutation,
  useGetOptimizationHistoryQuery,
  useGetOptimizationByIdQuery,
} = optimizationApi
```

## 5. Next.js API Routes (BFF Pattern)

Next.js API routes act as a Backend for Frontend (BFF) layer, proxying requests to the NestJS backend while providing request/response transformation, caching, and error handling.

### 5.1 Base API Route Handler

```typescript
// app/api/lib/apiHandler.ts
import { NextRequest, NextResponse } from 'next/server'

const NESTJS_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

interface ApiHandlerOptions {
  method?: string
  requireAuth?: boolean
}

export async function apiHandler(
  request: NextRequest,
  endpoint: string,
  options: ApiHandlerOptions = {}
) {
  const { method = 'GET', requireAuth = true } = options

  try {
    // Extract auth token
    const authHeader = request.headers.get('authorization')

    if (requireAuth && !authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Prepare headers for backend request
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    // Build request options
    const requestOptions: RequestInit = {
      method,
      headers,
    }

    // Add body for POST/PATCH/PUT
    if (['POST', 'PATCH', 'PUT'].includes(method)) {
      const body = await request.json()
      requestOptions.body = JSON.stringify(body)
    }

    // Make request to NestJS backend
    const backendUrl = `${NESTJS_BACKEND_URL}${endpoint}`
    const response = await fetch(backendUrl, requestOptions)

    // Handle errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
      return NextResponse.json(
        { error: errorData.message || 'Backend request failed' },
        { status: response.status }
      )
    }

    // Return successful response
    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('API Handler Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### 5.2 Example API Route: Shopping Lists

```typescript
// app/api/lists/route.ts
import { NextRequest } from 'next/server'
import { apiHandler } from '../lib/apiHandler'

export async function GET(request: NextRequest) {
  return apiHandler(request, '/shopping-lists')
}

export async function POST(request: NextRequest) {
  return apiHandler(request, '/shopping-lists', { method: 'POST' })
}
```

```typescript
// app/api/lists/[id]/route.ts
import { NextRequest } from 'next/server'
import { apiHandler } from '../../lib/apiHandler'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return apiHandler(request, `/shopping-lists/${params.id}`)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return apiHandler(request, `/shopping-lists/${params.id}`, { method: 'PATCH' })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return apiHandler(request, `/shopping-lists/${params.id}`, { method: 'DELETE' })
}
```

### 5.3 Optimization API Route

```typescript
// app/api/optimization/run/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { apiHandler } from '../../lib/apiHandler'

export async function POST(request: NextRequest) {
  // Optional: Add request transformation here
  // Example: Convert frontend format to backend format

  const response = await apiHandler(request, '/optimization/run', { method: 'POST' })

  // Optional: Add response transformation here
  // Example: Add computed fields for frontend consumption

  return response
}

// Set timeout for long-running optimization requests
export const maxDuration = 30 // 30 seconds to match PRD requirement
```

## 6. Component Integration Examples

### 6.1 Using RTK Query in Components

```typescript
// components/features/shopping-lists/ListsPage.tsx
'use client'

import { useGetListsQuery, useCreateListMutation } from '@/store/api/listsApi'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function ListsPage() {
  const { data: lists, isLoading, error } = useGetListsQuery()
  const [createList, { isLoading: isCreating }] = useCreateListMutation()

  const handleCreateList = async () => {
    await createList({ name: 'New Shopping List', items: [] })
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading lists</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Shopping Lists</h1>
        <Button onClick={handleCreateList} disabled={isCreating}>
          {isCreating ? 'Creating...' : 'New List'}
        </Button>
      </div>

      <div className="grid gap-4">
        {lists?.map((list) => (
          <Card key={list.id} className="p-4">
            <h3 className="font-semibold">{list.name}</h3>
            <p className="text-sm text-muted-foreground">
              {list.items.length} items
            </p>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

### 6.2 Using Redux Slices

```typescript
// components/features/preferences/LoyaltyCardsSection.tsx
'use client'

import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { updateLoyaltyCard } from '@/store/slices/preferencesSlice'
import { Switch } from '@/components/ui/switch'

export function LoyaltyCardsSection() {
  const dispatch = useAppDispatch()
  const loyaltyCards = useAppSelector((state) => state.preferences.loyaltyCards)

  const handleToggle = (retailerId: string, enabled: boolean) => {
    dispatch(updateLoyaltyCard({ retailerId, enabled }))
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Loyalty Cards</h2>
      {loyaltyCards.map((card) => (
        <div key={card.retailerId} className="flex items-center justify-between">
          <span>{card.retailerId}</span>
          <Switch
            checked={card.enabled}
            onCheckedChange={(enabled) => handleToggle(card.retailerId, enabled)}
          />
        </div>
      ))}
    </div>
  )
}
```

## 7. Performance Optimizations

### 7.1 RTK Query Cache Configuration

```typescript
// Configure cache times for different data types
export const listsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLists: builder.query<ShoppingList[], void>({
      query: () => '/lists',
      providesTags: ['ShoppingList'],
      // Cache for 5 minutes
      keepUnusedDataFor: 300,
    }),
    // Optimization results cached for 1 hour (static historical data)
    getOptimizationById: builder.query<OptimizationResult, string>({
      query: (id) => `/optimization/${id}`,
      keepUnusedDataFor: 3600,
    }),
  }),
})
```

### 7.2 Selective Re-rendering with Redux

```typescript
// Use memoized selectors to prevent unnecessary re-renders
import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../index'

export const selectEnabledLoyaltyCards = createSelector(
  [(state: RootState) => state.preferences.loyaltyCards],
  (cards) => cards.filter((card) => card.enabled)
)
```

### 7.3 Code Splitting

```typescript
// Lazy load heavy components
import dynamic from 'next/dynamic'

const OptimizationResultsChart = dynamic(
  () => import('@/components/features/optimization/OptimizationResultsChart'),
  { ssr: false, loading: () => <ChartSkeleton /> }
)
```

## 8. Testing Strategy

### 8.1 Testing Redux Slices

```typescript
// store/slices/__tests__/authSlice.test.ts
import { describe, it, expect } from 'vitest'
import authReducer, { setUser, logout } from '../authSlice'

describe('authSlice', () => {
  it('should handle setUser', () => {
    const user = { id: '1', email: 'test@example.com', name: 'Test User' }
    const state = authReducer(undefined, setUser(user))

    expect(state.user).toEqual(user)
    expect(state.isAuthenticated).toBe(true)
  })

  it('should handle logout', () => {
    const initialState = {
      user: { id: '1', email: 'test@example.com', name: 'Test User' },
      isAuthenticated: true,
      sessionToken: 'token',
    }
    const state = authReducer(initialState, logout())

    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.sessionToken).toBeNull()
  })
})
```

### 8.2 Testing RTK Query Endpoints

```typescript
// store/api/__tests__/listsApi.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { listsApi } from '../listsApi'
import { makeStore } from '../../index'

const handlers = [
  http.get('/api/lists', () => {
    return HttpResponse.json([
      { id: '1', name: 'Test List', items: [] },
    ])
  }),
]

const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterAll(() => server.close())

describe('listsApi', () => {
  it('should fetch lists', async () => {
    const store = makeStore()
    const result = await store.dispatch(listsApi.endpoints.getLists.initiate())

    expect(result.data).toHaveLength(1)
    expect(result.data[0].name).toBe('Test List')
  })
})
```

### 8.3 Testing Components with Redux

```typescript
// components/features/shopping-lists/__tests__/ListsPage.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { makeStore } from '@/store'
import { ListsPage } from '../ListsPage'

describe('ListsPage', () => {
  it('should render lists', () => {
    const store = makeStore()
    render(
      <Provider store={store}>
        <ListsPage />
      </Provider>
    )

    expect(screen.getByText('Shopping Lists')).toBeInTheDocument()
  })
})
```

## 9. Security Considerations

### 9.1 Token Management

- Session tokens stored in Redux (in-memory, cleared on logout)
- Refresh tokens handled by BetterAuth SDK (HTTP-only cookies)
- Never expose tokens in URL parameters or localStorage

### 9.2 API Route Security

- All Next.js API routes validate auth tokens before proxying to backend
- Rate limiting implemented at API route level
- Input validation using Zod schemas
- CORS configured to only allow same-origin requests

### 9.3 XSS Prevention

- All user input sanitized before rendering
- CSP headers configured in next.config.js
- shadcn/ui components escape HTML by default

## 10. Migration Path

If migrating from an existing implementation:

1. **Install Dependencies**: `pnpm add @reduxjs/toolkit react-redux`
2. **Create Store Structure**: Set up store, slices, and API definitions
3. **Wrap App with Provider**: Add Redux Provider to root layout
4. **Migrate State Management**: Convert useState/useContext to Redux slices
5. **Convert Data Fetching**: Replace fetch/axios calls with RTK Query endpoints
6. **Create API Routes**: Implement Next.js API routes as BFF layer
7. **Update Components**: Use RTK Query hooks and Redux selectors
8. **Add Tests**: Write unit and integration tests for slices and APIs
9. **Performance Tuning**: Configure cache times and implement selectors
10. **Documentation**: Document store structure and API contracts

## 11. Best Practices

1. **Co-locate Feature Code**: Keep slices, APIs, and components together by feature
2. **Use Typed Hooks**: Always use `useAppDispatch` and `useAppSelector` (typed versions)
3. **Normalize State**: Keep data flat and normalized (avoid deeply nested state)
4. **Selective Subscriptions**: Use memoized selectors to prevent unnecessary re-renders
5. **Optimistic Updates**: Use RTK Query's optimistic updates for better UX
6. **Error Handling**: Centralize error handling in API routes and RTK Query
7. **Cache Invalidation**: Use tags effectively for automatic cache invalidation
8. **Loading States**: Always handle loading, error, and success states in UI
9. **Type Safety**: Define TypeScript interfaces for all state and API responses
10. **DevTools**: Use Redux DevTools and RTK Query DevTools for debugging
