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
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const prefersReduced = typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      setDisplay(value)
      return
    }
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
