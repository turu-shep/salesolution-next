import { SectionRail } from '@/components/layout/SectionRail'

import { CountUp } from '../CountUp'

/**
 * /services/catalog-ai/ § 2 — Why AI search broke catalog SEO.
 *
 * Four stats with sourced citations, framed by the "manufacturer-supplied
 * copy doesn't get cited" argument. Dark band so the proof reads as
 * substance, mirroring `MarketReality` on /services/ai-seo/.
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
    value: 48,
    unit: '%',
    label: 'US searches now trigger AI Overviews',
    source: 'BrightEdge AIO tracker · Q1 2026',
  },
  {
    prefix: '−',
    value: 61,
    unit: '%',
    label: 'Organic CTR when an AIO appears',
    source: 'Pew Research + Ahrefs SERP study · 2025',
  },
  {
    value: 14,
    unit: '%',
    label: 'Shopping queries triggering AIO',
    source: 'BrightEdge shopping panel · Jan 2026 (5.6× growth in 4 months)',
  },
  {
    prefix: '+',
    value: 35,
    unit: '%',
    label: 'Extra organic clicks for AIO-cited brands',
    source: 'Authoritas citation-share report · 2025',
  },
]

export function CatalogMarketProblem({ id }: { id?: string }) {
  return (
    <SectionRail tone="dark" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
          Why now
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
          AI Overviews cite product pages. Most catalogs aren&rsquo;t built for it.
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-300">
          For a distributor with 10,000 SKUs the math is brutal: every
          product page that isn&rsquo;t engineered for AI citation is
          invisible in the new search surface. Manufacturer-supplied copy
          doesn&rsquo;t get cited &mdash; AI engines deduplicate it across
          the 40+ distributors who all use the same text.
        </p>
      </div>

      <ul className="mt-16 grid gap-x-10 gap-y-12 border-t border-white/10 pt-12 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <li
            key={s.label}
            className={
              i > 0
                ? 'sm:border-l sm:border-white/10 sm:pl-10'
                : ''
            }
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
              Δ &middot; AI search
            </p>
            <p className="mt-3 font-display text-5xl font-semibold leading-[0.95] tabular-nums tracking-[-0.03em] text-white sm:text-6xl">
              {s.prefix && <span className="text-accent-500">{s.prefix}</span>}
              <CountUp value={s.value} />
              <span className="text-ink-400">{s.unit}</span>
            </p>
            <p className="mt-5 font-display text-base font-semibold leading-snug text-white">
              {s.label}
            </p>
            <p className="mt-2 font-mono text-[11px] leading-relaxed text-ink-400">
              {s.source}
            </p>
          </li>
        ))}
      </ul>

      <p className="mt-12 max-w-2xl text-sm leading-relaxed text-ink-400">
        The fix is structural: content depth per product, schema
        completeness, and citation-engineered Q&amp;A blocks. That&rsquo;s
        what Catalog AI ships.
      </p>
    </SectionRail>
  )
}
