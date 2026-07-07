import type { Metadata } from 'next'

import { FAQ, type QA } from '@/components/sections/FAQ'
import { AuditCTA } from '@/components/sections/revenue-engine/AuditCTA'
import { Compliance } from '@/components/sections/revenue-engine/Compliance'
import { Guarantee } from '@/components/sections/revenue-engine/Guarantee'
import { PlanByPillar } from '@/components/sections/revenue-engine/PlanByPillar'
import { RevenueHero } from '@/components/sections/revenue-engine/RevenueHero'
import { RevenuePricing } from '@/components/sections/revenue-engine/RevenuePricing'
import { TwoRevenueLines } from '@/components/sections/revenue-engine/TwoRevenueLines'
import {
  WholeFlowLeak,
  type FieldSet,
  type LeakHeading,
  type Preset,
} from '@/components/sections/revenue-engine/WholeFlowLeak'
import { FlowBlock } from '@/components/sections/revenue-engine/flow-concepts/FlowBlock'
import { Concept2Evidence } from '@/components/sections/revenue-engine/leak-concepts/Concept2Evidence'
import { Concept4BeforeAfter } from '@/components/sections/revenue-engine/leak-concepts/Concept4BeforeAfter'
import { LEAK_DATA } from '@/components/sections/revenue-engine/leak-concepts/data'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbListSchema, serviceSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Revenue Engine for Medical & Aesthetics · Dental, med spa, plastic surgery',
  description:
    'A HIPAA-compliant system for elective and aesthetic practices — dental, med spa, plastic surgery, derm. It answers calls during treatment, books new consults, follows up the high-value plans, and proves the revenue. Book a free Revenue Leak Audit.',
  alternates: { canonical: 'https://salesolution.net/industries/medical-aesthetics/' },
}

const leak = LEAK_DATA['medical']

// WholeFlowLeak — medical/aesthetic presets (Retain-led). Ports the dentists
// pattern to the pillar (MED-8.2): the biggest recoverable pool is unscheduled
// treatment plans, overdue recall, and the injectable re-treatment window, so
// Retain is the largest slice in every preset. Average case/visit values are the
// sourced sub-niche figures (medical spec §1.5 / §2.2–2.3): dental-cosmetic
// $6,000, ortho $6,100, med spa $527/visit, injectables $500/visit.
//
// GATE:HUMAN — illustrative volumes pending founder sign-off (mirrors dentists page pattern)
const MEDICAL_PRESETS: Preset[] = [
  { key: 'dental-cosmetic', label: 'Dental — cosmetic & implant', unit: 'case', avg: 6000, bvol: 90, brate: 35, cvol: 2, crate: 25, rvol: 220, rrate: 18 },
  { key: 'ortho', label: 'Orthodontics', unit: 'case', avg: 6100, bvol: 110, brate: 35, cvol: 2, crate: 25, rvol: 180, rrate: 20 },
  { key: 'med-spa', label: 'Med spa', unit: 'visit', avg: 527, bvol: 400, brate: 40, cvol: 8, crate: 30, rvol: 900, rrate: 25 },
  { key: 'injectables', label: 'Injectables', unit: 'visit', avg: 500, bvol: 500, brate: 40, cvol: 10, crate: 30, rvol: 1200, rrate: 28 },
]

const MEDICAL_FIELDS: FieldSet = {
  bring: [
    { key: 'bvol', label: 'Patient searches a month nearby', min: 0, max: 1000, step: 10, fmt: 'n' },
    { key: 'brate', label: 'Find you today', min: 0, max: 100, step: 1, fmt: 'pct' },
  ],
  convert: [
    { key: 'cvol', label: 'New-patient calls missed a week', min: 0, max: 40, step: 1, fmt: 'n' },
    { key: 'crate', label: 'Book rate when you reach them', min: 0, max: 100, step: 1, fmt: 'pct' },
  ],
  retain: [
    { key: 'rvol', label: 'Past patients + overdue recall', min: 0, max: 4000, step: 25, fmt: 'n' },
    { key: 'rrate', label: 'Share you’d rebook with follow-up', min: 0, max: 50, step: 1, fmt: 'pct' },
  ],
}

const MEDICAL_LEAK_HEADING: LeakHeading = {
  eyebrow: 'What the whole leak costs you',
  titleA: 'The leak is bigger than the missed call.',
  titleB: 'You lose the patient in three places.',
  intro:
    'Pick your practice, slide in your own numbers, and watch all three add up — then see what the engine puts back.',
}

