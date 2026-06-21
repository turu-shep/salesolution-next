'use client'

import { useEffect, useState } from 'react'

import { TRACKS } from '@/lib/sales/playbook'

import { CallLogger } from './CallLogger'
import { ObjectionSearch } from './ObjectionSearch'
import { PrecallCard } from './PrecallCard'
import { StageFlow } from './StageFlow'
import { TrackToggle } from './TrackToggle'

const STORE_KEY = 'sales.cockpit.track'

/**
 * The cold-call cockpit. Holds the selected track (persisted to localStorage) and
 * the current stage; the pre-call card and the stage-flow walker are remounted on
 * track change (via `key`) so their local UI state resets for a fresh prospect.
 *
 * Pure client widget — it imports the static playbook data directly and renders it.
 */
export function Cockpit() {
  const [slug, setSlug] = useState<string>(TRACKS[0].slug)
  const [stageIndex, setStageIndex] = useState(0)

  // Restore the last-used track after hydration (avoids an SSR mismatch).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORE_KEY)
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time SSR-safe hydration: reading localStorage in a lazy initializer would mismatch the server render
      if (saved && TRACKS.some((t) => t.slug === saved)) setSlug(saved)
    } catch {
      // localStorage unavailable — fall back to the default track.
    }
  }, [])

  const track = TRACKS.find((t) => t.slug === slug) ?? TRACKS[0]

  function selectTrack(next: string) {
    setSlug(next)
    setStageIndex(0)
    try {
      localStorage.setItem(STORE_KEY, next)
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink-900">Cold-Call Cockpit</h1>
          <p className="mt-0.5 text-sm text-ink-500">Pick a track, work the flow, book the next step.</p>
        </div>
        <ObjectionSearch motion={track.motion} />
      </div>

      <TrackToggle tracks={TRACKS} activeSlug={track.slug} onSelect={selectTrack} />

      <div className="rounded-lg border border-rule bg-surface-alt px-4 py-3">
        <p className="text-sm text-ink-700">
          <span className="font-medium">{track.label}.</span> {track.persona}
        </p>
        <p className="mt-1 text-sm text-ink-900">
          <span className="font-semibold">Goal:</span> {track.goal}
          <span className="text-ink-400"> · {track.cta.label}</span>
        </p>
      </div>

      <PrecallCard key={`precall-${track.slug}`} track={track} />

      <StageFlow key={`flow-${track.slug}`} track={track} stageIndex={stageIndex} onStageChange={setStageIndex} />

      <CallLogger track={track} />
    </div>
  )
}
