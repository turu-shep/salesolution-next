import type { Metadata } from 'next'
import Link from 'next/link'

import { FAQ, type QA } from '@/components/sections/FAQ'
import { FinalCTARail } from '@/components/sections/FinalCTARail'
import { CatalogBeyondCallout } from '@/components/sections/catalog-ai/CatalogBeyondCallout'
import { CatalogCaseStudyCallout } from '@/components/sections/catalog-ai/CatalogCaseStudyCallout'
import { CatalogDeliverablesTable } from '@/components/sections/catalog-ai/CatalogDeliverablesTable'
import { CatalogExclusions } from '@/components/sections/catalog-ai/CatalogExclusions'
import { CatalogMarketProblem } from '@/components/sections/catalog-ai/CatalogMarketProblem'
import { CatalogProcess } from '@/components/sections/catalog-ai/CatalogProcess'
import { CatalogSnapshotCTA } from '@/components/sections/catalog-ai/CatalogSnapshotCTA'
import { CatalogTiers } from '@/components/sections/catalog-ai/CatalogTiers'
import { CatalogVolumePricing } from '@/components/sections/catalog-ai/CatalogVolumePricing'
import { CatalogWhereAIUsed } from '@/components/sections/catalog-ai/CatalogWhereAIUsed'
import { ServicesHero } from '@/components/sections/services/ServicesHero'
import { JsonLd } from '@/components/seo/JsonLd'
import { serviceSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Catalog AI · AI-rewritten product catalogs for industrial e-commerce',
  description:
    'AI-rewritten product catalogs for industrial and equipment distributors. Three tiers: $3/SKU Standard, $7/SKU Pro with AIO citation engineering, and an Enterprise managed service from $15K/mo. Published prices. Free dual-version snapshot.',
  alternates: { canonical: 'https://salesolution.net/services/catalog-ai/' },
}

const CATALOG_FAQ: QA[] = [
  {
    q: "What's the actual difference between Standard and Pro?",
    a: (
      <>
        <p>
          Standard rewrites your descriptions and ships the catalog. Pro
          engineers each product to be cited by AI Overviews &mdash; deeper
          descriptions, FAQ blocks, manufacturer spec integration,
          comparison content, enhanced schema. The Pro tier is built for
          distributors who want to dominate AI search, not just have better
          descriptions.
        </p>
      </>
    ),
  },
  {
    q: 'Why is Pro 2.3× more expensive than Standard?',
    a: (
      <>
        <p>
          Because the work per product is 2&ndash;3× more: manufacturer
          spec ingestion, FAQ generation, comparison content, deeper QA.
          The free Catalog Snapshot shows you both tiers side-by-side on
          your own products so you can see the difference before deciding.
        </p>
      </>
    ),
  },
  {
    q: 'When does Enterprise make sense?',
    a: (
      <>
        <p>
          Above 50K SKUs, the per-SKU model gets expensive enough that a
          managed-service retainer is cheaper than equivalent project work.
          Enterprise also includes category page rewrites, programmatic
          SEO build, dedicated operator, and monthly outcome reviews.
        </p>
        <p className="mt-3">
          If you&rsquo;re hiring an in-house person for $200K+/year to do
          this, the retainer is a better deal.
        </p>
      </>
    ),
  },
  {
    q: 'Can we start with Standard and upgrade to Pro later?',
    a: (
      <>
        <p>
          Yes. We charge the difference (~$4/SKU at tier 1) plus a
          reprocessing fee for any SKUs already shipped. Most clients who
          upgrade do so 60&ndash;90 days after Standard delivery, once
          they&rsquo;ve seen the work and want more depth.
        </p>
      </>
    ),
  },
  {
    q: 'What if the AI gets a product wrong?',
    a: (
      <>
        <p>
          We sample before delivery (5% Standard / 20% Pro / 100% via
          operator review for Enterprise). The 500-SKU pilot at day 7 is
          your approval gate before full processing. Post-delivery errors
          get reprocessed at no charge. Our error rate has run under 2% on
          the work we&rsquo;ve shipped.
        </p>
      </>
    ),
  },
  {
    q: 'Wait — you use AI for this but not for your other content service?',
    a: (
      <>
        <p>
          Different work, different tools. Catalog work is structural at
          scale &mdash; 10,000 products with schema, FAQs, internal links, all
          delivered in 30 days. No human team writes 10,000 product
          descriptions in 30 days at $3/SKU. AI handles drafting; editors
          review at scale. The output ships at a price humans can&rsquo;t
          match.
        </p>
        <p className="mt-3">
          Editorial content (pillar pages, cluster posts, category authority
          content) is judgment-based at lower volume &mdash; 10&ndash;20 pieces per
          month, each requiring argument construction and primary research.
          Senior writers produce better outputs there than AI does, and the
          per-piece economics make human writing viable.
        </p>
        <p className="mt-3">
          We use the right tool for each kind of work. See{' '}
          <Link href="/services/editorial-authority/" className="font-semibold text-ink-900 underline decoration-rule-strong underline-offset-[3px] hover:text-brand-600 hover:decoration-brand-600">
            Editorial Authority
          </Link>{' '}
          for the senior-writer service.
        </p>
      </>
    ),
  },
  {
    q: 'How is this different from Hypotenuse, Describely, or similar tools?',
    a: (
      <>
        <p>
          Those are self-service SaaS &mdash; you upload data, you run the
          tool, you handle QA and delivery. We operate the system for you:
          brand voice training, manufacturer spec integration, human QA at
          scale, CRM format mapping, and ongoing operations.
        </p>
        <p className="mt-3">
          SaaS tools work for distributors with internal content teams who
          want a tool. We work for distributors who want the catalog
          handled.
        </p>
      </>
    ),
  },
  {
    q: 'Who owns the rewritten content?',
    a: (
      <>
        <p>
          You do. Full IP transfer on delivery. No licensing, no ongoing
          fees on the content itself. We keep your original descriptions
          as a backup &mdash; you can revert any product at any time.
        </p>
      </>
    ),
  },
  {
    q: 'What about new products we add after the initial rewrite?',
    a: (
      <>
        <p>
          $1/SKU on Standard, $2.50/SKU on Pro, included for Enterprise.
          48-hour turnaround. Send us a weekly or biweekly batch and they
          flow through the same pipeline.
        </p>
      </>
    ),
  },
  {
    q: 'Is there a minimum project size?',
    a: (
      <>
        <p>
          Yes. $3,000 minimum on Standard (1,000 SKUs), $7,000 minimum on
          Pro (1,000 SKUs), 50K SKU minimum to qualify for Enterprise.
          Below those thresholds, the setup cost doesn&rsquo;t amortize
          and you&rsquo;re better off with a SaaS tool.
        </p>
      </>
    ),
  },
  {
    q: 'Do you offer a money-back guarantee?',
    a: (
      <>
        <p>
          If the day-7 pilot batch doesn&rsquo;t meet quality standards
          and we can&rsquo;t fix it with a prompt revision, full refund.
          Once you approve the pilot, the project is binding.
        </p>
      </>
    ),
  },
]

