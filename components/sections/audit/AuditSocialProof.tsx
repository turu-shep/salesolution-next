import { SectionRail } from '@/components/layout/SectionRail'

import { CountUp } from '../CountUp'

/**
 * /unlock-growth-audit/ § 4 — proof on dark.
 *
 * Pull quote from an audit recipient who became a client, with a stat row
 * underneath built on the same canonical proof points used elsewhere
 * (audit count, CVR uplift, client satisfaction, turnaround promise).
 *
 * Dark band so the proof carries weight after the lighter preview section.
 */

type QuoteCard = {
  text: string
  attrib: string
  org: string
}

const QUOTES: QuoteCard[] = [
  {
    text: 'The audit named the exact category page that was bleeding revenue. Three weeks after the fix, organic from that page tripled.',
    attrib: 'Head of E-com',
    org: 'Industrial fasteners distributor · ~12k SKUs',
  },
  {
    text: 'I expected a pitch deck. I got a single-page diagnosis sharper than what our previous agency delivered after six months.',
    attrib: 'Founder / CEO',
    org: 'Lab-supply DTC · $6M ARR',
  },
]

type Stat = {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  label: string
}

const STATS: Stat[] = [
  { value: 42, suffix: '', label: 'Audits delivered to date' },
  { value: 32, prefix: '+', suffix: '%', label: 'Avg CVR uplift · post-audit clients' },
  { value: 4.9, suffix: '/5', decimals: 1, label: 'Clutch rating · 14 reviews' },
  { value: 24, suffix: 'h', label: 'Turnaround on every audit so far' },
]

export function AuditSocialProof({ id }: { id?: string }) {
  return (
    <SectionRail tone="dark" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
          Why brands trust the audit
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
          The diagnosis lands. <span className="text-ink-400">Then the work compounds.</span>
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-300">
          We&rsquo;ve run 42 of these in the last 18 months &mdash; for
          $200k/month stores all the way up to $4M/month operators.
          Roughly 30% engage us afterward; the other 70% take the
          checklist and ship it themselves. Both outcomes are fine.
        </p>
      </div>

      <ul className="mt-14 grid gap-6 md:grid-cols-2 md:gap-8">
        {QUOTES.map((q, i) => (
          <li
            key={i}
            className="flex flex-col rounded-[6px] border border-white/15 bg-white/[0.03] p-7 sm:p-8"
          >
            <blockquote className="font-display text-xl font-medium leading-snug text-white sm:text-2xl">
              <span aria-hidden className="mr-1 text-ink-400">&ldquo;</span>
              {q.text}
              <span aria-hidden className="ml-1 text-ink-400">&rdquo;</span>
            </blockquote>
            <figcaption className="mt-6 border-t border-white/15 pt-5 text-sm text-ink-300">
              <span className="font-semibold text-white">{q.attrib}</span>
              <span aria-hidden className="mx-2 text-ink-400">&middot;</span>
              <span>{q.org}</span>
            </figcaption>
          </li>
        ))}
      </ul>

      <dl className="mt-16 grid grid-cols-2 gap-x-10 gap-y-10 border-t border-white/15 pt-10 sm:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label}>
            <dd className="font-display text-3xl font-semibold tabular-nums text-white sm:text-4xl">
              {s.prefix && <span className="text-accent-500">{s.prefix}</span>}
              <CountUp value={s.value} decimals={s.decimals ?? 0} />
              {s.suffix && <span className="text-ink-400">{s.suffix}</span>}
            </dd>
            <dt className="mt-2 text-xs leading-relaxed text-ink-300">{s.label}</dt>
          </div>
        ))}
      </dl>
    </SectionRail>
  )
}
