import type { Metadata } from 'next'
import Link from 'next/link'

import { FAQ, type QA } from '@/components/sections/FAQ'
import { FinalCTARail } from '@/components/sections/FinalCTARail'
import { SixCylinders } from '@/components/sections/revenue-engine/SixCylinders'
import { EngagementShapes } from '@/components/sections/services/EngagementShapes'
import { HowServicesCombine } from '@/components/sections/services/HowServicesCombine'
import { PickAService } from '@/components/sections/services/PickAService'
import { ServicesHero } from '@/components/sections/services/ServicesHero'
import { CompositeBar } from '@/components/services/CompositeBar'
import { JsonLd } from '@/components/seo/JsonLd'
import { business } from '@/lib/business'
import { breadcrumbListSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Services · The cylinders that fire your growth engine',
  description:
    'The capability library behind the growth engine, grouped by the job each part does: get found, win the sale, keep it running. Fire one cylinder or hand the whole loop to one operator.',
  alternates: { canonical: 'https://salesolution.net/services/' },
}

const HUB_FAQ: QA[] = [
  {
    q: 'Can I fire one cylinder, or do I have to run the whole engine?',
    a: (
      <>
        <p>
          Every cylinder runs as a standalone engagement. On the first call
          we&rsquo;ll tell you whether one part moves the needle for your
          situation, or whether two or three need to run together before you
          see real impact.
        </p>
        <p className="mt-3">
          For most industrial and technical-distribution clients the order that
          works is AI search first, then content (Editorial Authority and
          Catalog AI), then outbound. A new build is usually its own project,
          tied to a replatform.
        </p>
      </>
    ),
  },
  {
    q: 'How do I know where to start?',
    a: (
      <>
        <p>
          See the &ldquo;Where does your system start?&rdquo; section above.
          Each row points to the cylinder that fixes that specific leak. If
          none of them obviously fit, that&rsquo;s what the free strategy call
          is for. Paste your top 5 category URLs and we&rsquo;ll walk through
          which constraint is actually capping growth right now.
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
        eyebrow="The capability library"
        title="The parts that stop your leaks."
        titleAccent="One engine."
        lede={
          <>
            Every part of the growth engine, grouped by the job it does: get
            found, win the sale, keep it running. Fire the one that fixes your
            loudest leak, or hand the whole loop to one operator who reads the
            numbers and re-aims it each month.
          </>
        }
        primaryCta={{ label: 'Book a strategy call', href: '/book-growth-call/' }}
        secondaryCta={{ label: 'See the cylinders', href: '#cylinders' }}
        anchors={[
          { label: 'How it works as one machine', href: '#combinations' },
          { label: 'The cylinders', href: '#cylinders' },
          { label: 'Where to start', href: '#pick' },
          { label: 'Pricing', href: '#engagement' },
          { label: 'FAQ', href: '#faq' },
        ]}
      />

      <HowServicesCombine id="combinations" />

      <SixCylinders id="cylinders" />

      <PickAService id="pick" />

      <EngagementShapes id="engagement" />

      <FAQ
        id="faq"
        eyebrow="Before you book"
        headline={
          <>
            How the engine fits together.
          </>
        }
        kicker="Firing one cylinder vs running the whole loop. Where to start. Replacing the agencies you have now."
        items={HUB_FAQ}
      />

      <FinalCTARail />
    </>
  )
}
