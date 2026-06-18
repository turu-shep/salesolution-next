import { buildRoleMapMarkdown } from '@/lib/career-path-map'
import { getCareerPathsForMap } from '@/sanity/lib/career-paths'

/**
 * Human-readable Markdown mirror of the role-map artifact. Served at
 * /career-paths/roles-map/md. Same data + CC BY 4.0 license as the JSON.
 */
export const revalidate = 3600

export async function GET() {
  const paths = await getCareerPathsForMap().catch(() => [])
  return new Response(buildRoleMapMarkdown(paths), {
    headers: {
      'content-type': 'text/markdown; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
