import type { Metadata } from 'next'

import { EngagementModel } from '@/components/sections/EngagementModel'
import { FAQ, type QA } from '@/components/sections/FAQ'
import { FinalCTARail } from '@/components/sections/FinalCTARail'
import { ServicesHero } from '@/components/sections/services/ServicesHero'
import { ServicesIndex } from '@/components/sections/services/ServicesIndex'

export const metadata: Metadata = {
  title: 'Services · All offerings',
  description:
    'Six services — AI search & GEO, Catalog AI, content writing, content packages, web development, outbound email — delivered by one operator-led team for industrial and technical-distribution e-commerce.',
  alternates: { canonical: 'https://salesolution.net/services/' },
}

const HUB_FAQ: QA[] = [
  {
    q: 'Can I engage you for one service or do I have to take the whole stack?',
    a: (
      <>
        <p>
          Each service runs as a standalone engagement. We&rsquo;ll
          tell you on the first call whether a single service moves the
          needle for your situation or whether you&rsquo;d need two or
          three to see real impact.
        </p>
        <p className="mt-3">
          For most industrial / technical-distribution clients, the
          sequence that works is: AI search foundation first, then
          content, then channels &mdash; in that order.
        </p>
      </>
    ),
  },
  {
    q: 'How do I pick the right starting service?',
    a: (
      <>
        <p>
          The free strategy call exists for that. Paste your top 5
          category URLs and we&rsquo;ll walk through which constraint is
          actually capping growth right now &mdash; usually it&rsquo;s
          either schema, content depth, or the wrong paid mix.
        </p>
      </>
    ),
  },
  {
    q: 'Do you bundle services at a discount?',
    a: (
      <>
        <p>
          The Operator Retainer pricing already covers multiple services
          when they&rsquo;re needed in tandem. We don&rsquo;t do
          line-item discounting &mdash; the price reflects the operator
          hours, not the service mix.
        </p>
      </>
    ),
  },
  {
    q: 'What\'s the most common combination?',
    a: (
      <>
        <p>
          About 70% of engagements pair AI search & GEO with content
          writing. Roughly 30% layer outbound email after the first
          quarter. Website development is usually a separate sprint with
          AI search engineering baked into the build.
        </p>
      </>
    ),
  },
  {
    q: 'Can you replace our current marketing agency?',
    a: (
      <>
        <p>
          Often, yes. We&rsquo;re built to replace the SEO + content
          retainer combo (~$15&ndash;40k/month) you&rsquo;re probably
          running today. We don&rsquo;t do brand strategy, paid social
          creative, or social-community management &mdash; if those are
          load-bearing for you, keep that vendor.
        </p>
      </>
    ),
  },
]

export default function ServicesHubPage() {
  return (
    <>
      <ServicesHero
        eyebrow="Services"
        title="Six services."
        titleAccent="One operator."
        lede={
          <>
            Each runs standalone or as part of a combined retainer.
            All six are built for industrial and technical-distribution
            e&#8209;commerce &mdash; not generic DTC.
          </>
        }
        primaryCta={{ label: 'Book a strategy call', href: '/book-growth-call/' }}
        secondaryCta={{ label: 'See engagement options', href: '#engagement' }}
        anchors={[
          { label: 'All services', href: '#services' },
          { label: 'Engagement', href: '#engagement' },
          { label: 'FAQ', href: '#faq' },
        ]}
      />

      <ServicesIndex id="services" />

      <EngagementModel id="engagement" />

      <FAQ
        id="faq"
        eyebrow="Choosing between services"
        headline={<>How to <span className="text-ink-500">pick what you need.</span></>}
        kicker="Multi-service questions. Bundling. Replacing existing vendors."
        items={HUB_FAQ}
      />

      <FinalCTARail />
    </>
  )
}
