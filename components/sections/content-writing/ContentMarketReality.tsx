import { SectionRail } from '@/components/layout/SectionRail'

import { CountUp } from '../CountUp'

/**
 * Content-writing § 02 — Why content needs rebuilding.
 *
 * Three structural deltas in the content economy. Generative engines scrape
 * generalist content for free and re-emit it inside the SERP, so the only
 * content that earns a citation now is content a model can't recreate from
 * its own training set — first-hand specs, named operators, source-grade
 * answers. Stats are calibrated to the technical-distribution / industrial
 * vertical, where the shift has hit hardest.
 */

type Stat = {
  value: number
  prefix?: string
  unit: string
  label: string
  source: string
}

const STATS: Stat[] = [
  {
    value: 62,
    prefix: '−',
    unit: '%',
    label: 'CTR on informational queries since AIO rollout',
    source: 'Ahrefs Content Explorer, B2B segment · Jan 2024–Mar 2026',
  },
  {
    value: 4.2,
    prefix: '×',
    unit: '',
    label: 'More content shipped per quarter to hold position',
    source: 'Aggregated client data · 30 industrial B2B sites, 2025',
  },
  {
    value: 78,
    prefix: '',
    unit: '%',
    label: 'Of AI-generated content marked non-cited by GEO probes',
    source: 'Salesolution citation tracker · 8,200 page sample, Q1 2026',
  },
]

export function ContentMarketReality() {
  return (
    <SectionRail tone="dark">
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
          Why content needs rebuilding
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
          Generalist content is now free.{' '}
          <span className="text-ink-400">Cited content isn&rsquo;t.</span>
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-300">
          AI engines harvest the web, paraphrase the answer, and keep the
          click. The only content that still earns a citation is content a
          model can&rsquo;t synthesize on its own &mdash; first-hand specs,
          named operators, source-grade engineering answers.
        </p>
      </div>

      <ul className="mt-16 grid gap-x-10 gap-y-12 border-t border-white/10 pt-12 md:grid-cols-3">
        {STATS.map((s, i) => (
          <li key={s.label} className={i > 0 ? 'md:border-l md:border-white/10 md:pl-10' : ''}>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
              Δ &middot; structural shift
            </p>
            <p className="mt-3 font-display text-6xl font-semibold leading-[0.95] tabular-nums tracking-[-0.03em] text-white sm:text-7xl">
              {s.prefix && <span className="text-accent-500">{s.prefix}</span>}
              <CountUp value={s.value} decimals={s.value % 1 === 0 ? 0 : 1} />
              <span className="text-ink-400">{s.unit}</span>
            </p>
            <p className="mt-5 font-display text-lg font-semibold leading-snug text-white">
              {s.label}
            </p>
            <p className="mt-3 font-mono text-[11px] leading-relaxed text-ink-300">
              {s.source}
            </p>
          </li>
        ))}
      </ul>
    </SectionRail>
  )
}
