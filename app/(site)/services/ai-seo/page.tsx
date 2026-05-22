import type { Metadata } from 'next'

import { EngagementModel } from '@/components/sections/EngagementModel'
import { Evidence } from '@/components/sections/Evidence'
import { FAQ, type QA } from '@/components/sections/FAQ'
import { FinalCTARail } from '@/components/sections/FinalCTARail'
import { FrameworkTimeline } from '@/components/sections/FrameworkTimeline'
import { ServicesTabs } from '@/components/sections/ServicesTabs'
import { Comparison } from '@/components/sections/services/Comparison'
import { MarketReality } from '@/components/sections/services/MarketReality'
import { ProcessTimeline } from '@/components/sections/services/ProcessTimeline'
import { ServicesHero } from '@/components/sections/services/ServicesHero'
import { JsonLd } from '@/components/seo/JsonLd'
import { serviceSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'AI Search & Generative-Engine Optimization (GEO)',
  description:
    'Engineer your store to be cited inside Google AI Overviews, ChatGPT, and Perplexity. Schema depth, citation engineering, AI-readable content, and AIO-aware PPC — one operator-led team. Published prices, written 24-hour proposals, 90-day exit.',
  alternates: { canonical: 'https://salesolution.net/services/ai-seo/' },
}

const SERVICES_FAQ: QA[] = [
  {
    q: 'How is this different from a typical SEO agency?',
    a: (
      <>
        <p>
          One operator owns strategy, schema, content, and reporting &mdash;
          not four sub-agencies stitched together. Vertical specialisation
          (industrial / technical-distribution e&#8209;commerce, not generalist).
          Published prices, 24-hour SOWs, 90-day exit.
        </p>
      </>
    ),
  },
  {
    q: 'What\'s the difference between GEO and SEO?',
    a: (
      <>
        <p>
          SEO targets traditional ranking. GEO (Generative Engine
          Optimization) targets <em className="not-italic font-semibold text-ink-900">being the source AI engines pull from</em> when
          they generate an answer. AIO citations, ChatGPT/Perplexity
          mentions, AI-shopping retrieval are GEO surfaces.
        </p>
        <p className="mt-3">
          We do both because revenue flows through both. Most engagements
          weight 60% GEO / 40% SEO in 2026.
        </p>
      </>
    ),
  },
  {
    q: 'Why is our organic traffic declining despite ranking well?',
    a: (
      <>
        <p>
          AI Overviews answer queries inside the SERP, eating the click
          before users reach you. Rankings can hold while sessions drop
          20&ndash;40%. The fix is structured-data depth, citation
          engineering, and content shaped for AI parsing.
        </p>
      </>
    ),
  },
  {
    q: 'Do you work with Shopify, WooCommerce, headless?',
    a: (
      <>
        <p>
          Yes to all three. Our hydraulics / industrial clients run mostly
          on WooCommerce or headless setups; DTC-adjacent clients are
          largely Shopify. The framework adapts to the stack &mdash; the
          schema layer is where we spend our work.
        </p>
      </>
    ),
  },
  {
    q: 'How do you measure success?',
    a: (
      <>
        <p>
          Revenue and ARR are the primary KPIs. Leading indicators we
          report monthly: AIO citation coverage on target queries,
          citation-share vs competitors, schema completeness rate, and
          qualified-lead inflows segmented by intent.
        </p>
      </>
    ),
  },
  {
    q: 'Can we engage you for a one-off project?',
    a: (
      <>
        <p>
          Yes &mdash; the Sprint engagement ($12&ndash;24k, 4 weeks) is
          purpose-built for a single category overhaul. Smaller than that
          we don&rsquo;t offer; the setup cost doesn&rsquo;t amortise.
        </p>
      </>
    ),
  },
  {
    q: 'Is there a minimum company size?',
    a: (
      <>
        <p>
          We see the best results above $200k/month in e-commerce
          revenue, roughly $2.5M ARR. Below that, our pricing is hard to
          justify against simpler agencies &mdash; we&rsquo;ll tell you
          so on the first call.
        </p>
      </>
    ),
  },
  {
    q: 'What if we\'re not in hydraulics or industrial?',
    a: (
      <>
        <p>
          The playbook works for any specification-heavy e&#8209;commerce:
          electronics, contract manufacturing, fluid power, lab supply,
          fasteners, abrasives, industrial automation. If your buyers
          read a spec sheet before they purchase, the mechanics apply.
        </p>
      </>
    ),
  },
]

export default function AISEOServicePage() {
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: 'AI-Search & Generative-Engine Optimization',
          description:
            'GEO, technical SEO, content authority, channel diversification, and conversion data — delivered by one senior operator for industrial e-commerce.',
          category: 'Digital Marketing',
        })}
      />

      <ServicesHero
        eyebrow="Services / AI search · GEO"
        title="Be cited inside AI search,"
        titleAccent="not just ranked underneath."
        lede={
          <>
            We engineer your store to be the source generative engines pull
            from. Schema depth, citation engineering, AI-readable content,
            and AIO-aware PPC &mdash; one operator-led team, no agency layer.
          </>
        }
        primaryCta={{ label: 'Book a strategy call', href: '/book-growth-call/' }}
        secondaryCta={{ label: 'Skip to engagement options', href: '#engagement' }}
        anchors={[
          { label: 'Practice areas', href: '#practice-areas' },
          { label: 'Framework', href: '#framework' },
          { label: 'Comparison', href: '#comparison' },
          { label: 'Engagement', href: '#engagement' },
          { label: 'FAQ', href: '#faq' },
        ]}
        serviceName="ai-seo"
        serviceCategory="seo"
      />
      <MarketReality />
      <ServicesTabs id="practice-areas" />
      <FrameworkTimeline id="framework" />
      <Comparison id="comparison" />
      <EngagementModel id="engagement" />
      <ProcessTimeline />
      <Evidence />
      <FAQ
        id="faq"
        eyebrow="Services FAQ"
        headline={<>Questions <span className="text-ink-500">on the work itself.</span></>}
        kicker="Engagement specifics. Stack questions. The honest sizing thresholds."
        items={SERVICES_FAQ}
      />
      <FinalCTARail />
    </>
  )
}
