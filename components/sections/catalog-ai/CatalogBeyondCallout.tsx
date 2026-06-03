import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'
import { CompositeBar } from '@/components/services/CompositeBar'

/**
 * /services/catalog-ai/ § — "Beyond catalog?" cross-link to Full Growth
 * Ownership. Single-column callout with the 5-color CompositeBar at the top
 * (the FGO visual signature).
 */
export function CatalogBeyondCallout() {
  return (
    <SectionRail tone="paper" size="sm">
      <div className="mx-auto max-w-3xl border border-rule bg-surface">
        <CompositeBar weight="card" />
        <div className="px-6 py-8 sm:px-8 sm:py-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            Need more than catalog?
          </p>
          <h3 className="mt-3 font-display text-2xl font-semibold leading-tight tracking-[-0.01em] text-ink-900 sm:text-3xl">
            Beyond catalog?
          </h3>
          <p className="mt-5 text-[15px] leading-relaxed text-ink-700">
            If you need catalog work coordinated with content, AI search,
            dev, and outbound under one operator &mdash; see Full Growth
            Ownership. Catalog AI Enterprise is included in those
            engagements.
          </p>
          <Link
            href="/services/full-growth-ownership/"
            data-cta="full_growth_ownership__catalog_beyond"
            data-cta-location="mid_body"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-900 underline decoration-rule-strong underline-offset-[5px] transition-colors duration-200 hover:text-brand-600 hover:decoration-brand-600"
          >
            See Full Growth Ownership
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </SectionRail>
  )
}
