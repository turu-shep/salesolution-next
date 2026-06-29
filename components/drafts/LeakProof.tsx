import { SectionRail } from '@/components/layout/SectionRail'

import { InView } from '@/components/sections/InView'

/**
 * PARKED (2026-06-28) — pulled from the homepage wedge (ProblemShift) when it was
 * slimmed to a pure belief beat. This is the old "two-leak proof": the
 * AI-answers-up / clicks-down chart (the discovery leak) and the missed-call /
 * slow-reply stats (the response leak). Kept on /drafts for relocation to a
 * "why now" beat. Both figures are illustrative of published industry patterns;
 * the shape is the point, not the exact monthly value.
 */

// ── Chart evidence: 24 monthly samples, Aug 2024 → Jul 2026. ──
const MONTHS = [
  'A24', 'S', 'O', 'N', 'D',
  'J25', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D',
  'J26', 'F', 'M', 'A', 'M', 'J', 'J',
]
// % of US searches showing an AI answer.
const AIO_COVERAGE = [
  14, 16, 19, 22, 25,
  28, 31, 33, 36, 38, 40, 42, 43, 44, 45, 46, 47,
  48, 49, 50, 50, 51, 51, 52,
]
// Index of clicks reaching the site on AI-answered queries (Aug 2024 = 100).
const CTR_INDEX = [
  100, 98, 95, 91, 87,
  83, 79, 76, 73, 71, 69, 67, 66, 65, 64, 63, 62,
  61, 60, 60, 59, 59, 58, 58,
]

export function LeakProof() {
  return (
    <SectionRail tone="dark">
      <div className="max-w-2xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
          Where it leaks
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
          Two of the places customers fall through.
        </h2>
      </div>

      <div className="mt-14 grid gap-x-12 gap-y-14 md:grid-cols-2">
        {/* ── Face A — the discovery leak ── */}
        <div className="flex flex-col border-t-2 border-brand-500/70 pt-6">
          <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-brand-300">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            They never reach you
          </p>
          <h3 className="mt-3 font-display text-2xl font-semibold leading-tight text-white sm:text-3xl">
            The AI answers first.
          </h3>
          <p className="mt-4 text-ink-300">
            Someone needs what you sell. They ask Google or ChatGPT, and the
            answer &mdash; a spec, a substitute, sometimes a competitor &mdash;
            shows up before they ever click. Your page still ranks. The visit
            just stops, and the quote that came with it.
          </p>

          <ShiftChart className="mt-6" />
        </div>

        {/* ── Face B — the response leak ── */}
        <div className="flex flex-col border-t-2 border-accent-500/70 pt-6">
          <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-accent-400">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent-500" />
            You miss them when they do
          </p>
          <h3 className="mt-3 font-display text-2xl font-semibold leading-tight text-white sm:text-3xl">
            The fastest reply wins the job.
          </h3>
          <p className="mt-4 text-ink-300">
            The call comes while you&rsquo;re on a roof or with a patient. The web
            lead lands at 9pm. By the time someone follows up, they&rsquo;ve
            booked with whoever picked up first. You paid to make that phone ring.
            The job booked somewhere else.
          </p>

          <LeakStats className="mt-6" />
        </div>
      </div>
    </SectionRail>
  )
}

