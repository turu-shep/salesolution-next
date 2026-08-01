import Link from 'next/link'

import { cn } from '@/lib/cn'

import { CompositeBar } from './CompositeBar'

/**
 * The standardized third-tier card per shared system reference §3.
 *
 * Replaces the previous "Embedded" tier on every service page (except
 * Catalog AI, which retains its own Enterprise tier and instead links to
 * FGO via a separate "Beyond catalog?" callout below the pricing table).
 *
 * Visual signature: 5-color composite bar across the top. Inside, the same
 * card shape as the sibling tier cards on the same page so the grid stays
 * visually coherent.
 *
 * `linkLabel` and `slot` let the caller tune copy per service ("See Full
 * Growth Ownership →" reads well in three columns; "Get a quote →" reads
 * better when the FGO card stands alone in a CTA stack).
 */

type Props = {
  /** Optional badge text rendered above the price (e.g. "Multi-service"). */
  cadence?: string
  /** Body copy under the price. Defaults to the canonical spec sentence. */
  body?: React.ReactNode
  /** Link target — defaults to /services/full-growth-ownership/. */
  href?: string
  /** Link copy — defaults to "See Full Growth Ownership →". */
  linkLabel?: string
  /** Data-cta token for analytics. */
  ctaToken?: string
  /** Extra wrapper className for layout-specific tweaks. */
  className?: string
}

export function FullGrowthTierCard({
  cadence = 'Multi-service · 3–6 month minimum',
  body,
  href = '/services/full-growth-ownership/',
  linkLabel = 'See Full Growth Ownership',
  ctaToken = 'full_growth_ownership__tier_card',
  className,
}: Props) {
  return (
    <div
      className={cn(
        'relative flex flex-col overflow-hidden border border-rule bg-surface transition-colors duration-200 hover:border-ink-700',
        className,
      )}
    >
      <CompositeBar weight="card" />

      <div className="border-b border-rule px-6 py-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          {cadence}
        </p>
        <h3 className="mt-2 font-display text-2xl font-semibold tracking-[-0.01em] text-ink-900">
          Full Growth Ownership
        </h3>
        <p className="mt-3 text-base leading-relaxed text-ink-700">
          One number, quoted after the qualifier.
        </p>
      </div>

      <div className="flex-1 px-6 py-6">
        <p className="text-ink-700">
          {body ?? (
            <>
              When you need more than this service alone. We run AI search,
              content, outbound, dev, and catalog work as a coordinated growth
              function &mdash; strategy through execution, one operator
              accountable.
            </>
          )}
        </p>

        <ul className="mt-5 space-y-2 text-sm text-ink-700">
          <li className="flex items-start gap-2">
            <span aria-hidden className="mt-1 inline-block h-1 w-1 shrink-0 rounded-full bg-ink-500" />
            <span>Fractional GTM Engineer (Shape A) &mdash; one operator inside your leadership</span>
          </li>
          <li className="flex items-start gap-2">
            <span aria-hidden className="mt-1 inline-block h-1 w-1 shrink-0 rounded-full bg-ink-500" />
            <span>4-in-1 Coordinated Retainer (Shape B) &mdash; 2&ndash;5 services, one owner</span>
          </li>
          <li className="flex items-start gap-2">
            <span aria-hidden className="mt-1 inline-block h-1 w-1 shrink-0 rounded-full bg-ink-500" />
            <span>One operator across multiple services, written quote in 24 hours</span>
          </li>
        </ul>
      </div>

      <div className="border-t border-rule px-6 py-4">
        <Link
          href={href}
          data-cta={ctaToken}
          data-cta-location="mid_body"
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-[4px] border border-ink-300 bg-surface px-5 py-2.5 text-sm font-semibold text-ink-900 transition-colors duration-200 hover:border-ink-900"
        >
          {linkLabel}
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  )
}
