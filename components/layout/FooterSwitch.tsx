'use client'

import { usePathname } from 'next/navigation'

/**
 * Picks the slim Revenue Engine footer on the local-service NICHE pages
 * (/revenue-engine/<niche>/) and the sitewide footer everywhere else.
 *
 * The bare /revenue-engine/ product page is excluded: it's the cross-vertical
 * explainer (both motions), not a single-motion local-service funnel, and the
 * slim footer's one audit link is wrong context there. It gets the sitewide
 * footer. Both footers render server-side and are passed in as props; this
 * client island only chooses which already-rendered tree to show, so neither
 * footer becomes a client component.
 */
export function FooterSwitch({
  full,
  slim,
}: {
  full: React.ReactNode
  slim: React.ReactNode
}) {
  const pathname = usePathname()
  // A niche page is /revenue-engine/<something>/... — i.e. there is a path
  // segment after /revenue-engine. The bare product page (with or without a
  // trailing slash) is NOT a niche and keeps the sitewide footer.
  const isRevenueEngineNiche = /^\/revenue-engine\/.+/.test(pathname)
  return <>{isRevenueEngineNiche ? slim : full}</>
}
