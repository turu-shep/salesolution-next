import Image from 'next/image'
import Link from 'next/link'

import type { PostCard } from '@/sanity/lib/posts'

export function BlogCard({ post }: { post: PostCard }) {
  const date =
    post.publishedAt
      ? new Date(post.publishedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : null

  const dims = post.coverImage?.asset?.metadata?.dimensions
  return (
    <article className="group flex flex-col overflow-hidden rounded-lg bg-surface ring-1 ring-ink-300/10 transition hover:shadow-md">
      <Link href={`/${post.slug}/`} className="block">
        {post.coverImage?.asset?.url ? (
          <Image
            src={post.coverImage.asset.url}
            alt={post.coverImage.alt ?? post.title}
            width={dims?.width ?? 1200}
            height={dims?.height ?? 675}
            className="aspect-[16/9] w-full object-cover transition group-hover:opacity-95"
            sizes="(min-width: 1024px) 380px, (min-width: 768px) 50vw, 100vw"
          />
        ) : (
          <div className="aspect-[16/9] w-full bg-surface-tint-blue" />
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        {post.category && (
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
            {post.category.replace(/-/g, ' ')}
          </p>
        )}
        <h3 className="mt-2 font-display text-lg font-semibold leading-snug">
          <Link href={`/${post.slug}/`} className="transition hover:text-brand-600">
            {post.title}
          </Link>
        </h3>
        {post.description && (
          <p className="mt-2 line-clamp-3 text-sm text-ink-500">{post.description}</p>
        )}

        <div className="mt-4 flex items-center gap-3 border-t border-ink-300/10 pt-3 text-xs text-ink-500">
          {date && <time dateTime={post.publishedAt}>{date}</time>}
          {post.readTimeMinutes && (
            <>
              <span aria-hidden>·</span>
              <span>{post.readTimeMinutes} min read</span>
            </>
          )}
        </div>
      </div>
    </article>
  )
}
