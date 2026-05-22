import * as Sentry from '@sentry/nextjs'

/**
 * Server-runtime Sentry init. Loaded from `instrumentation.ts` only when
 * SENTRY_DSN is set, so it's safe to ship in repos that don't yet have
 * Sentry configured.
 */
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
})
