import { buildRoleMapJson } from '@/lib/career-path-map'
import { getCareerPathsForMap } from '@/sanity/lib/career-paths'

/**
 * Open downloadable role-map artifact (JSON). Served at /career-paths/roles-map.
 * Markdown mirror is at /career-paths/roles-map/md. Linked from /llms.txt.
 */
export const revalidate = 3600

export async function GET() {
  const paths = await getCareerPathsForMap().catch(() => [])
  return new Response(JSON.stringify(buildRoleMapJson(paths), null, 2), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
