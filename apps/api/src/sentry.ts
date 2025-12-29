import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

export function initSentry() {
  const dsn = process.env['SENTRY_DSN'];

  if (!dsn) {
    console.warn('SENTRY_DSN not configured - error tracking disabled');
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env['NODE_ENV'] || 'development',

    // Performance monitoring
    tracesSampleRate: process.env['NODE_ENV'] === 'production' ? 0.1 : 1.0,

    // Profiling
    profilesSampleRate: process.env['NODE_ENV'] === 'production' ? 0.1 : 1.0,
    integrations: [
      nodeProfilingIntegration(),
    ],

    // Filter out health check requests from traces
    beforeSendTransaction(event) {
      if (event.request?.url?.includes('/api/health')) {
        return null;
      }
      return event;
    },
  });

  console.log('✅ Sentry initialized successfully');
}
