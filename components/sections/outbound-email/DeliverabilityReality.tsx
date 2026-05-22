import { SectionRail } from '@/components/layout/SectionRail'

import { CountUp } from '../CountUp'

/**
 * /services/outbound-email/ § 2 — Why most cold outbound fails.
 *
 * Three structural numbers: most outbound never reaches the inbox, the
 * domain-warming gap, and the reply-rate floor that engineered deliverability
 * unlocks. Same "shock-by-glance" pattern as MarketReality on /services/ai-seo/
 * so the page feels like the same family.
 */

type Stat = {
  value: number
  prefix?: string
  unit: string
  label: string
  source: string
}

const STATS: Stat[] = [
  {
    value: 80,
    unit: '%',
    label: 'of cold outbound never reaches the primary inbox',
    source: 'Mailgun + Validity deliverability benchmark, 2025',
  },
  {
    value: 4,
    prefix: '<',
    unit: 'wk',
    label: 'domain warming runway most teams skip before scaled sends',
    source: 'Salesolution audits across 40+ B2B outbound stacks, 2024–2026',
  },
  {
    value: 11,
    unit: 'x',
    label: 'reply-rate gap between deliverability-first and spray-and-pray',
    source: 'Internal benchmark · 18 pilots, technical-B2B ICPs, Q4 2025',
  },
]

export function DeliverabilityReality({ id }: { id?: string }) {
  return (
    <SectionRail tone="dark" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
          Why most cold outbound fails
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
          The problem isn&rsquo;t your copy.{' '}
          <span className="text-ink-400">It&rsquo;s the inbox.</span>
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-300">
          Gmail, Outlook, and Microsoft 365 tightened sender rules three times
          in eighteen months. The teams still sending the way they did in 2022
          look at flat reply rates and rewrite the subject line. The fix is
          one layer earlier &mdash; sender reputation, authentication,
          throughput discipline.
        </p>
      </div>

      <ul className="mt-16 grid gap-x-10 gap-y-12 border-t border-white/10 pt-12 md:grid-cols-3">
        {STATS.map((s, i) => (
          <li key={s.label} className={i > 0 ? 'md:border-l md:border-white/10 md:pl-10' : ''}>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
              Inbox reality &middot; 2026
            </p>
            <p className="mt-3 font-display text-6xl font-semibold leading-[0.95] tabular-nums tracking-[-0.03em] text-white sm:text-7xl">
              {s.prefix && <span className="text-accent-500">{s.prefix}</span>}
              <CountUp value={s.value} />
              {s.unit && <span className="text-ink-400">{s.unit}</span>}
            </p>
            <p className="mt-5 font-display text-lg font-semibold leading-snug text-white">
              {s.label}
            </p>
            <p className="mt-3 font-mono text-[11px] leading-relaxed text-ink-400">
              {s.source}
            </p>
          </li>
        ))}
      </ul>
    </SectionRail>
  )
}
