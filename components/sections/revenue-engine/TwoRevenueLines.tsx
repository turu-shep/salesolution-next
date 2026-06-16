import { SectionRail } from '@/components/layout/SectionRail'

/**
 * Revenue Engine § two revenue lines — proof by logic, on a dark band.
 *
 * The PROVE report splits media-driven from system-driven revenue. Shown as
 * a two-bar chart with the monthly fee marked, so the retention argument —
 * the system-driven line alone clears the invoice — is seen, not just read.
 * Dark treatment reads like a dashboard and anchors the page's mid rhythm.
 * Bar heights are illustrative; a proof slot waits for a real dashboard.
 */

export function TwoRevenueLines({ id }: { id?: string }) {
  return (
    <SectionRail tone="dark" id={id} glow="quiet">
      <div className="grid items-center gap-12 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
            Proof, not promises
          </p>
          <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
            Two revenue lines,{' '}
            <span className="text-ink-400">on every report.</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-ink-200">
            Every month I split what your ads produced from what the system
            recovered. The honest test: the second line alone should cover
            what you pay me.
          </p>
        </div>

        <div className="md:col-span-7">
          <div className="rounded-[4px] border border-white/10 bg-white/[0.03] p-7">
            <div className="relative h-56">
              {/* monthly fee marker */}
              <div
                className="absolute inset-x-0 border-t border-dashed border-white/30"
                style={{ bottom: '22%' }}
              />
              <span
                className="absolute right-0 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-300"
                style={{ bottom: 'calc(22% + 5px)' }}
              >
                monthly fee
              </span>

              <div className="flex h-full items-end gap-10 px-2">
                <div className="flex h-full flex-1 items-end justify-center">
                  <div
                    className="w-full max-w-[110px] rounded-t-[3px] bg-white/25"
                    style={{ height: '50%' }}
                  />
                </div>
                <div className="flex h-full flex-1 items-end justify-center">
                  <div
                    className="w-full max-w-[110px] rounded-t-[3px] bg-brand-600"
                    style={{ height: '86%' }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-8 border-t border-white/10 pt-5 text-center">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-300">
                  Media-driven
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-300">
                  Your ad spend, run through the engine.
                </p>
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-brand-300">
                  System-driven
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-300">
                  Recovered calls, follow-up, reactivation, reviews.
                </p>
              </div>
            </div>
          </div>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-400">
            Illustrative — your figures come from the live dashboard
          </p>
          {/* PROOF-SLOT: real attribution-dashboard image once first-cohort data exists (spec §2.4 / DP-5). */}
        </div>
      </div>
    </SectionRail>
  )
}
