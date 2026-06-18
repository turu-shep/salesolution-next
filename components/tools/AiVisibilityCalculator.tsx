'use client'

import { useState } from 'react'

import {
  computeAiVisibility,
  type AiVisibilityInputs,
} from '@/lib/tools/ai-visibility'

/**
 * Embeddable AI-visibility calculator (toolKey: "ai-visibility-calculator").
 *
 * Turns a run of a prompt panel — you ask the engines the same buyer questions
 * and count what comes back — into the three numbers people conflate: mention
 * rate, citation rate, and share of voice. Logic lives in lib/tools/ai-visibility
 * (pure, testable). Client island: computes in the browser, persists nothing,
 * no accounts. Every output is derived from the user's own inputs and labelled
 * illustrative — it is a tool, not a claim.
 *
 * Self-contained widget. The surrounding title/intro/source come from the
 * enrichment wrapper that renders it.
 */
function pct(n: number): string {
  return `${Math.round(n * 100)}%`
}

function NumberField({
  label,
  hint,
  value,
  onChange,
  min = 0,
}: {
  label: string
  hint?: string
  value: number
  onChange: (n: number) => void
  min?: number
}) {
  return (
    <label className="block">
      <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-500">
        {label}
      </span>
      {hint && <span className="mt-0.5 block text-xs text-ink-500">{hint}</span>}
      <input
        type="number"
        inputMode="numeric"
        min={min}
        value={Number.isFinite(value) ? value : ''}
        onChange={(e) => onChange(Math.max(min, Math.floor(Number(e.target.value) || 0)))}
        aria-label={label}
        className="mt-2 w-full border border-rule bg-paper px-3 py-2 font-mono text-base tabular-nums text-ink-900 focus:border-ink-900 focus:outline-none"
      />
    </label>
  )
}

function Stat({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex flex-col gap-1 py-4 sm:px-5 sm:first:pl-0">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
        {label}
      </span>
      <span
        className={
          'font-display text-3xl font-semibold tabular-nums ' +
          (muted ? 'text-ink-400' : 'text-ink-900')
        }
      >
        {value}
      </span>
    </div>
  )
}

export function AiVisibilityCalculator() {
  const [inputs, setInputs] = useState<AiVisibilityInputs>({
    prompts: 20,
    mentions: 6,
    citations: 3,
    competitorMentions: 11,
  })
  const set = (patch: Partial<AiVisibilityInputs>) =>
    setInputs((prev) => ({ ...prev, ...patch }))
  const r = computeAiVisibility(inputs)

  return (
    <div className="not-prose border border-rule bg-surface p-5 md:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField
          label="Prompts tested"
          hint="Buyer questions you asked the engines"
          value={inputs.prompts}
          onChange={(n) => set({ prompts: n })}
          min={1}
        />
        <NumberField
          label="Answers that named you"
          value={inputs.mentions}
          onChange={(n) => set({ mentions: n })}
        />
        <NumberField
          label="Answers that cited you"
          hint="Linked you as a source"
          value={inputs.citations}
          onChange={(n) => set({ citations: n })}
        />
        <NumberField
          label="A competitor's mentions"
          hint="Optional — for share of voice"
          value={inputs.competitorMentions ?? 0}
          onChange={(n) => set({ competitorMentions: n })}
        />
      </div>

      <dl className="mt-5 grid grid-cols-1 border-t border-rule sm:grid-cols-3 sm:divide-x sm:divide-rule">
        <Stat label="Mention rate" value={pct(r.mentionRate)} />
        <Stat label="Citation rate" value={pct(r.citationRate)} />
        <Stat
          label="Share of voice"
          value={r.shareOfVoice == null ? '—' : pct(r.shareOfVoice)}
          muted={r.shareOfVoice == null}
        />
      </dl>

      <p className="mt-4 text-xs leading-relaxed text-ink-500">
        Illustrative — every number is computed from your inputs. Mention rate and
        citation rate are out of prompts tested; share of voice is your mentions
        against the one competitor you entered.
      </p>
    </div>
  )
}
