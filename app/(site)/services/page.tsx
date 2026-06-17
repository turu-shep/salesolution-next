import type { Metadata } from 'next'
import Link from 'next/link'

import { FAQ, type QA } from '@/components/sections/FAQ'
import { FinalCTARail } from '@/components/sections/FinalCTARail'
import { EngagementShapes } from '@/components/sections/services/EngagementShapes'
import { HowServicesCombine } from '@/components/sections/services/HowServicesCombine'
import { PickAService } from '@/components/sections/services/PickAService'
import { ServicesHero } from '@/components/sections/services/ServicesHero'
import { ServicesIndex } from '@/components/sections/services/ServicesIndex'
import { CompositeBar } from '@/components/services/CompositeBar'
import { JsonLd } from '@/components/seo/JsonLd'
import { business } from '@/lib/business'
import { breadcrumbListSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Services · Six services. One operator.',
  description:
    'Six services for industrial and technical e-commerce: AI Search & GEO, Catalog AI, Editorial Authority, Website Development, Outbound Email, and Full Growth Ownership. Run standalone or coordinated by one operator.',
  alternates: { canonical: 'https://salesolution.net/services/' },
}

const HUB_FAQ: QA[] = [
  {
    q: 'Can I engage you for one service or do I have to take the whole stack?',
    a: (
      <>
        <p>
          Each of the six services runs as a standalone engagement. We&rsquo;ll
          tell you on the first call whether one service moves the needle for
          your situation or whether you&rsquo;d need two or three to see real impact.
        </p>
        <p className="mt-3">
          For most industrial / technical-distribution clients, the sequence
          that works is: AI search foundation first, then content (Editorial
          Authority and/or Catalog AI), then channels (outbound). Dev is
          usually a separate project tied to a replatform or new build.
        </p>
      </>
    ),
  },
  {
    q: 'How do I pick the right starting service?',
    a: (
      <>
        <p>
          See the &ldquo;Which service do I need?&rdquo; section above &mdash;
          six honest entry points. If none clearly fit, the free strategy
          call exists for that. Paste your top 5 category URLs and we&rsquo;ll
          walk through which constraint is actually capping growth right now.
        </p>
      </>
    ),
  },
  {
    q: "What's the most common combination?",
    a: (
      <>
        <p>
          About 70% of engagements pair AI Search with either Editorial
          Authority or Catalog AI (or both) within 90 days. About 30% layer
          outbound after the first quarter. Website development is usually a
          separate sprint or project, sometimes with AI Search engineering
          baked into the build.
        </p>
        <p className="mt-3">
          For multi-service engagements coordinated under one operator, see{' '}
          <Link
            href="/services/full-growth-ownership/"
            className="font-semibold text-ink-900 underline decoration-rule-strong underline-offset-[3px] hover:text-brand-600 hover:decoration-brand-600"
          >
            Full Growth Ownership
          </Link>
          .
        </p>
      </>
    ),
  },
  {
    q: "What's the difference between Editorial Authority and Catalog AI? They both sound like content.",
    a: (
      <>
        <p>Different content, different work, different tools.</p>
        <p className="mt-3">
          <strong className="text-ink-900">Editorial Authority</strong> is
          human-written editorial content at the category level and above
          &mdash; pillar pages, cluster posts, category content, Q&amp;A hubs,
          trade-press. Senior subject-matter writers, no LLM drafting, priced
          per piece or monthly retainer. Lower volume (4&ndash;16 pieces/month),
          higher per-piece price.
        </p>
        <p className="mt-3">
          <strong className="text-ink-900">Catalog AI</strong> is AI-drafted,
          editor-reviewed content at the product level &mdash; per-product
          descriptions, FAQs, schema, internal linking. AI handles drafting,
          human editors review at Pro and above, priced per SKU. High volume
          (1,000&ndash;100,000+ products), lower per-piece price.
        </p>
        <p className="mt-3">
          They cover different AIO citation surfaces (informational queries
          vs. product-specific queries) and cross-link between each other.
          Most clients eventually buy both.
        </p>
      </>
    ),
  },
  {
    q: 'Can you replace our current marketing agency?',
    a: (
      <>
        <p>
          Often, yes. We&rsquo;re built to replace the SEO + content retainer
          combo (~$15&ndash;40K/month) you&rsquo;re probably running today.
          We don&rsquo;t do brand strategy, paid social creative, or
          social-community management &mdash; if those are load-bearing for
          you, keep that vendor.
        </p>
      </>
    ),
  },
]

export default function ServicesHubPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbListSchema([
          { name: 'Home', url: `${business.url}/` },
          { name: 'Services', url: `${business.url}/services/` },
        ])}
      />

      <CompositeBar weight="hero" />

      <ServicesHero
        eyebrow="Services"
        title="Six services."
        titleAccent="One coordinated system."
        lede={
          <>
            Each service runs standalone or combined under one operator. AI
            search is the gravity well &mdash; most clients start there, then
            layer the rest. Catalog AI handles product-level work at scale.
            Editorial Authority builds the citation layer above. Outbound and
            dev round out the growth motion.
          </>
        }
        primaryCta={{ label: 'Book a strategy call', href: '/book-growth-call/' }}
        secondaryCta={{ label: 'See engagement options', href: '#engagement' }}
        anchors={[
          { label: 'All services', href: '#services' },
          { label: 'Engagement', href: '#engagement' },
          { label: 'How to pick', href: '#pick' },
          { label: 'How they combine', href: '#combinations' },
          { label: 'FAQ', href: '#faq' },
        ]}
      />

      <ServicesIndex id="services" />

      <EngagementShapes id="engagement" />

      <PickAService id="pick" />

      <HowServicesCombine id="combinations" />

      <FAQ
        id="faq"
        eyebrow="Choosing between services"
        headline={
          <>
            How to <span className="text-ink-500">pick what you need.</span>
          </>
        }
        kicker="Multi-service questions. Bundling. Replacing existing vendors."
        items={HUB_FAQ}
      />

      <FinalCTARail />
    </>
  )
}
