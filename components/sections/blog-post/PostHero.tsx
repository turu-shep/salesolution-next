import Image from 'next/image'
import Link from 'next/link'

type Author = {
  name: string
  role?: string
  image?: { asset?: { url: string } }
}

/**
 * Editorial post hero — side-by-side on desktop, stacked on mobile.
 *
 * Layout: a 12-col grid inside max-w-6xl. Text block (breadcrumb, H1, lede,
 * byline) spans cols 1–7; the cover image lives in cols 8–12 at its natural
 * aspect ratio — no forced crop, so an illustration or photo isn't sliced
 * to fit a banner band. On mobile/tablet the columns collapse and the
 * image sits below the byline at full width.
 *
 * Why side-by-side: a magazine-style two-column hero lets the H1 dominate
 * without forcing a tall full-width image below it. Total vertical footprint
 * stays under ~1 viewport on a 1440×900 monitor, even with covers that have
 * an unusual aspect (the original migration's covers vary from 16:9 to
 * 16:10 to square).
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
      className="relative bg-paper pt-6 md:pt-10"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-12">
          {/* Text column — breadcrumb, H1, lede, byline. */}
          <div className="lg:col-span-7">
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

            {/* Two-tone editorial H1. The trailing clause drops to muted ink. */}
            <h1 className="mt-5 font-display text-balance text-3xl font-semibold leading-[1.1] tracking-[-0.025em] text-ink-900 sm:text-4xl md:text-5xl">
              <SplitTitle title={title} />
            </h1>

            {description && (
              <p className="mt-5 text-lg leading-relaxed text-ink-700 md:text-xl">
                {description}
              </p>
            )}

            {/* Byline / metadata — mono credits block, separated from headline
             * by a hairline rule so it reads as production data, not body copy. */}
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-rule pt-4">
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

          {/* Image column — natural aspect, no crop. Sits below the byline on
           * mobile, beside the title from lg up. */}
          {coverImage?.asset?.url && (
            <div className="mt-8 lg:col-span-5 lg:mt-0">
              <figure className="overflow-hidden border border-rule">
                <Image
                  src={coverImage.asset.url}
                  alt={coverImage.alt ?? title}
                  width={dims?.width ?? 1600}
                  height={dims?.height ?? 900}
                  className="h-auto w-full"
                  priority
                  sizes="(min-width: 1024px) 460px, 100vw"
                />
              </figure>
            </div>
          )}
        </div>
      </div>

      {/* Section break — hairline before the body band so the L→L tone
       * change still has a structural divider. */}
      <div className="mx-auto mt-10 max-w-6xl px-4 sm:px-6 md:mt-14 lg:px-8">
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
          <span className="block">{tail}</span>
        </>
      )
    }
  }
  return <span className="text-ink-900">{title}</span>
}
