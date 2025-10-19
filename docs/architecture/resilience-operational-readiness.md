# Resilience & Operational Readiness Implementation Plan

**Status:** Action Required
**Priority:** 🟡 MEDIUM (Sprint 1-2)
**Current Score:** 60% (12/20 items passed)
**Target Score:** 90% (18/20 items)
**Estimated Time:** 5-6 days

---

## 1. Overview

This document addresses gaps identified in the Architecture Validation (Section 5: Resilience & Operational Readiness). The goal is to ensure the system can handle failures gracefully, recover automatically, and provide operational visibility.

---

## 2. Priority Gaps to Address

### GAP 1: Error Taxonomy & Response Schema 🔴 HIGH

**Current State:** No standardized error codes or response format
**Impact:** Inconsistent error handling, poor debugging, unclear user messages
**Estimated Time:** 1 day

**Implementation:**

Create `libs/shared/src/types/errors.ts`:

```typescript
export enum ErrorCode {
  // Validation Errors (400)
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  EMPTY_LIST = 'EMPTY_LIST',
  INVALID_QUANTITY = 'INVALID_QUANTITY',
  INVALID_UNIT = 'INVALID_UNIT',

  // Business Logic Errors (422)
  BASKET_INCOMPLETE = 'BASKET_INCOMPLETE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  PRICING_STALE = 'PRICING_STALE',

  // Resource Errors (404, 403)
  NOT_FOUND = 'NOT_FOUND',
  FORBIDDEN = 'FORBIDDEN',
  UNAUTHORIZED = 'UNAUTHORIZED',

  // Service Errors (503)
  SCRAPER_UNAVAILABLE = 'SCRAPER_UNAVAILABLE',
  EXTERNAL_API_DOWN = 'EXTERNAL_API_DOWN',
  DATABASE_ERROR = 'DATABASE_ERROR',
}

export interface ErrorResponse {
  statusCode: number;
  error: string; // HTTP status text (e.g., "Bad Request")
  message: string; // User-friendly message
  code?: ErrorCode; // Machine-readable code
  details?: unknown; // Additional context (e.g., validation errors)
  timestamp: string; // ISO 8601
  path: string; // Request path
  correlationId?: string; // For tracing
}
```

Create global exception filter:

```typescript
// apps/backend/src/common/filters/http-exception.filter.ts

import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponse, ErrorCode } from '@tillless/shared';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code: ErrorCode | undefined;
    let details: unknown;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        code = (exceptionResponse as any).code;
        details = (exceptionResponse as any).details;
      } else {
        message = exceptionResponse;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      error: this.getHttpStatusText(status),
      message,
      code,
      details,
      timestamp: new Date().toISOString(),
      path: request.url,
      correlationId: request['correlationId'],
    };

    // Log error
    console.error(`[${errorResponse.correlationId}] ${status} ${request.method} ${request.url}`, exception);

    response.status(status).json(errorResponse);
  }

  private getHttpStatusText(status: number): string {
    const statusTexts: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      422: 'Unprocessable Entity',
      500: 'Internal Server Error',
      503: 'Service Unavailable',
    };
    return statusTexts[status] || 'Error';
  }
}
```

**Enable globally:**
```typescript
// apps/backend/src/main.ts

app.useGlobalFilters(new AllExceptionsFilter());
```

---

### GAP 2: Retry Policies 🔴 HIGH

**Current State:** Retry behavior not specified
**Impact:** Transient failures cause permanent errors, poor reliability
**Estimated Time:** 1 day

**Implementation:**

Create `apps/backend/src/common/retry/retry.config.ts`:

