import type { Metadata } from 'next'

import { FinalCTARail } from '@/components/sections/FinalCTARail'
import { SectionRail } from '@/components/layout/SectionRail'
import { CareerPathsGrid } from '@/components/sections/career-paths/CareerPathsGrid'
import { CareerPathsIntent } from '@/components/sections/career-paths/CareerPathsIntent'
import { RoleMap } from '@/components/sections/career-paths/RoleMap'
import { ServicesHero } from '@/components/sections/services/ServicesHero'
import { JsonLd } from '@/components/seo/JsonLd'
import { business } from '@/lib/business'
import { breadcrumbListSchema, itemListSchema } from '@/lib/schema'
import {
  getAllCareerPaths,
  getCareerPathsForMap,
  type CareerPathCard,
  type CareerPathMapEntry,
} from '@/sanity/lib/career-paths'

export const metadata: Metadata = {
  // The root layout's title template appends " · Sale Solution" — keep this bare
  // so it doesn't double-brand.
  title: 'Career paths',
  description:
    'Free, self-paced paths into the roles of AI search — SEO, GEO, answer engines, citation work — taught as skill modules by seniority, with examples across industrial e-commerce, home services, and dental.',
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
  const mapEntries: CareerPathMapEntry[] = await getCareerPathsForMap().catch(() => [])

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
            The roles that actually run AI search &mdash; SEO, GEO, answer
            engines, citation work &mdash; taught as skill modules by seniority.
            Examples span industrial e-commerce, home services, and dental.
            Written by the operator doing the client work, not an influencer
            selling a cohort.
          </>
        }
        primaryCta={{ label: 'Browse the paths', href: '#library' }}
        secondaryCta={{ label: 'Book a strategy call', href: '/book-growth-call/' }}
        anchors={[
          { label: 'What these are', href: '#what-these-are' },
          { label: 'The map', href: '#map' },
          { label: 'The library', href: '#library' },
          { label: 'Talk to the operator', href: '#cta' },
        ]}
      />

      <CareerPathsIntent id="what-these-are" />

      {mapEntries.length > 1 && (
        <SectionRail tone="paper" id="map">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
              The map
            </p>
            <h2 className="mt-3 font-display text-balance text-3xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-4xl">
              How the paths connect.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-700">
              Three stages: the foundations you start from, the roles you can
              hire full-time, and the specializations you usually buy as a
              project. Open any card to read the path.
            </p>
          </div>

          <RoleMap entries={mapEntries} className="mt-10" />

          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-500">
            Reuse this map &middot;{' '}
            {/* Raw data endpoints (not pages) — plain new-tab links, not next/link. */}
            <a
              href="/career-paths/roles-map/"
              target="_blank"
              rel="noopener"
              className="text-ink-700 underline decoration-rule-strong underline-offset-2 hover:text-brand-600 hover:decoration-brand-600"
            >
              JSON
            </a>{' '}
            &middot;{' '}
            <a
              href="/career-paths/roles-map/md/"
              target="_blank"
              rel="noopener"
              className="text-ink-700 underline decoration-rule-strong underline-offset-2 hover:text-brand-600 hover:decoration-brand-600"
            >
              Markdown
            </a>{' '}
            <span className="normal-case tracking-normal text-ink-400">(CC BY 4.0)</span>
          </p>
        </SectionRail>
      )}

      <CareerPathsGrid paths={paths} id="library" />

      <div id="cta">
        <FinalCTARail />
      </div>
    </>
  )
}
