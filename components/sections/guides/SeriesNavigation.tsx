import Link from 'next/link'

import { cn } from '@/lib/cn'
import type { GuideInSeriesEntry } from '@/sanity/lib/guides'

/**
 * Multi-part series navigation rendered at the bottom of each guide that
 * belongs to a series. Highlights the current entry; links to the others.
 */
export function SeriesNavigation({
  series,
  currentSlug,
}: {
  series: GuideInSeriesEntry[]
  currentSlug: string
}) {
  if (series.length <= 1) return null

  const seriesName = series.find((s) => s.series?.name)?.series?.name
  const totalParts = series.find((s) => s.series?.totalParts)?.series?.totalParts ?? series.length

  return (
    <aside className="mt-16 rounded-lg bg-surface-tint-cool p-6 ring-1 ring-ink-300/10">
      <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
        {seriesName ? `${seriesName} · ${series.length} of ${totalParts}` : `${series.length} parts in this series`}
      </p>
      <h2 className="mt-2 font-display text-xl font-semibold text-ink-900">
        Read the full series
      </h2>

      <ol className="mt-5 space-y-2">
        {series.map((s) => {
          const isCurrent = s.slug === currentSlug
          return (
            <li key={s._id}>
              <Link
                href={`/guides/${s.slug}/`}
                aria-current={isCurrent ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition',
                  isCurrent
                    ? 'bg-surface ring-1 ring-brand-600 text-ink-900'
                    : 'text-ink-700 hover:bg-surface',
                )}
              >
                <span className="font-display text-sm font-bold text-brand-600">
                  {String(s.series?.part ?? '').padStart(2, '0')}
                </span>
                <span className="flex-1">{s.title}</span>
                {isCurrent && (
                  <span className="rounded-pill bg-brand-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                    You&rsquo;re here
                  </span>
                )}
              </Link>
            </li>
          )
        })}
      </ol>
    </aside>
  )
}
