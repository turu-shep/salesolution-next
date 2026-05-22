import { slugifyHeading } from '@/lib/slug'

type BodyBlock = {
  _type: string
  style?: string
  children?: { text?: string }[]
}

/**
 * Derives section anchors from the post body's H2/H3 blocks. Server-rendered
 * — no JS needed for the static list. Sticky positioning handled by the
 * parent.
 */
export function TableOfContents({ body }: { body: unknown }) {
  if (!Array.isArray(body)) return null
  const blocks = body as BodyBlock[]
  const headings = blocks
    .filter((b) => b._type === 'block' && (b.style === 'h2' || b.style === 'h3'))
    .map((b) => ({
      level: b.style,
      text: (b.children ?? []).map((c) => c?.text ?? '').join(''),
    }))
    .filter((h) => h.text.trim().length > 0)

  if (headings.length === 0) return null

  return (
    <nav aria-label="Table of contents" className="rounded-lg bg-surface-tint-blue p-5 text-sm ring-1 ring-ink-300/10">
      <p className="font-display text-xs font-semibold uppercase tracking-wider text-brand-600">
        In this article
      </p>
      <ol className="mt-3 space-y-2">
        {headings.map((h, i) => (
          <li
            key={`${i}-${h.text}`}
            className={h.level === 'h3' ? 'pl-4' : ''}
          >
            <a
              href={`#${slugifyHeading(h.text)}`}
              className="text-ink-700 transition hover:text-brand-600"
            >
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
