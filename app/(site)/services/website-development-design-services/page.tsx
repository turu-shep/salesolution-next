import type { Metadata } from 'next'
import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'
import { FAQ, type QA } from '@/components/sections/FAQ'
import { FinalCTARail } from '@/components/sections/FinalCTARail'
import { ServicesHero } from '@/components/sections/services/ServicesHero'
import { BuildPrinciples } from '@/components/sections/website-dev/BuildPrinciples'
import { BuildReality } from '@/components/sections/website-dev/BuildReality'
import { PerformanceScorecard } from '@/components/sections/website-dev/PerformanceScorecard'
import { PortfolioGrid } from '@/components/sections/website-dev/PortfolioGrid'
import { StackTypes } from '@/components/sections/website-dev/StackTypes'
import { WebDevPricing } from '@/components/sections/website-dev/WebDevPricing'
import { JsonLd } from '@/components/seo/JsonLd'
import { CrossServiceCallout } from '@/components/services/CrossServiceCallout'
import { serviceSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'High-Performance Website Development & Design',
  description:
    'Bespoke e-commerce, corporate, and niche-blog websites engineered for revenue. 4–6 week builds, performance-first, integrated with SEO + analytics from day one.',
  alternates: { canonical: 'https://salesolution.net/services/website-development-design-services/' },
}

const WEBDEV_FAQ: QA[] = [
  {
    q: 'How long does a typical build take?',
    a: (
      <>
        <p>
          4&ndash;6 weeks for a focused Shopify Plus B2B build or a
          performance-led WooCommerce overhaul. 10&ndash;16 weeks for a
          headless Next.js + Hydrogen / Saleor replatform with PIM / ERP
          integration.
        </p>
        <p className="mt-3">
          Longer for catalogs over 15k SKUs, multi-language storefronts,
          or net-new ERP wiring. We publish the timeline in the SOW &mdash;
          if we slip it, you don&rsquo;t pay the milestone.
        </p>
      </>
    ),
  },
  {
    q: 'Which platform do you recommend, honestly?',
    a: (
      <>
        <p>
          Default is Shopify Plus for $2&ndash;25M ARR distributors with
          standard B2B flows (net terms, tiered pricing, quote-to-cart) &mdash;
          it already handles that natively now, and the build cost is half
          of headless.
        </p>
        <p className="mt-3">
          Headless Next.js wins when you have a complex catalog
          (10k+ SKUs with deep specs), custom configurators, or an existing
          PIM / ERP that must be the source of truth. WooCommerce wins when
          you have a real WordPress content investment worth preserving.
        </p>
      </>
    ),
  },
  {
    q: 'Do you do migrations?',
    a: (
      <>
        <p>
          Yes. Magento 1 / 2, BigCommerce, Webflow, Wix, and custom
          monoliths to Shopify Plus or Next.js. Every migration includes a
          301 redirect map built from your top 1000 organic landing pages,
          schema-equity preservation, and a published rollback plan.
        </p>
      </>
    ),
  },
  {
    q: 'Who owns the code after launch?',
    a: (
      <>
        <p>
          You do. Git repository in your org, hosting in your account,
          credentials handed over on launch day. We offer a maintenance
          retainer; you are never locked in to take it. This is in every
          SOW we&rsquo;ve signed since 2021.
        </p>
      </>
    ),
  },
  {
    q: 'What about performance after launch?',
    a: (
      <>
        <p>
          Core Web Vitals targets are SOW commitments: LCP &lt; 2.0s on
          mobile, INP &lt; 200ms, CLS &lt; 0.05. We hold those for 30 days
          post-launch under the stabilisation window. Drift after that is
          either content-shaped or third-party-tag-shaped &mdash; we&rsquo;ll
          show you which.
        </p>
      </>
    ),
  },
  {
    q: 'Do you handle the SEO migration on a replatform?',
    a: (
      <>
        <p>
          Yes. SEO is build-time, not a phase after. Redirect mapping,
          schema parity, internal-link preservation, AIO citation
          continuity, and a 90-day post-launch monitoring window are all
          included by default. Most clients see organic traffic recover
          inside 30&ndash;60 days post-launch instead of the typical 3&ndash;6
          months on competitor rebuilds.
        </p>
      </>
    ),
  },
  {
    q: 'What does post-launch support look like?',
    a: (
      <>
        <p>
          A 30-day stabilisation window is included free &mdash; bug fixes,
          performance hold, analytics validation. After that you have three
          options: hand-off entirely to your team, monthly retainer for
          ongoing performance / A/B / feature work, or an integrated
          SEO retainer that treats the site as a living asset.
        </p>
      </>
    ),
  },
  {
    q: 'Is there a minimum company size?',
    a: (
      <>
        <p>
          For headless / replatform work we look for $2M+ in e&#8209;commerce
          revenue. Below that the build economics don&rsquo;t justify the
          ceiling. Smaller stores get a more honest answer from a Shopify
          Plus partner or a vetted freelancer &mdash; we&rsquo;ll usually
          name two on the first call.
        </p>
      </>
    ),
  },
  {
    q: 'How does a build pair with your other services?',
    a: (
      <>
        <p>
          Most builds ship with platform-level capability for content,
          schema, and AIO citations &mdash; but the <em className="not-italic font-semibold text-ink-900">content itself</em>{' '}
          gets added separately. Three natural pairings:
        </p>
        <ul className="mt-3 space-y-2 pl-4 text-ink-700">
          <li>
            &middot; Build +{' '}
            <Link href="/services/catalog-ai/" className="font-semibold text-ink-900 underline decoration-rule-strong underline-offset-[3px] hover:text-brand-600 hover:decoration-brand-600">
              Catalog AI
            </Link>: we build the platform, Catalog AI handles 1,000&ndash;50,000 product pages
          </li>
          <li>
            &middot; Build +{' '}
            <Link href="/services/editorial-authority/" className="font-semibold text-ink-900 underline decoration-rule-strong underline-offset-[3px] hover:text-brand-600 hover:decoration-brand-600">
              Editorial Authority
            </Link>: we build the platform, senior writers ship the pillar content
          </li>
          <li>
            &middot; Build +{' '}
            <Link href="/services/ai-seo/" className="font-semibold text-ink-900 underline decoration-rule-strong underline-offset-[3px] hover:text-brand-600 hover:decoration-brand-600">
              AI Search retainer
            </Link>: post-launch, ongoing GEO optimization keeps you cited
          </li>
        </ul>
        <p className="mt-3">
          About 60% of builds are paired with at least one of these within 6
          months. For coordinated multi-service engagements, see{' '}
          <Link href="/services/full-growth-ownership/" className="font-semibold text-ink-900 underline decoration-rule-strong underline-offset-[3px] hover:text-brand-600 hover:decoration-brand-600">
            Full Growth Ownership
          </Link>.
        </p>
      </>
    ),
  },
]

