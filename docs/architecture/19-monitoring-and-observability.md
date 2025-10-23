# 19. Monitoring and Observability

## 19.1 Sentry Integration

```typescript
// apps/web/lib/sentry.ts
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // Filter out PII
    return event;
  },
});
```

## 19.2 Logging

```typescript
// apps/api/src/common/logger.service.ts
import { Logger } from '@nestjs/common';

export class AppLogger extends Logger {
  log(message: string, context?: string) {
    super.log(message, context);
    // Send to external logging service if needed
  }
  
  error(message: string, trace?: string, context?: string) {
    super.error(message, trace, context);
    Sentry.captureException(new Error(message));
  }
}
```

## 19.3 Health Checks

```typescript
// apps/api/src/health/health.controller.ts
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
  
  @Get('db')
  async checkDB() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { database: 'ok' };
  }
}
```

## 19.4 Analytics

**PostHog Integration:**
```typescript
// apps/web/lib/posthog.ts
posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
  api_host: 'https://app.posthog.com',
  loaded: (posthog) => {
    if (process.env.NODE_ENV === 'development') posthog.opt_out_capturing();
  },
});

// Track events
posthog.capture('optimization_run', {
  savings: 240,
  stores: 3,
});
```

## 19.5 Alerting Strategy

### 19.5.1 Alert Thresholds and Severity Levels

**Severity Levels:**
- **P1 (Critical):** Service down, production incident, immediate action required
- **P2 (High):** Degraded performance, user-facing issues, action required within 1 hour
- **P3 (Medium):** Non-critical errors, background jobs failing, action required within 24 hours
- **P4 (Low):** Informational, potential issues, review during business hours

### 19.5.2 Application Performance Alerts

**API Response Time Alerts (Sentry Performance Monitoring):**

| Metric | Threshold | Severity | Alert Destination |
|--------|-----------|----------|-------------------|
| API p95 latency | >500ms for 5 min | P2 | Slack #alerts, Email |
| API p99 latency | >1s for 5 min | P2 | Slack #alerts, Email |
| Optimization endpoint | >2s for 3 requests | P1 | PagerDuty, Slack #critical |
| Error rate | >1% over 5 min | P1 | PagerDuty, Slack #critical |
| Error rate | >0.5% over 10 min | P2 | Slack #alerts |

**Frontend Performance Alerts (Sentry Browser SDK):**

| Metric | Threshold | Severity | Alert Destination |
|--------|-----------|----------|-------------------|
| First Contentful Paint (FCP) | >2s for 50% of users | P3 | Slack #frontend |
| Largest Contentful Paint (LCP) | >2.5s for 50% of users | P2 | Slack #alerts |
| Cumulative Layout Shift (CLS) | >0.1 for 50% of users | P3 | Slack #frontend |
| JavaScript bundle size | >350KB gzipped | P3 | Slack #frontend |

### 19.5.3 Infrastructure Alerts

**Database Alerts (Supabase Monitoring):**

| Metric | Threshold | Severity | Alert Destination |
|--------|-----------|----------|-------------------|
| Connection pool exhaustion | >8 active connections | P1 | PagerDuty, Slack #critical |
| Query duration | >3s for any query | P2 | Slack #alerts |
| Database CPU | >80% for 10 min | P2 | Slack #alerts |
| Database storage | >400MB (80% of free tier) | P3 | Email |
| Replication lag | >10s | P1 | PagerDuty, Slack #critical |

**Redis Cache Alerts (Upstash Monitoring):**

| Metric | Threshold | Severity | Alert Destination |
|--------|-----------|----------|-------------------|
| Cache hit rate | <60% for 15 min | P3 | Slack #backend |
| Redis commands | >9000/day (90% of free tier) | P3 | Email |
| Redis unavailable | Connection timeout | P2 | Slack #alerts |
| Memory usage | >80% of allocated | P3 | Slack #backend |

**Deployment Health (BetterUptime):**

