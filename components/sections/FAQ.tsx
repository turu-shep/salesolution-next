import { isValidElement } from 'react'

import { SectionRail } from '@/components/layout/SectionRail'
import { JsonLd } from '@/components/seo/JsonLd'
import { faqPageSchema } from '@/lib/schema'

/**
 * FAQ section — reusable across home, services, and any page that needs
 * founder/CMO-level objections answered.
 *
 * Default items are the homepage set. Pass `items` to override per page;
 * pass `eyebrow` / `headline` / `kicker` to customize the heading slab.
 *
 * Emits FAQPage JSON-LD so AI answer engines + rich results can quote the
 * Q&A verbatim. Answers are authored as JSX for layout, so we flatten each
 * one to plain text at render time — the schema is always derived from the
 * exact visible answer, which keeps the two from drifting apart.
 */

export type QA = { q: string; a: React.ReactNode }

// Block-level tags get whitespace padding when flattened so adjacent
// paragraphs / list items don't run together into one word.
const BLOCK_TAGS = new Set([
  'p', 'div', 'section', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
])

/** Flatten a React node tree to plain text for the FAQPage answer field. */
function nodeToText(node: React.ReactNode): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(nodeToText).join('')
  if (isValidElement(node)) {
    const { children } = (node.props ?? {}) as { children?: React.ReactNode }
    const inner = nodeToText(children)
    const tag = typeof node.type === 'string' ? node.type : ''
    return BLOCK_TAGS.has(tag) ? ` ${inner} ` : inner
  }
  return ''
}

const faqAnswerText = (a: React.ReactNode): string =>
  nodeToText(a).replace(/\s+/g, ' ').trim()

export const HOMEPAGE_FAQ_ITEMS: QA[] = [
  {
    q: 'Won’t AI search just stabilize and we’ll be fine?',
    a: (
      <>
        <p>
          The structural change is one-way. AI Overviews aren&rsquo;t a
          search feature on top of links &mdash; they&rsquo;re a new
          retrieval layer that re-ranks what gets cited. Google has invested
          too much in Gemini-powered surfaces to retreat.
        </p>
        <p className="mt-3">
          What changes month-to-month is <em className="text-ink-900 not-italic font-semibold">which queries trigger AIO</em> (the
          coverage rate). What doesn&rsquo;t change is <em className="text-ink-900 not-italic font-semibold">which sites get
          cited when they do</em>. The latter is the work.
        </p>
      </>
    ),
  },
  {
    q: 'Why not just hire an in-house SEO?',
    a: (
      <>
        <p>
          In-house wins when you&rsquo;re north of $50M in revenue and have
          enough work to keep someone with senior AI-search chops busy
          full-time. Below that, you end up with a generalist learning on
          your time.
        </p>
        <p className="mt-3">
          The fractional model exists because the work doesn&rsquo;t need a
          40-hour week from one person. It needs 5&ndash;15 hours from the
          right one: someone who can make your catalog readable to AI and
          track who the answers actually cite.
        </p>
      </>
    ),
  },
  {
    q: 'How do I know it’s working in 90 days?',
    a: (
      <>
        <p>
          Three leading indicators land in the first 60 days, before the
          revenue numbers move:
        </p>
        <ul className="mt-3 space-y-1.5 pl-5 [list-style-type:square]">
          <li>How often the AI answer cites you on the 50 queries that matter to your revenue</li>
          <li>How much of your catalog AI can actually read</li>
          <li>Whether the buyers finding you are still researching or ready to buy</li>
        </ul>
        <p className="mt-3">
          You see them in the monthly outcome review. Qualified-lead lift
          shows up months 4–6, depending on how broken the foundation was
          when we started.
        </p>
      </>
    ),
  },
  {
    q: 'Does this work for my business?',
    a: (
      <>
        <p>
          Two engines, one operator. If buyers research before they buy
          &mdash; distributors, manufacturers, anything spec-heavy &mdash; we
          make you the company AI names, and stop the quotes you already get
          from leaking.
        </p>
        <p className="mt-3">
          If you run on calls and bookings &mdash; roofing, HVAC, plumbing,
          electrical, dental &mdash; the Revenue Engine answers every call,
          replies in seconds, books the job, and chases the quotes that stall.
        </p>
        <p className="mt-3">
          Sell a pure commodity with no research and no phone? We&rsquo;ll tell
          you on the first call. Not every business needs us.
        </p>
      </>
    ),
  },
  {
    q: 'What actually happens on the first call?',
    a: (
      <>
        <p>
          15 minutes, no deck. You paste 3–5 of your highest-revenue category
          URLs. We walk through them live: schema completeness, AIO-readiness
          score, the queries you&rsquo;re cited for vs the queries your
          competitors are.
        </p>
        <p className="mt-3">
          You leave with either: (a) the single change with the highest
          payback, or (b) confirmation that your foundation is solid and you
          don&rsquo;t need us yet.
        </p>
      </>
    ),
  },
]

export function FAQ({
  items = HOMEPAGE_FAQ_ITEMS,
  eyebrow = 'Before you book',
  headline,
  kicker = 'Pulled from real strategy calls. No marketing softening.',
  id,
  defaultOpenFirst = false,
}: {
  items?: QA[]
  eyebrow?: string
  headline?: React.ReactNode
  kicker?: React.ReactNode
  id?: string
  /** Open the first item by default — useful for a short FAQ so the band isn't empty. */
  defaultOpenFirst?: boolean
}) {
  const faqEntries = items
    .map((item) => ({ question: item.q, answer: faqAnswerText(item.a) }))
    .filter((entry) => entry.answer.length > 0)

  return (
    <SectionRail tone="surface" id={id}>
      {faqEntries.length > 0 && <JsonLd data={faqPageSchema(faqEntries)} />}
      <div className="grid gap-12 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            {eyebrow}
          </p>
          <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
            {headline ?? (
              <>
                Questions founders ask first.
              </>
            )}
          </h2>
          <p className="mt-6 text-ink-700">{kicker}</p>
        </div>

        <ul className="md:col-span-8">
          {items.map((item, i) => (
            <li key={i} className="border-t border-rule last:border-b">
              <details className="group" open={defaultOpenFirst && i === 0}>
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 transition-colors duration-200 hover:text-ink-900">
                  <span className="flex items-baseline gap-4">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] tabular-nums text-ink-400">
                      {(i + 1).toString().padStart(2, '0')}
                    </span>
                    <span className="font-display text-lg font-semibold text-ink-900">
                      {item.q}
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className="mt-1.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-rule-strong text-ink-500 transition-all duration-200 group-hover:border-ink-900 group-hover:text-ink-900 group-open:rotate-45 group-open:border-accent-500 group-open:bg-accent-500 group-open:text-white"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-3 w-3">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </span>
                </summary>
                <div className="pb-6 pl-10 pr-12 text-ink-700">
                  {item.a}
                </div>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </SectionRail>
  )
}
