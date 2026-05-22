/**
 * Next.js instrumentation hook — runs once per worker on cold start.
 * Used to initialize Sentry on the server / edge runtime when SENTRY_DSN is
 * set. Client-side init lives in `instrumentation-client.ts`.
 *
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  if (!process.env.SENTRY_DSN) return

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

/**
 * Forward unhandled request errors to Sentry. Signature matches Next.js's
 * Instrumentation.onRequestError — we relay all args through so type drift
 * between Next/Sentry versions doesn't cause build breaks.
 */
export const onRequestError: typeof import('@sentry/nextjs').captureRequestError =
  process.env.SENTRY_DSN
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((...args: unknown[]) => {
        return import('@sentry/nextjs').then((Sentry) =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (Sentry.captureRequestError as any)(...args),
        )
      }) as unknown as typeof import('@sentry/nextjs').captureRequestError
    : (() => {}) as unknown as typeof import('@sentry/nextjs').captureRequestError
