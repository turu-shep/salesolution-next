import { FlowBlock } from './FlowBlock'

/**
 * Review harness for the reframed engine-vs-fuel beat (screen 3 — the mechanism
 * that introduces Bring -> Sell -> Retain). Converged from four flat drafts to
 * one art-directed block; iterated via the visual loop. The earlier Concept1-4
 * files remain on disk, unreferenced, until this is signed off.
 */
export function FlowConceptsShowcase() {
  return (
    <>
      <div className="border-b border-rule bg-paper">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-500">
            Bring · Sell · Retain — the mechanism block (screen 3)
          </p>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-ink-600">
            Sits right after the leak. Shifts belief from “I’ve been sold pieces” to “one
            operator runs my whole flow.” Each pillar then gets its own deeper block below.
          </p>
        </div>
      </div>

      <FlowBlock />
    </>
  )
}
