import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /catalog-snapshot/ § 3 — honest fit check.
 *
 * Two columns mirroring AuditFit on /unlock-growth-audit/. ICP criteria
 * from the spec § 2. Stating "not a fit" upfront saves the snapshot for
 * accounts that can actually buy.
 */

const FITS = [
  'Industrial / equipment e-commerce distributor with 1,000+ SKUs',
  '$2M–$50M annual revenue (or growing into that band)',
  'Specifically: hydraulics, fluid power, pumps, valves, MRO, fasteners, electrical, plumbing, HVAC, contract manufacturing, machinery parts',
  'You run Shopify, WooCommerce, Magento, BigCommerce, or headless',
  'You make catalog decisions with a 12+ month horizon',
]

const NOT_FITS = [
  'Under 200 SKUs (minimum project size doesn’t justify your cash)',
  'Marketplace-only seller (Amazon, eBay) without a website',
  'Pure DTC fashion / lifestyle / consumer goods',
  'Enterprise with an internal content team of 5+ already on Salsify/Akeneo',
  'You want a tool you operate, not a service we operate',
]

export function CatalogSnapshotFit({ id }: { id?: string }) {
  return (
    <SectionRail tone="surface" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          Honest fit check
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          Is this snapshot for you? We&rsquo;ll tell you straight.
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-700">
          The snapshot is free, but it&rsquo;s most useful to a specific
          kind of buyer. If you&rsquo;re in the right-hand column,
          we&rsquo;ll email back and recommend who you should hire
          instead &mdash; usually a SaaS tool.
        </p>
      </div>

      <div className="mt-14 grid gap-px border border-rule bg-rule md:grid-cols-2">
        <div className="bg-paper p-7 sm:p-10">
          <div className="flex items-baseline justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-data-up">
              Strong fit
            </p>
            <span
              aria-hidden
              className="font-mono text-[10px] uppercase tracking-[0.18em] tabular-nums text-ink-400"
            >
              0{FITS.length}
            </span>
          </div>
          <h3 className="mt-3 font-display text-2xl font-semibold leading-tight text-ink-900">
            Get the snapshot if&hellip;
          </h3>
          <ul className="mt-6 space-y-px">
            {FITS.map((f, i) => (
              <li
                key={i}
                className="flex items-start gap-4 border-t border-rule py-4 first:border-t-0"
              >
                <span
                  aria-hidden
                  className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-data-up/15 text-data-up"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-2.5 w-2.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span className="text-sm text-ink-700">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-paper p-7 sm:p-10">
          <div className="flex items-baseline justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
              Probably not yet
            </p>
            <span
              aria-hidden
              className="font-mono text-[10px] uppercase tracking-[0.18em] tabular-nums text-ink-400"
            >
              0{NOT_FITS.length}
            </span>
          </div>
          <h3 className="mt-3 font-display text-2xl font-semibold leading-tight text-ink-900">
            Skip it if&hellip;
          </h3>
          <ul className="mt-6 space-y-px">
            {NOT_FITS.map((f, i) => (
              <li
                key={i}
                className="flex items-start gap-4 border-t border-rule py-4 first:border-t-0"
              >
                <span
                  aria-hidden
                  className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-ink-400/15 text-ink-500"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-2.5 w-2.5"
                  >
                    <line x1="6" y1="6" x2="18" y2="18" />
                    <line x1="6" y1="18" x2="18" y2="6" />
                  </svg>
                </span>
                <span className="text-sm text-ink-500">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SectionRail>
  )
}
