import type { Metadata } from 'next'

import { BlogIndexGrid } from '@/components/sections/blog/BlogIndexGrid'
import { BlogIndexHero } from '@/components/sections/blog/BlogIndexHero'
import { BlogPillars } from '@/components/sections/blog/BlogPillars'
import { FinalCTARail } from '@/components/sections/FinalCTARail'
import { getAllPosts, type PostCard } from '@/sanity/lib/posts'

export const metadata: Metadata = {
  title: 'Blog · Sale Solution',
  description:
    'Insights, frameworks, and field reports on AI search, GEO, technical SEO, content, and conversion for industrial e-commerce.',
  alternates: { canonical: 'https://salesolution.net/category/blog/' },
}

// Revalidate hourly; on-demand revalidation will come via webhook in Step 13.
export const revalidate = 3600

export default async function BlogHubPage() {
  let posts: PostCard[]
  try {
    posts = await getAllPosts()
  } catch (err) {
    // If Sanity isn't configured yet, render empty state instead of crashing.
    console.warn('[blog hub] Sanity fetch failed:', err)
    posts = []
  }

  const topicCount = new Set(posts.map((p) => p.category).filter(Boolean))
    .size

  return (
    <>
      <BlogIndexHero postCount={posts.length} topicCount={topicCount} />
      <BlogPillars />
      <BlogIndexGrid posts={posts} id="posts" />
      <FinalCTARail />
    </>
  )
}
