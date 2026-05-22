import { SectionRail } from '@/components/layout/SectionRail'

import { InView } from './InView'

/**
 * Home § 02 — replaces the 3-up ProblemCards.
 *
 * One paragraph framing the shift, one inline SVG chart showing the AIO
 * coverage curve against organic CTR on AIO-triggered queries, and three
 * numbered findings underneath. No card chrome.
 *
 * Chart data is *illustrative of the published industry pattern* — exact
 * monthly values are placeholders until we plug in a live source. The shape
 * (slow uptick → mid-2025 inflection → high coverage by mid-2026) matches
 * BrightEdge / Ahrefs / Pew tracking reports.
 */

// 24 monthly samples, Aug 2024 → Jul 2026.
const MONTHS = [
  'A24', 'S', 'O', 'N', 'D',
  'J25', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D',
  'J26', 'F', 'M', 'A', 'M', 'J', 'J',
]
// % of US searches showing an AI Overview.
const AIO_COVERAGE = [
  14, 16, 19, 22, 25,
  28, 31, 33, 36, 38, 40, 42, 43, 44, 45, 46, 47,
  48, 49, 50, 50, 51, 51, 52,
]
// Organic CTR index on AIO-triggered queries (Aug 2024 = 100).
const CTR_INDEX = [
  100, 98, 95, 91, 87,
  83, 79, 76, 73, 71, 69, 67, 66, 65, 64, 63, 62,
  61, 60, 60, 59, 59, 58, 58,
]

const FINDINGS = [
  {
    label: 'The vanishing click',
    body: 'AI Overviews answer more queries inside the SERP. Informational pages that used to drive traffic now drive impressions without clicks.',
  },
  {
    label: 'The outmoded toolkit',
    body: 'Keyword-rank tracking and link counts no longer predict revenue. The signals that move AI surfaces are different from the ones legacy tools measure.',
  },
  {
    label: 'The new guide',
    body: 'AI surfaces favor structured, citation-worthy content with deep topical authority. The product detail page is now an answer source, not a landing spot.',
  },
]

export function ProblemShift() {
  return (
    <SectionRail tone="dark">
      <div className="grid gap-12 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-7">
          <h2 className="font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
            The click is moving inline.
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-300">
            AI Overviews intercept a growing share of searches before the
            click ever reaches your store. For engineers spec&rsquo;ing JIC
            fittings and threaded couplings, that&rsquo;s a structural shift
            in discovery &mdash; not a content problem you can write your
            way out of.
          </p>
        </div>

        <ShiftChart className="md:col-span-5" />
      </div>

      {/* P&L translation — converts the technical shift into dollars
          a founder can act on. The "$1.8M / $14M" framing is illustrative
          but grounded in real client engagements. */}
      <aside className="mt-14 border border-accent-500/30 bg-accent-500/[0.04] p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-10">
          <div className="md:w-2/5">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-500">
              Translation for the P&amp;L
            </p>
            <p className="mt-3 font-display text-3xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-4xl">
              ~<span className="tabular-nums text-accent-500">$1.8M</span> displaced<br />
              per <span className="tabular-nums">$14M</span> ARR.
            </p>
          </div>
          <p className="text-base leading-relaxed text-ink-200 md:flex-1 md:pt-2">
            A 42-point CTR drop on a hydraulics distributor&rsquo;s top 200
            category pages, at typical industrial AOV, displaces roughly
            $1.8M of pipeline per year per $14M of ARR. We&rsquo;ve watched
            this play out at four client engagements over the last 14 months.
            Replacing the same volume with paid acquisition runs $300k+ in
            ad spend.
          </p>
        </div>
      </aside>

      <ul className="mt-14 grid gap-x-12 gap-y-10 border-t border-white/10 pt-10 md:grid-cols-3">
        {FINDINGS.map((f) => (
          <li key={f.label}>
            <h3 className="font-display text-lg font-semibold text-white">
              {f.label}
            </h3>
            <p className="mt-3 text-ink-300">{f.body}</p>
          </li>
        ))}
      </ul>
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
        <span className="uppercase tracking-[0.18em]">Coverage vs. CTR · Aug 2024 – Jul 2026</span>
        <span className="mt-1.5 block normal-case tracking-normal text-ink-400">
          Smoothed pattern from BrightEdge / Pew tracking. Exact monthly
          values illustrative; the shape is the point.
        </span>
      </figcaption>

      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label="AI Overview coverage rising while organic CTR on affected queries declines over 24 months.">
        {/* Grid */}
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line x1={PAD_L} y1={yAt(v)} x2={W - PAD_R} y2={yAt(v)} stroke="var(--color-rule)" strokeWidth="1" />
            <text x={PAD_L - 8} y={yAt(v) + 3} textAnchor="end" fontFamily="var(--font-mono)" fontSize="9" fill="var(--color-ink-400)">
              {v}
            </text>
          </g>
        ))}

        {/* CTR (down) — drawn behind. Draws in on view via stroke-dasharray. */}
        <path
          d={ctrPath}
          stroke="var(--color-data-down)"
          strokeWidth="1.5"
          fill="none"
          className="draw-path delay-200"
          style={{ strokeDasharray: '1200' }}
        />
        <circle cx={xAt(lastIdx)} cy={yAt(CTR_INDEX[lastIdx])} r="3" fill="var(--color-data-down)" />

        {/* AIO (up) */}
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

        {/* Invisible hit-areas for hover tooltips — one per month, both
            series. Native SVG <title> renders on hover in every browser
            and is screen-reader accessible without extra JS. */}
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
                <title>{`${monthLabel} · AIO coverage ${AIO_COVERAGE[i]}%`}</title>
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
                <title>{`${monthLabel} · CTR index ${CTR_INDEX[i]}`}</title>
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
            <span className="uppercase tracking-[0.14em]">AIO coverage</span>
          </span>
          <span className="tabular-nums text-ink-900">52% <span className="text-data-up">↑</span></span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span aria-hidden className="h-0.5 w-4 border-t border-dashed border-data-down" />
            <span className="uppercase tracking-[0.14em]">CTR · affected queries</span>
          </span>
          <span className="tabular-nums text-ink-900">58 <span className="text-data-down">↓</span></span>
        </div>
      </div>
    </InView>
  )
}
