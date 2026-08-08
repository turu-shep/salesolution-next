import { SectionRail } from '@/components/layout/SectionRail'

/**
 * Revenue Engine pillar § 8 — guarantee.
 *
 * The 120-day cost-recovery promise in plain words (de-jargons the spec's
 * "system-attributed" wording), plus one sentence on how that line is counted
 * and one on when the clock starts. Founder decision 2026-07-28: the test is
 * cumulative — system-attributed revenue ≥ everything paid (install + fees) by
 * day 120, counted from signing; remedy is working free until it's covered.
 * Book-jobs verticals only (trades, dental, medical) — industrial and consumer
 * stay guarantee-free. The full definition of the counted line lives in
 * TwoRevenueLines ("How I report it"), the section directly above this one.
 *
 * THE SENTENCE IN THE BLOCKQUOTE IS CANONICAL. If it changes here it has to
 * change on the campaign LP and in the leak-stack "carries the 120-day payback
 * guarantee" lines too.
 */

export function Guarantee({ id, abut = false }: { id?: string; abut?: boolean }) {
  // `abut`: this guarantee directly follows the dark report band, so drop the
  // glow and pull it up to read as one conviction field. Off by default — pages
  // where the guarantee follows a light section must NOT pull up over it.
  return (
    <SectionRail
      tone="dark"
      id={id}
      glow={abut ? 'none' : 'quiet'}
      size="sm"
      className={abut ? '-mt-12 md:-mt-16' : undefined}
    >
      <div className="mx-auto max-w-3xl text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
          The guarantee
        </p>
        <blockquote className="mt-6 font-display text-balance text-3xl font-semibold leading-[1.15] tracking-[-0.015em] text-white sm:text-4xl md:text-5xl">
          &ldquo;If the revenue the system brings back hasn&rsquo;t covered
          everything you&rsquo;ve paid me &mdash; install and fees &mdash; by
          day 120, I work free until it has.&rdquo;
        </blockquote>
        <p className="mt-8 text-ink-200">
          That&rsquo;s the second line on your report &mdash; the work the
          system brings back, counted in your own dashboard, not my
          spreadsheet. That&rsquo;s what makes it safe to promise.
        </p>
        <p className="mt-5 text-sm text-ink-400">
          120 days, from the day you sign.
        </p>
      </div>
    </SectionRail>
  )
}
