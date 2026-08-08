# Dashboard extension — three new tabs over the whole asset

> **STATUS (2026-08-07):** Partly built, and the rest moved to a deployed app.
> **Phase 3 (Everything) is built in the local dashboard**, along with the
> Phase 1 registry + unified-loader work it depends on. **Phases 2 (Sources)
> and 4 (Projects) are not built locally and will not be** — they get built
> once, in the deployed app, per `01-vercel-transfer.md`. Read their specs
> below as the requirements for that build: the tab behavior survives the move
> unchanged, only the storage under it changes (CSV-on-request → Postgres).
> `emails/data/projects/` does not exist and is not created; the Phase 4
> overlay model moves to `projects` + `project_status` tables.
>
> **The local five-tab server stays the ops cockpit** — Smartlead, Reports,
> blockers, the send pipeline, loopback-only, no auth. The deployed app is the
> asset view. Two surfaces, different jobs.
>
> **AMENDMENT 2 (2026-08-07, later the same day) reverses the deployed app to
> client-facing.** One deployment, not three; an in-app Field Advisor / Hosebox
> switcher, not two env-pinned subdomains; per-person logins, not a shared
> password behind Vercel Authentication; Apollo and every person/sendable field
> out. See `02-client-view.md` §AMENDMENT 2 — **it wins over everything else in
> this folder.** The paragraph above is unaffected: the local cockpit does not
> change, and this file's Phase 1–4 tab specs still stand as written, except
> that Pools is founder vocabulary and stays off the client surface.

**Prompts in this folder**

| File | What it is |
|---|---|
| `00-README.md` | This file. The tab specs (Phases 1–4) and the rails they inherit. Phases 2 and 4 are now requirements for the deployed app. |
| `01-vercel-transfer.md` | Ship the asset view: Supabase free tier, a sync script, `apps/contacts-dashboard/` as a second Vercel project, two auth walls. Gated on T-G1..T-G3. **Governs the INTERNAL deployment.** |
| `02-client-view.md` | The same app deployed as **one client-facing location view** with an in-app Field Advisor / Hosebox switcher. Adds the locations sheet: filters, named provenance, the three location counters, CSV export. **Read §AMENDMENT 2 first — it is the current spec and supersedes both AMENDMENT 1 and the original body.** C-G1 re-opened and answered (`dfs`-only rows kept, risk accepted; Apollo/person fields out), C-G3 replaced (one deployment, per-person logins, Deployment Protection OFF). |
| `03-prompt.md` | **The session prompt — start here to build it.** Thin by design: the work is the implementation plan at `docs/superpowers/plans/2026-08-07-contacts-dashboard-deploy.md` (10 TDD tasks, every path and command spelled out) — **whose Tasks 5 and 9 AMENDMENT 2 sends back for re-planning, and whose Tasks 6 and 8 it amends.** `00`/`01`/`02` are the why. Names the four founder gates: Supabase project + keys, one Vercel project, one DNS record, the initial account list. |

## Prerequisite reading, in order

1. `emails/README.md` §Dashboard — what it does and what it refuses to do.
2. `docs/superpowers/specs/2026-08-01-emails-dashboard-design.md` — the design
   and the six binding safety rails. Rails 1–6 survive this work unchanged.
3. `emails/scripts/lib/dashboard-data.mjs` — the pure half. `resolveRegistry`,
   `latestPools`, `POOL_FILE`, `aggregateBy`, `filterRows`, `paginate`, and the
   two Smartlead whitelists.
4. `emails/scripts/dashboard.mjs` — the I/O half. Read the header comment
   before writing a line; the three rails are stated there and two of them are
   enforced by grep guards.
5. `emails/handoff/industrial-contact-list/00-README.md` — the source registry
   and the new-source rule. Phase 2 parses this pack's per-source folders, whose
   names carry the readiness status.

---

## What exists today, and what this adds

The dashboard shows the **send pipeline**: seated list, side pools, blockers,
Smartlead, audit reports. Five tabs, read-only, loopback-bound, ~2,773 rows in
the main view (`seated-v9` since the 2026-08-03/04 roll-up retags + AD
fold-in — resolve the count from the current generation, never hardcode it).

What it does not show is **the asset** — 35,714 rows across 12 current files,
where each one came from, and what any given project has done with it. Three new
tabs, one existing server:

| Tab | Question it answers |
|---|---|
| **Sources** | Where did all of this come from, how much is left in each place, and is anything arriving from a source nobody documented? |
| **Everything** | One view over all 35,714 rows with real filters, and the three counts that must never be conflated. |
| **Projects** | What has each project done with its slice, without a project column existing in the master data. |

