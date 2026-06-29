import { SectionRail } from '@/components/layout/SectionRail'

import { CountUp } from '../CountUp'

/**
 * /services/outbound-email/ § 4 — Distinctive visual.
 *
 * Mock of the deliverability dashboard we hand clients: sender-reputation
 * score on the left, six-week warm-up volume curve on the right, and four
 * checked authentication states underneath. Whole panel sits on dark so the
 * "score panel" feels like an actual UI mock instead of a marketing graphic.
 *
 * Numbers are representative of a real warmed sender at the end of week 6,
 * not a fantasy. The curve points are the median across our last 12 ramps.
 */

const WARMUP = [
  { week: 'W1', sends: 30 },
  { week: 'W2', sends: 70 },
  { week: 'W3', sends: 140 },
  { week: 'W4', sends: 280 },
  { week: 'W5', sends: 520 },
  { week: 'W6', sends: 850 },
]

const AUTH = [
  { key: 'SPF', state: 'Pass · aligned' },
  { key: 'DKIM', state: '2048-bit · signed' },
  { key: 'DMARC', state: 'p=reject · aligned' },
  { key: 'BIMI', state: 'VMC verified · logo live' },
]

const MAX = Math.max(...WARMUP.map((d) => d.sends))

export function DeliverabilityScorePanel({ id }: { id?: string }) {
  return (
    <SectionRail tone="dark" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
          What we hand over
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
          A sender you can actually scale.{' '}
          By end of week six.
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-300">
          The deliverability dashboard below is the live state we work toward
          on every engagement &mdash; reputation in the green, authentication
          stack signed and aligned, throughput ramped on a curve sender
          algorithms recognize as human.
        </p>
      </div>

      {/* The "panel" — dashboard mock card. */}
      <div className="mt-14 overflow-hidden rounded-md border border-white/15 bg-white/[0.03] backdrop-blur-[2px]">
        {/* Window chrome */}
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-accent-500/70" aria-hidden />
            <span className="h-2.5 w-2.5 rounded-full bg-white/20" aria-hidden />
            <span className="h-2.5 w-2.5 rounded-full bg-white/20" aria-hidden />
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
            postmaster.google.com · outbound-2.acme.io
          </p>
          <p className="font-mono text-[10px] tracking-[0.16em] text-ink-400">
            LIVE
          </p>
        </div>

        <div className="grid gap-0 lg:grid-cols-12">
          {/* Score */}
          <div className="border-b border-white/10 px-6 py-8 lg:col-span-4 lg:border-b-0 lg:border-r lg:border-white/10 lg:px-8 lg:py-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-300">
              Sender reputation
            </p>

            {/* Score number */}
            <p className="mt-4 font-display text-7xl font-semibold leading-[0.95] tabular-nums tracking-[-0.03em] text-white sm:text-8xl">
              <CountUp value={94} />
              <span className="text-ink-400 text-3xl align-top ml-1">/100</span>
            </p>

            {/* Score meter */}
            <div className="mt-6 flex h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <span className="block h-full w-[6%] bg-data-down" aria-hidden />
              <span className="block h-full w-[14%] bg-accent-500" aria-hidden />
              <span className="block h-full w-[74%] bg-data-up" aria-hidden />
              <span className="block h-full w-[6%] bg-white/20" aria-hidden />
            </div>
            <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-ink-400">
              <span>Bad</span>
              <span>Medium</span>
              <span className="text-data-up">Good</span>
              <span>100</span>
            </div>

            {/* Domain row */}
            <div className="mt-8 space-y-3">
              <Row label="Spam rate" value="0.04%" tone="up" />
              <Row label="IP reputation" value="High" tone="up" />
              <Row label="Domain reputation" value="High" tone="up" />
              <Row label="TLS encryption" value="100% sent" tone="up" />
            </div>
          </div>

          {/* Warmup curve + auth */}
          <div className="px-6 py-8 lg:col-span-8 lg:px-8 lg:py-10">
            <div className="flex items-baseline justify-between">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-300">
                Domain warm-up · daily send volume
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-data-up">
                Curve on plan
              </p>
            </div>

            {/* Chart */}
            <div className="mt-6">
              <div className="relative h-44">
                {/* Y axis ticks */}
                <div className="absolute inset-y-0 left-0 flex w-10 flex-col justify-between font-mono text-[10px] tabular-nums text-ink-400">
                  <span>1000</span>
                  <span>500</span>
                  <span>0</span>
                </div>

                {/* Plot */}
                <div className="absolute inset-y-0 left-10 right-0">
                  {/* Horizontal grid */}
                  <div className="absolute inset-0 flex flex-col justify-between">
                    <div className="border-t border-dashed border-white/10" />
                    <div className="border-t border-dashed border-white/10" />
                    <div className="border-t border-white/15" />
                  </div>

                  {/* Bars */}
                  <ol className="absolute inset-0 flex items-end justify-between gap-3">
                    {WARMUP.map((d, i) => {
                      const heightPct = (d.sends / 1000) * 100
                      const isLast = i === WARMUP.length - 1
                      return (
                        <li
                          key={d.week}
                          className="relative flex h-full w-full flex-col items-center justify-end"
                        >
                          <span
                            className={
                              'block w-full max-w-[36px] rounded-sm ' +
                              (isLast
                                ? 'bg-accent-500'
                                : 'bg-brand-600/80')
                            }
                            style={{ height: `${heightPct}%` }}
                            aria-hidden
                          />
                          {isLast && (
                            <span className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-[3px] bg-accent-500 px-2 py-0.5 font-mono text-[10px] font-semibold text-white">
                              850 / day
                            </span>
                          )}
                        </li>
                      )
                    })}
                  </ol>
                </div>
              </div>

              {/* X labels */}
              <div className="mt-2 flex justify-between pl-10">
                {WARMUP.map((d) => (
                  <span
                    key={d.week}
                    className="w-full text-center font-mono text-[10px] tabular-nums text-ink-400"
                  >
                    {d.week}
                  </span>
                ))}
              </div>
            </div>

            {/* Auth chips */}
            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-300">
                Authentication stack
              </p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {AUTH.map((a) => (
                  <li
                    key={a.key}
                    className="flex items-center gap-3 rounded-sm border border-white/10 bg-white/[0.02] px-3 py-2.5"
                  >
                    <svg
                      className="h-3.5 w-3.5 shrink-0 text-data-up"
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
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
                      {a.key}
                    </span>
                    <span className="font-mono text-[10px] tracking-[0.04em] text-ink-300">
                      {a.state}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-8 max-w-2xl font-mono text-[11px] leading-relaxed text-ink-400">
        Representative dashboard · median state across the last 12 senders we
        warmed for technical-B2B ICPs, end of week 6. Actual numbers shared in
        the monthly outcome review for your real domains.
      </p>
    </SectionRail>
  )
}

function Row({
  label,
  value,
  tone = 'flat',
}: {
  label: string
  value: string
  tone?: 'up' | 'down' | 'flat'
}) {
  const dot =
    tone === 'up'
      ? 'bg-data-up'
      : tone === 'down'
        ? 'bg-data-down'
        : 'bg-ink-400'
  return (
    <div className="flex items-center justify-between border-t border-white/10 pt-3 first:border-t-0 first:pt-0">
      <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-300">
        <span className={`inline-block h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden />
        {label}
      </span>
      <span className="font-display text-sm font-semibold tabular-nums text-white">
        {value}
      </span>
    </div>
  )
}
