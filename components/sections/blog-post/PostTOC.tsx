import { slugifyHeading } from '@/lib/slug'

type BodyBlock = {
  _type: string
  style?: string
  children?: { text?: string }[]
}

/**
 * Sticky table of contents — desktop sidebar only.
 *
 * Reads H2/H3 blocks from the post's portable-text body and emits an
 * anchored list. The list renders only when there are 5+ H2/H3s, on the
 * principle that a TOC for a short post is decoration, not navigation.
 * Sticky positioning is handled by the parent column so this component
 * stays focused on content.
 *
 * Visual language matches the editorial rebuild: paper, hairline rule,
 * mono labels, no card chrome. Accent-orange marker on the index numbers
 * to echo the BlogPillars treatment.
 */
export function PostTOC({ body }: { body: unknown }) {
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

  // Don't render a TOC for short posts.
  const h2Count = headings.filter((h) => h.level === 'h2').length
  if (h2Count < 4) return null

  let h2Index = 0
  return (
    <nav
      aria-label="Table of contents"
      className="border-t border-rule pt-6"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
        On this page
      </p>
      <ol className="mt-5 space-y-3 text-sm">
        {headings.map((h, i) => {
          const isH2 = h.level === 'h2'
          if (isH2) h2Index += 1
          return (
            <li
              key={`${i}-${h.text}`}
              className={isH2 ? '' : 'ml-5'}
            >
              <a
                href={`#${slugifyHeading(h.text)}`}
                className="group flex items-start gap-3 text-ink-700 transition-colors duration-200 hover:text-ink-900"
              >
                {isH2 && (
                  <span className="mt-[2px] font-mono text-[10px] uppercase tracking-[0.18em] text-accent-700 tabular-nums">
                    {String(h2Index).padStart(2, '0')}
                  </span>
                )}
                <span
                  className={
                    isH2
                      ? 'flex-1 leading-snug'
                      : 'flex-1 text-[13px] leading-snug text-ink-500'
                  }
                >
                  {h.text}
                </span>
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
