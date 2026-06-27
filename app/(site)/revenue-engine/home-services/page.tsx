import type { Metadata } from 'next'

import { FAQ, type QA } from '@/components/sections/FAQ'
import { AuditCTA } from '@/components/sections/revenue-engine/AuditCTA'
import { Guarantee } from '@/components/sections/revenue-engine/Guarantee'
import { PlanByPillar } from '@/components/sections/revenue-engine/PlanByPillar'
import { RevenueHero } from '@/components/sections/revenue-engine/RevenueHero'
import { RevenuePricing } from '@/components/sections/revenue-engine/RevenuePricing'
import { Seasonality } from '@/components/sections/revenue-engine/Seasonality'
import { TwoRevenueLines } from '@/components/sections/revenue-engine/TwoRevenueLines'
import { FlowBlock } from '@/components/sections/revenue-engine/flow-concepts/FlowBlock'
import { Concept2Evidence } from '@/components/sections/revenue-engine/leak-concepts/Concept2Evidence'
import { Concept3Calculator } from '@/components/sections/revenue-engine/leak-concepts/Concept3Calculator'
import { Concept4BeforeAfter } from '@/components/sections/revenue-engine/leak-concepts/Concept4BeforeAfter'
import { LEAK_DATA } from '@/components/sections/revenue-engine/leak-concepts/data'
import { JsonLd } from '@/components/seo/JsonLd'
import { serviceSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Revenue Engine for Home Services · Roofing, HVAC, plumbing, electrical',
  description:
    'A done-for-you system for home-services contractors. It answers every call 24/7, books estimates, chases the quotes that go cold, and logs every storm-season lead — so the leads you pay for turn into booked jobs. Book a free Revenue Leak Audit.',
  alternates: { canonical: 'https://salesolution.net/revenue-engine/home-services/' },
}

const leak = LEAK_DATA['home-services']

const HS_FAQ: QA[] = [
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
        The full system installs over 90 days, but the first automations
        &mdash; call answering and missed-call text-back &mdash; are live
        within the first couple of weeks, before the next demand spike.
      </p>
    ),
  },
]

export default function HomeServicesRevenueEnginePage() {
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: 'Revenue Engine for Home Services',
          url: 'https://salesolution.net/revenue-engine/home-services/',
          description:
            'A done-for-you AI revenue system for home-services contractors (roofing, HVAC, plumbing, electrical): call answering, instant quotes, estimate recovery, and a dispute-proof lead log.',
          category: 'Marketing',
        })}
      />

      <div className="h-1.5 w-full bg-brand-600" aria-hidden />

      {/* 1 — HOOK */}
      <RevenueHero
        eyebrow={'For roofing, HVAC, plumbing & electrical'}
        title="Built for contractors who miss calls"
        titleAccent="because they're on a roof."
        lede={
          <>
            You&rsquo;re on a roof when the phone rings &mdash; and the lead you
            paid for dials the next contractor on the list. The estimate you
            drove out for goes quiet. Each one is a booked job you never see.
          </>
        }
        primaryCta={{ label: 'Book a Revenue Leak Audit', href: '#audit' }}
        founder={{
          name: 'Artur Shepel',
          src: '/artur-shepel-480.webp',
          caption: 'I run every account myself.',
          specs: [
            { label: 'Setup', value: '90 days, one-time fee' },
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

      {/* 3 — QUANTIFY YOUR LEAK */}
      <Concept3Calculator
        data={leak}
        header={{
          eyebrow: 'Your leak, in dollars',
          headlineA: 'Put a number on it.',
          headlineB: 'Your number, not mine.',
          intro: 'Three figures from your own week. The math is in the open — change them.',
          closer: '',
        }}
      />

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
      <RevenuePricing id="pricing" />

      {/* 7 — FAQ */}
      <FAQ
        id="faq"
        eyebrow="A few last questions"
        headline={
          <>
            Questions <span className="text-ink-500">before the audit.</span>
          </>
        }
        kicker="New website, lead exclusivity, your Google rep, time to start. Straight answers."
        items={HS_FAQ}
      />

      {/* 8 — FREE-AUDIT CLOSE */}
      <AuditCTA id="audit" />
    </>
  )
}
