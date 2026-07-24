import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'
import { headlineStats } from '@/lib/stats'

import { CountUp } from './CountUp'

/**
 * Home § 05 — Evidence. One case study, told as a single dark "exhibit":
 * the claim, the delta at glance-size, and the chart that earns it are fused
 * into one navy panel so the proof reads as one argument instead of a number
 * stranded above a widget. Section stays `paper` (the dark is an inset panel,
 * not a full band) so it holds the light break between GoalIndex and the dark
 * Operator section that follows.
 *
 * The stats that used to live as a top-of-page band land at the foot as a
 * mono ledger — proof *after* a story, not context-free trivia at the top.
 */

// Six monthly samples — qualified leads, actual count per month.
const LEAD_PATH = [1840, 1990, 2210, 2360, 2480, 2640]
const MONTHS = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan']

// Quote is the fact-ledger "trimmed" form — the "qualified leads doubled inside
// two quarters" sentence contradicts +43.5% and was resolved-removed; don't
// reinstate (docs/strategy/case-studies/fact-ledger.md §1).
const PULL_QUOTE = {
  text: 'They rebuilt our product schema and rewrote our pillar pages so AI Overviews cite us instead of the manufacturer.',
  attrib: 'Operations Director',
  org: 'Industrial hydraulics distributor · ~8,500 SKUs',
}

export function Evidence() {
  return (
    <SectionRail tone="paper">
      {/* ── The exhibit: claim + delta + proof, one dark unit ───────────── */}
      <figure className="overflow-hidden rounded-[20px] bg-surface-dark">
        <div className="px-6 pt-8 pb-7 sm:px-10 sm:pt-10 lg:px-12">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-ink-300">
            Case study &middot; Industrial hydraulics distributor &middot; Aug 2024 – Jan 2025
          </p>

          <h2 className="mt-5 max-w-3xl text-balance font-display text-2xl font-semibold leading-[1.15] tracking-[-0.01em] text-white sm:text-[1.75rem]">
            1,840 to 2,640 qualified leads / mo. No new ad spend.
          </h2>

          {/* The delta, told twice: absolute at glance-size, relative beside it.
              clamp() keeps the big number inside the panel at every width — no
              viewport-unit overflow. Counts up from 0 when scrolled into view. */}
          <div className="mt-7 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            <p
              aria-hidden
              className="font-display font-semibold leading-[0.82] tracking-[-0.04em] tabular-nums text-white whitespace-nowrap"
              style={{ fontSize: 'clamp(5rem, 16vw, 11rem)' }}
            >
              <span
                className="font-normal text-accent-500"
                style={{ fontSize: '0.46em', verticalAlign: '0.42em' }}
              >
                +
              </span>
              <CountUp value={800} />
              <span
                className="text-ink-200"
                style={{ fontSize: '0.4em', verticalAlign: '0.06em' }}
              >
                /mo
              </span>
            </p>

            <div className="pb-2">
              <p className="font-display text-3xl font-semibold tabular-nums text-accent-500 sm:text-4xl">
                +43.5%
              </p>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-300">
                vs August baseline
              </p>
            </div>
          </div>
          <p className="sr-only">+800 qualified leads per month, roughly +43.5% over the August baseline</p>

          <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-200">
            Additional qualified leads per month by January.
          </p>
        </div>

        {/* Chart, native to the dark panel — an instrument, not an embed. */}
        <div className="border-t border-white/10 px-4 pt-6 pb-5 sm:px-8 sm:pb-7 lg:px-12">
          <LeadChart />
        </div>
      </figure>

      {/* ── The playbook + doors, on paper ──────────────────────────────── */}
      <div className="mt-9 flex flex-col gap-6 md:flex-row md:items-start md:justify-between md:gap-12">
        <p className="max-w-xl text-ink-700">
          Six-month engagement across technical SEO, content authority, and a
          tighter PPC stack. Product schema rewrite, 150+ category pages
          restructured for AI scannability, dedicated answer hubs for
          engineering queries. The chart tracks qualified inbounds, not
          impressions, not raw sessions.
        </p>

        <div className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-3">
          <Link
            href="/book-growth-call/"
            data-cta="book_call__evidence"
            data-cta-location="mid_body"
            className="inline-flex items-center gap-1.5 rounded-md bg-ink-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-ink-800"
          >
            Book a Growth Call
            <span aria-hidden>→</span>
          </Link>
          <Link
            href="/case-studies/hydraulics-distributor-catalog-ai-qualified-leads/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-700 underline decoration-rule-strong underline-offset-4 transition hover:text-brand-600 hover:decoration-brand-600"
          >
            Read the full case study
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>

      {/* ── Pull quote, on its own surface ──────────────────────────────── */}
      <figure className="mt-14 rounded-[20px] bg-surface-alt p-8 sm:p-12">
        <blockquote className="max-w-3xl font-display text-2xl font-medium leading-[1.2] tracking-[-0.01em] text-ink-900 sm:text-[1.9rem]">
          <span aria-hidden className="mr-1.5 text-accent-500">&ldquo;</span>
          {PULL_QUOTE.text}
          <span aria-hidden className="text-accent-500">&rdquo;</span>
        </blockquote>
        <figcaption className="mt-6 text-sm text-ink-500">
          <span className="font-semibold text-ink-900">{PULL_QUOTE.attrib}</span>
          <span aria-hidden className="mx-2 text-ink-300">&middot;</span>
          <span>{PULL_QUOTE.org}</span>
        </figcaption>
      </figure>

      {/* ── Canonical stats — mono ledger, the section's hard floor ──────── */}
      <dl className="mt-14 grid grid-cols-2 gap-y-10 border-t border-rule pt-10 sm:grid-cols-4 sm:gap-y-0">
        {headlineStats.map((s) => (
          <div
            key={s.label}
            className="sm:border-l sm:border-rule sm:pl-6 sm:first:border-l-0 sm:first:pl-0"
          >
            <dd className="font-display text-3xl font-semibold tabular-nums text-ink-900 sm:text-4xl">
              {s.value}
            </dd>
            <dt className="mt-2 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-500">
              {s.label}
            </dt>
          </div>
        ))}
      </dl>
    </SectionRail>
  )
}

