'use client'

import { useEffect, useRef, useState } from 'react'

import { MetricValue } from './MetricValue'

/**
 * The big proof number, counting up from 0 on scroll-into-view. Only animates
 * a PLAIN number (e.g. "43.5", "8,500", "12") — ranges/operators like
 * "0.31 → 0.02" fall back to the static accent-arrow render, so the treatment
 * stays consistent without inventing motion the value can't support.
 * Reduced-motion shows the final value immediately. Returns inline spans; the
 * parent supplies the display-size <p>.
 */
export function CountMetric({
  prefix,
  value,
  unit,
  prefixClassName = 'text-accent-500',
}: {
  prefix?: string
  value: string
  unit?: string
  /** Color for the prefix glyph — defaults to the orange accent, but a
   *  service-themed teaser can pass its own (e.g. text-service-editorial-500). */
  prefixClassName?: string
}) {
  const stripped = value.replace(/,/g, '')
  const isPlain = /^\d+(\.\d+)?$/.test(stripped)
  const target = isPlain ? parseFloat(stripped) : 0
  const decimals = isPlain ? (stripped.split('.')[1]?.length ?? 0) : 0

  const ref = useRef<HTMLSpanElement>(null)
  // Start at the real value so the server-rendered HTML carries the actual
  // number (e.g. "+43.5%"), not "0" — crawlers and AI engines read the static
  // HTML and never run the count-up. The animation below is a client-only
  // progressive enhancement.
  const [display, setDisplay] = useState(target)

  useEffect(() => {
    if (!isPlain) return
    const node = ref.current
    if (!node) return
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return // already showing the final value
    // Only animate elements that load below the fold. Ones already on screen
    // keep the static value — no jarring final→0→count-up flash.
    const rect = node.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) return
    setDisplay(0)
    let started = false
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !started) {
            started = true
            const start = performance.now()
            const dur = 1100
            const step = (now: number) => {
              const t = Math.min(1, (now - start) / dur)
              const eased = 1 - Math.pow(1 - t, 3)
              setDisplay(target * eased)
              if (t < 1) requestAnimationFrame(step)
              else setDisplay(target)
            }
            requestAnimationFrame(step)
            io.disconnect()
          }
        }
      },
      { threshold: 0.4 },
    )
    io.observe(node)
    return () => io.disconnect()
  }, [isPlain, target])

  return (
    <span ref={ref}>
      {prefix && <span className={prefixClassName}>{prefix}</span>}
      {isPlain ? (
        <span className="tabular-nums">
          {display.toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })}
        </span>
      ) : (
        <MetricValue value={value} />
      )}
      {unit && <span className="text-ink-400">{unit}</span>}
    </span>
  )
}
