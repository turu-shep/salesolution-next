import type { Metadata } from 'next'

import { RevenueLeakAuditForm } from '@/components/forms/RevenueLeakAuditForm'
import { SectionRail } from '@/components/layout/SectionRail'
import { business } from '@/lib/business'

/**
 * Paid landing page — home services (roofing-forward) "stop the leak" angle.
 * Maps to ad-angle-matrix.md LP-1 (G5 + G4). Single funnel (Revenue Engine),
 * one CTA (the Revenue Leak Audit form). noindex — campaign traffic only, must
 * not compete with organic. First-person operator voice (the Revenue Engine
 * convention). Loss-aversion, no manufactured urgency.
 *
 * The form posts to /api/revenue-leak-audit and redirects to
 * /revenue-engine/audit-booked/ (the conversion endpoint).
 */

export const metadata: Metadata = {
  title: 'Stop losing the jobs you already paid to win',
  description:
    'Free Revenue Leak Audit for home-service pros. See exactly where calls, leads, and estimates are slipping away — your numbers, yours to keep.',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://salesolution.net/lp/home-services-revenue-leak/' },
}

const STATS = [
  { big: '1 in 3', small: 'calls to local businesses go unanswered' },
  { big: '47 hrs', small: 'typical reply to a web lead — long after they booked elsewhere' },
]

const STEPS = [
  {
    n: '01',
    t: 'You give me a few minutes',
    b: 'Your number, your business, where it hurts most. That’s it to start.',
  },
  {
    n: '02',
    t: 'I pull your real numbers',
    b: 'Missed calls, how fast leads get a reply, your Google profile, and the follow-up gap on your estimates.',
  },
  {
    n: '03',
    t: 'You get the leak — and the fix',
    b: 'The dollar figure slipping away, and the one change with the highest payback. Yours to keep whether we work together or not.',
  },
]

export default function HomeServicesRevenueLeakLP() {
  return (
    <>
      {/* Hero — message + the form, side by side */}
      <section className="relative bg-paper">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-12 lg:items-start lg:gap-12 lg:px-8 lg:pb-20 lg:pt-16">
          <div className="lg:col-span-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-600">
              For roofers, HVAC, plumbing &amp; electrical
            </p>
            <h1 className="mt-5 font-display text-[2.5rem] font-semibold leading-[1.04] tracking-[-0.02em] text-ink-900 sm:text-5xl lg:text-[3.25rem]">
              Stop losing the jobs you already paid to win.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-700">
              Every missed call and dead estimate is a booked job for whoever
              answered first. I&rsquo;ll show you exactly where it&rsquo;s leaking
              and what it&rsquo;s costing you &mdash; in about 20 minutes, free,
              and the numbers are yours to keep.
            </p>
            <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-ink-700">
              <li className="flex items-center gap-2"><Dot /> No contract to start</li>
              <li className="flex items-center gap-2"><Dot /> Keep your ads guy</li>
              <li className="flex items-center gap-2"><Dot /> Your numbers, yours to keep</li>
            </ul>
            <p className="mt-6 text-sm text-ink-600">
              Prefer to talk?{' '}
              <a
                href={`tel:${business.phone}`}
                data-cta="revenue-leak-audit__hero-call"
                data-cta-location="campaign-hero"
                className="font-semibold text-accent-700 underline decoration-accent-500/40 underline-offset-4 transition-colors hover:decoration-accent-600"
              >
                Call or text {business.phoneDisplay}
              </a>
            </p>
          </div>

          <div id="audit" className="scroll-mt-24 lg:col-span-6">
            <RevenueLeakAuditForm />
          </div>
        </div>
      </section>

      {/* The leak — G5 + G4, one capture/response story */}
      <SectionRail tone="dark">
        <div className="max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-500">
            Where the money leaks
          </p>
          <h2 className="mt-3 font-display text-balance text-3xl font-semibold leading-[1.1] tracking-[-0.015em] text-white sm:text-4xl">
            You don&rsquo;t have a lead problem. You have a leak.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-ink-200">
            The phone rings while you&rsquo;re on a roof. The web lead lands at 9pm.
            By the time anyone calls back, they&rsquo;ve booked with whoever picked
            up first. You paid to make that phone ring. The job booked somewhere else.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {STATS.map((s) => (
            <div key={s.big} className="border-l-2 border-accent-500 bg-white/[0.02] py-5 pl-5 pr-4">
              <p className="font-display text-4xl font-semibold leading-none tracking-[-0.02em] text-white sm:text-5xl">
                {s.big}
              </p>
              <p className="mt-2 text-sm leading-snug text-ink-300">{s.small}</p>
            </div>
          ))}
        </div>
      </SectionRail>

      {/* What the audit is */}
      <SectionRail tone="surface">
        <div className="max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            What you get
          </p>
          <h2 className="mt-3 font-display text-balance text-3xl font-semibold leading-[1.1] tracking-[-0.015em] text-ink-900 sm:text-4xl">
            A 20-minute look at your own numbers. No pitch.
          </h2>
        </div>

        <ol className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-3">
          {STEPS.map((s) => (
            <li key={s.n}>
              <p className="font-mono text-sm font-semibold tabular-nums text-accent-600">{s.n}</p>
              <h3 className="mt-3 font-display text-lg font-semibold text-ink-900">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-700">{s.b}</p>
            </li>
          ))}
        </ol>
      </SectionRail>

      {/* Risk reversal — the Revenue Engine guarantee (this funnel has one) */}
      <SectionRail tone="dark" glow="quiet">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-500">
            If we end up working together
          </p>
          <h2 className="mt-3 font-display text-balance text-3xl font-semibold leading-[1.1] tracking-[-0.015em] text-white sm:text-4xl">
            If the system doesn&rsquo;t pay for itself by day 90, I work free until it does.
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-200">
            You see the revenue it drives in your own dashboard &mdash; recovered
            calls, faster replies, estimates chased down. No annual lock-in: after
            the minimum, leave on 30 days&rsquo; notice and keep your ad account,
            your data, and your Google profile.
          </p>
          <a
            href="#audit"
            data-cta="revenue-leak-audit__lp-close"
            data-cta-location="campaign-final"
            className="mt-9 inline-flex items-center justify-center rounded-[4px] bg-accent-500 px-6 py-3.5 text-base font-semibold text-white shadow-cta transition-colors duration-200 hover:bg-accent-600"
          >
            Show me the leak →
          </a>
        </div>
      </SectionRail>
    </>
  )
}

function Dot() {
  return <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent-500" />
}
