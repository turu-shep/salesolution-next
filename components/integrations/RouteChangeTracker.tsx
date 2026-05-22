'use client'
/**
 * Manual page_view tracker for Next.js App Router client navigation.
 *
 * Why this exists: App Router's `<Link>` navigations do NOT trigger a full
 * document load, so gtag's `config` call (which sets `send_page_view: true`)
 * only captures the FIRST page in a session. Every subsequent client-side
 * route change is invisible to GA4 unless we wire it ourselves.
 *
 * Skip-first-render pattern: `prevPath.current === null` on the very first
 * effect run identifies the initial document load — that page_view was
 * already counted by gtag('config', ..., { send_page_view: true }) inside
 * <Analytics />. Firing here would double-count it. We seed the ref with
 * the current URL and bail. Every subsequent run compares against the
 * previous URL and fires exactly once per real navigation.
 *
 * Suspense wrapper: `useSearchParams()` opts the entire subtree into
 * client-side bailout, which Next.js requires to be wrapped in <Suspense>
 * when used in the root layout. Without the boundary, `next build` errors
 * out with "useSearchParams() should be wrapped in a suspense boundary".
 *
 * See [docs/strategy/ga4.md §5.2](../../docs/strategy/ga4.md).
 */
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef } from 'react'
import { track } from '@/lib/analytics'

function RouteChangeTrackerInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const prevPath = useRef<string | null>(null)

  useEffect(() => {
    const url = pathname + (searchParams.toString() ? `?${searchParams}` : '')
    // Skip first render — the initial document load was already counted by
    // gtag('config', { send_page_view: true }).
    if (prevPath.current === null) {
      prevPath.current = url
      return
    }
    if (prevPath.current === url) return
    prevPath.current = url

    track({
      name: 'page_view',
      params: {
        page_location: window.location.href,
        page_title: document.title,
        page_referrer: document.referrer,
      },
    })
  }, [pathname, searchParams])

  return null
}

export function RouteChangeTracker() {
  return (
    <Suspense fallback={null}>
      <RouteChangeTrackerInner />
    </Suspense>
  )
}
