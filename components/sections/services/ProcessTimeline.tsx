import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /services/ first-60-days timeline. Demystifies the post-booking experience
 * for buyers who hesitate to enter "calls" without knowing what happens next.
 *
 * Vertical stepped layout. Each step has a duration, a one-line action, and
 * a "you'll see" outcome. Dark band so it sits with weight after the
 * engagement model.
 */

type Step = {
  week: string
  title: string
  body: string
  outcome: string
}

const STEPS: Step[] = [
  {
    week: 'Day 0',
    title: '15-minute call · no deck',
    body: 'You paste 3–5 high-revenue category URLs. We walk through them live: schema completeness, AIO-readiness, citation gaps.',
    outcome: 'You leave with the single change that has the highest payback.',
  },
  {
    week: 'Day 1–2',
    title: 'Written diagnostic + SOW',
    body: 'One-page audit emailed within 24h. If we\'re a fit, an SOW follows in another 24h — scope, deliverables, fixed start date.',
    outcome: 'You decide. We don\'t chase.',
  },
  {
    week: 'Week 1',
    title: 'Access + baseline + first-shipped-change',
    body: 'Read access to GA4 / GSC / your CMS. Baseline crawl + citation snapshot. We ship one visible change so trajectory starts immediately.',
    outcome: 'First measurable lift on a target query.',
  },
  {
    week: 'Week 2–3',
    title: 'Schema rewrite + answer-hub structure',
    body: 'Product schema rebuilt across top 200 SKUs. Category pages restructured for AIO scannability. First answer hub published.',
    outcome: 'AIO citation tracker shows movement on top 50 commercial queries.',
  },
  {
    week: 'Week 4',
    title: 'First outcome review',
    body: 'Schema completeness, AIO citation rate, citation-share vs competitors. Three forward bets for next 60 days.',
    outcome: 'Lagging revenue indicators start to move months 4–6.',
  },
]

export function ProcessTimeline({ id }: { id?: string }) {
  return (
    <SectionRail tone="dark" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
          What happens after you book
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
          First 30 days. <span className="text-ink-400">No black box.</span>
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-300">
          Every founder we&rsquo;ve worked with was burned by an opaque
          agency at some point. The timeline below is what you can expect
          from the moment you book the call.
        </p>
      </div>

      <ol className="relative mt-16 space-y-12 border-l border-white/15 pl-8 md:pl-12">
        {STEPS.map((step, i) => (
          <li key={step.week} className="relative">
            {/* Marker on the rail */}
            <span
              aria-hidden
              className="absolute -left-[34px] top-2 flex h-4 w-4 items-center justify-center md:-left-[50px]"
            >
              <span className="absolute inset-0 rounded-full bg-surface-dark" />
              <span
                className={
                  i === 0
                    ? 'relative h-3 w-3 rounded-full bg-accent-500 ring-2 ring-accent-500/30'
                    : 'relative h-3 w-3 rounded-full bg-brand-600 ring-2 ring-brand-600/30'
                }
              />
            </span>

            <div className="grid gap-6 md:grid-cols-12 md:gap-10">
              <div className="md:col-span-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
                  {step.week}
                </p>
                {i === 0 && (
                  <p className="mt-2 inline-block rounded-[3px] bg-accent-500/15 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-accent-500">
                    Start here
                  </p>
                )}
              </div>
              <div className="md:col-span-9">
                <h3 className="font-display text-xl font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-ink-300">{step.body}</p>
                <div className="mt-5 border-l-2 border-accent-500/50 pl-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-500">
                    You&rsquo;ll see
                  </p>
                  <p className="mt-1.5 text-sm text-ink-200">{step.outcome}</p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </SectionRail>
  )
}
