/**
 * accounts — the founder CLI for the contacts dashboard's per-person logins.
 *
 *   node apps/contacts-dashboard/scripts/accounts.mjs invite "<Name>" <email>
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
 */
import { randomBytes } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { hashPassword } from '../lib/auth.mjs'

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
  node apps/contacts-dashboard/scripts/accounts.mjs invite "<Name>" <email>
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

async function invite(name, rawEmail) {
  if (!name || !String(name).trim()) fail(`invite needs a name and an email.\n\n${USAGE}`)
  const email = normalizeEmail(rawEmail)
  const env = requireEnv()

  // 20 chars of base64url ≈ 119 bits of entropy — out-of-band deliverable.
  const password = randomBytes(32).toString('base64url').slice(0, 20)
  const password_hash = hashPassword(password)

  const res = await rest(env, 'POST', 'accounts', {
    email,
    name: String(name).trim(),
    password_hash,
    invited_by: 'cli',
  })
  if (res.status === 409 || res.json?.code === '23505') {
    fail(`An account for ${email} already exists. Revoke/reactivate it, or pick another email.`)
  }
  if (!res.ok) fail(`Insert failed (HTTP ${res.status}): ${res.text.slice(0, 300)}`)

  const row = Array.isArray(res.json) ? res.json[0] : res.json
  console.log(`Invited ${row?.name ?? name} <${email}> (role ${row?.role ?? 'viewer'}).`)
  console.log('')
  console.log(`  password: ${password}`)
  console.log('')
  console.log('Shown this once only — deliver it out-of-band; it is not stored.')
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
  case 'invite':
    await invite(args[0], args[1])
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
