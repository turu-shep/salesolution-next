import Link from 'next/link'

import type { GuideCard as Guide } from '@/sanity/lib/guides'

/**
 * Editorial guides-hub card. Paper background, hairline border, mono metadata.
 *
 * Distinct from the older `GuideCard` (still used by /guides/[slug]/ category
 * routes and the legacy hub grid). This one drops the image, leans on type
 * hierarchy, and reads like a technical reference entry instead of a blog
 * tile. Click anywhere on the card; the title link owns the accessible name.
 */
export function GuidesLibraryCard({ guide }: { guide: Guide }) {
  const date = guide.publishedAt
    ? new Date(guide.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
      })
    : null

  const seriesLabel =
    guide.series?.name && guide.series.part
      ? `${guide.series.name} · Part ${guide.series.part}${
          guide.series.totalParts ? ` / ${guide.series.totalParts}` : ''
        }`
      : null

  const topic = guide.category ? guide.category.replace(/-/g, ' ') : 'Guide'

  return (
    <article className="group relative flex h-full flex-col border border-rule bg-paper transition-colors duration-200 hover:border-ink-900">
      <div className="flex items-center justify-between border-b border-rule px-5 py-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
          {topic}
        </p>
        {guide.readTimeMinutes ? (
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
            {guide.readTimeMinutes} min
          </p>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-5">
        {seriesLabel && (
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-700">
            {seriesLabel}
          </p>
        )}
        <h3
          className={
            'font-display text-lg font-semibold leading-snug tracking-[-0.01em] text-ink-900' +
            (seriesLabel ? ' mt-2' : '')
          }
        >
          <Link
            href={`/guides/${guide.slug}/`}
            className="transition-colors duration-200 group-hover:text-brand-600 after:absolute after:inset-0 after:content-['']"
          >
            {guide.title}
          </Link>
        </h3>
        {guide.description && (
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-700">
            {guide.description}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-rule pt-4 text-[11px] md:mt-6">
          <p className="font-mono uppercase tracking-[0.16em] text-ink-500">
            {date ? <time dateTime={guide.publishedAt}>{date}</time> : 'Reference'}
          </p>
          <span
            aria-hidden
            className="font-mono uppercase tracking-[0.16em] text-ink-500 transition-colors duration-200 group-hover:text-brand-600"
          >
            Read →
          </span>
        </div>
      </div>
    </article>
  )
}
