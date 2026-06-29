import { SectionRail } from '@/components/layout/SectionRail'

/**
 * Editorial Authority § 03 — process.
 *
 * Five-step horizontal timeline showing the editorial pipeline. Light
 * paper band (the dark band is reserved for the case study later). Each
 * step has a number badge, the day-range marker, the deliverable, and
 * a one-sentence "what happens" line.
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
    body: 'Senior editor pulls keyword targets, search-intent shape, AIO citation gaps, and competitor citation patterns. Brief is a one-page spec, not a Slack message.',
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

export function EditorialProcess({ id }: { id?: string }) {
  return (
    <SectionRail tone="paper" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          From brief to publish
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          Ten days, five gates.{' '}
          No black box.
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-700">
          Every piece moves through the same pipeline. You see the artifact
          at each gate &mdash; brief, outline, draft, schema, publish. If
          something&rsquo;s off, we catch it before it ships.
        </p>
      </div>

      <ol className="relative mt-16 space-y-10 border-l border-rule pl-8 md:pl-12">
        {STEPS.map((step, i) => (
          <li key={step.marker} className="relative">
            <span
              aria-hidden
              className="absolute -left-[34px] top-1 flex h-6 w-6 items-center justify-center md:-left-[50px]"
            >
              <span className="absolute inset-0 rounded-full bg-paper" />
              <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-service-editorial-500 font-mono text-[11px] font-semibold tabular-nums text-white">
                {i + 1}
              </span>
            </span>

            <div className="grid gap-4 md:grid-cols-12 md:gap-10">
              <div className="md:col-span-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-service-editorial-700">
                  {step.marker}
                </p>
              </div>
              <div className="md:col-span-9">
                <h3 className="font-display text-xl font-semibold text-ink-900">
                  {step.title}
                </h3>
                <p className="mt-3 text-ink-700">{step.body}</p>
                <div className="mt-4 border-l-2 border-service-editorial-500 pl-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-service-editorial-700">
                    Artifact
                  </p>
                  <p className="mt-1 text-sm text-ink-700">{step.artifact}</p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </SectionRail>
  )
}
