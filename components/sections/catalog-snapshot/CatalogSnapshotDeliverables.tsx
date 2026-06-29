import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /catalog-snapshot/ § 2 — what lands in the PDF.
 *
 * Dark band, same shape as AuditDeliverables. Three "lenses" on the left
 * (dual-version rewrite, catalog-wide audit, applied pricing) and the
 * itemized contents of the PDF on the right.
 */

type Lens = {
  k: string
  title: string
  body: string
}

type Deliverable = {
  title: string
  body: string
  badge: string
  accent?: boolean
}

const LENSES: Lens[] = [
  {
    k: 'Lens 01',
    title: 'Dual-version rewrite',
    body: 'Five of your real products rewritten twice — once under Standard ($3/SKU), once under Pro ($7/SKU). The depth difference is visible on your own catalog, not in marketing language.',
  },
  {
    k: 'Lens 02',
    title: 'Catalog-wide findings',
    body: 'Manufacturer-copy duplication rate. Internal-link density vs. best-in-class. Missing schema by SKU count. Meta-description duplication. All from a real crawl of your site.',
  },
  {
    k: 'Lens 03',
    title: 'Pricing applied to your catalog',
    body: 'Standard / Pro / Enterprise costs computed against your actual SKU count. Recurring math next to the project cost so you can do your own ROI calculations.',
  },
]

const DELIVERABLES: Deliverable[] = [
  {
    title: 'Executive summary',
    body: 'One page. Catalog size, the 3–5 specific issues we’d address, estimated AIO citation lift, pricing across all three tiers.',
    badge: 'Page 2',
  },
  {
    title: 'Side-by-side rewrites · 5 products',
    body: 'Three columns per product: your current copy, the Standard rewrite, the Pro rewrite with FAQ block and comparison row. The highest-leverage page in the deliverable.',
    badge: 'Pages 3–7',
    accent: true,
  },
  {
    title: 'Catalog-wide audit',
    body: 'Concrete patterns we’d address with real numbers — pulled from a Screaming Frog crawl, not estimated.',
    badge: 'Page 8',
  },
  {
    title: 'Process overview + timeline',
    body: 'Intake → voice training → pilot → full processing → delivery, with your estimated timeline and cost at each tier.',
    badge: 'Page 9',
  },
  {
    title: 'Three-tier pricing table',
    body: 'Standard / Pro / Enterprise costs computed against your SKU count, with recurring math alongside the project total.',
    badge: 'Page 10',
  },
]

export function CatalogSnapshotDeliverables({ id }: { id?: string }) {
  return (
    <SectionRail tone="dark" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
          What you get
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
          8–12 page PDF. Two business days.
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-300">
          Most &ldquo;free catalog audits&rdquo; are automated scans
          wrapped in a slide deck. This is a written, opinionated diagnosis
          plus actual rewritten copy you can hold against your current
          product pages.
        </p>
      </div>

      <div className="mt-16 grid gap-12 md:grid-cols-12 md:gap-16">
        <ul className="md:col-span-5 md:space-y-10 space-y-8">
          {LENSES.map((lens) => (
            <li key={lens.k}>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-500">
                {lens.k}
              </p>
              <h3 className="mt-2 font-display text-xl font-semibold text-white">
                {lens.title}
              </h3>
              <p className="mt-2 text-ink-300">{lens.body}</p>
            </li>
          ))}
        </ul>

        <ol className="md:col-span-7 space-y-px">
          <li className="border-t border-white/15 pb-2 pt-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-300">
              In the PDF
            </p>
          </li>
          {DELIVERABLES.map((d, i) => (
            <li
              key={d.title}
              className="border-t border-white/15 py-6 first:border-t-0"
            >
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 sm:col-span-2">
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] tabular-nums text-ink-400">
                    {(i + 1).toString().padStart(2, '0')}
                  </span>
                </div>
                <div className="col-span-12 sm:col-span-10">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <h3 className="font-display text-lg font-semibold text-white">
                      {d.title}
                    </h3>
                    <span
                      className={
                        d.accent
                          ? 'inline-block rounded-[3px] bg-accent-500/15 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-accent-500'
                          : 'inline-block rounded-[3px] border border-white/20 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-300'
                      }
                    >
                      {d.badge}
                    </span>
                  </div>
                  <p className="mt-3 text-ink-300">{d.body}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </SectionRail>
  )
}
