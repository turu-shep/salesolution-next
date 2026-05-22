import { PortableTextRenderer } from '@/components/portable-text/PortableTextRenderer'

/**
 * /career-paths/[slug]/ — editorial body wrapper.
 *
 * Thin shell around `PortableTextRenderer`. Owns the reading-layout
 * constraints (max-width, font tuning) so the page-level grid keeps its
 * single concern: place the body next to the sticky TOC.
 *
 * `max-w-prose` is the AGENTS.md design constraint for long-form. We
 * deliberately don't use the wider 65–70ch values some long-form blogs
 * pick — the editorial voice here is closer to a printed reading list
 * than a feature article, and the narrower measure keeps each chapter
 * scannable next to the TOC.
 *
 * Empty-body fallback prints a stub so the layout doesn't collapse to
 * zero height if a draft path is published without prose yet. The CMS
 * editor will see this rendered in the Studio preview iframe.
 */
export function PathBody({ body }: { body: unknown }) {
  const hasContent = Array.isArray(body) && body.length > 0

  if (!hasContent) {
    return (
      <article className="min-w-0 max-w-prose">
        <div className="border border-rule bg-surface p-6 md:p-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
            Draft
          </p>
          <p className="mt-3 text-ink-700">
            The body of this path is still being written. Check back soon
            &mdash; or sign up for the operator notes to be told when it
            ships.
          </p>
        </div>
      </article>
    )
  }

  return (
    <article className="min-w-0 max-w-prose">
      <PortableTextRenderer value={body} />
    </article>
  )
}
