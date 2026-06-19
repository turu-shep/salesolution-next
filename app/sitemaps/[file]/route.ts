import { notFound } from 'next/navigation'

import { getSections } from '@/lib/sitemap/data'
import { CHILD_IDS, toUrlsetXml } from '@/lib/sitemap/registry'

/**
 * GET /sitemaps/<id>.xml — a child sitemap (<urlset>) for one content section.
 *
 * The `.xml` suffix in the segment keeps `trailingSlash: true` from appending a
 * slash (Next treats a dotted final segment as a file), so these resolve at
 * /sitemaps/blog.xml with no 308. Listed by the root index at /sitemap.xml.
 */
export const revalidate = 86400

export function generateStaticParams() {
  return CHILD_IDS.map((id) => ({ file: `${id}.xml` }))
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params
  const id = file.replace(/\.xml$/, '')
  if (!(CHILD_IDS as readonly string[]).includes(id)) notFound()

  const section = (await getSections()).find((s) => s.id === id)
  if (!section) notFound()

  return new Response(toUrlsetXml(section.urls), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
