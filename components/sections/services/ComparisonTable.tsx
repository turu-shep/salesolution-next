import { Section } from '@/components/layout/Section'
import { Eyebrow } from '@/components/sections/Eyebrow'
import { cn } from '@/lib/cn'

type Row = {
  label: string
  us: string | boolean
  typical: string | boolean
  inhouse: string | boolean
}

const ROWS: Row[] = [
  { label: 'Dedicated senior strategist',         us: true,        typical: 'Junior account manager', inhouse: 'Limited to one person' },
  { label: 'Proprietary GEO + AI-search tooling', us: true,        typical: false,                    inhouse: false },
  { label: 'Performance-share pricing option',    us: true,        typical: 'Retainer-only',          inhouse: 'N/A' },
  { label: '24h proposal turnaround',             us: true,        typical: '1–2 weeks',              inhouse: 'Internal cycles' },
  { label: 'Integrated SEO + CRO + PPC',          us: 'One team',  typical: 'Multiple agencies',      inhouse: 'Siloed' },
  { label: 'Average client ARR lift (12mo)',      us: '+$575k',    typical: '+$150k',                 inhouse: 'Hard to attribute' },
  { label: '“Double your investment” guarantee',  us: true,        typical: false,                    inhouse: 'N/A' },
]

function Cell({ value, kind }: { value: string | boolean; kind: 'us' | 'other' }) {
  if (value === true) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Yes
      </span>
    )
  }
  if (value === false) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-ink-400">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <line x1="6" y1="6" x2="18" y2="18" />
          <line x1="6" y1="18" x2="18" y2="6" />
        </svg>
        No
      </span>
    )
  }
  return (
    <span className={cn('text-sm', kind === 'us' ? 'font-medium text-ink-900' : 'text-ink-500')}>
      {value}
    </span>
  )
}

export function ComparisonTable() {
  return (
    <Section tone="alt">
      <div className="mx-auto max-w-3xl text-center">
        <Eyebrow>How we compare</Eyebrow>
        <h2 className="mt-3 text-balance">
          25% higher ROI versus the typical SEO agency or in-house team
        </h2>
        <p className="mx-auto mt-4 text-lg text-ink-500">
          Side-by-side, the integrated GEO partnership consistently outperforms
          stacks of point-solution agencies — and the strain of building an
          in-house equivalent.
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-5xl overflow-x-auto">
        <table className="w-full min-w-[640px] border-separate border-spacing-0 text-left">
          <thead>
            <tr>
              <th className="rounded-tl-lg bg-surface-tint-blue px-5 py-4 text-sm font-semibold text-ink-800">
                Capability
              </th>
              <th className="bg-brand-600 px-5 py-4 text-sm font-semibold text-white">
                Sale Solution GEO partnership
              </th>
              <th className="bg-surface-alt px-5 py-4 text-sm font-semibold text-ink-700">
                Typical SEO agency
              </th>
              <th className="rounded-tr-lg bg-surface-alt px-5 py-4 text-sm font-semibold text-ink-700">
                In-house team
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, i) => (
              <tr key={row.label} className={i % 2 === 0 ? 'bg-surface' : 'bg-surface-tint-blue/40'}>
                <td className="border-b border-ink-300/15 px-5 py-4 text-sm font-medium text-ink-800">
                  {row.label}
                </td>
                <td className="border-b border-ink-300/15 px-5 py-4">
                  <Cell value={row.us} kind="us" />
                </td>
                <td className="border-b border-ink-300/15 px-5 py-4">
                  <Cell value={row.typical} kind="other" />
                </td>
                <td className="border-b border-ink-300/15 px-5 py-4">
                  <Cell value={row.inhouse} kind="other" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  )
}
