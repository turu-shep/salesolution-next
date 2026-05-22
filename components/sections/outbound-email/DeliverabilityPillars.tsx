import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /services/outbound-email/ § 3 — Our approach.
 *
 * Four pillars. Deliverability-first is the load-bearing one and gets the
 * accent treatment (orange numeral + "Starts here" tag) the way Phase 01
 * gets it on the homepage framework. The other three sit on the same
 * editorial grid so the reader sees them as an ordered system, not a list.
 */

type Pillar = {
  number: string
  title: string
  blurb: string
  details: string[]
  emphasis?: boolean
}

const PILLARS: Pillar[] = [
  {
    number: '01',
    title: 'Deliverability engineering',
    blurb:
      'Inbox placement before headline writing. Dedicated outbound domains, SPF / DKIM / DMARC alignment, IP pools, and a 4-week warm-up runway.',
    details: [
      'Two to five outbound domains per client · isolated from your primary',
      'Google Postmaster + Microsoft SNDS monitored daily',
      'Throughput throttled to per-mailbox reputation, not a fixed rate',
      'Re-warming triggered automatically on reputation dips',
    ],
    emphasis: true,
  },
  {
    number: '02',
    title: 'Vertical list building',
    blurb:
      'Hand-built ICPs from primary research, trade-association rosters, and verified job-title triggers. Nothing scraped, nothing rented.',
    details: [
      'ICP defined in week one against the offer, not a job title list',
      'Triple-verified contacts · bounce rate held under 1.5%',
      'GDPR / PECR legitimate-interest documentation per record',
      'List refreshed quarterly · stale contacts pruned automatically',
    ],
  },
  {
    number: '03',
    title: 'Multi-touch sequences',
    blurb:
      'Three- to seven-touch sequences with branching logic. Each touch ships only when the prior one earned engagement.',
    details: [
      'Plain-text first touches · no images, no tracking pixels',
      'Branch on open / reply / link click — no spray cadence',
      'Sequence variants A/B-tested at the offer level, not the subject line',
      'Reply triage routed to your real inbox, not a shared account',
    ],
  },
  {
    number: '04',
    title: 'Honest measurement',
    blurb:
      'Replies, booked meetings, sourced pipeline. Open rates were broken by Apple Mail privacy in 2021 — we report the metrics that actually drive revenue.',
    details: [
      'Weekly cohort: sends · positive replies · meetings · sourced pipeline',
      'Monthly outcome review with the operator who runs the campaign',
      'Reply-quality scoring · positive vs neutral vs unsubscribe split',
      'Attribution model that survives an MQL audit',
    ],
  },
]

export function DeliverabilityPillars({ id }: { id?: string }) {
  return (
    <SectionRail tone="paper" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          Our approach
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          Four pillars.{' '}
          <span className="text-ink-500">Sequenced, not stacked.</span>
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          Deliverability is the foundation &mdash; without it, the other three
          pillars only earn you a place in the spam folder faster. We don&rsquo;t
          ship a single production send until the inbox layer is engineered.
        </p>
      </div>

      <ol className="mt-16 grid gap-x-8 gap-y-12 md:grid-cols-2 md:gap-y-16 lg:gap-x-16">
        {PILLARS.map((p) => (
          <li key={p.number} className="relative">
            <div className="flex items-baseline gap-4 border-b border-rule pb-4">
              <span
                className={
                  'font-display text-3xl font-semibold tabular-nums leading-none ' +
                  (p.emphasis ? 'text-accent-500' : 'text-ink-400')
                }
              >
                {p.number}
              </span>
              <h3 className="font-display text-2xl font-semibold tracking-[-0.01em] text-ink-900">
                {p.title}
              </h3>
              {p.emphasis && (
                <span className="ml-auto rounded-[3px] bg-accent-500/15 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-700">
                  Load-bearing
                </span>
              )}
            </div>

            <p className="mt-5 text-base leading-relaxed text-ink-700">
              {p.blurb}
            </p>

            <ul className="mt-5 space-y-2.5">
              {p.details.map((d) => (
                <li
                  key={d}
                  className="flex items-start gap-3 text-sm text-ink-700"
                >
                  <span
                    aria-hidden
                    className={
                      'mt-1.5 inline-block h-1.5 w-1.5 shrink-0 ' +
                      (p.emphasis ? 'bg-accent-500' : 'bg-ink-400')
                    }
                  />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </SectionRail>
  )
}
