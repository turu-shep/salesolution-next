import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'
import { FullGrowthTierCard } from '@/components/services/FullGrowthTierCard'
import { cn } from '@/lib/cn'

/**
 * /services/outbound-email/ § 7 — Engagement model.
 *
 * Mirrors the homepage EngagementModel shape: the Operator Retainer as the
 * service-specific tier, alongside the standardized Full Growth Ownership card
 * from the shared services system. The featured badge and accent strips use the
 * outbound green so this page reads as a single color story top-to-bottom.
 *
 * 2026-07-27 (FD2): the pilot rung is retired and no monthly figure is
 * published — the fee is quoted in the SOW.
 */

type Engagement = {
  key: string
  name: string
  cadence: string
  /** Replaces the old price figure: how the fee is set, not what it is. */
  scopeLine: string
  forWhom: string
  includes: string[]
  featured?: boolean
}

const ENGAGEMENTS: Engagement[] = [
  {
    key: 'retainer',
    name: 'Operator retainer',
    cadence: 'Quarterly · ongoing',
    scopeLine: 'One all-in number in the SOW, within 48 hours of the call.',
    forWhom: '"Make outbound a predictable pipeline line item."',
    featured: true,
    includes: [
      'Continuous deliverability + reputation management',
      'List refresh + sequence iteration every two weeks',
      'Reply triage routed to the operator who wrote the copy',
      'Monthly outcome review · direct Slack, no PMs',
    ],
  },
]

export function OutboundEngagement({ id }: { id?: string }) {
  return (
    <SectionRail tone="paper" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          How to work with us
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          Two ways in. Both scoped in writing.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          No discovery calls before the proposal. Pick the shape that fits, we
          tighten the scope on the first call, and you see the SOW within 48
          hours.
        </p>
      </div>

      <ul className="mt-14 grid gap-6 md:grid-cols-2">
        {ENGAGEMENTS.map((e) => (
          <li
            key={e.key}
            className={cn(
              'relative flex flex-col overflow-hidden border bg-surface transition-shadow duration-200',
              e.featured
                ? 'border-ink-900 shadow-[0_30px_80px_-30px_rgba(15,20,30,0.25)]'
                : 'border-rule hover:border-ink-700',
            )}
          >
            <span aria-hidden className="h-1 w-full bg-service-outbound-500" />

            {e.featured && (
              <span className="absolute -top-3 left-6 inline-flex items-center rounded-[3px] bg-service-outbound-500 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
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
              <p className="mt-3 text-base leading-relaxed text-ink-700">
                {e.scopeLine}
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
                href="/book-growth-call/"
                data-cta="book_call__outbound_engagement"
                data-cta-location="mid_body"
                className={cn(
                  'inline-flex w-full items-center justify-center gap-1.5 rounded-[4px] px-5 py-2.5 text-sm font-semibold transition-colors duration-200',
                  e.featured
                    ? 'bg-ink-900 text-white hover:bg-brand-600'
                    : 'border border-ink-300 bg-surface text-ink-900 hover:border-ink-900',
                )}
              >
                Book a strategy call
                <span aria-hidden>→</span>
              </Link>
            </div>
          </li>
        ))}

        <li className="flex">
          <FullGrowthTierCard className="w-full" />
        </li>
      </ul>

      <p className="mt-10 max-w-2xl text-sm text-ink-500">
        Need outbound layered onto an existing GTM motion or want us to
        diagnose an in-house team that&rsquo;s plateaued?{' '}
        <Link
          href="/contact-me/"
          data-cta="contact__outbound_fallthrough"
          data-cta-location="mid_body"
          className="font-semibold text-ink-900 underline decoration-rule-strong underline-offset-[5px] transition-colors duration-200 hover:text-brand-600 hover:decoration-brand-600"
        >
          Get in touch
        </Link>
        .
      </p>
    </SectionRail>
  )
}
