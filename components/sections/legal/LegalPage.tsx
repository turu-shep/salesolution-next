import { Section } from '@/components/layout/Section'
import { Eyebrow } from '@/components/sections/Eyebrow'

/**
 * Shared shell for static legal pages (privacy, terms, disclaimer, prefs).
 * Body is rendered from `children`; long legal copy can be authored as JSX
 * or moved into Sanity later via a `legalPage` schema if you want non-dev
 * edits.
 */
export function LegalPage({
  title,
  updatedAt,
  intro,
  children,
}: {
  title: string
  updatedAt?: string
  intro?: string
  children: React.ReactNode
}) {
  return (
    <Section size="lg">
      <article className="mx-auto max-w-3xl">
        <header>
          <Eyebrow>Legal</Eyebrow>
          <h1 className="mt-3 font-display text-balance">{title}</h1>
          {updatedAt && (
            <p className="mt-3 text-sm text-ink-500">Last updated: {updatedAt}</p>
          )}
          {intro && <p className="mt-5 text-lg text-ink-500">{intro}</p>}
        </header>

        <div className="prose prose-lg mt-10 max-w-none prose-headings:font-display prose-headings:text-ink-900 prose-p:text-ink-700">
          {children}
        </div>
      </article>
    </Section>
  )
}
