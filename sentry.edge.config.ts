import * as Sentry from '@sentry/nextjs'

/**
 * Edge-runtime Sentry init. Used by middleware + edge route handlers (none
 * currently in this codebase, but @sentry/nextjs will route to this file
 * automatically if any edge code is added).
 */
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
})
