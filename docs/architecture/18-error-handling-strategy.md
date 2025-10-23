# 18. Error Handling Strategy

## 18.1 Frontend Error Boundaries

```typescript
// apps/web/components/error-boundary.tsx
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to Sentry with React component stack
    Sentry.captureException(error, {
      contexts: { react: errorInfo },
      tags: { errorBoundary: true }
    });

    console.error('Error Boundary caught:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

// Default fallback UI
function DefaultErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-muted-foreground">{error.message}</p>
        <button
          onClick={resetError}
          className="btn btn-primary"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
```

## 18.2 Backend Error Handling

```typescript
// apps/api/src/common/filters/all-exceptions.filter.ts
import { Catch, ArgumentsHost, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import * as Sentry from '@sentry/node';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    // Determine status code
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message || message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Log to Sentry (skip 4xx errors except 401/403)
    const shouldLogToSentry = status >= 500 || status === 401 || status === 403;
    if (shouldLogToSentry) {
      Sentry.captureException(exception, {
        tags: {
          statusCode: status,
          path: request.url,
          method: request.method,
        },
        user: request.user ? { id: request.user.id, email: request.user.email } : undefined,
      });
    }

    // Log to console
    console.error(`[${request.method}] ${request.url} - ${status}:`, exception);

    // Return error response
    response.status(status).json({
      statusCode: status,
      message: Array.isArray(message) ? message : [message],
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

**Retry Logic with Exponential Backoff:**

```typescript
// apps/api/src/common/decorators/retry.decorator.ts
import { Logger } from '@nestjs/common';

interface RetryOptions {
  maxAttempts?: number;          // Default: 3
  initialDelayMs?: number;       // Default: 1000
  maxDelayMs?: number;           // Default: 10000
  backoffMultiplier?: number;    // Default: 2
  shouldRetry?: (error: Error) => boolean;
}

export function Retry(options: RetryOptions = {}) {
  const {
    maxAttempts = 3,
    initialDelayMs = 1000,
    maxDelayMs = 10000,
    backoffMultiplier = 2,
    shouldRetry = () => true,
  } = options;

  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const logger = new Logger(`${target.constructor.name}.${propertyKey}`);

    descriptor.value = async function (...args: any[]) {
      let lastError: Error;
      let delay = initialDelayMs;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          lastError = error as Error;

          // Check if we should retry this error
          if (!shouldRetry(lastError)) {
            logger.warn(`Non-retryable error on attempt ${attempt}: ${lastError.message}`);
            throw lastError;
          }

          // Don't retry if this was the last attempt
          if (attempt === maxAttempts) {
            logger.error(`All ${maxAttempts} retry attempts failed: ${lastError.message}`);
            throw lastError;
          }

          // Log retry attempt
          logger.warn(
            `Attempt ${attempt}/${maxAttempts} failed: ${lastError.message}. Retrying in ${delay}ms...`
          );

          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, delay));

          // Exponential backoff with cap
          delay = Math.min(delay * backoffMultiplier, maxDelayMs);
        }
      }

      throw lastError!;
    };

    return descriptor;
  };
}

// Usage example in RetailerService
export class RetailerService {
  @Retry({
    maxAttempts: 3,
    initialDelayMs: 1000,
    shouldRetry: (error) => {
      // Retry on network errors, timeouts, 5xx responses
      return error.name === 'TimeoutError' ||
             error.message.includes('ECONNREFUSED') ||
             error.message.includes('ETIMEDOUT') ||
             (error as any).statusCode >= 500;
    }
  })
  async scrapeRetailerPrices(retailerId: string): Promise<Price[]> {
    // Web scraping logic that may fail transiently
    const response = await this.httpClient.get(retailerUrl);
    return this.parsePrices(response.data);
  }
}
```

## 18.3 tRPC Error Handling

```typescript
// packages/api-client/src/trpc-router.ts
import { TRPCError } from '@trpc/server';

export const protectedProcedure = t.procedure
  .use(async ({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to access this resource',
      });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  });

// Custom error codes for domain errors
export class DomainError extends TRPCError {
  constructor(message: string, code: TRPCError['code'] = 'BAD_REQUEST') {
    super({ code, message });
  }
}

export class OptimizationError extends DomainError {
  constructor(message: string) {
    super(message, 'INTERNAL_SERVER_ERROR');
  }
}

// Usage in optimization router
export const optimizationRouter = router({
  optimize: protectedProcedure
    .input(OptimizationRequestSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await optimizationEngine.optimize(input);
        return result;
      } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Database error during optimization',
            cause: error,
          });
        }
        if (error instanceof OptimizationError) {
          throw error; // Already a TRPCError
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Unexpected error during optimization',
          cause: error,
        });
      }
    }),
});
```

## 18.4 Retry Policies and Circuit Breakers

### 18.4.1 Circuit Breaker Pattern

```typescript
// apps/api/src/common/circuit-breaker/circuit-breaker.ts
export enum CircuitState {
  CLOSED = 'CLOSED',       // Normal operation
  OPEN = 'OPEN',           // Failing, reject requests immediately
  HALF_OPEN = 'HALF_OPEN', // Testing if service recovered
}

