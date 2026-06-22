import { SectionRail } from '@/components/layout/SectionRail'

/**
 * Revenue Engine pillar § 8 — guarantee.
 *
 * The fee-beating promise in plain words (de-jargons the spec's
 * "system-attributed" wording), plus one sentence on how that line is counted.
 * The full definition lives in TwoRevenueLines ("How I report it"), the section
 * directly above this one.
 */

export function Guarantee({ id }: { id?: string }) {
  return (
    <SectionRail tone="dark" id={id} glow="none" size="sm" className="-mt-12 md:-mt-16">
      <div className="mx-auto max-w-3xl text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
          The guarantee
        </p>
        <blockquote className="mt-6 font-display text-balance text-3xl font-semibold leading-[1.15] tracking-[-0.015em] text-white sm:text-4xl md:text-5xl">
          &ldquo;If the revenue the system brings back doesn&rsquo;t beat my
          fee by day 90, I work free until it does.&rdquo;
        </blockquote>
        <p className="mt-8 text-ink-200">
          That&rsquo;s the second line on your report &mdash; the work the
          system brings back, counted in your own dashboard, not my
          spreadsheet. That&rsquo;s what makes it safe to promise.
        </p>
      </div>
    </SectionRail>
  )
}
