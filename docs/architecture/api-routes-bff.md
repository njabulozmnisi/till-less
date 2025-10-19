# Next.js API Routes - Backend for Frontend (BFF) Pattern

This document outlines the Backend for Frontend (BFF) architecture using Next.js API routes to proxy and transform requests between the frontend React application and the NestJS backend.

## 1. Overview

### 1.1 Why BFF Pattern?

The BFF pattern provides several benefits:

1. **Decoupling**: Frontend can evolve independently of backend API changes
2. **Request Transformation**: Convert backend responses to frontend-optimized formats
3. **Aggregation**: Combine multiple backend calls into single frontend requests
4. **Caching**: Implement client-specific caching strategies
5. **Error Handling**: Normalize error responses for consistent frontend handling
6. **Security**: Hide backend endpoints and implement additional security layers
7. **Performance**: Reduce payload sizes and optimize for client needs

### 1.2 Architecture Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser/Client                           │
│  ┌──────────────┐         ┌─────────────┐         ┌──────────┐ │
│  │ React        │────────▶│ RTK Query   │────────▶│ fetch()  │ │
│  │ Components   │◀────────│ Hooks       │◀────────│          │ │
│  └──────────────┘         └─────────────┘         └────┬─────┘ │
└─────────────────────────────────────────────────────────┼───────┘
                                                          │
                                                          │ HTTP Request
                                                          │ to /api/*
                                                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js Server (Vercel)                       │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │             Next.js API Routes (BFF Layer)                 │ │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐          │ │
│  │  │ /api/lists │  │ /api/optim │  │ /api/prefs │  etc.    │ │
│  │  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘          │ │
│  │         │                │                │                 │ │
│  │         └────────────────┴────────────────┘                 │ │
│  │                          │                                   │ │
│  │                          ▼                                   │ │
│  │              ┌─────────────────────────┐                    │ │
│  │              │  API Handler Utilities  │                    │ │
│  │              │  - Auth validation      │                    │ │
│  │              │  - Request transform    │                    │ │
│  │              │  - Error handling       │                    │ │
│  │              │  - Response caching     │                    │ │
│  │              └───────────┬─────────────┘                    │ │
│  └────────────────────────────┼────────────────────────────────┘ │
└─────────────────────────────────┼────────────────────────────────┘
                                  │ HTTP Request
                                  │ with JWT token
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│              NestJS Backend (Render/Railway)                     │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                  REST/GraphQL API                          │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │ │
│  │  │ Lists Module │  │ Optimization │  │ Preferences  │    │ │
│  │  │              │  │ Module       │  │ Module       │    │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │ │
│  └───────────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                     Prisma ORM                             │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│                   ┌────────────────────┐                         │
│                   │ Supabase Postgres  │                         │
│                   └────────────────────┘                         │
└─────────────────────────────────────────────────────────────────┘
```

## 2. API Routes Structure

### 2.1 Directory Layout

```
apps/web/src/app/api/
├── lib/
│   ├── apiHandler.ts           # Base handler for proxying requests
│   ├── auth.ts                 # Auth token validation
│   ├── errors.ts               # Error normalization
│   ├── cache.ts                # Response caching utilities
│   └── transform.ts            # Request/response transformation
├── lists/
│   ├── route.ts                # GET /api/lists, POST /api/lists
│   ├── [id]/
│   │   └── route.ts            # GET/PATCH/DELETE /api/lists/:id
│   └── import/
│       └── route.ts            # POST /api/lists/import
├── optimization/
│   ├── run/
│   │   └── route.ts            # POST /api/optimization/run
│   ├── history/
│   │   └── route.ts            # GET /api/optimization/history
│   └── [id]/
│       └── route.ts            # GET /api/optimization/:id
├── preferences/
│   ├── route.ts                # GET/PATCH /api/preferences
│   ├── loyalty-cards/
│   │   └── route.ts            # GET/POST /api/preferences/loyalty-cards
│   └── location/
│       └── route.ts            # GET/PUT /api/preferences/location
├── receipts/
│   ├── route.ts                # GET /api/receipts, POST /api/receipts
│   ├── [id]/
│   │   └── route.ts            # GET/DELETE /api/receipts/:id
│   └── upload-url/
│       └── route.ts            # POST /api/receipts/upload-url (presigned URL)
└── retailers/
    ├── route.ts                # GET /api/retailers
    └── [id]/
        ├── route.ts            # GET /api/retailers/:id
        └── stores/
            └── route.ts        # GET /api/retailers/:id/stores
```

## 3. Core API Handler Implementation

### 3.1 Base API Handler

```typescript
// app/api/lib/apiHandler.ts
import { NextRequest, NextResponse } from 'next/server'
import { validateAuthToken } from './auth'
import { normalizeError } from './errors'
import { getCachedResponse, setCachedResponse } from './cache'

const BACKEND_URL = process.env.NESTJS_BACKEND_URL || 'http://localhost:3001'

export interface ApiHandlerConfig {
  method?: string
  requireAuth?: boolean
  cache?: {
    enabled: boolean
    ttl?: number // seconds
    key?: string
  }
  transform?: {
    request?: (body: any) => any
    response?: (data: any) => any
  }
}

export async function apiHandler(
  request: NextRequest,
  backendEndpoint: string,
  config: ApiHandlerConfig = {}
) {
  const {
    method = request.method,
    requireAuth = true,
    cache = { enabled: false },
    transform = {},
  } = config

  try {
    // 1. Authentication
    let userId: string | null = null
    const authHeader = request.headers.get('authorization')

    if (requireAuth) {
      if (!authHeader) {
        return NextResponse.json(
          { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
          { status: 401 }
        )
      }

      const validation = await validateAuthToken(authHeader)
      if (!validation.valid) {
        return NextResponse.json(
          { error: 'Invalid token', code: 'AUTH_INVALID' },
          { status: 401 }
        )
      }

      userId = validation.userId
    }

    // 2. Check cache (for GET requests)
    if (method === 'GET' && cache.enabled) {
      const cacheKey = cache.key || request.url
      const cachedData = await getCachedResponse(cacheKey)

      if (cachedData) {
        return NextResponse.json(cachedData, {
          headers: {
            'X-Cache': 'HIT',
            'Cache-Control': `public, max-age=${cache.ttl || 300}`,
          },
        })
      }
    }

    // 3. Prepare backend request
    const backendUrl = `${BACKEND_URL}${backendEndpoint}`
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    if (userId) {
      headers['X-User-Id'] = userId
    }

    const requestOptions: RequestInit = {
      method,
      headers,
    }

    // 4. Add request body with optional transformation
    if (['POST', 'PATCH', 'PUT'].includes(method)) {
      let body = await request.json()

      if (transform.request) {
        body = transform.request(body)
      }

      requestOptions.body = JSON.stringify(body)
    }

    // 5. Make backend request
    const startTime = Date.now()
    const response = await fetch(backendUrl, requestOptions)
    const duration = Date.now() - startTime

    // Log slow requests
    if (duration > 5000) {
      console.warn(`Slow backend request: ${backendEndpoint} took ${duration}ms`)
    }

    // 6. Handle errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: 'Unknown backend error',
      }))

      const normalizedError = normalizeError(errorData, response.status)

      return NextResponse.json(normalizedError, {
        status: response.status,
        headers: {
          'X-Backend-Duration': duration.toString(),
        },
      })
    }

    // 7. Parse and transform response
    let data = await response.json()

    if (transform.response) {
      data = transform.response(data)
    }

    // 8. Cache successful GET responses
    if (method === 'GET' && cache.enabled) {
      const cacheKey = cache.key || request.url
      await setCachedResponse(cacheKey, data, cache.ttl || 300)
    }

    // 9. Return successful response
    return NextResponse.json(data, {
      headers: {
        'X-Cache': 'MISS',
        'X-Backend-Duration': duration.toString(),
        'Cache-Control': cache.enabled
          ? `public, max-age=${cache.ttl || 300}`
          : 'no-cache',
      },
    })

  } catch (error) {
    console.error('API Handler Error:', {
      endpoint: backendEndpoint,
      method,
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json(
      {
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
```

### 3.2 Auth Token Validation

```typescript
// app/api/lib/auth.ts
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.BETTER_AUTH_SECRET || 'fallback-secret-change-me'
)

interface TokenPayload {
  userId: string
  email: string
  exp: number
}

export async function validateAuthToken(authHeader: string): Promise<{
  valid: boolean
  userId?: string
  error?: string
}> {
  try {
    // Extract token from "Bearer <token>"
    const token = authHeader.replace('Bearer ', '')

    if (!token) {
      return { valid: false, error: 'No token provided' }
    }

    // Verify JWT
    const { payload } = await jwtVerify(token, JWT_SECRET)

    const { userId, exp } = payload as unknown as TokenPayload

    // Check expiration
    if (exp && exp < Date.now() / 1000) {
      return { valid: false, error: 'Token expired' }
    }

    return { valid: true, userId }

  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Token validation failed',
    }
  }
}
```

### 3.3 Error Normalization

```typescript
// app/api/lib/errors.ts
export interface NormalizedError {
  error: string
  code: string
  message: string
  details?: any
}

export function normalizeError(errorData: any, statusCode: number): NormalizedError {
  // Map common backend errors to frontend-friendly messages
  const errorMappings: Record<number, { error: string; code: string }> = {
    400: { error: 'Bad Request', code: 'BAD_REQUEST' },
    401: { error: 'Unauthorized', code: 'UNAUTHORIZED' },
    403: { error: 'Forbidden', code: 'FORBIDDEN' },
    404: { error: 'Not Found', code: 'NOT_FOUND' },
    409: { error: 'Conflict', code: 'CONFLICT' },
    422: { error: 'Validation Error', code: 'VALIDATION_ERROR' },
    429: { error: 'Too Many Requests', code: 'RATE_LIMIT' },
    500: { error: 'Internal Server Error', code: 'INTERNAL_ERROR' },
    503: { error: 'Service Unavailable', code: 'SERVICE_UNAVAILABLE' },
  }

  const defaultError = errorMappings[statusCode] || {
    error: 'Unknown Error',
    code: 'UNKNOWN',
  }

  return {
    error: errorData.error || defaultError.error,
    code: errorData.code || defaultError.code,
    message: errorData.message || defaultError.error,
    details: errorData.details,
  }
}
```

### 3.4 Response Caching

```typescript
// app/api/lib/cache.ts
import { Redis } from '@upstash/redis'

// Use Upstash Redis for caching (free tier: 10K commands/day)
const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
    })
  : null

// In-memory cache fallback (for development without Redis)
const memoryCache = new Map<string, { data: any; expiry: number }>()

export async function getCachedResponse(key: string): Promise<any | null> {
  try {
    if (redis) {
      const cached = await redis.get(key)
      return cached
    } else {
      // Memory cache fallback
      const cached = memoryCache.get(key)
      if (cached && cached.expiry > Date.now()) {
        return cached.data
      }
      if (cached) {
        memoryCache.delete(key)
      }
      return null
    }
  } catch (error) {
    console.error('Cache read error:', error)
    return null
  }
}

export async function setCachedResponse(
  key: string,
  data: any,
  ttl: number
): Promise<void> {
  try {
    if (redis) {
      await redis.set(key, data, { ex: ttl })
    } else {
      // Memory cache fallback
      memoryCache.set(key, {
        data,
        expiry: Date.now() + ttl * 1000,
      })
    }
  } catch (error) {
    console.error('Cache write error:', error)
  }
}

export async function invalidateCache(pattern: string): Promise<void> {
  try {
    if (redis) {
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } else {
      // Memory cache: delete matching keys
      for (const key of memoryCache.keys()) {
        if (key.includes(pattern)) {
          memoryCache.delete(key)
        }
      }
    }
  } catch (error) {
    console.error('Cache invalidation error:', error)
  }
}
```

## 4. Example API Routes

### 4.1 Shopping Lists API

```typescript
// app/api/lists/route.ts
import { NextRequest } from 'next/server'
import { apiHandler } from '../lib/apiHandler'

export async function GET(request: NextRequest) {
  return apiHandler(request, '/shopping-lists', {
    method: 'GET',
    cache: {
      enabled: true,
      ttl: 60, // 1 minute cache
    },
  })
}

export async function POST(request: NextRequest) {
  return apiHandler(request, '/shopping-lists', {
    method: 'POST',
    transform: {
      // Example: Convert frontend format to backend format
      request: (body) => ({
        ...body,
        // Add server timestamp
        createdAt: new Date().toISOString(),
      }),
    },
  })
}
```

```typescript
// app/api/lists/[id]/route.ts
import { NextRequest } from 'next/server'
import { apiHandler } from '../../lib/apiHandler'
import { invalidateCache } from '../../lib/cache'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return apiHandler(request, `/shopping-lists/${params.id}`, {
    method: 'GET',
    cache: {
      enabled: true,
      ttl: 120, // 2 minutes cache
      key: `list:${params.id}`,
    },
  })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const response = await apiHandler(request, `/shopping-lists/${params.id}`, {
    method: 'PATCH',
  })

  // Invalidate cache for this list
  await invalidateCache(`list:${params.id}`)
  await invalidateCache('/api/lists')

  return response
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const response = await apiHandler(request, `/shopping-lists/${params.id}`, {
    method: 'DELETE',
  })

  // Invalidate cache
  await invalidateCache(`list:${params.id}`)
  await invalidateCache('/api/lists')

  return response
}
```

### 4.2 Optimization API

```typescript
// app/api/optimization/run/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { apiHandler } from '../../lib/apiHandler'
import { startOptimization } from '@/store/slices/optimizationSlice'

export async function POST(request: NextRequest) {
  return apiHandler(request, '/optimization/run', {
    method: 'POST',
    transform: {
      request: (body) => {
        // Add any frontend-specific fields or transformations
        return {
          ...body,
          requestedAt: new Date().toISOString(),
        }
      },
      response: (data) => {
        // Transform backend response for frontend consumption
        return {
          ...data,
          // Add computed fields
          savingsPercentage: data.recommendedStore.totalCost > 0
            ? (data.recommendedStore.savingsVsBaseline / data.recommendedStore.totalCost) * 100
            : 0,
        }
      },
    },
  })
}

// Allow up to 30 seconds for optimization (matches PRD requirement)
export const maxDuration = 30
```

### 4.3 Aggregated Data Endpoint

```typescript
// app/api/dashboard/summary/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { validateAuthToken } from '../../lib/auth'

const BACKEND_URL = process.env.NESTJS_BACKEND_URL || 'http://localhost:3001'

export async function GET(request: NextRequest) {
  // Validate auth
  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const validation = await validateAuthToken(authHeader)
  if (!validation.valid) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  try {
    // Aggregate multiple backend calls into one frontend request
    const [listsRes, optimizationsRes, receiptsRes] = await Promise.all([
      fetch(`${BACKEND_URL}/shopping-lists`, {
        headers: { Authorization: authHeader },
      }),
      fetch(`${BACKEND_URL}/optimization/history?limit=5`, {
        headers: { Authorization: authHeader },
      }),
      fetch(`${BACKEND_URL}/receipts?limit=5`, {
        headers: { Authorization: authHeader },
      }),
    ])

    const [lists, optimizations, receipts] = await Promise.all([
      listsRes.json(),
      optimizationsRes.json(),
      receiptsRes.json(),
    ])

    // Compute summary statistics
    const summary = {
      totalLists: lists.length,
      totalOptimizations: optimizations.length,
      totalReceipts: receipts.length,
      totalSavings: optimizations.reduce(
        (sum: number, opt: any) => sum + opt.recommendedStore.savingsVsBaseline,
        0
      ),
      recentOptimizations: optimizations.slice(0, 3),
      recentReceipts: receipts.slice(0, 3),
    }

    return NextResponse.json(summary)

  } catch (error) {
    console.error('Dashboard summary error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard summary' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic' // Never cache dashboard
```

## 5. Request/Response Transformation Examples

### 5.1 Date Format Normalization

```typescript
// app/api/lib/transform.ts
export function normalizeBackendDates(data: any): any {
  if (Array.isArray(data)) {
    return data.map(normalizeBackendDates)
  }

  if (data && typeof data === 'object') {
    const normalized: any = {}

    for (const [key, value] of Object.entries(data)) {
      // Convert ISO date strings to timestamps for easier frontend handling
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
        normalized[key] = new Date(value).getTime()
      } else if (typeof value === 'object') {
        normalized[key] = normalizeBackendDates(value)
      } else {
        normalized[key] = value
      }
    }

    return normalized
  }

  return data
}
```

### 5.2 Currency Formatting

```typescript
// app/api/lib/transform.ts
export function addCurrencyFormatting(data: any): any {
  if (Array.isArray(data)) {
    return data.map(addCurrencyFormatting)
  }

  if (data && typeof data === 'object') {
    const formatted: any = { ...data }

    // Add formatted versions of price fields
    const priceFields = ['price', 'totalCost', 'savingsVsBaseline', 'travelCost']

    for (const field of priceFields) {
      if (typeof data[field] === 'number') {
        formatted[`${field}Formatted`] = new Intl.NumberFormat('en-ZA', {
          style: 'currency',
          currency: 'ZAR',
        }).format(data[field])
      }
    }

    // Recursively format nested objects
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'object' && value !== null) {
        formatted[key] = addCurrencyFormatting(value)
      }
    }

    return formatted
  }

  return data
}
```

## 6. Performance Optimizations

### 6.1 Request Batching

```typescript
// app/api/batch/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { apiHandler } from '../lib/apiHandler'

export async function POST(request: NextRequest) {
  const { requests } = await request.json()

  if (!Array.isArray(requests) || requests.length === 0) {
    return NextResponse.json(
      { error: 'Invalid batch request' },
      { status: 400 }
    )
  }

  // Execute requests in parallel
  const results = await Promise.allSettled(
    requests.map(async (req: { endpoint: string; method: string; body?: any }) => {
      const mockRequest = new Request(req.endpoint, {
        method: req.method,
        body: req.body ? JSON.stringify(req.body) : undefined,
        headers: request.headers,
      }) as any

      return apiHandler(mockRequest, req.endpoint, {
        method: req.method,
      })
    })
  )

  return NextResponse.json({
    results: results.map((result) =>
      result.status === 'fulfilled' ? result.value : { error: result.reason }
    ),
  })
}
```

### 6.2 Response Compression

```typescript
// next.config.js
module.exports = {
  compress: true, // Enable gzip compression
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, stale-while-revalidate=120',
          },
        ],
      },
    ]
  },
}
```

## 7. Error Handling Patterns

### 7.1 Retry Logic

```typescript
// app/api/lib/retry.ts
export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3
): Promise<Response> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options)

      // Retry on 5xx errors
      if (response.status >= 500 && attempt < maxRetries - 1) {
        await sleep(Math.pow(2, attempt) * 1000) // Exponential backoff
        continue
      }

      return response

    } catch (error) {
      lastError = error as Error

      if (attempt < maxRetries - 1) {
        await sleep(Math.pow(2, attempt) * 1000)
      }
    }
  }

  throw lastError || new Error('Max retries exceeded')
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
```

## 8. Monitoring & Logging

### 8.1 Request Logging

```typescript
// app/api/lib/logger.ts
export function logApiRequest(
  endpoint: string,
  method: string,
  duration: number,
  statusCode: number,
  userId?: string
) {
  const log = {
    timestamp: new Date().toISOString(),
    endpoint,
    method,
    duration,
    statusCode,
    userId,
  }

  // In production, send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Send to Grafana, Logtail, etc.
    console.log(JSON.stringify(log))
  } else {
    console.log('[API]', log)
  }
}
```

## 9. Security Best Practices

1. **Token Validation**: Always validate JWT tokens before proxying to backend
2. **Rate Limiting**: Implement per-user rate limits to prevent abuse
3. **Input Sanitization**: Validate and sanitize all user inputs
4. **CORS**: Configure CORS to only allow same-origin requests
5. **Secrets Management**: Store sensitive values in environment variables
6. **Error Messages**: Never expose backend error details to clients
7. **HTTPS Only**: Enforce HTTPS in production environments
8. **CSP Headers**: Configure Content Security Policy headers

## 10. Testing Strategy

### 10.1 Unit Tests for API Routes

```typescript
// app/api/lists/__tests__/route.test.ts
import { describe, it, expect, vi } from 'vitest'
import { GET, POST } from '../route'
import { NextRequest } from 'next/server'

vi.mock('../../lib/apiHandler', () => ({
  apiHandler: vi.fn(() => Promise.resolve(new Response('{}'))),
}))

describe('Lists API Route', () => {
  it('should call apiHandler for GET requests', async () => {
    const request = new NextRequest('http://localhost/api/lists')
    await GET(request)

    expect(apiHandler).toHaveBeenCalledWith(
      request,
      '/shopping-lists',
      expect.objectContaining({ method: 'GET' })
    )
  })
})
```

### 10.2 Integration Tests

```typescript
// app/api/__tests__/integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

const server = setupServer(
  http.get('http://localhost:3001/shopping-lists', () => {
    return HttpResponse.json([{ id: '1', name: 'Test List' }])
  })
)

beforeAll(() => server.listen())
afterAll(() => server.close())

describe('API Integration', () => {
  it('should fetch lists from backend', async () => {
    const response = await fetch('http://localhost:3000/api/lists', {
      headers: {
        Authorization: 'Bearer test-token',
      },
    })

    const data = await response.json()
    expect(data).toHaveLength(1)
  })
})
```

## 11. Deployment Considerations

### 11.1 Environment Variables

```bash
# .env.local
NESTJS_BACKEND_URL=https://api.tillless.co.za
BETTER_AUTH_SECRET=<your-secret>
UPSTASH_REDIS_REST_URL=<upstash-url>
UPSTASH_REDIS_REST_TOKEN=<upstash-token>
```

### 11.2 Vercel Configuration

```json
// vercel.json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "NESTJS_BACKEND_URL": "@backend-url",
    "BETTER_AUTH_SECRET": "@auth-secret"
  }
}
```

## 12. Migration Checklist

If transitioning to BFF pattern:

- [ ] Create `app/api/lib/apiHandler.ts` with core functionality
- [ ] Implement auth token validation
- [ ] Set up error normalization
- [ ] Configure caching layer (Redis or in-memory)
- [ ] Create API route structure mirroring backend endpoints
- [ ] Update RTK Query base URL to point to `/api` instead of backend
- [ ] Implement request/response transformations as needed
- [ ] Add monitoring and logging
- [ ] Write tests for API routes
- [ ] Configure environment variables
- [ ] Deploy and verify functionality
