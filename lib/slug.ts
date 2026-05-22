/**
 * Helpers for deriving stable URL-safe slugs.
 */

/**
 * Convert a Sanity portable-text block's children into a hash-fragment slug
 * suitable for `<h2 id>`. Mirrors what the TOC component computes on the
 * client so anchors line up.
 *
 * Accepts the union type that Sanity portable-text emits for block children:
 * spans (which have `.text`) and arbitrary inline objects (which don't).
 * We pull `.text` from any child that has it; everything else contributes
 * empty.
 */
export function slugifyHeading(
  children?: ReadonlyArray<unknown> | string,
): string {
  if (children == null) return ''
  if (typeof children === 'string') return slugify(children)
  const raw = children
    .map((c) => {
      if (c && typeof c === 'object' && 'text' in c) {
        const t = (c as { text?: unknown }).text
        return typeof t === 'string' ? t : ''
      }
      return ''
    })
    .join('')
  return slugify(raw)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}