**Extend this dashboard. Do not build a second one.** A second cockpit means two
registries, two safety postures, and a coin flip about which one is current.

---

## Phase 1 — Registry + schema tolerance

Everything else reads through this. Do it first and test it hard.

### Tasks

**1.1 — Current-generation resolver** (`lib/dashboard-data.mjs`, pure)

```
currentGeneration(listFilenames, poolFilenames)
  → { seated: <registry entry>, pools: [{disposition, file, version}, …] }
```

Reuse `resolveRegistry` for the seated side and `latestPools` for the pools.
Write no new version-resolution logic — `POOL_FILE` already compares versions
numerically, which is exactly the bug that would otherwise serve
`pool-not-a-distributor-v9` while v10 sits next to it. Expect 1 + 11 files:
seated-v5 plus ranked-out, segment-w, usaspending-unmatched, not-a-distributor,
small-shops, adjacent-trades, chains, duplicate-sites, non-us, above-ceiling,
identity-backlog.

**1.2 — Unified loader** (`dashboard.mjs`, I/O)

Read all 12 through the existing `readTable`. Tag every row with its origin
(`_list`: the registry name, `_file`: the basename) at parse time — after that
point a row must never need to be traced back by inspection.

`ROW_CACHE_MAX` is 4. Twelve files do not fit, so the unified index thrashes if
it goes through the same cache. Hold the unified index as its own entry keyed on
`max(mtimeMs)` across the 12 inputs, and rebuild only when that maximum moves.

**1.3 — Domain-level dedupe with pool chips** (pure)

```
unifyByDomain(taggedRows)
  → [{ domain, rows: [...], pools: ['seated','ranked-out',…], seated: bool, …}]
```

- Normalize before grouping: lowercase, strip `www.`, trim. Do not strip
  anything else — this is a join key, not a canonicalizer.
- **9,006 rows carry no domain.** They must not collapse into one enormous
  company. Bucket them individually with a synthetic key and a
  `domain: null` flag, and count them separately everywhere.
- Side pools overlap each other; only the seated list is exclusive. A domain in
  three pools gets three chips and counts **once**.

**1.4 — Verify join**

`emails/data/verify-results.csv` is `email,result,flags,suggested,verified_date`.
Index by lowercased email; attach the verdict to every row whose email matches.

An email absent from that file gets verdict `null`, never `"unknown"`.
`unknown` is a real NeverBounce verdict held by 770 rows, and merging the two
turns "we have not checked" into "we checked and could not tell."

**1.5 — Column tolerance**

Generations run 23 → 56 columns. Never index by position. Treat a missing column
as `null`, never `""` or `0`. A pool file that predates `size_band` must render,
not throw.

### Acceptance

- [ ] `node --test emails/scripts/lib/` green, including: a pool file with no
      `size_band` column at all; one domain appearing in three pools plus
      seated; two rows with an empty domain not merging; a `www.` and a bare
      form of the same domain merging.
- [ ] Unified totals reconcile against recon 2026-08-03 — 35,714 rows / 23,579
      unique domains / 9,006 no-domain. If the files have moved since, the check
      is that the three are internally consistent (`unique + no-domain` accounts
      for every row), not that they equal these literals.
- [ ] Verify join, **scoped to seated rows with an email**, reproduces
      366 valid / 280 catchall / 770 unknown / 51 invalid. Note: the full
      `verify-results.csv` holds 1,566 verifications (422 valid) — joining the
      whole file is the wrong denominator and will fail this check. The seated
      quartet sums to 1,467 against 1,466 seated emailed rows; the join must
      surface that ±1 (likely a duplicate-email row), not round it away.
- [ ] Both grep guards still print nothing.

---

## Phase 2 — Sources tab

### Tasks

**2.1 — Token scan.** `source` is a pipe chain (`timken|dfs|serp`). Split on
`|`, trim, drop empties. Per token, across the current generation:

- rows contributed, broken out **per pool** (seated / each of the 11)
- unique domains contributed, and how many of those it contributed *alone*
  (sole-source domains — the number that says what would be lost if the source
  were dropped)
- fill contributed: rows with email, rows with domain, rows with a named person
- last `captured` date across its rows

**2.2 — Handoff join.** **Sources in this pack are directories, not files.**
Enumerate the pack directory and keep every entry matching:

```
^(?<token>.+) \[(?<status>[A-Z-]+)\]$
```

`dfs [DONE-DEEP]`, `adaptall [RETIRED-TO-LOOKUPS]`, `ptda [IN-PROGRESS]`. The
token may contain hyphens, so the token group is greedy up to the space-bracket;
anchor both ends. Non-matching directories (`dashboard/`) are not sources.

