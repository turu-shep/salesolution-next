import { business } from '@/lib/business'

export function ShareButtons({ slug, title }: { slug: string; title: string }) {
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
    <div className="mt-10 flex items-center gap-3">
      <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">
        Share
      </span>
      {shares.map((s) => (
        <a
          key={s.label}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border border-ink-300 px-3 py-1.5 text-xs font-medium text-ink-800 transition hover:border-brand-600 hover:text-brand-600"
        >
          {s.label}
        </a>
      ))}
    </div>
  )
}
