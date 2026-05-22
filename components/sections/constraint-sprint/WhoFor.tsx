import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /constraint-sprint/ § 5 — Who this is for.
 *
 * Two columns: fit / not-fit. Calls itself out honestly so the wrong-fit
 * buyer self-disqualifies before the form. Paper tone — sits between the
 * dark Deliverables and dark Apply bands.
 */

const FIT = [
  '$2M–$20M annual revenue, plateaued or decelerating',
  'Running multiple agencies and feeling the seams',
  'You\'ve already tried the obvious fixes — the next move is structural',
  'A founder / GM / Head of Growth empowered to act on the diagnostic',
  'Industrial e-commerce, hydraulics, MRO, technical distribution, contract manufacturing',
]

const NOT_FIT = [
  'Under $1M ARR — the setup cost doesn\'t amortise',
  'Looking for an audit you can shelve, not act on',
  'Pure-DTC fashion / lifestyle with no specification-driven buyers',
  'Need a 12-month retainer relationship as the entry point',
  'Want quick-fix CRO tactics, not structural diagnosis',
]

export function WhoFor() {
  return (
    <SectionRail tone="paper" id="fit">
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          Who this is for
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          Built for one buyer.{' '}
          <span className="text-ink-500">Not the right call for everyone.</span>
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-700">
          The sprint earns its keep when there&rsquo;s real revenue at stake
          and a real decision-maker on the other side. If either is missing,
          we&rsquo;ll say so on the first call.
        </p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-2">
        {/* Fit */}
        <div className="border border-rule bg-surface p-7">
          <div className="flex items-center gap-3 border-b border-rule pb-4">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-data-up/15">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3.5 w-3.5 text-data-up"
                aria-hidden
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-data-up">
              Strong fit
            </p>
          </div>
          <ul className="mt-5 space-y-3.5">
            {FIT.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-sm leading-relaxed text-ink-700"
              >
                <span
                  aria-hidden
                  className="mt-2 h-1 w-3 shrink-0 bg-data-up"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Not fit */}
        <div className="border border-rule bg-surface p-7">
          <div className="flex items-center gap-3 border-b border-rule pb-4">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-data-down/15">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3.5 w-3.5 text-data-down"
                aria-hidden
              >
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </span>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-data-down">
              Probably not a fit
            </p>
          </div>
          <ul className="mt-5 space-y-3.5">
            {NOT_FIT.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-sm leading-relaxed text-ink-700"
              >
                <span
                  aria-hidden
                  className="mt-2 h-1 w-3 shrink-0 bg-ink-300"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SectionRail>
  )
}
