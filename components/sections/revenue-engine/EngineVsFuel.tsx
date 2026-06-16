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
            Ads are just fuel.{' '}
            <span className="text-ink-300">The engine is what you were missing.</span>
          </h2>
        </div>

        <div className="space-y-5 text-lg leading-relaxed text-ink-200 md:col-span-7">
          <p>
            I&rsquo;m the person who fixes that. The agencies that burned you
            sold you more fuel &mdash; more ads, more leads. Ads are fuel; you
            should own it yourself, at cost.
          </p>
          <p>
            What you were missing is the engine: the system that turns the
            demand you already have into booked jobs. It answers the calls,
            replies in seconds, books the work, and chases the quotes that went
            cold. It keeps producing even with the ads switched off.
          </p>
          <p className="border-t border-white/10 pt-5 text-base text-ink-200">
            No markup on your ads. I don&rsquo;t resell your leads. Keep your
            ads guy &mdash; the engine just makes his leads convert.
          </p>
        </div>
      </div>
    </SectionRail>
  )
}
