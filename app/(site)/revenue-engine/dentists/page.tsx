import type { Metadata } from 'next'

import { FAQ, type QA } from '@/components/sections/FAQ'
import { AuditCTA } from '@/components/sections/revenue-engine/AuditCTA'
import { Compliance } from '@/components/sections/revenue-engine/Compliance'
import { Guarantee } from '@/components/sections/revenue-engine/Guarantee'
import { PlanByPillar } from '@/components/sections/revenue-engine/PlanByPillar'
import { RevenueHero } from '@/components/sections/revenue-engine/RevenueHero'
import { RevenuePricing } from '@/components/sections/revenue-engine/RevenuePricing'
import { TheLeak, type Leak } from '@/components/sections/revenue-engine/TheLeak'
import { TwoRevenueLines } from '@/components/sections/revenue-engine/TwoRevenueLines'
import { FlowBlock } from '@/components/sections/revenue-engine/flow-concepts/FlowBlock'
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

const DENTAL_GROUPS = [
  {
    pillar: 'Bring',
    outcome: 'Get found when patients are looking',
    steps: [
      {
        key: 'Capture',
        what: 'Service pages that show a monthly payment instead of a sticker price, online booking, and a tidied-up Google listing — all yours.',
        metric: 'More visitors turn into booked new patients',
      },
    ],
  },
  {
    pillar: 'Convert',
    outcome: 'Win the ones who reach you',
    steps: [
      {
        key: 'Respond',
        what: 'Every call answered, 24/7 — even when the front desk is with a patient. Missed calls get an instant text back, new-patient inquiries get a reply in under a minute, and a caller can always reach a human.',
        metric: 'No new patient lost to a missed call',
      },
      {
        key: 'Book',
        what: 'New patients qualified and booked straight to your calendar, with reminders so they show. Every call recorded and sorted.',
        metric: 'More inquiries become kept appointments',
      },
    ],
  },
  {
    pillar: 'Retain',
    outcome: 'Bring them back',
    steps: [
      {
        key: 'Recover',
        what: 'Unaccepted treatment plans and overdue recall get followed up automatically, past patients get a reason to come back, and new reviews lift you in local search.',
        metric: 'Revenue won back from plans and recall',
      },
    ],
  },
]

const DENTAL_PROVE = {
  key: 'Prove',
  what: 'A monthly front-desk score, and a dashboard that shows what this system brought in — on its own line, separate from your ads.',
  metric: 'What the system earned, against the fee',
}

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
        eyebrow={'For dentists & dental practices'}
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

      {/* 3 — THE FIX: "you've been sold pieces / I run the whole flow" */}
      <div id="flow">
        <FlowBlock />
      </div>

      {/* 4 — THE PLAN: the five steps grouped under Bring / Convert / Retain */}
      <PlanByPillar id="how" groups={DENTAL_GROUPS} prove={DENTAL_PROVE} />

      {/* 5 — COMPLIANCE (vertical reassurance, plan-adjacent) */}
      <Compliance id="compliance" />

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
        kicker="Front desk, PMS integration, patient data, budget. Straight answers."
        items={DENTAL_FAQ}
      />

      {/* 8 — FREE-AUDIT CLOSE */}
      <AuditCTA id="audit" />
    </>
  )
}
