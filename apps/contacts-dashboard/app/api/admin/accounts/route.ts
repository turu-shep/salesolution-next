import { NextResponse, type NextRequest } from 'next/server'

import { adminActionPatch } from '@/lib/admin.mjs'
import { requireOwner } from '@/lib/auth-server'
import { describeError, serverClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/accounts — the three lifecycle actions: { email, action:
 * 'revoke' | 'reactivate' | 'promote' }. adminActionPatch() is the whole
 * policy — action whitelist, email shape, and the self-revocation refusal
 * (the last-owner-lockout footgun) — so the route only wires its verdict to
 * the accounts table. Revocation bites on the target's next request: every
 * request re-checks status, no session hunting required. The update selects
 * email alone back — password_hash never rides an admin read.
 */

type ActionChecked = { ok: true; email: string; patch: Record<string, string> } | { ok: false; error: string }

export async function POST(req: NextRequest) {
  const gate = await requireOwner()
  if (gate instanceof Response) return gate

  const body = (await req.json().catch(() => null)) as { email?: unknown; action?: unknown } | null
  const v = adminActionPatch(body?.action, body?.email, gate.email) as ActionChecked
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 })

  try {
    const db = serverClient()
    const { data, error } = await db.from('accounts').update(v.patch).eq('email', v.email).select('email')
    if (error) throw new Error(describeError(error))
    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'No account with that email.' }, { status: 404 })
    }
  } catch (err) {
    console.error('[admin] account action failed:', describeError(err))
    return NextResponse.json({ error: 'Update failed.' }, { status: 500 })
  }

  console.log(`[admin] account=${gate.email} action=${String(body?.action)} target=${v.email} at=${new Date().toISOString()}`)
  return NextResponse.json({ ok: true })
}
