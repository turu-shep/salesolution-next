import { slugifyHeading } from '@/lib/slug'

type BodyBlock = {
  _type: string
  style?: string
  children?: { text?: string }[]
}

/**
 * Editorial sticky table-of-contents for guide detail pages.
 *
 * Replaces the older blue-tinted card-style TOC with a hairline-rule, mono
 * lockup that matches the rest of the rebuilt guides surface. Derives
 * anchors server-side from h2/h3 portable-text blocks — no JS required for
 * the static list.
 */
export function GuideTOC({ body }: { body: unknown }) {
  if (!Array.isArray(body)) return null
  const blocks = body as BodyBlock[]

  const headings = blocks
    .filter(
      (b) => b._type === 'block' && (b.style === 'h2' || b.style === 'h3'),
    )
    .map((b) => ({
      level: b.style,
      text: (b.children ?? []).map((c) => c?.text ?? '').join(''),
    }))
    .filter((h) => h.text.trim().length > 0)

  if (headings.length === 0) return null

  return (
    <nav
      aria-label="Table of contents"
      className="border-t border-rule-strong pt-6"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
        On this page
      </p>
      <ol className="mt-5 space-y-3 border-l border-rule">
        {headings.map((h, i) => (
          <li
            key={`${i}-${h.text}`}
            className={h.level === 'h3' ? 'pl-8' : 'pl-4'}
          >
            <a
              href={`#${slugifyHeading(h.text)}`}
              className={
                'block text-sm leading-snug transition-colors duration-200 ' +
                (h.level === 'h3'
                  ? 'text-ink-500 hover:text-brand-600'
                  : 'text-ink-700 hover:text-brand-600')
              }
            >
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
