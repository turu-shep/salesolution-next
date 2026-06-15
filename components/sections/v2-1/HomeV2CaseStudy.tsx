import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /v2-1/ — anonymized industrial-distributor case study, one screen.
 *
 * Big numbers left, short prose right. Dark band so the case study reads
 * as a distinct moment in the page rhythm (paper → paper → paper →
 * surface → DARK → paper).
 */

type Stat = { value: string; label: string }

const STATS: Stat[] = [
  { value: '+43%', label: 'qualified leads in 6 months' },
  { value: '×3.4', label: 'AIO citation share on top 50 commercial queries' },
  { value: '×2.1', label: 'organic CTR on engineering-query pages' },
  { value: '3 weeks', label: 'from kickoff to full catalog shipped' },
]

export function HomeV2CaseStudy() {
  return (
    <SectionRail tone="dark">
      <div className="max-w-4xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
          Case study
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
          An 8,500-SKU hydraulics distributor.{' '}
          <span className="text-ink-400">
            43% more qualified leads in 6 months.
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
            grew 3.4&times;. Qualified leads from organic up 43%. The catalog
            now ranks above manufacturer pages on most product-spec queries.
          </p>

          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href="/catalog-snapshot/"
              data-cta="catalog_snapshot__v2_case_study"
              data-cta-location="mid_body"
              className="inline-flex items-center gap-2 rounded-[4px] bg-service-catalog-500 px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-service-catalog-700"
            >
              Get the free catalog snapshot <span aria-hidden>&rarr;</span>
            </Link>
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

      <details className="mt-10 group">
        <summary className="cursor-pointer text-sm font-mono uppercase tracking-[0.18em] text-ink-300 hover:text-white transition-colors inline-flex items-center gap-2">
          <span aria-hidden className="transition-transform group-open:rotate-90">&rarr;</span>
          Methodology + methodology disclaimer
        </summary>
        <div className="mt-4 max-w-3xl space-y-3 text-sm leading-relaxed text-ink-300">
          <p>
            AIO citation share measured via bi-weekly probe of 1,000
            commercial-intent queries through the Salesolution citation
            tracker. Baseline established 4 weeks pre-engagement; measurement
            compared against the engagement 24-week mark.
          </p>
          <p>
            Organic CTR measured via Google Search Console month-over-month
            on the top 200 engineering-query landing pages. Baseline: 30-day
            average pre-engagement.
          </p>
          <p>
            This is a representative composite of industrial-distributor
            engagements between 2024&ndash;2025. Specific operating details
            have been anonymized to respect client confidentiality.
            Aggregate-level case studies for additional verticals available
            on request.
          </p>
        </div>
      </details>
    </SectionRail>
  )
}
