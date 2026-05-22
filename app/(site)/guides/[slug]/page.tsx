import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { SectionRail } from '@/components/layout/SectionRail'
import { Section } from '@/components/layout/Section'
import { Eyebrow } from '@/components/sections/Eyebrow'
import { FinalCTA } from '@/components/sections/FinalCTA'
import { FinalCTARail } from '@/components/sections/FinalCTARail'
import { GuideBody } from '@/components/sections/guide-detail/GuideBody'
import { GuideHero } from '@/components/sections/guide-detail/GuideHero'
import { GuideRelated } from '@/components/sections/guide-detail/GuideRelated'
import { GuideTOC } from '@/components/sections/guide-detail/GuideTOC'
import { SeriesNav } from '@/components/sections/guide-detail/SeriesNav'
import { GuideCard } from '@/components/sections/guides/GuideCard'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbListSchema } from '@/lib/schema'
import { business } from '@/lib/business'
import {
  getAllGuideSlugs,
  getAllGuides,
  getGuideBySlug,
  getGuidesByCategory,
  getGuidesInSeries,
  type GuideCard as GuideCardData,
} from '@/sanity/lib/guides'

/**
 * The guides namespace is shared between category pages (e.g. /guides/seo-guides/)
 * and individual guide pages. This handler dispatches based on slug:
 *   - matches a known category → render category listing
 *   - matches a guide document  → render guide template
 *   - else                       → 404
 */
const CATEGORY_SLUGS: Record<string, { label: string; description: string }> = {
  'seo-guides': {
    label: 'SEO Guides',
    description: 'Technical SEO, on-page, off-page, and the AI-search transition.',
  },
  'website-development-and-design-guides': {
    label: 'Website Development & Design',
    description: 'Launches, redesigns, and the engineering decisions behind both.',
  },
  'email-marketing-guides': {
    label: 'Email Marketing',
    description: 'Outbound, lifecycle, and the deliverability fundamentals.',
  },
}

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  try {
    const slugs = await getAllGuideSlugs()
    return [
      ...Object.keys(CATEGORY_SLUGS).map((slug) => ({ slug })),
      ...slugs.map((slug) => ({ slug })),
    ]
  } catch {
    return Object.keys(CATEGORY_SLUGS).map((slug) => ({ slug }))
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params

  if (slug in CATEGORY_SLUGS) {
    const cat = CATEGORY_SLUGS[slug]
    return {
      title: `${cat.label} · Sale Solution`,
      description: cat.description,
      alternates: { canonical: `${business.url}/guides/${slug}/` },
    }
  }

  const guide = await getGuideBySlug(slug).catch(() => null)
  if (!guide) return { title: 'Not found' }

  return {
    title: guide.seo?.metaTitle ?? guide.title,
    description: guide.seo?.metaDescription ?? guide.description,
    alternates: { canonical: guide.seo?.canonicalUrl ?? `${business.url}/guides/${slug}/` },
    robots: guide.seo?.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: 'article',
      url: `${business.url}/guides/${slug}/`,
      title: guide.title,
      description: guide.description,
      siteName: business.name,
      publishedTime: guide.publishedAt,
      modifiedTime: guide.updatedAt,
      images: guide.seo?.ogImage?.asset?.url
        ? [guide.seo.ogImage.asset.url]
        : guide.coverImage?.asset?.url
          ? [guide.coverImage.asset.url]
          : undefined,
    },
  }
}

export const revalidate = 3600

