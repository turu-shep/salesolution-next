import type { Metadata } from 'next'

import { FAQ, type QA } from '@/components/sections/FAQ'
import { AuditCTA } from '@/components/sections/revenue-engine/AuditCTA'
import { Guarantee } from '@/components/sections/revenue-engine/Guarantee'
import { PlanByPillar } from '@/components/sections/revenue-engine/PlanByPillar'
import { RevenueHero } from '@/components/sections/revenue-engine/RevenueHero'
import { RevenuePricing } from '@/components/sections/revenue-engine/RevenuePricing'
import { Seasonality } from '@/components/sections/revenue-engine/Seasonality'
import { TwoRevenueLines } from '@/components/sections/revenue-engine/TwoRevenueLines'
import { WholeFlowLeak } from '@/components/sections/revenue-engine/WholeFlowLeak'
import { FlowBlock } from '@/components/sections/revenue-engine/flow-concepts/FlowBlock'
import { Concept2Evidence } from '@/components/sections/revenue-engine/leak-concepts/Concept2Evidence'
import { Concept4BeforeAfter } from '@/components/sections/revenue-engine/leak-concepts/Concept4BeforeAfter'
import { LEAK_DATA } from '@/components/sections/revenue-engine/leak-concepts/data'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbListSchema, serviceSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Revenue Engine for Home Services · Roofing, HVAC, plumbing, electrical',
  description:
    'A done-for-you system for home-services contractors. It answers every call 24/7, books estimates, chases the quotes that go cold, and logs every storm-season lead — so the leads you pay for turn into booked jobs. Book a free Revenue Leak Audit.',
  alternates: { canonical: 'https://salesolution.net/industries/home-services/' },
}

const leak = LEAK_DATA['home-services']

const HS_FAQ: QA[] = [
  {
    q: '“$30K? The other guys charge $500 a month.”',
    a: (
      <p>
        They do. Price their stack: an answering service, a review tool, a
        missed-call app, call tracking, and a CRM run $850 to $1,900 a month
        &mdash; $10K to $23K a year &mdash; with you as the unpaid integrator.
        Nobody in that stack records and sorts every call. Nobody splits system
        revenue from ad revenue. Nobody&rsquo;s name is on a 120-day payback
        guarantee.
        $500 a month rents you a tool. The install builds you an asset a buyer
        can see working when they look at your books.
      </p>
    ),
  },
  {
    q: '“I can’t float $30K right now.”',
    a: (
      <p>
        You don&rsquo;t hand me $30K on day one. Half at signing, a quarter
        when your dashboard goes live around day 30, the last quarter at the
        day-60 punch-list walkthrough. You&rsquo;re never more money out than
        installed system. Prefer one payment? Take 5% off. Then run the
        calculator above with your own numbers: at your average job, the install
        is the first few jobs the system recovers. What you&rsquo;re floating
        right now is the leak.
      </p>
    ),
  },
  {
    q: '“How do I know ‘revenue it brings back’ isn’t marketing math?”',
    a: (
      <p>
        Every call is recorded, transcribed, and sorted: booked, lost,
        recovered. The dashboard splits what your ads drove from what the system
        saved &mdash; and it&rsquo;s your dashboard. Fire me and you keep it,
        with every number in it. The audit works the same way: your call log,
        your quote list, your Google profile, in writing, yours to keep.
      </p>
    ),
  },
  {
    q: 'Do I need a new website?',
    a: (
      <p>
        No. The quote form and landing pages run alongside your existing
        site. I don&rsquo;t touch your domain or make you rebuild &mdash; the
        engine bolts on to what you already have.
      </p>
    ),
  },
  {
    q: 'Are these leads exclusive to me?',
    a: (
      <p>
        Yes. This is not a shared-lead service. It is your own demand, your
        own ad account, your own pipeline. I never resell a lead to another
        contractor.
      </p>
    ),
  },
  {
    q: 'What about the Google rep who calls me every week?',
    a: (
      <p>
        Keep them if you want. I run the engine that converts the leads, not
        your ad buying. Your spend stays in your account, at cost, with zero
        markup &mdash; the system just makes that spend convert better.
      </p>
    ),
  },
  {
    q: 'How fast can we start?',
    a: (
      <p>
        Fast. Call answering and missed-call text-back go live in the first
        couple of weeks, before the next storm. The full install runs against a
        written punch-list we walk together on day 60, so every piece has a date
        on it. Your dashboard goes live around day 30. Day 120, counted from the
        day you sign, is when the report settles the guarantee.
      </p>
    ),
  },
]

