import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'
import { CountMetric } from '@/components/sections/case-studies/CountMetric'

/**
 * Editorial Authority § 07 — case study.
 *
 * Industrial automation distributor, Standard-tier Editorial Retainer,
 * 6-month engagement, AIO citations 4 → 34. Dark band; amber accents on
 * the lift numbers thread the service color.
 */

const STATS = [
  { value: '4 → 34', label: 'AIO citations' },
  { value: '×8.5', label: 'lift' },
  { value: '6 mo', label: 'engagement' },
  { value: '1', label: 'retainer (Standard)' },
]

export function EditorialCaseStudy({ id }: { id?: string }) {
  return (
    <SectionRail tone="dark" glow="strong" id={id}>
      <div className="grid gap-12 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
            Case study &middot; Industrial automation distributor
          </p>
          <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
            From 4 to 34 AIO citations{' '}
            <span className="text-ink-400">in 6 months.</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-ink-300">
            Mid-market industrial automation distributor, ~12K SKUs,
            ranking well but losing organic share as AI Overviews ate
            informational-query CTR.
          </p>

          <p className="mt-10 font-display text-6xl font-semibold leading-none tabular-nums tracking-[-0.03em] text-white sm:text-7xl">
            <CountMetric prefix="×" value="8.5" prefixClassName="text-service-editorial-500" />
          </p>
          <p className="mt-4 font-display text-base font-semibold leading-snug text-white">
            Lift on AIO citation count, top 50 commercial queries
          </p>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
            6-month engagement &middot; Standard retainer
          </p>
        </div>

        <div className="md:col-span-7">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-300">
            What we ran
          </p>
          <p className="mt-3 text-ink-300">
            We ran the Editorial Retainer (Standard tier) for 6 months: 8
            pieces/month + 1 pillar/month across three product categories.
          </p>
          <p className="mt-4 text-ink-300">
            <span className="font-semibold text-white">Result:</span> AIO
            citation count on their top 50 commercial queries climbed
            from{' '}
            <span className="font-semibold text-service-editorial-500">
              4 to 34 (×8.5)
            </span>
            . Organic leads from informational pages doubled. Their pillar
            pages now sit at the top of AIO responses for terms
            manufacturers used to own.
          </p>

          <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-white/10 pt-8 sm:grid-cols-4">
            {STATS.map((s) => (
              <li key={s.label}>
                <p className="font-display text-3xl font-semibold tabular-nums leading-none text-service-editorial-500 sm:text-4xl">
                  {s.value}
                </p>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-300">
                  {s.label}
                </p>
              </li>
            ))}
          </ul>

          <Link
            href="/case-studies/automation-distributor-editorial-authority-aio-citations/"
            className="mt-10 inline-flex items-center gap-1.5 text-sm font-semibold text-white/85 underline decoration-white/20 underline-offset-[6px] transition-colors duration-200 hover:text-white hover:decoration-white"
          >
            Read the full case study
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </SectionRail>
  )
}
