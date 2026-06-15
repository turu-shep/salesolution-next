import type { Metadata } from 'next'

import { FAQ, type QA } from '@/components/sections/FAQ'
import { AuditCTA } from '@/components/sections/revenue-engine/AuditCTA'
import { Compliance } from '@/components/sections/revenue-engine/Compliance'
import { EngineVsFuel } from '@/components/sections/revenue-engine/EngineVsFuel'
import { FiveSteps, type FiveStep } from '@/components/sections/revenue-engine/FiveSteps'
import { Guarantee } from '@/components/sections/revenue-engine/Guarantee'
import { RevenueRateCard, type StateRate } from '@/components/sections/revenue-engine/RevenueRateCard'
import { TheLeak, type Leak } from '@/components/sections/revenue-engine/TheLeak'
import { ServicesHero } from '@/components/sections/services/ServicesHero'
import { JsonLd } from '@/components/seo/JsonLd'
import { serviceSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Revenue Engine for Dental Practices · Answer, book, recover',
  description:
    'A HIPAA-compliant AI revenue system for dental practices. Answers calls during chair time, books new patients, follows up on treatment plans and overdue recall, and scores your front desk — proven in a dashboard. Published Florida and California pricing.',
  alternates: { canonical: 'https://salesolution.net/revenue-engine/dentists/' },
}

const DENTAL_LEAKS: Leak[] = [
  {
    n: '01',
    stat: 'As many as 1 in 3',
    label: 'calls go unanswered during chair time',
    body: 'The front desk is with a patient and the phone keeps ringing. A new-patient call that hits voicemail usually books somewhere else.',
    source: null,
  },
  {
    n: '02',
    stat: '47 hours',
    label: 'industry-average lead response time',
    body: 'A new-patient inquiry that waits two days has already chosen another practice. Speed to the first reply is most of the decision.',
    source: 'LeadSync, 2026',
  },
  {
    n: '03',
    stat: 'A large share',
    label: 'of treatment plans go unaccepted and unfollowed',
    body: 'The plan is presented once, the patient says they will think about it, and no one circles back. Overdue recall slips the same way.',
    source: null,
  },
]

const DENTAL_STEPS: FiveStep[] = [
  {
    n: '01',
    key: 'CAPTURE',
    what: 'Financing-framed service pages that present a monthly payment instead of a sticker price, online booking, and a Google Business Profile overhaul.',
    metric: 'Conversion rate',
  },
  {
    n: '02',
    key: 'RESPOND',
    what: 'An AI receptionist answers every call 24/7, texts back missed calls, and replies to new-patient inquiries in under 60 seconds.',
    metric: 'Answer rate · after-hours bookings',
  },
  {
    n: '03',
    key: 'BOOK',
    what: 'AI qualification books appointments straight to the calendar with reminder sequences. Every call recorded, transcribed, and classified.',
    metric: 'Lead-to-appointment rate · show rate',
  },
  {
    n: '04',
    key: 'RECOVER',
    what: 'Treatment-plan and overdue-recall follow-up, dormant-patient reactivation, and a review engine that feeds the map pack.',
    metric: 'Recovered revenue from unaccepted plans',
  },
  {
    n: '05',
    key: 'PROVE',
    what: 'Monthly front-desk conversion scoring and an attribution dashboard that splits system-driven from media-driven revenue.',
    metric: 'System-attributed revenue vs. fee',
  },
]

const DENTAL_RATES: StateRate[] = [
  { name: 'Florida', systemMonthly: '$3,997', setup: '$3,000 setup', mediaMonthly: '+$997/mo' },
  { name: 'California', systemMonthly: '$4,997', setup: '$3,500 setup', mediaMonthly: '+$1,497/mo' },
]

