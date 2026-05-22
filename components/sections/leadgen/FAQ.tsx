import { Section } from '@/components/layout/Section'
import { Eyebrow } from '@/components/sections/Eyebrow'
import { JsonLd } from '@/components/seo/JsonLd'
import { faqPageSchema } from '@/lib/schema'

export type FAQEntry = { question: string; answer: string }

/**
 * Server-rendered FAQ accordion using native <details>/<summary>.
 * No JS state, fully accessible, and emits FAQPage JSON-LD automatically.
 */
export function FAQ({
  eyebrow,
  headline,
  entries,
  tone = 'default',
}: {
  eyebrow?: string
  headline: string
  entries: FAQEntry[]
  tone?: 'default' | 'alt'
}) {
  return (
    <Section tone={tone}>
      <JsonLd data={faqPageSchema(entries)} />

      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <h2 className="mt-3 text-balance">{headline}</h2>
        </div>

        <ul className="mt-10 space-y-3">
          {entries.map((entry) => (
            <li
              key={entry.question}
              className="rounded-lg bg-surface ring-1 ring-ink-300/15"
            >
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-medium text-ink-900 [&::-webkit-details-marker]:hidden">
                  <span>{entry.question}</span>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0 text-ink-500 transition group-open:rotate-180"
                    aria-hidden
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </summary>
                <div className="border-t border-ink-300/15 px-5 py-4 text-sm leading-relaxed text-ink-700">
                  {entry.answer}
                </div>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}
