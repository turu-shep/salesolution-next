import type { Metadata } from 'next'

import { FAQ, type QA } from '@/components/sections/FAQ'
import { FullGrowthComparison } from '@/components/sections/full-growth-ownership/FullGrowthComparison'
import { FullGrowthFinalCTA } from '@/components/sections/full-growth-ownership/FullGrowthFinalCTA'
import { FullGrowthIncluded } from '@/components/sections/full-growth-ownership/FullGrowthIncluded'
import { FullGrowthProblem } from '@/components/sections/full-growth-ownership/FullGrowthProblem'
import { FullGrowthShapes } from '@/components/sections/full-growth-ownership/FullGrowthShapes'
import { FullGrowthTimeline } from '@/components/sections/full-growth-ownership/FullGrowthTimeline'
import { ServicesHero } from '@/components/sections/services/ServicesHero'
import { JsonLd } from '@/components/seo/JsonLd'
import { CompositeBar } from '@/components/services/CompositeBar'
import { serviceSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Full Growth Ownership · Fractional growth lead + coordinated retainer',
  description:
    'One operator. One accountable owner. AI search, content, catalog, dev, and outbound run as one engagement. Two shapes: Fractional GTM Engineer from $20K/mo, or 4-in-1 Coordinated Retainer from $12K/mo. Written quote within 24 hours.',
  alternates: { canonical: 'https://salesolution.net/services/full-growth-ownership/' },
}

const FULL_GROWTH_FAQ: QA[] = [
  {
    q: "What's the actual difference between Shape A and Shape B?",
    a: (
      <>
        <p>
          Shape A means Artur is in your leadership meetings, setting
          growth strategy, owning execution decisions. You&rsquo;re
          effectively hiring him as a fractional growth leader. Pricing is
          flat by company size &mdash; you pay the same whether we run 2
          services or 5, because you&rsquo;re paying for his time and
          judgment.
        </p>
        <p className="mt-3">
          Shape B means our team executes coordinated work across the
          services you pick. You keep your strategic leadership; we
          replace your agency stack. Pricing scales by service count
          &mdash; more services means more execution work means higher
          monthly fee.
        </p>
        <p className="mt-3">
          If you have a strong marketing leader in-house and just need
          execution coordination, Shape B is better. If your growth
          function is missing strategic leadership, Shape A is better.
        </p>
      </>
    ),
  },
  {
    q: 'Can I start with one or two services and add more later?',
    a: (
      <>
        <p>
          Yes. Most Shape B engagements start with 2 services and grow to
          3&ndash;4 over the first 6 months. We&rsquo;d rather start
          narrow and earn the right to expand than over-commit upfront
          and underdeliver.
        </p>
        <p className="mt-3">
          Shape A engagements typically include scope expansion as a
          default &mdash; we adjust quarterly based on what&rsquo;s
          working.
        </p>
      </>
    ),
  },
  {
    q: "What happens if it's not working?",
    a: (
      <>
        <p>
          After the minimum term (6 months for Shape A, 3 months for
          Shape B), you can exit with 30 days&rsquo; notice. No clawback
          on work delivered.
        </p>
        <p className="mt-3">
          Before the minimum term &mdash; we have an honest conversation
          in month 2 or 3 about what&rsquo;s working. If something
          fundamental is broken (wrong fit, wrong scope, wrong stage),
          we&rsquo;d rather acknowledge it and adjust than ride out a bad
          engagement.
        </p>
      </>
    ),
  },
  {
    q: 'Why is the price what it is?',
    a: (
      <>
        <p>
          Shape A is priced against a full-time growth hire. A $200K base
          + benefits + equity + recruiting cost runs about $300K/year
          all-in. We&rsquo;re priced at $20&ndash;35K/mo
          ($240&ndash;420K/year) for a fractional version that ships
          faster, scales down on 30 days&rsquo; notice, and doesn&rsquo;t
          carry severance risk.
        </p>
        <p className="mt-3">
          Shape B is priced against the cost of running 5 separate agency
          retainers. If you&rsquo;re already spending $20K+/mo on
          disjointed vendors, you&rsquo;re paying coordination tax to
          yourself. We collect a portion of that tax in exchange for
          actually doing the coordination.
        </p>
      </>
    ),
  },
  {
    q: 'Who actually does the work?',
    a: (
      <>
        <p>
          Shape A: Artur owns strategy and execution decisions.
          Salesolution&rsquo;s operator team executes under his direction.
        </p>
        <p className="mt-3">
          Shape B: Salesolution&rsquo;s operator team executes against
          the retainer scope. Artur reviews monthly and steps in on
          strategic decisions. Day-to-day ownership is with the operator
          team.
        </p>
        <p className="mt-3">
          In both shapes, you have direct Slack access to the operators
          doing the work. No PMs in the middle.
        </p>
      </>
    ),
  },
  {
    q: 'Is there a minimum company size?',
    a: (
      <>
        <p>
          We see the best results at $5M+ ARR, or at multi-location and
          multi-site group scale (dental groups, roofing roll-ups,
          multi-location home services). Below that, the price point is
          hard to justify against simpler retainers &mdash; we&rsquo;ll
          tell you so on the first call.
        </p>
      </>
    ),
  },
  {
    q: 'Does this replace a CMO hire?',
    a: (
      <>
        <p>
          For most $5&ndash;25M companies, yes. The exception is
          companies preparing for an exit, raising significant capital,
          or building toward $50M+ ARR &mdash; at that stage, a full-time
          CMO with equity becomes the better answer.
        </p>
        <p className="mt-3">
          If you&rsquo;re in that zone, we&rsquo;ll usually recommend you
          hire and help you find the right person (we&rsquo;ve placed
          three CMOs from our network in the past 18 months at no fee).
        </p>
      </>
    ),
  },
  {
    q: 'What if I only need one service?',
    a: (
      <>
        <p>
          Then Full Growth Ownership isn&rsquo;t the right shape. Pick
          the service that fits, and engage on its Sprint or Retainer
          tier directly. We won&rsquo;t try to sell you the wrong product.
        </p>
      </>
    ),
  },
]

