import type { Metadata } from 'next'

import { FinalCTARail } from '@/components/sections/FinalCTARail'
import { AreasDirectory } from '@/components/sections/service-areas/AreasDirectory'
import { PrimaryOffice } from '@/components/sections/service-areas/PrimaryOffice'
import { RemoteOperations } from '@/components/sections/service-areas/RemoteOperations'
import { ServicesHero } from '@/components/sections/services/ServicesHero'
import { JsonLd } from '@/components/seo/JsonLd'
import { business } from '@/lib/business'
import { breadcrumbListSchema } from '@/lib/schema'

/**
 * /service-areas/ — coverage hub.
 *
 * Per D9 in the execution roadmap, programmatic per-state landing
 * pages are deferred until each one carries unique content. Until
 * then, this single page does the local-SEO work via the JSON-LD
 * Organization + BreadcrumbList graph and an honest directory of
 * regions we&rsquo;ve actually delivered for.
 *
 * Structure:
 *   1. Hero            — light, two-tone H1 with HQ city named.
 *   2. PrimaryOffice   — dark, accent-orange highlighted NAP block.
 *   3. AreasDirectory  — light, region/state grid with mono labels.
 *   4. RemoteOperations — light, four operating principles.
 *   5. FinalCTARail    — dark, shared closing band.
 */

export const metadata: Metadata = {
  title: 'Service areas · US-wide coverage, FL headquarters',
  description:
    'Remote-first AI-SEO and GEO delivery for technical B2B and industrial e-commerce. All 50 US states plus retainer engagements in Canada, UK, EU, and Australia. One physical office in North Miami Beach, FL.',
  alternates: { canonical: 'https://salesolution.net/service-areas/' },
  openGraph: {
    type: 'website',
    url: 'https://salesolution.net/service-areas/',
    title: 'Service areas · Sale Solution',
    description:
      'Remote-first delivery, US-wide. Headquarters in North Miami Beach, FL. Retainer engagements available in Canada, UK, EU, and Australia.',
  },
}

export default function ServiceAreasPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbListSchema([
          { name: 'Home', url: business.url + '/' },
          { name: 'Service areas', url: business.url + '/service-areas/' },
        ])}
      />

      <ServicesHero
        eyebrow="Where we work"
        title={`Engineered for ${business.address.city}.`}
        titleAccent="Delivered nationally."
        lede={
          <>
            One physical office in {business.address.city}, {business.address.region}. The
            rest of the team is distributed across US time zones. We
            work with industrial and technical-distribution e&#8209;commerce
            brands in all 50 states &mdash; plus retainer engagements
            in Canada, the UK, the EU, and Australia.
          </>
        }
        primaryCta={{ label: 'Book a strategy call', href: '/book-growth-call/' }}
        secondaryCta={{ label: 'See coverage map', href: '#directory' }}
        anchors={[
          { label: 'Headquarters', href: '#headquarters' },
          { label: 'Directory', href: '#directory' },
          { label: 'How remote works', href: '#remote' },
        ]}
      />

      <PrimaryOffice id="headquarters" />
      <AreasDirectory id="directory" />
      <RemoteOperations id="remote" />
      <FinalCTARail />
    </>
  )
}
