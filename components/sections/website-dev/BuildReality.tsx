import { SectionRail } from '@/components/layout/SectionRail'

import { CountUp } from '../CountUp'

/**
 * /services/website-development-design-services/ § 2 — Build reality.
 *
 * Three numbers that frame why most industrial e-commerce sites underperform:
 * the median field LCP, the median plugin count on a 5-year-old WooCommerce
 * store, and the share of Magento 1 / 2 stores past EOL that still process
 * revenue. Sets up the rebuild conversation without selling.
 */

type Stat = {
  value: number
  prefix?: string
  suffix?: string
  unit: string
  decimals?: number
  label: string
  source: string
}

const STATS: Stat[] = [
  {
    value: 3.8,
    decimals: 1,
    unit: 's',
    label: 'Median LCP · e-commerce CrUX',
    source: 'Chrome UX Report · p75 mobile · Q1 2026',
  },
  {
    value: 42,
    unit: '',
    label: 'Median plugin count · 5-yr-old WooCommerce',
    source: 'Wordfence + Sucuri scan dataset · 2026',
  },
  {
    value: 67,
    prefix: '',
    unit: '%',
    label: 'Magento 1 / 2 stores past EOL still on production',
    source: 'BuiltWith + Sansec inventory · Apr 2026',
  },
]

export function BuildReality() {
  return (
    <SectionRail tone="dark">
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
          The build reality
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
          The site is the asset. Most industrial stores are bleeding from it.
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-300">
          Three numbers from the public benchmarks that should drive every
          rebuild decision &mdash; load time on the device your buyer
          actually uses, the technical debt sitting under five years of
          plugin choices, and the platform-EOL exposure most distributors
          carry but never quantify.
        </p>
      </div>

      <ul className="mt-16 grid gap-x-10 gap-y-12 border-t border-white/10 pt-12 md:grid-cols-3">
        {STATS.map((s, i) => (
          <li key={s.label} className={i > 0 ? 'md:border-l md:border-white/10 md:pl-10' : ''}>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
              Public benchmark
            </p>
            <p className="mt-3 font-display text-6xl font-semibold leading-[0.95] tabular-nums tracking-[-0.03em] text-white sm:text-7xl">
              {s.prefix && <span className="text-accent-500">{s.prefix}</span>}
              <CountUp value={s.value} decimals={s.decimals ?? 0} />
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
