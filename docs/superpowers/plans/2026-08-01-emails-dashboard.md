# Emails Local Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A read-only, loopback-only operator dashboard for the `emails/` workspace: list health, side pools, blockers, live Smartlead state, audit reports.

**Architecture:** Standalone `node:http` server (`emails/scripts/dashboard.mjs`) serving one static HTML page (`emails/scripts/dashboard.html`) and a JSON API; pure helpers in `emails/scripts/lib/dashboard-data.mjs` with co-located tests. Spec: `docs/superpowers/specs/2026-08-01-emails-dashboard-design.md` (binding — especially its Safety rails section).

**Tech Stack:** Node 20 stdlib (`node:http`, `node:fs`, `node:path`), `emails/scripts/lib/contract.mjs` (`parseCsv`), `scripts/lib/smartlead.mjs` (read functions only), `marked` (existing dep), vanilla JS/CSS frontend. **Zero new dependencies.**

## Global Constraints

- All new files are `.mjs` / `.html` (root `package.json` has no `"type"` field).
- CSVs are parsed ONLY with `parseCsv`/`fromCsv` from `emails/scripts/lib/contract.mjs` — never split on `\n`/`,` (quoted fields embed newlines).
- Server binds `127.0.0.1` explicitly. Every response: `Cache-Control: no-store`. HTML response CSP: `default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; img-src 'self' data:`.
- Smartlead imports restricted to: `listCampaigns, getCampaign, getCampaignAnalytics, listEmailAccounts, listCampaignEmailAccounts` (+ `getWarmupStats` only if Task 2 adds it). Importing any write-capable function is a defect.
- Never read `emails/data/raw/**` or any `_cache/` directory. Never write any file at runtime. Never use `politeFetch` for Smartlead. Never log Smartlead URLs.
- Do NOT modify: `emails/scripts/s4f-sendfix.mjs`, `emails/scripts/lib/manufacturer.mjs`, `emails/handoff/strategy/01-build-plan.md` (concurrent work in progress, uncommitted). `scripts/lib/smartlead.mjs` may ONLY gain one appended read wrapper (Task 2, conditional) — no reformatting, no touching existing lines.
- **No git commits** — leave everything in the working tree (session convention; the operator commits).
- Env values are never echoed; presence checks only (`Boolean(process.env.APOLLO_API_KEY)`).

---

### Task 1: Pure helpers — `dashboard-data.mjs`

**Files:**
- Create: `emails/scripts/lib/dashboard-data.mjs`
- Test: `emails/scripts/lib/dashboard-data.test.mjs`

**Interfaces (Produces — later tasks import these exact names):**

```js
export const LISTS_REGISTRY = [
  { name: 'seated-v3',            glob: 'seated-v3.csv',            stage: 'S4f',  role: 'CURRENT main list', current: true,  browsable: true },
  { name: 'first-send-200',       glob: 'first-send-200.csv',       stage: 'S4',   role: 'first-send cohort',  browsable: true },
  { name: 'first-send-200-routed',glob: 'first-send-200-routed.csv',stage: 'S4f',  role: 'removed from cohort',browsable: true },
  { name: 'sendfix-routed',       glob: 'sendfix-routed-*.csv',     stage: 'S4f',  role: 'routed out of seated-v2', browsable: true },
  { name: 'cohort-e-v1',          glob: 'cohort-e-v1.csv',          stage: 'S4d',  role: 'dealer-email quarantine', browsable: true },
  { name: 'deduped-v7',           glob: 'deduped-v7.csv',           stage: 'S4d',  role: 'current full union', browsable: true },
  { name: 'seated-v2',            glob: 'seated-v2.csv',            stage: 'audit',role: 'superseded', browsable: false },
  { name: 'seated-v1',            glob: 'seated-v1.csv',            stage: 'S4d',  role: 'superseded', browsable: false },
  { name: 'shortlist-v2',         glob: 'shortlist-v2.csv',         stage: 'S4b',  role: 'superseded', browsable: false },
  { name: 'shortlist-v1',         glob: 'shortlist-v1.csv',         stage: 'S4',   role: 'superseded', browsable: false },
  { name: 'deduped-v6',           glob: 'deduped-v6.csv',           stage: 'S4',   role: 'superseded', browsable: false },
  { name: 'deduped-v5',           glob: 'deduped-v5.csv',           stage: 'S4',   role: 'superseded', browsable: false },
  { name: 'deduped-v4',           glob: 'deduped-v4.csv',           stage: 'S3c',  role: 'superseded', browsable: false },
  { name: 'deduped-v3',           glob: 'deduped-v3.csv',           stage: 'S3a',  role: 'superseded', browsable: false },
  { name: 'deduped-v2',           glob: 'deduped-v2.csv',           stage: 'S2',   role: 'superseded', browsable: false },
  { name: 'deduped-v1',           glob: 'deduped-v1.csv',           stage: 'S2',   role: 'superseded', browsable: false },
];
export function latestPools(filenames)            // → [{disposition, file, version}] sorted by disposition
export function aggregateBy(rows, field)          // → [{value, count}] count desc; ''/null/undefined → '(none)'
export function filterRows(rows, criteria)        // criteria: {q, segment, tier, cohort, state} — q: lowercase substring over company, company_display, domain, email, city; others exact-match when non-empty
export function paginate(rows, offset, limit)     // → {total, offset, limit, rows}; limit clamp 1..500 (default 50), offset clamp ≥0
export function sanitizeAccount(raw)              // → fixed projection, see Step 1 test — NEVER passes credential keys
export function sanitizeCampaign(raw, analytics)  // → {id, name, status, gated, created_at, analytics:{<numeric fields only>}}
export function accountWarnings(acct, nowIso)     // → [{status:'serious'|'warning', label}] — expired mailbox, inactive warmup
export function parseArgs(argv, env)              // → {port}: --port N ▸ env.EMAILS_DASHBOARD_PORT ▸ 4688
```

