import type { Metadata } from 'next'
import Link from 'next/link'

import { FAQ, type QA } from '@/components/sections/FAQ'
import { FinalCTARail } from '@/components/sections/FinalCTARail'
import { EditorialCaseStudy } from '@/components/sections/editorial-authority/EditorialCaseStudy'
import { EditorialComparison } from '@/components/sections/editorial-authority/EditorialComparison'
import { EditorialFormats } from '@/components/sections/editorial-authority/EditorialFormats'
import { EditorialIncluded } from '@/components/sections/editorial-authority/EditorialIncluded'
import { EditorialMarketReality } from '@/components/sections/editorial-authority/EditorialMarketReality'
import { EditorialPricing } from '@/components/sections/editorial-authority/EditorialPricing'
import { EditorialProcess } from '@/components/sections/editorial-authority/EditorialProcess'
import { ServicesHero } from '@/components/sections/services/ServicesHero'
import { JsonLd } from '@/components/seo/JsonLd'
import { ServiceColorDot } from '@/components/services/ServiceColorDot'
import { serviceSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Editorial Authority · Senior-writer content for technical B2B',
  description:
    'Pillar pages, cluster posts, category content, and engineering Q&A hubs. Senior subject-matter writers. No LLM ghostwriting. No offshoring. Editorial Retainer from $4K/mo, Pillar Pack from $6K fixed, $500 single-piece trial. Three volume tiers.',
  alternates: {
    canonical: 'https://salesolution.net/services/editorial-authority/',
  },
}

const EDITORIAL_FAQ: QA[] = [
  {
    q: 'Do you write on topics we provide, or do you research them?',
    a: (
      <p>
        Both, and the research is the work. Every monthly cycle starts
        with the editor proposing 15&ndash;20 candidate topics ranked by
        AIO citation gap, commercial intent, and competitor weakness.
        You greenlight the ones to ship.
      </p>
    ),
  },
  {
    q: 'Is the content SEO-optimised by default?',
    a: (
      <>
        <p>
          Every piece ships with target query, search-intent fit,
          internal-linking plan, FAQ block, and{' '}
          <em className="not-italic font-semibold text-ink-900">
            Article / HowTo / FAQ schema
          </em>{' '}
          on the page. We don&rsquo;t treat SEO as an upsell, and we
          don&rsquo;t ship plain text.
        </p>
        <p className="mt-3">
          GEO engineering &mdash; AIO scannability, citation-grade
          source patterns, semantic completeness &mdash; sits on top of
          the SEO layer on every retainer piece.
        </p>
      </>
    ),
  },
  {
    q: 'Do you use AI to write the drafts?',
    a: (
      <>
        <p>
          No. Senior subject-matter writers draft every piece off the
          brief and the primary sources. We use AI for citation
          tracking, competitive scans, and outline pressure-testing
          &mdash; never for the draft itself.
        </p>
        <p className="mt-3">
          78% of LLM-drafted content in our citation tracker fails to
          earn a single AIO citation in 90 days. We&rsquo;re not
          interested in shipping editorial content that doesn&rsquo;t
          earn its keep.
        </p>
        <p className="mt-3 text-sm text-ink-500">
          For product catalog work at scale &mdash; where the economics
          of human writing don&rsquo;t work &mdash; we use AI with human
          editor review. See{' '}
          <Link
            href="/services/catalog-ai/"
            className="font-semibold text-ink-900 underline decoration-rule-strong underline-offset-[5px] transition-colors duration-200 hover:text-brand-600 hover:decoration-brand-600"
          >
            <ServiceColorDot service="catalog" className="mr-1.5" />
            Catalog AI
          </Link>{' '}
          for that service.
        </p>
      </>
    ),
  },
  {
    q: 'How quickly can you turn around a piece?',
    a: (
      <p>
        Standard turnaround is 10 working days from brief to
        publish-ready. That includes the outline gate, draft, edit, and
        the schema / on-page layer. Faster than 10 days we can do on the
        Pillar Pack for one-off urgent pieces, but the citation work
        suffers.
      </p>
    ),
  },
  {
    q: 'What verticals do you actually know?',
    a: (
      <>
        <p>
          Industrial distribution (hydraulics, fluid power, pneumatics,
          industrial automation, MRO), technical B2B SaaS, contract
          manufacturing, lab supply, electronics, fasteners, abrasives,
          and local service categories (dental, roofing, home services)
          where buyers compare cost and options before they call.
        </p>
        <p className="mt-3">
          If buyers research before they commit, our writers know how to
          talk to them. Outside that we&rsquo;ll tell you on the first
          call &mdash; we&rsquo;d rather pass than fake the depth.
        </p>
      </>
    ),
  },
  {
    q: 'Why are you not the cheapest option?',
    a: (
      <>
        <p>
          We pay senior writers and editors at US/UK rates, not offshore
          generalist rates. We include schema, on-page work, and 90-day
          citation tracking on every piece. We don&rsquo;t resell anyone
          else&rsquo;s drafts.
        </p>
        <p className="mt-3">
          If your benchmark is $99-per-article content, we&rsquo;re not
          the fit and we&rsquo;ll say so. Where we win is the ratio of
          cited pieces to total spend &mdash; not the absolute floor.
        </p>
      </>
    ),
  },
  {
    q: 'Can we trial before committing to a retainer?',
    a: (
      <p>
        Two ways: a $500 Single Piece is a one-off article on your topic
        with the full schema and SEO layer. The Pillar Pack ($6&ndash;14K,
        6 weeks) ships one pillar plus six clusters and 90 days of
        citation tracking &mdash; by week 4 you have enough data to
        decide whether to retain or walk.
      </p>
    ),
  },
  {
    q: "What's the difference between this and Catalog AI?",
    a: (
      <>
        <p>
          Different content, different work, different tools. Editorial
          Authority is human-written content at the category level and
          above: pillar pages, cluster posts, category content, Q&amp;A
          hubs, trade-press. Senior writers, no LLM drafting, 4&ndash;16
          pieces per month.
        </p>
        <p className="mt-3">
          <Link
            href="/services/catalog-ai/"
            className="font-semibold text-ink-900 underline decoration-rule-strong underline-offset-[5px] transition-colors duration-200 hover:text-brand-600 hover:decoration-brand-600"
          >
            <ServiceColorDot service="catalog" className="mr-1.5" />
            Catalog AI
          </Link>{' '}
          is AI-drafted, editor-reviewed content at the product level:
          per-product descriptions, FAQs, schema, internal linking.
          Priced per SKU. Scales to 10,000+ products.
        </p>
        <p className="mt-3">
          Most clients eventually buy both &mdash; they cover different
          surfaces (editorial AIO citations vs. product AIO citations)
          and the cross-linking between them is most of the value.
        </p>
      </>
    ),
  },
]

