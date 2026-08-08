# no-domain-backlog — 8,156 companies we can name but cannot reach

> STATUS (2026-08-04): DONE — the plan ran end to end. Free pass ($0) + pilot
> ($5.40) + gate-signed full run = **2,241 of 8,156 rows resolved to a domain
> for $81.10 measured** (935 W + 1,306 federal), confidence-tiered
> high 1,480 / medium 298 / low 463 in
> `data/s3/backlog-recovered-2026-08-03.csv`. Measured record: build-plan
> **§5w**. Pool files deliberately untouched — the S3/S4 fold-in consumes the
> artifact next, with the LOW tier identity-verified rather than trusted.
> Gates: full-run spend **signed by Artur 2026-08-03** ("run both cohorts
> ≈$77"). **GATE-L2 re-decision now live** (verified no-website W residue
> ~3,500) — unanswered, parked.

Prompts in this folder: `01-prompt.md` — the executed plan (all four steps done; step 4's S3/S4 fold-in is handed off via the artifact). `02-assessment.md` — the step-1 written assessment.

Prerequisite reading, in order: [`00-sourcing-strategy.md` §4.2 (the null-website segment) + §9 **GATE-L2**](../../strategy/00-sourcing-strategy.md) · [`01-build-plan.md` **§5c** (the verifier's measured result — read the route yields), §5f (Segment W reopens), §5j, §5q (the federal residue)](../../strategy/01-build-plan.md) · the headers of [`emails/scripts/s3/segment_w_verify.py`](../../../scripts/s3/segment_w_verify.py) and [`identity_resolve.py`](../../../scripts/s3/identity_resolve.py) — both document their own rules better than any summary

## 1. What it is

Two pools of companies that carry a name and usually an address, and no domain. They are not one problem, and treating them as one is the first mistake available:

**Segment W — `data/side-pools/pool-segment-w-v7.csv`, 4,445 rows.** Source mix: **dfs 4,198** · yaskawa 95 · ntn 48 · ballymore 23 · timken 22 · nord 17 · quincy 11 · ad 10 · gast 10 · lovejoy 5 · kennametal 5 · banjo 4 · ptda 2 · mknorthamerica 2 · enerpac 1. These are records whose *source* published no website — a Google Business Profile with a null `url`, or a locator row with an empty website field.

**The federal residue — `data/side-pools/pool-usaspending-unmatched.csv`, 3,711 rows** (2,772 of them tagged `identity-backlog`). These are different: they carry **UEI 100% · DUNS 93% · state 94.6%**, full street/city/ZIP5 on 58% overall and 100% of the detail tier, and **website, email and phone at 0%** — because USAspending publishes none. They failed a *join* against our pool, which is not the same test as "does this company have a website".

**The governing rule, from §4.2 and proved right by measurement: a missing website field is a *candidate*, not proof.** A record only becomes `no-website` after domain resolution has failed on every route.

**Queued input, not yet in either pool (2026-08-03):** `waltersurface
[DONE-NO-DOMAINS]/` holds ~2,562 no-domain independents with **69.7% email
fill** — mostly free-resolvable via route 1 (email-apex) the moment its own
prompt routes them into the W pool. This workstream's counts and the gate
figure below deliberately exclude them; they arrive as a later increment.

## 2. What we pulled

Nothing new at intake — this is a backlog, not a source. Both files were written by stages that already ran: Segment W by S2–S4 across every source, the federal residue by the USAspending fold-in on 2026-08-01.

**2026-08-03 session (steps 1–3a of `01-prompt.md`):**

| | |
|---|---|
| Free pass (`scripts/s4i-backlog-freepass.mjs`, $0) | **128 resolved**: email-apex 48 · sibling-phone 44 · sibling-namezip 35 · universe re-join 1; crossjoin pairs 1; 0 ambiguous, 0 conflicts |
| Pilot (500 records, seeded/stratified) | **154 resolved** at final v5 rules: W 39/250 (15.6%) · federal 115/250 (46.0%); 876 calls, **$5.40 measured** |
| Hand-read | 34 + 20 pilot + 12 fed-drift + 11 W-drift domains adjudicated; verifier rules iterated ×4 from cache at $0.02 marginal |
| **Full run (gate signed)** | **1,959 resolved**: W 804/4,103 (19.6%, $57.74 incl. the balance-pause resume) · federal 1,155/2,495 (46.3%, $17.96); neither ceiling hit |
| S3-input artifact | `data/s3/backlog-recovered-2026-08-03.csv` — **2,241 rows** with `recovered_confidence` (high 1,480 · medium 298 · low 463); field-for-field readback clean; **no pool file rewritten** |
| Measured precision | federal ~90–95% (12/12 drift sample); W high-arms ≥90%, W low tier (single-token+geo) **~40–60% — identity-verify at fold-in, do not trust**; 1 typo-TLD flagged (belaireswelding.cm) |
| Residue | W 3,510 · federal identity-backlog 1,475 · adjudicated-out 929 · crossjoin rider 1 |

Contributed to the send list: **0, by design.** GATE-L2 decided "harvest + park" — Segment W is held as clean data with no sends until an angle exists.

## 3. How deep we went

**One verification pass ran 2026-08-01 on the locator cohort, and its rate does
not travel.** §5c: 668 candidates → 508 rescued (76.0%). The 2026-08-03 pilot
(build-plan **§5w**) pointed the extended verifier at 250 DFS-sourced W rows
and 250 federal identity-backlog rows and measured, at precision-hardened
rules:

| Cohort | Recovery | Why it differs from §5c |
|---|---|---|
| Segment W (GBP-null) | **39/250 (15.6%)** | §5c's rescues were stale locator nulls; a GBP profile with no URL mostly belongs to a business that genuinely has no site |
| federal identity-backlog | **115/250 (46.0%)** | established contractors; the no-location tier (large national names) recovers best |

Route 2 is near-dead for DFS-sourced rows (2 of 250 — the search returns the
same domainless listing). Route 3 carries both cohorts. The 54-domain
hand-read caught route-3's silent false-corroboration mode (~29% precision on
the W sample at shipped rules), four cache-funded rule iterations fixed it
(final ~90%), and the residual failure is named: same-landmark neighbors
(plattelakemn.com), separable only by content classification — S3's job.

Verifier extensions shipped in `emails/scripts/s3/segment_w_verify.py`
(2026-08-03 header): ZIP-centroid geocoding from our own corpus, ZIP-filter
fallback, skip-uncorroboratable guard, no-phone zip+token rule, UEI-keyed
`alternate_names` (4 pilot rescues came only through a DBA), geo-echo
acceptance, `--captured/--out/--cohort/--max-cost` (the 2026-08-01 artifact is
never rewritten).

## 4. What's left on the table

The resolution itself is DONE. What remains is downstream of this folder:

1. **The S3/S4 fold-in** — `data/s3/backlog-recovered-2026-08-03.csv` (2,241
   rows) enters the pipeline as normal S3 input: vertical filter, chain
   suppression, manufacturer detector, rank (§5f order). Nothing bypasses
   anything. The **low tier (463 rows) must be identity-verified on the
   domain's own pages first** (`identity_resolve.py` semantics) — measured
   ~40–60% true, hyperlocal-namesake failure shape. Projected seating from
   the artifact: **≈ 150–260** (high 1,480 × 9.6% ≈ 142, plus haircut
   medium/low). Cost-per-seated lands ≈ $0.31–0.54.
2. **GATE-L2 re-decision, now live at real scale.** The W residue is ~3,510
   unrescued candidates (an upper bound on "genuinely no website" — the
   precision rules refuse some real matches, giesting.com being the measured
   example). That is 22× the 160 that made GATE-L2 say "park". Does a
   verified no-website segment this size earn the Website Development offer
   §4.2 anticipated? **Artur's call; parked until answered.**
3. **The Walter Surface increment** — ~2,562 no-domain independents with
   69.7% email fill sit in `waltersurface [DONE-NO-DOMAINS]/` awaiting their
   own folder's routing; email-apex alone should resolve most of them for $0
   through this workstream's machinery when they land in the pool.

## 5. Registry row

| no-domain-backlog | DONE | 8,156 | 0 | 2026-08-04 (full run) | fold-in of 2,241 recovered (→ ~150–260 seated) + GATE-L2 re-decision on ~3,510 verified-W residue | no-domain-backlog/ |