Pure module: no `fs`, no network, no `Date.now()` (times come in as arguments).

- [ ] **Step 1: Write the failing tests** — `emails/scripts/lib/dashboard-data.test.mjs`, node built-in runner, mirroring the style of the existing `*.test.mjs` files in that directory. Cover at minimum (concrete cases; use these literally):

```js
// latestPools
latestPools(['pool-chains.csv','pool-chains-v7.csv','pool-non-us-v9.csv','pool-usaspending-unmatched.csv','notes.md'])
// → [{disposition:'chains',file:'pool-chains-v7.csv',version:7},
//    {disposition:'non-us',file:'pool-non-us-v9.csv',version:9},
//    {disposition:'usaspending-unmatched',file:'pool-usaspending-unmatched.csv',version:0}]
// pattern: /^pool-(.+?)(?:-v(\d+))?\.csv$/ ; non-matching names ignored; unversioned = version 0; v10 beats v9 numerically (not lexically)

// aggregateBy
aggregateBy([{segment:'A'},{segment:'B'},{segment:'A'},{segment:''}], 'segment')
// → [{value:'A',count:2},{value:'B',count:1},{value:'(none)',count:1}]

// filterRows: q matches across the five fields case-insensitively; exact filters compose with q (AND)
// include one row whose company contains an embedded newline to prove filters don't choke on it

// paginate: clamps — paginate(rows, -5, 9999) → offset 0, limit 500; default limit 50 when undefined

// sanitizeAccount — adversarial input MUST strip every credential-ish key:
const dirty = { id:1, from_name:'A', from_email:'a@x.co', smtp_password:'LEAK', imap_password:'LEAK',
  smtp_host:'h', imap_host:'h', api_key:'LEAK', access_token:'LEAK', client_secret:'LEAK',
  is_smtp_success:true, is_imap_success:false, message_per_day:20, daily_sent_count:0, type:'ZOHO',
  warmup_details:{ status:'INACTIVE', total_sent_count:0, warmup_reputation:'0%', blocked_reason:null } };
const clean = sanitizeAccount(dirty);
// assert: JSON.stringify(clean) contains no 'LEAK'; no key of clean matches /pass|secret|token|credential|smtp|imap|api_key/i
//         except exactly is_smtp_success / is_imap_success; warmup fields survive flattened:
//         clean.warmup_status==='INACTIVE', clean.warmup_reputation==='0%', clean.warmup_sent_count===0

// sanitizeCampaign — gated flag:
sanitizeCampaign({id:3750571, name:'Dental — Partner Voice v1 — GATED DRAFT (do not start)', status:'DRAFTED'}, {sent_count:0, open_count:0, nested:{x:1}, note:'str'})
// → gated===true; analytics has only top-level numeric fields (sent_count, open_count), no 'nested', no 'note'
sanitizeCampaign({id:1, name:'Transformation', status:'STOPPED'}, null) // → gated===false, analytics===null

// accountWarnings
accountWarnings({expires_at:'2025-08-18T00:00:00Z', warmup_status:'INACTIVE'}, '2026-08-01T00:00:00Z')
// → contains {status:'serious', label:/expired/i} and {status:'warning', label:/warmup/i}
accountWarnings({expires_at:'2027-01-01T00:00:00Z', warmup_status:'ACTIVE'}, '2026-08-01T00:00:00Z') // → []

// parseArgs
parseArgs(['--port','5001'], {})                          // → {port:5001}
parseArgs([], {EMAILS_DASHBOARD_PORT:'4700'})             // → {port:4700}
parseArgs([], {})                                         // → {port:4688}
parseArgs(['--port','abc'], {})                           // → {port:4688} (invalid falls through)
```

