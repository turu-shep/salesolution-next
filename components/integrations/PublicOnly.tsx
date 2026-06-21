'use client'

import { usePathname } from 'next/navigation'

/**
 * Renders its children only on customer-facing routes. The private /sales workspace
 * is internal, so the marketing site's tracking pixels, GA event dispatchers, chat
 * widget, and cookie-consent banner are route-gated out of it (the route-gating the
 * compliance overlay calls for — docs/strategy/sales/07-compliance.md). usePathname
 * resolves during SSR for the requested route, so there's no hydration mismatch.
 */
export function PublicOnly({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (pathname?.startsWith('/sales')) return null
  return <>{children}</>
}
