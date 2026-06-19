import { revalidatePath, revalidateTag } from 'next/cache'
import { NextResponse, type NextRequest } from 'next/server'

import { CHILD_IDS } from '@/lib/sitemap/registry'

/**
 * GET /api/cron/revalidate-sitemap/
 *
 * Daily Vercel Cron target (see vercel.json). A scheduled, belt-and-suspenders
 * refresh on top of the two passive mechanisms: the publish webhook (instant,
 * for Sanity-backed sections) and the 86400s ISR floor. Also the only thing
 * that proactively rebuilds the static-only children (pages, landing-pages,
 * tools) without a redeploy.
 *
 * Vercel sends the project's CRON_SECRET as `Authorization: Bearer <secret>`.
 * Set CRON_SECRET in the Vercel project env (random, >=16 chars).
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  const authHeader = req.headers.get('authorization')
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  // Bust the shared tag (Sanity-backed sections) and re-render every route
  // (covers the static-only children that carry no fetch tag).
  revalidateTag('sitemap', 'max')
  revalidatePath('/sitemap.xml')
  for (const id of CHILD_IDS) {
    revalidatePath(`/sitemaps/${id}.xml`)
  }

  return NextResponse.json({ ok: true, revalidated: ['sitemap', ...CHILD_IDS] })
}
