import { PortableText, type PortableTextComponents } from '@portabletext/react'
import Image from 'next/image'
import Link from 'next/link'

import { urlFor } from '@/sanity/lib/image'
import { slugifyHeading } from '@/lib/slug'

/**
 * Render Sanity portable-text into the long-form `.article-body` layout used by
 * every editorial route (posts, guides, career paths). Heading nodes get an
 * `id` derived from their text so the TableOfContents can link to them.
 *
 * Typography (margins, list bullets, link colors, code chip, etc.) lives in
 * `.article-body` in `app/globals.css` — the renderer only owns node-level
 * concerns (heading anchors, custom blockquote chrome, image/code/callout
 * blocks). The `prose` utility chain isn't used because the project doesn't
 * ship `@tailwindcss/typography`.
 */
const components: PortableTextComponents = {
  block: {
    h2: ({ children, value }) => (
      <h2 id={slugifyHeading(value?.children)} className="scroll-mt-24">
        {children}
      </h2>
    ),
    h3: ({ children, value }) => (
      <h3 id={slugifyHeading(value?.children)} className="scroll-mt-24">
        {children}
      </h3>
    ),
    h4: ({ children }) => <h4>{children}</h4>,
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-l-4 border-brand-600 bg-surface-tint-blue px-5 py-4 not-italic text-ink-700">
        {children}
      </blockquote>
    ),
  },

  marks: {
    // strong / em / underline don't need overrides — @portabletext/react
    // emits the right native tags and the `.article-body` CSS styles them.
    link: ({ children, value }) => {
      const href = value?.href || '#'
      const external = /^https?:\/\//.test(href) && !href.includes('salesolution.net')
      if (external || value?.newTab) {
        return (
          <a href={href} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        )
      }
      return <Link href={href}>{children}</Link>
    },
    // Inline code is styled by `.article-body code` — this override only
    // exists so the renderer emits `<code>` without spurious wrapping spans.
    code: ({ children }) => <code>{children}</code>,
  },

  types: {
    image: ({ value }) => {
      if (!value?.asset?._ref && !value?.asset?.url) return null
      const src = value.asset.url ?? urlFor(value).width(1600).url()
      return (
        <figure className="my-8">
          <Image
            src={src}
            alt={value.alt ?? ''}
            width={value.asset?.metadata?.dimensions?.width ?? 1600}
            height={value.asset?.metadata?.dimensions?.height ?? 900}
            className="rounded-lg ring-1 ring-ink-300/15"
            sizes="(min-width: 768px) 720px, 100vw"
          />
          {value.caption && (
            <figcaption className="mt-2 text-center text-sm text-ink-500">{value.caption}</figcaption>
          )}
        </figure>
      )
    },

    codeBlock: ({ value }) => (
      <pre className="my-6 overflow-x-auto rounded-lg bg-surface-dark p-5 text-sm text-ink-inverse">
        <code>{value?.code}</code>
      </pre>
    ),

    callout: ({ value }) => {
      const toneBg: Record<string, string> = {
        info:    'bg-surface-tint-blue border-brand-600',
        tip:     'bg-surface-tint-cool border-brand-500',
        warning: 'bg-surface-tint-warm border-danger-500',
        danger:  'bg-danger-50      border-danger-500',
      }
      const cls = toneBg[value?.tone || 'info']
      return (
        <aside className={`my-6 rounded-lg border-l-4 p-5 ${cls}`}>
          <p className="text-sm leading-relaxed text-ink-700">{value?.body}</p>
        </aside>
      )
    },
  },
}

export function PortableTextRenderer({ value }: { value: unknown }) {
  if (!value || !Array.isArray(value)) return null
  return (
    <div className="article-body">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <PortableText value={value as any} components={components} />
    </div>
  )
}
