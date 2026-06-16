'use client'

import Link from 'next/link'
import { useState } from 'react'

import { SectionRail } from '@/components/layout/SectionRail'

/**
 * Revenue Engine § interactive funnel calculator.
 *
 * Estimates the revenue currently leaking at the conversion stage on the
 * visitor's OWN numbers — demand in, current booking rate, average value —
 * and what a conservative recovery assumption returns. This is a tool, not
 * a claim: every output is derived from the visitor's inputs plus a single,
 * visible recovery assumption, and labelled illustrative. Ties to the two
 * revenue lines (recovered = system-driven) and the $2,997 system floor.
 */

const SYSTEM_FLOOR = 2997 // home-services Florida system-only /mo (spec §1.5)

function usd(n: number): string {
  return '$' + Math.round(n).toLocaleString('en-US')
}

type SliderProps = {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (n: number) => void
  display: string
}

function Slider({ label, value, min, max, step, onChange, display }: SliderProps) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-500">
          {label}
        </span>
        <span className="font-display text-lg font-semibold tabular-nums text-ink-900">
          {display}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="mt-3 w-full accent-brand-600"
      />
    </label>
  )
}

export function FunnelCalculator({ id }: { id?: string }) {
  const [leads, setLeads] = useState(60)
  const [value, setValue] = useState(3000)
  const [bookRate, setBookRate] = useState(35)
  const [recovery, setRecovery] = useState(15)

  const r = bookRate / 100
  const rec = recovery / 100
  const currentRev = leads * r * value
  const recoveredRev = leads * (1 - r) * rec * value
  const newRev = currentRev + recoveredRev

  return (
    <SectionRail tone="surface" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          The math on your numbers
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          What the leak{' '}
          <span className="text-ink-500">is costing you.</span>
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          Move the sliders to your own numbers. The recovered figure is the
          system-driven line on your monthly report &mdash; revenue the engine
          produces from demand you already have.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2 md:gap-10">
        {/* Inputs */}
        <div className="flex flex-col gap-7 rounded-[4px] border border-rule-strong bg-paper p-7">
          <Slider
            label="Monthly leads (calls + forms)"
            value={leads}
            min={20}
            max={500}
            step={10}
            onChange={setLeads}
            display={leads.toLocaleString('en-US')}
          />
          <Slider
            label="Average job value"
            value={value}
            min={500}
            max={20000}
            step={500}
            onChange={setValue}
            display={usd(value)}
          />
          <Slider
            label="Current booking rate"
            value={bookRate}
            min={10}
            max={80}
            step={5}
            onChange={setBookRate}
            display={`${bookRate}%`}
          />
          <Slider
            label="Engine recovers (of lost leads)"
            value={recovery}
            min={10}
            max={30}
            step={5}
            onChange={setRecovery}
            display={`${recovery}%`}
          />
          <p className="text-sm leading-relaxed text-ink-500">
            Recovery is a conservative assumption you control &mdash; the share
            of leads you lose today to missed calls and slow follow-up that the
            engine converts instead.
          </p>
        </div>

        {/* Outputs */}
        <div className="flex flex-col overflow-hidden rounded-[4px] border border-rule-strong bg-paper">
          <div className="border-b-2 border-brand-600 bg-surface px-7 py-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-brand-600">
              Recovered revenue / month
            </p>
            <p className="mt-2 font-display text-6xl font-semibold leading-none tracking-[-0.02em] tabular-nums text-ink-900">
              {usd(recoveredRev)}
            </p>
            <p className="mt-3 text-sm text-ink-700">
              That is your system-driven line. By day 90 it should clear the{' '}
              {usd(SYSTEM_FLOOR)}/mo system fee &mdash; or I work free until it
              does.
            </p>
          </div>

          <dl className="grid grid-cols-2 divide-x divide-rule">
            <div className="px-7 py-5">
              <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-500">
                Booked today
              </dt>
              <dd className="mt-1.5 font-display text-2xl font-semibold tabular-nums text-ink-900">
                {usd(currentRev)}
              </dd>
            </div>
            <div className="px-7 py-5">
              <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-500">
                With the engine
              </dt>
              <dd className="mt-1.5 font-display text-2xl font-semibold tabular-nums text-ink-900">
                {usd(newRev)}
              </dd>
            </div>
          </dl>

          <div className="mt-auto border-t border-rule px-7 py-5">
            <Link
              href="#audit"
              data-cta="revenue_leak_audit__calculator"
              data-cta-location="mid_body"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-[4px] bg-ink-900 px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-600"
            >
              Get the real numbers in an audit
              <span aria-hidden>&rarr;</span>
            </Link>
          </div>
        </div>
      </div>

      <p className="mt-5 max-w-3xl text-sm text-ink-500">
        Illustrative, from your inputs and the recovery assumption above &mdash;
        not a guarantee. Your actual figures come from the attribution
        dashboard once the engine is live.
      </p>
    </SectionRail>
  )
}
