import { SectionRail } from '@/components/layout/SectionRail'
import { cn } from '@/lib/cn'

/**
 * /services/catalog-ai/ § 4 — Tier-by-deliverable matrix.
 *
 * 15-row comparison across Standard / Pro / Enterprise. Pro column is
 * featured (matching the tier cards) so the upgrade path reads at a glance.
 * Cells are either ✓ (included, accent-500 check), — (em-dash, ink-400), or
 * a short value string (e.g. "5%", "20%", "all SKUs").
 *
 * Same table mechanics as Comparison.tsx on /services/ai-seo/.
 */

type Cell = { tone: 'yes' | 'no' | 'value'; value?: string }

type Row = {
  label: string
  standard: Cell
  pro: Cell
  enterprise: Cell
}

const yes = (value?: string): Cell => ({ tone: 'yes', value })
const no = (): Cell => ({ tone: 'no' })
const v = (value: string): Cell => ({ tone: 'value', value })

const ROWS: Row[] = [
  {
    label: 'AI-rewritten descriptions',
    standard:   v('200–400 words'),
    pro:        v('500–800 words, structured'),
    enterprise: v('Pro depth, all SKUs'),
  },
  {
    label: 'Brand voice training',
    standard:   yes(),
    pro:        v('Deeper, with technical register'),
    enterprise: yes(),
  },
  {
    label: 'Meta titles + schema',
    standard:   v('Product + Offer'),
    pro:        v('+ FAQ + HowTo + AggregateRating'),
    enterprise: yes(),
  },
  {
    label: 'Internal linking',
    standard:   v('3–7 links per page'),
    pro:        v('Graph-engineered'),
    enterprise: v('Catalog-wide architecture'),
  },
  {
    label: 'Manufacturer spec integration',
    standard:   no(),
    pro:        yes(),
    enterprise: yes(),
  },
  {
    label: 'Per-product FAQ blocks',
    standard:   no(),
    pro:        yes(),
    enterprise: yes(),
  },
  {
    label: 'Comparison content',
    standard:   no(),
    pro:        v('Top 20% of SKUs'),
    enterprise: v('All SKUs'),
  },
  {
    label: 'Category page rewrites',
    standard:   no(),
    pro:        no(),
    enterprise: v('Top 50 pages'),
  },
  {
    label: 'Programmatic SEO build',
    standard:   no(),
    pro:        no(),
    enterprise: yes(),
  },
  {
    label: 'QA sampling rate',
    standard:   v('5%'),
    pro:        v('20%'),
    enterprise: v('100% via operator review'),
  },
  {
    label: 'CRM-format delivery',
    standard:   yes(),
    pro:        yes(),
    enterprise: v('+ PIM integration'),
  },
  {
    label: 'Monthly outcome reviews',
    standard:   no(),
    pro:        no(),
    enterprise: yes(),
  },
  {
    label: 'Quarterly re-optimization',
    standard:   v('Separate fee'),
    pro:        v('Separate fee'),
    enterprise: v('Included'),
  },
  {
    label: 'Dedicated operator',
    standard:   no(),
    pro:        no(),
    enterprise: yes(),
  },
  {
    label: 'Direct Slack access',
    standard:   no(),
    pro:        v('Async · 24h response'),
    enterprise: v('Real-time'),
  },
]

function RenderedCell({
  cell,
  isFeatured,
}: {
  cell: Cell
  isFeatured?: boolean
}) {
  return (
    <td
      className={cn(
        'border-b border-rule py-4 align-top text-sm',
        isFeatured ? 'bg-paper px-5' : 'px-5',
      )}
    >
      {cell.tone === 'yes' && (
        <span className="inline-flex items-start gap-2 text-data-up">
          <svg
            className="mt-1 h-3 w-3 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span className="text-ink-700">{cell.value ?? 'Included'}</span>
        </span>
      )}
      {cell.tone === 'no' && (
        <span className="text-ink-400" aria-label="Not included">
          &mdash;
        </span>
      )}
      {cell.tone === 'value' && (
        <span className="text-ink-700">{cell.value}</span>
      )}
    </td>
  )
}

export function CatalogDeliverablesTable({ id }: { id?: string }) {
  return (
    <SectionRail tone="paper" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          What we actually build
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          The deliverable matrix. <span className="text-ink-500">Tier by tier.</span>
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          Fifteen rows of what&rsquo;s in each tier. The upgrade path lives
          in the differences &mdash; not in marketing language wrapped
          around the same work.
        </p>
      </div>

      <div className="mt-12 overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse">
          <caption className="sr-only">
            Catalog AI deliverables across Standard, Pro, and Enterprise tiers.
          </caption>
          <thead>
            <tr>
              <th
                scope="col"
                className="w-[28%] border-b-2 border-rule-strong px-5 py-4 text-left font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500"
              >
                Deliverable
              </th>
              <th
                scope="col"
                className="w-[24%] border-b-2 border-rule-strong px-5 py-4 text-left"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                  $3.00 / SKU
                </p>
                <p className="mt-1 font-display text-base font-semibold text-ink-700">
                  Standard
                </p>
              </th>
              <th
                scope="col"
                className="w-[24%] border-b-2 border-ink-900 bg-paper px-5 py-4 text-left"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-700">
                  $7.00 / SKU · Most common
                </p>
                <p className="mt-1 font-display text-base font-semibold text-ink-900">
                  Pro
                </p>
              </th>
              <th
                scope="col"
                className="w-[24%] border-b-2 border-rule-strong px-5 py-4 text-left"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                  From $15K / mo
                </p>
                <p className="mt-1 font-display text-base font-semibold text-ink-700">
                  Enterprise
                </p>
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.label}>
                <th
                  scope="row"
                  className="border-b border-rule px-5 py-4 text-left align-top font-mono text-[11px] uppercase tracking-[0.16em] text-ink-500"
                >
                  {row.label}
                </th>
                <RenderedCell cell={row.standard} />
                <RenderedCell cell={row.pro} isFeatured />
                <RenderedCell cell={row.enterprise} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionRail>
  )
}
