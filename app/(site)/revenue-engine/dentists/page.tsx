import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'
import { FAQ, type QA } from '@/components/sections/FAQ'
import { AuditCTA } from '@/components/sections/revenue-engine/AuditCTA'
import { Compliance } from '@/components/sections/revenue-engine/Compliance'
import { Guarantee } from '@/components/sections/revenue-engine/Guarantee'
import { PlanByPillar } from '@/components/sections/revenue-engine/PlanByPillar'
import { RevenuePricing } from '@/components/sections/revenue-engine/RevenuePricing'
import { TwoRevenueLines } from '@/components/sections/revenue-engine/TwoRevenueLines'
import {
  WholeFlowLeak,
  type FieldSet,
  type LeakHeading,
  type Preset,
} from '@/components/sections/revenue-engine/WholeFlowLeak'
import { FlowBlock } from '@/components/sections/revenue-engine/flow-concepts/FlowBlock'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbListSchema, serviceSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Revenue Engine for Dental Practices · Recover cold cases & recall',
  description:
    'A HIPAA-compliant system that works the revenue already in your software — unscheduled treatment plans and overdue recall — then catches the new-patient calls your front desk can’t and proves what it brought back. Book a free Revenue Leak Audit.',
  alternates: { canonical: 'https://salesolution.net/revenue-engine/dentists/' },
}

const SPECS = [
  { label: 'Install', value: 'by day 60, one-time fee' },
  { label: 'Minimum', value: '3 months' },
  { label: 'Lock-in', value: 'none' },
]

// WholeFlowLeak — dental presets (Retain-led). The biggest recoverable pool for
// a practice with high-value cases is unscheduled treatment plans + overdue
// recall, so Retain is the largest slice in both presets.
//
// GATE:HUMAN — these preset defaults and the component's recovery rates are
// illustrative starting points, not signed-off claims. They need Artur's review
// before this goes live (per the claims-library discipline). The owner edits
// every slider; the audit replaces the estimate with real figures.
const DENTAL_PRESETS: Preset[] = [
  { key: 'cosmetic', label: 'Cosmetic & implant', avg: 5000, bvol: 90, brate: 35, cvol: 2, crate: 25, rvol: 220, rrate: 18 },
  { key: 'general', label: 'General & hygiene', avg: 1200, bvol: 220, brate: 35, cvol: 5, crate: 28, rvol: 1500, rrate: 16 },
]

const DENTAL_FIELDS: FieldSet = {
  bring: [
    { key: 'bvol', label: 'New-patient searches a month nearby', min: 0, max: 1000, step: 10, fmt: 'n' },
    { key: 'brate', label: 'Find you today', min: 0, max: 100, step: 1, fmt: 'pct' },
  ],
  convert: [
    { key: 'cvol', label: 'New-patient calls missed a week', min: 0, max: 40, step: 1, fmt: 'n' },
    { key: 'crate', label: 'Book rate when you reach them', min: 0, max: 100, step: 1, fmt: 'pct' },
  ],
  retain: [
    { key: 'rvol', label: 'Unscheduled plans + overdue patients', min: 0, max: 4000, step: 25, fmt: 'n' },
    { key: 'rrate', label: 'Share you’d rebook with follow-up', min: 0, max: 50, step: 1, fmt: 'pct' },
  ],
}

const DENTAL_LEAK_HEADING: LeakHeading = {
  eyebrow: 'What the whole leak costs you',
  titleA: 'Your biggest leak is the case you already won.',
  titleB: 'Not the missed call.',
  intro:
    'Pick your practice, slide in your own numbers, and watch all three add up — then see what the engine puts back.',
}

