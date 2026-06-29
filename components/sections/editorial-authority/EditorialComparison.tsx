import { SectionRail } from '@/components/layout/SectionRail'
import { cn } from '@/lib/cn'

/**
 * Editorial Authority § 04 — Salesolution vs content mill vs in-house writer.
 *
 * Same comparison primitive used elsewhere on the site, with the
 * Salesolution column tinted in the editorial amber (50-weight) instead
 * of paper. Mobile horizontal scroll preserved.
 */

type Tone = 'good' | 'mid' | 'bad'

type Row = {
  label: string
  sale: { value: string; tone?: Tone }
  mill: { value: string; tone?: Tone }
  inhouse: { value: string; tone?: Tone }
}

const ROWS: Row[] = [
  {
    label: 'Per-piece cost',
    sale:    { value: '$500–1,800 / article', tone: 'mid' },
    mill:    { value: '$50–250 / article', tone: 'good' },
    inhouse: { value: '$2,500–4,000 fully loaded', tone: 'bad' },
  },
  {
    label: 'Senior writer with vertical expertise',
    sale:    { value: 'Named, US/UK senior writer', tone: 'good' },
    mill:    { value: 'Offshore generalist or LLM', tone: 'bad' },
    inhouse: { value: 'Yours by default', tone: 'good' },
  },
  {
    label: 'AIO citation engineering included',
    sale:    { value: 'Built into every piece', tone: 'good' },
    mill:    { value: 'Not offered', tone: 'bad' },
    inhouse: { value: 'If you can hire it', tone: 'mid' },
  },
  {
    label: 'Schema, FAQ, internal-linking baked in',
    sale:    { value: 'Article / FAQ / HowTo on every ship', tone: 'good' },
    mill:    { value: 'Plain text, no on-page work', tone: 'bad' },
    inhouse: { value: 'Depends on the writer', tone: 'mid' },
  },
  {
    label: '10-day turnaround',
    sale:    { value: '10 days brief → publish', tone: 'good' },
    mill:    { value: '3–5 days, no editing', tone: 'mid' },
    inhouse: { value: '2–4 weeks per piece', tone: 'bad' },
  },
  {
    label: 'Topic research + monthly editorial planning',
    sale:    { value: '15–20 topics ranked every month', tone: 'good' },
    mill:    { value: 'You brief, they write', tone: 'bad' },
    inhouse: { value: 'On the hire to figure out', tone: 'mid' },
  },
  {
    label: 'Revisions included',
    sale:    { value: '2 per piece, standard', tone: 'good' },
    mill:    { value: 'Charged per round', tone: 'bad' },
    inhouse: { value: 'Unlimited (it&rsquo;s their job)', tone: 'good' },
  },
  {
    label: 'Where this wins',
    sale:    { value: 'Spec-heavy B2B / industrial editorial content. NOT product copy — see Catalog AI for that.', tone: 'good' },
    mill:    { value: 'Volume content with low intent', tone: 'mid' },
    inhouse: { value: '$50M+ ARR enterprise', tone: 'good' },
  },
]

const toneClass: Record<Tone, string> = {
  good: 'text-data-up',
  mid:  'text-ink-700',
  bad:  'text-data-down',
}

function Cell({
  value,
  tone,
  isFeatured,
}: {
  value: string
  tone?: Tone
  isFeatured?: boolean
}) {
  return (
    <td
      className={cn(
        'border-b border-rule py-4 align-top text-sm',
        isFeatured ? 'bg-service-editorial-50 px-5' : 'px-5',
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
        {/* Use dangerouslySetInnerHTML so `&rsquo;` inside string-only values renders. */}
        <span dangerouslySetInnerHTML={{ __html: value }} />
      </span>
    </td>
  )
}

export function EditorialComparison({ id }: { id?: string }) {
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
          Not every editorial engagement should be ours. Some are better
          with a $99-per-article mill; some need an in-house senior writer.
          Here&rsquo;s the honest read.
        </p>
      </div>

      <div className="mt-12 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <caption className="sr-only">
            Salesolution compared to a content mill and an in-house senior writer.
          </caption>
          <thead>
            <tr>
              <th scope="col" className="w-[28%] border-b-2 border-rule-strong px-5 py-4 text-left font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                Dimension
              </th>
              <th scope="col" className="w-[28%] border-b-2 border-service-editorial-500 bg-service-editorial-50 px-5 py-4 text-left">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-service-editorial-700">
                  Recommended
                </p>
                <p className="mt-1 font-display text-base font-semibold text-ink-900">
                  Salesolution
                </p>
              </th>
              <th scope="col" className="w-[22%] border-b-2 border-rule-strong px-5 py-4 text-left">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                  Alternative
                </p>
                <p className="mt-1 font-display text-base font-semibold text-ink-700">
                  Content mill / LLM shop
                </p>
              </th>
              <th scope="col" className="w-[22%] border-b-2 border-rule-strong px-5 py-4 text-left">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                  Alternative
                </p>
                <p className="mt-1 font-display text-base font-semibold text-ink-700">
                  In-house senior writer
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
                <Cell value={row.mill.value} tone={row.mill.tone} />
                <Cell value={row.inhouse.value} tone={row.inhouse.tone} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-8 max-w-2xl text-sm text-ink-500">
        Not in the &ldquo;Salesolution&rdquo; row? We&rsquo;ll tell you on
        the first call &mdash; and we&rsquo;ll usually recommend who you
        should hire instead.
      </p>
    </SectionRail>
  )
}
