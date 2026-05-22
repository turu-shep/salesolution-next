import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'

/**
 * GET /api/disable-draft?path=/some/page/
 * Disables draft mode and bounces back to the page so the visitor sees the
 * published version. Wired into the "Exit preview" pill in the site shell.
 */
export async function GET(req: NextRequest) {
  const draft = await draftMode()
  draft.disable()

  const path = req.nextUrl.searchParams.get('path') || '/'
  redirect(path)
}