function ShiftChart({ className = '' }: { className?: string }) {
  const W = 480
  const H = 240
  const PAD_L = 40
  const PAD_R = 12
  const PAD_T = 20
  const PAD_B = 32

  const plotW = W - PAD_L - PAD_R
  const plotH = H - PAD_T - PAD_B

  const xAt = (i: number) => PAD_L + (i / (MONTHS.length - 1)) * plotW
  const yAt = (v: number) => PAD_T + (1 - v / 100) * plotH

  const aioPath = AIO_COVERAGE.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i).toFixed(1)} ${yAt(v).toFixed(1)}`).join(' ')
  const ctrPath = CTR_INDEX.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i).toFixed(1)} ${yAt(v).toFixed(1)}`).join(' ')

  const lastIdx = MONTHS.length - 1

  return (
    <InView as="figure" className={`border border-rule bg-paper p-5 ${className}`}>
      <figcaption className="mb-4 font-mono text-[11px] text-ink-500">
        <span className="uppercase tracking-[0.18em]">AI answers up. Clicks down. · Aug 2024 – Jul 2026</span>
        <span className="mt-1.5 block normal-case tracking-normal text-ink-400">
          Industry pattern from BrightEdge and Pew. Exact monthly values are
          illustrative; the shape is the point.
        </span>
      </figcaption>

      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label="The share of searches Google answers itself rises while clicks reaching the site fall, over 24 months.">
        {/* Grid */}
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line x1={PAD_L} y1={yAt(v)} x2={W - PAD_R} y2={yAt(v)} stroke="var(--color-rule)" strokeWidth="1" />
            <text x={PAD_L - 8} y={yAt(v) + 3} textAnchor="end" fontFamily="var(--font-mono)" fontSize="9" fill="var(--color-ink-400)">
              {v}
            </text>
          </g>
        ))}

        {/* Clicks (down) — drawn behind. Draws in on view via stroke-dasharray. */}
        <path
          d={ctrPath}
          stroke="var(--color-data-down)"
          strokeWidth="1.5"
          fill="none"
          className="draw-path delay-200"
          style={{ strokeDasharray: '1200' }}
        />
        <circle cx={xAt(lastIdx)} cy={yAt(CTR_INDEX[lastIdx])} r="3" fill="var(--color-data-down)" />

        {/* AI answers (up) */}
        <path
          d={aioPath}
          stroke="var(--color-brand-600)"
          strokeWidth="2"
          fill="none"
          className="draw-path"
          style={{ strokeDasharray: '1200' }}
        />
        <circle cx={xAt(lastIdx)} cy={yAt(AIO_COVERAGE[lastIdx])} r="3.5" fill="var(--color-brand-600)" />

        {/* X labels: every 6th month */}
        {MONTHS.map((m, i) =>
          i % 6 === 0 || i === MONTHS.length - 1 ? (
            <text
              key={i}
              x={xAt(i)}
              y={H - 14}
              textAnchor={i === MONTHS.length - 1 ? 'end' : 'middle'}
              fontFamily="var(--font-mono)"
              fontSize="9"
              fill="var(--color-ink-400)"
            >
              {m}
            </text>
          ) : null,
        )}

        {/* Invisible hit-areas for hover tooltips — native SVG <title>. */}
        {MONTHS.map((m, i) => {
          const monthLabel = m.length <= 3 ? m : m
          return (
            <g key={`hit-${i}`} className="hover:opacity-100">
              <circle
                cx={xAt(i)}
                cy={yAt(AIO_COVERAGE[i])}
                r="10"
                fill="transparent"
                className="cursor-help [&:hover+circle]:opacity-100"
              >
                <title>{`${monthLabel} · AI answers ${AIO_COVERAGE[i]}%`}</title>
              </circle>
              <circle
                cx={xAt(i)}
                cy={yAt(AIO_COVERAGE[i])}
                r="3"
                fill="var(--color-brand-600)"
                className="pointer-events-none opacity-0 transition-opacity duration-150"
              />
              <circle
                cx={xAt(i)}
                cy={yAt(CTR_INDEX[i])}
                r="10"
                fill="transparent"
                className="cursor-help [&:hover+circle]:opacity-100"
              >
                <title>{`${monthLabel} · clicks index ${CTR_INDEX[i]}`}</title>
              </circle>
              <circle
                cx={xAt(i)}
                cy={yAt(CTR_INDEX[i])}
                r="3"
                fill="var(--color-data-down)"
                className="pointer-events-none opacity-0 transition-opacity duration-150"
              />
            </g>
          )
        })}
      </svg>

      <div className="mt-3 flex flex-col gap-1.5 font-mono text-[11px] text-ink-700">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span aria-hidden className="h-0.5 w-4 bg-brand-600" />
            <span className="uppercase tracking-[0.14em]">Searches the AI answers</span>
          </span>
          <span className="tabular-nums text-ink-900">52% <span className="text-data-up">↑</span></span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span aria-hidden className="h-0.5 w-4 border-t border-dashed border-data-down" />
            <span className="uppercase tracking-[0.14em]">Clicks that reach the site</span>
          </span>
          <span className="tabular-nums text-ink-900">58 <span className="text-data-down">↓</span></span>
        </div>
      </div>
    </InView>
  )
}

function LeakStats({ className = '' }: { className?: string }) {
  return (
    <InView as="figure" className={`border border-rule bg-paper p-5 ${className}`}>
      <figcaption className="mb-4 font-mono text-[11px] text-ink-500">
        <span className="uppercase tracking-[0.18em]">The leak after the lead · local-service inbound</span>
        <span className="mt-1.5 block normal-case tracking-normal text-ink-400">
          Industry pattern for calls and web leads. The shape is the point, not
          the exact figure.
        </span>
      </figcaption>

      <div className="grid grid-cols-2 gap-4">
        <div className="border-l-2 border-accent-500 pl-4">
          <p className="font-display text-4xl font-semibold leading-none tracking-[-0.02em] text-ink-900 sm:text-5xl">
            1 in 3
          </p>
          <p className="mt-2 text-sm leading-snug text-ink-700">
            calls to local businesses go unanswered
          </p>
        </div>
        <div className="border-l-2 border-accent-500 pl-4">
          <p className="font-display text-4xl font-semibold leading-none tracking-[-0.02em] text-ink-900 sm:text-5xl">
            47<span className="ml-0.5 text-2xl">hrs</span>
          </p>
          <p className="mt-2 text-sm leading-snug text-ink-700">
            typical reply to a web lead &mdash; long after they booked elsewhere
          </p>
        </div>
      </div>

      <div className="mt-5 border-t border-rule pt-3 font-mono text-[11px] text-ink-700">
        <div className="flex items-center justify-between">
          <span className="uppercase tracking-[0.14em]">Jobs you paid to win</span>
          <span className="tabular-nums text-ink-900">leaking <span className="text-data-down">↓</span></span>
        </div>
      </div>
    </InView>
  )
}
