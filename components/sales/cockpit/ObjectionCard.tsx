'use client'

import type { Objection } from '@/lib/sales/playbook'

import { Lines } from './Lines'

const CATEGORY_LABEL: Record<string, string> = {
  gatekeeper: 'Gatekeeper',
  'brush-off': 'Brush-off',
  price: 'Price',
  trust: 'Trust',
  timing: 'Timing',
  competitor: 'Competitor',
  fit: 'Fit',
  hygiene: 'Hygiene',
}

/** The full battle-card for one objection: trigger phrases, response(s) by motion, the hold re-ask, what to send next, and why it lands. */
export function ObjectionCard({ objection: o }: { objection: Objection }) {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-ink-400">{o.id}</span>
          <span className="rounded bg-surface-alt px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-ink-500">
            {CATEGORY_LABEL[o.category] ?? o.category}
          </span>
        </div>
        <h3 className="mt-1 text-base font-semibold text-ink-900">{o.label}</h3>
        {o.triggers.length ? (
          <p className="mt-1 text-[12px] text-ink-400">
            They say: {o.triggers.slice(0, 3).map((t) => `"${t}"`).join(' · ')}
          </p>
        ) : null}
      </div>

      <div className="space-y-3">
        {o.responses.map((r, i) => (
          <div key={i}>
            {r.label ? (
              <p className="mb-1 font-mono text-[11px] uppercase tracking-wide text-accent-700">{r.label}</p>
            ) : null}
            <Lines lines={r.lines} />
          </div>
        ))}
      </div>

      {o.hold && o.hold.length ? (
        <div className="rounded-md border border-rule bg-surface-alt p-3">
          <p className="mb-1 text-xs font-semibold text-ink-700">If they hold the line</p>
          <Lines lines={o.hold} />
        </div>
      ) : null}

      {o.sendAfter ? (
        <p className="text-[13px] text-ink-700">
          <span className="font-semibold">Next:</span> {o.sendAfter}
        </p>
      ) : null}

      {o.why ? <p className="text-[13px] italic text-ink-400">{o.why}</p> : null}
    </div>
  )
}
