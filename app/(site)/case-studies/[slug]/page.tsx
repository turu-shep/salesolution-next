import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { CaseStudyApproach } from '@/components/sections/case-studies/CaseStudyApproach'
import { CaseStudyCTA } from '@/components/sections/case-studies/CaseStudyCTA'
import { CaseStudyHero } from '@/components/sections/case-studies/CaseStudyHero'
import { CaseStudyMethodology } from '@/components/sections/case-studies/CaseStudyMethodology'
import { CaseStudyProofBand } from '@/components/sections/case-studies/CaseStudyProofBand'
import { CaseStudyProseSection } from '@/components/sections/case-studies/CaseStudyProseSection'
import { CaseStudyRelated } from '@/components/sections/case-studies/CaseStudyRelated'
import { CaseStudyResults } from '@/components/sections/case-studies/CaseStudyResults'
import { CaseStudyStickyCTA } from '@/components/sections/case-studies/CaseStudyStickyCTA'
import { serviceMeta } from '@/components/sections/case-studies/service-meta'
import { JsonLd } from '@/components/seo/JsonLd'
import { business } from '@/lib/business'
import { breadcrumbListSchema } from '@/lib/schema'
import {
  getAllCaseStudies,
  getAllCaseStudySlugs,
  getCaseStudyBySlug,
  type CaseStudyCard as CaseStudyCardData,
} from '@/sanity/lib/case-studies'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  try {
    const slugs = await getAllCaseStudySlugs()
    return slugs.map((slug) => ({ slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const study = await getCaseStudyBySlug(slug).catch(() => null)
  if (!study) return { title: 'Not found' }

  const fullTitle = [study.title, study.titleMuted].filter(Boolean).join(' ')
  const title = study.seo?.metaTitle ?? `${fullTitle} — ${study.client?.descriptor ?? 'Case study'}`
  const description = study.seo?.metaDescription ?? study.summary
  const canonical = study.seo?.canonicalUrl ?? `${business.url}/case-studies/${slug}/`
  const ogImage = study.seo?.ogImage?.asset?.url

  return {
    title,
    description,
    alternates: { canonical },
    robots: study.seo?.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: 'article',
      url: canonical,
      title,
      description,
      siteName: business.name,
      publishedTime: study.publishedAt,
      modifiedTime: study.updatedAt,
      // Only override when the CMS supplies an image; otherwise omit so Next
      // auto-wires the per-study opengraph-image.tsx file convention.
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  }
}

export const revalidate = 3600

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params

  let study
  try {
    study = await getCaseStudyBySlug(slug)
  } catch (err) {
    console.warn('[case study page] Sanity fetch failed:', err)
    notFound()
  }
  if (!study) notFound()

  // Related: other stories from the same client first (the "one project,
  // several service angles" cross-link), then other clients.
  let allStudies: CaseStudyCardData[] = []
  try {
    allStudies = await getAllCaseStudies()
  } catch (err) {
    console.warn('[case study page] related fetch failed:', err)
  }
  const sameClient = allStudies.filter(
    (s) => s.slug !== slug && s.client?._id && s.client._id === study.client?._id,
  )
  const sameClientSlugs = new Set(sameClient.map((s) => s.slug))
  const others = allStudies
    .filter((s) => s.slug !== slug && !sameClientSlugs.has(s.slug))
    .slice(0, 3)

  const fullTitle = [study.title, study.titleMuted].filter(Boolean).join(' ')
  const canonical = `${business.url}/case-studies/${slug}/`

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: fullTitle,
    description: study.summary,
    datePublished: study.publishedAt,
    dateModified: study.updatedAt ?? study.publishedAt,
    publisher: { '@id': `${business.url}/#organization` },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    articleSection: 'Case Study',
  }

  return (
    <>
      <JsonLd data={articleSchema} />
      <JsonLd
        data={breadcrumbListSchema([
          { name: 'Home', url: business.url },
          { name: 'Case Studies', url: `${business.url}/case-studies/` },
          { name: fullTitle, url: canonical },
        ])}
      />

      {/* Service identity strip — same convention as the service pages. */}
      <div aria-hidden className={serviceMeta(study.primaryService).accentBar} />

      <CaseStudyHero study={study} />

      <CaseStudyProseSection
        id="situation"
        tone="surface"
        blocks={[
          {
            eyebrow: 'The situation',
            heading: 'Where they started.',
            body: study.situation,
          },
          {
            eyebrow: 'The constraint',
            heading: 'What made it hard.',
            body: study.constraint,
          },
        ]}
      />

      <CaseStudyApproach study={study} id="approach" />

      <CaseStudyProseSection
        id="mechanism"
        tone="surface"
        blocks={[
          {
            eyebrow: 'Why it worked',
            heading: 'The mechanism,',
            headingMuted: 'not the magic.',
            body: study.mechanism,
          },
        ]}
      />

      <CaseStudyResults study={study} id="results" />

      <CaseStudyProofBand study={study} id="proof" />

      <CaseStudyMethodology study={study} id="measurement" />

      <CaseStudyRelated sameClient={sameClient} others={others} />

      <CaseStudyCTA />

      <CaseStudyStickyCTA />
    </>
  )
}
