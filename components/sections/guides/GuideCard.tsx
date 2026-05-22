import Image from 'next/image'
import Link from 'next/link'

import type { GuideCard as Guide } from '@/sanity/lib/guides'

export function GuideCard({ guide }: { guide: Guide }) {
  const date =
    guide.publishedAt
      ? new Date(guide.publishedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : null

  const dims = guide.coverImage?.asset?.metadata?.dimensions
  const seriesLabel =
    guide.series?.name && guide.series.part
      ? `${guide.series.name} · Part ${guide.series.part}`
      : null

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg bg-surface ring-1 ring-ink-300/10 transition hover:shadow-md">
      <Link href={`/guides/${guide.slug}/`} className="block">
        {guide.coverImage?.asset?.url ? (
          <Image
            src={guide.coverImage.asset.url}
            alt={guide.coverImage.alt ?? guide.title}
            width={dims?.width ?? 1200}
            height={dims?.height ?? 675}
            className="aspect-[16/9] w-full object-cover transition group-hover:opacity-95"
            sizes="(min-width: 1024px) 380px, (min-width: 768px) 50vw, 100vw"
          />
        ) : (
          <div className="aspect-[16/9] w-full bg-surface-tint-cool" />
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        {seriesLabel && (
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
            {seriesLabel}
          </p>
        )}
        <h3 className="mt-2 font-display text-lg font-semibold leading-snug">
          <Link href={`/guides/${guide.slug}/`} className="transition hover:text-brand-600">
            {guide.title}
          </Link>
        </h3>
        {guide.description && (
          <p className="mt-2 line-clamp-3 text-sm text-ink-500">{guide.description}</p>
        )}

        <div className="mt-4 flex items-center gap-3 border-t border-ink-300/10 pt-3 text-xs text-ink-500">
          {date && <time dateTime={guide.publishedAt}>{date}</time>}
          {guide.readTimeMinutes && (
            <>
              <span aria-hidden>·</span>
              <span>{guide.readTimeMinutes} min read</span>
            </>
          )}
        </div>
      </div>
    </article>
  )
}
