'use client'

import { useMemo, useState } from 'react'

import { SectionRail } from '@/components/layout/SectionRail'
import { cn } from '@/lib/cn'
import type { PostCard } from '@/sanity/lib/posts'

import { BlogPostCard } from './BlogPostCard'

const ALL = '__all'

/**
 * Blog index — category filter chips + editorial card grid.
 *
 * The chips read as a horizontal index of topics ("All / GEO / Technical SEO /
 * Conversion / …") and apply a client-side filter. Layout: featured top
 * post spans 2 columns on md+, then a 3-column grid below. Pagination is
 * out of scope — under ~50 posts we render everything.
 */
export function BlogIndexGrid({
  posts,
  id,
}: {
  posts: PostCard[]
  id?: string
}) {
  const [selected, setSelected] = useState<string>(ALL)

  const categories = useMemo(() => {
    const seen = new Map<string, number>()
    for (const p of posts) {
      if (p.category) {
        seen.set(p.category, (seen.get(p.category) ?? 0) + 1)
      }
    }
    return [...seen.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [posts])

  const filtered = useMemo(
    () =>
      selected === ALL ? posts : posts.filter((p) => p.category === selected),
    [posts, selected],
  )

  if (posts.length === 0) {
    return (
      <SectionRail tone="paper" id={id}>
        <div className="mx-auto max-w-xl border border-rule bg-paper p-10 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
            Empty index
          </p>
          <p className="mt-4 font-display text-xl font-semibold text-ink-900">
            No posts yet.
          </p>
          <p className="mt-3 text-sm text-ink-500">
            Once the first post is published in Sanity, it lands here
            within a minute.
          </p>
        </div>
      </SectionRail>
    )
  }

  const [feature, ...rest] = filtered

  return (
    <SectionRail tone="paper" id={id}>
      <div className="grid gap-10 md:grid-cols-12 md:gap-12">
        <div className="md:col-span-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            The archive
          </p>
          <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
            Browse by topic. Or read everything.
          </h2>
          <p className="mt-6 text-ink-700">
            Filter by the practice area you&rsquo;re working in &mdash;
            or scroll the full index, newest first.
          </p>
        </div>

        <div className="md:col-span-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
            Topics
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Chip
              active={selected === ALL}
              onClick={() => setSelected(ALL)}
              label="All"
              count={posts.length}
            />
            {categories.map(([c, n]) => (
              <Chip
                key={c}
                active={selected === c}
                onClick={() => setSelected(c)}
                label={c.replace(/-/g, ' ')}
                count={n}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        {feature && selected === ALL && (
          <BlogPostCard key={feature._id} post={feature} variant="feature" />
        )}
        {(selected === ALL ? rest : filtered).map((p) => (
          <BlogPostCard key={p._id} post={p} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-12 text-center text-sm text-ink-500">
          No posts in this topic yet.
        </p>
      )}
    </SectionRail>
  )
}

function Chip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean
  onClick: () => void
  label: string
  count: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex items-baseline gap-2 rounded-[4px] border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors duration-200',
        active
          ? 'border-ink-900 bg-ink-900 text-white'
          : 'border-rule-strong bg-paper text-ink-700 hover:border-ink-900 hover:text-ink-900',
      )}
    >
      <span className="capitalize">{label}</span>
      <span
        className={cn(
          'tabular-nums',
          active ? 'text-white/60' : 'text-ink-400',
        )}
      >
        {count}
      </span>
    </button>
  )
}
