import type { Guide } from '@/sanity/lib/guides'

/**
 * Editorial hero for an individual guide entry.
 *
 * Paper tone, mono eyebrow, two-tone H1, mono metadata strip. Mirrors the
 * lockup used by /guides/ hub + services routes so a reader moving between
 * the hub and a detail page never feels a style break.
 *
 * - Eyebrow = series label ("Series · Part 1 of 8") when present, else the
 *   plain "Reference" label. Accent orange is reserved for the active-part
 *   badge so the eyebrow stays the calm brand-blue mono.
 * - Title = the guide title, no two-tone split (titles vary too much to
 *   automate; editorial discretion lives in the body copy).
 * - Lede = guide.description.
 * - Metadata = Topic / Read time / Updated, mono, three columns on desktop.
 */
export function GuideHero({ guide }: { guide: Guide }) {
  const seriesLabel =
    guide.series?.name && guide.series.part
      ? `${guide.series.name} · Part ${guide.series.part}${
          guide.series.totalParts ? ` of ${guide.series.totalParts}` : ''
        }`
      : null

  const topic = guide.category ? guide.category.replace(/-/g, ' ') : 'Reference'

  const updatedRaw = guide.updatedAt ?? guide.publishedAt
  const updated = updatedRaw
    ? new Date(updatedRaw).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <section data-section-tone="light" className="relative bg-paper">
      <div className="mx-auto max-w-6xl px-4 pb-12 pt-16 sm:px-6 md:pb-16 md:pt-24 lg:px-8">
        {/* Breadcrumb / namespace */}
        <nav
          aria-label="Breadcrumb"
          className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500"
        >
          <a
            href="/guides/"
            className="transition-colors duration-200 hover:text-brand-600"
          >
            Guides
          </a>
          <span aria-hidden className="mx-2 text-ink-300">
            /
          </span>
          <span className="text-ink-700">{topic}</span>
        </nav>

        {/* Series eyebrow — accent orange when this guide is part of a series */}
        {seriesLabel && (
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-accent-600">
            {seriesLabel}
          </p>
        )}

        <h1
          className={
            'font-display font-semibold leading-[1.05] tracking-[-0.02em] text-ink-900 text-balance ' +
            'text-4xl sm:text-5xl md:text-[3.75rem] ' +
            (seriesLabel ? 'mt-4' : 'mt-6')
          }
        >
          {guide.title}
        </h1>

        {guide.description && (
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-700 md:text-xl">
            {guide.description}
          </p>
        )}

        {/* Metadata strip — three columns on desktop, hairline-divided. */}
        <dl className="mt-14 grid grid-cols-1 gap-px border-y border-rule sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-rule">
          <MetaCell label="Topic">
            <span className="uppercase tracking-[0.04em] text-ink-900">
              {topic}
            </span>
          </MetaCell>
          <MetaCell label="Read time">
            {guide.readTimeMinutes ? (
              <span className="tabular-nums text-ink-900">
                {guide.readTimeMinutes} min
              </span>
            ) : (
              <span className="text-ink-500">—</span>
            )}
          </MetaCell>
          <MetaCell label="Last updated">
            {updated ? (
              <time dateTime={updatedRaw} className="text-ink-900">
                {updated}
              </time>
            ) : (
              <span className="text-ink-500">—</span>
            )}
          </MetaCell>
        </dl>
      </div>
    </section>
  )
}

function MetaCell({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-5 sm:flex-col sm:items-start sm:justify-start sm:gap-3 sm:px-6 sm:py-6 sm:first:pl-0">
      <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
        {label}
      </dt>
      <dd className="font-mono text-sm normal-case tracking-[0.02em]">
        {children}
      </dd>
    </div>
  )
}
