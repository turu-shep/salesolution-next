import { PortableTextRenderer } from '@/components/portable-text/PortableTextRenderer'

/**
 * Reading-focused container for the guide's portable-text body.
 *
 * Wraps the shared `PortableTextRenderer` (untouched — owns all node-level
 * styling) and constrains it to the editorial reading measure. The prose
 * sizing is identical to the blog post layout so a reader gets the same
 * line-length and rhythm across all long-form routes.
 */
export function GuideBody({ value }: { value: unknown }) {
  return (
    <article className="min-w-0">
      <div className="max-w-prose">
        <PortableTextRenderer value={value} />
      </div>
    </article>
  )
}
