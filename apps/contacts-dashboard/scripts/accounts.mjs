/**
 * accounts — the founder CLI for the contacts dashboard's per-person logins.
 *
 *   node apps/contacts-dashboard/scripts/accounts.mjs invite "<Name>" <email> [--role owner]
 *   node apps/contacts-dashboard/scripts/accounts.mjs promote <email>
 *   node apps/contacts-dashboard/scripts/accounts.mjs revoke <email>
 *   node apps/contacts-dashboard/scripts/accounts.mjs reactivate <email>
 *   node apps/contacts-dashboard/scripts/accounts.mjs list
 *
 * Runs from the repo root with bare Node — PostgREST over fetch with the
 * service-role key, no supabase-js, no node_modules. Reads SUPABASE_URL +
 * SUPABASE_SERVICE_ROLE_KEY from .env.local (repo root), same loader as
 * supabase/anon-check.mjs.
 *
 * `invite` prints the generated password EXACTLY ONCE. Deliver it out-of-band
 * (call, Signal, in person) — it is not stored, not logged, and not
 * recoverable. There is no rotation path here yet: `invite` refuses an email
 * that already has a row and `revoke` only ends access, so a lost password
 * means a future `reset` command or a direct SQL update of password_hash.
 *
 * `promote` is the owner bootstrap: the in-app /admin screen only renders for
 * an owner, so the first owner has to be minted here, not there.
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { generatePassword, hashPassword } from '../lib/auth.mjs'

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')

function loadEnv() {
  const file = resolve(REPO_ROOT, '.env.local')
  if (!existsSync(file)) return
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
  }
}
loadEnv()

const USAGE = `usage:
  node apps/contacts-dashboard/scripts/accounts.mjs invite "<Name>" <email> [--role owner]
  node apps/contacts-dashboard/scripts/accounts.mjs promote <email>
  node apps/contacts-dashboard/scripts/accounts.mjs revoke <email>
  node apps/contacts-dashboard/scripts/accounts.mjs reactivate <email>
  node apps/contacts-dashboard/scripts/accounts.mjs list`

function fail(message) {
  console.error(message)
  process.exit(1)
}

function requireEnv() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    fail('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — add both to .env.local (repo root).')
  }
  return { url: url.replace(/\/$/, ''), key }
}

/** PostgREST call with the service key. Never echoes the key on failure. */
async function rest(env, method, path, body) {
  const res = await fetch(`${env.url}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: env.key,
      Authorization: `Bearer ${env.key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await res.text()
  let json = null
  try { json = text === '' ? null : JSON.parse(text) } catch { /* non-JSON error body */ }
  return { status: res.status, ok: res.ok, json, text }
}

function normalizeEmail(raw) {
  const email = String(raw ?? '').trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail(`Not an email address: ${raw ?? '(missing)'}\n\n${USAGE}`)
  return email
}

/**
 * Pull `--role <value>` out of the args wherever it sits; everything else
 * keeps its order. Validates BEFORE any env or network work — a bad flag
 * should die at the keyboard, not at the database.
 */
function takeRoleFlag(args) {
  const i = args.indexOf('--role')
  if (i === -1) return { rest: args, role: undefined }
  const role = args[i + 1]
  if (!role || !['viewer', 'owner'].includes(role)) {
    fail(`--role must be 'viewer' or 'owner', not '${role ?? '(missing)'}'.\n\n${USAGE}`)
  }
  return { rest: [...args.slice(0, i), ...args.slice(i + 2)], role }
}

async function invite(name, rawEmail, role = 'viewer') {
  if (!name || !String(name).trim()) fail(`invite needs a name and an email.\n\n${USAGE}`)
  const email = normalizeEmail(rawEmail)
  const env = requireEnv()

  // Same generator as the /api/admin/invite route (lib/auth.mjs) — one shape,
  // two doors, out-of-band deliverable either way.
  const password = generatePassword()
  const password_hash = hashPassword(password)

  const res = await rest(env, 'POST', 'accounts', {
    email,
    name: String(name).trim(),
    role,
    password_hash,
    invited_by: 'cli',
  })
  if (res.status === 409 || res.json?.code === '23505') {
    fail(`An account for ${email} already exists. Revoke/reactivate it, or pick another email.`)
  }
  if (!res.ok) fail(`Insert failed (HTTP ${res.status}): ${res.text.slice(0, 300)}`)

  const row = Array.isArray(res.json) ? res.json[0] : res.json
  console.log(`Invited ${row?.name ?? name} <${email}> (role ${row?.role ?? role}).`)
  console.log('')
  console.log(`  password: ${password}`)
  console.log('')
  console.log('Shown this once only — deliver it out-of-band; it is not stored.')
}

async function promote(rawEmail) {
  const email = normalizeEmail(rawEmail)
  const env = requireEnv()
  const res = await rest(env, 'PATCH', `accounts?email=eq.${encodeURIComponent(email)}`, { role: 'owner' })
  if (!res.ok) fail(`Update failed (HTTP ${res.status}): ${res.text.slice(0, 300)}`)
  const rows = Array.isArray(res.json) ? res.json : []
  if (rows.length === 0) fail(`No account with email ${email}.`)
  console.log(`Promoted ${email} to owner — /admin is theirs on their next request.`)
}

async function setStatus(rawEmail, status, verb) {
  const email = normalizeEmail(rawEmail)
  const env = requireEnv()
  const res = await rest(env, 'PATCH', `accounts?email=eq.${encodeURIComponent(email)}`, { status })
  if (!res.ok) fail(`Update failed (HTTP ${res.status}): ${res.text.slice(0, 300)}`)
  const rows = Array.isArray(res.json) ? res.json : []
  if (rows.length === 0) fail(`No account with email ${email}.`)
  console.log(`${verb} ${email}. Status is now '${rows[0].status}' — checked on their next request.`)
}

async function list() {
  const env = requireEnv()
  // password_hash is deliberately NOT selected: this CLI never prints hashes.
  const res = await rest(env, 'GET', 'accounts?select=email,name,role,status,created_at&order=created_at.asc')
  if (!res.ok) fail(`List failed (HTTP ${res.status}): ${res.text.slice(0, 300)}`)
  const rows = Array.isArray(res.json) ? res.json : []
  if (rows.length === 0) {
    console.log('No accounts yet. Start with: invite "<Name>" <email>')
    return
  }
  const width = (field, header) => Math.max(header.length, ...rows.map((r) => String(r[field] ?? '').length))
  const cols = [
    ['email', 'EMAIL'], ['name', 'NAME'], ['role', 'ROLE'], ['status', 'STATUS'], ['created_at', 'CREATED'],
  ]
  console.log(cols.map(([f, h]) => h.padEnd(width(f, h))).join('  '))
  for (const r of rows) {
    console.log(cols.map(([f, h]) => String(r[f] ?? '').padEnd(width(f, h))).join('  '))
  }
}

const [cmd, ...args] = process.argv.slice(2)
switch (cmd) {
  case 'invite': {
    const { rest: positional, role } = takeRoleFlag(args)
    await invite(positional[0], positional[1], role)
    break
  }
  case 'promote':
    await promote(args[0])
    break
  case 'revoke':
    await setStatus(args[0], 'revoked', 'Revoked')
    break
  case 'reactivate':
    await setStatus(args[0], 'active', 'Reactivated')
    break
  case 'list':
    await list()
    break
  default:
    fail(USAGE)
}
