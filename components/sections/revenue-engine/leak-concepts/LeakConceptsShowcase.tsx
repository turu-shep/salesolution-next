'use client'

import { useState } from 'react'

import { cn } from '@/lib/cn'

import { Concept2Evidence } from './Concept2Evidence'
import { Concept3Calculator } from './Concept3Calculator'
import { Concept4BeforeAfter } from './Concept4BeforeAfter'
import { LEAK_DATA, VERTICALS, type Vertical } from './data'

/**
 * The three saved concepts, kept because each fits a different slot/info type:
 *  - Evidence Card -> the villain (the three leaks as receipts)
 *  - Calculator    -> Proof (your own numbers)
 *  - Before/After  -> "the difference" beat after the plan
 * (Concept 1, the timeline, was dropped.) The vertical toggle stays so the copy
 * can be checked across home-services / medical / retail.
 */

function Divider({ tag, title, note }: { tag: string; title: string; note: string }) {
  return (
    <div className="border-y border-rule bg-paper">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent-600">{tag}</p>
        <h3 className="mt-1.5 font-display text-2xl font-semibold tracking-[-0.015em] text-ink-900">
          {title}
        </h3>
        <p className="mt-1 text-base text-ink-600">{note}</p>
      </div>
    </div>
  )
}

export function LeakConceptsShowcase() {
  const [vertical, setVertical] = useState<Vertical>('home-services')
  const data = LEAK_DATA[vertical]

  return (
    <>
      <div className="sticky top-0 z-30 border-b border-rule bg-paper/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-500">
            Saved · 3 concepts, each for a different slot
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {VERTICALS.map((v) => (
              <button
                key={v.key}
                type="button"
                onClick={() => setVertical(v.key)}
                aria-pressed={v.key === vertical}
                className={cn(
                  'cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold transition-colors duration-200',
                  v.key === vertical
                    ? 'border-ink-900 bg-ink-900 text-white'
                    : 'border-rule-strong bg-surface text-ink-700 hover:border-ink-900 hover:text-ink-900',
                )}
              >
                {v.tab}
              </button>
            ))}
            <span className="ml-1 text-sm text-ink-400">
              see the full page assembled at /revenue-engine/full-preview/
            </span>
          </div>
        </div>
      </div>

      <Divider
        tag="Villain"
        title="The Evidence Card"
        note="The three leaks as receipts — Bring / Sell / Retain. This is the leak block."
      />
      <Concept2Evidence data={data} />

      <Divider
        tag="Proof"
        title="Your-Numbers Calculator"
        note="Their own arithmetic. Lives in the Proof section."
      />
      <Concept3Calculator
        key={vertical}
        data={data}
        header={{
          eyebrow: 'Proof · your numbers',
          headlineA: 'Run your own numbers.',
          headlineB: 'Watch the leak add up.',
          intro: 'These are your inputs, not mine. Change them — the math is in the open.',
          closer: '',
        }}
      />

      <Divider
        tag="The difference"
        title="Same Lead, Two Endings"
        note="Before/after on one lead — the transformation beat after the plan."
      />
      <Concept4BeforeAfter
        data={data}
        header={{
          eyebrow: 'The difference',
          headlineA: 'Same lead.',
          headlineB: 'Two endings.',
          intro: 'One lead. The only thing that changes is whether it gets answered.',
          closer: '',
        }}
      />
    </>
  )
}
