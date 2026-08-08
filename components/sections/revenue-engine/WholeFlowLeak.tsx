'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { SectionRail } from '@/components/layout/SectionRail'
import { cn } from '@/lib/cn'

/**
 * Whole-flow leak calculator (v2) — the page's conversion engine.
 *
 *  - Trade presets snap every default to that trade's reality.
 *  - Sliders + a counting-up total make it tactile.
 *  - Models the leak across all three pillars (Bring / Convert / Retain), then
 *    shows what the engine RECOVERS and the install-frame payback in the buyer's
 *    own units (D12/R8: no fee slider, no bare monthly figure, either motion).
 *    book-jobs anchors the $30K floor and hands off to the guarantee below;
 *    sell-product carries the pieces frame + 48h-SOW line, no guarantee language.
 *  - A 12-month projection makes "do nothing" visibly expensive.
 *
 * Honesty: the visitor's own numbers, editable assumptions, conservative
 * recovery rates, formula shown, rounded down — "the audit replaces every
 * estimate with your real figures."
 */

type Vals = {
  avg: number
  bvol: number
  brate: number
  cvol: number
  crate: number
  rvol: number
  rrate: number
}

/** `unit` lets one mount speak per-trade payback nouns (roofs/installs/jobs);
 *  falls back to the mount-level `unitLabel` when absent. */
export type Preset = { key: string; label: string; unit?: string } & Vals

const DEFAULT_PRESETS: Preset[] = [
  { key: 'roofing', label: 'Roofing', unit: 'roof', avg: 4500, bvol: 180, brate: 25, cvol: 5, crate: 24, rvol: 300, rrate: 8 },
  { key: 'hvac', label: 'HVAC', unit: 'install', avg: 1200, bvol: 300, brate: 25, cvol: 8, crate: 30, rvol: 500, rrate: 14 },
  { key: 'plumbing', label: 'Plumbing', unit: 'job', avg: 450, bvol: 500, brate: 25, cvol: 15, crate: 35, rvol: 700, rrate: 20 },
  { key: 'electrical', label: 'Electrical', unit: 'job', avg: 600, bvol: 300, brate: 25, cvol: 10, crate: 33, rvol: 450, rrate: 16 },
]

const BRING_TO_JOB = 0.02 // conservative: share of missed nearby searches that become a job
const RECOVER = { bring: 0.4, convert: 0.6, retain: 0.5 } // conservative recovery per pillar

const PILLARS = [
  { key: 'bring', label: 'Bring', tag: 'get found', bar: 'bg-accent-400' },
  { key: 'convert', label: 'Convert', tag: 'win who reaches you', bar: 'bg-accent-500' },
  { key: 'retain', label: 'Retain', tag: 'bring them back', bar: 'bg-accent-600' },
] as const

type SliderMeta = { key: keyof Vals; label: string; min: number; max: number; step: number; fmt: 'n' | 'pct' | 'usd' }
export type FieldSet = Record<'bring' | 'convert' | 'retain', SliderMeta[]>
const DEFAULT_FIELDS: FieldSet = {
  bring: [
    { key: 'bvol', label: 'Searches a month nearby', min: 0, max: 2000, step: 10, fmt: 'n' },
    { key: 'brate', label: 'Find you today', min: 0, max: 100, step: 1, fmt: 'pct' },
  ],
  convert: [
    { key: 'cvol', label: 'Calls / forms missed a week', min: 0, max: 40, step: 1, fmt: 'n' },
    { key: 'crate', label: 'Close rate', min: 0, max: 100, step: 1, fmt: 'pct' },
  ],
  retain: [
    { key: 'rvol', label: 'Past customers in your list', min: 0, max: 4000, step: 25, fmt: 'n' },
    { key: 'rrate', label: 'Return or refer in a year', min: 0, max: 50, step: 1, fmt: 'pct' },
  ],
}

export type LeakHeading = { eyebrow: string; titleA: string; titleB: string; intro: string }
const DEFAULT_HEADING: LeakHeading = {
  eyebrow: 'What the whole leak costs you',
  titleA: 'It’s not just the calls you miss.',
  titleB: 'You leak in three places.',
  intro:
    'Pick your trade, slide in your own numbers, and watch the whole thing add up — then see what the engine puts back.',
}

function usd(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}
function fmtVal(v: number, fmt: SliderMeta['fmt']) {
  return fmt === 'usd' ? usd(v) : fmt === 'pct' ? `${v}%` : v.toLocaleString('en-US')
}

