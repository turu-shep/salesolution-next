import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'
import {
  DEMAND_DECISION,
  DEMAND_SOURCES,
  type DemandSource,
  type FunnelStageId,
  FUNNEL_STAGES,
  RETENTION,
  SOURCE_GROUP_META,
} from '@/lib/demand-system'

import { InView } from './InView'

/**
 * Home § 01.5 — the demand system, shown.
 *
 * The model it has to teach: a customer can be anywhere on the web AND at any
 * stage of awareness, so channels enter the funnel where the buyer actually is
 * — cold discovery at TOFU, active research at MOFU, ready-to-buy at BOFU — not
 * all dumped into the top. After the decision, existing customers loop back via
 * retention (the secondary arrow below the decision). Throughline: one team
 * builds and runs all of it.
 *
 * Rendered as a single engineered figure in the house style (a bordered
 * <figure> + <figcaption>, like ProblemShift's chart): an inline-SVG funnel
 * vessel (tapering walls + faint gradient fill) with the stage bands sitting
 * inside it and per-stage connectors flowing sources in (continuous "marching
 * dash", reduced-motion safe). CSS-only hover/focus tooltips on the dense
 * source nodes; the shared <InView> wrapper drives a staggered rise-in keyed
 * off data-in-view in globals.css. Every node's copy lives in
 * lib/demand-system.ts — edit there.
 */

// Per-stage converging connector fan — sources above a band gather into it.
function fanPaths(n: number, w: number, h: number): string[] {
  const midX = w / 2
  const topY = 2
  const botY = h - 2
  if (n <= 1) return [`M ${midX} ${topY} L ${midX} ${botY}`]
  return Array.from({ length: n }, (_, i) => {
    const startX = w * 0.06 + (i / (n - 1)) * (w * 0.88)
    return `M ${startX.toFixed(1)} ${topY} C ${startX.toFixed(1)} ${(topY + h * 0.55).toFixed(
      1,
    )} ${midX} ${(botY - h * 0.45).toFixed(1)} ${midX} ${botY}`
  })
}

// Funnel vessel silhouette, drawn in a stretchy 0–100 space behind the bands.
// Gentle taper up top (room for the wide source rows) pinching to the neck.
const FUNNEL_LEFT = 'M4 0C6 30 16 60 30 100'
const FUNNEL_RIGHT = 'M96 0C94 30 84 60 70 100'
const FUNNEL_FILL = 'M4 0L96 0C94 30 84 60 70 100L30 100C16 60 6 30 4 0Z'

// Descending blue-intensity ramp: neutral stranger → brand-tinted, ready-to-buy.
const STAGE_TONE: Record<FunnelStageId, string> = {
  tofu: 'border-white/10 bg-white/[0.04]',
  mofu: 'border-brand-500/25 bg-brand-500/[0.07]',
  bofu: 'border-brand-500/45 bg-brand-500/[0.12]',
}

function SourceChip({ src, delay }: { src: DemandSource; delay: number }) {
  const meta = SOURCE_GROUP_META[src.group]
  return (
    <li className="group/src demand-rise relative" style={{ transitionDelay: `${delay}ms` }}>
      <button
        type="button"
        aria-describedby={`demand-tip-${src.id}`}
        className={`flex cursor-help items-center gap-2 rounded-pill border bg-white/[0.04] px-3.5 py-2 text-sm font-medium text-white/90 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${meta.chip}`}
      >
        <span aria-hidden className={`h-1.5 w-1.5 shrink-0 rounded-full ${meta.dot}`} />
        {src.label}
      </button>
      <span
        role="tooltip"
        id={`demand-tip-${src.id}`}
        className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2.5 w-[min(15rem,calc(100vw-2rem))] -translate-x-1/2 translate-y-1 rounded-[4px] border border-rule bg-surface px-3.5 py-2.5 text-left text-[13px] leading-snug text-ink-700 opacity-0 shadow-lg transition-[opacity,transform] duration-150 group-hover/src:translate-y-0 group-hover/src:opacity-100 group-focus-within/src:translate-y-0 group-focus-within/src:opacity-100"
      >
        <span className={`mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] ${meta.text}`}>
          {meta.label}
        </span>
        {src.note}
        <span
          aria-hidden
          className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1 rotate-45 border-b border-r border-rule bg-surface"
        />
      </span>
    </li>
  )
}