| Metric | Threshold | Severity | Alert Destination |
|--------|-----------|----------|-------------------|
| Web app down | HTTP ≠200 for /health | P1 | PagerDuty, Slack #critical |
| API down | HTTP ≠200 for /health | P1 | PagerDuty, Slack #critical |
| SSL certificate expiry | <7 days remaining | P2 | Email, Slack #alerts |
| Uptime | <99% over 24h | P3 | Email |

### 19.5.4 Background Job Alerts

**Web Scraping Job Alerts (NestJS Scheduler):**

| Metric | Threshold | Severity | Alert Destination |
|--------|-----------|----------|-------------------|
| Scraping job failed | 2 consecutive failures | P3 | Slack #data-acquisition |
| All scrapers failed | 0 success in 24h | P1 | PagerDuty, Slack #critical |
| Price snapshot count | <100 prices scraped/day | P3 | Slack #data-acquisition |
| Circuit breaker OPEN | Any scraper circuit open >1h | P2 | Slack #alerts |

**OCR Job Alerts (Google Cloud Vision):**

| Metric | Threshold | Severity | Alert Destination |
|--------|-----------|----------|-------------------|
| OCR confidence | <70% for >50% of requests | P3 | Slack #data-acquisition |
| GCP Vision API errors | >10 errors/hour | P2 | Slack #alerts |
| GCP Vision quota | >800 requests/month (80% of free tier) | P3 | Email |
| PDF processing timeout | >30s for single PDF | P3 | Slack #backend |

### 19.5.5 Security Alerts

**Authentication & Authorization (Supabase Auth):**

| Event | Threshold | Severity | Alert Destination |
|-------|-----------|----------|-------------------|
| Failed login attempts | >10 from single IP in 5 min | P2 | Slack #security, Email |
| Unauthorized API access | 401/403 errors >20/min | P2 | Slack #security |
| Suspicious activity | Multiple accounts from single IP | P3 | Email |
| Password reset flood | >5 requests from single email in 1h | P3 | Slack #security |

**Rate Limiting (Redis-backed):**

| Event | Threshold | Severity | Alert Destination |
|-------|-----------|----------|-------------------|
| Rate limit exceeded | Single IP >100 req/min | P4 | Log only |
| Rate limit abuse | Same IP blocked >10 times/hour | P3 | Slack #security |

### 19.5.6 Cost Management Alerts

**Infrastructure Cost Overages:**

| Service | Threshold | Severity | Alert Destination |
|---------|-----------|----------|-------------------|
| Railway | >400 hours/month (80% of free tier) | P3 | Email, Slack #ops |
| Vercel | >80GB bandwidth/month | P3 | Email |
| GCP Vision | >800 requests/month | P3 | Email, Slack #ops |
| Total monthly cost | >R200 | P2 | Email stakeholders |

### 19.5.7 Sentry Alert Configuration

**Setup Sentry Alerts in apps/api/src/main.ts:**

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // Filter out PII
    if (event.user) {
      delete event.user.ip_address;
      delete event.user.email;
    }
    return event;
  },
});

