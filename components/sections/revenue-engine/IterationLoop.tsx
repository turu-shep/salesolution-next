import { SectionRail } from '@/components/layout/SectionRail'

/**
 * The iteration-loop beat — the methodology depth the homepage triptych omits.
 * The engine isn't set-and-forget: every cycle we read the two revenue lines
 * and re-aim the weakest cylinder. Firm "we" voice, no guarantee, no price.
 */
export function IterationLoop({ id }: { id?: string }) {
  return (
    <SectionRail tone="surface" id={id} size="sm">
      <div className="grid items-start gap-8 md:grid-cols-[1fr_1.4fr] md:gap-14">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            How it keeps paying
          </p>
          <h2 className="mt-3 font-display text-balance text-3xl font-semibold leading-[1.06] tracking-[-0.015em] text-ink-900 sm:text-4xl">
            We don’t set it and leave.
          </h2>
        </div>
        <div className="border-l-2 border-accent-500 pl-6">
          <p className="text-lg leading-relaxed text-ink-700">
            Every cycle we read the two revenue lines, what came in and what came
            back, and re-aim the weakest cylinder.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-ink-700">
            The engine that fits you in month one isn’t the one you’ll run in
            month six.
          </p>
        </div>
      </div>
    </SectionRail>
  )
}
