import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /future-proof-your-seo/ § 04 — Proof band on dark.
 *
 * Four big stats that give the page its "the cliff is real" punch, plus a
 * single pull-quote from an operator who&rsquo;s already run the checklist.
 * Stats are the same rhythm as homepage Evidence — large display numbers,
 * mono caption row underneath.
 */

const STATS = [
  { value: '−34%',   label: 'CTR drop on AIO-affected pages',     source: 'Ahrefs, 2025' },
  { value: '40-60%', label: 'Traffic loss on info-heavy stores',  source: 'Pew Research' },
  { value: '<24mo',  label: 'Until paid AIO placements ship',     source: 'Google I/O · roadmap' },
  { value: '1 in 3', label: 'Clicks evaporated across categories', source: 'BrightEdge' },
] as const

const QUOTE = {
  text: 'We ran the checklist on a Friday afternoon and found nine schema gaps on our top three category pages. Citation share moved inside a month — before we even bought any of the work.',
  attrib: 'Head of Digital',
  org: 'Hydraulics distributor · 4,200 SKUs',
}

export function ProofBand() {
  return (
    <SectionRail tone="dark">
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-500">
          The cliff &middot; in numbers
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
          This isn&rsquo;t a forecast.{' '}
          It&rsquo;s already in your analytics.
        </h2>
      </div>

      <dl className="mt-14 grid grid-cols-2 gap-x-8 gap-y-12 border-t border-white/10 pt-10 sm:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label}>
            <dt className="sr-only">{s.label}</dt>
            <dd>
              <div className="font-display text-4xl font-semibold tabular-nums leading-none text-white sm:text-5xl">
                {s.value}
              </div>
              <div className="mt-3 text-sm leading-snug text-ink-300">
                {s.label}
              </div>
              <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
                {s.source}
              </div>
            </dd>
          </div>
        ))}
      </dl>

      <figure className="mt-16 border-t border-white/10 pt-10">
        <blockquote className="max-w-3xl font-display text-2xl font-medium leading-snug text-white sm:text-3xl">
          <span aria-hidden className="mr-2 text-white/30">&ldquo;</span>
          {QUOTE.text}
          <span aria-hidden className="ml-1 text-white/30">&rdquo;</span>
        </blockquote>
        <figcaption className="mt-5 text-sm text-ink-300">
          <span className="font-semibold text-white">{QUOTE.attrib}</span>
          <span aria-hidden className="mx-2 text-white/30">&middot;</span>
          <span>{QUOTE.org}</span>
        </figcaption>
      </figure>
    </SectionRail>
  )
}