**The status is the one in the directory name.** That is the founder's status
board — it is what he reads without opening anything, so it is what the tab
shows. Cross-check it against the §5 registry row inside
`<dir>/00-README.md`, and **render a warning chip on any row where the two
disagree** rather than picking a winner: a mismatch means the completion ritual
was half-done (folder renamed, row not updated, or the reverse), and silently
preferring one hides the defect that needs fixing.

Registry rows are read from the glob `*/00-README.md`, and each dossier's
`> **STATUS (date):**` banner supplies the date and the one-line summary. Show
status, last pull, est. left on table, and the folder path as text (display it;
do not fetch or render it — the Reports tab's `marked` path is scoped to
`emails/data/` and stays that way).

**2.3 — The NEW badge.** Any token present in data with **no directory matching
`{token} [*]`** renders a `NEW` badge pinned to the top of the tab. Match on the
token only — status is irrelevant to the badge, so a rename from
`[NOT-STARTED]` to `[IN-PROGRESS]` must not make the badge flicker back. This is
the founder's mechanism for "tell me when we're pulling from somewhere I don't
know about." No dismiss control — the badge clears by someone creating the
folder.

The inverse renders as `PLANNED`, not an error: a handoff folder with no data
token is a source that has not run yet.

**2.4 — Checkmark columns.** Five, derived, never hand-maintained:

| Column | Derivation |
|---|---|
| validated | registry status is not `NOT-*`, **or** a research/validation doc names the token |
| harvested | raw rows > 0 |
| enriched | token appears in an enrichment output under `emails/data/enrichment/` |
| verified | the token contributes ≥1 row carrying a verify verdict |
| seated | seated count > 0 |

Render each as icon **plus** word. Never color alone (design spec §UI).

### Acceptance

- [ ] 21 data tokens listed; 24 source rows from the registry represented; the
      3 workstream folders show `PLANNED`, not `NEW`.
- [ ] Deleting or renaming any `{token} [*]` directory away from its token makes
      that token show `NEW` on the next request. Restoring it clears the badge.
      No restart.
- [ ] Renaming a directory's **status only** (`dfs [DONE-DEEP]` →
      `dfs [IN-PROGRESS]`) changes the displayed status and does **not** raise a
      NEW badge.
- [ ] A directory whose folder status and §5 registry-row status disagree
      renders the mismatch warning chip, naming both values.
- [ ] Per-token seated counts sum to more than the current seated count
      (2,773 in `seated-v9`; multi-source rows), and the sole-source column is
      strictly less than the domains column.
- [ ] A token with a malformed or missing STATUS banner renders as
      `status: unparsed`, not a 500. A directory with no `00-README.md` at all
      renders as `status: unparsed` too, not a crash.

---

## Phase 3 — Everything tab

The unified view. 35,714 rows.

### Tasks

**3.1 — Three counters, always visible**, never collapsed into one hero number:

```
companies  unique domains          people  named contacts          sendable  verify = valid
```

They move together as filters change. Label each with what it counts. The whole
point of showing three is that 23,579 and 366 are both true and 64× apart.

**3.2 — Filters.**

- **Size (proxy)** — a grouped header carrying the caption, verbatim and
  always visible, not on hover: *"revenue data does not exist yet — these are
  proxies."* Under it: `size_band`, `location_count`, `sku_estimate`.
  `sku_estimate` is ~52% unknown and 0.60 precise where present; show the
  unknown share next to the control so nobody filters on it thinking it is a
  census.
- segment · tier · state · disposition · source token · verify verdict ·
  has-named-person

There is **no revenue tile and no revenue filter** until 3.4 lands. Do not
compute one from proxies under any label.

**3.3 — Scale.** 35,714 rows and ~56 columns will not render as a table.
Paginate through the existing `paginate` (cap 500) or virtualize. Filter
server-side against the unified index; do not ship 35K rows to the browser and
filter there.

**3.4 — Per-company drill-down.** Click a domain:

- every row across every pool, with its pool chip
- full provenance per row: the `source` pipe chain rendered as separate tokens,
  `source_url` as a clickable link, `captured` date. Provenance is 100% filled
  on every current file; a blank here is a bug, so render it as one.
- project statuses from the Phase 4 overlays
- verify verdict + verified date where present

All strings render via `textContent`. `self_declaration_verbatim` is scraped,
untrusted, and carries embedded newlines (design spec rail 6).

**3.5 — The revenue upgrade interface.**

