import Image from 'next/image'
import Link from 'next/link'

type Author = {
  name: string
  role?: string
  image?: { asset?: { url: string } }
}

/**
 * Editorial post hero — paper band, full-bleed.
 *
 * Layout: a single column inside max-w-3xl-ish prose width. Top mono strip
 * holds the category and breadcrumb anchor back to the index. The H1 is
 * the visual centre; the lede is one short, declarative sentence sized at
 * the editorial scale (text-xl / 2xl). Byline strip is mono metadata,
 * separated from the H1 by a hairline rule so it reads as a credits block.
 *
 * The cover image lives in a wider band (max-w-5xl) BELOW the title — an
 * editorial-magazine convention, not a header banner. That keeps the H1
 * the dominant focal element even when the image is striking.
 */
export function PostHero({
  title,
  description,
  publishedAt,
  readTimeMinutes,
  category,
  coverImage,
  author,
}: {
  title: string
  description?: string
  publishedAt?: string
  readTimeMinutes?: number
  category?: string
  coverImage?: {
    asset?: {
      url: string
      metadata?: { dimensions?: { width: number; height: number } }
    }
    alt?: string
  }
  author?: Author
}) {
  const date = publishedAt
    ? new Date(publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  const dims = coverImage?.asset?.metadata?.dimensions

  return (
    <section
      data-section-tone="light"
      className="relative bg-paper pt-12 md:pt-20"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb + category strip — mono, label-style. */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          <Link
            href="/category/blog/"
            className="transition-colors duration-200 hover:text-ink-900"
          >
            Blog
          </Link>
          {category && (
            <>
              <span aria-hidden className="text-ink-300">
                /
              </span>
              <span className="text-accent-700">
                {category.replace(/-/g, ' ')}
              </span>
            </>
          )}
        </div>

        {/* Two-tone editorial H1. The trailing clause drops to muted ink — a
         * visual exhale that defuses long titles. We split on the first colon
         * or em-dash so editorial titles render naturally; titles without a
         * separator just render in one tone, which still reads fine. */}
        <h1 className="mt-7 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.025em] text-ink-900 sm:text-5xl md:text-[3.5rem] lg:text-[4rem]">
          <SplitTitle title={title} />
        </h1>

        {description && (
          <p className="mt-8 text-lg leading-relaxed text-ink-700 md:text-xl">
            {description}
          </p>
        )}

        {/* Byline / metadata — mono credits block, separated from headline
         * by a hairline rule so it reads as production data, not body copy. */}
        <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-rule pt-5">
          {author && (
            <div className="flex items-center gap-3">
              {author.image?.asset?.url ? (
                <Image
                  src={author.image.asset.url}
                  alt=""
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full object-cover ring-1 ring-rule"
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-surface-tint-blue ring-1 ring-rule" />
              )}
              <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-500">
                <span className="text-ink-900">By {author.name}</span>
                {author.role && (
                  <span className="ml-2 text-ink-500">/ {author.role}</span>
                )}
              </div>
            </div>
          )}
          {(date || readTimeMinutes) && (
            <span
              aria-hidden
              className="hidden h-3 w-px bg-rule-strong sm:inline-block"
            />
          )}
          {date && (
            <time
              dateTime={publishedAt}
              className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-500"
            >
              {date}
            </time>
          )}
          {date && readTimeMinutes && (
            <span aria-hidden className="text-ink-300">
              /
            </span>
          )}
          {readTimeMinutes && (
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-500">
              {readTimeMinutes} min read
            </span>
          )}
        </div>
      </div>

      {/* Cover image — wider band, editorial magazine treatment. Sits below
       * the title block as a figure, not a header banner. */}
      {coverImage?.asset?.url && (
        <div className="mx-auto mt-12 max-w-5xl px-4 sm:px-6 md:mt-16 lg:px-8">
          <figure className="overflow-hidden border border-rule">
            <Image
              src={coverImage.asset.url}
              alt={coverImage.alt ?? title}
              width={dims?.width ?? 1600}
              height={dims?.height ?? 900}
              className="aspect-[16/9] w-full object-cover"
              priority
              sizes="(min-width: 1024px) 1024px, 100vw"
            />
          </figure>
        </div>
      )}

      {/* Section break — hairline before the body band so the L→L tone
       * change still has a structural divider. */}
      <div className="mx-auto mt-16 max-w-6xl px-4 sm:px-6 md:mt-24 lg:px-8">
        <div className="h-px w-full bg-rule" />
      </div>
    </section>
  )
}

/**
 * Splits a title at the first " — " / " – " / ": " / ". " so we can render
 * the trailing clause in muted ink — same trick as the homepage H1s. If
 * there's no natural break, the whole thing renders in primary ink.
 */
function SplitTitle({ title }: { title: string }) {
  const separators = [' — ', ' – ', ': ', '. ']
  for (const sep of separators) {
    const idx = title.indexOf(sep)
    if (idx > 8 && idx < title.length - 4) {
      const head = title.slice(0, idx + sep.length)
      const tail = title.slice(idx + sep.length)
      return (
        <>
          <span className="block text-ink-900">{head.trim()}</span>
          <span className="block text-ink-500">{tail}</span>
        </>
      )
    }
  }
  return <span className="text-ink-900">{title}</span>
}
