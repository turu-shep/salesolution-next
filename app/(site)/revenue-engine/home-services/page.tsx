import type { Metadata } from 'next'

import { FAQ, type QA } from '@/components/sections/FAQ'
import { AuditCTA } from '@/components/sections/revenue-engine/AuditCTA'
import { Guarantee } from '@/components/sections/revenue-engine/Guarantee'
import { PlanByPillar } from '@/components/sections/revenue-engine/PlanByPillar'
import { RevenueHero } from '@/components/sections/revenue-engine/RevenueHero'
import { RevenuePricing } from '@/components/sections/revenue-engine/RevenuePricing'
import { Seasonality } from '@/components/sections/revenue-engine/Seasonality'
import { TheLeak, type Leak } from '@/components/sections/revenue-engine/TheLeak'
import { TwoRevenueLines } from '@/components/sections/revenue-engine/TwoRevenueLines'
import { FlowBlock } from '@/components/sections/revenue-engine/flow-concepts/FlowBlock'
import { JsonLd } from '@/components/seo/JsonLd'
import { serviceSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Revenue Engine for Home Services · Roofing, HVAC, plumbing, electrical',
  description:
    'A done-for-you system for home-services contractors. It answers every call 24/7, books estimates, chases the quotes that go cold, and logs every storm-season lead — so the leads you pay for turn into booked jobs. Book a free Revenue Leak Audit.',
  alternates: { canonical: 'https://salesolution.net/revenue-engine/home-services/' },
}

const HS_LEAKS: Leak[] = [
  {
    n: '01',
    stat: 'As many as 1 in 3',
    label: 'calls go unanswered during the workday',
    body: 'The crew is on a roof and the office is one person. The caller dials the next contractor on the list, and the lead you paid for is gone.',
    source: null,
  },
  {
    n: '02',
    stat: '$80–$220',
    label: 'to buy a single qualified roofing lead',
    body: 'Competitive metros push past $300. Every call you miss is that much spent to make a phone ring that nobody picked up.',
    source: 'Getbiddable, 2026',
  },
  {
    n: '03',
    stat: 'Won, then lost',
    label: 'estimates that never get a second call',
    body: 'The quote goes out after the site visit and then goes quiet. The job was won and lost in the same week, sitting in your own CRM.',
    source: null,
  },
]

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
          src: '/artur-shepel.jpg',
          caption: 'I run every account myself.',
          specs: [
            { label: 'Setup', value: '90 days, on me' },
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

      {/* 2 — THE LEAK */}
      <TheLeak
        id="leak"
        eyebrow="The contractor's leak"
        headline={
          <>
            You paid for the lead.{' '}
            <span className="text-ink-500">Then nobody answered.</span>
          </>
        }
        intro={
          <>
            Home-services leads are expensive and time-sensitive. The job goes
            to whoever picks up first, and most days that isn&rsquo;t you.
          </>
        }
        leaks={HS_LEAKS}
        closer={<>Every one of these is money you already spent to make the phone ring.</>}
      />

      {/* 3 — THE FIX: "you've been sold pieces / I run the whole flow" */}
      <div id="flow">
        <FlowBlock />
      </div>

      {/* 4 — THE PLAN: the five steps grouped under Bring / Convert / Retain */}
      <PlanByPillar id="how" />

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