// Configure alert rules in Sentry UI:
// 1. Error rate > 1% over 5 min → P1 → PagerDuty + Slack
// 2. Error rate > 0.5% over 10 min → P2 → Slack
// 3. API p99 latency > 1s for 5 min → P2 → Slack
// 4. New error type (never seen before) → P3 → Slack
```

### 19.5.8 BetterUptime Health Check Configuration

**Health Check Endpoint (apps/api/src/health/health.controller.ts):**

```typescript
import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Get()
  async check() {
    const timestamp = new Date().toISOString();
    const uptime = process.uptime();

    try {
      // Check database connectivity
      await this.prisma.$queryRaw`SELECT 1`;

      // Check Redis connectivity (optional - don't fail if Redis is down)
      let redisStatus = 'ok';
      try {
        await this.redis.ping();
      } catch (error) {
        redisStatus = 'degraded';
        console.warn('Redis health check failed:', error.message);
      }

      return {
        status: 'ok',
        timestamp,
        uptime,
        services: {
          database: 'ok',
          redis: redisStatus,
        },
      };
    } catch (error) {
      console.error('Health check failed:', error);
      throw new Error('Service unhealthy');
    }
  }

  @Get('db')
  async checkDB() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { database: 'ok' };
    } catch (error) {
      console.error('Database health check failed:', error);
      throw new Error('Database unhealthy');
    }
  }

  @Get('redis')
  async checkRedis() {
    try {
      await this.redis.ping();
      return { redis: 'ok' };
    } catch (error) {
      console.error('Redis health check failed:', error);
      throw new Error('Redis unhealthy');
    }
  }
}
```

**BetterUptime Configuration:**
- **Endpoint:** `https://api.tillless.co.za/health`
- **Check Frequency:** Every 60 seconds
- **Expected Status:** HTTP 200
- **Timeout:** 10 seconds
- **Fail After:** 2 consecutive failures
- **Alert Channels:** PagerDuty (P1), Slack #critical, Email

### 19.5.9 Slack Integration

**Slack Webhook Configuration:**

```typescript
// apps/api/src/common/notifications/slack.service.ts
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface SlackAlert {
  severity: 'P1' | 'P2' | 'P3' | 'P4';
  title: string;
  message: string;
  context?: Record<string, any>;
}

@Injectable()
export class SlackService {
  private readonly logger = new Logger(SlackService.name);
  private readonly webhooks = {
    critical: process.env.SLACK_WEBHOOK_CRITICAL,
    alerts: process.env.SLACK_WEBHOOK_ALERTS,
    backend: process.env.SLACK_WEBHOOK_BACKEND,
    frontend: process.env.SLACK_WEBHOOK_FRONTEND,
    security: process.env.SLACK_WEBHOOK_SECURITY,
    ops: process.env.SLACK_WEBHOOK_OPS,
  };

  async sendAlert(channel: keyof typeof this.webhooks, alert: SlackAlert) {
    const webhookUrl = this.webhooks[channel];
    if (!webhookUrl) {
      this.logger.warn(`No webhook configured for channel: ${channel}`);
      return;
    }

    const color = {
      P1: '#FF0000', // Red
      P2: '#FFA500', // Orange
      P3: '#FFFF00', // Yellow
      P4: '#00FF00', // Green
    }[alert.severity];

    try {
      await axios.post(webhookUrl, {
        attachments: [
          {
            color,
            title: `[${alert.severity}] ${alert.title}`,
            text: alert.message,
            fields: alert.context
              ? Object.entries(alert.context).map(([key, value]) => ({
                  title: key,
                  value: String(value),
                  short: true,
                }))
              : [],
            footer: 'TillLess Monitoring',
            ts: Math.floor(Date.now() / 1000),
          },
        ],
      });
    } catch (error) {
      this.logger.error(`Failed to send Slack alert: ${error.message}`);
    }
  }
}

// Usage example
export class OptimizationService {
  constructor(private readonly slackService: SlackService) {}

  async optimize(request: OptimizationRequest) {
    const start = Date.now();
    try {
      const result = await this.optimizationEngine.optimize(request);
      const duration = Date.now() - start;

      // Alert if optimization takes >2s (NFR4)
      if (duration > 2000) {
        await this.slackService.sendAlert('alerts', {
          severity: 'P2',
          title: 'Slow Optimization',
          message: `Optimization took ${duration}ms (threshold: 2000ms)`,
          context: {
            shoppingListId: request.shoppingListId,
            itemCount: request.items.length,
            duration: `${duration}ms`,
          },
        });
      }

      return result;
    } catch (error) {
      // Alert on optimization failures
      await this.slackService.sendAlert('critical', {
        severity: 'P1',
        title: 'Optimization Failed',
        message: error.message,
        context: {
          shoppingListId: request.shoppingListId,
          error: error.message,
        },
      });
      throw error;
    }
  }
}
```

---

**End of Sections 4-19**
