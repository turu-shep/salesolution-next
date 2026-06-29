import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'
import { FAQ, type QA } from '@/components/sections/FAQ'
import { AuditCTA } from '@/components/sections/revenue-engine/AuditCTA'
import { Guarantee } from '@/components/sections/revenue-engine/Guarantee'
import { PlanByPillar } from '@/components/sections/revenue-engine/PlanByPillar'
import { RevenuePricing } from '@/components/sections/revenue-engine/RevenuePricing'
import { TwoRevenueLines } from '@/components/sections/revenue-engine/TwoRevenueLines'
import { WholeFlowLeak } from '@/components/sections/revenue-engine/WholeFlowLeak'
import { FlowBlock } from '@/components/sections/revenue-engine/flow-concepts/FlowBlock'

/**
 * Internal preview — the "confident spine" rebuild of a Revenue Engine vertical
 * page (home-services data). Six beats, Bring/Convert/Retain said once, no card
 * walls: dark hero -> your leak in $ -> the engine -> proof + guarantee -> price
 * -> audit. Not linked in nav, noindex. Delete once a direction is locked.
 */
export const metadata: Metadata = {
  title: 'Revenue Engine — confident spine preview',
  robots: { index: false, follow: false },
}

const SPECS = [
  { label: 'Setup', value: '90 days, one-time fee' },
  { label: 'Minimum', value: '3 months' },
  { label: 'Lock-in', value: 'none' },
]

const FAQ_ITEMS: QA[] = [
  {
    q: 'Do I need a new website?',
    a: (
      <p>
        No. The quote form and pages run alongside your existing site. I don&rsquo;t touch
        your domain or make you rebuild &mdash; the engine bolts on to what you have.
      </p>
    ),
  },
  {
    q: 'Are these leads exclusive to me?',
    a: (
      <p>
        Yes. Your own demand, your own ad account, your own pipeline. I never resell a lead
        to another contractor.
      </p>
    ),
  },
  {
    q: 'How fast can we start?',
    a: (
      <p>
        The full system installs over 90 days, but call answering and missed-call text-back
        are live within the first couple of weeks.
      </p>
    ),
  },
]

export default function SpinePreviewPage() {
  return (
    <>
      <div className="h-1.5 w-full bg-brand-600" aria-hidden />

      {/* 1 — HERO (dark, the pain + the promise + the operator) */}
      <SectionRail tone="dark" glow="strong">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
            Revenue Engine · Home services
          </p>
          <h1 className="mt-5 font-display text-[2.75rem] font-semibold leading-[1.0] tracking-[-0.03em] text-white sm:text-6xl lg:text-[4.25rem]">
            You&rsquo;re losing jobs{' '}
            <span className="text-ink-300">you already paid for.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink-200">
            You miss the call on a roof. You pay for leads nobody calls back. You quote a job
            and never hear back. I run the whole flow that books them &mdash; and I prove it
            paid.
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

      {/* 2 — YOUR WHOLE-FLOW LEAK (Bring + Convert + Retain, your own numbers) */}
      <WholeFlowLeak />

      {/* 3 — THE ENGINE (Bring/Convert/Retain — the belief-shift + trust line) */}
      <FlowBlock />

      {/* 4 — THE PLAN (the five steps grouped under the three pillars) */}
      <PlanByPillar id="how" />

      {/* 5 — PROOF + GUARANTEE */}
      <TwoRevenueLines id="proof" />
      <Guarantee id="guarantee" abut />

      {/* 5 — PRICE (anchored against the leak number above) */}
      <RevenuePricing id="pricing" />

      {/* 6 — SLIM FAQ (mop up the last objections) */}
      <FAQ
        id="faq"
        eyebrow="A few last questions"
        headline={
          <>
            Questions before the audit.
          </>
        }
        kicker="New website, lead exclusivity, time to start. Straight answers."
        items={FAQ_ITEMS}
        defaultOpenFirst
      />

      {/* 7 — THE OPERATOR (face on the staked promise, right before the ask) */}
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
              You work with me &mdash; not a pod, not a junior handoff. I install the system,
              I run it, and I&rsquo;m the one on the hook if the recovered-revenue line
              doesn&rsquo;t clear my fee. Fourteen years doing this for contractors,
              practices, and shops.
            </p>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-400">
              Artur Shepel · Founder, Sale Solution
            </p>
          </div>
        </div>
      </SectionRail>

      {/* hairline so the founder beat and the (also dark) audit don't blur */}
      <div aria-hidden className="h-px w-full bg-white/10" />

      {/* 8 — BOOK THE AUDIT */}
      <AuditCTA id="audit" />
    </>
  )
}
