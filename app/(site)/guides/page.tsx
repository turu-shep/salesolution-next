import type { Metadata } from 'next'

import { SectionRail } from '@/components/layout/SectionRail'
import { FinalCTARail } from '@/components/sections/FinalCTARail'
import { FeaturedGuide } from '@/components/sections/guides/FeaturedGuide'
import { GuidesLibrary } from '@/components/sections/guides/GuidesLibrary'
import { ServicesHero } from '@/components/sections/services/ServicesHero'
import { JsonLd } from '@/components/seo/JsonLd'
import { business } from '@/lib/business'
import { breadcrumbListSchema, itemListSchema } from '@/lib/schema'
import { getAllGuides, type GuideCard } from '@/sanity/lib/guides'

export const metadata: Metadata = {
  // The root layout's title template appends " · Sale Solution" — keep this bare
  // so it doesn't double-brand to "Guides · Sale Solution · Sale Solution".
  title: 'Guides',
  description:
    'Long-form, field-tested guides on website launches, SEO, e-commerce, and the AI-search transition. Free, no email gate.',
  alternates: { canonical: 'https://salesolution.net/guides/' },
}

export const revalidate = 3600

/**
 * Picks the editorial "featured" guide for the hub.
 *
 * Preference order:
 *   1. The first-published part of the active Website Launch Checklist
 *      series (the flagship piece).
 *   2. Otherwise the most recently published guide overall.
 *
 * Returns undefined if there are no guides — the hero + library still
 * render fine in that empty state.
 */
function pickFeatured(guides: GuideCard[]): GuideCard | undefined {
  if (guides.length === 0) return undefined

  const partOne = guides.find((g) => g.series?.part === 1)
  if (partOne) return partOne

  return [...guides].sort((a, b) => {
    const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0
    const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0
    return tb - ta
  })[0]
}

export default async function GuidesHubPage() {
  let guides: GuideCard[]
  try {
    guides = await getAllGuides()
  } catch (err) {
    console.warn('[guides hub] Sanity fetch failed:', err)
    guides = []
  }

  const featured = pickFeatured(guides)
  const totalGuides = guides.length
  const seriesCount = new Set(
    guides.map((g) => g.series?.name).filter(Boolean) as string[],
  ).size
  const topicCount = new Set(
    guides.map((g) => g.category).filter(Boolean) as string[],
  ).size

  return (
    <>
      <JsonLd
        data={breadcrumbListSchema([
          { name: 'Home', url: `${business.url}/` },
          { name: 'Guides', url: `${business.url}/guides/` },
        ])}
      />
      {guides.length > 0 && (
        <JsonLd
          data={itemListSchema({
            name: 'Field-tested guides',
            url: `${business.url}/guides/`,
            items: guides.map((g) => ({
              name: g.title,
              url: `${business.url}/guides/${g.slug}/`,
            })),
          })}
        />
      )}

      <ServicesHero
        eyebrow="The library · Field notes"
        title="Field-tested guides"
        titleAccent="for technical e-commerce."
        lede={
          <>
            Long-form, field-tested reference for engineering teams running
            industrial e&#8209;commerce. Includes the 8-part Website Launch
            Checklist Series and standalone deep-dives on schema, AIO, and
            paid-search alongside organic. Free &mdash; no email gate.
          </>
        }
        primaryCta={{ label: 'Browse the library', href: '#library' }}
        secondaryCta={{ label: 'Get the strategy call', href: '/book-growth-call/' }}
        anchors={[
          { label: 'Featured', href: '#featured' },
          { label: 'Library', href: '#library' },
          { label: 'Strategy call', href: '/book-growth-call/' },
        ]}
      />

      {totalGuides > 0 && (
        <SectionRail tone="surface" size="sm">
          <dl className="grid grid-cols-3 gap-6 border-y border-rule py-6 sm:gap-10 md:py-8">
            <Stat label="Guides published" value={totalGuides} />
            <Stat label="Topic areas" value={topicCount} />
            <Stat label="Reference series" value={seriesCount} />
          </dl>
        </SectionRail>
      )}

      {featured && (
        <section id="featured">
          <FeaturedGuide guide={featured} />
        </section>
      )}

      <SectionRail tone="paper" id="library">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            The library &middot; All entries
          </p>
          <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
            Every guide.{' '}
            Filter by topic, or scroll the lot.
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-700">
            Written for the engineer or founder doing the work themselves.
            Schema, structure, citation engineering, AIO &mdash; the same
            material that goes into client engagements, published in full.
          </p>
        </div>

        <div className="mt-12">
          <GuidesLibrary
            guides={guides}
            excludeIds={featured ? [featured._id] : undefined}
          />
        </div>
      </SectionRail>

      <FinalCTARail />
    </>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-2">
      <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
        {label}
      </dt>
      <dd className="font-display text-3xl font-semibold tabular-nums leading-none tracking-[-0.02em] text-ink-900 sm:text-4xl">
        {value}
      </dd>
    </div>
  )
}
