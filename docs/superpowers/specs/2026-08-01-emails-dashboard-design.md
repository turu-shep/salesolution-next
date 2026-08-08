# Emails workspace — local operator dashboard (design)

**Date:** 2026-08-01 · **Status:** approved for build (autonomous session; design decisions recorded here)

## Purpose

A read-only, local-only cockpit over the `emails/` pipeline and Smartlead send-readiness. It answers six operator questions:

1. How big is the sendable list right now? (`seated-v3.csv`, first-send cohort)
2. What blocks the first send? (suppression list, warmup, senders decision, unsigned gates)
3. Where did every sourced record go? (conservation invariant, side pools by disposition)
4. What's actually in the list? (browse / filter / search, per-row provenance)
5. What is Smartlead's live state? (campaigns incl. the gated dental draft, mailbox warmup, expiries)
6. What changed last? (latest per-stage audit reports)

No vanity panels: every panel maps to one of these questions.

## Decision: standalone local server, not a Next.js route

- "Accessible only locally" is a hard requirement → a standalone `node:http` server bound explicitly to `127.0.0.1`. A Next.js route would ship in the Vercel build and need gating; it would also mix operator tooling into the marketing site and inherit the Next 16 dev flakiness landmine.
- **Zero new dependencies.** `node:http` + `emails/scripts/lib/contract.mjs` (`parseCsv` — mandatory; `wc -l` and naive splits miscount because `self_declaration_verbatim` embeds newlines) + `scripts/lib/smartlead.mjs` (read functions only) + `marked` (existing dep) for audit-report rendering.
- Files are `.mjs` (root `package.json` has no `"type"` field).
- There is no server precedent in the repo; this is greenfield and stays inside `emails/scripts/` where the workspace tooling lives.

## Architecture

| File | Responsibility |
|---|---|
| `emails/scripts/dashboard.mjs` | HTTP server: registry, fs glue with mtime-keyed cache, `/api/*`, serves the HTML. Port 4688 default, `--port` / `EMAILS_DASHBOARD_PORT` override. |
| `emails/scripts/dashboard.html` | Single-file vanilla-JS UI (tabs, tiles, tables, bars). No CDN, no external requests. |
| `emails/scripts/lib/dashboard-data.mjs` (+ co-located `.test.mjs`) | Pure helpers — no fs, no network, no dates — per the lib convention. |
| `scripts/lib/smartlead.mjs` | Only if `listEmailAccounts()` lacks warmup fields: one additive read wrapper `getWarmupStats(accountId)` in the existing queue/redact pattern. Otherwise untouched. |

Data sources: `emails/lists/*.csv`, `emails/data/side-pools/*.csv`, `emails/data/` root `_*.json` / `_*.md`, `emails/data/s3/*.json`, plus live Smartlead reads. Caching: file parses keyed by `(path, mtimeMs)`; Smartlead responses cached in memory for 120 s with `?refresh=1` bust. The list work is ongoing in parallel — every read is dynamic; nothing is snapshotted at boot.

## API

- `GET /` → the HTML page.
- `GET /api/overview` → `{ generated_at, lists: [{name, file, rows, stage, role, current}], pipeline: [{id, title, status: done|pending|blocked, detail}], blockers: [{id, label, status: ok|warning|serious, detail}], conservation, sendfix }` — lineage counts parsed live; sendfix/conservation from the latest `_sendfix-*.json`.
- `GET /api/list/:name?offset&limit&q&segment&tier&cohort&state` → `{ name, file, total, filtered, offset, limit, fields, rows }`. `:name` resolves through a **fixed registry** (seated-v3 default; first-send-200, first-send-200-routed, cohort-e-v1, deduped-v7, sendfix-routed, plus latest side pools). Clients never send paths.
- `GET /api/pools` → latest generation per disposition (`-v10 > -v9 > … > unversioned`), with row counts.
- `GET /api/segments` → `by_segment / by_tier / by_cohort / by_state` aggregates of seated-v3.
- `GET /api/smartlead[?refresh=1]` → `{ ok, fetched_at, campaigns: [{id, name, status, gated, analytics}], accounts: [whitelisted fields + warmup], warnings }`, or `{ ok:false, reason: 'missing-key'|'error' }` — the dashboard must work fully offline.
- `GET /api/reports` → `_*.md` audit files at the `emails/data/` root, mtime desc; `GET /api/report/:name` → marked-rendered HTML. Whitelisted names only.

