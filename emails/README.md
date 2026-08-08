# emails/ — industrial cold-email list + campaigns workspace

Working folder for the industrial prospect-list build and the campaigns that run
on it. Strategy for the *campaign itself* (goal math, ICP, angles, copy,
deliverability, runbook) lives in `docs/strategy/industrial-email-campaign/`
and stays the SSOT — nothing here restates it. This folder owns **where the
list comes from** and, later, the per-campaign exports.

## Layout

| Path | What it holds | In git? |
|------|---------------|---------|
| `handoff/strategy/` | Sourcing strategy + build handoff (start at `00-sourcing-strategy.md`) | yes |
| `handoff/industrial-contact-list/` | Working the list further: one handoff per source, plus the dashboard extension and hygiene (start at `00-README.md`) | yes |
| `research/` | The four research files behind the strategy (internal context, dealer locators, alternative channels, tooling) | yes |
| `research/scripts/` | Proven extractor scripts from validation (AD sweep, PTDA postback) | yes |
| `data/` | Raw pulls + validation samples (per-source CSVs, capture date in filename) | **no** (gitignored) |
| `lists/` | Deduped, qualified, seated lists ready for enrichment/export | **no** (gitignored) |
| `campaigns/` | Per-campaign copy variants + Instantly export CSVs (created when campaigns start) | copy yes, exports no |

## Status

2026-08-02 — **BUILD COMPLETE · CAMPAIGNS STAGED AS GATED DRAFTS.**

- **`lists/seated-v9.csv` — 2,773 prospects**, ranked, segmented, tiered
  (v9 = v8 − McCarty Equipment, SunSource-via-GHX, S4n; v8 = v7 + the AD
  fold-in and ad_member re-rank, S4l; v7 = v6 − GHX Industrial, S4k; v6 = v5 −
  46 PE roll-up subsidiaries retagged `chain` by S4j 2026-08-03; v5 = v4 + the
  thehoseshop NAP split; v4 = v3 + the Adaptall fold-in).
- **`lists/first-send-200.csv` — the verified first-send cohort.** Every one
  of the 200 read individually; measured contamination 1.5% against 14.8%
  list-wide. Start here.
- **Smartlead holds both industrial sequences as parked drafts:**
  `IND-C1 Catalog AI — GATED DRAFT (do not start)` (3751334, 5 steps / 28
  variants incl. the E1-A/E1-B/Cohort-E bodies) and `IND-C2 Industrial
  Growth — GATED DRAFT (do not start)` (3751335, 4 steps / 20 variants incl.
  the Cohort-E inflection). DRAFTED, zero senders, zero leads, no schedule.
  Stage/verify: `node scripts/industrial-smartlead-setup.mjs --verify`.
  Account: `data/_smartlead-upload-2026-08-02.md`.
- **S7 machinery exists:** `scripts/s7-export.mjs` (micro-batch previews,
  stamped `_DO-NOT-UPLOAD.md` until gates clear) ·
  `scripts/declaration-review.mjs` (the `{{declaration}}` human review queue +
  validated `--extract`) · `data/track1-handsend-2026-08-02.md` (the 11 named
  rows Artur sends by hand).
- **S5 (Apollo contact-finding) is running on the pilot cohort** via the
  Apollo MCP connector — output in `data/s5-apollo-contacts-2026-08-02.csv`.

22 sources → 32,004 companies → 19,908 seated → 3,000 ranked → 2,788 after a
manufacturer audit and four send-blocking fixes → 2,782 (Adaptall fold-in,
then the thehoseshop split) → 2,736 (S4j roll-up retag) → 2,735 (S4k) →
2,774 (S4l AD fold-in, +39 crossers) → **2,773 current** (S4n, 2026-08-04).
Projects to ~1,700–1,950 after contact-finding and verification, inside the
pack's 1,400–2,000 target.

- **Which list to use, and what's wrong with it:
  `handoff/strategy/02-list-guide.md` — read this first.**
- Strategy + decision log: `handoff/strategy/00-sourcing-strategy.md`
- Build plan + every measured finding: `handoff/strategy/01-build-plan.md`
  (§5a–§5u is the running record of what was measured and what it corrected)

