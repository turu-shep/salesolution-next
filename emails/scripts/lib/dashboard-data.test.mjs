import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  accountWarnings,
  aggregateBy,
  currentList,
  filterRows,
  latestPools,
  paginate,
  parseArgs,
  resolveRegistry,
  sanitizeAccount,
  sanitizeCampaign,
} from './dashboard-data.mjs'

// ── resolveRegistry ──────────────────────────────────────────────────────────

/** The live `emails/lists/` listing as of 2026-08-02. */
const LISTING = [
  'adaptall-routed-2026-08-01.csv',
  'cohort-e-v1.csv',
  'deduped-v1.csv',
  'deduped-v2.csv',
  'deduped-v3.csv',
  'deduped-v4.csv',
  'deduped-v5.csv',
  'deduped-v6.csv',
  'deduped-v7.csv',
  'first-send-200-routed.csv',
  'first-send-200.csv',
  'seated-v1.csv',
  'seated-v2.csv',
  'seated-v3.csv',
  'seated-v4.csv',
  'seated-v5.csv',
  'sendfix-routed-2026-08-01.csv',
  'shortlist-v1.csv',
  'shortlist-v2.csv',
]

const byName = (entries, name) => entries.find((e) => e.name === name)

test('the newest seated generation on disk is the current list', () => {
  const entries = resolveRegistry(LISTING)
  const current = entries.filter((e) => e.current)
  assert.equal(current.length, 1, 'exactly one current list')
  assert.equal(current[0].name, 'seated-v5')
  assert.equal(current[0].role, 'CURRENT main list')
  assert.equal(current[0].browsable, true)
  assert.equal(current[0].file, 'seated-v5.csv')
  assert.equal(currentList(entries).name, 'seated-v5')
})

test('the current list follows the files, so v5 beats v4 beats v3', () => {
  // The failure this replaced: a hand-written table still said seated-v3 was
  // current a day after the pipeline had moved to v5.
  assert.equal(currentList(resolveRegistry(['seated-v3.csv'])).name, 'seated-v3')
  assert.equal(currentList(resolveRegistry(['seated-v3.csv', 'seated-v4.csv'])).name, 'seated-v4')
  assert.equal(currentList(resolveRegistry(['seated-v3.csv', 'seated-v4.csv', 'seated-v5.csv'])).name, 'seated-v5')
})

test('seated versions compare numerically, so v10 beats v9', () => {
  const entries = resolveRegistry(['seated-v9.csv', 'seated-v10.csv', 'seated-v2.csv'])
  assert.equal(currentList(entries).name, 'seated-v10')
  assert.equal(byName(entries, 'seated-v9').role, 'superseded')
  assert.equal(byName(entries, 'seated-v9').browsable, false)
})

test('superseded seated generations stay listed but are never current or browsable', () => {
  const entries = resolveRegistry(LISTING)
  for (const name of ['seated-v4', 'seated-v3', 'seated-v2', 'seated-v1']) {
    const entry = byName(entries, name)
    assert.ok(entry, `${name} missing from the registry`)
    assert.equal(entry.current, false, `${name} must not be current`)
    assert.equal(entry.browsable, false, `${name} must not be browsable`)
    assert.equal(entry.role, 'superseded')
  }
})

test('known named lists keep their static annotations', () => {
  const entries = resolveRegistry(LISTING)
  const expected = {
    'first-send-200': { stage: 'S4', role: 'first-send cohort', file: 'first-send-200.csv' },
    'first-send-200-routed': { stage: 'S4f', role: 'removed from cohort', file: 'first-send-200-routed.csv' },
    'sendfix-routed': { stage: 'S4f', role: 'routed out of seated-v2', file: 'sendfix-routed-2026-08-01.csv' },
    'adaptall-routed': { stage: 'S4g', role: 'routed out of seated-v3', file: 'adaptall-routed-2026-08-01.csv' },
  }
  for (const [name, want] of Object.entries(expected)) {
    const entry = byName(entries, name)
    assert.ok(entry, `${name} missing`)
    assert.equal(entry.stage, want.stage, `${name} stage`)
    assert.equal(entry.role, want.role, `${name} role`)
    assert.equal(entry.file, want.file, `${name} file`)
    assert.equal(entry.browsable, true, `${name} browsable`)
    assert.equal(entry.current, false, `${name} is not the main list`)
  }
})

