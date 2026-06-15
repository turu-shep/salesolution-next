import { SectionRail } from '@/components/layout/SectionRail'

/**
 * Revenue Engine pillar § 8 — guarantee.
 *
 * Exact language, verbatim (spec §1.6), plus one plain sentence on how
 * "system-attributed" is measured.
 */

export function Guarantee({ id }: { id?: string }) {
  return (
    <SectionRail tone="dark" id={id} glow="quiet" size="sm">
      <div className="mx-auto max-w-3xl text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
          The guarantee
        </p>
        <blockquote className="mt-6 font-display text-balance text-3xl font-semibold leading-[1.15] tracking-[-0.015em] text-white sm:text-4xl md:text-5xl">
          &ldquo;If system-attributed revenue doesn&rsquo;t exceed my fee by
          day 90, I work free until it does.&rdquo;
        </blockquote>
        <p className="mt-8 text-ink-200">
          System-attributed revenue is the second line on your monthly
          report: recovered calls, estimate and treatment-plan follow-up,
          reactivation, and review-driven organic. Measured in your own
          dashboard, not estimated.
        </p>
      </div>
    </SectionRail>
  )
}
