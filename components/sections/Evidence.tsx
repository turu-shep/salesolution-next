import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'
import { headlineStats } from '@/lib/stats'

import { CountUp } from './CountUp'

/**
 * Home § 05 — replaces HydraulicsCaseStudy + WhoWeServe + the standalone
 * TestimonialCarousel. One case study, expanded inline: number callout,
 * six-month metric path chart, body explaining the playbook, one
 * embedded pull quote, then the canonical stats row at the bottom.
 *
 * The stats that used to live as a top-of-page band move here — they
 * land as proof *after* a story instead of context-free trivia at the top.
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
      <div className="max-w-3xl">
        <p className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-ink-500">
          Case study &middot; Industrial hydraulics distributor &middot; Aug 2024 – Jan 2025
        </p>
        <h2 className="mt-4 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          1,840 to 2,640 qualified leads / mo. No new ad spend.
        </h2>
      </div>

      {/* Display number — set huge so the proof carries by glance, not by reading.
          Counts up from 0 when scrolled into view. */}
      <div className="mt-12 -mx-4 sm:-mx-6 lg:-mx-8">
        <p
          aria-hidden
          className="font-display text-[28vw] font-semibold leading-[0.85] tabular-nums tracking-[-0.05em] text-ink-900 sm:text-[22vw] lg:text-[18rem]"
        >
          <span className="text-accent-500">+</span>
          <CountUp value={800} />
          <span className="text-ink-400">/mo</span>
        </p>
        <p className="sr-only">+800 leads per month</p>
      </div>

      <div className="mt-8 grid gap-y-10 md:grid-cols-12 md:gap-x-10">
        <div className="md:col-span-5">
          <p className="max-w-md font-display text-lg font-semibold leading-snug text-ink-900">
            Additional qualified leads per month by January &mdash; roughly
            +43.5% on the August baseline.
          </p>

          <p className="mt-6 text-ink-700">
            Six-month engagement across technical SEO, content authority,
            and a tighter PPC stack. Product schema rewrite, 150+ category
            pages restructured for AI scannability, dedicated answer hubs
            for engineering queries. The chart tracks qualified inbounds
            &mdash; not impressions, not raw sessions.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href="/case-studies/hydraulics-distributor-catalog-ai-qualified-leads/"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-900 underline decoration-rule-strong underline-offset-[6px] transition hover:text-brand-600 hover:decoration-brand-600"
            >
              Read the full case study
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/book-growth-call/"
              data-cta="book_call__evidence"
              data-cta-location="mid_body"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-900 underline decoration-rule-strong underline-offset-[6px] transition hover:text-brand-600 hover:decoration-brand-600"
            >
              Book a Growth Call
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>

        <LeadChart className="md:col-span-7" />
      </div>

      {/* Pull quote */}
      <figure className="mt-16 border-t border-rule pt-10">
        <blockquote className="max-w-3xl font-display text-2xl font-medium leading-snug text-ink-900 sm:text-3xl">
          <span aria-hidden className="mr-2 text-ink-300">&ldquo;</span>
          {PULL_QUOTE.text}
          <span aria-hidden className="ml-1 text-ink-300">&rdquo;</span>
        </blockquote>
        <figcaption className="mt-5 text-sm text-ink-500">
          <span className="font-semibold text-ink-900">{PULL_QUOTE.attrib}</span>
          <span aria-hidden className="mx-2 text-ink-300">&middot;</span>
          <span>{PULL_QUOTE.org}</span>
        </figcaption>
      </figure>

      {/* Canonical stats — quiet row at the foot of the section. */}
      <dl className="mt-16 grid grid-cols-2 gap-x-10 gap-y-8 border-t border-rule pt-8 sm:grid-cols-4">
        {headlineStats.map((s) => (
          <div key={s.label}>
            <dd className="font-display text-2xl font-semibold tabular-nums text-ink-900 sm:text-3xl">
              {s.value}
            </dd>
            <dt className="mt-1.5 text-xs text-ink-500">{s.label}</dt>
          </div>
        ))}
      </dl>
    </SectionRail>
  )
}

function LeadChart({ className = '' }: { className?: string }) {
  const W = 560
  const H = 240
  const PAD_L = 44
  const PAD_R = 24
  const PAD_T = 24
  const PAD_B = 36

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
    <figure className={`border border-rule bg-surface p-5 ${className}`}>
      <figcaption className="mb-4 font-mono text-[11px] text-ink-500">
        <span className="uppercase tracking-[0.18em]">
          Qualified leads · per month
        </span>
        <span className="mt-1.5 block normal-case tracking-normal text-ink-400">
          Source: client&rsquo;s CRM, anonymized · monthly aggregate
        </span>
      </figcaption>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block w-full"
        role="img"
        aria-label={`Qualified leads grew from ${baseline} in August to ${last} in January.`}
      >
        {yTicks.map((v) => (
          <g key={v}>
            <line x1={PAD_L} y1={yAt(v)} x2={W - PAD_R} y2={yAt(v)} stroke="var(--color-rule)" strokeWidth="1" />
            <text
              x={PAD_L - 8}
              y={yAt(v) + 3}
              textAnchor="end"
              fontFamily="var(--font-mono)"
              fontSize="9"
              fill="var(--color-ink-400)"
            >
              {v.toLocaleString()}
            </text>
          </g>
        ))}

        {/* Baseline marker — actual baseline, not a round number */}
        <line
          x1={PAD_L}
          y1={yAt(baseline)}
          x2={W - PAD_R}
          y2={yAt(baseline)}
          stroke="var(--color-rule-strong)"
          strokeWidth="1"
          strokeDasharray="2 3"
        />

        <path d={areaPath} fill="var(--color-brand-600)" fillOpacity="0.08" />
        <path d={linePath} stroke="var(--color-brand-600)" strokeWidth="2" fill="none" />

        {LEAD_PATH.map((v, i) => {
          const delta = v - baseline
          const sign = delta >= 0 ? '+' : ''
          return (
            <g key={i}>
              <circle
                cx={xAt(i)}
                cy={yAt(v)}
                r={i === LEAD_PATH.length - 1 ? 4.5 : 2.5}
                fill="var(--color-brand-600)"
              />
              {/* Invisible hit-area for hover tooltips */}
              <circle
                cx={xAt(i)}
                cy={yAt(v)}
                r="12"
                fill="transparent"
                className="cursor-help"
              >
                <title>{`${MONTHS[i]} · ${v.toLocaleString()} leads · ${sign}${delta.toLocaleString()} from baseline`}</title>
              </circle>
            </g>
          )
        })}

        {MONTHS.map((m, i) => (
          <text
            key={i}
            x={xAt(i)}
            y={H - 16}
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize="9"
            fill="var(--color-ink-400)"
          >
            {m}
          </text>
        ))}

        <text
          x={xAt(LEAD_PATH.length - 1)}
          y={yAt(last) - 10}
          textAnchor="end"
          fontFamily="var(--font-mono)"
          fontSize="10"
          fill="var(--color-ink-900)"
        >
          {last.toLocaleString()}
        </text>
      </svg>
    </figure>
  )
}
