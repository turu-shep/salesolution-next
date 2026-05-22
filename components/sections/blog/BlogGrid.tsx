'use client'

import { useMemo, useState } from 'react'

import { BlogCard } from './BlogCard'
import { cn } from '@/lib/cn'
import type { PostCard } from '@/sanity/lib/posts'

const ALL = '__all'

/**
 * Card grid + tag filter (client component for the interactive filter).
 * Pagination is intentionally absent — we have 19 posts; revisit once we
 * cross ~50.
 */
export function BlogGrid({ posts }: { posts: PostCard[] }) {
  const [selected, setSelected] = useState<string>(ALL)

  const categories = useMemo(() => {
    const seen = new Set<string>()
    for (const p of posts) {
      if (p.category) seen.add(p.category)
    }
    return [...seen].sort()
  }, [posts])

  const filtered = useMemo(
    () => (selected === ALL ? posts : posts.filter((p) => p.category === selected)),
    [posts, selected],
  )

  if (posts.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-lg bg-surface-tint-blue p-10 text-center ring-1 ring-ink-300/10">
        <p className="font-display text-xl font-semibold text-ink-900">No posts yet</p>
        <p className="mt-3 text-sm text-ink-500">
          Once we publish the first post in Sanity, it lands here within a minute.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setSelected(ALL)}
          className={cn(
            'rounded-pill px-4 py-1.5 text-sm font-medium transition',
            selected === ALL
              ? 'bg-brand-600 text-white'
              : 'bg-surface-alt text-ink-700 hover:bg-brand-100',
          )}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setSelected(c)}
            className={cn(
              'rounded-pill px-4 py-1.5 text-sm font-medium capitalize transition',
              selected === c
                ? 'bg-brand-600 text-white'
                : 'bg-surface-alt text-ink-700 hover:bg-brand-100',
            )}
          >
            {c.replace(/-/g, ' ')}
          </button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <BlogCard key={p._id} post={p} />
        ))}
      </div>
    </>
  )
}