export default function CatalogAIServicePage() {
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: 'Catalog AI — AI-rewritten product catalogs',
          slug: 'catalog-ai',
          description:
            'AI-rewritten product catalogs for industrial and equipment distributors. Three tiers (Standard, Pro, Enterprise) covering description depth, schema engineering, FAQ generation for AI Overview citations, manufacturer spec integration, and dedicated-operator managed service.',
          category: 'Digital Marketing',
        })}
      />

      <div className="h-1 w-full bg-service-catalog-500" aria-hidden />

      <ServicesHero
        eyebrow="Services / Catalog AI"
        title="Your product catalog."
        titleAccent="Rewritten by AI. Operated by us."
        lede={
          <>
            We rewrite catalogs for industrial and equipment e-commerce
            distributors. Descriptions, schema, internal linking, AIO
            citation engineering &mdash; delivered in your platform&rsquo;s
            format, priced per product, operated month over month.
          </>
        }
        primaryCta={{ label: 'Get a free catalog snapshot', href: '/catalog-snapshot/' }}
        secondaryCta={{ label: 'See the three tiers', href: '#tiers' }}
        anchors={[
          { label: 'Why now', href: '#why-now' },
          { label: 'Tiers', href: '#tiers' },
          { label: 'What we build', href: '#what-we-build' },
          { label: 'How it works', href: '#how' },
          { label: 'FAQ', href: '#faq' },
        ]}
        serviceName="catalog-ai"
        serviceCategory="catalog"
      />

      <CatalogMarketProblem id="why-now" />
      <CatalogTiers id="tiers" />
      <CatalogVolumePricing />
      <CatalogBeyondCallout />
      <CatalogWhereAIUsed id="positioning" />
      <CatalogDeliverablesTable id="what-we-build" />
      <CatalogProcess id="how" />
      <CatalogCaseStudyCallout />
      <CatalogSnapshotCTA />
      <CatalogExclusions />

      <FAQ
        id="faq"
        eyebrow="Catalog AI FAQ"
        headline={<>Questions on the work itself.</>}
        kicker="Tier differences. Quality controls. Ownership. The honest sizing thresholds."
        items={CATALOG_FAQ}
      />

      <FinalCTARail />
    </>
  )
}
