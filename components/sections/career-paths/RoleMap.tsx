'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { buildRoleGraph, wrapTitle } from '@/lib/career-path-graph'
import type { CareerPathMapEntry } from '@/sanity/lib/career-paths'

/**
 * Role-map diagram (doc 11 §T7) — a contained, draggable canvas of the career
 * paths and how each leads to the next, built from the `leadsTo` graph.
 *
 * Fixed-height box so it never eats the page; drag to pan, buttons to zoom, and
 * it fits the whole map to view on load. Hover/focus a node to trace just its
 * connections (the rest dims) — that's the part that makes it worth a look.
 * Smooth curved connectors instead of harsh diagonals. Nodes are real links;
 * a drag won't trigger navigation. Kind is shown by solid (role) vs dashed
 * (specialization) border, not colour; the current path is highlighted.
 */
const MIN_K = 0.4
const MAX_K = 2.2

export function RoleMap({
  entries,
  highlightSlug,
  className,
}: {
  entries: CareerPathMapEntry[]
  highlightSlug?: string
  className?: string
}) {
  const g = useMemo(() => buildRoleGraph(entries), [entries])
  const adjacency = useMemo(() => {
    const m = new Map<string, Set<string>>()
    for (const e of g.edges) {
      if (!m.has(e.from)) m.set(e.from, new Set())
      if (!m.has(e.to)) m.set(e.to, new Set())
      m.get(e.from)!.add(e.to)
      m.get(e.to)!.add(e.from)
    }
    return m
  }, [g])

  const wrapRef = useRef<HTMLDivElement>(null)
  const [view, setView] = useState({ x: 0, y: 0, k: 1 })
  const [hover, setHover] = useState<string | null>(null)
  const drag = useRef({ on: false, moved: false, x: 0, y: 0 })

  const fit = useCallback(() => {
    const el = wrapRef.current
    if (!el) return
    const w = el.clientWidth
    const h = el.clientHeight
    const k = Math.max(MIN_K, Math.min((w - 24) / g.width, (h - 24) / g.height, 1.3))
    setView({ k, x: (w - g.width * k) / 2, y: (h - g.height * k) / 2 })
  }, [g])

  useEffect(() => {
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [fit])

  const zoom = (factor: number) => {
    const el = wrapRef.current
    if (!el) return
    const cx = el.clientWidth / 2
    const cy = el.clientHeight / 2
    setView((v) => {
      const k = Math.max(MIN_K, Math.min(MAX_K, v.k * factor))
      return { k, x: cx - ((cx - v.x) * k) / v.k, y: cy - ((cy - v.y) * k) / v.k }
    })
  }

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { on: true, moved: false, x: e.clientX, y: e.clientY }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.on) return
    const dx = e.clientX - drag.current.x
    const dy = e.clientY - drag.current.y
    if (Math.hypot(dx, dy) > 4) drag.current.moved = true
    drag.current.x = e.clientX
    drag.current.y = e.clientY
    setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }))
  }
  const endDrag = (e: React.PointerEvent) => {
    drag.current.on = false
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {}
  }

  const isDim = (slug: string) =>
    hover != null && slug !== hover && !(adjacency.get(hover)?.has(slug) ?? false)
  const edgeActive = (from: string, to: string) =>
    hover == null || from === hover || to === hover

  return (
    <figure className={className}>
      <div
        ref={wrapRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="relative h-[380px] w-full touch-none select-none overflow-hidden rounded-md border border-rule bg-surface [cursor:grab] active:[cursor:grabbing] sm:h-[440px]"
        role="group"
        aria-label="Draggable map of the AI-search career paths. Drag to pan, use the buttons to zoom; each box links to its path."
      >
        <div
          className="absolute left-0 top-0 origin-top-left will-change-transform"
          style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})` }}
        >
          <svg width={g.width} height={g.height} className="overflow-visible">
            <defs>
              <marker
                id="rolemap-arrow"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 9 5 L 0 9" className="fill-none stroke-ink-400" strokeWidth={1.4} />
              </marker>
            </defs>

            {g.edges.map((e, i) => {
              const dy = e.y2 - e.y1
              const d = `M ${e.x1} ${e.y1} C ${e.x1} ${e.y1 + dy * 0.5}, ${e.x2} ${e.y2 - dy * 0.5}, ${e.x2} ${e.y2}`
              const active = edgeActive(e.from, e.to)
              return (
                <path
                  key={i}
                  d={d}
                  fill="none"
                  className={active ? 'stroke-ink-400' : 'stroke-ink-200'}
                  strokeWidth={1.5}
                  markerEnd="url(#rolemap-arrow)"
                  opacity={active ? 1 : 0.5}
                />
              )
            })}

            {g.nodes.map((n) => {
              const hi = n.slug === highlightSlug
              const spec = n.kind === 'specialization'
              const dim = isDim(n.slug)
              const lines = wrapTitle(n.title)
              return (
                <g key={n.slug} opacity={dim ? 0.3 : 1} style={{ transition: 'opacity 150ms' }}>
                  <a
                    href={`/career-paths/${n.slug}/`}
                    onClick={(e) => {
                      if (drag.current.moved) e.preventDefault()
                    }}
                    onMouseEnter={() => setHover(n.slug)}
                    onMouseLeave={() => setHover(null)}
                    onFocus={() => setHover(n.slug)}
                    onBlur={() => setHover(null)}
                    className="[cursor:pointer]"
                  >
                    <title>{n.title}</title>
                    <rect
                    x={n.x}
                    y={n.y}
                    width={n.w}
                    height={n.h}
                    rx={6}
                    className={
                      hi
                        ? 'fill-surface-tint-blue stroke-brand-600'
                        : 'fill-paper stroke-ink-300 [transition:stroke] hover:stroke-ink-900'
                    }
                    strokeWidth={hi ? 2 : 1.25}
                    strokeDasharray={spec ? '5 4' : undefined}
                  />
                  <text
                    x={n.x + n.w / 2}
                    y={n.y + n.h / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className={hi ? 'fill-ink-900' : 'fill-ink-800'}
                    style={{ fontSize: 12.5, fontWeight: 600 }}
                  >
                    {lines.map((line, li) => (
                      <tspan
                        key={li}
                        x={n.x + n.w / 2}
                        dy={li === 0 ? (lines.length > 1 ? '-0.55em' : '0') : '1.15em'}
                      >
                        {line}
                      </tspan>
                    ))}
                  </text>
                  </a>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Zoom controls */}
        <div className="absolute right-3 top-3 flex flex-col overflow-hidden rounded-md border border-rule bg-paper/90 backdrop-blur">
          <ZoomButton label="Zoom in" onClick={() => zoom(1.25)}>
            +
          </ZoomButton>
          <ZoomButton label="Reset view" onClick={fit}>
            <span className="text-[10px]">fit</span>
          </ZoomButton>
          <ZoomButton label="Zoom out" onClick={() => zoom(0.8)}>
            &minus;
          </ZoomButton>
        </div>
      </div>

      <figcaption className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-500">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="inline-block h-3 w-5 rounded-[2px] border border-ink-400" />
          Role
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            aria-hidden
            className="inline-block h-3 w-5 rounded-[2px] border border-dashed border-ink-400"
          />
          Specialization
        </span>
        <span className="normal-case tracking-normal text-ink-500">
          Drag to pan &middot; hover a box to trace its connections.
        </span>
      </figcaption>
    </figure>
  )
}

function ZoomButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center border-b border-rule font-mono text-base text-ink-700 transition-colors last:border-b-0 hover:bg-surface hover:text-ink-900"
    >
      {children}
    </button>
  )
}
