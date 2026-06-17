import type { Metadata } from 'next'

import { FinalCTARail } from '@/components/sections/FinalCTARail'
import { CareerPathsGrid } from '@/components/sections/career-paths/CareerPathsGrid'
import { CareerPathsIntent } from '@/components/sections/career-paths/CareerPathsIntent'
import { ServicesHero } from '@/components/sections/services/ServicesHero'
import { JsonLd } from '@/components/seo/JsonLd'
import { business } from '@/lib/business'
import { breadcrumbListSchema, itemListSchema } from '@/lib/schema'
import {
  getAllCareerPaths,
  type CareerPathCard,
} from '@/sanity/lib/career-paths'

export const metadata: Metadata = {
  // The root layout's title template appends " · Sale Solution" — keep this bare
  // so it doesn't double-brand.
  title: 'Career paths',
  description:
    'Free educational paths into digital-marketing careers — SEO, content strategy, and beyond. Self-paced, built by working operators.',
  alternates: { canonical: 'https://salesolution.net/career-paths/' },
}

export const revalidate = 3600

export default async function CareerPathsHubPage() {
  let paths: CareerPathCard[]
  try {
    paths = await getAllCareerPaths()
  } catch (err) {
    console.warn('[career-paths hub] Sanity fetch failed:', err)
    paths = []
  }

  return (
    <>
      <JsonLd
        data={breadcrumbListSchema([
          { name: 'Home', url: `${business.url}/` },
          { name: 'Career paths', url: `${business.url}/career-paths/` },
        ])}
      />
      {paths.length > 0 && (
        <JsonLd
          data={itemListSchema({
            name: 'Career paths into modern AI-search',
            url: `${business.url}/career-paths/`,
            items: paths.map((p) => ({
              name: p.title,
              url: `${business.url}/career-paths/${p.slug}/`,
            })),
          })}
        />
      )}

      <ServicesHero
        eyebrow="Learning hub / career paths"
        title="Career paths into"
        titleAccent="modern AI-search."
        lede={
          <>
            Free reading lists for the roles that actually exist inside a
            B2B technical e-commerce team in 2026 &mdash; SEO, content
            strategy, citation engineering. Written by the operator running
            the client work, not by an influencer selling a cohort.
          </>
        }
        primaryCta={{ label: 'Browse the paths', href: '#library' }}
        secondaryCta={{ label: 'Book a strategy call', href: '/book-growth-call/' }}
        anchors={[
          { label: 'What these are', href: '#what-these-are' },
          { label: 'The library', href: '#library' },
          { label: 'Talk to the operator', href: '#cta' },
        ]}
      />

      <CareerPathsIntent id="what-these-are" />

      <CareerPathsGrid paths={paths} id="library" />

      <div id="cta">
        <FinalCTARail />
      </div>
    </>
  )
}
