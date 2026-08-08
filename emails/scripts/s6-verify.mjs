/**
 * s6-verify — verify send targets with NeverBounce (stage S6).
 *
 *   node emails/scripts/s6-verify.mjs                 # pilot batch emails + S5 contacts
 *   node emails/scripts/s6-verify.mjs --list full     # every email on seated-v9
 *
 * Nothing sends without a `valid` verdict (2% bounce kill line — raw lists
 * bounce 20–40%). This runner:
 *
 *   1. collects target emails — default: every `email` in the latest pilot
 *      export batches + every S5 Apollo contact email; `--list full`: every
 *      non-empty `email` on seated-v9.csv plus the S5 contacts;
 *   2. skips emails already present in the cumulative results file (verified
 *      once = verified; re-verify deliberately, not accidentally);
 *   3. runs ONE NeverBounce bulk job (supplied data, auto-parse, auto-start),
 *      polls to completion, downloads all results;
 *   4. writes emails/data/neverbounce-results-<date>.csv (this run) and merges
 *      emails/data/verify-results.csv (cumulative, keyed by email, latest
 *      wins) — the overlay the S7 exporter joins at pull time.
 *
 * Costs 1 credit per net-new verification. Balance is printed before and
 * after so spend is visible in the log.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseCsv, toCsv } from '../../scripts/lib/csv.mjs'
import { accountInfo, createJob, jobResults, waitForJob } from './lib/neverbounce.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const DATA = resolve(ROOT, 'emails/data')
const TODAY = new Date().toISOString().slice(0, 10)
const CUMULATIVE = join(DATA, 'verify-results.csv')

const args = process.argv.slice(2)
const listKey = args.includes('--list') ? args[args.indexOf('--list') + 1] : 'pilot'

const lower = (e) => String(e || '').trim().toLowerCase()

function collectTargets() {
  const emails = new Set()
  if (listKey === 'pilot') {
    const previews = readdirSync(resolve(ROOT, 'emails/exports')).filter((d) => d.startsWith('pilot-preview-')).sort()
    if (!previews.length) throw new Error('no pilot-preview-* export found — run s7-export.mjs first')
    const batchDir = resolve(ROOT, 'emails/exports', previews.at(-1), 'batches')
    for (const f of readdirSync(batchDir).filter((f) => f.endsWith('.csv')))
      for (const r of parseCsv(readFileSync(join(batchDir, f), 'utf8'))) if (r.email) emails.add(lower(r.email))
  } else if (listKey === 'full') {
    for (const r of parseCsv(readFileSync(resolve(ROOT, 'emails/lists/seated-v9.csv'), 'utf8')))
      if (r.email) emails.add(lower(r.email))
  } else {
    throw new Error(`unknown --list ${listKey}; use pilot | full`)
  }
  const s5 = join(DATA, `s5-apollo-contacts-2026-08-02.csv`)
  if (existsSync(s5)) for (const r of parseCsv(readFileSync(s5, 'utf8'))) if (r.email) emails.add(lower(r.email))
  return [...emails]
}

;(async () => {
  const before = await accountInfo()
  console.log(`credits before: ${before.credits_info?.paid_credits_remaining} paid / ${before.credits_info?.free_credits_remaining} free`)

  const targets = collectTargets()
  const prior = existsSync(CUMULATIVE) ? parseCsv(readFileSync(CUMULATIVE, 'utf8')) : []
  const seen = new Set(prior.map((r) => lower(r.email)))
  const fresh = targets.filter((e) => !seen.has(e))
  console.log(`targets ${targets.length} (${listKey}) · already verified ${targets.length - fresh.length} · to verify ${fresh.length}`)

  let runRows = []
  if (fresh.length) {
    const created = await createJob(fresh, `s6-${listKey}-${TODAY}`)
    const jobId = created.job_id
    if (!jobId) throw new Error(`jobs/create returned no job_id: ${JSON.stringify(created).slice(0, 200)}`)
    console.log(`job ${jobId} created (${fresh.length} emails) — polling…`)
    await waitForJob(jobId)
    runRows = (await jobResults(jobId)).map((r) => ({ ...r, email: lower(r.email), verified_date: TODAY }))
    if (runRows.length !== fresh.length)
      console.log(`⚠ results ${runRows.length} ≠ submitted ${fresh.length} (duplicates/bad syntax collapse in parse — reconciling by email)`)
    writeFileSync(join(DATA, `neverbounce-results-${TODAY}.csv`), toCsv(runRows, ['email', 'result', 'flags', 'suggested', 'verified_date']))
  } else {
    console.log('nothing new to verify')
  }

  // Cumulative merge, latest wins, then field-for-field readback.
  const merged = new Map(prior.map((r) => [lower(r.email), { email: lower(r.email), result: r.result, flags: r.flags || '', suggested: r.suggested || '', verified_date: r.verified_date || '' }]))
  for (const r of runRows) merged.set(r.email, r)
  const out = [...merged.values()].sort((a, b) => a.email.localeCompare(b.email))
  writeFileSync(CUMULATIVE, toCsv(out, ['email', 'result', 'flags', 'suggested', 'verified_date']))
  const reread = parseCsv(readFileSync(CUMULATIVE, 'utf8'))
  if (reread.length !== out.length) throw new Error(`readback: ${reread.length} ≠ ${out.length}`)
  out.forEach((rec, i) => {
    for (const k of ['email', 'result', 'flags', 'suggested', 'verified_date'])
      if ((reread[i][k] ?? '') !== String(rec[k] ?? '')) throw new Error(`readback diff at row ${i} field ${k}`)
  })

  const counts = {}
  for (const r of out) counts[r.result] = (counts[r.result] || 0) + 1
  console.log(`cumulative verify-results.csv: ${out.length} emails — ${Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(' · ')}`)

  const after = await accountInfo()
  console.log(`credits after: ${after.credits_info?.paid_credits_remaining} paid (spent ~${(before.credits_info?.paid_credits_remaining ?? 0) - (after.credits_info?.paid_credits_remaining ?? 0)})`)
  console.log('Re-run the S7 export now — it joins verify-results.csv at pull time; only `valid` rows batch.')
})().catch((e) => {
  console.error('ERROR:', e.message)
  process.exit(1)
})
