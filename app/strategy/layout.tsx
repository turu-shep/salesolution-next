import type { Metadata } from 'next'
import { cookies, headers } from 'next/headers'
import { notFound } from 'next/navigation'

import { StrategyLogin } from '@/components/strategy/StrategyLogin'
import { StrategyShell } from '@/components/strategy/StrategyShell'
import { MAX_AGE_S, STRATEGY_COOKIE, isLocalHost, verifySession } from '@/lib/strategy/auth'

/**
 * The gate for everything under /strategy (private strategy docs).
 *
 * Same access model as /sales (see app/sales/layout.tsx), reusing the SAME env
 * params (SALES_ENABLED / SALES_SESSION_SECRET, plus SALES_PASSWORD in the login
 * route):
 *   - Localhost → open. Read from your desk without a password.
 *   - Production → 404 unless SALES_ENABLED=true; when enabled, requires a valid
 *     signed session cookie, else the password form renders in place (no separate
 *     login route, so no redirect loop).
 *
 * Reading cookies/headers opts this subtree into dynamic rendering, which is what
 * we want — the gate must run on every request. noindex + robots Disallow
 * (app/robots.ts) keep it out of search. Sits outside the (site) group, so it
 * gets the clean root shell with no public nav.
 */
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: { default: 'Strategy', template: '%s · Strategy' },
  robots: { index: false, follow: false },
}

export default async function StrategyLayout({ children }: { children: React.ReactNode }) {
  const host = (await headers()).get('host') ?? ''

  if (!isLocalHost(host)) {
    if (process.env.SALES_ENABLED !== 'true') notFound()

    const token = (await cookies()).get(STRATEGY_COOKIE)?.value ?? ''
    const secret = process.env.SALES_SESSION_SECRET ?? ''
    if (!verifySession(token, secret, MAX_AGE_S * 1000)) {
      return <StrategyLogin />
    }
  }

  return <StrategyShell>{children}</StrategyShell>
}
