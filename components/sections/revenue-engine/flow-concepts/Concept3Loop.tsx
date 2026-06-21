import { SectionRail } from '@/components/layout/SectionRail'

import { PILLARS } from './data'

/**
 * Concept 3 — The loop.
 * Bring -> Sell -> Retain shown as a closed loop: retain feeds back into bring
 * (repeat + referrals lower what the next customer costs). The compounding is
 * the argument pure-ads can't make.
 */
export function Concept3Loop() {
  return (
    <SectionRail tone="dark" glow="strong">
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
          One connected flow
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
          Bring. Sell. Retain.{' '}
          <span className="text-ink-300">Then it compounds.</span>
        </h2>
      </div>

      <div className="mt-12">
        <div className="grid gap-4 sm:grid-cols-3">
          {PILLARS.map((p) => (
            <div key={p.n} className="rounded-[4px] border border-white/10 bg-white/[0.03] p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 font-mono text-xs tabular-nums text-ink-300">
                  {p.n}
                </span>
                <h3 className="font-display text-xl font-semibold text-white">{p.verb}</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-200">{p.outcome}.</p>
            </div>
          ))}
        </div>

        {/* the loop-back */}
        <div className="mt-4 flex items-center gap-3 rounded-[4px] border border-dashed border-accent-500/40 bg-accent-500/[0.06] px-5 py-4">
          <span aria-hidden className="font-mono text-lg text-accent-500">
            ↺
          </span>
          <p className="text-sm leading-relaxed text-ink-200">
            <span className="font-semibold text-white">Retain feeds Bring.</span> Repeat
            buyers and the people they refer lower what it costs to bring the next one. A
            one-off campaign can’t do that. A flow can.
          </p>
        </div>
      </div>
    </SectionRail>
  )
}