When a file matching `emails/data/enrichment/apollo-orgs-*.csv` exists, the
dashboard joins it by domain, enables a real revenue filter, and demotes the
proxy caption from "revenue data does not exist yet" to "proxies, superseded by
enrichment where available."

**File contract — the `apollo-enrichment` handoff produces exactly this:**

```
emails/data/enrichment/apollo-orgs-<YYYY-MM-DD>.csv

domain,annual_revenue,employees,captured,source
```

| Column | Rule |
|---|---|
| `domain` | apex, lowercase, no `www.` — the join key. Required. |
| `annual_revenue` | integer USD. No `$`, no commas, no `"5M"`. **Empty means not returned. Never `0`.** |
| `employees` | integer. Empty means not returned. |
| `captured` | ISO date `YYYY-MM-DD`. Required. |
| `source` | the provider token that actually returned the value: `apollo-mcp` or `apollo-rest` (matching the producer contract in `../apollo-enrichment [*]/01-prompt-org-revenue.md`). Required. |

Dashboard behavior: newest file by the date in its name wins; unmatched domains
keep proxies and are counted separately as "no enrichment"; **enrichment values
are never merged into the master CSVs** — the join happens at read time, like
everything else here.

The empty-vs-zero rule is the one that matters. A missing revenue written as `0`
puts every unenriched company under a `<$1M` filter and quietly deletes them
from every view.

### Acceptance

- [ ] Three counters visible at all times; each recomputes on every filter
      change; unfiltered they read 23,579 / ≈772 / 366.
- [ ] The proxy caption is present in the DOM whenever a size filter is shown,
      and no element anywhere is labelled "revenue" while
      `apollo-orgs-*.csv` is absent.
- [ ] Drop a synthetic `apollo-orgs-2026-08-04.csv` with 3 rows into
      `data/enrichment/`: the revenue filter appears, matches 3 domains, the
      caption demotes, and nothing else in the view changes. Delete it: the
      dashboard returns to proxy-only on the next request, no restart.
- [ ] A row with `annual_revenue` empty is excluded from revenue filtering, not
      bucketed at zero.
- [ ] Everything tab first paint under 2 s on a cold cache.

---

## Phase 4 — Projects tab

Multi-project separation as **overlay files**. Master data stays
project-neutral: there is no `project` column and none gets added.

### Tasks

**4.1 — Auto-discovery.** Scan `emails/data/projects/{name}/`. A directory with
a readable `criteria.json` is a project. No registration step, no config file
listing projects — the same reason `resolveRegistry` reads the directory instead
of a hand-maintained table.

**4.2 — `criteria.json`**

```json
{
  "name": "Catalog AI",
  "description": "The IND-C1 working view: seated rows the catalog angle is written for.",
  "base": "seated",
  "filters": [
    { "field": "ecommerce_class", "op": "eq",  "value": "catalog_no_cart" },
    { "field": "cohort",          "op": "neq", "value": "E" }
  ],
  "columns": ["company_display", "domain", "state", "segment", "tier", "ecommerce_class", "verify_result"],
  "counts": "companies"
}
```

| Key | Shape |
|---|---|
| `name` | display name |
| `description` | one line, shown under the name |
| `base` | `"everything"` \| `"seated"` \| `"pool:<disposition>"` |
| `filters` | array of `{field, op, value}`; `op` ∈ `eq · neq · gte · lte · in · contains · empty · nonempty`. `in` takes an array. `empty`/`nonempty` take no value. All filters AND. |
| `columns` | which columns the project's table shows |
| `counts` | `"companies"` (unique domains) or `"people"` (named contacts) |

Unknown `field` → the filter is skipped and the project renders a warning chip
naming it. Unknown `op` → the whole project renders as misconfigured rather than
silently matching everything. A filter that quietly does nothing is how a
project ships to 12,000 companies it never meant to touch.

**4.3 — `status.csv`**

```
domain,status,note,updated
acme-hydraulics.example,contacted,"left a voicemail with the owner",2026-08-04
midwest-bearing.example,replied,"asked for pricing on the catalog build",2026-08-05
```

`status` is **free vocabulary** — each project defines its own. The dashboard
groups by distinct value and counts; it never validates against an enum and
never suggests one. Rows whose domain is outside the project's filtered set show
as "orphaned status rows" with a count, because that usually means the criteria
changed underneath the project.

**4.4 — Read-only stands.** The dashboard **renders** overlays and never writes
one. No status editor, no "mark contacted" button, no criteria form. Overlays
are edited in a text editor or by a script, same as every other file in this
workspace. Rail 2 of the design spec covers overlays too, explicitly.

**4.5 — Seed two profiles** as part of this handoff:

