import { NextResponse, type NextRequest } from 'next/server'

import { validateInvite } from '@/lib/admin.mjs'
import { requireOwner } from '@/lib/auth-server'
import { generatePassword, hashPassword } from '@/lib/auth.mjs'
import { describeError, serverClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/invite — an owner mints a new account. { name, email,
 * role? } in; { ok, password } out, EXACTLY ONCE. The password comes from the
 * same generatePassword() the CLI prints, is scrypt-hashed before the insert,
 * and exists nowhere else afterward: not stored, not logged (the log line
 * below names who invited whom and nothing more), not recoverable. A
 * duplicate email answers 409 — revoke/reactivate the existing account or
 * pick another address; there is no rotation path here.
 */

type InviteChecked = { ok: true; name: string; email: string; role: string } | { ok: false; error: string }

export async function POST(req: NextRequest) {
  const gate = await requireOwner()
  if (gate instanceof Response) return gate

  const body = (await req.json().catch(() => null)) as unknown
  const v = validateInvite(body) as InviteChecked
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 })

  const password = generatePassword()
  const password_hash = hashPassword(password)

  try {
    const db = serverClient()
    const { error } = await db.from('accounts').insert({
      email: v.email,
      name: v.name,
      role: v.role,
      password_hash,
      invited_by: gate.email,
    })
    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: `An account for ${v.email} already exists.` }, { status: 409 })
      }
      throw new Error(describeError(error))
    }
  } catch (err) {
    console.error('[admin] invite failed:', describeError(err))
    return NextResponse.json({ error: 'Invite failed.' }, { status: 500 })
  }

  console.log(`[admin] account=${gate.email} invited=${v.email} role=${v.role} at=${new Date().toISOString()}`)
  return NextResponse.json({ ok: true, password })
}
