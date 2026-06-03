import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /v2-1/ — Northern Hydraulics case study, one screen.
 *
 * Big numbers left, short prose right. Dark band so the case study reads
 * as a distinct moment in the page rhythm (paper → paper → paper →
 * surface → DARK → paper).
 */

type Stat = { value: string; label: string }

const STATS: Stat[] = [
  { value: '+43%', label: 'qualified leads in 6 months' },
  { value: '×12.7', label: 'AIO citation share in the catalog' },
  { value: '×8.5', label: 'organic CTR on top 50 commercial queries' },
  { value: '3 weeks', label: 'to ship the full catalog rewrite' },
]

export function HomeV2CaseStudy() {
  return (
    <SectionRail tone="dark">
      <div className="max-w-4xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
          Case study
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
          Northern Hydraulics.{' '}
          <span className="text-ink-400">
            8,500 SKUs. 43% more qualified leads in 6 months.
          </span>
        </h2>
      </div>

      <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-14">
        {/* Stats grid — 4 cards, 2x2 on mobile, 2x2 on desktop too because
            stacked beside the prose column they read better as a square. */}
        <ul className="grid gap-px overflow-hidden bg-white/10 sm:grid-cols-2 lg:col-span-5">
          {STATS.map((stat) => (
            <li
              key={stat.label}
              className="flex flex-col gap-2 bg-surface-dark p-6"
            >
              <p className="font-display text-5xl font-semibold leading-none tracking-[-0.02em] text-white">
                {stat.value}
              </p>
              <p className="text-sm leading-relaxed text-ink-300">
                {stat.label}
              </p>
            </li>
          ))}
        </ul>

        <div className="space-y-5 text-lg leading-relaxed text-ink-200 lg:col-span-7">
          <p>
            8,500-SKU hydraulics distributor, late-2025 baseline: organic
            traffic dropping 20% YoY as AI Overviews ate informational-query
            CTR. Catalog descriptions hadn&rsquo;t been updated since 2019
            &mdash; mostly manufacturer-supplied copy, deduplicated across
            40+ competitor sites.
          </p>
          <p>
            We shipped Catalog AI Pro across the full catalog (3 weeks),
            then layered Editorial Authority on the top 6 categories (6-month
            retainer).
          </p>
          <p>
            By month 6, AIO citation share on their top 50 commercial queries
            grew &times;8.5. Qualified leads from organic up 43%. The catalog
            now ranks above manufacturer pages on most product-spec queries.
          </p>

          <div className="pt-4">
            <Link
              href="/book-growth-call/"
              data-cta="book_call__v2_case_study"
              data-cta-location="mid_body"
              className="inline-flex items-center gap-2 rounded-[4px] border border-white/30 bg-transparent px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:border-white hover:bg-white/5"
            >
              Scope a similar engagement <span aria-hidden>&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </SectionRail>
  )
}