```typescript
export interface RetryPolicy {
  maxAttempts: number;
  backoff: 'exponential' | 'fixed';
  initialDelay: number; // milliseconds
  maxDelay?: number; // milliseconds (for exponential)
  retryableErrors?: string[]; // Error codes/messages to retry
}

export const RETRY_POLICIES = {
  SCRAPER: {
    maxAttempts: 3,
    backoff: 'exponential',
    initialDelay: 2000, // 2s
    maxDelay: 60000, // 60s
    retryableErrors: ['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'NETWORK_ERROR', '503', '429'],
  } as RetryPolicy,

  EXTERNAL_API: {
    maxAttempts: 2,
    backoff: 'fixed',
    initialDelay: 1000, // 1s
    retryableErrors: ['ECONNREFUSED', 'ETIMEDOUT', '503', '429'],
  } as RetryPolicy,

  DATABASE: {
    maxAttempts: 3,
    backoff: 'exponential',
    initialDelay: 100, // 100ms
    maxDelay: 5000, // 5s
    retryableErrors: ['ECONNRESET', 'ENOTFOUND', 'ETIMEDOUT'],
  } as RetryPolicy,
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  policy: RetryPolicy,
  context?: string
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= policy.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Check if error is retryable
      if (policy.retryableErrors && !isRetryableError(error, policy.retryableErrors)) {
        console.error(`[${context}] Non-retryable error on attempt ${attempt}:`, error);
        throw error;
      }

      // Last attempt - throw error
      if (attempt === policy.maxAttempts) {
        console.error(`[${context}] Failed after ${policy.maxAttempts} attempts:`, error);
        throw error;
      }

      // Calculate delay
      const delay = calculateDelay(attempt, policy);
      console.warn(`[${context}] Attempt ${attempt} failed, retrying in ${delay}ms...`, error);

      await sleep(delay);
    }
  }

  throw lastError!;
}

function isRetryableError(error: unknown, retryableErrors: string[]): boolean {
  if (error instanceof Error) {
    return retryableErrors.some((errCode) =>
      error.message.includes(errCode) || (error as any).code === errCode
    );
  }
  return false;
}

function calculateDelay(attempt: number, policy: RetryPolicy): number {
  if (policy.backoff === 'exponential') {
    const delay = policy.initialDelay * Math.pow(2, attempt - 1);
    return Math.min(delay, policy.maxDelay || delay);
  }
  return policy.initialDelay;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

**Usage:**
```typescript
// apps/backend/src/scrapers/scraper.service.ts

import { withRetry, RETRY_POLICIES } from '../common/retry/retry.config';

async scrapeRetailer(retailerId: string) {
  return withRetry(
    () => this.executeScraper(retailerId),
    RETRY_POLICIES.SCRAPER,
    `scraper-${retailerId}`
  );
}
```

**pg-boss queue configuration:**
```typescript
// apps/backend/src/queues/queue.config.ts

export const QUEUE_CONFIG = {
  retryLimit: 5,
  retryDelay: 60, // seconds
  retryBackoff: true,
  expireInHours: 24,
};
```

---

### GAP 3: Circuit Breakers 🟡 MEDIUM

**Current State:** No circuit breaker pattern
**Impact:** System wastes resources on failing services, cascading failures
**Estimated Time:** 1 day

**Implementation:**

Install dependency:
```bash
pnpm add opossum@8.1.4
```

Create `apps/backend/src/common/circuit-breakers/circuit-breaker.factory.ts`:

```typescript
import CircuitBreaker from 'opossum';

export class CircuitBreakerFactory {
  static createGoogleMapsBreaker() {
    const breaker = new CircuitBreaker(
      async (origin: Location, destination: Location) => {
        // This will be replaced with actual implementation
        throw new Error('Not implemented');
      },
      {
        timeout: 5000, // 5s timeout
        errorThresholdPercentage: 50, // Open circuit at 50% error rate
        resetTimeout: 30000, // Try again after 30s
        rollingCountTimeout: 10000, // Measure errors over 10s window
        rollingCountBuckets: 10,
        name: 'google-maps',
      }
    );

    // Event listeners for monitoring
    breaker.on('open', () => {
      console.error('Circuit breaker OPEN: Google Maps API');
    });

    breaker.on('halfOpen', () => {
      console.warn('Circuit breaker HALF-OPEN: Google Maps API (testing recovery)');
    });

    breaker.on('close', () => {
      console.info('Circuit breaker CLOSED: Google Maps API (service recovered)');
    });

    return breaker;
  }

  static createScraperBreaker(retailerId: string) {
    const breaker = new CircuitBreaker(
      async () => {
        throw new Error('Not implemented');
      },
      {
        timeout: 60000, // 60s (scraping takes time)
        errorThresholdPercentage: 75, // Open at 75% error rate
        resetTimeout: 300000, // Try again after 5 minutes
        name: `scraper-${retailerId}`,
      }
    );

    breaker.on('open', () => {
      console.error(`Circuit breaker OPEN: Scraper ${retailerId}`);
    });

    return breaker;
  }
}
```

**Usage:**
```typescript
// apps/backend/src/optimization/maps.service.ts

export class MapsService {
  private circuitBreaker: CircuitBreaker;

  constructor() {
    this.circuitBreaker = CircuitBreakerFactory.createGoogleMapsBreaker();
  }

