import { SectionRail } from '@/components/layout/SectionRail'

/**
 * Revenue Engine pillar § 5 — two revenue lines.
 *
 * Explains the PROVE report split. Dashboard described in words only —
 * no fabricated screenshot. A proof slot marks where a real dashboard
 * image goes once first-cohort data exists (spec §2.4).
 */

export function TwoRevenueLines({ id }: { id?: string }) {
  return (
    <SectionRail tone="surface" id={id}>
      <div className="grid gap-12 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            Proof, not promises
          </p>
          <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
            Two revenue lines,{' '}
            <span className="text-ink-500">on every report.</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-ink-700">
            Every month the dashboard separates what your ads produced from
            what the system recovered. You see exactly what you are paying me
            for.
          </p>
        </div>

        <div className="md:col-span-7">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="overflow-hidden rounded-[4px] border border-rule-strong bg-paper">
              <div aria-hidden className="h-1 bg-rule-strong" />
              <div className="p-7">
                <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-500">
                  Media-driven
                </dt>
                <dd className="mt-3 text-ink-700">
                  Revenue from leads your ad spend produced and the system
                  converted. Your fuel, run through the engine.
                </dd>
              </div>
            </div>
            <div className="overflow-hidden rounded-[4px] border border-rule-strong bg-paper">
              <div aria-hidden className="h-1 bg-brand-600" />
              <div className="p-7">
                <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-brand-600">
                  System-driven
                </dt>
                <dd className="mt-3 text-ink-700">
                  Recovered calls, estimate and treatment-plan follow-up,
                  database reactivation, and review-driven organic calls.
                  Revenue the engine produced on its own.
                </dd>
              </div>
            </div>
          </dl>
          <p className="mt-6 text-ink-700">
            The retention argument is simple: line two on its own should
            exceed the invoice.
          </p>
          {/* PROOF-SLOT: real attribution-dashboard image once first-cohort data exists (spec §2.4 / DP-5). */}
        </div>
      </div>
    </SectionRail>
  )
}