- [ ] **Step 2: Run to verify failure** — `node --test emails/scripts/lib/dashboard-data.test.mjs` → FAIL (module not found).
- [ ] **Step 3: Implement `dashboard-data.mjs`** — minimal code satisfying every test above. `sanitizeAccount` builds the fixed projection `{id, from_name, from_email, type, message_per_day, daily_sent_count, is_smtp_success, is_imap_success, expires_at, warmup_status, warmup_reputation, warmup_sent_count, warmup_spam_count, blocked_reason}` reading nested `warmup_details` when present, then as a belt-and-braces pass deletes any produced key matching `/pass|secret|token|credential|smtp|imap|api_key/i` other than the two booleans.
- [ ] **Step 4: Run tests to green** — `node --test emails/scripts/lib/dashboard-data.test.mjs` → PASS; then `node --test emails/scripts/lib/` → all pre-existing tests still PASS.

### Task 2: Server — `dashboard.mjs`

**Files:**
- Create: `emails/scripts/dashboard.mjs`
- Modify (conditional, additive only): `scripts/lib/smartlead.mjs`

**Interfaces:**
- Consumes: everything in Task 1's Produces block; `parseCsv`/`fromCsv` from `./lib/contract.mjs`; read functions from `../../scripts/lib/smartlead.mjs`; `marked` from root `node_modules`.
- Produces: the HTTP API of the spec, consumed by Task 3's frontend. JSON shapes exactly as specified in the spec's API section.