## Safety rails (binding)

1. **Read-only by omission** (the dental-setup precedent): imports from `smartlead.mjs` are limited to `listCampaigns, getCampaign, getCampaignAnalytics, listEmailAccounts, listCampaignEmailAccounts` (+ `getWarmupStats` if added). Never import `setCampaignStatus`, `addLeads`, `saveSequences`, `upsertWebhook`, `addEmailAccountsToCampaign`, `createCampaign`, `updateCampaignSettings`, `updateCampaignSchedule`, `exportLeadsCsv`. Enforced by a grep check in verification.
2. **Loopback only:** `server.listen(port, '127.0.0.1')`. No auth (loopback = same trust as running the scripts). `Cache-Control: no-store` everywhere; CSP `default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; img-src 'self' data:` on the page.
3. **Credential stripping:** Smartlead account/campaign payloads pass a field **whitelist** before reaching the browser. Any key matching `/pass|secret|token|credential|smtp|imap|api_key/i` is dropped (the API returns plaintext SES/Zoho credentials — a known finding), with the two boolean exceptions `is_smtp_success` / `is_imap_success`. Campaign analytics reduce to id/name/status + numeric aggregates.
4. **FS containment:** every readable file resolves inside the registry roots (`emails/lists`, `emails/data/side-pools`, `emails/data` root `_*` files, `emails/data/s3`); `path.resolve` + prefix guard; traversal attempts → 404. Never read `emails/data/raw/` or any `_cache/`.
5. **No writes, no politeFetch** (its disk cache persists full URLs; Smartlead URLs carry the key). Never log Smartlead request URLs.
6. **XSS:** all workspace/API strings render via `textContent`/escaping (scraped `self_declaration_verbatim` is untrusted). `innerHTML` only for marked output of in-repo audit files.

## UI

Tabs: **Overview · List · Pools · Smartlead · Reports.** Single dark theme, validated per the dataviz skill (palette run through its validator against the dark surface; the skill's reference palette is the source).

- **Overview:** hero stat tiles (seated-v3 rows; first-send effective = 200 − routed; side-pooled total; sourced total 32,004), pipeline board S1→S7 with status chips (icon + word, never color alone), blockers panel (suppression file missing · warmup at zero / accounts `INACTIVE` · mailbox `expires_at` past · `APOLLO_API_KEY` absent (presence check only, never values) · unsigned GATE:HUMAN items), lineage table, conservation line (`in == seated + routed`, PASS/FAIL from `_sendfix-*.json` + recomputed).
- **List:** registry dropdown, search (company/domain/email/city), segment/tier/cohort/state filters (options from aggregates), 50/page (cap 500), row → detail drawer with all fields grouped (identity / provenance / classification / enrichment / rank), declaration verbatim readable.
- **Pools:** disposition table + single-hue horizontal bars (one measure ⇒ one hue, no legend; thin marks, rounded 4px data-ends, 2px gaps), click-through to List.
- **Smartlead:** persistent "Read-only — this tool cannot start campaigns" banner; campaigns table with **GATED** flag (id `3750571` or name matching `/GATED|do not start/i`); accounts with warmup status chips, reputation, daily limit, `expires_at` (past → serious); offline card when key absent.
- **Reports:** audit-file list → rendered pane.

Text wears ink tokens, never series colors. Status colors reserved for status.

## Out of scope (v1)

Campaign controls of any kind, lead upload, suppression editing, S5–S7 triggering, auth/HTTPS, Next.js integration, raw/ browsing, any file writes.

## Verification

- `node --test emails/scripts/lib/` green (new helpers fully tested, incl. adversarial credential-key cases and embedded-newline rows).
- Server boot + curl every endpoint; **end-to-end row-count assertion: seated-v3 = 2,788**; traversal probe 404s.
- Grep guard for forbidden smartlead imports.
- Playwright (existing devDep) screenshots of all five tabs; eyeball pass against dataviz anti-patterns.
- `pnpm lint` clean on changed files; full `pnpm test` still green.