test('a date-stamped named list resolves to its newest stamp', () => {
  const entries = resolveRegistry(['sendfix-routed-2026-08-01.csv', 'sendfix-routed-2026-09-14.csv'])
  assert.equal(byName(entries, 'sendfix-routed').file, 'sendfix-routed-2026-09-14.csv')
})

test('the newest deduped generation is the full union, older ones superseded', () => {
  const entries = resolveRegistry(LISTING)
  const live = byName(entries, 'deduped-v7')
  assert.equal(live.role, 'current full union')
  assert.equal(live.browsable, true)
  assert.equal(live.current, false, 'the union is not the sendable list')
  assert.equal(byName(entries, 'deduped-v6').role, 'superseded')
  assert.equal(byName(entries, 'deduped-v6').browsable, false)
})

test('every shortlist generation is superseded, including the newest', () => {
  const entries = resolveRegistry(LISTING)
  for (const name of ['shortlist-v2', 'shortlist-v1']) {
    assert.equal(byName(entries, name).role, 'superseded')
    assert.equal(byName(entries, name).browsable, false)
    assert.equal(byName(entries, name).current, false)
  }
})

test('the newest cohort-e generation stays browsable as the quarantine', () => {
  const entries = resolveRegistry(LISTING)
  const cohort = byName(entries, 'cohort-e-v1')
  assert.equal(cohort.role, 'dealer-email quarantine')
  assert.equal(cohort.stage, 'S4d')
  assert.equal(cohort.browsable, true)
  assert.equal(cohort.current, false)
})

test('a file matching no known pattern is listed as unclassified, never hidden', () => {
  const entries = resolveRegistry([...LISTING, 'mystery-export.csv', 'notes-from-artur.md'])
  for (const name of ['mystery-export', 'notes-from-artur.md']) {
    const entry = byName(entries, name)
    assert.ok(entry, `${name} must still appear`)
    assert.equal(entry.role, 'unclassified')
    assert.equal(entry.stage, '—')
    assert.equal(entry.browsable, false)
    assert.equal(entry.current, false)
  }
  // Nothing on disk is dropped.
  assert.equal(entries.length, LISTING.length + 2)
})

test('resolveRegistry gives every entry a name, file, stage and role, and unique names', () => {
  const entries = resolveRegistry(LISTING)
  for (const entry of entries) {
    assert.ok(entry.name, 'name')
    assert.ok(entry.file, `file for ${entry.name}`)
    assert.ok(entry.stage, `stage for ${entry.name}`)
    assert.ok(entry.role, `role for ${entry.name}`)
  }
  assert.equal(new Set(entries.map((e) => e.name)).size, entries.length, 'names are unique')
  assert.equal(entries.length, LISTING.length, 'one entry per file, nothing dropped or duplicated')
})

test('the current list sorts first so the lineage table leads with it', () => {
  assert.equal(resolveRegistry(LISTING)[0].name, 'seated-v5')
})

test('resolveRegistry handles an empty or junk listing without throwing', () => {
  assert.deepEqual(resolveRegistry([]), [])
  assert.deepEqual(resolveRegistry(null), [])
  assert.deepEqual(resolveRegistry(undefined), [])
  assert.deepEqual(resolveRegistry(['', null, undefined]), [])
  assert.equal(currentList(resolveRegistry([])), null)
  assert.equal(currentList([]), null)
  assert.equal(currentList(null), null)
})

test('resolveRegistry is pure — same listing in, same registry out', () => {
  const a = resolveRegistry(LISTING)
  const b = resolveRegistry([...LISTING].reverse())
  assert.deepEqual(a, b, 'input order must not change the result')
})

// ── latestPools ──────────────────────────────────────────────────────────────

