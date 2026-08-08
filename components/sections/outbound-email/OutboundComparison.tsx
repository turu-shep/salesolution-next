import { SectionRail } from '@/components/layout/SectionRail'
import { cn } from '@/lib/cn'

/**
 * /services/outbound-email/ § 6 — Comparison.
 *
 * Same table primitive as /services/ai-seo/ Comparison, but rewritten for the
 * outbound buyer: deliverability-first agency vs spray-and-pray agency vs
 * in-house SDR team. Honest framing — in-house wins above a certain headcount,
 * we say so.
 */

type Row = {
  label: string
  sale: { value: string; tone?: 'good' | 'mid' | 'bad' }
  agency: { value: string; tone?: 'good' | 'mid' | 'bad' }
  inhouse: { value: string; tone?: 'good' | 'mid' | 'bad' }
}

const ROWS: Row[] = [
  {
    label: 'Where the budget goes',
    sale: { value: 'Deliverability infra + senior copy', tone: 'good' },
    agency: { value: 'Tool licenses + VA cadence', tone: 'bad' },
    inhouse: { value: 'Headcount + tooling', tone: 'mid' },
  },
  {
    label: 'Sender warm-up runway',
    sale: { value: '4-week warm-up before scale', tone: 'good' },
    agency: { value: 'Skipped or 3-day token warm', tone: 'bad' },
    inhouse: { value: 'Inconsistent · platform default', tone: 'mid' },
  },
  {
    label: 'Daily send volume per mailbox',
    sale: { value: '20–50 · reputation-throttled', tone: 'good' },
    agency: { value: '200+ · subscription maximum', tone: 'bad' },
    inhouse: { value: '50–150 · varies by SDR', tone: 'mid' },
  },
  {
    label: 'List sourcing',
    sale: { value: 'Hand-built + triple-verified', tone: 'good' },
    agency: { value: 'Bulk-rented · 12–20% bounce', tone: 'bad' },
    inhouse: { value: 'ZoomInfo / Apollo exports', tone: 'mid' },
  },
  {
    label: 'Reply triage',
    sale: { value: 'Senior operator within 2h', tone: 'good' },
    agency: { value: 'Junior team · next day', tone: 'mid' },
    inhouse: { value: 'Your team, your inbox', tone: 'good' },
  },
  {
    label: 'Reporting metric',
    sale: { value: 'Sourced pipeline + reply quality', tone: 'good' },
    agency: { value: 'Opens + clicks (privacy-broken)', tone: 'bad' },
    inhouse: { value: 'Whatever your CRM reports', tone: 'mid' },
  },
  {
    label: 'Cost / month',
    sale: { value: 'One all-in number in the SOW', tone: 'mid' },
    agency: { value: '$2–5k retainer + per-lead fees', tone: 'mid' },
    inhouse: { value: '$12–25k all-in / SDR FTE', tone: 'bad' },
  },
  {
    label: 'Where this wins',
    sale: { value: 'Technical B2B · $3–50M ARR', tone: 'good' },
    agency: { value: 'High-volume DTC · low ACV', tone: 'mid' },
    inhouse: { value: '3+ SDRs · $50M+ ARR', tone: 'good' },
  },
]

const toneClass: Record<NonNullable<Row['sale']['tone']>, string> = {
  good: 'text-data-up',
  mid: 'text-ink-700',
  bad: 'text-data-down',
}

function Cell({
  value,
  tone,
  isFeatured,
}: {
  value: string
  tone?: Row['sale']['tone']
  isFeatured?: boolean
}) {
  return (
    <td
      className={cn(
        'border-b border-rule py-4 align-top text-sm',
        isFeatured ? 'bg-paper px-5' : 'px-5',
      )}
    >
      <span className={cn('inline-flex items-start gap-2', tone && toneClass[tone])}>
        {tone === 'good' && (
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
        )}
        {tone === 'bad' && (
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
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="6" y1="18" x2="18" y2="6" />
          </svg>
        )}
        <span>{value}</span>
      </span>
    </td>
  )
}

export function OutboundComparison({ id }: { id?: string }) {
  return (
    <SectionRail tone="surface" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          Build vs buy
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          How we compare.{' '}
          Honestly.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          Outbound is one of the easiest channels to burn money on, and one of
          the harder ones to evaluate from a sales call. Here&rsquo;s the
          honest read against the two alternatives most buyers consider.
        </p>
      </div>

      <div className="mt-12 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr>
              <th className="w-[28%] border-b-2 border-rule-strong px-5 py-4 text-left font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                Dimension
              </th>
              <th className="w-[24%] border-b-2 border-ink-900 bg-paper px-5 py-4 text-left">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-700">
                  Recommended
                </p>
                <p className="mt-1 font-display text-base font-semibold text-ink-900">
                  Sale Solution
                </p>
              </th>
              <th className="w-[24%] border-b-2 border-rule-strong px-5 py-4 text-left">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
                  Alternative
                </p>
                <p className="mt-1 font-display text-base font-semibold text-ink-700">
                  Spray-and-pray agency
                </p>
              </th>
              <th className="w-[24%] border-b-2 border-rule-strong px-5 py-4 text-left">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
                  Alternative
                </p>
                <p className="mt-1 font-display text-base font-semibold text-ink-700">
                  In-house SDR team
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
                <Cell value={row.sale.value} tone={row.sale.tone} isFeatured />
                <Cell value={row.agency.value} tone={row.agency.tone} />
                <Cell value={row.inhouse.value} tone={row.inhouse.tone} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-8 max-w-2xl text-sm text-ink-500">
        If you already run three or more SDRs above $50M ARR, the in-house
        column probably wins. We&rsquo;ll tell you so on the first call &mdash;
        and we&rsquo;ll often help you scope the SDR playbook for free.
      </p>
    </SectionRail>
  )
}