export default async function GuideOrCategoryPage({ params }: Props) {
  const { slug } = await params

  // ── Category path ──────────────────────────────────────────────────────
  if (slug in CATEGORY_SLUGS) {
    const meta = CATEGORY_SLUGS[slug]
    let guides: GuideCardData[]
    try {
      guides = await getGuidesByCategory(slug)
    } catch (err) {
      console.warn('[guides category] Sanity fetch failed:', err)
      guides = []
    }

    return (
      <>
        <JsonLd
          data={breadcrumbListSchema([
            { name: 'Home', url: business.url },
            { name: 'Guides', url: `${business.url}/guides/` },
            { name: meta.label, url: `${business.url}/guides/${slug}/` },
          ])}
        />

        <Section size="lg">
          <div className="text-center">
            <Eyebrow>Guides · category</Eyebrow>
            <h1 className="mt-3 font-display text-balance">{meta.label}</h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-500">
              {meta.description}
            </p>
            <Link
              href="/guides/"
              className="mt-6 inline-flex items-center justify-center text-sm font-medium text-brand-600 hover:underline"
            >
              ← All guides
            </Link>
          </div>

          {guides.length === 0 ? (
            <div className="mx-auto mt-12 max-w-md rounded-lg bg-surface-tint-cool p-10 text-center ring-1 ring-ink-300/10">
              <p className="text-sm text-ink-500">No guides in this category yet.</p>
            </div>
          ) : (
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {guides.map((g) => (
                <GuideCard key={g._id} guide={g} />
              ))}
            </div>
          )}
        </Section>

        <FinalCTA />
      </>
    )
  }

  // ── Guide path ────────────────────────────────────────────────────────
  let guide
  try {
    guide = await getGuideBySlug(slug)
  } catch (err) {
    console.warn('[guide page] Sanity fetch failed:', err)
    notFound()
  }

  if (!guide) notFound()

  // Series siblings (for inline prev/next + full series footer)
  const seriesEntries = guide.series?.name
    ? await getGuidesInSeries(guide.series.name).catch(() => [])
    : []
  const isInSeries = seriesEntries.length > 1

  // Related guides — derived client-side from `getAllGuides`. Preference:
  //   1. Same category, not in this series, not the current guide.
  //   2. Falls back to "any other guide" if the first set is empty.
  // Capped at 3 entries — matches the lg:grid-cols-3 layout downstream.
  let allGuides: GuideCardData[] = []
  try {
    allGuides = await getAllGuides()
  } catch (err) {
    console.warn('[guide page] related guides fetch failed:', err)
  }

  const seriesSlugs = new Set(seriesEntries.map((e) => e.slug))
  const sameCategory = allGuides.filter(
    (g) =>
      g.slug !== slug &&
      !seriesSlugs.has(g.slug) &&
      guide!.category &&
      g.category === guide!.category,
  )
  const fallback = allGuides.filter(
    (g) => g.slug !== slug && !seriesSlugs.has(g.slug),
  )
  const related = (sameCategory.length ? sameCategory : fallback).slice(0, 3)

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.description,
    image: guide.coverImage?.asset?.url,
    datePublished: guide.publishedAt,
    dateModified: guide.updatedAt ?? guide.publishedAt,
    publisher: { '@id': `${business.url}/#organization` },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${business.url}/guides/${slug}/` },
    articleSection: 'Guide',
  }

  return (
    <>
      <JsonLd data={articleSchema} />
      <JsonLd
        data={breadcrumbListSchema([
          { name: 'Home', url: business.url },
          { name: 'Guides', url: `${business.url}/guides/` },
          { name: guide.title, url: `${business.url}/guides/${slug}/` },
        ])}
      />

      <GuideHero guide={guide} />

      {/* Body + sticky TOC. Editorial reading-focused layout — paper bg,
          generous padding, sticky TOC sidebar on lg+. */}
      <section data-section-tone="light" className="relative bg-paper">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-16">
            <div className="min-w-0 lg:order-1">
              {isInSeries && (
                <SeriesNav
                  series={seriesEntries}
                  currentSlug={slug}
                  variant="inline"
                />
              )}
              <div className={isInSeries ? 'mt-12' : ''}>
                <GuideBody value={guide.body} />
              </div>
            </div>

            <aside className="hidden lg:order-2 lg:block">
              <div className="sticky top-24">
                <GuideTOC body={guide.body} />
              </div>
            </aside>
          </div>
        </div>
      </section>

      {isInSeries && (
        <SeriesNav series={seriesEntries} currentSlug={slug} variant="full" />
      )}

      <GuideRelated
        guides={related}
        subhead={
          sameCategory.length
            ? 'Other entries from the same shelf — same depth, adjacent territory.'
            : 'Other deep-dives from the library — pick the one closest to your stack.'
        }
      />

      <FinalCTARail />
    </>
  )
}
