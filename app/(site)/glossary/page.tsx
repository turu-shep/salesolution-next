import type { Metadata } from 'next'

import { FinalCTARail } from '@/components/sections/FinalCTARail'
import { GlossaryHub } from '@/components/sections/glossary/GlossaryHub'
import { ServicesHero } from '@/components/sections/services/ServicesHero'
import { JsonLd } from '@/components/seo/JsonLd'
import { business } from '@/lib/business'
import { breadcrumbListSchema, definedTermSetSchema } from '@/lib/schema'
import {
  getAllGlossaryTerms,
  type GlossaryTermCard,
} from '@/sanity/lib/glossary'

/**
 * Below this many published terms the hub stays out of the index — a thin,
 * mostly-empty glossary is a quality-signal cost. The per-term pages are
 * always indexable on their own (each is a complete definition). Flip to
 * full indexing — and add /glossary/ to app/sitemap.ts — once the count
 * clears the threshold. See docs/strategy/career-path/06-wiki-architecture.md.
 */
const INDEX_THRESHOLD = 15

export async function generateMetadata(): Promise<Metadata> {
  const terms = await getAllGlossaryTerms().catch(() => [])
  const live = terms.length >= INDEX_THRESHOLD

  return {
    title: 'AI-search glossary · Sale Solution',
    description:
      'Plain-English definitions of AI-search, GEO, and answer-engine terms for industrial e-commerce — generative engine optimization, citation engineering, answer engines, and more.',
    alternates: { canonical: `${business.url}/glossary/` },
    robots: live ? undefined : { index: false, follow: true },
  }
}

export const revalidate = 3600

export default async function GlossaryHubPage() {
  let terms: GlossaryTermCard[]
  try {
    terms = await getAllGlossaryTerms()
  } catch (err) {
    console.warn('[glossary hub] Sanity fetch failed:', err)
    terms = []
  }

  return (
    <>
      <JsonLd
        data={breadcrumbListSchema([
          { name: 'Home', url: business.url },
          { name: 'Glossary', url: `${business.url}/glossary/` },
        ])}
      />
      <JsonLd data={definedTermSetSchema()} />

      <ServicesHero
        eyebrow="Learning hub / glossary"
        title="The AI-search"
        titleAccent="glossary."
        lede={
          <>
            Plain-English definitions for the vocabulary of AI search &mdash;
            GEO, answer engines, citation engineering &mdash; written for the
            people who run technical B2B and industrial e-commerce, with an
            example from the catalog every time.
          </>
        }
        primaryCta={{ label: 'Browse the terms', href: '#glossary' }}
        secondaryCta={{ label: 'Book a strategy call', href: '/book-growth-call/' }}
      />

      <GlossaryHub terms={terms} id="glossary" />

      <FinalCTARail />
    </>
  )
}
