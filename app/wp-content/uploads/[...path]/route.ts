import { NextResponse } from 'next/server'

import { sanityClient } from '@/sanity/lib/client'

/**
 * 301-redirect any legacy WordPress media URL to the Sanity asset that
 * superseded it during the 2026 content migration.
 *
 * Why: when WP is decommissioned, `salesolution.net/wp-content/uploads/<year>/
 * <month>/<filename>.jpg` URLs go 404. Those URLs are indexed by Google Image
 * Search, referenced by external backlinks, and embedded in cached search
 * snippets — losing them would drop image-search rank and break inbound links.
 *
 * Lookup: every asset uploaded by backfill-images.mjs preserved its WP
 * `originalFilename` (e.g. `content-marketing-basics-cover.jpg`). We strip
 * WordPress's `-WIDTHxHEIGHT` resize suffix from the requested filename
 * (`foo-1024x585.jpg` → `foo.jpg`) and look up by exact filename match —
 * the migration confirmed zero filename collisions across the 42 assets.
 *
 * Cache: redirects are immutable for a year. Browsers and CDN edges remember
 * the mapping so subsequent hits don't touch Sanity at all.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params
  if (!path?.length) return new Response('Not found', { status: 404 })

  const filename = decodeURIComponent(path[path.length - 1] ?? '')
  if (!filename) return new Response('Not found', { status: 404 })

  // Strip WP's `-WxH` resize suffix so `foo-1024x585.jpg` looks up as `foo.jpg`.
  const baseFilename = filename.replace(/-\d+x\d+(\.[a-z0-9]+)$/i, '$1')
  const dot = baseFilename.lastIndexOf('.')
  const baseName = dot > 0 ? baseFilename.slice(0, dot) : baseFilename
  const ext = dot > 0 ? baseFilename.slice(dot) : ''

  // The migration sometimes uploaded a resize variant (e.g. `foo-1024x585.jpg`)
  // rather than the original `foo.jpg`. Match either the exact stripped name
  // or any string with the same `<basename>-` prefix and matching extension.
  // (The trailing dash on the prefix excludes false matches like `food.jpg`
  // when looking up `foo`. `string::startsWith` + `string::split` are the
  // GROQ idioms that work — `match "foo-*.jpg"` tokenises around the dash.)
  // Shortest filename wins so we prefer the canonical un-resized name.
  const extNoDot = ext.replace(/^\./, '').toLowerCase()
  const asset = await sanityClient.fetch<{ url: string } | null>(
    `*[_type == "sanity.imageAsset" && (
       originalFilename == $exact ||
       (string::startsWith(originalFilename, $prefix) &&
        string::split(originalFilename, ".")[-1] == $extNoDot)
     )] | order(length(originalFilename) asc)[0]{url}`,
    { exact: baseFilename, prefix: `${baseName}-`, extNoDot },
  )

  if (!asset?.url) {
    return new Response(`No Sanity asset for /${path.join('/')}`, {
      status: 404,
      headers: { 'Content-Type': 'text/plain' },
    })
  }

  return NextResponse.redirect(asset.url, {
    status: 301,
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
