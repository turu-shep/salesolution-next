'use client'
/**
 * Fire `onView` exactly once when the referenced element first crosses the
 * IntersectionObserver threshold (default 50% visible). Used for viewport
 * events that should not re-fire on re-entry within the same page lifetime:
 * `form_view`, `service_view`, `pricing_tier_view`, etc.
 *
 * The `fired` ref is the canonical guard. We also disconnect the observer
 * inside the callback, but the ref is what survives across StrictMode's
 * double-invoked effects and any future re-observation paths — without it,
 * a re-mount under StrictMode (dev) would double-fire.
 *
 * See [docs/strategy/ga4.md §5.3](../docs/strategy/ga4.md).
 */
import { useEffect, useRef } from 'react'

export function useTrackOnView(
  ref: React.RefObject<HTMLElement | null>,
  onView: () => void,
  options: IntersectionObserverInit = { threshold: 0.5 },
): void {
  const fired = useRef(false)
  useEffect(() => {
    if (!ref.current || fired.current) return
    const el = ref.current
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting && !fired.current) {
          fired.current = true
          onView()
          io.disconnect()
        }
      }
    }, options)
    io.observe(el)
    return () => io.disconnect()
  }, [ref, onView, options])
}
