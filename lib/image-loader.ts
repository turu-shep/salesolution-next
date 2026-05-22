/**
 * Global `next/image` loader.
 *
 * For Sanity-hosted assets (the vast majority — every post cover, inline body
 * image, and author photo), bypasses Next.js's `/_next/image` proxy and points
 * directly at Sanity's CDN with their own resize/format params. Three wins:
 *
 *  1. URLs are human-readable in audits / view-source / GSC: e.g.
 *     `https://cdn.sanity.io/images/<project>/<dataset>/<hash>-1200x630.jpg?w=800&auto=format`
 *     rather than `/_next/image?url=https%3A%2F%2Fcdn.sanity.io%2F...&w=3840&q=75`.
 *  2. The resize + WebP/AVIF conversion runs on Sanity's edge, not Vercel's
 *     image-optimization function — faster TTFB and no quota burn.
 *  3. Same content gets the same URL across pages, so the browser cache hits
 *     more aggressively (no query-string entropy from Next's optimizer).
 *
 * For non-Sanity sources (site logo, legacy salesolution.net/wp-content/* client
 * logos), we return the src as-is. Those are small, static assets — losing
 * Next's optimizer for them is an acceptable trade for the clean URL win.
 */
export default function sanityImageLoader({
  src,
  width,
  quality,
}: {
  src: string
  width: number
  quality?: number
}) {
  if (src.startsWith('https://cdn.sanity.io/')) {
    const base = src.split('?')[0]
    const params = new URLSearchParams()
    params.set('w', String(width))
    params.set('q', String(quality ?? 75))
    params.set('auto', 'format') // Sanity picks WebP / AVIF per request.
    params.set('fit', 'max') // Don't upscale past the source dimensions.
    return `${base}?${params.toString()}`
  }
  return src
}
