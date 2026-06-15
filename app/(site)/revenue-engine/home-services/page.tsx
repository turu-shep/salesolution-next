import type { Metadata } from 'next'

import { FAQ, type QA } from '@/components/sections/FAQ'
import { AuditCTA } from '@/components/sections/revenue-engine/AuditCTA'
import { EngineVsFuel } from '@/components/sections/revenue-engine/EngineVsFuel'
import { FiveSteps, type FiveStep } from '@/components/sections/revenue-engine/FiveSteps'
import { Guarantee } from '@/components/sections/revenue-engine/Guarantee'
import { RevenueRateCard, type StateRate } from '@/components/sections/revenue-engine/RevenueRateCard'
import { Seasonality } from '@/components/sections/revenue-engine/Seasonality'
import { TheLeak, type Leak } from '@/components/sections/revenue-engine/TheLeak'
import { ServicesHero } from '@/components/sections/services/ServicesHero'
import { JsonLd } from '@/components/seo/JsonLd'
import { serviceSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Revenue Engine for Home Services · Roofing, HVAC, plumbing, electrical',
  description:
    'A done-for-you AI revenue system for home-services contractors. Answers every call 24/7, books estimates, chases cold quotes, and logs every storm-season lead — so the leads you pay for turn into booked jobs. Published Florida and California pricing.',
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
    what: 'An instant quote widget, storm and seasonal landing pages, and a Google Business Profile overhaul — conversion assets you own.',
    metric: 'Conversion rate',
  },
  {
    n: '02',
    key: 'RESPOND',
    what: 'An AI receptionist answers every call 24/7, texts back missed calls, and replies to every form fill in under 60 seconds — even mid-storm.',
    metric: 'Answer rate · after-hours bookings',
  },
  {
    n: '03',
    key: 'BOOK',
    what: 'AI qualification books estimates straight to the calendar with reminder sequences. Every call recorded, transcribed, and classified.',
    metric: 'Lead-to-appointment rate · show rate',
  },
  {
    n: '04',
    key: 'RECOVER',
    what: 'Estimate-recovery sequences chase every quote that went cold, plus dormant-customer reactivation and a review engine that feeds the map pack.',
    metric: 'Recovered revenue from cold estimates',
  },
  {
    n: '05',
    key: 'PROVE',
    what: 'A dispute-proof lead log of every call, and an attribution dashboard that splits system-driven from media-driven revenue.',
    metric: 'System-attributed revenue vs. fee',
  },
]

const HS_RATES: StateRate[] = [
  { name: 'Florida', systemMonthly: '$2,997', setup: '$2,500 setup', mediaMonthly: '+$997/mo' },
  { name: 'California', systemMonthly: '$3,997', setup: '$3,000 setup', mediaMonthly: '+$1,497/mo' },
]

const HS_FAQ: QA[] = [
  {
    q: 'Do I need a new website?',
    a: (
      <p>
        No. The conversion pages and quote widget run alongside your existing
        site. We do not touch your domain or make you rebuild — the engine
        bolts on to what you already have.
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
    q: 'Will the AI sound robotic to my customers?',
    a: (
      <p>
        A caller can always reach a human. The AI handles the calls you are
        missing today &mdash; after hours, during the rush, mid-storm. We
        tune the scripts against real call recordings every week.
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

      <ServicesHero
        eyebrow="Revenue Engine · Home services"
        title="Built for contractors who miss calls"
        titleAccent="because they're on a roof."
        lede={
          <>
            A done-for-you AI revenue system for roofing, HVAC, plumbing, and
            electrical. It answers every call 24/7, books estimates, chases
            the quotes that went cold, and logs every storm-season lead
            &mdash; so the leads you pay for turn into booked jobs.
          </>
        }
        primaryCta={{ label: 'Book a Revenue Leak Audit', href: '#audit' }}
        secondaryCta={{ label: 'See pricing', href: '#pricing' }}
        anchors={[
          { label: 'The leak', href: '#leak' },
          { label: 'The system', href: '#system' },
          { label: 'Seasonality', href: '#seasonality' },
          { label: 'Pricing', href: '#pricing' },
          { label: 'FAQ', href: '#faq' },
        ]}
      />

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
            Home-services leads are expensive and time-sensitive. The job
            goes to whoever picks up first &mdash; and you are on a roof.
          </>
        }
        leaks={HS_LEAKS}
        closer={<>Every one of these is money you already spent to make the phone ring.</>}
      />

      <EngineVsFuel id="engine" />

      <FiveSteps
        id="system"
        headline={
          <>
            The 5-step engine,{' '}
            <span className="text-ink-500">applied to your trade.</span>
          </>
        }
        intro={
          <>
            Same engine as everywhere. Here is what each step looks like for a
            contractor.
          </>
        }
        steps={HS_STEPS}
      />

      <Seasonality id="seasonality" />

      <RevenueRateCard
        id="pricing"
        states={HS_RATES}
        intro={
          <>
            Published Florida and California rates for home services. No
            discovery-call pricing games, no annual lock-in.
          </>
        }
      />

      <Guarantee id="guarantee" />

      <FAQ
        id="faq"
        eyebrow="Home services FAQ"
        headline={
          <>
            Questions <span className="text-ink-500">before the audit.</span>
          </>
        }
        kicker="New website, lead exclusivity, your Google rep, AI scripts, time to start. Straight answers."
        items={HS_FAQ}
      />

      <AuditCTA id="audit" />
    </>
  )
}
