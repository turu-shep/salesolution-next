'use client'

import type { Track } from '@/lib/sales/playbook'

function shortName(t: Track): string {
  if (t.subScript === 'roofing') return 'Roofing'
  if (t.subScript === 'dental') return 'Dental'
  return 'Industrial'
}

function motionLabel(t: Track): string {
  return t.motion === 'revenue-engine' ? 'Revenue Engine' : 'Services'
}

/** The motion/track selector. One pill per track; the active one is accented. */
export function TrackToggle({
  tracks,
  activeSlug,
  onSelect,
}: {
  tracks: Track[]
  activeSlug: string
  onSelect: (slug: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {tracks.map((t) => {
        const active = t.slug === activeSlug
        return (
          <button
            key={t.slug}
            onClick={() => onSelect(t.slug)}
            aria-pressed={active}
            className={`rounded-lg border px-3.5 py-2 text-left transition-colors ${
              active
                ? 'border-accent-600 bg-accent-50'
                : 'border-rule bg-surface hover:border-rule-strong'
            }`}
          >
            <span className={`block text-sm font-semibold ${active ? 'text-accent-700' : 'text-ink-800'}`}>
              {shortName(t)}
            </span>
            <span className="block font-mono text-[10px] uppercase tracking-wide text-ink-400">
              {motionLabel(t)}
            </span>
          </button>
        )
      })}
    </div>
  )
}
