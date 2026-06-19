import { getSections } from '@/lib/sitemap/data'
import { BASE, toIndexXml, type IndexChild } from '@/lib/sitemap/registry'

/**
 * GET /sitemap.xml — the root sitemap index.
 *
 * Lists each non-empty child sitemap (/sitemaps/<id>.xml) as a <sitemapindex>.
 * Replaces the former single app/sitemap.ts so Google Search Console reports
 * indexed/excluded counts per content type. robots.ts already points here.
 *
 * Freshness: the 24h ISR floor below, plus on-demand busting — the underlying
 * Sanity fetch is tagged (publish webhook) and the daily cron revalidates this
 * path. See lib/sitemap/data.ts and app/api/cron/revalidate-sitemap/route.ts.
 */
export const revalidate = 86400

export async function GET() {
  const sections = await getSections()

  const children: IndexChild[] = sections
    .filter((s) => s.urls.length > 0)
    .map((s) => {
      const stamps = s.urls
        .map((entry) => entry.lastmod?.getTime())
        .filter((t): t is number => typeof t === 'number')
      return {
        loc: `${BASE}/sitemaps/${s.id}.xml`,
        lastmod: stamps.length ? new Date(Math.max(...stamps)) : new Date(),
      }
    })

  return new Response(toIndexXml(children), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
