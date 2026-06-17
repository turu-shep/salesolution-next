'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Display number that animates from 0 to `value` once it enters the viewport.
 * Respects prefers-reduced-motion (renders the final value immediately).
 *
 * `value` is the target integer. `prefix`/`suffix` wrap the rendered number
 * (e.g. prefix="+", suffix="%"). For decimals (e.g. "2.5x") pass
 * `decimals={1}`.
 */
export function CountUp({
  value,
  prefix,
  suffix,
  decimals = 0,
  durationMs = 1100,
  className,
}: {
  value: number
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  decimals?: number
  durationMs?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  // Start at the real value so the static/SSR HTML carries the actual number,
  // not "0" — crawlers and AI engines read the HTML without running the
  // count-up. The animation below is a client-only progressive enhancement.
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const prefersReduced = typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches
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
            const step = (now: number) => {
              const t = Math.min(1, (now - start) / durationMs)
              // ease-out cubic
              const eased = 1 - Math.pow(1 - t, 3)
              setDisplay(value * eased)
              if (t < 1) requestAnimationFrame(step)
              else setDisplay(value)
            }
            requestAnimationFrame(step)
            io.disconnect()
          }
        }
      },
      { threshold: 0.25 },
    )
    io.observe(node)
    return () => io.disconnect()
  }, [value, durationMs])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  )
}
