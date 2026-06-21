import { SectionRail } from '@/components/layout/SectionRail'

import { ONE_PIECE, PILLARS } from './data'

/**
 * Concept 2 — Whole flow vs. one piece.
 * The differentiation, widened from "ads are fuel" to "everyone sells you one
 * disconnected piece; I run all three as one flow." Left = what they've been
 * sold; right = the connected spine.
 */
export function Concept2OnePiece() {
  return (
    <SectionRail tone="surface">
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          Why this works
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          Everyone sells you one piece.{' '}
          <span className="text-ink-500">I run the whole flow.</span>
        </h2>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2 md:gap-10">
        {/* What they've been sold */}
        <div className="rounded-[4px] border border-rule bg-paper p-7">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-400">
            What you’ve been sold
          </p>
          <ul className="mt-5 space-y-3">
            {ONE_PIECE.map((piece) => (
              <li
                key={piece}
                className="flex items-center gap-3 border-b border-rule pb-3 text-ink-500 last:border-0 last:pb-0"
              >
                <span aria-hidden className="font-mono text-xs text-ink-300">
                  ✕
                </span>
                <span className="text-base">{piece}</span>
                <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.14em] text-ink-300">
                  one piece
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm leading-relaxed text-ink-500">
            Each one is sold on its own, by someone who never sees the other two.
          </p>
        </div>

        {/* The connected spine */}
        <div className="rounded-[4px] border border-ink-900/10 bg-surface p-7 shadow-[0_24px_60px_-40px_rgba(15,20,30,0.25)]">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-600">
            What actually moves revenue
          </p>
          <ol className="mt-5">
            {PILLARS.map((p, i) => (
              <li key={p.n} className="relative pb-6 pl-6 last:pb-0">
                <span
                  aria-hidden
                  className="absolute left-0 top-1 h-3 w-3 rounded-full bg-accent-500 ring-4 ring-surface"
                />
                {i < PILLARS.length - 1 && (
                  <span aria-hidden className="absolute left-[5px] top-1 h-full w-px bg-rule-strong" />
                )}
                <p className="font-display text-xl font-semibold text-ink-900">{p.verb}</p>
                <p className="mt-0.5 text-base text-ink-600">{p.outcome}</p>
              </li>
            ))}
          </ol>
          <p className="mt-2 border-t border-rule pt-4 text-sm font-semibold leading-relaxed text-ink-900">
            One flow, run and optimized end to end. That is the whole job.
          </p>
        </div>
      </div>
    </SectionRail>
  )
}
