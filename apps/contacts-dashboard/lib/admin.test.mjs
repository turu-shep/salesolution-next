import assert from 'node:assert/strict'
import test from 'node:test'

import {
  adminActionPatch,
  formatDay,
  formatWhen,
  isOwner,
  pageDetail,
  rowActions,
  toAdminAccount,
  toAdminAccounts,
  validateInvite,
} from './admin.mjs'

/** A full RPC row exactly as account_activity_stats() returns it (0004_activity.sql). */
const RPC_ROW = {
  email: 'kate@client.example',
  name: 'Kate',
  role: 'viewer',
  status: 'active',
  created_at: '2026-08-01T09:15:00+00:00',
  last_seen: '2026-08-08T14:32:11.482+00:00',
  visits_7d: '12',
  visits_30d: 40,
  exports_total: '3',
}

// ── isOwner: the ONE owner predicate ────────────────────────────────────────
// The /admin flight-guard, requireOwner(), and the Nav flag all ask this — so
// the non-owner path of every admin surface is exercised right here.

test('isOwner admits an owner account and nothing else', () => {
  assert.equal(isOwner({ id: 'x', email: 'a@b.co', name: 'A', role: 'owner' }), true)
  assert.equal(isOwner({ id: 'x', email: 'a@b.co', name: 'A', role: 'viewer' }), false)
  assert.equal(isOwner({ role: 'Owner' }), false) // roles are exact, not case-folded
  assert.equal(isOwner(null), false)              // signed out
  assert.equal(isOwner(undefined), false)
  assert.equal(isOwner({}), false)
  assert.equal(isOwner('owner'), false)           // a string is not an account
})

// ── toAdminAccount: the serialization boundary for the stats RPC ────────────

test('toAdminAccount serializes exactly the nine admin keys and nothing else', () => {
  const out = toAdminAccount(RPC_ROW)
  assert.deepEqual(out, {
    email: 'kate@client.example',
    name: 'Kate',
    role: 'viewer',
    status: 'active',
    createdAt: '2026-08-01',
    lastSeen: '2026-08-08 14:32',
    visits7d: 12,
    visits30d: 40,
    exportsTotal: 3,
  })
  assert.deepEqual(
    Object.keys(out).sort(),
    ['createdAt', 'email', 'exportsTotal', 'lastSeen', 'name', 'role', 'status', 'visits30d', 'visits7d'],
  )
})

test('toAdminAccount drops password_hash and anything else a wider read could carry', () => {
  // The RPC never selects password_hash; this proves that even if a future
  // read widened, the hash still could not reach the page.
  const out = toAdminAccount({ ...RPC_ROW, password_hash: 'scrypt$16384$8$1$x$y', id: 'a-uuid', invited_by: 'cli' })
  for (const gone of ['password_hash', 'id', 'invited_by', 'created_at', 'last_seen', 'visits_7d', 'visits_30d', 'exports_total']) {
    assert.equal(gone in out, false, `${gone} must never be serialized`)
  }
})

test('toAdminAccount: a zero-activity account keeps null lastSeen and zero counts', () => {
  const out = toAdminAccount({
    email: 'new@client.example', name: 'New', role: 'viewer', status: 'active',
    created_at: '2026-08-08T00:00:00+00:00', last_seen: null, visits_7d: 0, visits_30d: 0, exports_total: 0,
  })
  assert.equal(out.lastSeen, null)
  assert.equal(out.visits7d, 0)
  assert.equal(out.visits30d, 0)
  assert.equal(out.exportsTotal, 0)
  // A missing row is an empty shell, never a throw.
  assert.equal(toAdminAccount(undefined).email, '')
  assert.equal(toAdminAccount(undefined).lastSeen, null)
})

test('toAdminAccounts maps in RPC order (created asc) and is empty-safe', () => {
  const out = toAdminAccounts([RPC_ROW, { ...RPC_ROW, email: 'z@client.example' }])
  assert.deepEqual(out.map((a) => a.email), ['kate@client.example', 'z@client.example'])
  assert.deepEqual(toAdminAccounts(undefined), [])
  assert.deepEqual(toAdminAccounts([]), [])
})

// ── date formatting: UTC, minute precision at most, null on garbage ─────────

test('formatDay and formatWhen render UTC and never throw on garbage', () => {
  assert.equal(formatDay('2026-08-01T23:59:59+00:00'), '2026-08-01')
  assert.equal(formatWhen('2026-08-08T14:32:11.482+00:00'), '2026-08-08 14:32')
  // A timestamp with an offset lands on its UTC calendar day.
  assert.equal(formatDay('2026-08-01T22:00:00-05:00'), '2026-08-02')
  for (const bad of [null, undefined, '', 'not-a-date', 42, {}]) {
    assert.equal(formatDay(bad), null, String(bad))
    assert.equal(formatWhen(bad), null, String(bad))
  }
})

// ── validateInvite: the invite route's input boundary ───────────────────────

