import Image from 'next/image'

import { Eyebrow } from '@/components/sections/Eyebrow'

type Author = {
  name: string
  role?: string
  image?: { asset?: { url: string } }
}

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
  coverImage?: { asset?: { url: string; metadata?: { dimensions?: { width: number; height: number } } }; alt?: string }
  author?: Author
}) {
  const date =
    publishedAt
      ? new Date(publishedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : null

  return (
    <section className="border-b border-ink-300/15 bg-surface">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        {category && <Eyebrow>{category.replace(/-/g, ' ')}</Eyebrow>}
        <h1 className="mt-3 text-balance font-display">{title}</h1>
        {description && (
          <p className="mt-5 text-lg text-ink-500">{description}</p>
        )}

        <div className="mt-7 flex flex-wrap items-center gap-4 text-sm text-ink-500">
          {author && (
            <div className="flex items-center gap-3">
              {author.image?.asset?.url ? (
                <Image
                  src={author.image.asset.url}
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full object-cover ring-1 ring-ink-300/20"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-brand-100" />
              )}
              <div>
                <span className="font-medium text-ink-800">{author.name}</span>
                {author.role && (
                  <span className="ml-1 text-ink-500">· {author.role}</span>
                )}
              </div>
            </div>
          )}

          {date && (
            <>
              <span aria-hidden className="text-ink-300">·</span>
              <time dateTime={publishedAt}>{date}</time>
            </>
          )}
          {readTimeMinutes && (
            <>
              <span aria-hidden className="text-ink-300">·</span>
              <span>{readTimeMinutes} min read</span>
            </>
          )}
        </div>

        {coverImage?.asset?.url && (
          <Image
            src={coverImage.asset.url}
            alt={coverImage.alt ?? title}
            width={coverImage.asset.metadata?.dimensions?.width ?? 1600}
            height={coverImage.asset.metadata?.dimensions?.height ?? 900}
            className="mt-10 w-full rounded-lg ring-1 ring-ink-300/15"
            priority
            sizes="(min-width: 768px) 720px, 100vw"
          />
        )}
      </div>
    </section>
  )
}
