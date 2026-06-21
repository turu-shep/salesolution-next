import { marked } from 'marked'

/**
 * Renders an internal markdown doc into the site's `.article-body` typography with a
 * sticky table of contents built from the ## section headings. Server component —
 * the markdown renders server-side, so large docs never ship to the browser as JS.
 * Shared by /sales/psychology, /sales/cadence, /sales/compliance.
 */

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

type Heading = { text: string; id: string }

function tableOfContents(md: string): Heading[] {
  return md
    .split('\n')
    .map((line): Heading | null => {
      const m = /^##\s+(.*)$/.exec(line)
      if (!m) return null
      const text = m[1].trim()
      return { text, id: slugify(text) }
    })
    .filter((h): h is Heading => h !== null)
}

async function renderHtml(md: string): Promise<string> {
  const raw = await marked.parse(md)
  return raw.replace(/<(h[23])>([\s\S]*?)<\/\1>/g, (_full, tag: string, inner: string) => {
    const text = inner.replace(/<[^>]+>/g, '')
    return `<${tag} id="${slugify(text)}">${inner}</${tag}>`
  })
}

export async function MarkdownDoc({ markdown }: { markdown: string }) {
  const toc = tableOfContents(markdown)
  const html = await renderHtml(markdown)

  return (
    <div className="lg:flex lg:gap-8">
      {toc.length ? (
        <nav className="mb-6 lg:mb-0 lg:w-56 lg:shrink-0">
          <div className="lg:sticky lg:top-6 lg:max-h-[82vh] lg:overflow-auto">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-wide text-ink-400">On this page</p>
            <ul className="space-y-1 text-sm">
              {toc.map((h) => (
                <li key={h.id}>
                  <a href={`#${h.id}`} className="block text-ink-500 hover:text-accent-600">
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      ) : null}

      <article className="article-body min-w-0 flex-1" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
