import { SectionRail } from '@/components/layout/SectionRail'

/**
 * Revenue Engine § two revenue lines — proof by logic, on a dark band.
 *
 * The PROVE report splits media-driven from system-driven revenue. Shown as
 * an honest report layout (rows + the fee as its own line), so the retention
 * argument — the system-driven line alone clears the invoice — is made by
 * structure and copy, not by invented bar heights. Dark treatment reads like a
 * dashboard. A proof slot waits for a real, figure-filled dashboard image.
 */

export function TwoRevenueLines({
  id,
  eyebrow = 'How I report it',
  headline = (
    <>
      Two lines on every report.{' '}
      The second has to clear my fee.
    </>
  ),
  lede = 'Each month I split what your ads produced from what the system brought back. The honest test: the recovered line alone should cover what you pay me.',
  closer = (
    <>
      The system line is calls won back, quotes chased, past customers brought back, and
      people who found you from new reviews &mdash; counted in your own dashboard, not
      estimated on my spreadsheet.{' '}
      <span className="font-medium text-white">
        If it doesn&rsquo;t clear the fee, the next section is for you.
      </span>
    </>
  ),
}: {
  id?: string
  /** Defaults to the founder "I" voice; the cross-vertical product page passes
   *  firm "we" copy with no fee phrasing. */
  eyebrow?: React.ReactNode
  headline?: React.ReactNode
  lede?: React.ReactNode
  closer?: React.ReactNode
}) {
  return (
    <SectionRail tone="dark" id={id} glow="strong">
      <div className="grid items-center gap-12 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
            {eyebrow}
          </p>
          <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
            {headline}
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-ink-200">{lede}</p>
        </div>

        <div className="md:col-span-7">
          <div className="rounded-[4px] border border-white/10 bg-white/[0.03] p-7">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
                Your monthly report
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-300">
                your figures
              </p>
            </div>

            <ul className="divide-y divide-white/10">
              <li className="py-5">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="font-display text-lg font-semibold text-white">Media-driven</p>
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-300">
                    from your ads
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-300">
                  Your ad spend, run through the engine.
                </p>
              </li>
              <li className="py-5">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="font-display text-lg font-semibold text-brand-300">
                    System-driven
                  </p>
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-brand-300">
                    the line that clears the fee
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-300">
                  Calls won back, quotes chased, past customers returning, new reviews.
                </p>
              </li>
            </ul>

            <div className="mt-1 flex items-center justify-between border-t-2 border-white/20 pt-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-200">
                Your monthly fee
              </p>
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-200">
                one line on the report
              </span>
            </div>

            <p className="mt-6 text-sm leading-relaxed text-ink-300">{closer}</p>
          </div>
          {/* PROOF-SLOT: real attribution-dashboard image once first-cohort data exists (spec §2.4 / DP-5). */}
        </div>
      </div>
    </SectionRail>
  )
}