test('latestPools keeps the newest generation per disposition', () => {
  assert.deepEqual(
    latestPools(['pool-chains.csv', 'pool-chains-v7.csv', 'pool-non-us-v9.csv', 'pool-usaspending-unmatched.csv', 'notes.md']),
    [
      { disposition: 'chains', file: 'pool-chains-v7.csv', version: 7 },
      { disposition: 'non-us', file: 'pool-non-us-v9.csv', version: 9 },
      { disposition: 'usaspending-unmatched', file: 'pool-usaspending-unmatched.csv', version: 0 },
    ],
  )
})

test('latestPools compares versions numerically, not lexically', () => {
  // The live side-pools dir has pool-not-a-distributor v6…v10. A string sort
  // picks v9, which is a whole generation of routing decisions out of date.
  const got = latestPools(['pool-not-a-distributor-v9.csv', 'pool-not-a-distributor-v10.csv', 'pool-not-a-distributor-v6.csv'])
  assert.deepEqual(got, [{ disposition: 'not-a-distributor', file: 'pool-not-a-distributor-v10.csv', version: 10 }])
})

test('latestPools ignores names that are not pools', () => {
  assert.deepEqual(latestPools(['seated-v3.csv', 'pool.csv', 'pool-chains.txt', '_report.md']), [])
})

test('latestPools on an empty directory returns an empty list', () => {
  assert.deepEqual(latestPools([]), [])
})

// ── aggregateBy ──────────────────────────────────────────────────────────────

test('aggregateBy counts by value, descending, with a bucket for empties', () => {
  assert.deepEqual(aggregateBy([{ segment: 'A' }, { segment: 'B' }, { segment: 'A' }, { segment: '' }], 'segment'), [
    { value: 'A', count: 2 },
    { value: 'B', count: 1 },
    { value: '(none)', count: 1 },
  ])
})

test('aggregateBy folds null and undefined into the same empty bucket', () => {
  assert.deepEqual(aggregateBy([{ tier: null }, { tier: undefined }, {}, { tier: 'T1' }], 'tier'), [
    { value: '(none)', count: 3 },
    { value: 'T1', count: 1 },
  ])
})

// ── filterRows ───────────────────────────────────────────────────────────────

const ROWS = [
  {
    company: 'acme hydraulic supply',
    company_display: 'Acme Hydraulic Supply',
    domain: 'acmehyd.com',
    email: 'sales@acmehyd.com',
    city: 'Toledo',
    state: 'OH',
    segment: 'A',
    tier: 'T1',
    cohort: null,
  },
  {
    // An embedded newline is what a scraped self_declaration does to a CSV, and
    // company_display inherits it when the source publishes one. A filter that
    // splits or line-scans loses this row silently.
    company: 'bearing world\nindustrial',
    company_display: 'Bearing World\nIndustrial',
    domain: 'bearingworld.com',
    email: 'info@bearingworld.com',
    city: 'Akron',
    state: 'OH',
    segment: 'B',
    tier: 'T2',
    cohort: 'E',
  },
  {
    company: 'cascade mro',
    company_display: 'Cascade MRO',
    domain: 'cascademro.com',
    email: null,
    city: 'Portland',
    state: 'OR',
    segment: 'C',
    tier: 'T1',
    cohort: null,
  },
]

test('filterRows with no criteria returns everything', () => {
  assert.equal(filterRows(ROWS, {}).length, 3)
  assert.equal(filterRows(ROWS, { q: '', segment: '', tier: '', cohort: '', state: '' }).length, 3)
})

test('filterRows q matches company, company_display, domain, email and city case-insensitively', () => {
  assert.deepEqual(filterRows(ROWS, { q: 'HYDRAULIC' }).map((r) => r.domain), ['acmehyd.com'])
  assert.deepEqual(filterRows(ROWS, { q: 'cascademro' }).map((r) => r.domain), ['cascademro.com'])
  assert.deepEqual(filterRows(ROWS, { q: 'info@bearing' }).map((r) => r.domain), ['bearingworld.com'])
  assert.deepEqual(filterRows(ROWS, { q: 'toledo' }).map((r) => r.domain), ['acmehyd.com'])
  assert.deepEqual(filterRows(ROWS, { q: 'Cascade MRO' }).map((r) => r.domain), ['cascademro.com'])
})