function LeadChart() {
  const W = 560
  const H = 250
  const PAD_L = 50
  const PAD_R = 58
  const PAD_T = 28
  const PAD_B = 38

  const plotW = W - PAD_L - PAD_R
  const plotH = H - PAD_T - PAD_B

  const baseline = LEAD_PATH[0]
  const last = LEAD_PATH[LEAD_PATH.length - 1]
  const yMin = 1500
  const yMax = 3000
  const yTicks = [1500, 2000, 2500, 3000]
  const xAt = (i: number) => PAD_L + (i / (LEAD_PATH.length - 1)) * plotW
  const yAt = (v: number) => PAD_T + (1 - (v - yMin) / (yMax - yMin)) * plotH

  const linePath = LEAD_PATH.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i).toFixed(1)} ${yAt(v).toFixed(1)}`).join(' ')
  const areaPath = `${linePath} L ${xAt(LEAD_PATH.length - 1).toFixed(1)} ${(H - PAD_B).toFixed(1)} L ${xAt(0).toFixed(1)} ${(H - PAD_B).toFixed(1)} Z`

  return (
    <figure>
      <figcaption className="mb-5 flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-[11px]">
        <span className="uppercase tracking-[0.18em] text-ink-200">
          Qualified leads · per month
        </span>
        <span className="text-ink-300">
          Source: client&rsquo;s CRM, anonymized · monthly aggregate
        </span>
      </figcaption>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block w-full"
        role="img"
        aria-label={`Qualified leads grew from ${baseline} in August to ${last} in January.`}
      >
        <defs>
          <linearGradient id="evi-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent-500)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--color-accent-500)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {yTicks.map((v) => (
          <g key={v}>
            <line x1={PAD_L} y1={yAt(v)} x2={W - PAD_R} y2={yAt(v)} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
            <text
              x={PAD_L - 10}
              y={yAt(v) + 4}
              textAnchor="end"
              fontFamily="var(--font-mono)"
              fontSize="11"
              fill="var(--color-ink-300)"
            >
              {v.toLocaleString()}
            </text>
          </g>
        ))}

        {/* Baseline reference — the Aug start the +800 is measured from. */}
        <line
          x1={PAD_L}
          y1={yAt(baseline)}
          x2={W - PAD_R}
          y2={yAt(baseline)}
          stroke="rgba(255,255,255,0.28)"
          strokeWidth="1"
          strokeDasharray="3 4"
        />

        <path d={areaPath} fill="url(#evi-area)" />
        <path d={linePath} stroke="var(--color-accent-500)" strokeWidth="3" fill="none" strokeLinejoin="round" strokeLinecap="round" />

        {LEAD_PATH.map((v, i) => {
          const delta = v - baseline
          const sign = delta >= 0 ? '+' : ''
          const isLast = i === LEAD_PATH.length - 1
          return (
            <g key={i}>
              {isLast && <circle cx={xAt(i)} cy={yAt(v)} r="7.5" fill="var(--color-accent-500)" fillOpacity="0.2" />}
              <circle
                cx={xAt(i)}
                cy={yAt(v)}
                r={isLast ? 5 : 3}
                fill="var(--color-accent-500)"
                stroke={isLast ? 'var(--color-surface-dark)' : 'none'}
                strokeWidth={isLast ? 1.5 : 0}
              />
              {/* Invisible hit-area for hover tooltips */}
              <circle cx={xAt(i)} cy={yAt(v)} r="14" fill="transparent" className="cursor-help">
                <title>{`${MONTHS[i]} · ${v.toLocaleString()} leads · ${sign}${delta.toLocaleString()} from baseline`}</title>
              </circle>
            </g>
          )
        })}

        {MONTHS.map((m, i) => (
          <text
            key={i}
            x={xAt(i)}
            y={H - 14}
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize="11"
            fill="var(--color-ink-300)"
          >
            {m}
          </text>
        ))}

        {/* Endpoint call-outs — the start and the finish, drawn. */}
        <text
          x={xAt(0)}
          y={yAt(baseline) - 12}
          textAnchor="start"
          fontFamily="var(--font-mono)"
          fontSize="12"
          fill="var(--color-ink-200)"
        >
          {baseline.toLocaleString()}
        </text>
        <text
          x={xAt(LEAD_PATH.length - 1)}
          y={yAt(last) - 14}
          textAnchor="end"
          fontFamily="var(--font-mono)"
          fontSize="13"
          fontWeight="600"
          fill="#ffffff"
        >
          {last.toLocaleString()}
        </text>
      </svg>
    </figure>
  )
}
