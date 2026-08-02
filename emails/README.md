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
| `research/` | The four research files behind the strategy (internal context, dealer locators, alternative channels, tooling) | yes |
| `research/scripts/` | Proven extractor scripts from validation (AD sweep, PTDA postback) | yes |
| `data/` | Raw pulls + validation samples (per-source CSVs, capture date in filename) | **no** (gitignored) |
| `lists/` | Deduped, qualified, seated lists ready for enrichment/export | **no** (gitignored) |
| `campaigns/` | Per-campaign copy variants + Instantly export CSVs (created when campaigns start) | copy yes, exports no |

## Status

2026-08-01 — **BUILD COMPLETE. `lists/seated-v1.csv` holds 3,000 prospects.**

22 sources → 32,004 companies → 19,908 seated → 3,000 in the final ranked,
segmented, tiered list. Projects to 1,800–2,100 after contact-finding and
verification, inside the campaign pack's 1,400–2,000 target.

- Strategy + decision log: `handoff/strategy/00-sourcing-strategy.md`
- **Build plan + every measured finding: `handoff/strategy/01-build-plan.md`**
  (§5a–§5o is the running record of what was measured and what it corrected)

**Two things block the first send:**
1. **No suppression / DNC list exists** — the join is wired and tested, there
   is no data to join. Artur must supply any prior-contact, opt-out or
   existing-customer list.
2. **T1 hot tier is 44 against Track 1's 50.** Relaxing `evidence_depth` from
   ≥3 to ≥2 yields 400 candidates — GATE:HUMAN, deliberately unsigned.

Also outstanding: the USAspending wave never landed, and the buying-group
press-release wave (W5) was never run.

Settled: $2M revenue floor · SKU floor 1,000 MRO / 200 specialist · full pool
build approved · all spend authorized (Instantly, Truelist, Apollo, headless
tier) · dealer emails send-eligible in an isolated cohort · Segment W parked ·
Angle 1 only · Adaptall for targeted lookups only.

## Rules

- Every record everywhere carries `source_url` + `captured` date. No
  unprovenanced rows.
- Nothing sends without Truelist `verify_state == ok` (2% bounce kill line,
  per the campaign pack).
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
