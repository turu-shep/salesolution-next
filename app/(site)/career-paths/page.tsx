import type { Metadata } from 'next'

import { FinalCTARail } from '@/components/sections/FinalCTARail'
import { CareerPathsGrid } from '@/components/sections/career-paths/CareerPathsGrid'
import { CareerPathsIntent } from '@/components/sections/career-paths/CareerPathsIntent'
import { ServicesHero } from '@/components/sections/services/ServicesHero'
import {
  getAllCareerPaths,
  type CareerPathCard,
} from '@/sanity/lib/career-paths'

export const metadata: Metadata = {
  title: 'Career paths · Sale Solution',
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