// The plan reads in the machine's natural order — Bring → Convert → Retain →
// Prove (Capture 1, Respond 2, Book 3, Recover 4, Prove 5). The page still LEADS
// Retain (hero + the calculator); the plan just walks the flow front to back.
const DENTAL_GROUPS = [
  {
    pillar: 'Bring',
    outcome: 'Get found when they search at 11pm',
    steps: [
      {
        key: 'Capture',
        what: 'A tidied-up Google listing, a steady stream of reviews that lifts you in the map, and service pages that show a monthly payment instead of a sticker price. Built so you’re the name that comes up when someone searches — or asks AI — for the best cosmetic dentist near them. All of it yours.',
        metric: 'More high-value searches turn into booked consults',
      },
    ],
  },
  {
    pillar: 'Convert',
    outcome: 'Win the ones who reach you',
    steps: [
      {
        key: 'Respond',
        what: 'Every call answered, even during chair time and after hours. Missed calls get an instant text back in seconds. A high-value inquiry gets a fast, human-sounding reply instead of voicemail, and can always reach a real person.',
        metric: 'No new patient lost to a call nobody could grab',
      },
      {
        key: 'Book',
        what: 'New patients qualified and booked into your real schedule, with reminders so they show. Every call recorded and logged to you, so the most expensive channel in the building finally gets measured.',
        metric: 'More answered calls turn into kept appointments',
      },
    ],
  },
  {
    pillar: 'Retain',
    outcome: 'Work the patients you already won',
    steps: [
      {
        key: 'Recover',
        what: 'The average practice schedules just 45% of the treatment it presents; the top 10% reach 75% (Henry Schein One 2026 Catalyst Index). The gap is the pool this works. Every presented plan that didn’t schedule gets a structured follow-up with financing on the table, so “I’ll think about it” gets reopened instead of going cold. Overdue recall and dormant patients get win-back texts that rebook them — automatically, off your own list.',
        metric: 'Accepted-but-unscheduled plans booked, overdue patients back in the chair',
      },
    ],
  },
]

const DENTAL_PROVE = {
  key: 'Prove',
  what: 'A monthly front-desk score and a dashboard showing what this system brought back — on its own line, separate from your ads. Recovered plans and reactivated patients, in your own numbers.',
  metric: 'What the system earned, against the fee',
}

// Reassurance copy (from the `dental` brief). Drops the brief's flagged-fragile
// "~8 pt 2025 acceptance drop" for a plain claim. BAA, PHI, and PMS are each
// glossed in plain words on first use.
const DENTAL_COMPLIANCE_MEASURES = [
  {
    title: 'A signed BAA on everything that touches patient data',
    copy: 'Call answering, texting, recordings, and records all run under a signed Business Associate Agreement (BAA) — the contract HIPAA requires of any vendor handling patient data. A recorded patient call is protected health information once the patient consents, so it lives under HIPAA storage and access rules, not a generic call log. You get it in writing before go-live.',
  },
  {
    title: 'Call-recording disclosures done right',
    copy: 'Two-party consent varies by state. I default to the strictest rule that applies to you, with a “this call may be recorded” announcement on outbound calls. Every call is logged to you, which is also what makes it dispute-proof.',
  },
  {
    title: 'It works with your practice software, not against it',
    copy: 'Dentrix, Open Dental, and Eaglesoft run over half of North American practices. The system books into your real schedule and writes back, so there’s no second calendar to babysit and nothing to migrate. You’re not switching software.',
  },
  {
    title: 'Financing framed in the follow-up',
    copy: 'Implants and veneers are mostly out of pocket, and cost is the top reason a case stalls. So the treatment-plan follow-up sells the value and a payment option (CareCredit-style), not “use your benefits.”',
  },
]

