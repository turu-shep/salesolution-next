import { SectionRail } from '@/components/layout/SectionRail'
import { cn } from '@/lib/cn'

/**
 * /services/full-growth-ownership/ § 5 — Honest comparison vs the two
 * alternatives buyers actually consider: a stack of five separate
 * agencies, or a full-time growth executive hire.
 *
 * Same table primitive as `services/Comparison.tsx` — kept inline rather
 * than refactored into a shared component because the row data and
 * column headers differ enough that the abstraction would cost more than
 * the duplication.
 */

type Tone = 'good' | 'mid' | 'bad'

type Row = {
  label: string
  ownership: { value: string; tone?: Tone }
  agencies:  { value: string; tone?: Tone }
  inhouse:   { value: string; tone?: Tone }
}

const ROWS: Row[] = [
  {
    label: 'Accountability',
    ownership: { value: 'One operator, named', tone: 'good' },
    agencies:  { value: 'Five vendors, none own the outcome', tone: 'bad' },
    inhouse:   { value: 'One person, but ramp + recruit cost', tone: 'mid' },
  },
  {
    label: 'Monthly cost',
    ownership: { value: '$20–35k all-in', tone: 'mid' },
    agencies:  { value: '$18–30k across vendors + your time', tone: 'mid' },
    inhouse:   { value: '$18–25k + benefits + equity', tone: 'mid' },
  },
  {
    label: 'Setup time',
    ownership: { value: '2–3 weeks', tone: 'good' },
    agencies:  { value: 'Each vendor: 3–6 weeks', tone: 'mid' },
    inhouse:   { value: '3–6 month hire cycle', tone: 'bad' },
  },
  {
    label: 'Strategic alignment',
    ownership: { value: 'Built into the engagement', tone: 'good' },
    agencies:  { value: 'You stitch it together', tone: 'bad' },
    inhouse:   { value: 'One person’s view', tone: 'mid' },
  },
  {
    label: 'Risk if it doesn’t work',
    ownership: { value: '30-day exit after minimum', tone: 'good' },
    agencies:  { value: 'Cancel each vendor separately', tone: 'mid' },
    inhouse:   { value: 'Severance + rehire cost', tone: 'bad' },
  },
  {
    label: 'Where this wins',
    ownership: { value: '$5–25M ARR · no growth lead', tone: 'good' },
    agencies:  { value: '$50M+ with internal coordination', tone: 'mid' },
    inhouse:   { value: '$50M+ with proven exec hires', tone: 'good' },
  },
]

const toneClass: Record<Tone, string> = {
  good: 'text-data-up',
  mid:  'text-ink-700',
  bad:  'text-data-down',
}

function Cell({ value, tone, isFeatured }: { value: string; tone?: Tone; isFeatured?: boolean }) {
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

export function FullGrowthComparison({ id }: { id?: string }) {
  return (
    <SectionRail tone="paper" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          Honest comparison
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          Three real options. Picked apart.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          Full Growth Ownership compared to the two alternatives most
          buyers actually consider. No straw-manning &mdash; credibility
          matters more than scoring points.
        </p>
      </div>

      <div className="mt-12 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <caption className="sr-only">
            Full Growth Ownership compared to five separate agencies and a full-time growth hire across six buying dimensions.
          </caption>
          <thead>
            <tr>
              <th scope="col" className="w-[24%] border-b-2 border-rule-strong px-5 py-4 text-left font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                Dimension
              </th>
              <th scope="col" className="w-[28%] border-b-2 border-ink-900 bg-paper px-5 py-4 text-left">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-700">
                  Recommended
                </p>
                <p className="mt-1 font-display text-base font-semibold text-ink-900">
                  Full Growth Ownership
                </p>
              </th>
              <th scope="col" className="w-[24%] border-b-2 border-rule-strong px-5 py-4 text-left">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                  Alternative
                </p>
                <p className="mt-1 font-display text-base font-semibold text-ink-700">
                  Five separate agencies
                </p>
              </th>
              <th scope="col" className="w-[24%] border-b-2 border-rule-strong px-5 py-4 text-left">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                  Alternative
                </p>
                <p className="mt-1 font-display text-base font-semibold text-ink-700">
                  Full-time growth hire
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
                <Cell value={row.ownership.value} tone={row.ownership.tone} isFeatured />
                <Cell value={row.agencies.value} tone={row.agencies.tone} />
                <Cell value={row.inhouse.value} tone={row.inhouse.tone} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-8 max-w-2xl text-sm text-ink-500">
        Not in the &ldquo;Full Growth Ownership&rdquo; row? We&rsquo;ll
        tell you on the first call &mdash; and we&rsquo;ll usually
        recommend who you should hire instead.
      </p>
    </SectionRail>
  )
}
