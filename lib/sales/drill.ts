import type { Line, Motion } from './playbook'
import { OBJECTIONS, TRACKS } from './playbook'

/**
 * Flashcard decks for cover-and-say practice (used by /sales/drill). Front = the cue
 * (what the prospect says / the situation), back = the lines to say from memory.
 * Built from the same playbook data the cockpit uses.
 */

export interface DrillCard {
  id: string
  front: string
  context?: string
  back: Line[]
}

export const DECKS = [
  { id: 'objections', label: 'Objections' },
  { id: 'openers', label: 'Openers' },
] as const

export type DeckId = (typeof DECKS)[number]['id']

export function buildDeck(deck: DeckId, motion?: Motion): DrillCard[] {
  if (deck === 'objections') {
    return OBJECTIONS.filter((o) => !motion || o.motions.includes(motion)).map((o) => ({
      id: `obj-${o.id}`,
      front: o.triggers[0] ?? o.label,
      context: `${o.id} · ${o.category}`,
      back: o.responses.flatMap((r) => (r.label ? [{ note: r.label } as Line, ...r.lines] : r.lines)),
    }))
  }

  const cards: DrillCard[] = []
  for (const t of TRACKS) {
    if (motion && t.motion !== motion) continue
    const open = t.stages.find((s) => s.id === 'open')
    if (!open) continue
    for (const seg of open.segments) {
      if (seg.role !== 'variant') continue
      cards.push({
        id: `open-${t.slug}-${seg.id}`,
        front: seg.label ?? t.label,
        context: t.label,
        back: seg.lines,
      })
    }
  }
  return cards
}
