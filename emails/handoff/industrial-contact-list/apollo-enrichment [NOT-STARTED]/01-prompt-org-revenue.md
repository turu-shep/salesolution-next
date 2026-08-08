# apollo-enrichment · Workstream A — firmographics for 2,782 seated domains

Your mission: attach a revenue band and an employee count to every seated domain and write them into the one CSV contract the dashboard's revenue filter reads, so the $2M floor stops resting on proxies nobody can measure.

This is the revenue-for-the-dashboard half of Apollo. The people-for-sending half is `./02-prompt-people.md` and runs independently — you do not need it, and it does not need you. Both start at the same access gate.

## Read first, in order

1. `../00-README.md` — the pack index: the source registry, and the company/person/sendable distinction that this workstream exists to fix on the company side.
2. `./00-README.md` — this workstream's dossier. The two access paths, the standing per-call rules, the pilot's numbers, and the failure modes.
3. `../../strategy/00-sourcing-strategy.md` §6 (S5 in the pipeline) and §8.1a (**why Apollo's revenue field cannot be a gate**).
4. `../../strategy/01-build-plan.md` §5v (S5 unblocked; S7 measured 787 of 2,782 batchable) and the "Known debt" list.
5. `../../../data/_s5-apollo-report-2026-08-02.md` — the pilot. Read it before planning a batch.
6. `../dashboard/00-README.md` Phase 3.5 — the consumer of your output file. The column contract is stated there and here identically; if they ever disagree, stop and reconcile before writing a row.

## Standing rules for every call, non-negotiable

- **`reveal_personal_emails` stays OFF.** GATE:HUMAN to change it, and the default answer is no.
- **All reveal/waterfall flags false.** The pilot ran this way; keep it.
- **Phone credits are exhausted.** No `reveal_phone_number`, ever — there is nothing to spend.

## The work

Every phase writes a checkpoint before it writes an output, and every list write gets a **field-for-field readback** (§5s: `makeRecord()` before `toCsv()` silently blanked 35,927 cells while conservation PASSED).

### Phase 0 — answer the access gate (GATE:HUMAN, 10 minutes)

**GATE:HUMAN — either Artur adds `APOLLO_API_KEY` to `.env.local` (scripts run unattended, checkpointed, resumable) or every batch runs interactively through the Apollo MCP in a claude.ai session.**

- The **claude.ai Apollo MCP connector** is live in-session with ~47k lead credits on a cycle running to 2027-05.
- The **REST fallback** is already written — `scripts/precall-scan.mjs:116` (`X-Api-Key` header, keyed off `APOLLO_API_KEY` at line 54) — but **`APOLLO_API_KEY` is absent from `.env.local`**, so the headless path does not run today.

Nothing else starts until this is answered. A 2,782-domain sweep is not something to drive by hand call-by-call.

### Phase 1 — org enrichment (the dashboard's revenue filter)

Enrich **by domain**, in batches of 10, writing:

```
emails/data/enrichment/apollo-orgs-YYYY-MM-DD.csv
columns EXACTLY: domain,annual_revenue,employees,captured,source
```

| Column | Rule |
|---|---|
| `domain` | apex, lowercase, no `www.` — the join key. Required. |
| `annual_revenue` | integer USD. No `$`, no commas, no `"5M"`. **Empty means not returned. Never `0`.** |
| `employees` | integer. Empty means not returned. |
| `captured` | ISO date `YYYY-MM-DD`, the run date. Required. |
| `source` | `apollo-mcp` or `apollo-rest` — whichever actually returned the value. Required. |

**Do not add, rename or reorder columns.** The dashboard consumes this contract on every request, and blanks stay blank — never `0`, never `null`. §5l's `??`-on-zero class has now surfaced six times, and a legitimate zero must survive. A missing revenue written as `0` puts every unenriched company under a `<$1M` filter and quietly deletes them from every view.

**GATE:HUMAN before the first batch: state the credit number.** Run **25 domains first**, read the `credits_consumed` counter before and after, report cost-per-domain, and get sign-off on a total before sweeping the remaining 2,757. Pilot calibration: 0.73 credits per domain swept, ~47k available.

### Phase 2 — how to use the result, and how not to

§8.1a: Apollo's revenue field is unreliable and the pack already says it cannot be filtered on.

- **`annual_revenue` is a tiering input, never a gate.**
- **`employees` is the stronger field**, because distribution runs $300–500K revenue/employee — which puts **$2M at 4–7 employees and $5M at 10–20**.
- Score on the proxy stack, never on a single field, and expect the $2–3M boundary to stay fuzzy.

Report the enriched share and the unmatched share separately. The dashboard counts unmatched domains as "no enrichment" and keeps their proxies; do not backfill them with a guess.

### Phase 3 — ranked-out, on demand only

Do not sweep `pool-ranked-out-v7.csv` speculatively. It is 13,719 rows against a Track-2 need of 1,200–1,500, and §5l is explicit that **membership at the cut line is the weakest claim in the build**. Enrich a ranked-out slice only when a specific campaign needs it, and only after the seated sweep is done.

### Things that will bite

- The dashboard reads these files on every request. A malformed `apollo-orgs-*.csv` shows up as **wrong numbers, not as an error**.
- Newest file by the date in its name wins. Do not edit an old one in place.
- **Enrichment values are never merged into the master CSVs.** The join happens at read time, like everything else here.

## When this session's work lands

1. Update §5 Registry row in `./00-README.md` (status, counts, est. left) and the STATUS banner.
2. **RENAME THIS FOLDER** to match the new status — `apollo-enrichment [NEW-STATUS]` — that is how the founder reads readiness from the directory listing. Use `IN-PROGRESS` if you stopped before the plan completed. Note in the banner which workstream moved: this folder holds two, and finishing one is not finishing both.
3. Sync the pack registry table in `../00-README.md` (SSOT rule: row first, table second).
4. Note the change in `../99-hygiene.md` ONLY if it created files to clean.
