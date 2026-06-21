import type { Metadata } from 'next'
import { cookies, headers } from 'next/headers'
import { notFound } from 'next/navigation'

import { SalesLogin } from '@/components/sales/SalesLogin'
import { SalesShell } from '@/components/sales/SalesShell'
import { MAX_AGE_S, SALES_COOKIE, isLocalHost, verifySession } from '@/lib/sales/auth'

/**
 * The gate for everything under /sales (the private sales workspace).
 *
 * Access model (see docs/strategy/sales/00-build-and-cockpit-design.md §2):
 *   - Localhost → open. Dial from your desk without a password.
 *   - Production → 404 unless SALES_ENABLED=true; when enabled, requires a valid
 *     signed session cookie, else the password form renders in place (no separate
 *     login route, so no redirect loop).
 *
 * Reading cookies/headers opts this subtree into dynamic rendering, which is what
 * we want — the gate must run on every request. noindex + robots Disallow (app/robots.ts)
 * keep it out of search. Sits outside the (site) group, so it gets the clean root
 * shell with no public nav.
 */
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: { default: 'Sales HQ', template: '%s · Sales HQ' },
  robots: { index: false, follow: false },
}

export default async function SalesLayout({ children }: { children: React.ReactNode }) {
  const host = (await headers()).get('host') ?? ''

  if (!isLocalHost(host)) {
    if (process.env.SALES_ENABLED !== 'true') notFound()

    const token = (await cookies()).get(SALES_COOKIE)?.value ?? ''
    const secret = process.env.SALES_SESSION_SECRET ?? ''
    if (!verifySession(token, secret, MAX_AGE_S * 1000)) {
      return <SalesLogin />
    }
  }

  return <SalesShell>{children}</SalesShell>
}
