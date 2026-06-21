'use client'

import { useState } from 'react'

import type { PathStep } from '@/lib/sales/learn'

function Block({ label, items, accent }: { label: string; items: string[]; accent?: boolean }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-wide text-ink-400">{label}</p>
      <ul className={`mt-1 list-disc space-y-0.5 pl-4 ${accent ? 'text-ink-800' : 'text-ink-700'}`}>
        {items.map((x, i) => (
          <li key={i}>{x}</li>
        ))}
      </ul>
    </div>
  )
}

function Note({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-md border-l-2 border-accent-600/40 bg-surface-alt px-3 py-2">
      <p className="font-mono text-[10px] uppercase tracking-wide text-accent-700">{label}</p>
      <p className="mt-0.5 text-ink-700">{text}</p>
    </div>
  )
}

/** One path stage: a done checkbox, the outcome, and expandable actions / notes / ready-when. */
export function PathStepCard({
  step,
  done,
  onToggle,
}: {
  step: PathStep
  done: boolean
  onToggle: () => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className={`rounded-lg border border-rule ${done ? 'bg-surface-alt' : 'bg-surface'}`}>
      <div className="flex items-start gap-3 p-3">
        <input
          type="checkbox"
          checked={done}
          onChange={onToggle}
          className="mt-1 h-4 w-4 shrink-0 accent-accent-600"
          aria-label={`Mark "${step.title}" done`}
        />
        <button onClick={() => setOpen(!open)} className="min-w-0 flex-1 text-left">
          <span className="font-mono text-[11px] text-ink-400">Stage {step.stage}</span>
          <span className={`block text-sm font-semibold ${done ? 'text-ink-500 line-through' : 'text-ink-900'}`}>
            {step.title}
          </span>
          <span className="mt-0.5 block text-[13px] text-ink-500">{step.outcome}</span>
        </button>
        <button onClick={() => setOpen(!open)} className="shrink-0 text-ink-300" aria-label="Toggle details">
          {open ? '▾' : '▸'}
        </button>
      </div>

      {open ? (
        <div className="space-y-3 border-t border-rule px-3 py-3 sm:pl-10 text-[13px]">
          <Block label="Do this" items={step.doThis} />
          {step.voiceNote ? <Note label="Voice" text={step.voiceNote} /> : null}
          {step.nonNativeNote ? <Note label="English" text={step.nonNativeNote} /> : null}
          {step.drills ? <Block label="Drills" items={step.drills} /> : null}
          <Block label="Ready for the next stage when" items={step.readyWhen} accent />
        </div>
      ) : null}
    </div>
  )
}