const DENTAL_FAQ: QA[] = [
  {
    q: 'Will this replace my front desk?',
    a: (
      <p>
        No. It answers what your front desk physically cannot &mdash; the
        calls that come in during chair time, after hours, and at lunch. Your
        team handles the patients in front of them; the engine catches
        everyone else.
      </p>
    ),
  },
  {
    q: 'Does it integrate with my practice-management software?',
    a: (
      <p>
        Calendar-level booking first, so you are live quickly. Deeper PMS
        integration (Dentrix, Open Dental, Eaglesoft, and similar) is scoped
        during the install based on what your practice runs.
      </p>
    ),
  },
  {
    q: 'Is patient data handled safely?',
    a: (
      <p>
        Yes. Every tool that touches patient information runs under a signed
        BAA, call recordings carry the required disclosures, and patient data
        stays in your systems. The compliance section above has the detail.
      </p>
    ),
  },
  {
    q: 'How does this fit my marketing budget?',
    a: (
      <p>
        Practices are commonly advised to invest 5&ndash;8% of gross revenue
        in marketing. The point of the engine is to make that spend convert
        &mdash; recovered calls and treatment-plan follow-up are revenue you
        already paid to generate.
      </p>
    ),
  },
  {
    q: 'How fast can we start?',
    a: (
      <p>
        The full system installs over 90 days, but call answering and
        missed-call text-back are live within the first couple of weeks.
      </p>
    ),
  },
]

export default function DentistsRevenueEnginePage() {
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: 'Revenue Engine for Dental Practices',
          url: 'https://salesolution.net/revenue-engine/dentists/',
          description:
            'A HIPAA-compliant AI revenue system for dental practices: call answering, online booking, treatment-plan and recall follow-up, front-desk scoring, and attribution.',
          category: 'Marketing',
        })}
      />

      <div className="h-1.5 w-full bg-brand-600" aria-hidden />

      <ServicesHero
        eyebrow="Revenue Engine · Dental"
        title="Your front desk is the most"
        titleAccent="expensive channel you don't measure."
        lede={
          <>
            A HIPAA-compliant AI revenue system for dental practices. It
            answers calls during chair time, books new patients, follows up
            on treatment plans and overdue recall, and scores your front desk
            &mdash; then proves the revenue in a dashboard.
          </>
        }
        primaryCta={{ label: 'Book a Revenue Leak Audit', href: '#audit' }}
        secondaryCta={{ label: 'See pricing', href: '#pricing' }}
        anchors={[
          { label: 'The leak', href: '#leak' },
          { label: 'The system', href: '#system' },
          { label: 'Compliance', href: '#compliance' },
          { label: 'Pricing', href: '#pricing' },
          { label: 'FAQ', href: '#faq' },
        ]}
      />

      <TheLeak
        id="leak"
        eyebrow="The practice's leak"
        headline={
          <>
            Your busiest hours{' '}
            <span className="text-ink-500">are your leakiest.</span>
          </>
        }
        intro={
          <>
            New patients call while your front desk is with someone else, and
            presented treatment plans go quiet. The revenue leaks before
            anyone notices.
          </>
        }
        leaks={DENTAL_LEAKS}
        closer={<>Every one of these is revenue you already earned the right to.</>}
      />

      <EngineVsFuel id="engine" />

      <FiveSteps
        id="system"
        headline={
          <>
            The 5-step engine,{' '}
            <span className="text-ink-500">applied to your practice.</span>
          </>
        }
        intro={
          <>
            Same engine as everywhere. Here is what each step looks like
            inside a dental practice.
          </>
        }
        steps={DENTAL_STEPS}
      />

      <Compliance id="compliance" />

      <RevenueRateCard
        id="pricing"
        states={DENTAL_RATES}
        intro={
          <>
            Published Florida and California rates for dental practices. No
            discovery-call pricing games, no annual lock-in.
          </>
        }
      />

      <Guarantee id="guarantee" />

      <FAQ
        id="faq"
        eyebrow="Dental FAQ"
        headline={
          <>
            Questions <span className="text-ink-500">before the audit.</span>
          </>
        }
        kicker="Front desk, PMS integration, patient data, budget, time to start. Straight answers."
        items={DENTAL_FAQ}
      />

      <AuditCTA id="audit" />
    </>
  )
}
