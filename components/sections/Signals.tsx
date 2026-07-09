'use client'

import Link from 'next/link'
import { useState } from 'react'

import { SectionRail } from '@/components/layout/SectionRail'
import { cn } from '@/lib/cn'

/**
 * Home § 06 — Signals.
 *
 * Self-diagnosis checklist. Each row is clickable; checking it counts toward
 * a live "risk" reading shown at the bottom. The CTA wording + tone updates
 * as the reader's count climbs — silent at 0, neutral at 1, the at-risk
 * pill appears at 2+.
 */

const CONCERNS: string[] = [
  'Leads from Google have quietly dried up — and nothing on your end changed.',
  'Ask ChatGPT about your category and it names a competitor, not you.',
  'You’re paying for more clicks, but no more people actually call or buy.',
  'The phone rings while you’re busy, and nobody calls back in time.',
  'You send the quote or estimate and never hear back.',
  'You can’t tell which marketing actually brought in business.',
]

export function Signals() {
  const [checked, setChecked] = useState<boolean[]>(() => CONCERNS.map(() => false))

  const toggle = (i: number) =>
    setChecked((prev) => prev.map((c, idx) => (idx === i ? !c : c)))

  const count = checked.filter(Boolean).length
  const total = CONCERNS.length

  // Tier mirrors the probe widget so the visual language matches.
  const tier =
    count === 0 ? 'idle'
    : count === 1 ? 'watch'
    : count >= 3 ? 'risk'
    : 'gaps'

  const tierStyle = {
    idle:  { pill: 'bg-rule text-ink-500 ring-rule-strong/40',           label: 'Pick what applies' },
    watch: { pill: 'bg-data-up/10 text-data-up ring-data-up/30',         label: 'Worth watching' },
    gaps:  { pill: 'bg-accent-50 text-accent-700 ring-accent-500/30',    label: 'Structural gaps' },
    risk:  { pill: 'bg-danger-50 text-data-down ring-data-down/30',      label: 'At risk' },
  }[tier]

  return (
    <SectionRail tone="paper">
      <div className="max-w-3xl">
        <h2 className="font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          Recognize any of these?
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          Tap the ones that sound familiar. Two or more usually means you have a
          structural leak &mdash; not something more ads or content will fix.
        </p>
      </div>

      <ul className="mt-12 max-w-3xl">
        {CONCERNS.map((c, i) => (
          <li key={i}>
            <button
              type="button"
              aria-pressed={checked[i]}
              onClick={() => toggle(i)}
              className={cn(
                'group flex w-full cursor-pointer items-start gap-4 border-t border-rule py-5 text-left transition-colors duration-150 last:border-b',
                checked[i] ? 'text-ink-900' : 'text-ink-700 hover:bg-paper',
              )}
            >
              <span
                aria-hidden
                className={cn(
                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border transition-colors duration-150',
                  checked[i]
                    ? 'border-accent-500 bg-accent-500 text-white'
                    : 'border-rule-strong bg-surface text-transparent group-hover:border-ink-700',
                )}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span className="flex-1 text-base leading-relaxed">{c}</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400 group-hover:text-ink-700">
                {(i + 1).toString().padStart(2, '0')}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {/* Live readout */}
      <div className="mt-10 grid max-w-3xl items-center gap-6 sm:grid-cols-[1fr_auto]">
        <div className="flex items-center gap-5">
          <div
            aria-hidden
            className="relative h-2 w-32 overflow-hidden bg-rule"
          >
            <div
              className={cn(
                'h-full transition-[width] duration-300 ease-out',
                count >= 3 ? 'bg-data-down' : count >= 2 ? 'bg-accent-500' : 'bg-data-up',
              )}
              style={{ width: `${(count / total) * 100}%` }}
            />
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            <span className="font-semibold text-ink-900 tabular-nums">{count}</span>
            <span className="mx-1.5 text-ink-400">/</span>
            <span className="tabular-nums">{total}</span>
            <span className="ml-2">checked</span>
          </p>
          <span
            className={cn(
              'inline-flex items-center rounded-[3px] px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] ring-1 ring-inset',
              tierStyle.pill,
            )}
          >
            {tierStyle.label}
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/unlock-growth-audit/"
            data-cta="audit__signals"
            data-cta-location="mid_body"
            className={cn(
              'inline-flex items-center justify-center gap-1.5 rounded-[4px] px-5 py-3 text-sm font-semibold transition-colors duration-200',
              count >= 2
                ? 'bg-ink-900 text-white hover:bg-brand-600'
                : 'border border-rule-strong bg-surface text-ink-900 hover:border-ink-900',
            )}
          >
            Industrial readiness audit
            <span aria-hidden>→</span>
          </Link>
          <Link
            href="/revenue-engine/"
            data-cta="revenue_leak_audit__signals"
            data-cta-location="mid_body"
            className={cn(
              'inline-flex items-center justify-center gap-1.5 rounded-[4px] px-5 py-3 text-sm font-semibold transition-colors duration-200',
              count >= 2
                ? 'bg-ink-900 text-white hover:bg-accent-600'
                : 'border border-rule-strong bg-surface text-ink-900 hover:border-ink-900',
            )}
          >
            Revenue Leak Audit
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </SectionRail>
  )
}
