/**
 * POST /api/revalidate
 *
 * Sanity webhook target. Fires when a document is created, updated, or
 * deleted. We invalidate any Next.js cache tagged with the document type
 * (e.g. `post`, `guide`) so editorial changes appear within seconds —
 * no redeploy required.
 *
 * Webhook config in Sanity → Manage → API → Webhooks:
 *   - Trigger on:  Create, Update, Delete
 *   - Filter (GROQ): _type in ["post","guide","careerPath","caseStudy","glossaryTerm","siteSettings","service","testimonial","author"]
 *   - Projection:  { _type, "slug": slug.current }
 *
 * caseStudy + glossaryTerm are in the filter so publishing them busts both
 * their detail pages and the sitemap (its fetch is tagged by these _types —
 * see lib/sitemap/data.ts). Omitting them leaves the sitemap stale until the
 * next deploy or the daily cron.
 *   - Secret:      same string as SANITY_WEBHOOK_SECRET in .env.local
 *   - URL:         https://salesolution.net/api/revalidate
 *
 * The secret-validation step uses next-sanity's `parseBody` helper to confirm
 * the request actually came from your Sanity project.
 */
import { parseBody } from 'next-sanity/webhook'
import { revalidateTag } from 'next/cache'
import { NextResponse, type NextRequest } from 'next/server'

type WebhookPayload = {
  _type: string
  slug?: string
}

export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: 'webhook-secret-not-configured' },
      { status: 500 },
    )
  }

  try {
    const { body, isValidSignature } = await parseBody<WebhookPayload>(req, secret)

    if (!isValidSignature) {
      return NextResponse.json(
        { ok: false, error: 'invalid-signature' },
        { status: 401 },
      )
    }

    if (!body?._type) {
      return NextResponse.json(
        { ok: false, error: 'no-type-in-payload' },
        { status: 400 },
      )
    }

    // Next 16: revalidateTag requires a profile. `'max'` = stale-while-revalidate.
    revalidateTag(body._type, 'max')
    if (body.slug) {
      revalidateTag(`${body._type}:${body.slug}`, 'max')
    }

    return NextResponse.json({
      ok: true,
      revalidated: body.slug
        ? [body._type, `${body._type}:${body.slug}`]
        : [body._type],
    })
  } catch (err) {
    console.error('[revalidate] error:', err)
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 },
    )
  }
}
