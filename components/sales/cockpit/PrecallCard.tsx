'use client'

import { useState } from 'react'

import type { Track } from '@/lib/sales/playbook'

/**
 * The pre-call leak-proof / research checklist for a track — the ritual before each
 * dial. Checkboxes are visual progress only (no persistence); the card collapses so
 * it's out of the way once you're on the call. Remounted by the parent on track change.
 */
export function PrecallCard({ track }: { track: Track }) {
  const [open, setOpen] = useState(true)
  const [checked, setChecked] = useState<Set<number>>(new Set())

  const toggleCheck = (i: number) =>
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })

  return (
    <section className="rounded-lg border border-rule bg-surface">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-semibold text-ink-800">{track.precall.title}</span>
        <span className="text-ink-300">{open ? '▾' : '▸'}</span>
      </button>
      {open ? (
        <div className="px-4 pb-4">
          {track.precall.note ? <p className="mb-3 text-sm text-ink-500">{track.precall.note}</p> : null}
          <ul className="space-y-3">
            {track.precall.items.map((item, i) => (
              <li key={i} className="flex gap-3">
                <input
                  type="checkbox"
                  checked={checked.has(i)}
                  onChange={() => toggleCheck(i)}
                  className="mt-1 h-4 w-4 shrink-0 accent-accent-600"
                  aria-label={item.action}
                />
                <div className={checked.has(i) ? 'opacity-50' : ''}>
                  <p className="text-sm font-medium text-ink-800">{item.action}</p>
                  {item.detail ? <p className="mt-0.5 text-[13px] text-ink-500">{item.detail}</p> : null}
                  {item.openerFuel ? (
                    <p className="mt-1 text-[13px] text-accent-700">
                      <span className="font-medium">Opener:</span> {item.openerFuel}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}
