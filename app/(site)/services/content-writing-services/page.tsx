import type { Metadata } from 'next'

import { FAQ, type QA } from '@/components/sections/FAQ'
import { FinalCTARail } from '@/components/sections/FinalCTARail'
import { ContentComparison } from '@/components/sections/content-writing/ContentComparison'
import { ContentEngagement } from '@/components/sections/content-writing/ContentEngagement'
import { ContentEvidence } from '@/components/sections/content-writing/ContentEvidence'
import { ContentMarketReality } from '@/components/sections/content-writing/ContentMarketReality'
import { ContentProcess } from '@/components/sections/content-writing/ContentProcess'
import { ContentTypes } from '@/components/sections/content-writing/ContentTypes'
import { ServicesHero } from '@/components/sections/services/ServicesHero'
import { JsonLd } from '@/components/seo/JsonLd'
import { serviceSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Content Writing Services for B2B & E-commerce',
  description:
    '1,600+ articles a year for technical e-commerce brands. SEO-led, conversion-tuned, written by senior subject-matter writers — no outsourcing.',
  alternates: { canonical: 'https://salesolution.net/services/content-writing-services/' },
}

const CONTENT_FAQ: QA[] = [
  {
    q: 'Do you write on topics we provide, or do you research them?',
    a: (
      <>
        <p>
          Both, and the research is the work. Every monthly cycle starts
          with the editor proposing 15&ndash;20 candidate topics ranked by
          AIO citation gap, commercial intent, and competitor weakness. You
          greenlight the ones to ship.
        </p>
      </>
    ),
  },
  {
    q: 'Is the content SEO-optimised by default?',
    a: (
      <>
        <p>
          Every piece ships with target query, search-intent fit, internal-linking plan, FAQ block, and{' '}
          <em className="not-italic font-semibold text-ink-900">
            Article / HowTo / FAQ schema
          </em>{' '}
          on the page. We don&rsquo;t treat SEO as an upsell, and we don&rsquo;t ship plain text.
        </p>
        <p className="mt-3">
          GEO engineering &mdash; AIO scannability, citation-grade source
          patterns, semantic completeness &mdash; sits on top of the SEO
          layer on every retainer piece.
        </p>
      </>
    ),
  },
  {
    q: 'Do you use AI to write the drafts?',
    a: (
      <>
        <p>
          No. Senior subject-matter writers draft every piece off the brief
          and the primary sources. We use AI for citation tracking,
          competitive scans, and outline pressure-testing &mdash; never for
          the draft itself.
        </p>
        <p className="mt-3">
          78% of LLM-drafted content in our citation tracker fails to
          earn a single AIO citation in 90 days. We&rsquo;re not interested
          in shipping content that doesn&rsquo;t earn its keep.
        </p>
      </>
    ),
  },
  {
    q: 'How quickly can you turn around a piece?',
    a: (
      <>
        <p>
          Standard turnaround is 10 working days from brief to publish-ready.
          That includes the outline gate, draft, edit, and the schema /
          on-page layer. Faster than 10 days we can do on the Pillar Pack
          for one-off urgent pieces, but the citation work suffers.
        </p>
      </>
    ),
  },
  {
    q: 'Do you offer white-label content for agencies?',
    a: (
      <>
        <p>
          Yes &mdash; about 15% of our retainer book is white-label for
          agencies who don&rsquo;t have a senior B2B editor on staff. You
          own the client relationship; we own the editorial pipeline.
          Volume-tier discounts kick in above 12 pieces / month.
        </p>
      </>
    ),
  },
  {
    q: 'What verticals do you actually know?',
    a: (
      <>
        <p>
          Industrial e-commerce (hydraulics, fluid power, pneumatics,
          industrial automation, MRO), technical B2B SaaS, contract
          manufacturing, lab supply, electronics distribution, fasteners,
          abrasives. If buyers read a spec sheet before they purchase, our
          writers know how to talk to them.
        </p>
        <p className="mt-3">
          Outside those verticals we&rsquo;ll tell you on the first call
          &mdash; we&rsquo;d rather pass than fake the depth.
        </p>
      </>
    ),
  },
  {
    q: 'Why are you not the cheapest option?',
    a: (
      <>
        <p>
          We pay senior writers and editors at US / UK rates, not offshore
          generalist rates. We include schema, on-page work, and 90-day
          citation tracking on every piece. We don&rsquo;t resell anyone
          else&rsquo;s drafts.
        </p>
        <p className="mt-3">
          If your benchmark is $99-per-article content, we&rsquo;re not the
          fit and we&rsquo;ll say so. Where we win is the ratio of cited
          pieces to total spend &mdash; not the absolute floor.
        </p>
      </>
    ),
  },
  {
    q: 'Can we trial before committing to a retainer?',
    a: (
      <>
        <p>
          The Pillar Pack ($6&ndash;14k, 6 weeks) is purpose-built for that
          &mdash; one category, one pillar plus six clusters, the full
          schema and citation layer. By week 4 you have enough citation
          data to decide whether to retain or walk.
        </p>
      </>
    ),
  },
]

export default function ContentWritingServicePage() {
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: 'Content Writing Services',
          slug: 'content-writing-services',
          description:
            'Senior-writer content engineering for industrial e-commerce and technical B2B: pillar pages, spec-heavy product copy, engineering Q&A hubs, and editorial trade-press content — all built for AI-search citation.',
          category: 'Content Marketing',
        })}
      />

      <ServicesHero
        eyebrow="Services / Content writing"
        title="Content engineered to be cited,"
        titleAccent="not just published."
        lede={
          <>
            Senior subject-matter writers turn your engineering depth into
            pillar pages, spec-heavy product copy, and answer hubs that
            AI&nbsp;Overviews and ChatGPT cite ahead of the manufacturers.
            No offshoring, no LLM ghostwriting, no upsell on schema.
          </>
        }
        primaryCta={{ label: 'Book a strategy call', href: '/book-growth-call/' }}
        secondaryCta={{ label: 'Skip to packages', href: '#engagement' }}
        anchors={[
          { label: 'What we write', href: '#formats' },
          { label: 'Process', href: '#process' },
          { label: 'Comparison', href: '#comparison' },
          { label: 'Engagement', href: '#engagement' },
          { label: 'FAQ', href: '#faq' },
        ]}
      />
      <ContentMarketReality />
      <ContentTypes id="formats" />
      <ContentProcess id="process" />
      <ContentComparison id="comparison" />
      <ContentEngagement id="engagement" />
      <ContentEvidence id="evidence" />
      <FAQ
        id="faq"
        eyebrow="Content FAQ"
        headline={
          <>
            Questions <span className="text-ink-500">about the work itself.</span>
          </>
        }
        kicker="Pulled from real onboarding calls. No marketing softening."
        items={CONTENT_FAQ}
      />
      <FinalCTARail />
    </>
  )
}
