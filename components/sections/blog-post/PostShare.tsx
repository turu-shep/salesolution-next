import { business } from '@/lib/business'

/**
 * Editorial share strip — mono labels, no card chrome.
 *
 * Sits flush at the foot of the prose column, separated by a hairline rule
 * from the body above. No icons (icons in mono editorial layouts read as
 * sprite noise); the share targets are text labels exactly like the rest
 * of the metadata vocabulary.
 */
export function PostShare({
  slug,
  title,
}: {
  slug: string
  title: string
}) {
  const url = `${business.url}/${slug}/`
  const encodedUrl = encodeURIComponent(url)
  const encodedText = encodeURIComponent(title)

  const shares = [
    {
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      label: 'X',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    },
  ]

  return (
    <div className="mt-16 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-rule pt-6">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
        Share this piece
      </span>
      {shares.map((s) => (
        <a
          key={s.label}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-700 transition-colors duration-200 hover:text-ink-900"
        >
          {s.label}
          <span
            aria-hidden
            className="text-ink-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-accent-600"
          >
            →
          </span>
        </a>
      ))}
    </div>
  )
}
