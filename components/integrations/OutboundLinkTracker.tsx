'use client'
/**
 * Single delegated `click` listener on `document.body` (capture phase) that
 * fires `outbound_click` for any anchor whose host is not `salesolution.net`.
 *
 * Capture phase + `closest('a')`: lets us catch clicks on nested children
 * (e.g. <a><span>...</span></a>) without each anchor needing its own handler,
 * and beats stopPropagation-happy click handlers further down the tree.
 *
 * Cleanup must pass the same `{ capture: true }` option as `addEventListener`
 * — the DOM treats the capture flag as part of the listener's identity, so
 * a removeEventListener without it would be a silent no-op and leak the
 * handler on hot-reload / route changes.
 *
 * See [docs/strategy/ga4.md §5.6](../../docs/strategy/ga4.md).
 */
import { useEffect } from 'react'
import { track } from '@/lib/analytics'

const SELF = 'salesolution.net'

function categorize(host: string): string {
  if (host.includes('calendly.com')) return 'calendly'
  if (host.includes('linkedin.com')) return 'linkedin'
  if (host.includes('github.com')) return 'github'
  return 'other'
}

export function OutboundLinkTracker() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = (e.target as HTMLElement | null)?.closest('a')
      if (!(target instanceof HTMLAnchorElement) || !target.href) return
      let host: string
      try {
        host = new URL(target.href).host
      } catch {
        return
      }
      if (host.endsWith(SELF)) return
      track({
        name: 'outbound_click',
        params: {
          link_url: target.href,
          link_domain: host,
          link_text: (target.textContent || '').trim().slice(0, 80),
          outbound_category: categorize(host),
        },
      })
    }
    document.body.addEventListener('click', onClick, { capture: true })
    return () =>
      document.body.removeEventListener('click', onClick, { capture: true })
  }, [])
  return null
}
