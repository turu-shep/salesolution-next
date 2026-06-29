import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /services/catalog-ai/ § 7 — Free Catalog Snapshot CTA band.
 *
 * The conversion mechanism for this page. Renders a wide CTA band linking
 * to /catalog-snapshot/. Body copy explains the dual-version rewrite
 * (Standard + Pro side-by-side) — that's what makes this snapshot worth
 * doing vs. the existing /unlock-growth-audit/ funnel.
 */
export function CatalogSnapshotCTA() {
  return (
    <SectionRail tone="dark">
      <div className="grid gap-10 md:grid-cols-12 md:items-end md:gap-16">
        <div className="md:col-span-7">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-500">
            Free catalog snapshot &middot; 2 business days
          </p>
          <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
            See what your catalog is missing. Both tiers, side by side.
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-300">
            Send us your URL and approximate SKU count. We rewrite 5 of
            your products &mdash; once under Standard, once under
            Pro &mdash; and send back the side-by-side as a PDF, plus what
            we&rsquo;d find across the rest of your catalog. Two business
            days. No follow-up sequence.
          </p>
        </div>

        <div className="md:col-span-5 md:text-right">
          <Link
            href="/catalog-snapshot/"
            data-cta="catalog_snapshot__service_band"
            data-cta-location="mid_body"
            className="inline-flex items-center justify-center gap-1.5 rounded-[4px] bg-white px-6 py-3.5 text-sm font-semibold text-ink-900 transition-colors duration-200 hover:bg-paper"
          >
            Get the free catalog snapshot
            <span aria-hidden>→</span>
          </Link>
          <p className="mt-4 text-xs text-ink-400">
            Two-step form &middot; ~3 minutes &middot; reply within 24h
          </p>
        </div>
      </div>
    </SectionRail>
  )
}
