import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PortableTextRenderer } from '@/components/portable-text/PortableTextRenderer'
import { PathEnrichments } from '@/components/sections/career-path-detail/PathEnrichments'
import { FinalCTARail } from '@/components/sections/FinalCTARail'
import { GlossaryRelated } from '@/components/sections/glossary/GlossaryRelated'
import { GlossaryResources } from '@/components/sections/glossary/GlossaryResources'
import { GlossaryTermHeader } from '@/components/sections/glossary/GlossaryTermHeader'
import { JsonLd } from '@/components/seo/JsonLd'
import { business } from '@/lib/business'
import { breadcrumbListSchema, definedTermSchema } from '@/lib/schema'
import {
  getAllGlossaryTermSlugs,
  getGlossaryTermBySlug,
} from '@/sanity/lib/glossary'

type Props = { params: Promise<{ term: string }> }

export async function generateStaticParams() {
  try {
    const slugs = await getAllGlossaryTermSlugs()
    return slugs.map((term) => ({ term }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { term } = await params
  const doc = await getGlossaryTermBySlug(term).catch(() => null)
  if (!doc) return { title: 'Not found' }

  return {
    title: doc.seo?.metaTitle ?? `${doc.term} — AI-search glossary`,
    description: doc.seo?.metaDescription ?? doc.shortDefinition,
    alternates: { canonical: `${business.url}/glossary/${term}/` },
    robots: doc.seo?.noindex ? { index: false, follow: false } : undefined,
  }
}

export const revalidate = 3600

export default async function GlossaryTermPage({ params }: Props) {
  const { term } = await params

  let doc
  try {
    doc = await getGlossaryTermBySlug(term)
  } catch (err) {
    console.warn('[glossary term page] Sanity fetch failed:', err)
    notFound()
  }

  if (!doc) notFound()

  return (
    <>
      <JsonLd
        data={breadcrumbListSchema([
          { name: 'Home', url: `${business.url}/` },
          { name: 'Glossary', url: `${business.url}/glossary/` },
          { name: doc.term, url: `${business.url}/glossary/${term}/` },
        ])}
      />
      <JsonLd
        data={definedTermSchema({
          term: doc.term,
          slug: term,
          definition: doc.shortDefinition,
        })}
      />

      <GlossaryTermHeader term={doc} />

      {((Array.isArray(doc.body) && doc.body.length > 0) ||
        (doc.enrichments && doc.enrichments.length > 0)) && (
        <section data-section-tone="light" className="relative bg-paper">
          <div className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 lg:px-8">
            {Array.isArray(doc.body) && doc.body.length > 0 && (
              <article className="min-w-0 max-w-prose">
                <PortableTextRenderer value={doc.body} />
              </article>
            )}
            {/* Optional interactive aids (calculators/scorecards) — shared
                enrichment framework with career paths. */}
            <PathEnrichments enrichments={doc.enrichments} placement="after-modules" />
          </div>
        </section>
      )}

      <GlossaryRelated terms={doc.relatedTerms} />

      <GlossaryResources resources={doc.relatedResources} />

      <FinalCTARail />
    </>
  )
}