export function DemandSystem({ id }: { id?: string }) {
  return (
    <SectionRail tone="dark" glow="strong" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-200">
          The demand system
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
          Wherever your customer is.{' '}
          <span className="text-ink-300">Whatever stage they&rsquo;re at.</span>
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-200">
          A buyer can be anywhere on the web &mdash; and at any stage of making up
          their mind. So we don&rsquo;t dump every channel into the top of the
          funnel. Each one enters where your buyer actually is, and we build and
          run all of it as one system.
        </p>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
          Hover any source to see how it feeds the machine
        </p>
      </div>

      <InView className="mt-12 overflow-x-clip">
        {/* Shared gradient for the connector fans. */}
        <svg width="0" height="0" className="absolute" aria-hidden>
          <defs>
            <linearGradient id="demand-fade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-brand-300)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--color-brand-500)" stopOpacity="0.6" />
            </linearGradient>
          </defs>
        </svg>

        {/* One engineered figure, framed like the house charts. */}
        <figure className="rounded-[4px] border border-white/10 bg-white/[0.02] px-3 py-9 sm:px-8 sm:py-12">
          {/* Family legend */}
          <ul className="mb-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-300">
            {(['earned', 'paid', 'owned'] as const).map((g) => (
              <li key={g} className="flex items-center gap-2">
                <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${SOURCE_GROUP_META[g].dot}`} />
                {SOURCE_GROUP_META[g].label}
              </li>
            ))}
          </ul>

          {/* ── The funnel vessel: stages sit inside drawn, tapering walls ── */}
          <div className="relative mx-auto max-w-3xl">
            <svg
              className="absolute inset-0 h-full w-full"
              style={{ zIndex: 0 }}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden
            >
              <defs>
                <linearGradient id="funnel-vessel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-brand-500)" stopOpacity="0.02" />
                  <stop offset="100%" stopColor="var(--color-brand-500)" stopOpacity="0.11" />
                </linearGradient>
              </defs>
              <path d={FUNNEL_FILL} fill="url(#funnel-vessel)" />
              <path d={FUNNEL_LEFT} fill="none" stroke="var(--color-brand-500)" strokeOpacity="0.32" strokeWidth="1" vectorEffect="non-scaling-stroke" />
              <path d={FUNNEL_RIGHT} fill="none" stroke="var(--color-brand-500)" strokeOpacity="0.32" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            </svg>

            <div className="relative" style={{ zIndex: 1 }}>
              {FUNNEL_STAGES.map((stage, si) => {
                const sources = DEMAND_SOURCES.filter((s) => s.stage === stage.id)
                const paths = fanPaths(sources.length, 1000, 60)
                const num = String(si + 1).padStart(2, '0')
                return (
                  <div key={stage.id} className={si > 0 ? 'mt-3' : ''}>
                    <p className="mx-auto max-w-md text-center text-[13px] leading-snug text-ink-200">
                      {stage.entryLabel}
                    </p>

                    <ul className="mx-auto mt-3 flex max-w-2xl flex-wrap justify-center gap-2.5 sm:gap-3">
                      {sources.map((src, i) => (
                        <SourceChip key={src.id} src={src} delay={Math.min(i * 60, 360)} />
                      ))}
                    </ul>

                    {/* sources flow into this band */}
                    <svg
                      viewBox="0 0 1000 60"
                      className="mx-auto mt-1 block h-9 w-full max-w-2xl"
                      preserveAspectRatio="xMidYMax meet"
                      aria-hidden
                    >
                      {/* static underlay for legibility + reduced motion */}
                      {paths.map((d, i) => (
                        <path key={`u${i}`} d={d} fill="none" stroke="var(--color-brand-500)" strokeOpacity="0.1" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                      ))}
                      {/* animated flow */}
                      {paths.map((d, i) => (
                        <path
                          key={`f${i}`}
                          d={d}
                          fill="none"
                          stroke="url(#demand-fade)"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          vectorEffect="non-scaling-stroke"
                          className="demand-flow"
                          style={{ animationDelay: `${(i % 5) * 0.12}s` }}
                        />
                      ))}
                    </svg>

                    {/* the stage band */}
                    <div
                      className={`demand-rise mx-auto w-full rounded-[4px] border px-5 py-4 sm:px-6 ${STAGE_TONE[stage.id]}`}
                      style={{ ['--w' as string]: `${Math.round(stage.width * 100)}%` }}
                      data-funnel-band
                    >
                      <p className="text-center font-mono text-[10px] uppercase tracking-[0.18em]">
                        <span className="text-ink-300">{num}</span>
                        <span className="mx-2 text-ink-300/60">/</span>
                        <span className="text-brand-300">{stage.acronym}</span>
                        <span className="mx-1.5 text-ink-300/60">&middot;</span>
                        <span className="text-brand-300">{stage.phase}</span>
                      </p>
                      <p className="mt-1.5 text-center font-display text-lg font-semibold tracking-[-0.01em] text-white">
                        {stage.label}
                        <span className="text-ink-300"> &mdash; {stage.action}</span>
                      </p>
                      <p className="mx-auto mt-2 max-w-md text-center text-[15px] leading-relaxed text-ink-200">
                        {stage.note}
                      </p>
                    </div>
                  </div>
                )
              })}

              {/* neck → decision */}
              <div aria-hidden className="flex justify-center py-2.5 text-brand-300/80">
                <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
                  <path d="M1 1l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* Decision — the climax, at the neck */}
              <div
                className="demand-rise relative mx-auto w-full overflow-hidden rounded-[4px] border border-brand-300/70 bg-brand-600 px-6 py-5 text-center shadow-[0_0_60px_-12px_rgba(38,82,239,0.85)]"
                style={{ ['--w' as string]: '40%' }}
                data-funnel-band
              >
                <span aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_400px_120px_at_50%_0%,rgba(255,255,255,0.2),transparent_70%)]" />
                <span className="relative font-mono text-[10px] uppercase tracking-[0.18em] text-white/75">
                  <span className="text-white/55">04</span>
                  <span className="mx-2 text-white/40">/</span>
                  {DEMAND_DECISION.label}
                </span>
                <p className="relative mt-1.5 font-display text-xl font-semibold tracking-[-0.01em] text-white">
                  {DEMAND_DECISION.sub}
                </p>
                <p className="relative mx-auto mt-1.5 max-w-sm text-[15px] leading-relaxed text-white/85">
                  {DEMAND_DECISION.note}
                </p>
              </div>
            </div>
          </div>

          {/* ── Retention loop: won customers cycle back, below the decision ── */}
          <div className="relative mx-auto mt-0 max-w-3xl">
            <div aria-hidden className="flex justify-center py-2.5 text-accent-500/80">
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                <path d="M1 1l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <div
              className="demand-rise relative mx-auto w-full rounded-[4px] border border-accent-500/40 bg-accent-500/[0.05] px-5 py-4 text-center sm:px-6"
              style={{ ['--w' as string]: '64%' }}
              data-funnel-band
            >
              <span className="flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-accent-500">
                <span className="text-accent-500/60">05</span>
                <span className="text-accent-500/40">/</span>
                {RETENTION.loopLabel}
              </span>
              <p className="mt-1.5 font-display text-lg font-semibold text-white">
                {RETENTION.label}
              </p>
              <p className="mx-auto mt-1.5 max-w-md text-[15px] leading-relaxed text-ink-200">
                {RETENTION.note}
              </p>
            </div>

            {/* Loop-back trace: retention re-enters near the buy decision.
                Sharp corners (not a rounded pill) to read as an engineered
                return path rather than generic flowchart chrome. */}
            <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 hidden w-14 md:-right-6 md:block">
              <span className="absolute right-4 top-12 bottom-14 rounded-r-[3px] border-y-2 border-r-2 border-dashed border-accent-500/70" />
              <svg className="absolute right-[9px] top-[34px] text-accent-500" width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M7.5 1L1 6.5l6.5 5.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="absolute right-7 top-1/2 origin-center -translate-y-1/2 rotate-90 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.18em] text-accent-500">
                loops back
              </span>
            </div>
          </div>

          <p className="mx-auto mt-3 max-w-sm text-center font-mono text-[10px] uppercase tracking-[0.16em] text-accent-500 md:hidden">
            &uarr; existing customers loop back to the next decision
          </p>

          {/* figure caption — house signature */}
          <figcaption className="mx-auto mt-9 max-w-md text-center font-mono text-[10px] uppercase tracking-[0.16em] text-ink-300">
            Stage entry points illustrative &middot; the system is real &mdash; one team builds &amp; runs every box
          </figcaption>
        </figure>

        {/* ── Throughline: we build and run all of it ────────────────────── */}
        <div className="mx-auto mt-10 flex max-w-3xl flex-col items-start gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-base leading-relaxed text-ink-200">
            <span className="font-display text-lg font-semibold text-white">
              We develop all of it.{' '}
            </span>
            Every box above &mdash; earned, paid and owned, at every stage &mdash;
            engineered, wired together and operated by one team. Not ten vendors.
            One system.
          </p>
          <Link
            href="/revenue-engine/"
            data-cta="demand-system-engine"
            data-cta-location="home-demand-system"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-[4px] border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:border-white hover:bg-white hover:text-ink-900"
          >
            See how the engine works
            <span aria-hidden>&rarr;</span>
          </Link>
        </div>
      </InView>
    </SectionRail>
  )
}