test('filterRows q matches across an embedded newline without choking', () => {
  assert.deepEqual(filterRows(ROWS, { q: 'bearing world' }).map((r) => r.domain), ['bearingworld.com'])
  assert.deepEqual(filterRows(ROWS, { q: 'industrial' }).map((r) => r.domain), ['bearingworld.com'])
})

test('filterRows exact filters compose with q as AND', () => {
  assert.deepEqual(filterRows(ROWS, { state: 'OH' }).map((r) => r.domain), ['acmehyd.com', 'bearingworld.com'])
  assert.deepEqual(filterRows(ROWS, { tier: 'T1' }).map((r) => r.domain), ['acmehyd.com', 'cascademro.com'])
  assert.deepEqual(filterRows(ROWS, { cohort: 'E' }).map((r) => r.domain), ['bearingworld.com'])
  assert.deepEqual(filterRows(ROWS, { segment: 'A', state: 'OH' }).map((r) => r.domain), ['acmehyd.com'])
  assert.deepEqual(filterRows(ROWS, { q: 'toledo', tier: 'T1' }).map((r) => r.domain), ['acmehyd.com'])
  assert.deepEqual(filterRows(ROWS, { q: 'toledo', tier: 'T2' }), [])
})

test('filterRows exact filters are exact, not substrings', () => {
  assert.deepEqual(filterRows(ROWS, { tier: 'T' }), [])
  assert.deepEqual(filterRows(ROWS, { state: 'O' }), [])
})

test('filterRows tolerates a null field rather than throwing on it', () => {
  assert.deepEqual(filterRows(ROWS, { q: '@' }).map((r) => r.domain), ['acmehyd.com', 'bearingworld.com'])
})

// ── paginate ─────────────────────────────────────────────────────────────────

test('paginate clamps a hostile offset and limit', () => {
  const rows = Array.from({ length: 1000 }, (_, i) => ({ i }))
  const page = paginate(rows, -5, 9999)
  assert.equal(page.offset, 0)
  assert.equal(page.limit, 500)
  assert.equal(page.total, 1000)
  assert.equal(page.rows.length, 500)
})

test('paginate defaults to 50 per page', () => {
  const rows = Array.from({ length: 120 }, (_, i) => ({ i }))
  const page = paginate(rows, undefined, undefined)
  assert.equal(page.offset, 0)
  assert.equal(page.limit, 50)
  assert.equal(page.rows.length, 50)
  assert.equal(page.rows[0].i, 0)
})

test('paginate slices from the offset and clamps a limit below 1', () => {
  const rows = Array.from({ length: 10 }, (_, i) => ({ i }))
  assert.equal(paginate(rows, 8, 5).rows.length, 2)
  assert.equal(paginate(rows, 8, 5).rows[0].i, 8)
  assert.equal(paginate(rows, 0, 0).limit, 1)
  assert.equal(paginate(rows, 500, 10).rows.length, 0)
})

// ── sanitizeAccount ──────────────────────────────────────────────────────────

const CREDENTIAL_KEY = /pass|secret|token|credential|smtp|imap|api_key/i
const ALLOWED_CREDENTIAL_ISH = new Set(['is_smtp_success', 'is_imap_success'])

test('sanitizeAccount strips every credential-ish key from an adversarial account', () => {
  const dirty = {
    id: 1,
    from_name: 'A',
    from_email: 'a@x.co',
    smtp_password: 'LEAK',
    imap_password: 'LEAK',
    smtp_host: 'h',
    imap_host: 'h',
    api_key: 'LEAK',
    access_token: 'LEAK',
    client_secret: 'LEAK',
    is_smtp_success: true,
    is_imap_success: false,
    message_per_day: 20,
    daily_sent_count: 0,
    type: 'ZOHO',
    warmup_details: { status: 'INACTIVE', total_sent_count: 0, warmup_reputation: '0%', blocked_reason: null },
  }
  const clean = sanitizeAccount(dirty)

  assert.ok(!JSON.stringify(clean).includes('LEAK'), 'no credential value survives serialization')
  for (const k of Object.keys(clean)) {
    if (ALLOWED_CREDENTIAL_ISH.has(k)) continue
    assert.ok(!CREDENTIAL_KEY.test(k), `key "${k}" looks like a credential`)
  }

  assert.equal(clean.id, 1)
  assert.equal(clean.from_email, 'a@x.co')
  assert.equal(clean.type, 'ZOHO')
  assert.equal(clean.is_smtp_success, true)
  assert.equal(clean.is_imap_success, false)
  assert.equal(clean.warmup_status, 'INACTIVE')
  assert.equal(clean.warmup_reputation, '0%')
  assert.equal(clean.warmup_sent_count, 0)
})