test('validateInvite trims the name, lowercases the email, defaults the role', () => {
  const v = validateInvite({ name: '  Kate Doe ', email: ' Kate@Client.EXAMPLE ' })
  assert.deepEqual(v, { ok: true, name: 'Kate Doe', email: 'kate@client.example', role: 'viewer' })
  assert.equal(validateInvite({ name: 'K', email: 'k@x.co', role: 'owner' }).role, 'owner')
  assert.equal(validateInvite({ name: 'K', email: 'k@x.co', role: 'viewer' }).role, 'viewer')
  assert.equal(validateInvite({ name: 'K', email: 'k@x.co', role: null }).role, 'viewer')
})

test('validateInvite refuses a missing name, a malformed email, an unknown role', () => {
  for (const body of [
    null, undefined, 'a-string', 42,
    {},                                          // everything missing
    { name: '', email: 'k@x.co' },               // empty name
    { name: '   ', email: 'k@x.co' },            // whitespace name
    { name: 42, email: 'k@x.co' },               // non-string name
    { name: 'K' },                               // missing email
    { name: 'K', email: 'nope' },                // no @
    { name: 'K', email: 'a@b' },                 // no dot in domain
    { name: 'K', email: 'a b@c.example' },       // whitespace inside
    { name: 'K', email: 42 },                    // non-string email
    { name: 'K', email: 'k@x.co', role: 'admin' },   // role outside viewer|owner
    { name: 'K', email: 'k@x.co', role: 42 },
    { name: 'K', email: 'k@x.co', role: '' },
  ]) {
    const v = validateInvite(body)
    assert.equal(v.ok, false, JSON.stringify(body))
    assert.equal(typeof v.error, 'string')
    assert.equal('email' in v, false) // a refusal carries no half-validated fields
  }
})

// ── adminActionPatch: action → accounts patch, self-guarded ─────────────────

test('adminActionPatch maps the three actions to their exact patches', () => {
  const me = 'owner@client.example'
  assert.deepEqual(adminActionPatch('revoke', 'kate@client.example', me), {
    ok: true, email: 'kate@client.example', patch: { status: 'revoked' },
  })
  assert.deepEqual(adminActionPatch('reactivate', 'kate@client.example', me), {
    ok: true, email: 'kate@client.example', patch: { status: 'active' },
  })
  assert.deepEqual(adminActionPatch('promote', 'kate@client.example', me), {
    ok: true, email: 'kate@client.example', patch: { role: 'owner' },
  })
})

test('adminActionPatch: an owner can never revoke THEMSELVES — the lockout footgun', () => {
  const v = adminActionPatch('revoke', 'owner@client.example', 'owner@client.example')
  assert.equal(v.ok, false)
  assert.match(v.error, /your own/i)
  // Case and whitespace do not sneak the self-revocation through.
  assert.equal(adminActionPatch('revoke', ' Owner@Client.EXAMPLE ', 'owner@client.example').ok, false)
  // Reactivate/promote on self stay idempotent no-ops, not refusals.
  assert.equal(adminActionPatch('reactivate', 'owner@client.example', 'owner@client.example').ok, true)
  assert.equal(adminActionPatch('promote', 'owner@client.example', 'owner@client.example').ok, true)
})

test('adminActionPatch refuses unknown actions and malformed targets', () => {
  const me = 'owner@client.example'
  for (const action of ['demote', 'delete', 'DROP TABLE', '', null, undefined, 42]) {
    const v = adminActionPatch(action, 'kate@client.example', me)
    assert.equal(v.ok, false, String(action))
    assert.equal('patch' in v, false)
  }
  for (const email of ['', 'nope', 'a@b', null, undefined, 42]) {
    assert.equal(adminActionPatch('revoke', email, me).ok, false, String(email))
  }
})

// ── rowActions: which buttons a row offers, decided server-side ─────────────

test('rowActions: active viewer gets promote + revoke; active owner gets revoke only', () => {
  const me = 'owner@client.example'
  assert.deepEqual(rowActions({ email: 'kate@client.example', role: 'viewer', status: 'active' }, me), ['promote', 'revoke'])
  assert.deepEqual(rowActions({ email: 'other@client.example', role: 'owner', status: 'active' }, me), ['revoke'])
})

test('rowActions: the self row never offers revoke; a revoked row offers reactivate only', () => {
  const me = 'owner@client.example'
  assert.deepEqual(rowActions({ email: 'owner@client.example', role: 'owner', status: 'active' }, me), [])
  assert.deepEqual(rowActions({ email: 'kate@client.example', role: 'viewer', status: 'revoked' }, me), ['reactivate'])
  assert.deepEqual(rowActions({ email: 'other@client.example', role: 'owner', status: 'revoked' }, me), ['reactivate'])
  // Defensive: garbage in, no buttons that could widen anything.
  assert.deepEqual(rowActions(undefined, me), ['reactivate'])
})

// ── pageDetail: the sheet's activity detail string ──────────────────────────

test("pageDetail mirrors the URL bar: '/' on the default lens, lens-qualified otherwise", () => {
  assert.equal(pageDetail('field-advisor'), '/')
  assert.equal(pageDetail('hosebox'), '/?view=hosebox')
})