  async getDistance(origin: Location, destination: Location): Promise<number> {
    try {
      return await this.circuitBreaker.fire(origin, destination);
    } catch (error) {
      // Circuit is open or call failed - use fallback
      console.warn('Google Maps unavailable, using fallback (OSRM)');
      return this.osrmService.getDistance(origin, destination);
    }
  }
}
```

---

### GAP 4: Alerting Thresholds 🟡 MEDIUM

**Current State:** Alerts mentioned but thresholds not quantified
**Impact:** No proactive incident detection, slow response to issues
**Estimated Time:** 0.5 days (documentation)

**Implementation:**

Create `docs/operations/alerting-thresholds.md`:

```yaml
# Alerting Thresholds

## Critical Alerts (Page On-Call)

1. Database Connection Pool Exhaustion
   - Condition: connection_pool_usage > 0.9 (90%)
   - Action: Page on-call engineer
   - Runbook: Scale database or kill long-running queries

2. Optimization Latency P95 > 30s
   - Condition: histogram_quantile(0.95, optimization_duration_seconds) > 30
   - Action: Page on-call engineer
   - Runbook: Check database slow queries, scraper health

3. API Error Rate > 10%
   - Condition: sum(rate(http_errors_total[5m])) / sum(rate(http_requests_total[5m])) > 0.1
   - Action: Page on-call engineer
   - Runbook: Check error logs, service health

## High Priority Alerts (Notify Slack #tech-alerts)

4. Scraper Failure Rate > 20%
   - Condition: sum(rate(scraper_failures_total[5m])) / sum(rate(scraper_runs_total[5m])) > 0.2
   - Action: Notify #tech-alerts
   - Runbook: Check scraper logs, verify retailer websites

5. Queue Backlog > 500 Jobs
   - Condition: pg_boss_queue_depth{queue="ingestion"} > 500
   - Action: Notify #tech-alerts
   - Runbook: Scale workers or investigate slow processing

6. Stale Price Data > 6 Hours
   - Condition: max(time() - retailer_last_scrape_timestamp) > 21600
   - Action: Notify #tech-alerts
   - Runbook: Check scheduler health, scraper failures

## Medium Priority Alerts (Notify Slack #ops-alerts)

7. High Memory Usage > 80%
   - Condition: memory_usage_percent > 80
   - Action: Notify #ops-alerts
   - Runbook: Check for memory leaks, restart service

8. Disk Usage > 75%
   - Condition: disk_usage_percent > 75
   - Action: Notify #ops-alerts
   - Runbook: Clean up logs, old receipts

9. Circuit Breaker Open
   - Condition: circuit_breaker_state{service=~".*"} == 1 (open)
   - Action: Notify #ops-alerts
   - Runbook: Check external service status, fallback health
```

---

### GAP 5: Distributed Tracing 🟢 LOW

**Current State:** No request correlation IDs or tracing
**Impact:** Difficult to debug cross-service issues
**Estimated Time:** 1 day

**Implementation:**

Create correlation ID middleware:

```typescript
// apps/backend/src/common/middleware/correlation-id.middleware.ts

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const correlationId =
      (req.headers['x-correlation-id'] as string) ||
      (req.headers['x-request-id'] as string) ||
      uuidv4();

    req['correlationId'] = correlationId;
    res.setHeader('X-Correlation-ID', correlationId);

    next();
  }
}
```

**Enable globally:**
```typescript
// apps/backend/src/app.module.ts

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
```

**Use in logger:**
```typescript
// apps/backend/src/optimization/optimization.service.ts

