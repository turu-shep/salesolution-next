import { SectionRail } from '@/components/layout/SectionRail'
import { BlogPostCard } from '@/components/sections/blog/BlogPostCard'
import type { PostCard } from '@/sanity/lib/posts'

/**
 * Related posts grid — editorial closing band.
 *
 * Reuses the same `BlogPostCard` as the blog index, capped at 3, on the
 * paper tone so the L-D-L-D rhythm holds (preceding PostAuthor is dark,
 * trailing FinalCTARail is dark). The headline mirrors the
 * blog-index "Browse by topic" two-tone treatment.
 */
export function RelatedPosts({ posts }: { posts: PostCard[] }) {
  if (!posts || posts.length === 0) return null

  const visible = posts.slice(0, 3)

  return (
    <SectionRail tone="paper">
      <div className="grid gap-10 md:grid-cols-12 md:gap-12">
        <div className="md:col-span-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            Keep reading
          </p>
          <h2 className="mt-3 font-display text-balance text-3xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-4xl md:text-5xl">
            Related field notes.{' '}
            <span className="text-ink-500">From the same desk.</span>
          </h2>
          <p className="mt-6 max-w-md text-ink-700">
            Three pieces from the archive that pair with what you just read
            &mdash; same operator, same depth.
          </p>
        </div>
        <div className="md:col-span-7" />
      </div>

      <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        {visible.map((p) => (
          <BlogPostCard key={p._id} post={p} />
        ))}
      </div>
    </SectionRail>
  )
}
