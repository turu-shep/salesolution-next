'use client'

import { useState } from 'react'

import type { StageId, Track } from '@/lib/sales/playbook'

import { SegmentView } from './SegmentView'

/**
 * The branching call-flow walker for one track: a stage stepper, the current
 * stage's segments, and prev/next. Branch + discovery-read expansion is held here
 * (keyed by segment id) so it survives stage navigation; the parent remounts this
 * (via `key`) when the track changes.
 */
export function StageFlow({
  track,
  stageIndex,
  onStageChange,
}: {
  track: Track
  stageIndex: number
  onStageChange: (index: number) => void
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const stage = track.stages[stageIndex]

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const stageTitleFor = (id: StageId) => track.stages.find((s) => s.id === id)?.title ?? id
  const gotoStage = (id: StageId) => {
    const i = track.stages.findIndex((s) => s.id === id)
    if (i >= 0) onStageChange(i)
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {track.stages.map((s, i) => (
          <button
            key={s.id}
            onClick={() => onStageChange(i)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              i === stageIndex
                ? 'bg-accent-600 text-ink-inverse'
                : 'bg-surface-alt text-ink-700 hover:bg-rule'
            }`}
          >
            {i + 1}. {s.title}
          </button>
        ))}
      </div>

      <div className="mt-5">
        <h2 className="text-base font-semibold text-ink-900">{stage.title}</h2>
        {stage.goal ? <p className="mt-0.5 text-sm text-ink-500">{stage.goal}</p> : null}

        <div className="mt-4 space-y-3">
          {stage.segments.map((seg) => (
            <SegmentView
              key={seg.id}
              segment={seg}
              isOpen={expanded.has(seg.id)}
              onToggle={() => toggle(seg.id)}
              onGoto={gotoStage}
              stageTitleFor={stageTitleFor}
            />
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          disabled={stageIndex === 0}
          onClick={() => onStageChange(stageIndex - 1)}
          className="rounded-md border border-rule px-3 py-1.5 text-sm text-ink-700 transition-colors hover:border-rule-strong disabled:opacity-40 disabled:hover:border-rule"
        >
          ← Prev
        </button>
        <span className="font-mono text-[11px] uppercase tracking-wide text-ink-400">
          {stageIndex + 1} / {track.stages.length}
        </span>
        <button
          disabled={stageIndex === track.stages.length - 1}
          onClick={() => onStageChange(stageIndex + 1)}
          className="rounded-md border border-rule px-3 py-1.5 text-sm text-ink-700 transition-colors hover:border-rule-strong disabled:opacity-40 disabled:hover:border-rule"
        >
          Next →
        </button>
      </div>
    </div>
  )
}
