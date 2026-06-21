/**
 * The cockpit content registry — the single import surface for the playbook data.
 * Aggregates the tracks + objection library and exposes the lookup/search helpers
 * the cockpit renderer (Phase 3+) reads.
 */
import type { Motion, Objection, Track } from './types'
import { OBJECTIONS } from './objections'
import { industrialTrack } from './tracks/industrial'
import { revenueEngineDentalTrack } from './tracks/revenue-engine-dental'
import { revenueEngineRoofingTrack } from './tracks/revenue-engine-roofing'

export * from './types'
export * from './metrics'
export { OBJECTIONS } from './objections'

/** All call tracks, in cockpit toggle order. */
export const TRACKS: Track[] = [
  revenueEngineRoofingTrack,
  revenueEngineDentalTrack,
  industrialTrack,
]

/** Look up a track by its slug. */
export function getTrack(slug: string): Track | undefined {
  return TRACKS.find((t) => t.slug === slug)
}

/** Tracks for a given motion. */
export function tracksForMotion(motion: Motion): Track[] {
  return TRACKS.filter((t) => t.motion === motion)
}

/**
 * Search the objection library by label + triggers (case-insensitive substring),
 * ranked label-hit over trigger-hit. Empty query returns the (optionally
 * motion-filtered) full list. This backs the cockpit's mid-call quick-search.
 */
export function searchObjections(query: string, motion?: Motion): Objection[] {
  const pool = motion ? OBJECTIONS.filter((o) => o.motions.includes(motion)) : OBJECTIONS
  const q = query.trim().toLowerCase()
  if (!q) return pool
  return pool
    .map((o) => {
      const labelHit = o.label.toLowerCase().includes(q)
      const triggerHit = o.triggers.some((t) => t.toLowerCase().includes(q))
      return { o, score: (labelHit ? 2 : 0) + (triggerHit ? 1 : 0) }
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.o)
}
