import Image from 'next/image'
import Link from 'next/link'

import type { PostCard } from '@/sanity/lib/posts'

import { cn } from '@/lib/cn'

/**
 * Editorial blog card for the index page.
 *
 * Paper background, hairline rule on hover, mono metadata strip, strong
 * display-weight title. The image is part of the article frame — not a
 * decorative crop — so the aspect ratio is constant and the title hangs
 * below it with a single hairline rule between content and metadata.
 */
export function BlogPostCard({
  post,
  variant = 'default',
}: {
  post: PostCard
  /** `feature` makes the card span two columns w/ a larger title. */
  variant?: 'default' | 'feature'
}) {
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null

  const dateIso = post.publishedAt ?? undefined
  const dims = post.coverImage?.asset?.metadata?.dimensions
  const isFeature = variant === 'feature'

  return (
    <article
      className={cn(
        'group relative flex flex-col bg-paper transition-colors duration-200',
        // Hairline frame — sits low-key on paper, lifts on hover via accent.
        'border border-rule hover:border-ink-900',
        isFeature && 'md:col-span-2',
      )}
    >
      <Link
        href={`/${post.slug}/`}
        aria-label={post.title}
        className="block overflow-hidden"
      >
        {post.coverImage?.asset?.url ? (
          <Image
            src={post.coverImage.asset.url}
            alt={post.coverImage.alt ?? post.title}
            width={dims?.width ?? 1200}
            height={dims?.height ?? 675}
            className={cn(
              'w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]',
              isFeature ? 'aspect-[21/9]' : 'aspect-[16/9]',
            )}
            sizes={
              isFeature
                ? '(min-width: 1024px) 760px, (min-width: 768px) 100vw, 100vw'
                : '(min-width: 1024px) 380px, (min-width: 768px) 50vw, 100vw'
            }
          />
        ) : (
          // Subtle gradient fallback — keeps card rhythm even w/o cover image.
          <div
            className={cn(
              'w-full bg-[linear-gradient(135deg,#f5f5f3_0%,#e9eaee_100%)]',
              isFeature ? 'aspect-[21/9]' : 'aspect-[16/9]',
            )}
          />
        )}
      </Link>

      <div className={cn('flex flex-1 flex-col p-6', isFeature && 'md:p-8')}>
        {/* Top metadata row — eyebrow-style, mono. */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
          {post.category && (
            <span className="text-accent-700">
              {post.category.replace(/-/g, ' ')}
            </span>
          )}
          {post.category && (date || post.readTimeMinutes) && (
            <span aria-hidden className="text-ink-300">
              /
            </span>
          )}
          {date && <time dateTime={dateIso}>{date}</time>}
          {date && post.readTimeMinutes && (
            <span aria-hidden className="text-ink-300">
              /
            </span>
          )}
          {post.readTimeMinutes && (
            <span>{post.readTimeMinutes} min read</span>
          )}
        </div>

        <h3
          className={cn(
            'mt-4 font-display font-semibold leading-[1.15] tracking-[-0.015em] text-ink-900',
            isFeature
              ? 'text-2xl md:text-3xl'
              : 'text-xl',
          )}
        >
          <Link
            href={`/${post.slug}/`}
            className="transition-colors duration-200 group-hover:text-brand-600"
          >
            {post.title}
          </Link>
        </h3>

        {post.description && (
          <p
            className={cn(
              'mt-3 line-clamp-3 text-ink-700',
              isFeature ? 'text-base md:text-lg leading-relaxed' : 'text-sm',
            )}
          >
            {post.description}
          </p>
        )}

        <div className="mt-6 flex items-center justify-between border-t border-rule pt-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
            Read post
          </span>
          <span
            aria-hidden
            className="font-display text-base text-ink-700 transition-all duration-200 group-hover:translate-x-1 group-hover:text-brand-600"
          >
            →
          </span>
        </div>
      </div>
    </article>
  )
}
