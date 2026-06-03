import { SectionRail } from '@/components/layout/SectionRail'
import { CrossServiceCallout } from '@/components/services/CrossServiceCallout'

/**
 * Editorial Authority § 02 — five formats we write.
 *
 * Each card maps to a search/AI surface. The grid runs 3 + 2 on lg (last
 * row centers two cards), 2 on md, 1 on sm. Amber accent strip on top of
 * each card threads the service color. The Catalog AI callout at the
 * bottom sits in this section to keep the "what we don't write here"
 * answer close to the "what we write here" list.
 */

type Format = {
  name: string
  length: string
  builtFor: string
  body: string
}

const FORMATS: Format[] = [
  {
    name: 'Pillar page',
    length: '3,000–6,000 words',
    builtFor: 'AIO + ChatGPT + classic SERP',
    body: 'Definitive source pages on the topics buyers research before they specify. Become the page everyone else cites.',
  },
  {
    name: 'Cluster post',
    length: '1,400–2,200 words',
    builtFor: 'Long-tail SERP + LLM training corpora',
    body: 'Topic-clustered articles funneling authority into pillars and ranking on commercial sub-queries.',
  },
  {
    name: 'Engineering Q&A hub',
    length: '120–400 words per answer',
    builtFor: 'AIO citations + People-Also-Ask',
    body: 'Answer hubs covering the long tail of specification, compatibility, and selection questions.',
  },
  {
    name: 'Category-level content',
    length: '800–1,500 words',
    builtFor: 'Category pages, buying guides',
    body: 'Category descriptions, buying guides, category-level FAQs. The editorial layer of the catalog (NOT per-product copy).',
  },
  {
    name: 'Editorial / bylined / trade-press',
    length: '1,800–3,000 words',
    builtFor: 'Backlink + citation flywheel',
    body: 'Thought-leadership for trade press and LinkedIn. Built to earn placements with real publications.',
  },
]

export function EditorialFormats({ id }: { id?: string }) {
  return (
    <SectionRail tone="surface" id={id}>
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
          citations on the surfaces your buyers actually use &mdash;
          AI&nbsp;Overviews, ChatGPT answers, Shopping LLMs, and the
          long-tail SERP that still drives qualified inbounds.
        </p>
      </div>

      <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-6">
        {FORMATS.map((f, i) => {
          // 5 cards on lg: first 3 span 2 cols each (3-col row), last 2
          // span 3 cols each (centered 2-col row). On md/sm fall back to
          // the default 2 / 1 column rhythm.
          const lgSpan =
            i < 3 ? 'lg:col-span-2' : 'lg:col-span-3'
          return (
            <li
              key={f.name}
              className={`relative flex flex-col border border-rule bg-paper transition-colors duration-200 hover:border-ink-700 ${lgSpan}`}
            >
              <span
                aria-hidden
                className="block h-1 w-full bg-service-editorial-500"
              />
              <div className="flex flex-1 flex-col p-6 md:p-7">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-service-editorial-700">
                  Format {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-3 font-display text-2xl font-semibold tracking-[-0.01em] text-ink-900">
                  {f.name}
                </h3>
                <span className="mt-3 inline-flex w-fit items-center rounded-full border border-rule bg-surface px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-700">
                  {f.length}
                </span>
                <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                  Built for
                </p>
                <p className="mt-1 font-display text-sm font-semibold text-ink-900">
                  {f.builtFor}
                </p>
                <p className="mt-5 flex-1 text-ink-700">{f.body}</p>
              </div>
            </li>
          )
        })}
      </ul>

      <div className="mt-14">
        <CrossServiceCallout
          eyebrow="Need per-product copy or FAQs?"
          intro={
            <>
              Product-level content (descriptions, FAQs, schema, spec
              content) is handled by <strong>Catalog AI</strong> &mdash;
              AI-drafted with editor review at scale. Different work,
              different tools. Most clients buy both: editorial content
              for the category level and above; Catalog AI for the product
              level.
            </>
          }
          links={[
            {
              service: 'catalog',
              note: 'AI-drafted, editor-reviewed product catalogs from $3/SKU.',
            },
          ]}
        />
      </div>
    </SectionRail>
  )
}
