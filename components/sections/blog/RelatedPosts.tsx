import { Section } from '@/components/layout/Section'
import { Eyebrow } from '@/components/sections/Eyebrow'
import { BlogCard } from './BlogCard'
import type { PostCard } from '@/sanity/lib/posts'

export function RelatedPosts({ posts }: { posts: PostCard[] }) {
  if (posts.length === 0) return null

  return (
    <Section tone="alt">
      <div className="text-center">
        <Eyebrow>Keep reading</Eyebrow>
        <h2 className="mt-3 font-display text-3xl font-semibold">Related posts</h2>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {posts.map((p) => (
          <BlogCard key={p._id} post={p} />
        ))}
      </div>
    </Section>
  )
}