test('sanitizeAccount strips the field names the LIVE API actually uses', () => {
  // Probed 2026-08-01: the account object carries bare `password`, `username`,
  // `imap_username`, `imap_password`, `smtp_host`/`imap_host` and ports. The
  // projection is a whitelist precisely so a rename upstream cannot leak.
  const live = {
    id: 2300021,
    from_email: 'a@salesolution.co',
    username: 'a@salesolution.co',
    password: 'LEAK',
    imap_username: 'a@salesolution.co',
    imap_password: 'LEAK',
    smtp_host: 'smtp.zoho.com',
    imap_host: 'imap.zoho.com',
    smtp_port: 465,
    imap_port: 993,
    custom_tracking_domain: 'x',
    signature: 'LEAK-SIGNATURE',
  }
  const clean = sanitizeAccount(live)
  const json = JSON.stringify(clean)
  assert.ok(!json.includes('LEAK'), 'no credential or signature value survives')
  assert.ok(!json.includes('zoho.com'), 'no mail host survives')
  assert.equal(clean.username, undefined)
  assert.equal(clean.password, undefined)
  assert.equal(clean.custom_tracking_domain, undefined)
})

test('sanitizeAccount reads flat warmup fields when warmup_details is absent', () => {
  const clean = sanitizeAccount({ id: 2, warmup_status: 'ACTIVE', warmup_reputation: '98%', expires_at: '2027-01-01T00:00:00Z' })
  assert.equal(clean.warmup_status, 'ACTIVE')
  assert.equal(clean.warmup_reputation, '98%')
  assert.equal(clean.expires_at, '2027-01-01T00:00:00Z')
})

test('sanitizeAccount survives junk input', () => {
  assert.deepEqual(Object.keys(sanitizeAccount(null)).length > 0, true)
  assert.equal(sanitizeAccount(null).id, null)
})

// ── sanitizeCampaign ─────────────────────────────────────────────────────────

test('sanitizeCampaign flags the gated dental draft and keeps numeric analytics only', () => {
  const c = sanitizeCampaign(
    { id: 3750571, name: 'Dental — Partner Voice v1 — GATED DRAFT (do not start)', status: 'DRAFTED' },
    { sent_count: 0, open_count: 0, nested: { x: 1 }, note: 'str' },
  )
  assert.equal(c.gated, true)
  assert.equal(c.id, 3750571)
  assert.equal(c.status, 'DRAFTED')
  assert.deepEqual(Object.keys(c.analytics).sort(), ['open_count', 'sent_count'])
  assert.equal(c.analytics.nested, undefined)
  assert.equal(c.analytics.note, undefined)
})

test('sanitizeCampaign leaves an ordinary campaign ungated and a missing analytics null', () => {
  const c = sanitizeCampaign({ id: 1, name: 'Transformation', status: 'STOPPED' }, null)
  assert.equal(c.gated, false)
  assert.equal(c.analytics, null)
})

test('sanitizeCampaign gates on the id as well as the name', () => {
  assert.equal(sanitizeCampaign({ id: 3750571, name: 'renamed since', status: 'DRAFTED' }, null).gated, true)
  assert.equal(sanitizeCampaign({ id: 9, name: 'do not start yet', status: 'DRAFTED' }, null).gated, true)
  assert.equal(sanitizeCampaign({ id: 9, name: 'gated pilot', status: 'DRAFTED' }, null).gated, true)
})

