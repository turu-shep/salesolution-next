import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'
import type { GuideCard as Guide } from '@/sanity/lib/guides'

/**
 * Editorial "featured guide" lockup. Dark band to alternate L-D-L-D against
 * the paper hero above and the paper library below.
 *
 * Two columns on desktop: metadata + headline on the left, lede + CTA on the
 * right. No image — keeps the reference-doc voice, lets the title do the
 * work. Reserved for the most recent flagship entry (typically the next-up
 * installment of a series or a top long-form piece).
 */
export function FeaturedGuide({
  guide,
  eyebrow = 'Featured',
}: {
  guide: Guide
  eyebrow?: string
}) {
  const date = guide.publishedAt
    ? new Date(guide.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  const seriesLabel =
    guide.series?.name && guide.series.part
      ? `${guide.series.name} · Part ${guide.series.part}${
          guide.series.totalParts ? ` / ${guide.series.totalParts}` : ''
        }`
      : null

  const topic = guide.category ? guide.category.replace(/-/g, ' ') : null

  return (
    <SectionRail tone="dark">
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-500">
          {eyebrow}
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
          The next-up read.{' '}
          Start here if you only read one.
        </h2>
      </div>

      <div className="mt-14 grid gap-10 border-t border-white/10 pt-12 md:grid-cols-12 md:gap-12">
        <div className="md:col-span-5">
          <dl className="space-y-5 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
            {seriesLabel && (
              <div className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-4">
                <dt className="text-ink-400">Series</dt>
                <dd className="text-right text-ink-200 normal-case tracking-[0.04em]">
                  {seriesLabel}
                </dd>
              </div>
            )}
            {topic && (
              <div className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-4">
                <dt className="text-ink-400">Topic</dt>
                <dd className="capitalize text-ink-200">{topic}</dd>
              </div>
            )}
            {guide.readTimeMinutes ? (
              <div className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-4">
                <dt className="text-ink-400">Read time</dt>
                <dd className="tabular-nums text-ink-200">
                  {guide.readTimeMinutes} min
                </dd>
              </div>
            ) : null}
            {date && (
              <div className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-4">
                <dt className="text-ink-400">Updated</dt>
                <dd className="normal-case tracking-[0.04em] text-ink-200">
                  <time dateTime={guide.publishedAt}>{date}</time>
                </dd>
              </div>
            )}
          </dl>
        </div>

        <div className="md:col-span-7">
          <h3 className="font-display text-3xl font-semibold leading-[1.1] tracking-[-0.015em] text-white sm:text-4xl">
            <Link
              href={`/guides/${guide.slug}/`}
              className="transition-colors duration-200 hover:text-accent-500"
            >
              {guide.title}
            </Link>
          </h3>
          {guide.description && (
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-300">
              {guide.description}
            </p>
          )}

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href={`/guides/${guide.slug}/`}
              className="inline-flex items-center justify-center rounded-[4px] bg-white px-6 py-3 text-sm font-semibold text-ink-900 transition-colors duration-200 hover:bg-paper"
            >
              Read the guide
            </Link>
            <a
              href="#library"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/85 underline decoration-white/20 underline-offset-[6px] transition-colors duration-200 hover:text-white hover:decoration-white"
            >
              Or browse the library
              <span aria-hidden>↓</span>
            </a>
          </div>
        </div>
      </div>
    </SectionRail>
  )
}
