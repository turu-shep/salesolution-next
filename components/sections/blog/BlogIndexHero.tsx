/**
 * Blog index hero — same shape as ServicesHero but tuned for editorial.
 *
 * Two-tone H1: the second line is the editorial promise, set in muted ink.
 * The lede is a single sentence on what the writing is for, not a TOC.
 * Eyebrow is mono, technical label-style.
 */

export function BlogIndexHero({
  postCount,
  topicCount,
}: {
  postCount: number
  topicCount: number
}) {
  return (
    <section data-section-tone="light" className="relative bg-paper">
      <div className="mx-auto max-w-6xl px-4 pb-12 pt-16 sm:px-6 md:pb-16 md:pt-24 lg:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          Insights / Field reports
        </p>

        <h1 className="mt-4 font-display text-5xl font-semibold leading-[1] tracking-[-0.03em] text-ink-900 sm:text-6xl md:text-[6rem]">
          <span className="block">Field notes from</span>
          <span className="block text-ink-500">the AI search frontier.</span>
        </h1>

        <p className="mt-10 max-w-2xl text-lg leading-relaxed text-ink-700 md:text-xl">
          Frameworks we ship, case studies from real engagements across
          industrial e&#8209;commerce and local services, and the algorithm
          updates that actually moved revenue. No listicle filler &mdash; only
          what we&rsquo;ve seen work, or fail, on real client pipelines.
        </p>

        <dl className="mt-14 grid max-w-md grid-cols-2 gap-x-10 border-t border-rule pt-6 md:mt-20">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
              Posts published
            </dt>
            <dd className="mt-2 font-display text-3xl font-semibold tabular-nums tracking-[-0.02em] text-ink-900">
              {postCount}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
              Topics covered
            </dt>
            <dd className="mt-2 font-display text-3xl font-semibold tabular-nums tracking-[-0.02em] text-ink-900">
              {topicCount}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