export default function WebDevServicePage() {
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: 'High-Performance Website Development & Design',
          slug: 'website-development-design-services',
          description:
            'Bespoke e-commerce, corporate, and niche-blog websites engineered for revenue. 4–6 week builds, performance-first, integrated with SEO + analytics from day one.',
          category: 'Web Development',
        })}
      />

      <div className="h-1.5 w-full bg-service-dev-500" aria-hidden />

      <ServicesHero
        eyebrow="Services / Website development · design"
        title="High-performance commerce."
        titleAccent="Built, not bolted together."
        lede={
          <>
            Bespoke e&#8209;commerce on Shopify&nbsp;Plus, headless Next.js,
            or lean WooCommerce &mdash; engineered for Core Web Vitals,
            AIO citations, and revenue from the first deploy. No plugin
            sprawl, no &ldquo;performance phase&rdquo; upsell. You own the
            code.
          </>
        }
        primaryCta={{ label: 'Request a build quote', href: '/book-growth-call/' }}
        secondaryCta={{ label: 'Get free performance audit', href: '/unlock-growth-audit/' }}
        anchors={[
          { label: 'Stacks', href: '#stacks' },
          { label: 'Principles', href: '#principles' },
          { label: 'Performance', href: '#performance' },
          { label: 'Portfolio', href: '#portfolio' },
          { label: 'Engagement', href: '#engagement' },
          { label: 'FAQ', href: '#faq' },
        ]}
        serviceName="website-development-design-services"
        serviceCategory="web"
      />

      <BuildReality />
      <StackTypes id="stacks" />
      <BuildPrinciples id="principles" />
      <SectionRail tone="paper" size="sm">
        <CrossServiceCallout
          eyebrow="What we don't include in a build"
          intro={<>Three things that look like part of a website project but ship better as separate services:</>}
          links={[
            { service: 'catalog', note: 'Product descriptions, FAQs, schema on every SKU. We build the platform; Catalog AI handles per-product content at scale' },
            { service: 'editorial', note: 'Pillar pages, category authority content. Editorial Authority writes the content; the build provides the platform' },
            { service: 'search', note: 'The build ships AIO-ready. AI Search & GEO keeps it current as the search surface evolves post-launch' },
          ]}
        />
      </SectionRail>
      <PerformanceScorecard id="performance" />
      <PortfolioGrid id="portfolio" />
      <WebDevPricing id="engagement" />
      <FAQ
        id="faq"
        eyebrow="Build FAQ"
        headline={<>Questions <span className="text-ink-500">before you commit to a rebuild.</span></>}
        kicker="Platform picks, migration timelines, performance commitments — the honest answers we give on first calls."
        items={WEBDEV_FAQ}
      />
      <FinalCTARail />
    </>
  )
}
