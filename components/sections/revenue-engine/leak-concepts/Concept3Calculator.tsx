'use client'

import { useState } from 'react'

import type { HeaderOverride, LeakData } from './data'
import { LeakShell } from './LeakShell'

/**
 * Concept 3 — Your-numbers leak calculator.
 * The owner types 2-3 of their own numbers and watches the annual leak land.
 * The scary number is their own arithmetic from visible inputs (formula shown),
 * so it can't be fake data. Ungated on purpose.
 */
function fmtUSD(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

export function Concept3Calculator({ data, conceptLabel, header }: { data: LeakData; conceptLabel?: string; header?: HeaderOverride }) {
  const { calc } = data
  const [values, setValues] = useState<number[]>(calc.inputs.map((i) => i.value))

  const annual = Math.floor(
    calc.inputs.reduce((acc, input, i) => {
      const v = input.format === 'percent' ? values[i] / 100 : values[i]
      return acc * v
    }, 1) * calc.multiplier,
  )
  const monthly = Math.floor(annual / 12)

  return (
    <LeakShell
      conceptLabel={conceptLabel}
      eyebrow={header?.eyebrow ?? data.eyebrow}
      headlineA={header?.headlineA ?? data.headlineA}
      headlineB={header?.headlineB ?? data.headlineB}
      intro={header?.intro ?? data.intro}
      closer={header?.closer ?? data.closer}
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
        What the leak costs you
      </p>

      <div className="mt-6 grid gap-px overflow-hidden rounded-xl border border-rule-strong bg-rule-strong md:grid-cols-[1.1fr_0.9fr]">
        {/* Inputs */}
        <div className="space-y-5 bg-surface p-6 sm:p-8">
          {calc.inputs.map((input, i) => (
            <div key={input.key}>
              <label
                htmlFor={`calc-${input.key}`}
                className="block text-sm font-medium text-ink-800"
              >
                {input.label}
              </label>
              <div className="mt-2 flex items-stretch border border-rule-strong focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
                {input.format === 'dollar' && (
                  <span className="flex items-center border-r border-rule px-3 font-mono text-sm text-ink-400">$</span>
                )}
                <input
                  id={`calc-${input.key}`}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={Number.isNaN(values[i]) ? '' : values[i]}
                  onChange={(e) => {
                    const next = [...values]
                    next[i] = e.target.valueAsNumber
                    setValues(next)
                  }}
                  className="min-w-0 flex-1 bg-transparent px-3 py-2.5 font-mono text-sm tabular-nums text-ink-900 focus:outline-none"
                />
                {input.format === 'percent' && (
                  <span className="flex items-center border-l border-rule px-3 font-mono text-sm text-ink-400">%</span>
                )}
              </div>
              {input.assumption && (
                <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-400">
                  {input.assumption}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Result */}
        <div className="flex flex-col justify-center bg-ink-900 p-6 text-white sm:p-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/50">
            {fmtUSD(monthly)} a month
          </p>
          <p className="mt-2 font-display text-5xl font-semibold tabular-nums leading-none">
            {fmtUSD(annual)}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-white/70">{calc.resultLabel}</p>
        </div>
      </div>

      <div className="mt-4 max-w-2xl space-y-1.5">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-400">
          {calc.formula} · these are your numbers, I round down
        </p>
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-500">
          {calc.sourceCaption}
        </p>
      </div>
    </LeakShell>
  )
}