async optimize(listId: string, correlationId: string) {
  this.logger.log({
    message: 'Optimization started',
    correlationId,
    listId,
    timestamp: new Date().toISOString(),
  });

  try {
    const result = await this.computeOptimal(listId);

    this.logger.log({
      message: 'Optimization completed',
      correlationId,
      listId,
      duration: result.duration,
    });

    return result;
  } catch (error) {
    this.logger.error({
      message: 'Optimization failed',
      correlationId,
      listId,
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}
```

---

### GAP 6: Resource Sizing Guidelines 🟢 LOW

**Current State:** No server specs or database sizing
**Impact:** Over/under-provisioning, unclear upgrade triggers
**Estimated Time:** 0.5 days (documentation)

**Implementation:**

Add to `docs/operations/resource-sizing.md`:

```markdown
# Resource Sizing Guidelines

## MVP (100 concurrent users)

### Backend (NestJS)
- **CPU**: 1 vCPU
- **RAM**: 512MB
- **Instances**: 1-2 (auto-scale on CPU >70%)
- **Upgrade Trigger**: CPU >80% sustained OR OOM errors

### Scraper Workers
- **CPU**: 2 vCPU (Playwright browser automation)
- **RAM**: 2GB (browser memory overhead)
- **Instances**: 1 per retailer (5 total)
- **Upgrade Trigger**: Scraper timeout errors OR queue backlog >500

### Database (Supabase Postgres)
- **Plan**: Free tier (500MB storage, 2GB bandwidth/month)
- **Connections**: 25 (pool size)
- **IOPS**: ~1000 (Supabase default)
- **Upgrade Trigger**:
  - Storage >400MB (80% usage)
  - Connection pool usage >80%
  - Slow query P95 >500ms

### Redis (Upstash)
- **Plan**: Free tier (10k commands/day)
- **Usage**: Rate limiting counters, session cache
- **Upgrade Trigger**: Command limit reached

### Storage (Supabase)
- **Plan**: Free tier (1GB)
- **Usage**: Receipt photos (~100KB/receipt)
- **Upgrade Trigger**: >800MB used (80% usage)

---

## Phase 2 (1000 concurrent users)

### Backend
- **CPU**: 2 vCPU
- **RAM**: 1GB
- **Instances**: 3-5 (load balanced)

### Database
- **Plan**: Paid tier (8GB storage, 50GB bandwidth/month)
- **Connections**: 100
- **Read Replicas**: 1 (if read-heavy)

### Scraper Workers
- **CPU**: 2 vCPU
- **RAM**: 2GB
- **Instances**: 2-3 per retailer (10-15 total)
```

---

## 3. Implementation Timeline

### Sprint 1 (Days 1-3)

**Day 1:**
- ✅ Implement Error Taxonomy (GAP 1)
- ✅ Create global exception filter
- ✅ Update all error responses to use ErrorResponse interface

**Day 2:**
- ✅ Implement Retry Policies (GAP 2)
- ✅ Apply retry logic to scrapers
- ✅ Configure pg-boss retries

**Day 3:**
- ✅ Implement Circuit Breakers (GAP 3)
- ✅ Add circuit breaker to Google Maps service
- ✅ Add circuit breaker to scraper workers

### Sprint 2 (Days 4-6)

**Day 4:**
- ✅ Document Alerting Thresholds (GAP 4)
- ✅ Set up basic Prometheus/Grafana alerts (if available)
- ✅ Configure Slack webhook for notifications

**Day 5:**
- ✅ Implement Distributed Tracing (GAP 5)
- ✅ Add correlation ID middleware
- ✅ Update all log statements to include correlationId

**Day 6:**
- ✅ Document Resource Sizing (GAP 6)
- ✅ Create runbooks for common incidents
- ✅ Test all error handling scenarios

---

## 4. Testing Checklist

### Error Handling Tests
- [ ] Test validation errors return ErrorResponse format
- [ ] Test business logic errors (BASKET_INCOMPLETE)
- [ ] Test service errors (SCRAPER_UNAVAILABLE)
- [ ] Test correlation ID propagates through requests

### Retry Tests
- [ ] Test scraper retries on transient failures
- [ ] Test scraper fails immediately on non-retryable errors
- [ ] Test exponential backoff delays

### Circuit Breaker Tests
- [ ] Test circuit opens after error threshold
- [ ] Test circuit half-opens after reset timeout
- [ ] Test fallback services activate when circuit open

### Monitoring Tests
- [ ] Test alerts trigger at defined thresholds
- [ ] Test correlation IDs appear in logs
- [ ] Test health check endpoint returns correct status

---

## 5. Success Criteria

### Section 5 Score Target: 90% (18/20 items)

**Improved Scores:**
- 5.1 Error Handling & Resilience: **40% → 100%** (all gaps addressed)
- 5.2 Monitoring & Observability: **60% → 80%** (alerting + tracing added)
- 5.3 Performance & Scaling: **40% → 60%** (resource sizing documented)
- 5.4 Deployment & DevOps: **100%** (already excellent)

**Overall Section 5:** **60% → 85%**

### Acceptance Criteria
- ✅ All errors use standardized ErrorResponse format
- ✅ Retry policies configured for all external calls
- ✅ Circuit breakers protect critical services
- ✅ Alerting thresholds documented with runbooks
- ✅ Correlation IDs in all logs
- ✅ Resource sizing guidelines available
- ✅ 100% of tests pass

---

## 6. Related Documentation

- **Architecture:** `docs/architecture.md` §9 (Observability & Ops)
- **Edge Cases:** `docs/architecture/edge-case-handling.md` (Error scenarios)
- **PRD:** `docs/prd.md` §7.2 (Non-Functional Requirements - Reliability)
