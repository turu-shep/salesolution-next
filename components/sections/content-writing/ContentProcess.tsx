import { SectionRail } from '@/components/layout/SectionRail'

/**
 * Content-writing § 04 — From brief to publish.
 *
 * Five-step vertical timeline showing how a piece moves through the
 * editorial pipeline. Dark band so it lands with weight after the formats
 * grid. Each step has a duration, the work, and the artifact you sign off.
 */

type Step = {
  marker: string
  title: string
  body: string
  artifact: string
}

const STEPS: Step[] = [
  {
    marker: 'Day 0',
    title: 'Topic intake + research brief',
    body: 'Senior editor pulls keyword targets, search-intent shape, AIO citation gaps, and competitor citation patterns. Brief is a one-page spec — not a slack message.',
    artifact: 'Editorial brief with target query, intent, and citation gaps.',
  },
  {
    marker: 'Day 1–2',
    title: 'Outline + source approval',
    body: 'Subject-matter writer drafts a heading-level outline with primary sources flagged. You greenlight before drafting starts. No surprises at delivery.',
    artifact: 'Outline + source list, approved in writing.',
  },
  {
    marker: 'Day 3–6',
    title: 'Draft + first edit',
    body: 'Senior writer (no offshoring, no LLM ghostwriting) drafts to the outline. Editor passes it for voice, accuracy, and AIO scannability before it reaches you.',
    artifact: 'Edited draft delivered against the brief.',
  },
  {
    marker: 'Day 7–8',
    title: 'SEO + schema layer',
    body: 'Internal-linking plan, FAQ block, HowTo / Article schema, image alt, meta description. The on-page work that earns the citation, not just the rank.',
    artifact: 'Publish-ready file + on-page checklist.',
  },
  {
    marker: 'Day 9–10',
    title: 'Publish + citation tracker',
    body: 'We publish or hand off depending on your CMS access. The piece enters the citation tracker so AIO coverage shows up in your monthly review.',
    artifact: 'Live URL + 90-day citation tracking enabled.',
  },
]

export function ContentProcess({ id }: { id?: string }) {
  return (
    <SectionRail tone="dark" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
          From brief to publish
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
          Ten days, five gates.{' '}
          <span className="text-ink-400">No black box.</span>
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-300">
          Every piece moves through the same pipeline. You see the artifact
          at each gate &mdash; brief, outline, draft, schema, publish. If
          something&rsquo;s off, we catch it before it ships.
        </p>
      </div>

      <ol className="relative mt-16 space-y-12 border-l border-white/15 pl-8 md:pl-12">
        {STEPS.map((step, i) => (
          <li key={step.marker} className="relative">
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
                  {step.marker}
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
                    Artifact
                  </p>
                  <p className="mt-1.5 text-sm text-ink-200">{step.artifact}</p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </SectionRail>
  )
}
