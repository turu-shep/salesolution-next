import type { Metadata } from 'next'

import { SectionRail } from '@/components/layout/SectionRail'
import { FullGrowthQuoteForm } from '@/components/forms/FullGrowthQuoteForm'
import { CompositeBar } from '@/components/services/CompositeBar'

export const metadata: Metadata = {
  title: 'Get a Full Growth Ownership quote',
  description:
    "Three questions, about 3 minutes. Artur replies personally within 24 business hours with a 1-page diagnostic and a suggested call time. No SDR loop, no drip sequence.",
  alternates: { canonical: 'https://salesolution.net/full-growth-quote/' },
  robots: { index: false, follow: true },
}

const REASSURANCES = [
  {
    title: 'Personal reply',
    body: 'Artur reads every submission and writes the response himself. No SDR loop.',
  },
  {
    title: '24-hour turnaround',
    body: '1-page written diagnostic + suggested call time within 24 business hours.',
  },
  {
    title: 'Written SOW',
    body: 'If we fit, the SOW with shape, scope, price, and exit terms lands in another 48 hours.',
  },
  {
    title: "We'll say no",
    body: "If FGO isn't the right shape, we'll tell you on the first call and recommend who is.",
  },
]

export default function FullGrowthQuotePage() {
  return (
    <>
      <CompositeBar weight="hero" />

      <SectionRail tone="dark" size="lg">
        <div className="grid gap-14 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-500">
              Full Growth Ownership &middot; qualifier
            </p>
            <h1 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl md:text-6xl">
              Three questions. One personal reply.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-300">
              The qualifier takes about 3 minutes. We use it to figure out
              which shape (Fractional GTM Engineer or Coordinated Retainer)
              fits before the first call, so we don&rsquo;t waste your time
              on a generic discovery loop.
            </p>

            <ul className="mt-12 grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2">
              {REASSURANCES.map((r) => (
                <li key={r.title} className="border-t border-white/15 pt-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-500">
                    {r.title}
                  </p>
                  <p className="mt-2 text-sm text-ink-300">{r.body}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-6">
            <div className="rounded-[6px] border border-white/20 bg-paper p-1 shadow-cta">
              <div className="rounded-[5px] bg-surface px-5 pb-5 pt-5 sm:px-7 sm:pb-6 sm:pt-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-700">
                  Get a Full Growth Ownership quote
                </p>
                <p className="mt-1 font-display text-2xl font-semibold leading-snug text-ink-900">
                  Three steps. About three minutes.
                </p>
                <p className="mt-2 text-sm text-ink-500">
                  Written quote in your inbox within 24 business hours.
                </p>
              </div>
              <FullGrowthQuoteForm className="rounded-t-none border-t border-rule shadow-none ring-0" />
            </div>
          </div>
        </div>
      </SectionRail>
    </>
  )
}
