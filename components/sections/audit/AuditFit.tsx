import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /unlock-growth-audit/ § 5 — honest fit check.
 *
 * Two columns, opinionated. Same data the old EligibilityList carried but
 * presented in the editorial language used across the rebuild — mono
 * eyebrows, ruled rows, no soft "wish list" decoration.
 */

const FITS = [
  'You do $200k+ per month in e-commerce revenue',
  'Growth has plateaued in the last 2–4 quarters',
  'You currently work with multiple agencies and lack a unifying strategy',
  'You make product / catalog decisions with a 12+ month horizon',
  'Your catalog is specification-heavy: industrial, MRO, lab supply, technical DTC',
]

const NOT_FITS = [
  'You are pre-revenue or under $50k / month',
  'You want a quick-fix bandage rather than a strategic diagnosis',
  'You are not the decision-maker on marketing spend',
  'You sell commodity SKUs that don’t require spec comparison',
  'You need a one-off deliverable, not a thinking partner',
]

export function AuditFit({ id }: { id?: string }) {
  return (
    <SectionRail tone="surface" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          Honest fit check
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          Is this audit for you? <span className="text-ink-500">We&rsquo;ll tell you straight.</span>
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-700">
          The audit is free, but it&rsquo;s most useful to a specific kind
          of buyer. If you&rsquo;re in the right-hand column, we&rsquo;ll
          email back and recommend who you should hire instead.
        </p>
      </div>

      <div className="mt-14 grid gap-px border border-rule bg-rule md:grid-cols-2">
        <div className="bg-paper p-7 sm:p-10">
          <div className="flex items-baseline justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-data-up">
              Strong fit
            </p>
            <span aria-hidden className="font-mono text-[10px] uppercase tracking-[0.18em] tabular-nums text-ink-400">
              0{FITS.length}
            </span>
          </div>
          <h3 className="mt-3 font-display text-2xl font-semibold leading-tight text-ink-900">
            Book the audit if&hellip;
          </h3>
          <ul className="mt-6 space-y-px">
            {FITS.map((f, i) => (
              <li
                key={i}
                className="flex items-start gap-4 border-t border-rule py-4 first:border-t-0"
              >
                <span aria-hidden className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-data-up/15 text-data-up">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-2.5 w-2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span className="text-sm text-ink-700">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-paper p-7 sm:p-10">
          <div className="flex items-baseline justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
              Probably not yet
            </p>
            <span aria-hidden className="font-mono text-[10px] uppercase tracking-[0.18em] tabular-nums text-ink-400">
              0{NOT_FITS.length}
            </span>
          </div>
          <h3 className="mt-3 font-display text-2xl font-semibold leading-tight text-ink-900">
            Skip it if&hellip;
          </h3>
          <ul className="mt-6 space-y-px">
            {NOT_FITS.map((f, i) => (
              <li
                key={i}
                className="flex items-start gap-4 border-t border-rule py-4 first:border-t-0"
              >
                <span aria-hidden className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-ink-400/15 text-ink-500">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-2.5 w-2.5">
                    <line x1="6" y1="6" x2="18" y2="18" />
                    <line x1="6" y1="18" x2="18" y2="6" />
                  </svg>
                </span>
                <span className="text-sm text-ink-500">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-10 max-w-2xl text-sm text-ink-500">
        Edge case in either column? Book anyway and write it in the
        frustration field &mdash; we&rsquo;ll reply personally before
        running anything.
      </p>
    </SectionRail>
  )
}