**Two things block the first send:**
1. **Suppression data is partial** — `data/suppression/` now holds the
   Smartlead-history seed (409 addresses / 293 domains, zero overlap with this
   list) and the 11 roll-up-owned domains (2026-08-03), and the join is live in
   the S7 exporter. Still missing, and only Artur can supply it: current/past
   clients, live deals, and any off-Smartlead opt-outs
   (`manual-clients-*.csv` / `manual-donotcontact-*.csv` — see
   `data/suppression/README.md`).
2. **T1 hot tier is 44 against Track 1's 50.** Relaxing `evidence_depth` from
   ≥3 to ≥2 yields 400 candidates — GATE:HUMAN, deliberately unsigned.

Both formerly-outstanding waves are done: USAspending landed 2026-08-01
(build plan §5p–§5q) and W5 (buying-group press releases) ran 2026-08-02 —
31 announcements, 7 join-signals matched to seated-v5
(`data/w5-buying-group-signals-2026-08-02.csv`).

Settled: $2M revenue floor · SKU floor 1,000 MRO / 200 specialist · full pool
build approved · all spend authorized (Instantly, Truelist — **superseded by
NeverBounce, Artur 2026-08-02** — Apollo, headless tier) · dealer emails
send-eligible in an isolated cohort · Segment W parked · Angle 1 only ·
Adaptall for targeted lookups only.

## Rules

- Every record everywhere carries `source_url` + `captured` date. No
  unprovenanced rows.
- Nothing sends without a NeverBounce `valid` verdict (2% bounce kill line,
  per the campaign pack; Truelist → NeverBounce swap, Artur 2026-08-02).
  Runner: `scripts/s6-verify.mjs`; cumulative results join the exporter at
  pull time via `data/verify-results.csv`.
- Suppression (incl. the shared phone DNC list) joins at **pull time**, not
  send time.
- Public pages only; 403/login/CAPTCHA-gated sources stay excluded. No
  bypasses. **robots.txt is no longer an automatic exclusion** (Artur's
  override, 2026-08-01 — recorded in the strategy doc §7.1); access controls
  and credential walls still are.
- **Culled ≠ deleted** (rule, Artur 2026-08-01). Disqualified records get a
  `disposition` tag and land in `data/side-pools/` — small shops
  (single-location / sub-floor revenue) are inventory for Artur's separate
  small-shops project, not waste.

## Dashboard

A read-only local cockpit over this folder: list health, side pools, what blocks
the first send, live Smartlead state, and the audit reports. It reads the CSVs
on every request, so it stays honest while the list is still being worked on.

```
pnpm emails:dashboard          # → http://127.0.0.1:4688
pnpm emails:dashboard -- --port 4699
EMAILS_DASHBOARD_PORT=4699 pnpm emails:dashboard
```

Five tabs: **Overview** (stat tiles, pipeline S1→S7, blockers, lineage, the
conservation check recomputed against the files) · **List** (browse, search and
filter any registry list or side pool; click a row for full provenance) ·
**Pools** (latest generation per disposition) · **Smartlead** (campaigns,
mailbox warmup, expiries) · **Reports** (the `_*.md` audits in `data/`).

What it cannot do, by construction:

- **No campaign controls.** It imports read functions from
  `scripts/lib/smartlead.mjs` and nothing else, so no code path can start,
  pause or edit a campaign. Campaign `3750571` is a parked draft and stays one.
- **No writes.** Nothing in the server writes a file, anywhere, ever.
- **Loopback only.** It binds `127.0.0.1` explicitly. There is no auth, because
  reaching it already means you can run these scripts yourself.
- **No credentials in the browser.** The Smartlead API returns plaintext
  SMTP/IMAP passwords; account and campaign payloads pass a field whitelist
  first. Request URLs are never logged (the API key rides in the query string).

It works fully offline — without `SMARTLEAD_API_KEY`, the Smartlead tab shows an
offline card and every other tab is unaffected.

Design + safety rails: `docs/superpowers/specs/2026-08-01-emails-dashboard-design.md`.