- [ ] **Step 1: Decide the warmup source.** Run `node scripts/lib/smartlead.mjs accounts` once; inspect whether account objects already carry `warmup_details`/warmup fields. If YES → do not touch `smartlead.mjs` at all. If NO → append (end of exports, matching the file's existing style, queue and redact included) `export function getWarmupStats(accountId)` wrapping `GET /email-accounts/:accountId/warmup-stats`, and use it per account (6 accounts ≈ 6 queued calls).
- [ ] **Step 2: Implement the server.** Requirements, all mandatory:
  - Repo root resolved from `import.meta.url` (`emails/scripts/` → two levels up), so it runs from any cwd. Read-only fs (`readFileSync`, `readdirSync`, `statSync`) — no `writeFileSync`/`mkdir` anywhere in the file.
  - Parse cache: `Map<absPath, {mtimeMs, rows, fields}>`; re-parse only when `statSync(...).mtimeMs` differs (list work is ongoing in parallel — data must stay live).
  - Registry resolution: `LISTS_REGISTRY` globs resolve against `emails/lists/`; `latestPools(readdirSync(sidePools))` entries become browsable registry entries named `pool:<disposition>`. `:name` lookups that miss the registry → 404 JSON `{error:'unknown list'}`. A path-traversal probe (`/api/list/..%2F..%2Fpackage.json`) must hit the registry miss, not the fs.
  - Endpoints (all JSON except `/`): `/` (html file from disk, CSP + no-store headers), `/api/overview`, `/api/list/:name`, `/api/pools`, `/api/segments`, `/api/smartlead`, `/api/reports`, `/api/report/:name` — payload shapes exactly per spec. `/api/overview` details:
    - `lists`: registry entries + live row counts (skip entries whose file is absent: `rows:null`).
    - `pipeline`: S1 SOURCE…S4f SENDFIX all `done` (static); `S5 Apollo enrich` → `blocked` when `!process.env.APOLLO_API_KEY` else `pending`; `S6 Truelist verify` → `blocked` (no key name exists yet); `S7 Export/send` → `pending`, detail notes `emails/exports/` missing when absent.
    - `blockers`: suppression/DNC → glob `emails/data/{suppression,dnc}*.{csv,txt}`, missing → `serious`; `APOLLO_API_KEY` absent → `warning`; static unsigned gates (T1 evidence_depth relaxation; dental §8 copy) → `warning`; warmup → read from the Smartlead cache if warm, else `{status:'warning', detail:'unknown — open Smartlead tab'}`.
    - `conservation`: from newest `emails/data/_sendfix-*.json` (`input`, `output`, `conservation`, `routed.length`) plus recomputed live check `rows(seated-v2) === rows(seated-v3) + routed.length` → `{reported, recomputed:{lhs, rhs, pass}}`.
  - Smartlead assembly: in-memory cache `{fetched_at, payload}`, TTL 120 s, `?refresh=1` busts. On any thrown error → `{ok:false, reason: process.env.SMARTLEAD_API_KEY ? 'error' : 'missing-key', detail: <message only, never a URL>}`. Campaigns capped at 10, each through `sanitizeCampaign(c, analytics)`; accounts through `sanitizeAccount`, each with `warnings: accountWarnings(acct, new Date().toISOString())`.
  - `/api/report/:name`: name must match `/^_[\w.-]+\.md$/` AND exist in a `readdirSync` listing of `emails/data/` (never joined from user input before the listing check); render with `marked.parse()`.
  - Startup log exactly: `emails dashboard → http://127.0.0.1:<port>  (read-only; Ctrl-C to stop)`; `EADDRINUSE` → friendly message suggesting `--port`.
- [ ] **Step 3: Boot + smoke.** `node emails/scripts/dashboard.mjs` then, in order:
  - `curl -s localhost:4688/api/overview` → `lists` entry `seated-v3` has `rows: 2788`; `conservation.recomputed.pass === true`
  - `curl -s "localhost:4688/api/list/seated-v3?limit=2&q=hydraulic"` → 200, `rows.length ≤ 2`, `filtered < total`
  - `curl -s localhost:4688/api/pools` → includes `usaspending-unmatched` and a `chains` entry at version ≥ 7
  - `curl -s -o /dev/null -w '%{http_code}' "localhost:4688/api/list/..%2F..%2Fpackage.json"` → `404`
  - `curl -s localhost:4688/api/smartlead` → `ok:true` with `campaigns` including id `3750571` flagged `gated:true`, and every account object passing `!JSON.stringify(a).match(/password|smtp_host|imap_host/i)` — run that check in the shell.
  - `curl -s localhost:4688/api/segments` → four keys, `by_segment` non-empty.

### Task 3: Frontend — `dashboard.html`

**Files:**
- Create: `emails/scripts/dashboard.html`

**Interfaces:**
- Consumes: Task 2's API verbatim. No other origin (CSP forbids it).

- [ ] **Step 1: Read the dataviz skill references before writing markup** (base dir `/private/tmp/claude-501/bundled-skills/2.1.219/002a48692ce151c3535679455667ac87/dataviz`): `references/palette.md` (take the dark-surface tokens + status palette + one data hue from there), `references/marks-and-anatomy.md` (stat tile + bar specs), `references/anti-patterns.md`. This dashboard is tiles + tables + status chips + single-series horizontal bars — no multi-series charts, no legends, no dual axes.
- [ ] **Step 2: Build the page.** Single file, inline CSS + JS, no external requests. Structure:
  - Header: title `emails · operator dashboard`, subtle `read-only` tag, tab bar **Overview · List · Pools · Smartlead · Reports** (hash-routed: `#overview` etc., so reloads keep the tab).
  - **Overview:** 4 hero stat tiles (label + value + one context line, values in ink not series color): `seated-v3` rows, first-send effective (`200 − routed-cohort rows`), side-pooled total (sum of latest pools), sourced total `32,004` (static, labeled "S1 sourced"). Pipeline board: one row per stage, status chip = icon `✓/·/✕` + word (`done/pending/blocked`) + detail. Blockers list with `serious/warning` chips (icon + word). Lineage table (name, stage, role, rows; `current` row highlighted). Conservation line with PASS/FAIL chip.
  - **List:** dropdown of browsable registry entries (browsable lists + `pool:*` entries from `/api/pools`), search box (debounced 300 ms), four `<select>` filters populated from `/api/segments` (visible only for seated-v3), pager (`offset ± limit`, showing `filtered` / `total`), table of key columns (`company_display ▸ company`, `domain`, `email`, `city`, `state`, `segment`, `tier`, `cohort`, `rank_score`). Row click → drawer listing every non-empty field, grouped: identity (company…phone), provenance (source, source_url, captured, email_source), declaration (`self_declaration*`, verbatim in a `<pre>` with wrapping), classification (disposition…category_*), enrichment (ecommerce_*…size_band), rank/seat (rank_*, segment_scores, tier, cohort, dup_of). **Every data string is inserted via `textContent`** (build DOM nodes, or escape through a single `esc()` used everywhere).
  - **Pools:** table (disposition, file, version, rows) + horizontal bar per pool sized `count / max(count)`: bar height ≤ 12 px, 4 px rounded data-end, 2 px gap, single data hue; count as right-aligned text label in ink. Row click → switches to List tab with that pool selected.
  - **Smartlead:** top banner `Read-only — this tool cannot start campaigns.` Campaigns table: id, name, status, `GATED` chip when `gated`, analytics numerics (sent / opens / replies / bounces) when present. Accounts table: from_email, type, warmup status chip (`ACTIVE` good / other warning), reputation, daily limit, sent today, expires_at (+ `serious` chip when warned). `warnings` from the payload rendered as chips. Refresh button → `?refresh=1`. `ok:false` → single card: `Smartlead offline — <reason>`.
  - **Reports:** left list (name + mtime, newest first), right pane rendering `/api/report/:name` html (this is the ONLY `innerHTML` sink, and it renders repo-generated audit files exclusively).
  - Loading + error states for every fetch (`Failed to load — is the server running?`).
- [ ] **Step 3: Validate the palette.** Run `node "/private/tmp/claude-501/bundled-skills/2.1.219/002a48692ce151c3535679455667ac87/dataviz/scripts/validate_palette.js" "<the chosen hexes>" --mode dark` (surface = the page background you chose, per that script's usage). All checks must PASS (contrast WARN → add visible text labels, which the design already has). If the validator can't run, use `references/palette.md` values verbatim (pre-validated) and say so.
- [ ] **Step 4: Visual check.** With the server running, screenshot all five tabs via the existing Playwright devDep (small throwaway script in the scratchpad, not the repo). Check against `references/anti-patterns.md`: no label collisions, no horizontal overflow, tables scroll within their container.

### Task 4: Wiring — run script + README

**Files:**
- Modify: `package.json` (scripts block, one line)
- Modify: `emails/README.md` (append one section)

- [ ] **Step 1:** Add `"emails:dashboard": "node emails/scripts/dashboard.mjs"` to `package.json` scripts (alphabetical placement if the block is sorted; otherwise end).
- [ ] **Step 2:** Append to `emails/README.md` a `## Dashboard` section: what it is (read-only local cockpit), how to run (`pnpm emails:dashboard` → `http://127.0.0.1:4688`, `--port`/`EMAILS_DASHBOARD_PORT` override), what it can never do (no campaign controls, no writes, loopback-only, Smartlead reads only), where the spec lives.

### Task 5: Full verification

- [ ] **Step 1:** `node --test emails/scripts/lib/` → all PASS (new + pre-existing).
- [ ] **Step 2:** `pnpm test` → still green (root suite unaffected).
- [ ] **Step 3:** `npx eslint emails/scripts/dashboard.mjs emails/scripts/lib/dashboard-data.mjs --no-warn-ignored` → clean (html file is out of lint scope).
- [ ] **Step 4:** Grep guard — this exact command must print nothing:
  `grep -nE "setCampaignStatus|addLeads|saveSequences|upsertWebhook|addEmailAccountsToCampaign|createCampaign|updateCampaignSettings|updateCampaignSchedule|exportLeadsCsv|politeFetch" emails/scripts/dashboard.mjs emails/scripts/dashboard.html emails/scripts/lib/dashboard-data.mjs`
- [ ] **Step 5:** Grep guard for writes — `grep -nE "writeFileSync|appendFileSync|createWriteStream|mkdirSync|\brmSync|renameSync" emails/scripts/dashboard.mjs emails/scripts/lib/dashboard-data.mjs` → nothing.
- [ ] **Step 6:** Re-run the Task 2 Step 3 curl battery end-to-end on a fresh server boot. Record actual outputs.
- [ ] **Step 7:** Confirm `git status` shows ONLY the intended new/modified files (4 new + `package.json` + `emails/README.md`, and `scripts/lib/smartlead.mjs` only if Task 2 Step 1 said NO warmup fields).
