import { SectionRail } from '@/components/layout/SectionRail'

import { PILLARS } from './data'

/**
 * Concept 4 — Leak -> Fix bridge.
 * Maps one-to-one onto the three-leak villain section: for each place customers
 * are lost (bring / sell / retain), the fix I run. Strongest narrative cohesion
 * when paired with the reframed leak block right above it.
 */
export function Concept4Bridge() {
  return (
    <SectionRail tone="surface">
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          From the leak to the fix
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          Three places you lose customers.{' '}
          Three I run.
        </h2>
      </div>

      <div className="mt-12 divide-y divide-rule border-y border-rule">
        {PILLARS.map((p) => (
          <div
            key={p.n}
            className="grid items-center gap-x-6 gap-y-3 py-6 md:grid-cols-[1fr_auto_1fr]"
          >
            {/* the leak */}
            <div className="flex items-start gap-3">
              <span aria-hidden className="mt-0.5 font-mono text-xs text-ink-300">
                ✕
              </span>
              <p className="text-base leading-snug text-ink-500">{p.leak}</p>
            </div>

            {/* arrow */}
            <span
              aria-hidden
              className="hidden text-xl text-accent-500 md:block"
            >
              →
            </span>

            {/* the fix */}
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-600">
                {p.verb}
              </p>
              <p className="mt-1 text-base font-semibold leading-snug text-ink-900">{p.fix}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-8 max-w-2xl text-base font-semibold leading-relaxed text-ink-900">
        Run all three as one flow, and the customers stop slipping between them.
      </p>
    </SectionRail>
  )
}