/** Tween a number on change (respects reduced motion). */
function useAnimatedNumber(target: number) {
  const [val, setVal] = useState(target)
  const fromRef = useRef(target)
  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const from = fromRef.current
    const dur = reduce ? 0 : 450
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const t = dur === 0 ? 1 : Math.min(1, (now - start) / dur)
      const eased = 1 - Math.pow(1 - t, 3)
      setVal(Math.round(from + (target - from) * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
      else fromRef.current = target
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target])
  return val
}

export function WholeFlowLeak({
  id,
  presets = DEFAULT_PRESETS,
  fields = DEFAULT_FIELDS,
  avgLabel = 'Your average job',
  unitLabel = 'job',
  avgNoun = 'job',
  heading = DEFAULT_HEADING,
  motion = 'book-jobs',
  installFloor = 30000,
  cta = {
    label: 'Turn this into your real number',
    href: '#audit',
    tag: 'revenue_leak_audit__calculator',
    sub: '20 min · free · yours to keep',
  },
}: {
  id?: string
  /** Trade/vertical presets. Each snaps every slider to that segment's reality. */
  presets?: Preset[]
  /** Per-pillar slider labels (so a vertical can speak its own language). */
  fields?: FieldSet
  /** Label for the shared per-unit value slider (e.g. "Your average case"). */
  avgLabel?: string
  /** Singular noun for one won unit of work — "job" (home services), "case" (dental), "piece" (retail). */
  unitLabel?: string
  /** Noun for the value slider in running copy — "at your average {avgNoun}". */
  avgNoun?: string
  heading?: LeakHeading
  /** Both motions render the install frame (D12: no fee slider, no bare monthly
   *  figure). 'book-jobs' hands off to the guarantee the page mounts below;
   *  'sell-product' carries the 48h-SOW line and no guarantee language. */
  motion?: 'book-jobs' | 'sell-product'
  /** One-time install floor the sell-product payback line anchors to. */
  installFloor?: number
  /** Panel CTA. Defaults to the book-jobs audit anchor. */
  cta?: { label: string; href: string; tag?: string; sub?: string }
}) {
  const [trade, setTrade] = useState(presets[0].key)
  const [v, setV] = useState<Vals>(stripKey(presets[0]))

  function selectTrade(key: string) {
    const p = presets.find((x) => x.key === key) ?? presets[0]
    setTrade(key)
    setV(stripKey(p))
  }
  const set = (k: keyof Vals, n: number) => setV((s) => ({ ...s, [k]: Number.isNaN(n) ? 0 : n }))

  const bring = Math.floor(v.bvol * (1 - v.brate / 100) * BRING_TO_JOB * v.avg * 12)
  const convert = Math.floor(v.cvol * (v.crate / 100) * v.avg * 52)
  const retain = Math.floor(v.rvol * (v.rrate / 100) * v.avg)
  const amounts = { bring: Math.max(0, bring), convert: Math.max(0, convert), retain: Math.max(0, retain) }
  const total = amounts.bring + amounts.convert + amounts.retain
  const recovered = Math.floor(
    amounts.bring * RECOVER.bring + amounts.convert * RECOVER.convert + amounts.retain * RECOVER.retain,
  )
  const unitsToInstall = v.avg > 0 ? Math.ceil(installFloor / v.avg) : 0
  const unitsRecovered = v.avg > 0 ? Math.round(recovered / v.avg) : 0
  // Per-trade payback noun: the selected preset's unit, else the mount's unitLabel.
  const unit = presets.find((p) => p.key === trade)?.unit ?? unitLabel

  const animTotal = useAnimatedNumber(total)
  const animRecovered = useAnimatedNumber(recovered)
  const pct = (x: number) => (total > 0 ? (x / total) * 100 : 0)

  return (
    <SectionRail tone="surface" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          {heading.eyebrow}
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          {heading.titleA} {heading.titleB}
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">{heading.intro}</p>
      </div>

      {/* Trade presets */}
      <p className="mt-8 text-sm text-ink-500">
        Conservative defaults &mdash; slide in your own. The audit replaces every estimate with
        your real figures.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => selectTrade(p.key)}
            aria-pressed={p.key === trade}
            className={cn(
              'cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold transition-colors duration-200',
              p.key === trade
                ? 'border-ink-900 bg-ink-900 text-white'
                : 'border-rule-strong bg-surface text-ink-700 hover:border-ink-900 hover:text-ink-900',
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-px overflow-hidden rounded-xl border border-rule-strong bg-rule-strong lg:grid-cols-[1.05fr_0.95fr]">
        {/* Inputs — sliders, grouped by pillar */}
        <div className="space-y-7 bg-surface p-6 sm:p-8">
          <Slider
            label={avgLabel}
            value={v.avg}
            min={100}
            max={20000}
            step={100}
            fmt="usd"
            onChange={(n) => set('avg', n)}
          />
          {(['bring', 'convert', 'retain'] as const).map((pk, i) => (
            <div key={pk} className="border-t border-rule pt-6">
              <div className="flex items-center gap-2.5">
                <span className={cn('h-2.5 w-2.5 rounded-[2px]', PILLARS[i].bar)} aria-hidden />
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-700">
                  {PILLARS[i].label} <span className="text-ink-400">· {PILLARS[i].tag}</span>
                </p>
                <span className="ml-auto font-mono text-sm font-semibold tabular-nums text-ink-900">
                  {usd(amounts[pk])}
                </span>
              </div>
              <div className="mt-4 space-y-5">
                {fields[pk].map((f) => (
                  <Slider
                    key={f.key}
                    label={f.label}
                    value={v[f.key]}
                    min={f.min}
                    max={f.max}
                    step={f.step}
                    fmt={f.fmt}
                    onChange={(n) => set(f.key, n)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Result */}
        <div className="flex flex-col bg-ink-900 p-6 text-white sm:p-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/50">
            Leaking now &middot; {usd(Math.floor(total / 12))} a month
          </p>
          <p className="mt-2 font-display text-6xl font-semibold tabular-nums leading-none text-accent-500 sm:text-7xl">
            {usd(animTotal)}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-white/70">walks out the door a year</p>

          <div className="mt-6 flex h-3 w-full overflow-hidden rounded-full bg-white/10" aria-hidden>
            {PILLARS.map((p) => (
              <div key={p.key} className={p.bar} style={{ width: `${pct(amounts[p.key])}%` }} />
            ))}
          </div>
          <ul className="mt-4 space-y-2">
            {PILLARS.map((p) => (
              <li key={p.key} className="flex items-center justify-between gap-4 text-sm">
                <span className="flex items-center gap-2.5">
                  <span className={cn('h-2.5 w-2.5 rounded-[2px]', p.bar)} aria-hidden />
                  <span className="text-white">{p.label}</span>
                </span>
                <span className="font-mono tabular-nums text-white/80">{usd(amounts[p.key])}</span>
              </li>
            ))}
          </ul>

          {/* Recovery + payback */}
          <div className="mt-6 rounded-[4px] border border-accent-500/30 bg-accent-500/[0.08] p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent-500">
              What the engine puts back
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-100">
              Conservatively,{' '}
              <span className="font-display text-xl font-semibold text-white">
                {usd(animRecovered)}
              </span>{' '}
              of that comes back a year.
            </p>
            {motion === 'sell-product' ? (
              /* Install frame (D12, sell-product): the floor in the buyer's own
                 units, live from the avg slider. No fee slider, no guarantee. */
              <div className="mt-4 border-t border-white/10 pt-4">
                <p className="text-sm font-semibold text-white">
                  The install starts at {usd(installFloor)}. At your average {avgNoun}, that&rsquo;s{' '}
                  {unitsToInstall} {unit}
                  {unitsToInstall === 1 ? '' : 's'}
                  {' '}&mdash; once.
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink-100">
                  {unitsRecovered > 0 && (
                    <>
                      Everything after that is return &mdash; the model above recovers about{' '}
                      {unitsRecovered} {unit}
                      {unitsRecovered === 1 ? '' : 's'} a year.{' '}
                    </>
                  )}
                  Your exact number comes in the written SOW, within 48 hours.
                </p>
              </div>
            ) : (
              /* Install frame (D12, book-jobs): same floor + live payback in
                 their unit, then hand off to the guarantee the page mounts
                 below. No fee slider, no bare monthly figure (R8). */
              <div className="mt-4 border-t border-white/10 pt-4">
                <p className="text-sm font-semibold text-white">
                  The install starts at {usd(installFloor)}, scaled to what the audit models. At your
                  average {unit}, the recovered work above covers it in the first {unitsToInstall}{' '}
                  {unit}
                  {unitsToInstall === 1 ? '' : 's'}.
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink-100">
                  After that the fee is monthly, and the test runs on the total. By day 120, the
                  recovered line on your report has to cover everything you&rsquo;ve paid. That&rsquo;s
                  the guarantee below.
                </p>
              </div>
            )}
          </div>

          {/* CTA — anchored to the bottom of the panel (turn the estimate into the real number) */}
          <div className="mt-auto pt-8">
            <Link
              href={cta.href}
              data-cta={cta.tag ?? 'revenue_leak_audit__calculator'}
              data-cta-location="calculator"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-[4px] bg-brand-600 px-5 py-3.5 text-base font-semibold text-white shadow-cta transition-colors duration-200 hover:bg-brand-700"
            >
              {cta.label}
              <span aria-hidden>→</span>
            </Link>
            {cta.sub && (
              <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">
                {cta.sub}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 12-month projection — both motions chart the one-time install floor */}
      <Projection total={total} recovered={recovered} installFloor={installFloor} />

      <p className="mt-4 max-w-3xl font-mono text-[11px] uppercase tracking-[0.14em] text-ink-400">
        Your numbers, your assumptions &middot; bring assumes a conservative {Math.round(BRING_TO_JOB * 100)}% of
        missed searches become a {unitLabel}; the engine recovers {Math.round(RECOVER.convert * 100)}% of convert,{' '}
        {Math.round(RECOVER.bring * 100)}% of bring, {Math.round(RECOVER.retain * 100)}% of retain.{' '}
        {motion === 'sell-product' ? 'We round' : 'I round'} down. The audit replaces every estimate
        with your real figures.
      </p>
    </SectionRail>
  )
}

function stripKey(p: Preset): Vals {
  const { avg, bvol, brate, cvol, crate, rvol, rrate } = p
  return { avg, bvol, brate, cvol, crate, rvol, rrate }
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  fmt,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  fmt: SliderMeta['fmt']
  onChange: (n: number) => void
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label className="text-sm font-medium text-ink-800">{label}</label>
        <span className="font-mono text-sm font-semibold tabular-nums text-ink-900">
          {fmtVal(value, fmt)}
        </span>
      </div>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.valueAsNumber)}
        className="mt-2 w-full cursor-pointer accent-accent-500"
      />
    </div>
  )
}

/** Cumulative leak (do nothing) vs recovered (start now), 12 months. The cost
 *  reference is the cumulative monthly fee (book-jobs) or the flat one-time
 *  install floor (sell-product) — recovered crossing it is the payback moment. */
function Projection({
  total,
  recovered,
  installFloor,
}: {
  total: number
  recovered: number
  installFloor: number
}) {
  const W = 100
  const H = 34
  const pad = 2
  const maxY = Math.max(total, 1)
  const y = (val: number) => H - pad - (val / maxY) * (H - pad * 2)
  const x = (m: number) => (m / 12) * W
  const months = Array.from({ length: 13 }, (_, m) => m)
  const leakPts = months.map((m) => `${x(m)},${y((total * m) / 12)}`).join(' ')
  const recPts = months.map((m) => `${x(m)},${y((recovered * m) / 12)}`).join(' ')
  const installY = y(Math.min(installFloor, maxY))

  return (
    <div className="mt-6 rounded-xl border border-rule bg-paper p-6 sm:p-7">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          The next 12 months
        </p>
        <p className="text-sm text-ink-600">
          Do nothing and <span className="font-semibold text-ink-900">{usd(total)}</span> is gone by month 12.
        </p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="mt-4 h-44 w-full" role="img" aria-label="12-month projection of the leak versus recovered revenue">
        <polygon points={`0,${H - pad} ${leakPts} ${W},${H - pad}`} className="fill-ink-900/[0.05]" />
        <polyline points={leakPts} className="fill-none stroke-ink-500" strokeWidth={1.25} vectorEffect="non-scaling-stroke" />
        <polyline points={recPts} className="fill-none stroke-accent-500" strokeWidth={2.5} vectorEffect="non-scaling-stroke" />
        <line x1={0} y1={installY} x2={W} y2={installY} className="stroke-ink-300" strokeWidth={1} strokeDasharray="3 2" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="mt-1.5 flex justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-ink-400">
        <span>Now</span>
        <span>6 months</span>
        <span>12 months</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-[11px]">
        <span className="flex items-center gap-2 font-mono uppercase tracking-[0.14em] text-ink-500">
          <span className="h-2 w-3 rounded-[1px] bg-ink-400" aria-hidden /> Leaking, do nothing
        </span>
        <span className="flex items-center gap-2 font-mono uppercase tracking-[0.14em] text-ink-500">
          <span className="h-2 w-3 rounded-[1px] bg-accent-500" aria-hidden /> Recovered with the engine
        </span>
        <span className="flex items-center gap-2 font-mono uppercase tracking-[0.14em] text-ink-400">
          <span className="h-px w-3 bg-ink-300" aria-hidden /> The install, once
        </span>
      </div>
    </div>
  )
}