export default function FullGrowthOwnershipPage() {
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: 'Full Growth Ownership — Fractional GTM Engineer or Coordinated Retainer',
          slug: 'full-growth-ownership',
          description:
            'A premium-tier engagement that resolves into one of two shapes: a fractional GTM engineer embedded in leadership, or a coordinated retainer bundling 2–5 services (AI search, editorial content, catalog AI, website development, outbound email) under one accountable operator.',
          category: 'Digital Marketing',
        })}
      />

      <CompositeBar weight="hero" />

      <ServicesHero
        eyebrow="Services / Full Growth Ownership"
        title="One operator. One accountable owner."
        titleAccent="Your entire growth function."
        lede={
          <>
            When you&rsquo;ve outgrown one-off agency engagements but
            aren&rsquo;t ready to hire a $250K CMO, you need someone
            senior enough to run the function &mdash; strategy, vendors,
            execution, reporting &mdash; without the cost or commitment of
            a full-time hire.
          </>
        }
        primaryCta={{ label: 'Get a quote — 3 minutes', href: '/full-growth-quote/' }}
        secondaryCta={{ label: 'See the two shapes', href: '#shapes' }}
        anchors={[
          { label: 'The problem', href: '#problem' },
          { label: 'Two shapes', href: '#shapes' },
          { label: "What's included", href: '#included' },
          { label: 'Comparison', href: '#comparison' },
          { label: 'First 60 days', href: '#timeline' },
          { label: 'FAQ', href: '#faq' },
        ]}
      />

      <FullGrowthProblem id="problem" />
      <FullGrowthShapes id="shapes" />
      <FullGrowthIncluded id="included" />
      <FullGrowthComparison id="comparison" />
      <FullGrowthTimeline id="timeline" />

      <FAQ
        id="faq"
        eyebrow="Before you ask for a quote"
        headline={<>Questions <span className="text-ink-500">on the engagement itself.</span></>}
        kicker="Two shapes. Minimum-term mechanics. Where the price comes from. When this isn't the right fit."
        items={FULL_GROWTH_FAQ}
      />

      <FullGrowthFinalCTA />
    </>
  )
}
