import { SectionRail } from '@/components/layout/SectionRail'

/**
 * Content-writing § 03 — What we write.
 *
 * Five content formats arranged as an editorial spec sheet. Each card has
 * a format code (eyebrow), title, what it does, typical length, and the
 * surface it&apos;s built for. The first card is highlighted with the
 * accent — it&apos;s the format most engagements start with.
 *
 * Layout: 2-column on tablet, 3-column on desktop with the highlight
 * format spanning the wider first cell. Reads like a service menu.
 */

type Format = {
  code: string
  title: string
  body: string
  length: string
  surface: string
  featured?: boolean
}

const FORMATS: Format[] = [
  {
    code: 'F-01',
    title: 'Pillar pages',
    body: 'Definitive 3,000–6,000-word source pages on the topics your buyers research before they specify. Schema-rich, citation-engineered, structured for AI parsing.',
    length: '3,000–6,000 words',
    surface: 'AI Overviews · ChatGPT · classic SERP',
    featured: true,
  },
  {
    code: 'F-02',
    title: 'Spec-heavy product copy',
    body: 'Product and category copy written off the engineering data, not the marketing brief. Reads as a spec sheet a buyer trusts, not a brochure.',
    length: '400–900 words / SKU',
    surface: 'PDPs · category hubs · Shopping LLMs',
  },
  {
    code: 'F-03',
    title: 'Engineering Q&A hubs',
    body: 'Answer hubs that cover the long tail of specification, compatibility, and selection questions. Each answer cites a primary source we control.',
    length: '120–400 words / answer',
    surface: 'AIO citations · People-Also-Ask',
  },
  {
    code: 'F-04',
    title: 'Supporting cluster posts',
    body: 'Topic-clustered articles that funnel authority into the pillar and rank on commercial sub-queries. Written by senior subject-matter writers.',
    length: '1,400–2,200 words',
    surface: 'Long-tail SERP · LLM training corpora',
  },
  {
    code: 'F-05',
    title: 'Editorial & trade-press content',
    body: 'Bylined thought-leadership your operators ghost-author. Built for trade press, LinkedIn, and the citation-grade publications GEO engines prefer.',
    length: '1,800–3,000 words',
    surface: 'Backlink + citation flywheel',
  },
]

export function ContentTypes({ id }: { id?: string }) {
  return (
    <SectionRail tone="paper" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          What we write
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          Five formats.{' '}
          <span className="text-ink-500">Each built for a surface.</span>
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          We don&rsquo;t write blog posts. We write the formats that earn
          citations on the surfaces your buyers actually use &mdash; AI
          Overviews, ChatGPT answers, Shopping LLMs, and the long-tail SERP
          that still drives qualified inbounds.
        </p>
      </div>

      <ul className="mt-14 grid gap-px bg-rule sm:grid-cols-2 md:grid-cols-2">
        {FORMATS.map((f, i) => (
          <li
            key={f.code}
            className={
              // Pillar (featured) spans both columns on md+ for hierarchy.
              (i === 0 ? 'sm:col-span-2 ' : '') +
              'relative flex flex-col bg-paper p-6 transition-colors duration-200 hover:bg-surface md:p-8'
            }
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
                {f.code}
              </p>
              {f.featured && (
                <span className="inline-flex items-center rounded-[3px] bg-accent-500 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                  Most engagements start here
                </span>
              )}
            </div>

            <h3
              className={
                'mt-4 font-display font-semibold tracking-[-0.01em] text-ink-900 ' +
                (i === 0 ? 'text-3xl sm:text-4xl' : 'text-2xl')
              }
            >
              {f.title}
            </h3>

            <p className="mt-4 flex-1 text-ink-700">{f.body}</p>

            <dl className="mt-6 grid gap-y-3 border-t border-rule pt-5 text-sm sm:grid-cols-2 sm:gap-x-6">
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                  Typical length
                </dt>
                <dd className="mt-1 font-display font-semibold text-ink-900">
                  {f.length}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                  Built for
                </dt>
                <dd className="mt-1 font-display font-semibold text-ink-900">
                  {f.surface}
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </SectionRail>
  )
}
