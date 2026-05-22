/**
 * GET /api/draft?sanity-preview-secret=<secret>&sanity-preview-pathname=<path>
 *
 * Hit by Sanity's "Preview" button (and by AI agents that return preview URLs
 * for human review). Validates the signed secret, enables draft mode, then
 * redirects to the target pathname so the page renders with draft data.
 */
import { validatePreviewUrl } from '@sanity/preview-url-secret'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'

import { draftClient } from '@/sanity/lib/draft-client'

export async function GET(req: NextRequest) {
  const { isValid, redirectTo = '/' } = await validatePreviewUrl(
    draftClient.withConfig({ token: process.env.SANITY_API_READ_TOKEN }),
    req.url,
  )

  if (!isValid) {
    return new Response('Invalid or expired preview link', { status: 401 })
  }

  const draft = await draftMode()
  draft.enable()

  // Sanity's `redirectTo` is already validated to be a same-origin path.
  redirect(redirectTo)
}