`emails/data/projects/catalog-ai/criteria.json` — base `seated`, the campaign's
working view (the shape above).

`emails/data/projects/small-shops/criteria.json` — base `pool:small-shops`, no
filters, carrying this caveat verbatim:

```json
{
  "name": "Small shops",
  "description": "Artur's separate small-shops project. Sub-floor by size proxy, not waste.",
  "base": "pool:small-shops",
  "filters": [],
  "columns": ["company_display", "domain", "city", "state", "location_count", "size_band", "review_count"],
  "counts": "companies",
  "note": "Row count is not trusted yet. The pool went 431 to 2,818 lines between v6 and v7 (6.5x) with no cause in the written record. See handoff/industrial-contact-list/99-hygiene.md H4 before building on this count."
}
```

`note` renders as a warning banner on the project card. Ship both `criteria.json`
files; do not ship a `status.csv` for either — an empty status file reads as
"nobody has done anything," which is different from "no file yet."

### Acceptance

- [ ] Both seeded projects discovered with no registration step; deleting a
      project directory removes it on the next request.
- [ ] `catalog-ai` count is ≤ the current seated count (2,773 in `seated-v9`)
      and its base is the seated list.
- [ ] `small-shops` renders the caveat banner above its count.
- [ ] A `criteria.json` with an unknown `op` renders "misconfigured" and does
      not match rows. A malformed JSON file renders an error card, not a 500.
- [ ] A synthetic `status.csv` with a status nobody has ever used groups
      correctly and triggers no validation error.
- [ ] Grep confirms zero write calls anywhere under the projects code path.

---

## Guardrails — all unchanged

Nothing in this handoff relaxes anything. If a task here seems to require it,
the task is wrong.

1. **Read-only by omission.** The Smartlead import stays at
   `getCampaignAnalytics, listCampaigns, listEmailAccounts`. No mutating
   function gets imported, for any reason.
2. **Loopback only.** `server.listen(port, '127.0.0.1')`. Not `0.0.0.0`, not
   `::`. There is no auth because there is no remote reachability.
3. **Field whitelist.** `sanitizeAccount` / `sanitizeCampaign` stay whitelists.
   The API returns plaintext SMTP/IMAP passwords.
4. **`politeFetch` stays out of the Smartlead path.** It persists every response
   keyed by full URL, and Smartlead's API key rides the query string — the
   warning is in `emails/scripts/lib/fetch.mjs`. Do not "simplify" the two
   fetchers into one.
5. **No writes. Overlays included.** No file is created, appended, renamed or
   removed at runtime. Non-GET requests are refused outright.
6. **FS containment.** Every readable file resolves inside a registry root via
   `path.resolve` + prefix guard. This work adds one root:
   `emails/data/projects/` (read-only) and one glob:
   `emails/data/enrichment/apollo-orgs-*.csv`. Never `emails/data/raw/`, never
   any `_cache/`.
7. **XSS.** All data strings via `textContent`. `innerHTML` only for `marked`
   output of in-repo audit files under `emails/data/`.

## Performance

Per-request CSV re-read is the current model and it is the right one while the
list is still moving — a snapshot at boot goes stale inside an hour of active
work. Keep it.

The unified index is the one place that changes the arithmetic: 12 files, ~35K
rows, ~56 columns. Memoize it keyed on `max(mtimeMs)` across its inputs, the way
`registryCache` keys on the directory mtime. If the Everything tab still lags,
profile before adding a layer — `readCount` already avoids holding parsed rows
for the count-only path, and the same split usually solves it.

Do not add a database. Do not add a build step. Zero new dependencies is a
standing constraint of this tool, not an aesthetic.

## Done looks like

- [ ] Phase 1: unified loader + domain dedupe + verify join, `node --test` green
- [ ] Phase 2: Sources tab lists 21 data tokens, joins 27 handoff folders,
      status read from the folder name and cross-checked against the §5 row,
      NEW badge proven by deleting and restoring a folder
- [ ] Phase 3: Everything tab with three counters, size-proxy filters carrying
      the caption, drill-down with clickable provenance
- [ ] Phase 3: Apollo upgrade proven with a synthetic 3-row file, both
      directions
- [ ] Phase 4: two seeded projects auto-discovered, small-shops caveat visible
- [ ] Both grep guards print nothing
- [ ] `pnpm lint` clean on changed files; `node --test emails/scripts/lib/`
      green; full `pnpm test` still green
- [ ] Screenshots of the three new tabs, checked against the dataviz
      anti-patterns (one measure per hue, status colors reserved for status,
      icon plus word never color alone)
- [ ] `emails/README.md` §Dashboard updated: five tabs becomes eight
