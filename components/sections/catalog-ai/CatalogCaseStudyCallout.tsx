import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /services/catalog-ai/ § 6 — Northern Hydraulics case study callout.
 *
 * Lighter than the full Evidence section on the homepage — same client,
 * same numbers, framed specifically around the catalog work (schema
 * rewrite, 150+ category pages, dedicated answer hubs for engineering
 * queries). Links to /book-growth-call/ for the "get a similar audit" CTA.
 */

const CLIENT = {
  vertical: 'Industrial hydraulics distributor',
  skuCount: '~8,500 SKUs',
  window: 'Aug 2024 – Jan 2025',
  metric: '+43.5% qualified leads / mo',
  baseline: '1,840 → 2,640 leads / mo',
}

const PULL_QUOTE = {
  text: 'They rebuilt our product schema and rewrote our pillar pages so AI Overviews cite us instead of the manufacturer. Qualified leads doubled inside two quarters.',
  attrib: 'Operations Director',
}

const WORK = [
  'Product schema rewrite across all 8,500 SKUs',
  '150+ category pages restructured for AI scannability',
  'Dedicated answer hubs for engineering queries',
  'Manufacturer spec sheet integration on top-volume SKUs',
]

export function CatalogCaseStudyCallout() {
  return (
    <SectionRail tone="paper">
      <div className="grid gap-12 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            Case study &middot; {CLIENT.vertical}
          </p>
          <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
            {CLIENT.baseline}. <span className="text-ink-500">No new ad spend.</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-ink-700">
            {CLIENT.skuCount} catalog · six-month engagement. The work
            below is what a Catalog AI Pro engagement at this scale looks
            like in practice.
          </p>

          <p className="mt-10 font-display text-6xl font-semibold leading-none tabular-nums tracking-[-0.03em] text-ink-900 sm:text-7xl">
            <span className="text-accent-500">+</span>43.5
            <span className="text-ink-400">%</span>
          </p>
          <p className="mt-4 font-display text-base font-semibold leading-snug text-ink-900">
            Qualified leads / month
          </p>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            {CLIENT.window}
          </p>

          <Link
            href="/book-growth-call/"
            data-cta="book_call__catalog_case_study"
            data-cta-location="mid_body"
            className="mt-10 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-900 underline decoration-rule-strong underline-offset-[6px] transition hover:text-brand-600 hover:decoration-brand-600"
          >
            Book a similar audit
            <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="md:col-span-7">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
            What we shipped
          </p>
          <ul className="mt-4 space-y-px">
            {WORK.map((w, i) => (
              <li
                key={w}
                className="flex items-start gap-4 border-t border-rule py-4 last:border-b"
              >
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] tabular-nums text-ink-400">
                  {(i + 1).toString().padStart(2, '0')}
                </span>
                <span className="text-ink-700">{w}</span>
              </li>
            ))}
          </ul>

          <figure className="mt-10">
            <blockquote className="font-display text-2xl font-medium leading-snug text-ink-900">
              <span aria-hidden className="mr-2 text-ink-300">&ldquo;</span>
              {PULL_QUOTE.text}
              <span aria-hidden className="ml-1 text-ink-300">&rdquo;</span>
            </blockquote>
            <figcaption className="mt-4 text-sm text-ink-500">
              <span className="font-semibold text-ink-900">{PULL_QUOTE.attrib}</span>
              <span aria-hidden className="mx-2 text-ink-300">&middot;</span>
              <span>{CLIENT.vertical} · {CLIENT.skuCount}</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </SectionRail>
  )
}
