import type { Metadata } from 'next'

import { FAQ, type QA } from '@/components/sections/FAQ'
import { AuditCTA } from '@/components/sections/revenue-engine/AuditCTA'
import { EngineVsFuel } from '@/components/sections/revenue-engine/EngineVsFuel'
import { FiveSteps, type FiveStep } from '@/components/sections/revenue-engine/FiveSteps'
import { Guarantee } from '@/components/sections/revenue-engine/Guarantee'
import { HowItWorks } from '@/components/sections/revenue-engine/HowItWorks'
import { RevenueHero } from '@/components/sections/revenue-engine/RevenueHero'
import { RevenuePricing } from '@/components/sections/revenue-engine/RevenuePricing'
import { Seasonality } from '@/components/sections/revenue-engine/Seasonality'
import { TheLeak, type Leak } from '@/components/sections/revenue-engine/TheLeak'
import { TwoRevenueLines } from '@/components/sections/revenue-engine/TwoRevenueLines'
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

const HS_STEPS: FiveStep[] = [
  {
    n: '01',
    key: 'CAPTURE',
    what: 'A simple way for homeowners to get a quote or book a visit, storm and seasonal landing pages, and a tidied-up Google listing — all yours, running alongside your site.',
    metric: 'More visitors turn into calls and quote requests',
  },
  {
    n: '02',
    key: 'RESPOND',
    what: 'Every call gets answered, 24/7 — even mid-storm when the crew is on a roof. Missed calls get an instant text back, every form gets a reply in under a minute, and a caller can always reach a human.',
    metric: 'No lead lost to a missed call or slow reply',
  },
  {
    n: '03',
    key: 'BOOK',
    what: 'Estimates get qualified and booked straight to your calendar, with reminders so they show. Every call is recorded and sorted, so nothing slips.',
    metric: 'More leads become booked, kept jobs',
  },
  {
    n: '04',
    key: 'RECOVER',
    what: 'The quotes that went cold get chased automatically, past customers get a reason to call you back, and a steady stream of new reviews lifts you in local search.',
    metric: 'Revenue won back from quotes already chased',
  },
  {
    n: '05',
    key: 'PROVE',
    what: 'A dispute-proof log of every call, and a monthly dashboard that shows what this system brought in, separately from your ads.',
    metric: 'What the system earned, against the fee',
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
        eyebrow="Revenue Engine · Home services"
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
        anchors={[
          { label: 'The leak', href: '#leak' },
          { label: 'How it works', href: '#how' },
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

      {/* 3 — THE MECHANISM */}
      <EngineVsFuel id="engine" />

      {/* 4 — THE PLAN */}
      <HowItWorks id="how" />
      <FiveSteps
        id="system"
        headline={
          <>
            The whole machine,{' '}
            <span className="text-ink-500">applied to your trade.</span>
          </>
        }
        intro={
          <>
            I install and run all of it &mdash; the 90-day setup is on me. Here
            is what each piece looks like for a contractor.
          </>
        }
        steps={HS_STEPS}
      />

      {/* 5 — PROOF */}
      <TwoRevenueLines id="prove" />

      {/* Vertical-specific reassurance (after proof, before price): storm surge */}
      <Seasonality id="seasonality" />

      {/* 6 — OFFER + GUARANTEE */}
      <RevenuePricing id="pricing" />
      <Guarantee id="guarantee" />

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