const MEDICAL_GROUPS = [
  {
    pillar: 'Bring',
    outcome: 'Get found when patients are searching',
    steps: [
      {
        key: 'Capture',
        what: 'Service pages built to show up when patients search nearby for the procedures you offer, online consult booking, and a tidied-up Google listing — all yours.',
        metric: 'More searchers turn into booked consults',
      },
    ],
  },
  {
    pillar: 'Convert',
    outcome: 'Win the ones who reach you',
    steps: [
      {
        key: 'Respond',
        what: 'Every call answered, 24/7 — even when the front desk is with a patient. Missed calls get an instant text back, new inquiries get a reply in under a minute, and a caller can always reach a human.',
        metric: 'No new patient lost to a missed call',
      },
      {
        key: 'Book',
        what: 'New patients and consults qualified and booked straight to your calendar, with reminders so they show. Every call recorded and sorted.',
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

const MEDICAL_PROVE = {
  key: 'Prove',
  what: 'A monthly front-desk score, and a dashboard that shows what this system brought in — on its own line, separate from your ads.',
  metric: 'What the system earned, against the fee',
}

const MEDICAL_FAQ: QA[] = [
  {
    q: 'Will this replace my front desk?',
    a: (
      <p>
        No. It answers what your front desk physically cannot &mdash; the calls
        that come in during treatment, after hours, and at lunch. Your team
        handles the patients in front of them; the engine catches everyone
        else.
      </p>
    ),
  },
  {
    q: 'Does it work for a med spa or surgical practice, not just dental?',
    a: (
      <p>
        Yes. The motion is the same across elective care &mdash; dental, med
        spa, plastic surgery, derm: get found for the procedure, answer fast,
        book the consult, and follow up the high-value plans. The pages and
        scripts are set up around your procedures during the install.
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
        Practices are commonly advised to invest 5&ndash;8% of gross revenue in
        marketing. The point of the engine is to make that spend convert
        &mdash; recovered calls and treatment-plan follow-up are revenue you
        already paid to generate.
      </p>
    ),
  },
]

export default function MedicalAestheticsPillarPage() {
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: 'Revenue Engine for Medical & Aesthetics',
          url: 'https://salesolution.net/industries/medical-aesthetics/',
          description:
            'A HIPAA-compliant AI revenue system for elective and aesthetic practices (dental, med spa, plastic surgery, derm): call answering, online consult booking, treatment-plan and recall follow-up, front-desk scoring, and attribution.',
          category: 'Marketing',
        })}
      />
      <JsonLd
        data={breadcrumbListSchema([
          { name: 'Home', url: 'https://salesolution.net/' },
          { name: 'Industries', url: 'https://salesolution.net/industries/' },
          { name: 'Medical & aesthetics', url: 'https://salesolution.net/industries/medical-aesthetics/' },
        ])}
      />

      <div className="h-1.5 w-full bg-brand-600" aria-hidden />

      {/* 1 — HOOK */}
      <RevenueHero
        eyebrow={'For med spa, surgical & aesthetic practices'}
        title="Built for the practice"
        titleAccent="losing its highest-value patients to voicemail."
        lede={
          <>
            A new patient calls about a high-ticket case while your front desk is
            mid-treatment, and the call goes to voicemail &mdash; and to the
            practice down the road. The consult you did present goes quiet. The
            revenue leaks before anyone notices.
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
          { label: 'Compliance', href: '#compliance' },
          { label: 'Pricing', href: '#pricing' },
          { label: 'FAQ', href: '#faq' },
        ]}
      />

      {/* 2 — THE LEAK: three places you lose the patient */}
      <div id="leak">
        <Concept2Evidence
          data={leak}
          header={{
            eyebrow: "The practice's leak",
            headlineA: 'Three places you lose the patient.',
            headlineB: 'Most practices only fix one.',
            intro:
              'Before they find you, when they call during treatment, and after the plan is presented. The leak is bigger than the missed call.',
            closer: 'Every one of these is revenue you already earned the right to.',
          }}
        />
      </div>

      {/* 3 — THE WHOLE-FLOW LEAK (Retain-led): the practice's own numbers across
          all three pillars, then what the engine recovers + the D12 install-frame
          payback. book-jobs motion (default) auto-renders the $30K anchor + the
          guarantee hand-off into the <Guarantee> mounted below. */}
      <WholeFlowLeak
        presets={MEDICAL_PRESETS}
        fields={MEDICAL_FIELDS}
        avgLabel="Your average case"
        unitLabel="case"
        heading={MEDICAL_LEAK_HEADING}
      />

      {/* 3 — THE FIX: "you've been sold pieces / I run the whole flow" */}
      <div id="flow">
        <FlowBlock />
      </div>

      {/* 4 — THE PLAN: the five steps grouped under Bring / Convert / Retain */}
      <PlanByPillar id="how" groups={MEDICAL_GROUPS} prove={MEDICAL_PROVE} />

      {/* 4.5 — THE DIFFERENCE: same patient, two endings */}
      <Concept4BeforeAfter
        data={leak}
        header={{
          eyebrow: 'The difference',
          headlineA: 'Same patient.',
          headlineB: 'Two endings.',
          intro: 'One new-patient call. The only thing that changes is whether it gets answered.',
          closer: '',
        }}
      />

      {/* 5 — COMPLIANCE (vertical reassurance, plan-adjacent) */}
      <Compliance id="compliance" />

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
        kicker="Front desk, your specialty, patient data, budget. Straight answers."
        items={MEDICAL_FAQ}
      />

      {/* 8 — FREE-AUDIT CLOSE (dental vertical: treatment-plan/recall wording +
          dental leak options, not the contractor default) */}
      <AuditCTA id="audit" vertical="dental" />
    </>
  )
}