export default function HomeServicesPillarPage() {
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: 'Revenue Engine for Home Services',
          url: 'https://salesolution.net/industries/home-services/',
          description:
            'A done-for-you AI revenue system for home-services contractors (roofing, HVAC, plumbing, electrical): call answering, instant quotes, estimate recovery, and a dispute-proof lead log.',
          category: 'Marketing',
        })}
      />
      <JsonLd
        data={breadcrumbListSchema([
          { name: 'Home', url: 'https://salesolution.net/' },
          { name: 'Industries', url: 'https://salesolution.net/industries/' },
          { name: 'Home services', url: 'https://salesolution.net/industries/home-services/' },
        ])}
      />

      <div className="h-1.5 w-full bg-brand-600" aria-hidden />

      {/* 1 — HOOK */}
      <RevenueHero
        eyebrow={'For roofing, HVAC, plumbing & electrical'}
        title="You drove out, measured the roof, sent the quote."
        titleAccent="Then nobody chased it."
        lede={
          <>
            The estimate you spent half a day on dies in a text thread. The call
            that would&rsquo;ve booked the next one rings while you&rsquo;re on a
            ladder. I run the system that catches both, and I prove what it paid
            you back.
          </>
        }
        primaryCta={{ label: 'Book a Revenue Leak Audit', href: '#audit' }}
        founder={{
          name: 'Artur Shepel',
          src: '/artur-shepel-480.webp',
          caption: 'I run every account myself.',
          specs: [
            { label: 'Install', value: 'by day 60, one-time fee' },
            { label: 'Minimum', value: '3 months' },
            { label: 'Lock-in', value: 'none' },
          ],
        }}
        anchors={[
          { label: 'The leak', href: '#leak' },
          { label: 'The plan', href: '#how' },
          { label: 'Storm season', href: '#seasonality' },
          { label: 'Pricing', href: '#pricing' },
          { label: 'FAQ', href: '#faq' },
        ]}
      />

      {/* 2 — THE LEAK: three places you lose the job */}
      <div id="leak">
        <Concept2Evidence
          data={leak}
          header={{
            eyebrow: "The contractor's leak",
            headlineA: 'Three places you lose the job.',
            headlineB: 'Most contractors only fix one.',
            intro:
              'Before they call, when they call, and after the visit. The leak is bigger than the missed phone.',
            closer: 'Every one of these is a job you already had the right to win.',
          }}
        />
      </div>

      {/* 3 — THE WHOLE-FLOW LEAK: the contractor's own numbers across all three
          pillars, then what the engine recovers + the D12 install-frame payback.
          book-jobs motion (default) auto-renders the $30K anchor + the guarantee
          hand-off into the <Guarantee> mounted below. DEFAULT_PRESETS already
          default to the four trades with per-trade payback units. */}
      <WholeFlowLeak avgLabel="Your average job" />

      {/* 3 — THE FIX: "you've been sold pieces / I run the whole flow" */}
      <div id="flow">
        <FlowBlock />
      </div>

      {/* 4 — THE PLAN: the five steps grouped under Bring / Convert / Retain */}
      <PlanByPillar id="how" />

      {/* 4.5 — THE DIFFERENCE: same lead, two endings */}
      <Concept4BeforeAfter
        data={leak}
        header={{
          eyebrow: 'The difference',
          headlineA: 'Same lead.',
          headlineB: 'Two endings.',
          intro:
            'One contractor, one inbound lead. The only thing that changes is whether it gets answered.',
          closer: '',
        }}
      />

      {/* 5 — STORM SURGE (vertical reassurance, plan-adjacent) */}
      <Seasonality id="seasonality" />

      {/* 6 — HOW I REPORT IT (dark) — closer hands into the guarantee */}
      <TwoRevenueLines id="prove" />

      {/* 7 — GUARANTEE (dark, abutted to the report as one conviction field) */}
      <Guarantee id="guarantee" abut />

      {/* 8 — OFFER (the price, now that the risk is reversed) */}
      <RevenuePricing
        id="pricing"
        floorLine="Installs start at $30,000. The exact number comes from the audit — in writing, same day."
      />

      {/* 7 — FAQ */}
      <FAQ
        id="faq"
        eyebrow="A few last questions"
        headline={
          <>
            Questions before the audit.
          </>
        }
        kicker="The price gap, floating the install, proof you can trust, plus the basics. Straight answers."
        items={HS_FAQ}
      />

      {/* 8 — FREE-AUDIT CLOSE */}
      <AuditCTA id="audit" />
    </>
  )
}
