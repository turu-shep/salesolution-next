import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /future-proof-your-seo/ § 02 — Checklist preview on dark band.
 *
 * Shows the four "sections" of the 60-point checklist with a sample
 * sub-point from each, so the visitor sees something concrete before they
 * gate. The numbered-rail rhythm matches the homepage editorial language.
 */

const SECTIONS = [
  {
    num: '01',
    title: 'Schema & structured data',
    count: '18 points',
    blurb:
      'JSON-LD depth on product, FAQ, HowTo, BreadcrumbList, Organization. Common gaps that block AIO retrieval.',
    sample: 'Are Product nodes wired to Offer + AggregateRating + Brand?',
  },
  {
    num: '02',
    title: 'Content structuring',
    count: '14 points',
    blurb:
      'Heading hierarchy, answer-first paragraphs, table-of-contents anchors, citation-worthy phrasing on spec pages.',
    sample: 'Does the H2 answer the query in the first 40 words?',
  },
  {
    num: '03',
    title: 'Citation engineering',
    count: '12 points',
    blurb:
      'How to seed the entity graph: name+definition density, comparison tables, source-pattern anchors AI engines lift.',
    sample: 'Is your category page citable as a standalone reference?',
  },
  {
    num: '04',
    title: 'Authority & monitoring',
    count: '16 points',
    blurb:
      'Brand-mention tracking, knowledge-panel signals, citation-share against competitors across 50+ queries.',
    sample: 'Are unlinked brand mentions trending up over the last 90 days?',
  },
] as const

export function ChecklistPreview() {
  return (
    <SectionRail tone="dark" id="whats-inside">
      <div className="grid gap-12 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-500">
            What you&rsquo;re getting
          </p>
          <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
            A 60-point audit. Run it in an hour.
          </h2>
          <div className="mt-6 max-w-md space-y-4 text-ink-300">
            <p>
              Four sections, sixty checkpoints, a self-scoring sheet. Built
              from the same framework we run on paid engagements &mdash; we
              just don&rsquo;t do the work for you. You score yourself, find
              the weakest link, fix it first.
            </p>
            <p>
              After it lands, the{' '}
              <span className="text-white">occasional note</span> &mdash; sent
              when something in AI search changes what a technical
              e&#8209;commerce team should actually do, and not on a schedule
              we&rsquo;d have to pad. One click to unsubscribe.
            </p>
          </div>

          {/* Sample line */}
          <div className="mt-8 border-l border-accent-500/60 bg-white/[0.03] py-3 pl-4 pr-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
              Sample checkpoint
            </p>
            <p className="mt-1.5 font-display text-base font-medium text-white">
              &ldquo;Does every product page expose a single, citable
              specification table the engine can lift verbatim?&rdquo;
            </p>
          </div>
        </div>

        <ul className="md:col-span-7">
          {SECTIONS.map((s) => (
            <li
              key={s.num}
              className="border-t border-white/10 py-6 first:pt-0 first:border-t-0"
            >
              <div className="flex items-baseline gap-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] tabular-nums text-ink-400">
                  {s.num}
                </span>
                <div className="flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <h3 className="font-display text-xl font-semibold text-white">
                      {s.title}
                    </h3>
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-500">
                      {s.count}
                    </span>
                  </div>
                  <p className="mt-2 text-ink-300">{s.blurb}</p>
                  <p className="mt-3 font-mono text-[11px] leading-relaxed text-ink-400">
                    <span className="text-accent-500">›</span>{' '}
                    {s.sample}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </SectionRail>
  )
}
