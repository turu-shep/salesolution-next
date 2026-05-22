import { SectionRail } from '@/components/layout/SectionRail'

import { CountUp } from '../CountUp'

/**
 * /services/ § 2 — Market reality.
 *
 * Three big delta numbers showing the structural shifts in B2B technical
 * search over the last 18 months. The stats land as proof-by-glance,
 * count-up on view, paired with source notes so the reader can verify.
 */

type Stat = {
  value: number
  prefix?: string
  unit: string
  label: string
  source: string
  intent: 'down' | 'up' | 'flat'
}

const STATS: Stat[] = [
  {
    value: 32,
    prefix: '+',
    unit: '%',
    label: 'CPC costs',
    source: 'B2B paid-search benchmark · WordStream + Tinuiti, 2025',
    intent: 'down',
  },
  {
    value: 43,
    prefix: '−',
    unit: '%',
    label: 'CTR on AIO-triggered queries',
    source: 'BrightEdge + Pew AIO tracker, Q1 2026',
    intent: 'down',
  },
  {
    value: 50,
    prefix: '+',
    unit: '%',
    label: 'Lost backlinks · informational',
    source: 'Ahrefs Content Explorer, Aug 2024–Jan 2026',
    intent: 'down',
  },
]

export function MarketReality() {
  return (
    <SectionRail tone="dark">
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
          The market reality
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
          What changed in 18 months. <span className="text-ink-400">Structural, not cyclical.</span>
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-300">
          Technical-distribution e&#8209;commerce is the canary. Three
          metrics moved in lockstep across our client portfolio and the
          public benchmarks &mdash; and none of them are going back.
        </p>
      </div>

      <ul className="mt-16 grid gap-x-10 gap-y-12 border-t border-white/10 pt-12 md:grid-cols-3">
        {STATS.map((s, i) => (
          <li key={s.label} className={i > 0 ? 'md:border-l md:border-white/10 md:pl-10' : ''}>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
              Δ &middot; 18 months
            </p>
            <p className="mt-3 font-display text-6xl font-semibold leading-[0.95] tabular-nums tracking-[-0.03em] text-white sm:text-7xl">
              <span className="text-accent-500">{s.prefix}</span>
              <CountUp value={s.value} />
              <span className="text-ink-400">{s.unit}</span>
            </p>
            <p className="mt-5 font-display text-lg font-semibold leading-snug text-white">
              {s.label}
            </p>
            <p className="mt-3 font-mono text-[11px] leading-relaxed text-ink-400">
              {s.source}
            </p>
          </li>
        ))}
      </ul>
    </SectionRail>
  )
}
