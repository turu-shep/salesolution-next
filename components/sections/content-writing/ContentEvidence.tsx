import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'

import { CountUp } from '../CountUp'

/**
 * Content-writing § 06 — Proof.
 *
 * Same editorial shape as the homepage Evidence section but reframed
 * around the content engagement: huge display number, 6-month citation
 * path chart, body explaining the playbook, embedded pull quote.
 */

// Six-month AIO citation count on the client's top 50 commercial queries.
const CITATION_PATH = [4, 7, 12, 19, 27, 34]
const MONTHS = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan']

const PULL_QUOTE = {
  text: 'They turned our spec PDFs and tribal engineering knowledge into pillar pages AI Overviews now cite ahead of the manufacturers. Inbound went from a trickle to a pipeline.',
  attrib: 'Director of Marketing',
  org: 'Industrial automation distributor · ~4,200 SKUs',
}

export function ContentEvidence({ id }: { id?: string }) {
  return (
    <SectionRail tone="paper" id={id}>
      <div className="max-w-3xl">
        <p className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-ink-500">
          Case study &middot; Industrial automation distributor &middot; Aug 2024 – Jan 2025
        </p>
        <h2 className="mt-4 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          From 4 to 34 AIO citations on the queries that move revenue.
        </h2>
      </div>

      {/* Display number — set huge so the proof carries by glance. */}
      <div className="mt-12 -mx-4 sm:-mx-6 lg:-mx-8">
        <p
          aria-hidden
          className="font-display text-[28vw] font-semibold leading-[0.85] tabular-nums tracking-[-0.05em] text-ink-900 sm:text-[22vw] lg:text-[18rem]"
        >
          <span className="text-accent-500">+</span>
          <CountUp value={30} />
          <span className="text-ink-400">/queries</span>
        </p>
        <p className="sr-only">Plus 30 AIO citations across the top 50 queries</p>
      </div>

      <div className="mt-8 grid gap-y-10 md:grid-cols-12 md:gap-x-10">
        <div className="md:col-span-5">
          <p className="max-w-md font-display text-lg font-semibold leading-snug text-ink-900">
            Additional AIO citations across the top 50 commercial queries by
            January &mdash; an 8.5&times; lift on the August baseline.
          </p>

          <p className="mt-6 text-ink-700">
            Six-month content engagement: 1 pillar page per category, 6
            cluster posts each, an engineering Q&amp;A hub per product family.
            All written by senior subject-matter writers off the client&rsquo;s
            spec data &mdash; never offshored, never LLM-drafted. The chart
            tracks unique AIO citations &mdash; not impressions, not raw
            traffic.
          </p>

          <Link
            href="/book-growth-call/"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-900 underline decoration-rule-strong underline-offset-[6px] transition-colors duration-200 hover:text-brand-600 hover:decoration-brand-600"
          >
            Scope a similar engagement
            <span aria-hidden>→</span>
          </Link>
        </div>

        <CitationChart className="md:col-span-7" />
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
    </SectionRail>
  )
}

function CitationChart({ className = '' }: { className?: string }) {
  const W = 560
  const H = 240
  const PAD_L = 44
  const PAD_R = 24
  const PAD_T = 24
  const PAD_B = 36

  const plotW = W - PAD_L - PAD_R
  const plotH = H - PAD_T - PAD_B

  const baseline = CITATION_PATH[0]
  const last = CITATION_PATH[CITATION_PATH.length - 1]
  const yMin = 0
  const yMax = 40
  const yTicks = [0, 10, 20, 30, 40]
  const xAt = (i: number) =>
    PAD_L + (i / (CITATION_PATH.length - 1)) * plotW
  const yAt = (v: number) => PAD_T + (1 - (v - yMin) / (yMax - yMin)) * plotH

  const linePath = CITATION_PATH.map(
    (v, i) =>
      `${i === 0 ? 'M' : 'L'} ${xAt(i).toFixed(1)} ${yAt(v).toFixed(1)}`,
  ).join(' ')
  const areaPath = `${linePath} L ${xAt(CITATION_PATH.length - 1).toFixed(1)} ${(H - PAD_B).toFixed(1)} L ${xAt(0).toFixed(1)} ${(H - PAD_B).toFixed(1)} Z`

  return (
    <figure className={`border border-rule bg-surface p-5 ${className}`}>
      <figcaption className="mb-4 font-mono text-[11px] text-ink-500">
        <span className="uppercase tracking-[0.18em]">
          AIO citations · top 50 commercial queries
        </span>
        <span className="mt-1.5 block normal-case tracking-normal text-ink-500">
          Source: Salesolution citation tracker · monthly snapshot
        </span>
      </figcaption>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block w-full"
        role="img"
        aria-label={`AIO citations grew from ${baseline} in August to ${last} in January.`}
      >
        {yTicks.map((v) => (
          <g key={v}>
            <line
              x1={PAD_L}
              y1={yAt(v)}
              x2={W - PAD_R}
              y2={yAt(v)}
              stroke="var(--color-rule)"
              strokeWidth="1"
            />
            <text
              x={PAD_L - 8}
              y={yAt(v) + 3}
              textAnchor="end"
              fontFamily="var(--font-mono)"
              fontSize="9"
              fill="var(--color-ink-500)"
            >
              {v}
            </text>
          </g>
        ))}

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
        <path
          d={linePath}
          stroke="var(--color-brand-600)"
          strokeWidth="2"
          fill="none"
        />

        {CITATION_PATH.map((v, i) => {
          const delta = v - baseline
          const sign = delta >= 0 ? '+' : ''
          return (
            <g key={i}>
              <circle
                cx={xAt(i)}
                cy={yAt(v)}
                r={i === CITATION_PATH.length - 1 ? 4.5 : 2.5}
                fill="var(--color-brand-600)"
              />
              <circle
                cx={xAt(i)}
                cy={yAt(v)}
                r="12"
                fill="transparent"
                className="cursor-help"
              >
                <title>{`${MONTHS[i]} · ${v} citations · ${sign}${delta} from baseline`}</title>
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
            fill="var(--color-ink-500)"
          >
            {m}
          </text>
        ))}

        <text
          x={xAt(CITATION_PATH.length - 1)}
          y={yAt(last) - 10}
          textAnchor="end"
          fontFamily="var(--font-mono)"
          fontSize="10"
          fill="var(--color-ink-900)"
        >
          {last}
        </text>
      </svg>
    </figure>
  )
}
