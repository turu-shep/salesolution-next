'use client'

import type { Line } from '@/lib/sales/playbook'

/**
 * Renders an ordered list of script lines: spoken lines get an accent rule and dark
 * text (read these out loud); stage directions are muted italic. Shared by the stage
 * flow and the objection cards so a spoken line looks the same everywhere.
 */
export function Lines({ lines }: { lines: Line[] }) {
  return (
    <div className="space-y-2">
      {lines.map((l, i) =>
        'say' in l ? (
          <p
            key={i}
            className="border-l-2 border-accent-600/40 pl-3 text-[15px] leading-relaxed text-ink-900"
          >
            {l.say}
          </p>
        ) : (
          <p key={i} className="pl-3 text-[13px] italic leading-relaxed text-ink-400">
            {l.note}
          </p>
        ),
      )}
    </div>
  )
}
