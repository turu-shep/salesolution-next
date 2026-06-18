import { buildRoleGraph, wrapTitle } from '@/lib/career-path-graph'
import type { CareerPathMapEntry } from '@/sanity/lib/career-paths'

/**
 * Static role-map diagram (doc 11 §T7). Renders the career paths as a top-down
 * dependency graph from the `leadsTo` edges — built at request/build time, pure
 * SVG, no client JS. Every node is a real link. `highlightSlug` marks "you are
 * here" on a path page; omit it on the hub for the neutral landscape.
 *
 * Kind is encoded without colour (accessibility + restrained palette): roles =
 * solid border, specializations = dashed. The current node gets a tinted fill.
 */
export function RoleMap({
  entries,
  highlightSlug,
  className,
}: {
  entries: CareerPathMapEntry[]
  highlightSlug?: string
  className?: string
}) {
  if (!entries || entries.length < 2) return null
  const g = buildRoleGraph(entries)

  return (
    <figure className={className}>
      <svg
        viewBox={`0 0 ${g.width} ${g.height}`}
        role="img"
        aria-label="Map of the AI-search career paths and how each one leads to the next"
        className="h-auto w-full"
      >
        <defs>
          <marker
            id="rolemap-arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-ink-300" />
          </marker>
        </defs>

        {g.edges.map((e, i) => (
          <line
            key={i}
            x1={e.x1}
            y1={e.y1}
            x2={e.x2}
            y2={e.y2}
            className="stroke-ink-300"
            strokeWidth={1.5}
            markerEnd="url(#rolemap-arrow)"
          />
        ))}

        {g.nodes.map((n) => {
          const isHi = n.slug === highlightSlug
          const isSpec = n.kind === 'specialization'
          const lines = wrapTitle(n.title)
          return (
            <a key={n.slug} href={`/career-paths/${n.slug}/`}>
              <title>{n.title}</title>
              <rect
                x={n.x}
                y={n.y}
                width={n.w}
                height={n.h}
                rx={4}
                className={
                  isHi
                    ? 'fill-surface-tint-blue stroke-brand-600'
                    : 'fill-paper stroke-ink-300 transition-colors hover:stroke-ink-900'
                }
                strokeWidth={isHi ? 2 : 1.25}
                strokeDasharray={isSpec ? '5 3' : undefined}
              />
              <text
                x={n.x + n.w / 2}
                y={n.y + n.h / 2}
                textAnchor="middle"
                dominantBaseline="central"
                className={isHi ? 'fill-ink-900' : 'fill-ink-800'}
                style={{ fontSize: 13, fontWeight: 600 }}
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
          )
        })}
      </svg>

      <figcaption className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-500">
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
          Top = where you start; arrows = what each path leads to.
        </span>
      </figcaption>
    </figure>
  )
}
