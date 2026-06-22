'use client'

import { usePathname } from 'next/navigation'

/**
 * Picks the slim Revenue Engine footer on /revenue-engine/* and the sitewide
 * footer everywhere else. Both footers render server-side and are passed in as
 * props; this client island only chooses which already-rendered tree to show,
 * so neither footer becomes a client component.
 */
export function FooterSwitch({
  full,
  slim,
}: {
  full: React.ReactNode
  slim: React.ReactNode
}) {
  const pathname = usePathname()
  const isRevenueEngine =
    pathname === '/revenue-engine' || pathname.startsWith('/revenue-engine/')
  return <>{isRevenueEngine ? slim : full}</>
}
