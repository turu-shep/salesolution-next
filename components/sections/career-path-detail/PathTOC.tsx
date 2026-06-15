import { slugifyHeading } from '@/lib/slug'

type BodyBlock = {
  _type: string
  style?: string
  children?: { text?: string }[]
}

/**
 * /career-paths/[slug]/ — sticky desktop TOC.
 *
 * Server-rendered list of H2/H3 anchors derived from the path body. Lives
 * in the left rail on desktop (parent owns the sticky positioning + the
 * `hidden md:block` wrapper); the body article runs to its right.
 *
 * Styled in the editorial mono-eyebrow language so it reads as section
 * chrome, not as a tooltip card. The first heading gets the accent-orange
 * "Start here" marker — the same signal used in PathHero for an entry-
 * level path — which gives a reader scanning the TOC a clear visual anchor
 * for "where does this path begin".
 *
 * No JS — anchor links use native `:target` scroll. Active-section
 * highlighting via IntersectionObserver is intentionally deferred until
 * we have a real path with enough chapters to need it.
 */
type Anchor = { text: string; id: string }

export function PathTOC({
  body,
  topAnchor,
  bottomAnchor,
}: {
  body: unknown
  /** Fixed-id section rendered above the body (e.g. "At each level"). */
  topAnchor?: Anchor
  /** Fixed-id section rendered below the body (e.g. "Hiring this role?"). */
  bottomAnchor?: Anchor
}) {
  const blocks = Array.isArray(body) ? (body as BodyBlock[]) : []

  const bodyHeadings = blocks
    .filter(
      (b) => b._type === 'block' && (b.style === 'h2' || b.style === 'h3'),
    )
    .map((b) => ({
      level: b.style as string,
      text: (b.children ?? []).map((c) => c?.text ?? '').join(''),
      id: slugifyHeading((b.children ?? []).map((c) => c?.text ?? '').join('')),
    }))
    .filter((h) => h.text.trim().length > 0)

  // Compose: [matrix] → body chapters → [buyer]. Each carries an explicit id.
  const headings: { level: string; text: string; id: string }[] = [
    ...(topAnchor ? [{ level: 'h2', text: topAnchor.text, id: topAnchor.id }] : []),
    ...bodyHeadings,
    ...(bottomAnchor ? [{ level: 'h2', text: bottomAnchor.text, id: bottomAnchor.id }] : []),
  ]

  if (headings.length === 0) return null

  return (
    <nav aria-label="Table of contents" className="border-t border-rule pt-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
        On this path
      </p>

      <ol className="mt-4 space-y-3">
        {headings.map((h, i) => {
          const isFirst = i === 0 && h.level === 'h2'
          const isH3 = h.level === 'h3'
          return (
            <li
              key={`${i}-${h.text}`}
              className={isH3 ? 'pl-4 border-l border-rule' : ''}
            >
              <a
                href={`#${h.id}`}
                className="group flex items-baseline gap-2 text-sm leading-snug text-ink-700 transition-colors duration-200 hover:text-brand-600"
              >
                {isFirst && (
                  <span
                    aria-hidden
                    className="mt-1 inline-block h-1.5 w-1.5 flex-none rounded-full bg-accent-500"
                  />
                )}
                <span
                  className={
                    isH3
                      ? 'font-mono text-[12px] tracking-[0.01em] text-ink-500 group-hover:text-brand-600'
                      : 'font-display font-semibold text-ink-800 group-hover:text-brand-600'
                  }
                >
                  {h.text}
                </span>
              </a>
            </li>
          )
        })}
      </ol>

      <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
        {bodyHeadings.filter((h) => h.level === 'h2').length} chapters
      </p>
    </nav>
  )
}
