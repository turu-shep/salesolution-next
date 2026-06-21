'use client'

import type { Segment, StageId } from '@/lib/sales/playbook'

import { Lines } from './Lines'

function Read({ label, text, tone }: { label: string; text: string; tone: 'good' | 'warn' | 'bad' }) {
  const color = tone === 'bad' ? 'text-danger-500' : tone === 'warn' ? 'text-ink-500' : 'text-ink-700'
  return (
    <div className="flex gap-2">
      <span className={`mt-px shrink-0 font-mono text-[10px] uppercase tracking-wide ${color}`}>{label}</span>
      <span className="text-ink-700">{text}</span>
    </div>
  )
}

function GotoButton({ to, label, onGoto }: { to: StageId; label: string; onGoto: (s: StageId) => void }) {
  return (
    <button
      onClick={() => onGoto(to)}
      className="mt-3 rounded-md bg-ink-900 px-2.5 py-1 text-xs font-medium text-ink-inverse transition-colors hover:bg-ink-800"
    >
      Go to {label} →
    </button>
  )
}

/**
 * Renders one Segment by role. Branches and discovery answer-reads are collapsible
 * (driven by `isOpen`/`onToggle` from the parent's expanded set); primary, variant,
 * and callout segments are always expanded.
 */
export function SegmentView({
  segment,
  isOpen,
  onToggle,
  onGoto,
  stageTitleFor,
}: {
  segment: Segment
  isOpen: boolean
  onToggle: () => void
  onGoto: (stage: StageId) => void
  stageTitleFor: (stage: StageId) => string
}) {
  if (segment.role === 'branch') {
    return (
      <div className="rounded-md border border-rule">
        <button onClick={onToggle} className="flex w-full items-start gap-2 px-3 py-2 text-left">
          <span className="mt-0.5 text-ink-300">{isOpen ? '▾' : '▸'}</span>
          <span className="text-sm font-medium text-ink-700">
            {segment.label ?? 'Branch'}
            {segment.when ? <span className="font-normal text-ink-400"> — {segment.when}</span> : null}
          </span>
        </button>
        {isOpen ? (
          <div className="px-3 pb-3 pl-8">
            <Lines lines={segment.lines} />
            {segment.goto ? (
              <GotoButton to={segment.goto} label={stageTitleFor(segment.goto)} onGoto={onGoto} />
            ) : null}
          </div>
        ) : null}
      </div>
    )
  }

  if (segment.role === 'question') {
    return (
      <div className="rounded-md border border-rule bg-surface p-3">
        {segment.label ? (
          <p className="mb-1 font-mono text-[11px] uppercase tracking-wide text-ink-400">{segment.label}</p>
        ) : null}
        <Lines lines={segment.lines} />
        {segment.reads ? (
          <div className="mt-2">
            <button onClick={onToggle} className="text-xs text-accent-600 hover:underline">
              {isOpen ? 'Hide answer reads' : 'Answer reads'}
            </button>
            {isOpen ? (
              <div className="mt-2 space-y-1 text-[13px]">
                {segment.reads.good ? <Read label="Good" tone="good" text={segment.reads.good} /> : null}
                {segment.reads.borderline ? (
                  <Read label="Borderline" tone="warn" text={segment.reads.borderline} />
                ) : null}
                {segment.reads.disqualifying ? (
                  <Read label="Disqualify" tone="bad" text={segment.reads.disqualifying} />
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    )
  }

  if (segment.role === 'callout') {
    return (
      <div className="rounded-md border border-rule-strong bg-surface-alt p-3">
        {segment.label ? <p className="mb-1 text-sm font-semibold text-ink-800">{segment.label}</p> : null}
        {segment.when ? <p className="mb-2 text-xs text-ink-400">{segment.when}</p> : null}
        <Lines lines={segment.lines} />
      </div>
    )
  }

  // primary + variant — always expanded
  return (
    <div className={segment.role === 'variant' ? 'rounded-md border border-rule p-3' : 'px-1'}>
      {segment.label ? <p className="mb-1 text-sm font-semibold text-ink-800">{segment.label}</p> : null}
      {segment.when ? <p className="mb-2 text-xs text-ink-400">{segment.when}</p> : null}
      <Lines lines={segment.lines} />
      {segment.goto ? <GotoButton to={segment.goto} label={stageTitleFor(segment.goto)} onGoto={onGoto} /> : null}
    </div>
  )
}
