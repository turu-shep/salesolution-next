import { LeadForm } from '@/components/forms/LeadForm'

/**
 * /catalog-snapshot/ § 1 — hero with form embedded.
 *
 * Two-column layout mirroring AuditHero on /unlock-growth-audit/. Left:
 * editorial copy on the dual-version deliverable. Right: sticky form card
 * with the SKU-count field enabled.
 */
export function CatalogSnapshotHero() {
  return (
    <section data-section-tone="light" className="relative bg-paper">
      <div className="mx-auto max-w-6xl px-4 pb-12 pt-16 sm:px-6 md:pb-20 md:pt-24 lg:px-8">
        <div className="grid gap-12 md:grid-cols-12 md:gap-12 lg:gap-16">
          <div className="md:col-span-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
              Free catalog snapshot &middot; 2 business days
            </p>

            <h1 className="mt-4 font-display text-5xl font-semibold leading-[1] tracking-[-0.03em] text-ink-900 sm:text-6xl md:text-[5.25rem]">
              <span className="block">Five of your products,</span>
              <span className="block">rewritten both ways.</span>
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-relaxed text-ink-700 md:text-xl">
              Send your URL and approximate SKU count. We pick five of your
              products and rewrite each one twice &mdash; once under
              Standard ($3/SKU), once under Pro ($7/SKU) &mdash; so you can
              see the depth difference on your own catalog before you
              choose. Plus catalog-wide findings and pricing applied to
              your SKU count.
            </p>

            <ul className="mt-10 space-y-3 text-sm text-ink-700">
              {[
                { k: 'Effort', v: '~3 minutes to fill in. No call required.' },
                { k: 'Delivery', v: 'PDF in your inbox within 2 business days.' },
                { k: 'Cost', v: 'Free. Yours to keep, even if we never speak again.' },
              ].map((row) => (
                <li key={row.k} className="flex items-baseline gap-4 border-t border-rule pt-3">
                  <span className="w-20 shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                    {row.k}
                  </span>
                  <span className="text-ink-700">{row.v}</span>
                </li>
              ))}
            </ul>

            <p className="mt-10 max-w-md text-sm text-ink-500">
              Best fit: industrial / equipment e-commerce distributors with
              1,000+ SKUs, $2M&ndash;$50M annual revenue. Under those
              thresholds, a SaaS tool is usually a better economic fit
              than us &mdash; we&rsquo;ll tell you so on the reply.
            </p>
          </div>

          <div className="md:col-span-5">
            <div className="md:sticky md:top-24">
              <div className="rounded-[6px] border border-rule bg-surface p-1 shadow-cta">
                <div className="rounded-[5px] bg-paper px-5 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-700">
                    Start the snapshot
                  </p>
                  <p className="mt-1 font-display text-xl font-semibold leading-snug text-ink-900">
                    Free dual-version rewrite.
                  </p>
                  <p className="mt-1.5 text-xs text-ink-500">
                    Two steps &middot; ~3 minutes &middot; reply within 24h.
                  </p>
                </div>
                <LeadForm
                  formId="catalog_snapshot_form"
                  formName="Catalog snapshot hero form"
                  leadType="catalog_snapshot"
                  submitLabel="Get the free snapshot"
                  thankYouHref="/catalog-snapshot/thank-you/"
                  className="rounded-t-none border-t border-rule shadow-none ring-0"
                  showSkuCount
                />
              </div>

              <p className="mt-4 flex items-center gap-2 text-xs text-ink-500">
                <span
                  aria-hidden
                  className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-rule-strong text-ink-500"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="h-2 w-2"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                No credit card. No drip sequence. No SDR follow-up loop.
              </p>
            </div>
          </div>
        </div>

        <nav
          aria-label="Page sections"
          className="mt-16 border-t border-rule pt-5 md:mt-20"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
            On this page
          </p>
          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            {[
              { label: "What's in the snapshot", href: '#deliverables' },
              { label: 'Who it’s for', href: '#fit' },
              { label: 'Book the snapshot', href: '#book' },
              { label: 'FAQ', href: '#faq' },
            ].map((a, i) => (
              <li key={a.href} className="flex items-baseline gap-3">
                {i > 0 && <span aria-hidden className="text-ink-300">/</span>}
                <a
                  href={a.href}
                  className="font-display text-sm font-semibold text-ink-700 underline decoration-rule-strong underline-offset-[5px] transition-colors duration-200 hover:text-brand-600 hover:decoration-brand-600"
                >
                  {a.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  )
}
