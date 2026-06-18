import type { Metadata } from 'next'

import { FAQ, type QA } from '@/components/sections/FAQ'
import { AuditCTA } from '@/components/sections/revenue-engine/AuditCTA'
import { Compliance } from '@/components/sections/revenue-engine/Compliance'
import { EngineVsFuel } from '@/components/sections/revenue-engine/EngineVsFuel'
import { FiveSteps, type FiveStep } from '@/components/sections/revenue-engine/FiveSteps'
import { Guarantee } from '@/components/sections/revenue-engine/Guarantee'
import { HowItWorks } from '@/components/sections/revenue-engine/HowItWorks'
import { RevenueHero } from '@/components/sections/revenue-engine/RevenueHero'
import { RevenuePricing } from '@/components/sections/revenue-engine/RevenuePricing'
import { TheLeak, type Leak } from '@/components/sections/revenue-engine/TheLeak'
import { TwoRevenueLines } from '@/components/sections/revenue-engine/TwoRevenueLines'
import { JsonLd } from '@/components/seo/JsonLd'
import { serviceSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Revenue Engine for Dental Practices · Answer, book, recover',
  description:
    'A HIPAA-compliant system for dental practices. It answers calls during chair time, books new patients, follows up on treatment plans and overdue recall, and scores your front desk — then proves the revenue. Book a free Revenue Leak Audit.',
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
    what: 'Service pages that show a monthly payment instead of a sticker price, online booking, and a tidied-up Google listing — all yours.',
    metric: 'More visitors turn into booked new patients',
  },
  {
    n: '02',
    key: 'RESPOND',
    what: 'Every call gets answered, 24/7 — even when the front desk is with a patient. Missed calls get an instant text back, new-patient inquiries get a reply in under a minute, and a caller can always reach a human.',
    metric: 'No new patient lost to a missed call',
  },
  {
    n: '03',
    key: 'BOOK',
    what: 'New patients get qualified and booked straight to your calendar, with reminders so they show. Every call is recorded and sorted.',
    metric: 'More inquiries become kept appointments',
  },
  {
    n: '04',
    key: 'RECOVER',
    what: 'Unaccepted treatment plans and overdue recall get followed up automatically, past patients get a reason to come back, and new reviews lift you in local search.',
    metric: 'Revenue won back from plans and recall',
  },
  {
    n: '05',
    key: 'PROVE',
    what: 'A monthly front-desk score, and a dashboard that shows what this system brought in, separately from your ads.',
    metric: 'What the system earned, against the fee',
  },
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

      {/* 1 — HOOK */}
      <RevenueHero
        eyebrow="Revenue Engine · Dental"
        title="Your front desk is the most"
        titleAccent="expensive channel you don't measure."
        lede={
          <>
            New patients call while your front desk is mid-appointment, and the
            call goes to voicemail &mdash; and to another practice. Presented
            treatment plans go quiet. The revenue leaks before anyone notices.
          </>
        }
        primaryCta={{ label: 'Book a Revenue Leak Audit', href: '#audit' }}
        anchors={[
          { label: 'The leak', href: '#leak' },
          { label: 'How it works', href: '#how' },
          { label: 'Compliance', href: '#compliance' },
          { label: 'Pricing', href: '#pricing' },
          { label: 'FAQ', href: '#faq' },
        ]}
      />

      {/* 2 — THE LEAK */}
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
            Most practice owners blame their marketing. It is almost never the
            marketing &mdash; it is the calls during chair time nobody could
            pick up, and the treatment plans nobody circled back on.
          </>
        }
        leaks={DENTAL_LEAKS}
        closer={<>Every one of these is revenue you already earned the right to.</>}
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
            <span className="text-ink-500">applied to your practice.</span>
          </>
        }
        intro={
          <>
            I install and run all of it &mdash; the 90-day setup is on me. Here
            is what each piece looks like inside a dental practice.
          </>
        }
        steps={DENTAL_STEPS}
      />

      {/* 5 — PROOF */}
      <TwoRevenueLines id="prove" />

      {/* Vertical-specific reassurance (after proof, before price): HIPAA / patient data */}
      <Compliance id="compliance" />

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
        kicker="Front desk, PMS integration, patient data, budget. Straight answers."
        items={DENTAL_FAQ}
      />

      {/* 8 — FREE-AUDIT CLOSE */}
      <AuditCTA id="audit" />
    </>
  )
}
