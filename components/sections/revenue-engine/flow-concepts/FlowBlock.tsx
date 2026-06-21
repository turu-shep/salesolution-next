import { Fragment } from 'react'

import { SectionRail } from '@/components/layout/SectionRail'

import { PILLARS } from './data'

/**
 * Revenue Engine — screen 3, the mechanism beat (reframed engine-vs-fuel).
 *
 * Story job: right after the leak makes them feel the bleed, shift belief from
 * "I've been sold disconnected pieces" to "one operator runs my whole customer
 * flow." The credible mechanism (not a bigger claim): the pieces don't talk to
 * each other, so customers fall into the gaps — I run all three as one system.
 *
 * Eye-path by weight: headline (the turn) -> three big stage words on a
 * connected track -> the compounding loop -> the trust line (what I don't do).
 */
export function FlowBlock() {
  return (
    <SectionRail tone="dark" glow="strong">
      {/* 1 — the turn (full contrast; the payoff line lands last and bright) */}
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">The fix</p>
        <h2 className="mt-4 font-display text-[2.5rem] font-semibold leading-[1.0] tracking-[-0.025em] text-white sm:text-5xl lg:text-[3.5rem]">
          <span className="block">You’ve been sold pieces.</span>
          <span className="block">I run the whole flow.</span>
        </h2>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-200">
          A website, an ad, a CRM — each sold by someone who never saw the other two.
          Customers fall into the gaps between them. I run all three as one system, so they
          don’t.
        </p>
      </div>

      {/* 2 — the mechanism as a connected flow (the scan anchors) */}
      <div className="mt-12 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-10 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.6)] sm:px-8">
        <div className="flex flex-col items-stretch sm:flex-row sm:items-start sm:justify-center">
          {PILLARS.map((p, i) => (
            <Fragment key={p.n}>
              <div className="text-center sm:w-40 sm:shrink-0">
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-accent-500 font-mono text-sm font-bold tabular-nums text-white">
                  {p.n}
                </span>
                <h3 className="mt-5 font-display text-[2rem] font-semibold leading-none tracking-[-0.02em] text-white sm:text-4xl">
                  {p.verb}
                </h3>
                <p className="mx-auto mt-3 max-w-[22ch] text-sm leading-relaxed text-ink-200">
                  {p.outcome}.
                </p>
              </div>
              {i < PILLARS.length - 1 && (
                <div className="flex items-center justify-center sm:h-11 sm:flex-1 sm:px-2">
                  <span aria-hidden className="py-2 text-2xl text-accent-500 sm:hidden">↓</span>
                  <span aria-hidden className="hidden h-px flex-1 bg-white/25 sm:block" />
                  <span aria-hidden className="hidden px-2 text-xl text-accent-500 sm:block">›</span>
                  <span aria-hidden className="hidden h-px flex-1 bg-white/25 sm:block" />
                </div>
              )}
            </Fragment>
          ))}
        </div>
      </div>

      {/* 3 — the compounding loop, promoted with a left accent rule */}
      <div className="mt-5 flex items-start gap-3 rounded-[4px] border-l-2 border-accent-500 bg-accent-500/[0.06] px-5 py-4">
        <span aria-hidden className="mt-0.5 font-mono text-lg text-accent-500">↺</span>
        <p className="text-base leading-relaxed text-ink-100">
          <span className="font-semibold text-white">Retain feeds Bring.</span> A repeat
          customer or a referral costs almost nothing to win. A one-off campaign can’t do
          that.
        </p>
      </div>

      {/* 4 — the trust line (what I don't do), its own beat, bright */}
      <div className="mt-12 border-t border-white/10 pt-7">
        <p className="flex flex-col gap-x-10 gap-y-2.5 text-lg font-semibold text-white sm:flex-row sm:flex-wrap">
          <span>No markup on your ad spend.</span>
          <span>I don’t resell your leads.</span>
          <span>No lock-in.</span>
        </p>
        <p className="mt-7 text-sm text-ink-400">
          That’s the flow. Here’s how I run each part.{' '}
          <span aria-hidden className="text-ink-500">↓</span>
        </p>
      </div>
    </SectionRail>
  )
}
