import { PortableTextRenderer } from '@/components/portable-text/PortableTextRenderer'

/**
 * Editorial prose wrapper.
 *
 * The actual prose styling lives in `PortableTextRenderer` — this wrapper
 * exists so the page template has a stable component boundary if we later
 * need to layer dropcaps, pull-quotes, or progress indicators on top of
 * the rendered body without touching the renderer.
 */
export function PostBody({ body }: { body: unknown }) {
  return <PortableTextRenderer value={body} />
}
