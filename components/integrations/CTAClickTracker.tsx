'use client'
/**
 * Single delegated `click` listener on `document.body` (capture phase) that
 * fires `cta_click` for any element (or descendant) carrying a `data-cta`
 * attribute. Closes the Funnel D step-4 gap from the QA pass: every primary
 * CTA on the site emits a typed conversion-intent event without each callsite
 * needing its own click handler.
 *
 * Capture phase + `closest('[data-cta]')`: lets us catch clicks on nested
 * children (e.g. <a data-cta="..."><span><svg/></span></a>) — without it,
 * the inner icon would be the `event.target` and miss the attribute. Capture
 * also beats stopPropagation-happy handlers further down the tree.
 *
 * Cleanup must pass the same `{ capture: true }` option as `addEventListener`
 * — the DOM treats the capture flag as part of the listener's identity, so
 * a removeEventListener without it would be a silent no-op and leak the
 * handler on hot-reload / route changes.
 *
 * No throttling: `track()` already consent-gates and de-no-ops when gtag is
 * unavailable, and a primary CTA being clicked twice in the same second is
 * meaningful (rage click / double-tap intent) rather than noise.
 *
 * See [docs/strategy/ga4.md §3.6](../../docs/strategy/ga4.md) and §4 Funnel D.
 */
import { useEffect } from 'react'
import { track } from '@/lib/analytics'

export function CTAClickTracker() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const start = e.target as HTMLElement | null
      const el = start?.closest('[data-cta]') as HTMLElement | null
      if (!el) return
      const ctaId = el.getAttribute('data-cta')
      if (!ctaId) return
      const ctaLocation = el.getAttribute('data-cta-location') || 'unknown'
      const destination = el instanceof HTMLAnchorElement ? el.href : ''
      track({
        name: 'cta_click',
        params: {
          cta_id: ctaId,
          cta_location: ctaLocation,
          destination,
        },
      })
    }
    document.body.addEventListener('click', onClick, { capture: true })
    return () =>
      document.body.removeEventListener('click', onClick, { capture: true })
  }, [])
  return null
}
