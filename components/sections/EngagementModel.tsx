import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'
import { cn } from '@/lib/cn'

/**
 * Home § 4.5 — Engagement model.
 *
 * Founder/manager language. Three concrete options with "starts at"
 * ranges, what's included, and a one-line "for whom." Sits between
 * Services (what we do) and Evidence (proof it works) so the buying
 * decision feels supported in the natural flow.
 *
 * The middle option is emphasized — it's the most common entry point
 * for new engagements and the operator wants the eye to land there.
 */

type Engagement = {
  key: string
  name: string
  cadence: string
  price: string
  forWhom: string
  includes: string[]
  featured?: boolean
}

const ENGAGEMENTS: Engagement[] = [
  {
    key: 'sprint',
    name: 'Sprint',
    cadence: '4 weeks · fixed scope',
    price: '$12–24k',
    forWhom: '"Show me this works before we commit."',
    includes: [
      'Single-category schema rewrite',
      '20–40 page content restructure',
      '90-day AIO citation tracker',
      'One executive readout',
    ],
  },
  {
    key: 'retainer',
    name: 'Operator Retainer',
    cadence: 'Quarterly · ongoing',
    price: '$8–14k / month',
    forWhom: '"We know we have the structural problem. Fix it."',
    featured: true,
    includes: [
      'Schema, content & feed engineering on cadence',
      'Citation building + topical authority work',
      'Monthly outcome reviews on the metrics that matter',
      'Direct Slack to the operator (no PMs)',
    ],
  },
  {
    key: 'embedded',
    name: 'Embedded',
    cadence: 'Multi-quarter · by scope',
    price: 'From $28k / month',
    forWhom: '"We need fractional Head-of-AI-Search seniority."',
    includes: [
      'Acts as your AI-search lead',
      'Hires + trains your in-house team',
      'Owns the org-level GEO strategy',
      'Quarterly board-level reporting',
    ],
  },
]

export function EngagementModel({ id }: { id?: string }) {
  return (
    <SectionRail tone="paper" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          How to work with us
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          Three ways in. <span className="text-ink-500">All priced.</span>
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          No discovery calls before the proposal. Pick the shape that fits,
          we tighten the scope on the first call, and you see the SOW within
          48 hours.
        </p>
      </div>

      <ul className="mt-14 grid gap-6 md:grid-cols-3">
        {ENGAGEMENTS.map((e) => (
          <li
            key={e.key}
            className={cn(
              'relative flex flex-col border bg-surface transition-shadow duration-200',
              e.featured
                ? 'border-ink-900 shadow-[0_30px_80px_-30px_rgba(15,20,30,0.25)]'
                : 'border-rule hover:border-ink-700',
            )}
          >
            {e.featured && (
              <span className="absolute -top-3 left-6 inline-flex items-center rounded-[3px] bg-accent-500 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                Most engagements start here
              </span>
            )}

            <div className="border-b border-rule px-6 py-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
                {e.cadence}
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold tracking-[-0.01em] text-ink-900">
                {e.name}
              </h3>
              <p className="mt-3 font-display text-3xl font-semibold tabular-nums leading-none text-ink-900">
                {e.price}
              </p>
            </div>

            <div className="flex-1 px-6 py-6">
              <p className="text-sm italic text-ink-500">{e.forWhom}</p>

              <ul className="mt-5 space-y-3">
                {e.includes.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-ink-700">
                    <svg
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-rule px-6 py-4">
              <Link
                href={
                  e.key === 'sprint'
                    ? '/constraint-sprint/'
                    : e.key === 'retainer'
                      ? '/book-growth-call/'
                      : '/contact-me/'
                }
                className={cn(
                  'inline-flex w-full items-center justify-center gap-1.5 rounded-[4px] px-5 py-2.5 text-sm font-semibold transition-colors duration-200',
                  e.featured
                    ? 'bg-ink-900 text-white hover:bg-brand-600'
                    : 'border border-ink-300 bg-surface text-ink-900 hover:border-ink-900',
                )}
              >
                {e.key === 'sprint' && 'Scope a sprint'}
                {e.key === 'retainer' && 'Book a strategy call'}
                {e.key === 'embedded' && 'Talk to Artur directly'}
                <span aria-hidden>→</span>
              </Link>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-10 max-w-2xl text-sm text-ink-500">
        Need something different &mdash; M&amp;A diligence, in-house team
        training, board-level GEO advisory?{' '}
        <Link href="/contact-me/" className="font-semibold text-ink-900 underline decoration-rule-strong underline-offset-[5px] transition-colors duration-200 hover:text-brand-600 hover:decoration-brand-600">
          Get in touch
        </Link>
        .
      </p>
    </SectionRail>
  )
}
