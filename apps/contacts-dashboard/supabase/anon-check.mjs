/**
 * anon-check — proves the anon key can read nothing.
 *
 * RLS is enabled with zero policies and the table grants are revoked, so every
 * table must answer an anon-key select with a permission error or an empty set.
 * Run it after every migration change and paste the output into the session log.
 *
 *   node apps/contacts-dashboard/supabase/anon-check.mjs
 *
 * Reads SUPABASE_URL + SUPABASE_ANON_KEY from .env.local. The anon key lives in
 * .env.local ONLY — it is never set in Vercel and the app never reads it.
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

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

const TABLES = [
  'contacts',
  'verify_results',
  'sources_registry',
  'projects',
  'project_status',
  'contacts_staging',
  'verify_results_staging',
  'accounts',
  'export_audit',
]

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_ANON_KEY
if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY — add both to .env.local (repo root).')
  process.exit(1)
}

let leaked = 0
for (const table of TABLES) {
  const res = await fetch(`${url}/rest/v1/${table}?select=*&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  })
  const body = await res.text()
  const rows = res.ok ? JSON.parse(body) : null
  const open = res.ok && Array.isArray(rows) && rows.length > 0
  if (open) leaked++
  console.log(`${table.padEnd(24)} HTTP ${res.status}  ${open ? 'LEAKED ROWS' : 'no rows'}  ${body.slice(0, 120)}`)
}

console.log(leaked === 0 ? '\nPASS — anon reads nothing.' : `\nFAIL — ${leaked} table(s) returned rows to the anon key.`)
process.exit(leaked === 0 ? 0 : 1)