interface CircuitBreakerOptions {
  failureThreshold: number;      // Open after N consecutive failures (default: 5)
  successThreshold: number;      // Close after N consecutive successes in HALF_OPEN (default: 2)
  timeout: number;               // Time in ms before attempting HALF_OPEN (default: 60000)
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private nextAttempt: number = Date.now();
  private logger = new Logger('CircuitBreaker');

  constructor(
    private name: string,
    private options: CircuitBreakerOptions = {
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 60000,
    }
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // If circuit is OPEN, check if timeout has passed
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        throw new Error(`Circuit breaker [${this.name}] is OPEN. Service unavailable.`);
      }
      // Timeout passed, move to HALF_OPEN to test
      this.state = CircuitState.HALF_OPEN;
      this.logger.log(`Circuit breaker [${this.name}] entering HALF_OPEN state`);
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.options.successThreshold) {
        this.state = CircuitState.CLOSED;
        this.successCount = 0;
        this.logger.log(`Circuit breaker [${this.name}] CLOSED after ${this.options.successThreshold} successes`);
      }
    }
  }

  private onFailure() {
    this.successCount = 0;
    this.failureCount++;

    if (this.failureCount >= this.options.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.nextAttempt = Date.now() + this.options.timeout;
      this.logger.error(
        `Circuit breaker [${this.name}] OPEN after ${this.failureCount} failures. Will retry at ${new Date(this.nextAttempt).toISOString()}`
      );
    }
  }

  getState(): CircuitState {
    return this.state;
  }
}

// Usage example for external API calls
export class GoogleVisionService {
  private circuitBreaker = new CircuitBreaker('GoogleVision', {
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 60000,
  });

  async extractText(imageUrl: string): Promise<string> {
    return this.circuitBreaker.execute(async () => {
      const [result] = await this.visionClient.textDetection(imageUrl);
      return result.fullTextAnnotation?.text || '';
    });
  }
}
```

### 18.4.2 Graceful Degradation

**Optimization Service Fallback (Redis Unavailable):**

```typescript
// apps/api/src/optimization/optimization.service.ts
export class OptimizationService {
  constructor(
    private readonly redisService: RedisService,
    private readonly optimizationEngine: OptimizationEngine,
    private readonly logger: Logger,
  ) {}

  async optimize(request: OptimizationRequest): Promise<OptimizationResult> {
    const cacheKey = `opt:${request.shoppingListId}`;

    // Try to get from cache (non-blocking)
    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        this.logger.debug(`Cache HIT for ${cacheKey}`);
        return JSON.parse(cached);
      }
    } catch (error) {
      // Redis down - log and continue without cache
      this.logger.warn(`Redis cache unavailable: ${error.message}. Running optimization without cache.`);
    }

    // Run optimization (always runs if cache miss or Redis down)
    const result = await this.optimizationEngine.optimize(request);

    // Try to cache result (non-blocking, fire-and-forget)
    this.cacheResult(cacheKey, result).catch(error => {
      this.logger.warn(`Failed to cache optimization result: ${error.message}`);
    });

    return result;
  }

  private async cacheResult(key: string, result: OptimizationResult): Promise<void> {
    await this.redisService.setex(key, 300, JSON.stringify(result));
  }
}
```

**Web Scraping Fallback (Scraper Fails):**

```typescript
// apps/api/src/retailer/strategies/web-scraper.strategy.ts
export class WebScraperStrategy implements IDataAcquisitionStrategy {
  async acquireData(retailer: Retailer): Promise<Price[]> {
    try {
      return await this.scrapeWithPlaywright(retailer);
    } catch (error) {
      this.logger.error(`Playwright scraping failed for ${retailer.name}: ${error.message}`);

      // Fallback 1: Try Cheerio (faster, no JS rendering)
      try {
        return await this.scrapeWithCheerio(retailer);
      } catch (fallbackError) {
        this.logger.error(`Cheerio fallback failed: ${fallbackError.message}`);

        // Fallback 2: Use stale prices from last successful scrape
        const stalePrices = await this.prisma.price.findMany({
          where: {
            retailerId: retailer.id,
            snapshotDate: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
          }
        });

        if (stalePrices.length > 0) {
          this.logger.warn(`Using ${stalePrices.length} stale prices for ${retailer.name} (up to 7 days old)`);
          return stalePrices;
        }

        // Fallback 3: Return empty array (graceful degradation)
        this.logger.error(`No fallback prices available for ${retailer.name}. Returning empty array.`);
        return [];
      }
    }
  }
}
```
