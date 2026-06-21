import { SectionRail } from '@/components/layout/SectionRail'

import { PILLARS } from './data'

/**
 * Concept 1 — The three-stroke engine.
 * Keeps the engine metaphor but fixes it: the engine has three strokes (bring,
 * sell, retain) and ads feed only the first. Dark, for continuity with the beat
 * it replaces.
 */
export function Concept1Engine() {
  return (
    <SectionRail tone="dark" glow="strong">
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
          The whole engine
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
          Getting customers isn’t one thing.{' '}
          <span className="text-ink-300">It’s three.</span>
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-200">
          Bring them in, win them, keep them coming back. Most run one of the
          three. I run all three as one machine.
        </p>
      </div>

      <ol className="mt-12 flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-0">
        {PILLARS.map((p, i) => (
          <li key={p.n} className="flex flex-col gap-4 lg:contents">
            <div className="flex flex-1 flex-col rounded-[4px] border border-white/10 bg-white/[0.03] p-7">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-sm tabular-nums text-ink-400">{p.n}</span>
                <h3 className="font-display text-2xl font-semibold tracking-[-0.015em] text-white">
                  {p.verb}
                </h3>
              </div>
              <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-accent-500">
                {p.outcome}
              </p>
              <p className="mt-3 leading-relaxed text-ink-200">{p.body}</p>
            </div>
            {i < PILLARS.length - 1 && (
              <span
                aria-hidden
                className="flex shrink-0 items-center justify-center text-2xl text-ink-400 lg:px-5"
              >
                <span className="lg:hidden">↓</span>
                <span className="hidden lg:inline">→</span>
              </span>
            )}
          </li>
        ))}
      </ol>

      <p className="mt-10 max-w-2xl border-t border-white/10 pt-5 text-base leading-relaxed text-ink-200">
        Run apart, each one leaks into the next. Run as one flow, they compound.
      </p>
    </SectionRail>
  )
}
