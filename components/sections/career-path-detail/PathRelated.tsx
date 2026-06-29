import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'
import type { CareerPathCard } from '@/sanity/lib/career-paths'

/**
 * /career-paths/[slug]/ — "Other paths" rail at the bottom of a detail
 * page. Light tone (paper) so the page rhythm holds: hero (light) → body
 * (light) → related (light) → FinalCTARail (dark).
 *
 * Receives the full hub list with the current slug filtered out at the
 * page level. Renders nothing when there are no siblings so the page can
 * fall straight through to the final CTA without an awkward empty
 * section. Cap at three so the rail never grows taller than the hub's
 * card grid.
 *
 * Card visual = compact variant of the hub's `PathCard` (mono metadata
 * strip, two-line title, hairline border that snaps to `ink-900` on
 * hover). We deliberately don't import the hub component: that one has
 * the "featured" branch which doesn't fit a sibling-rail context, and the
 * compact card we want here is genuinely a different visual lockup.
 */
export function PathRelated({
  paths,
  id,
  eyebrow = 'Keep reading',
  heading = 'Other paths',
  headingMuted = 'in the library.',
}: {
  paths: CareerPathCard[]
  id?: string
  /** Override the rail framing — used for a curated "Where this leads" rail
   *  (driven by `leadsTo`) vs the default newest-first sibling rail. */
  eyebrow?: string
  heading?: string
  headingMuted?: string
}) {
  if (paths.length === 0) return null

  const items = paths.slice(0, 3)

  return (
    <SectionRail tone="paper" id={id}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
        <div className="max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            {eyebrow}
          </p>
          <h2 className="mt-3 font-display text-balance text-3xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-4xl">
            {heading}{' '}
            {headingMuted}
          </h2>
        </div>
        <Link
          href="/career-paths/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-800 underline decoration-rule-strong underline-offset-[6px] transition-colors duration-200 hover:text-brand-600 hover:decoration-brand-600"
        >
          All paths
          <span aria-hidden>→</span>
        </Link>
      </div>

      <ol className="mt-10 grid gap-6 md:grid-cols-3">
        {items.map((p) => (
          <RelatedPathCard key={p._id} path={p} />
        ))}
      </ol>
    </SectionRail>
  )
}

function RelatedPathCard({ path }: { path: CareerPathCard }) {
  const meta = [path.level, path.duration ?? 'self-paced'].filter(Boolean)

  return (
    <li className="group relative">
      <Link
        href={`/career-paths/${path.slug}/`}
        className="block h-full border border-rule bg-surface p-6 transition-colors duration-200 hover:border-ink-900"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          {meta.join(' · ')}
        </p>

        <h3 className="mt-3 font-display text-xl font-semibold tracking-[-0.01em] text-ink-900">
          {path.title}
        </h3>

        {path.role && (
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-500">
            For &middot; {path.role}
          </p>
        )}

        {path.description && (
          <p className="mt-4 text-sm leading-relaxed text-ink-700 line-clamp-3">
            {path.description}
          </p>
        )}

        <p className="mt-6 inline-flex items-center gap-1.5 border-t border-rule pt-4 text-sm font-semibold text-ink-900 underline decoration-rule-strong underline-offset-[5px] transition-colors duration-200 group-hover:text-brand-600 group-hover:decoration-brand-600">
          Open the path
          <span aria-hidden>→</span>
        </p>
      </Link>
    </li>
  )
}