const DENTAL_FAQ: QA[] = [
  {
    q: 'Is this going to sound like a robot? Part of why patients stay is that they reach a real person.',
    a: (
      <p>
        It catches the calls your front desk can’t get to right now —
        voicemail, after hours, the 40th call at 4pm. Those callers get a fast,
        human-sounding reply and a booked time instead of voicemail. Your team
        stays the face of the practice. It only picks up what’s already going
        unanswered.
      </p>
    ),
  },
  {
    q: 'Is it HIPAA-compliant? I can’t have patient info floating around in some tool.',
    a: (
      <p>
        Yes. A signed BAA on every tool that touches patient data — calls,
        texts, and records. A recorded patient call is treated as protected
        health information under HIPAA storage and access rules. You get it in
        writing before anything goes live. The compliance section above has the
        detail.
      </p>
    ),
  },
  {
    q: 'I’ve paid agencies before and gotten reports full of rankings and impressions while the phone stayed quiet. Why is this different?',
    a: (
      <p>
        I don’t report impressions or rankings. I report booked appointments
        and the revenue the follow-up brought back, in your own numbers. If it
        doesn’t clear the fee by day 90, I work free until it does.
      </p>
    ),
  },
  {
    q: 'Are you trying to replace my front desk? They’ve been with me for years.',
    a: (
      <p>
        No. One person can’t answer 50 calls a day and check patients in. The
        system catches the overflow and after-hours calls and chases the
        treatment plans and recall your team never has time to work. They keep
        the patients; it stops the ones falling through the cracks.
      </p>
    ),
  },
  {
    q: 'My problem is slow summers and an empty schedule, not just missed calls. Does this fill chairs?',
    a: (
      <p>
        The biggest recoverable pool you’re sitting on is overdue recall and
        unscheduled treatment plans. A quarter to 40% of your active base is
        overdue at any time. The system works that list automatically — win-back
        texts and follow-up that rebook those patients — so the schedule fills
        before the slow weeks hit.
      </p>
    ),
  },
  {
    q: 'What does it cost, and am I locked into a contract?',
    a: (
      <p>
        Published model. The number comes in writing the same day — no cold
        games on a call. After the minimum it’s month-to-month. Cancel and you
        keep your data, your Google profile, and your patient records.
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
            'A HIPAA-compliant revenue system for dental practices: treatment-plan and recall recovery, call answering during chair time, online booking, front-desk scoring, and attribution.',
          category: 'Marketing',
        })}
      />
      <JsonLd
        data={breadcrumbListSchema([
          { name: 'Home', url: 'https://salesolution.net/' },
          { name: 'Industries', url: 'https://salesolution.net/industries/' },
          { name: 'Medical & aesthetics', url: 'https://salesolution.net/industries/medical-aesthetics/' },
          { name: 'Dentists', url: 'https://salesolution.net/revenue-engine/dentists/' },
        ])}
      />

      <div className="h-1.5 w-full bg-brand-600" aria-hidden />

      {/* 1 — HERO (dark = conviction). Leads on the cold high-value case (Retain).
          Full-contrast headline — both lines white, no muted accent. Founder
          strip puts a named face + named terms above the fold. */}
      <SectionRail tone="dark" glow="strong">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
            Revenue Engine · Dental practices
          </p>
          <h1 className="mt-5 font-display text-[2.75rem] font-semibold leading-[1.02] tracking-[-0.03em] text-white sm:text-5xl md:text-[3.5rem]">
            <span className="block">You present a $5k case.</span>
            <span className="block">Then it goes quiet, and nobody calls it back.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink-200">
            The plan they said “let me think about it” to never gets a follow-up,
            so it dies in your software. The call that would’ve booked the next
            case goes to voicemail during chair time. I run the whole flow that
            catches both — and I prove it paid.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link
              href="#audit"
              data-cta="revenue_leak_audit__hero"
              data-cta-location="hero"
              className="inline-flex items-center gap-1.5 rounded-[4px] bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-cta transition-colors duration-200 hover:bg-brand-700"
            >
              Book a Revenue Leak Audit
              <span aria-hidden>→</span>
            </Link>
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-400">
              20 min · your numbers · yours to keep
            </span>
          </div>
        </div>

        {/* Operator signature — full-width, room to breathe */}
        <div className="mt-14 flex flex-col gap-6 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
          <div className="flex items-center gap-5">
            <Image
              src="/artur-shepel-480.webp"
              alt="Artur Shepel"
              width={719}
              height={1280}
              className="h-16 w-16 shrink-0 rounded-full object-cover"
            />
            <div>
              <p className="font-display text-lg font-semibold text-white">Artur Shepel</p>
              <p className="mt-1 text-sm leading-snug text-ink-300">
                Founder &middot; I run every account myself.
              </p>
            </div>
          </div>
          <dl className="flex flex-wrap gap-x-10 gap-y-3">
            {SPECS.map((s) => (
              <div key={s.label}>
                <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-400">
                  {s.label}
                </dt>
                <dd className="mt-1 text-sm font-semibold text-white">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </SectionRail>

      {/* 2 — THE WHOLE-FLOW LEAK (Retain-led): the owner's own numbers across all
          three pillars, then what the engine recovers + the D12 install-frame
          payback (book-jobs motion, default) that hands into the guarantee below */}
      <WholeFlowLeak
        id="leak"
        presets={DENTAL_PRESETS}
        fields={DENTAL_FIELDS}
        avgLabel="Your average case"
        unitLabel="case"
        heading={DENTAL_LEAK_HEADING}
      />

      {/* 3 — THE FLOW: "you've been sold pieces. I run the whole flow." */}
      <div id="flow">
        <FlowBlock />
      </div>

      {/* 4 — THE PLAN: five steps grouped under Retain / Convert / Bring */}
      <PlanByPillar id="how" groups={DENTAL_GROUPS} prove={DENTAL_PROVE} />

      {/* 5 — REASSURANCE: HIPAA handled + works with your software */}
      <Compliance
        id="compliance"
        eyebrow="HIPAA & your software"
        title="HIPAA handled,"
        titleAccent="and it works with the software you already run."
        intro="Two things kill a vendor for a dental owner on the spot: patient data floating around without a BAA, and a tool that wants you to rip out Dentrix. Neither happens here. Plain answers, in writing, before anything goes live."
        measures={DENTAL_COMPLIANCE_MEASURES}
      />

      {/* 6 — HOW I REPORT IT (dark) — hands into the guarantee */}
      <TwoRevenueLines id="prove" />

      {/* 7 — GUARANTEE (dark, abutted to the report as one conviction field) */}
      <Guarantee id="guarantee" abut />

      {/* 8 — OFFER (the price, now that the risk is reversed) */}
      <RevenuePricing
        id="pricing"
        floorLine="Installs start at $30,000. The exact number comes from the audit — in writing, same day."
      />

      {/* 9 — FAQ */}
      <FAQ
        id="faq"
        eyebrow="A few last questions"
        headline={
          <>
            Questions before the audit.
          </>
        }
        kicker="Treatment plans, recall, HIPAA, your software, cost. Straight answers."
        items={DENTAL_FAQ}
      />

      {/* 10 — THE OPERATOR (face on the staked promise, right before the ask) */}
      <SectionRail tone="dark">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-9">
          <Image
            src="/artur-shepel-480.webp"
            alt="Artur Shepel"
            width={719}
            height={1280}
            className="h-24 w-24 shrink-0 rounded-full object-cover"
          />
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-semibold tracking-[-0.015em] text-white sm:text-3xl">
              That guarantee has my name on it.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-200">
              You work with me — not a pod, not a junior handoff. I install the
              system, I run it, and I’m the one on the hook if the
              recovered-revenue line doesn’t clear my fee.
            </p>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-400">
              Artur Shepel · Founder, Sale Solution
            </p>
          </div>
        </div>
      </SectionRail>

      {/* hairline so the founder beat and the (also dark) audit don't blur */}
      <div aria-hidden className="h-px w-full bg-white/10" />

      {/* 11 — FREE-AUDIT CLOSE (dental form: no Trade picker, dental leak options) */}
      <AuditCTA id="audit" vertical="dental" />
    </>
  )
}
