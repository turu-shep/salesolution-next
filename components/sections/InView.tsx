'use client'

import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/cn'

/**
 * Tiny client wrapper that toggles `data-in-view="true"` on its root element
 * once any part of it enters the viewport. CSS hooks off that attribute to
 * play one-shot animations (chart paths drawing, sections sliding, etc.)
 * without pulling in a full motion library.
 *
 * Respects prefers-reduced-motion — the attribute is set immediately on mount
 * for users who opted out, so animations never play but final state shows.
 */
export function InView({
  as: Tag = 'div',
  children,
  className,
  threshold = 0.2,
}: {
  as?: React.ElementType
  children: React.ReactNode
  className?: string
  threshold?: number
}) {
  const ref = useRef<HTMLElement | null>(null)
  const [seen, setSeen] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const prefersReduced = typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      setSeen(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setSeen(true)
            io.disconnect()
            break
          }
        }
      },
      { threshold },
    )
    io.observe(node)
    return () => io.disconnect()
  }, [threshold])

  return (
    <Tag ref={ref} data-in-view={seen ? 'true' : 'false'} className={cn(className)}>
      {children}
    </Tag>
  )
}
