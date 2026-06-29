import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /services/full-growth-ownership/ § 2 — The problem.
 *
 * The "five agencies, no accountability" narrative. Dark tone so it sits
 * with weight under the hero; long-form copy with a final tightening
 * paragraph that names the offering as the answer.
 */
export function FullGrowthProblem({ id }: { id?: string }) {
  return (
    <SectionRail tone="dark" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
          The problem
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
          Five agencies. No accountability.
        </h2>
      </div>

      <div className="mt-12 grid gap-10 md:grid-cols-12 md:gap-16">
        <div className="space-y-5 text-lg leading-relaxed text-ink-300 md:col-span-7">
          <p>
            Most $5&ndash;25M B2B companies hit the same wall around year
            four. You&rsquo;ve outgrown the single agency that handled
            &ldquo;marketing.&rdquo; You&rsquo;ve hired a freelancer for
            content, a Shopify agency for the build, a paid media person for
            ads, an SEO firm for organic, and a deliverability vendor for
            cold email.
          </p>
          <p>
            Five vendors. Five reports. Five Slack channels. Nobody owns the
            connection between them.
          </p>
          <p>
            The work gets done, but it doesn&rsquo;t compound. Content gets
            written but doesn&rsquo;t link to product pages. Product pages
            get rewritten but don&rsquo;t feed outbound. Ads run but
            don&rsquo;t reflect what&rsquo;s actually converting on the site.
          </p>
        </div>

        <div className="md:col-span-5">
          <div className="border-l-2 border-accent-500/60 pl-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-500">
              Why this offer exists
            </p>
            <p className="mt-3 font-display text-xl font-semibold leading-snug text-white">
              The pattern is so consistent that we built this offering
              specifically for it.
            </p>
            <p className="mt-4 text-ink-300">
              One operator. One owner. Five services running as one motion.
            </p>
          </div>
        </div>
      </div>
    </SectionRail>
  )
}
