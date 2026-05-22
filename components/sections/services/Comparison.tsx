import { SectionRail } from '@/components/layout/SectionRail'
import { cn } from '@/lib/cn'

/**
 * /services/ comparison — Sale Solution vs typical SEO agency vs in-house hire.
 *
 * Helps the buyer think about the build/buy decision honestly. The "Sale
 * Solution" column is highlighted but the other columns are written without
 * straw-manning — credibility matters more than scoring points.
 */

type Row = {
  label: string
  sale: { value: string; tone?: 'good' | 'mid' | 'bad' }
  agency: { value: string; tone?: 'good' | 'mid' | 'bad' }
  inhouse: { value: string; tone?: 'good' | 'mid' | 'bad' }
}

const ROWS: Row[] = [
  {
    label: 'AI-search / GEO depth',
    sale:    { value: 'Core competency', tone: 'good' },
    agency:  { value: 'Add-on at best', tone: 'mid' },
    inhouse: { value: 'If you can hire it', tone: 'mid' },
  },
  {
    label: 'Vertical specialisation',
    sale:    { value: 'Industrial / technical-distribution', tone: 'good' },
    agency:  { value: 'Generalist', tone: 'mid' },
    inhouse: { value: 'Yours by default', tone: 'good' },
  },
  {
    label: 'Who actually does the work',
    sale:    { value: 'The operator on the call', tone: 'good' },
    agency:  { value: 'Junior team after handoff', tone: 'bad' },
    inhouse: { value: 'Your hire', tone: 'good' },
  },
  {
    label: 'Time to first shipped change',
    sale:    { value: 'Week 1–2', tone: 'good' },
    agency:  { value: 'Month 2–3', tone: 'mid' },
    inhouse: { value: 'Hiring cycle: 3–6 months', tone: 'bad' },
  },
  {
    label: 'Fixed cost / month',
    sale:    { value: '$8–14k retainer', tone: 'mid' },
    agency:  { value: '$5–25k retainer', tone: 'mid' },
    inhouse: { value: '$15–25k all-in / FTE', tone: 'bad' },
  },
  {
    label: 'Reporting cadence',
    sale:    { value: 'Monthly outcome review · weekly Slack', tone: 'good' },
    agency:  { value: 'Quarterly business review', tone: 'mid' },
    inhouse: { value: 'Whenever you ask', tone: 'good' },
  },
  {
    label: 'Risk if it doesn’t work',
    sale:    { value: '90-day exit, no obligation', tone: 'good' },
    agency:  { value: '12-month contract', tone: 'bad' },
    inhouse: { value: 'Severance + rehire cost', tone: 'bad' },
  },
  {
    label: 'Where this wins',
    sale:    { value: '$5–50M ARR · technical e-com', tone: 'good' },
    agency:  { value: 'Generic DTC · early stage', tone: 'mid' },
    inhouse: { value: '$50M+ ARR · enterprise', tone: 'good' },
  },
]

const toneClass: Record<NonNullable<Row['sale']['tone']>, string> = {
  good: 'text-data-up',
  mid:  'text-ink-700',
  bad:  'text-data-down',
}

function Cell({ value, tone, isFeatured }: { value: string; tone?: Row['sale']['tone']; isFeatured?: boolean }) {
  return (
    <td
      className={cn(
        'border-b border-rule py-4 align-top text-sm',
        isFeatured ? 'bg-paper px-5' : 'px-5',
      )}
    >
      <span className={cn('inline-flex items-start gap-2', tone && toneClass[tone])}>
        {tone === 'good' && (
          <svg className="mt-1 h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
        {tone === 'bad' && (
          <svg className="mt-1 h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="6" y1="18" x2="18" y2="6" />
          </svg>
        )}
        <span>{value}</span>
      </span>
    </td>
  )
}

export function Comparison({ id }: { id?: string }) {
  return (
    <SectionRail tone="surface" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          Build vs buy
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          How we compare. <span className="text-ink-500">Honestly.</span>
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          Not every buyer should hire us. For some you&rsquo;re better with a
          generalist agency; for others, an in-house head of SEO. Here&rsquo;s
          the honest read.
        </p>
      </div>

      <div className="mt-12 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <caption className="sr-only">
            Sale Solution compared to a typical SEO agency and an in-house hire across eight buying dimensions.
          </caption>
          <thead>
            <tr>
              <th scope="col" className="w-[28%] border-b-2 border-rule-strong px-5 py-4 text-left font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                Dimension
              </th>
              <th scope="col" className="w-[24%] border-b-2 border-ink-900 bg-paper px-5 py-4 text-left">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-700">
                  Recommended
                </p>
                <p className="mt-1 font-display text-base font-semibold text-ink-900">
                  Sale Solution
                </p>
              </th>
              <th scope="col" className="w-[24%] border-b-2 border-rule-strong px-5 py-4 text-left">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                  Alternative
                </p>
                <p className="mt-1 font-display text-base font-semibold text-ink-700">
                  Typical SEO agency
                </p>
              </th>
              <th scope="col" className="w-[24%] border-b-2 border-rule-strong px-5 py-4 text-left">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                  Alternative
                </p>
                <p className="mt-1 font-display text-base font-semibold text-ink-700">
                  In-house hire
                </p>
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.label}>
                <th scope="row" className="border-b border-rule px-5 py-4 text-left align-top font-mono text-[11px] uppercase tracking-[0.16em] text-ink-500">
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
        Not in the &ldquo;Sale Solution&rdquo; row? We&rsquo;ll tell you on
        the first call &mdash; and we&rsquo;ll usually recommend who you
        should hire instead.
      </p>
    </SectionRail>
  )
}
