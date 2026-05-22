import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'
import { cn } from '@/lib/cn'
import type { GuideInSeriesEntry } from '@/sanity/lib/guides'

/**
 * Multi-part series navigation rendered below the guide body when the
 * entry is part of a series. Two layouts in one component:
 *
 *   - `variant="full"` — full numbered list of every part in the series,
 *     current entry highlighted with the orange accent. Rendered inside a
 *     dark `SectionRail` to alternate against the paper body above and
 *     paper "related" block below.
 *   - `variant="inline"` — compact prev/next pair, rendered at the top of
 *     the body column on series guides so a reader landing mid-series can
 *     immediately jump backward or forward.
 *
 * Returns null in either variant if the series has fewer than 2 entries
 * — a single-entry "series" is a content-modeling artefact, not a series.
 */
export function SeriesNav({
  series,
  currentSlug,
  variant = 'full',
}: {
  series: GuideInSeriesEntry[]
  currentSlug: string
  variant?: 'full' | 'inline'
}) {
  if (series.length <= 1) return null

  const ordered = [...series].sort(
    (a, b) => (a.series?.part ?? 0) - (b.series?.part ?? 0),
  )
  const currentIdx = ordered.findIndex((s) => s.slug === currentSlug)
  const prev = currentIdx > 0 ? ordered[currentIdx - 1] : null
  const next =
    currentIdx >= 0 && currentIdx < ordered.length - 1
      ? ordered[currentIdx + 1]
      : null

  const seriesName = ordered.find((s) => s.series?.name)?.series?.name
  const totalParts =
    ordered.find((s) => s.series?.totalParts)?.series?.totalParts ??
    ordered.length

  if (variant === 'inline') {
    if (!prev && !next) return null
    return (
      <nav
        aria-label="Series navigation"
        className="mt-12 grid gap-px border-y border-rule sm:grid-cols-2 sm:gap-0 sm:divide-x sm:divide-rule"
      >
        {prev ? (
          <Link
            href={`/guides/${prev.slug}/`}
            className="group flex flex-col gap-2 py-5 transition-colors duration-200 hover:bg-surface sm:px-6"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
              ← Part {prev.series?.part ?? ''} · Previous
            </span>
            <span className="font-display text-base font-semibold leading-snug text-ink-900 transition-colors duration-200 group-hover:text-brand-600">
              {prev.title}
            </span>
          </Link>
        ) : (
          <div className="hidden sm:block" />
        )}
        {next ? (
          <Link
            href={`/guides/${next.slug}/`}
            className="group flex flex-col gap-2 py-5 transition-colors duration-200 hover:bg-surface sm:items-end sm:px-6 sm:text-right"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
              Part {next.series?.part ?? ''} · Next →
            </span>
            <span className="font-display text-base font-semibold leading-snug text-ink-900 transition-colors duration-200 group-hover:text-brand-600">
              {next.title}
            </span>
          </Link>
        ) : (
          <div className="hidden sm:block" />
        )}
      </nav>
    )
  }

  // ── Full variant ────────────────────────────────────────────────────────
  return (
    <SectionRail tone="dark" size="md">
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-500">
          {seriesName ?? 'Series'}
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
          The full series.{' '}
          <span className="text-ink-400">
            {ordered.length} of {totalParts} published.
          </span>
        </h2>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-300">
          A multi-part reference — each entry stands alone, but the order
          rewards a straight read for first-time visitors.
        </p>
      </div>

      <ol className="mt-12 divide-y divide-white/10 border-y border-white/10">
        {ordered.map((entry) => {
          const isCurrent = entry.slug === currentSlug
          const partNum = entry.series?.part
          return (
            <li key={entry._id}>
              <Link
                href={`/guides/${entry.slug}/`}
                aria-current={isCurrent ? 'page' : undefined}
                className={cn(
                  'group grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-4 py-5 transition-colors duration-200 sm:gap-6 sm:py-6',
                  isCurrent
                    ? 'bg-white/[0.04]'
                    : 'hover:bg-white/[0.03]',
                )}
              >
                <span
                  className={cn(
                    'font-mono text-sm tabular-nums tracking-[0.04em]',
                    isCurrent ? 'text-accent-500' : 'text-ink-400',
                  )}
                >
                  {partNum != null ? String(partNum).padStart(2, '0') : '··'}
                </span>
                <span
                  className={cn(
                    'font-display text-lg font-semibold leading-snug tracking-[-0.01em] transition-colors duration-200',
                    isCurrent
                      ? 'text-white'
                      : 'text-ink-200 group-hover:text-white',
                  )}
                >
                  {entry.title}
                </span>
                {isCurrent ? (
                  <span className="inline-flex items-center rounded-[4px] bg-accent-500 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
                    You are here
                  </span>
                ) : (
                  <span
                    aria-hidden
                    className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-400 transition-colors duration-200 group-hover:text-white"
                  >
                    Read →
                  </span>
                )}
              </Link>
            </li>
          )
        })}
      </ol>
    </SectionRail>
  )
}
