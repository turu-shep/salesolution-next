import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { FinalCTARail } from '@/components/sections/FinalCTARail'
import { FAQ } from '@/components/sections/leadgen/FAQ'
import { PostAuthor } from '@/components/sections/blog-post/PostAuthor'
import { PostBody } from '@/components/sections/blog-post/PostBody'
import { PostHero } from '@/components/sections/blog-post/PostHero'
import { PostShare } from '@/components/sections/blog-post/PostShare'
import { PostTOC } from '@/components/sections/blog-post/PostTOC'
import { RelatedPosts } from '@/components/sections/blog-post/RelatedPosts'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbListSchema } from '@/lib/schema'
import { business } from '@/lib/business'
import {
  getAllPostSlugs,
  getPostBySlug,
  getRelatedPosts,
} from '@/sanity/lib/posts'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  try {
    const slugs = await getAllPostSlugs()
    return slugs.map((slug) => ({ slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug).catch(() => null)
  if (!post) return { title: 'Not found' }

  const title = post.seo?.metaTitle ?? post.title
  const description = post.seo?.metaDescription ?? post.description
  const canonical = post.seo?.canonicalUrl ?? `${business.url}/${slug}/`

  return {
    title,
    description,
    alternates: { canonical },
    robots: post.seo?.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: 'article',
      url: canonical,
      title,
      description,
      siteName: business.name,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: post.author ? [post.author.name] : undefined,
      images: post.seo?.ogImage?.asset?.url
        ? [post.seo.ogImage.asset.url]
        : post.coverImage?.asset?.url
          ? [post.coverImage.asset.url]
          : undefined,
    },
  }
}

export const revalidate = 3600

export default async function PostPage({ params }: Props) {
  const { slug } = await params

  let post
  try {
    post = await getPostBySlug(slug)
  } catch (err) {
    console.warn('[post page] Sanity fetch failed:', err)
    notFound()
  }

  if (!post) notFound()

  const manualRelated = post.related ?? []
  const related =
    manualRelated.length > 0
      ? manualRelated
      : await getRelatedPosts(slug, post.category).catch(() => [])

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    image: post.coverImage?.asset?.url,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: post.author
      ? { '@type': 'Person', name: post.author.name }
      : undefined,
    publisher: { '@id': `${business.url}/#organization` },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${business.url}/${slug}/`,
    },
  }

  return (
    <>
      <JsonLd data={articleSchema} />
      <JsonLd
        data={breadcrumbListSchema([
          { name: 'Home', url: business.url },
          { name: 'Blog', url: `${business.url}/category/blog/` },
          { name: post.title, url: `${business.url}/${slug}/` },
        ])}
      />

      <PostHero
        title={post.title}
        description={post.description}
        publishedAt={post.publishedAt}
        readTimeMinutes={post.readTimeMinutes}
        category={post.category}
        coverImage={post.coverImage}
        author={post.author}
      />

      {/* Body band — paper tone, two-column on desktop with sticky TOC.
       * The TOC is suppressed automatically when there are fewer than 4 H2s.
       * Generous py- so the article breathes between hero and footer. */}
      <section
        data-section-tone="light"
        className="relative bg-paper py-16 md:py-24"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
            {/* Sticky TOC sidebar — desktop only. Renders nothing for short
             * posts; the column collapses gracefully thanks to the grid
             * template falling back to one column on smaller widths. */}
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <PostTOC body={post.body} />
              </div>
            </aside>

            <article className="min-w-0 max-w-2xl">
              <PostBody body={post.body} />

              {post.faq && post.faq.length > 0 && (
                <div className="mt-16 border-t border-rule pt-12">
                  <FAQ
                    eyebrow="Frequently asked"
                    headline="Quick answers"
                    entries={post.faq}
                  />
                </div>
              )}

              <PostShare slug={slug} title={post.title} />
            </article>
          </div>
        </div>
      </section>

      {post.author && <PostAuthor author={post.author} />}

      <RelatedPosts posts={related} />

      <FinalCTARail />
    </>
  )
}