test('sanitizeCampaign coerces the string counters the live API returns', () => {
  // Probed 2026-08-01: GET /campaigns/:id/analytics returns every counter as a
  // STRING ("0", "12"). A strict typeof-number filter would empty the panel.
  const c = sanitizeCampaign({ id: 1, name: 'x', status: 'ACTIVE' }, { sent_count: '12', open_count: '3', created_at: '2026-08-01T00:00:00Z', client_id: null, note: 'str' })
  assert.equal(c.analytics.sent_count, 12)
  assert.equal(c.analytics.open_count, 3)
  assert.equal(c.analytics.created_at, undefined, 'a date string is not a counter')
  assert.equal(c.analytics.client_id, undefined, 'null is not a counter')
  assert.equal(c.analytics.note, undefined)
})

test('sanitizeCampaign drops numeric identifiers from analytics', () => {
  // `user_id` is a number and not an aggregate. The campaign id already rides
  // at the top level; the workspace id has no business in a browser.
  const c = sanitizeCampaign({ id: 1, name: 'x', status: 'ACTIVE' }, { id: 1, user_id: 48733, team_member_id: 2, sent_count: 5 })
  assert.deepEqual(Object.keys(c.analytics), ['sent_count'])
  assert.equal(c.id, 1, 'the campaign id survives where it belongs')
})

test('sanitizeCampaign never forwards campaign internals', () => {
  const c = sanitizeCampaign({ id: 1, name: 'x', status: 'ACTIVE', user_id: 7, client_id: 3, scheduler_cron_value: { tz: 'X' } }, null)
  assert.deepEqual(Object.keys(c).sort(), ['analytics', 'created_at', 'gated', 'id', 'name', 'status'])
})

// ── accountWarnings ──────────────────────────────────────────────────────────

test('accountWarnings reports an expired mailbox as serious and a stalled warmup as a warning', () => {
  const w = accountWarnings({ expires_at: '2025-08-18T00:00:00Z', warmup_status: 'INACTIVE' }, '2026-08-01T00:00:00Z')
  assert.ok(w.some((x) => x.status === 'serious' && /expired/i.test(x.label)), 'expired mailbox')
  assert.ok(w.some((x) => x.status === 'warning' && /warmup/i.test(x.label)), 'warmup')
})

test('accountWarnings is silent on a healthy account', () => {
  assert.deepEqual(accountWarnings({ expires_at: '2027-01-01T00:00:00Z', warmup_status: 'ACTIVE' }, '2026-08-01T00:00:00Z'), [])
})

test('accountWarnings does not invent a warning from missing data', () => {
  assert.deepEqual(accountWarnings({}, '2026-08-01T00:00:00Z'), [])
  assert.deepEqual(accountWarnings({ expires_at: 'not-a-date', warmup_status: 'ACTIVE' }, '2026-08-01T00:00:00Z'), [])
})

test('accountWarnings flags a failed smtp or imap connection', () => {
  const w = accountWarnings({ is_smtp_success: false, warmup_status: 'ACTIVE' }, '2026-08-01T00:00:00Z')
  assert.ok(w.some((x) => x.status === 'serious'), 'a mailbox that cannot connect cannot send')
})

// ── parseArgs ────────────────────────────────────────────────────────────────

test('parseArgs takes --port first, then the env var, then 4688', () => {
  assert.deepEqual(parseArgs(['--port', '5001'], {}), { port: 5001 })
  assert.deepEqual(parseArgs([], { EMAILS_DASHBOARD_PORT: '4700' }), { port: 4700 })
  assert.deepEqual(parseArgs([], {}), { port: 4688 })
  assert.deepEqual(parseArgs(['--port', 'abc'], {}), { port: 4688 })
})

test('parseArgs accepts --port=N and rejects out-of-range ports', () => {
  assert.deepEqual(parseArgs(['--port=5002'], {}), { port: 5002 })
  assert.deepEqual(parseArgs(['--port', '0'], {}), { port: 4688 })
  assert.deepEqual(parseArgs(['--port', '70000'], {}), { port: 4688 })
  assert.deepEqual(parseArgs(['--port'], {}), { port: 4688 })
})

test('parseArgs falls through a bad flag to a good env var', () => {
  assert.deepEqual(parseArgs(['--port', 'abc'], { EMAILS_DASHBOARD_PORT: '4700' }), { port: 4700 })
  assert.deepEqual(parseArgs([], { EMAILS_DASHBOARD_PORT: 'nope' }), { port: 4688 })
})