export default function EditorialAuthorityServicePage() {
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: 'Editorial Authority',
          slug: 'editorial-authority',
          description:
            'Senior-writer editorial content for considered-purchase businesses — industrial distribution, technical B2B, and local service brands: pillar pages, cluster posts, Q&A hubs, category-level content, and trade-press editorial, all built for AI-search citation. Editorial Retainer from $4K/mo, Pillar Pack from $6K fixed, $500 single-piece trial.',
          category: 'Content Marketing',
        })}
      />

      <div className="h-1.5 w-full bg-service-editorial-500" aria-hidden />

      <ServicesHero
        eyebrow="Services / Editorial Authority"
        title="Editorial content engineered"
        titleAccent="to be cited, not just published."
        lede={
          <>
            Senior subject-matter writers turn your domain expertise
            into pillar pages, cluster posts, and category-level content
            that AI&nbsp;Overviews and ChatGPT cite ahead of the
            competition. No offshoring. No LLM ghostwriting. No upsell
            on schema.
          </>
        }
        primaryCta={{
          label: 'Book a strategy call',
          href: '/book-growth-call/',
        }}
        secondaryCta={{ label: 'See pricing', href: '#pricing' }}
        anchors={[
          { label: 'Why now', href: '#why-now' },
          { label: 'What we write', href: '#formats' },
          { label: 'Process', href: '#process' },
          { label: 'Compare', href: '#compare' },
          { label: 'Pricing', href: '#pricing' },
          { label: 'FAQ', href: '#faq' },
        ]}
        serviceName="editorial-authority"
        serviceCategory="content"
      />

      <EditorialMarketReality id="why-now" />
      <EditorialFormats id="formats" />
      <EditorialProcess id="process" />
      <EditorialComparison id="compare" />
      <EditorialPricing id="pricing" />
      <EditorialIncluded id="included" />
      <EditorialCaseStudy id="case-study" />

      <FAQ
        id="faq"
        eyebrow="Editorial Authority FAQ"
        headline={
          <>
            Questions{' '}
            <span className="text-ink-500">about the work itself.</span>
          </>
        }
        kicker="Tools, turnaround, scope split with Catalog AI, why we're not the cheapest."
        items={EDITORIAL_FAQ}
      />

      <FinalCTARail />
    </>
  )
}
