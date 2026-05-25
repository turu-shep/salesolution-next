import { LeadForm } from '@/components/forms/LeadForm'
import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /catalog-snapshot/ § 4 — full-width form on dark.
 *
 * Second occurrence of the form for users who scrolled past the hero.
 * Same layout pattern as AuditFormSection, with reassurances tailored to
 * the catalog-snapshot promise.
 */
export function CatalogSnapshotFormSection({ id }: { id?: string }) {
  const reassurances = [
    {
      title: 'No sales pitch',
      body: 'We reply personally with the PDF. No SDR loop. No discovery-call gauntlet.',
    },
    {
      title: 'No credit card',
      body: 'Free is free. The snapshot is yours whether we work together or not.',
    },
    {
      title: 'Yours to keep',
      body: 'Side-by-side rewrites, audit findings, applied pricing — all yours.',
    },
    {
      title: 'Two-day promise',
      body: 'PDF in your inbox within 2 business days. If we can’t, we email a reason within 24h.',
    },
  ]

  return (
    <SectionRail tone="dark" id={id} size="lg">
      <div className="grid gap-14 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
            Book the snapshot
          </p>
          <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl md:text-6xl">
            Three minutes. <span className="text-ink-400">Your snapshot lands in two days.</span>
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-300">
            We pick five of your products, rewrite each twice (Standard and
            Pro), audit your catalog for the patterns we&rsquo;d address,
            and apply the three-tier pricing to your actual SKU count.
          </p>

          <ul className="mt-12 grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2">
            {reassurances.map((r) => (
              <li key={r.title} className="border-t border-white/15 pt-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-500">
                  {r.title}
                </p>
                <p className="mt-2 text-sm text-ink-300">{r.body}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-6">
          <div className="rounded-[6px] border border-white/20 bg-paper p-1 shadow-cta">
            <div className="rounded-[5px] bg-surface px-5 pb-5 pt-5 sm:px-7 sm:pb-6 sm:pt-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-700">
                Start your Catalog Snapshot
              </p>
              <p className="mt-1 font-display text-2xl font-semibold leading-snug text-ink-900">
                Two steps. About three minutes.
              </p>
              <p className="mt-2 text-sm text-ink-500">
                PDF in your inbox within 2 business days.
              </p>
            </div>
            <LeadForm
              formId="catalog_snapshot_form"
              formName="Catalog snapshot page lead form"
              leadType="catalog_snapshot"
              submitLabel="Get the free snapshot"
              thankYouHref="/catalog-snapshot/thank-you/"
              className="rounded-t-none border-t border-rule shadow-none ring-0"
              showSkuCount
            />
          </div>
        </div>
      </div>
    </SectionRail>
  )
}
