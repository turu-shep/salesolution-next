/**
 * Client-side instrumentation. Initializes Sentry in the browser when
 * NEXT_PUBLIC_SENTRY_DSN is set; otherwise a no-op.
 *
 * Next.js loads this file once before hydration; it's the official place
 * for client-side observability boot. Keep it small — anything imported
 * here lands in every page's JS bundle.
 */
import * as Sentry from '@sentry/nextjs'

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    // Adjust to taste — 10% sampling is a safe starting point that won't
    // burn your free-tier quota on a marketing site.
    tracesSampleRate: 0.1,
    // Session replay is opt-in. Leave at 0 unless you've reviewed the
    // privacy impact and updated the policy.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    // Send environment so dev errors don't pollute production data.
    environment: process.env.NODE_ENV,
  })
}

// Required by @sentry/nextjs for route-change tracing.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
