import { SectionRail } from '@/components/layout/SectionRail'

/**
 * Revenue Engine pillar § 3 — Engine vs fuel.
 *
 * The positioning that must survive every rewrite (spec §1.2): ads are
 * fuel the client owns; we build and run the engine; the engine produces
 * revenue even with the fuel off. Kept under ~120 words of body.
 */

export function EngineVsFuel({ id }: { id?: string }) {
  return (
    <SectionRail tone="dark" id={id} glow="strong">
      <div className="grid gap-12 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
            Engine vs. fuel
          </p>
          <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
            Ads are fuel.{' '}
            <span className="text-ink-300">You own the fuel.</span>
          </h2>
        </div>

        <div className="space-y-5 text-lg leading-relaxed text-ink-200 md:col-span-7">
          <p>
            I build and run the engine: the system that turns demand into
            booked revenue. It answers the calls, replies in seconds, books
            the appointment, and chases the estimate that went cold.
          </p>
          <p>
            The engine keeps producing revenue even when the fuel is turned
            off. That is the difference between buying leads and owning a
            system that converts them.
          </p>
          <p className="border-t border-white/10 pt-5 text-base text-ink-200">
            Your ad account. Your data. Zero markup. Keep your ads vendor if
            you have one.
          </p>
        </div>
      </div>
    </SectionRail>
  )
}
