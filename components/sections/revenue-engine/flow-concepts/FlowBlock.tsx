import { Fragment } from 'react'

import { SectionRail } from '@/components/layout/SectionRail'

import { PillarIcon } from '../pillar-icons'
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
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-accent-500 text-white">
                  <PillarIcon pillar={p.verb} className="h-[22px] w-[22px]" />
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

      {/* 3a — desktop return-arc: Retain (right) loops back to Bring (left) */}
      <div className="relative mt-3 hidden h-9 sm:block" aria-hidden>
        <svg
          viewBox="0 0 1000 40"
          preserveAspectRatio="none"
          className="h-full w-full overflow-visible text-accent-500/40"
        >
          <path
            d="M820 2 C 820 40, 180 40, 180 7"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeDasharray="5 6"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <span className="absolute left-[18%] top-[-3px] -translate-x-1/2 text-accent-500/70">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 5 6 1l4 4" />
          </svg>
        </span>
      </div>

      {/* 3b — the compounding loop, promoted with a left accent rule */}
      <div className="mt-3 flex items-start gap-3 rounded-[4px] border-l-2 border-accent-500 bg-accent-500/[0.06] px-5 py-4">
        <span aria-hidden className="mt-0.5 shrink-0 text-accent-500">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.7 9.7 0 0 0-6.5 2.5L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </span>
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
