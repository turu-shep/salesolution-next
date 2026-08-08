# ptda — Power Transmission Distributors Association, Find-a-Distributor

> STATUS (2026-08-03): DONE-DEEP — the rollup audit ran (all 58 multi-location independents + 9 nationals, hand-read): **0 confirmed false merges; the 10:1 collapse is real branch structure.** No re-emit, no `seated-v6`. Census verified against the live name axis and PTDA's own published scale. Full report: `emails/data/_ptda-rollup-audit-2026-08-03.md`.
> Cross-note (2026-08-03, rollup-rosters): the *other* rollup question — corporate ownership by PE roll-ups, which name-collapse never touches — is answered in `rollup-rosters/02-rosters-2026-08-03.md`: 58 confirmed roll-up-owned rows retagged `chain` by stage S4j (46 of them seated), which is what produced the `seated-v6` that now exists — from S4j, not from any ptda re-emit.
> No gates on this source. Three gated fixes the audit surfaced (Allied split, dead-domain survivorship, junk-apex anchor) belong to the cross-source merge layer, not PTDA — filed in the report §5, all GATE:HUMAN, none applied.

Prompts in this folder: `01-prompt.md` — the rollup audit (EXECUTED 2026-08-03; kept for provenance). Audit scripts: `emails/scripts/ptda-rollup-audit.mjs` (offline Steps 1–2), `emails/scripts/acquire/ptda_ceiling_check.py` (Step 4, 13 requests, cached).

Prerequisite reading, in order: [`00-sourcing-strategy.md` §3 Tier-1 item 3 + §5 (Segment B)](../../strategy/00-sourcing-strategy.md) · [`01-build-plan.md` §2b (branch-stripping is the biggest lever in S2) and §5b](../../strategy/01-build-plan.md) · [`_acquisition-log-2026-08-01.md` §6](../../../data/raw/_acquisition-log-2026-08-01.md)

## 1. What it is

PTDA's public Find-a-Distributor search — an ASP.NET / Telerik form on a public page. One GET plus one POST per query, with VIEWSTATE chaining, and a **`ShowAll` pager control that returns every row for a query with no page walking** (verified against a control: `60602` / (Any) / 100mi returns 98 rows either way).

The field map in `research/scripts/ptda_post.py` was wrong and is corrected in `emails/scripts/acquire/ptda_acquire.py`:

```
Sheet0$Input0$TextBox1   Zip/Postal Code   (required)
Sheet0$Input1$DropDown1  Proximity miles   10 | 25 | 50 | 100  (required)
Sheet0$Input2$TextBox1   Company Name
Sheet0$Input3$DropDown1  Products Carried  '' = (Any), then A–N
```

The 14 `Input3` categories (A adjustable/variable speed drives … N accessories) are the source's line-card axis. **They are categories, not brands** — `line_card[]` only, never `brand_authorized[]`, or S3 reads a single-brand shop as a 14-brand distributor.

Compliance: public pages, ≥3s pacing, one worker, every response cached (gzipped). **No 429 and no 403 across 1,266 origin requests.**

## 2. What we pulled

**23,105 raw records @ 2026-08-01** via `emails/scripts/acquire/ptda_acquire.py` — 15 passes ((Any) + 14 categories) × an 84-point national ZIP grid at 100-mile proximity = 1,260 searches, all 50 states covered.

Collapsed to **1,592 distinct (company, address) locations → 157 distinct companies** — the shipped JS pipeline's own numbers, reproduced exactly by the 2026-08-03 audit. (The acquisition log's 1,588/151/"159 loose" were the Python measurement pass's slightly different normalizer; 157 is the operative figure.) Fill: **website 100.0% raw · phone 99.5% · parsed street 93.1%** — best NAP coverage in the program, with one caveat the audit added: three companies publish a literal `http://` husk, so usable-domain fill is 154/157.

Contributed: **seated 45 · ranked-out 25 · small-shops 0** (plus 2 in Segment W).

## 3. How deep we went

The pull itself is complete: the category axis is exhausted and the grid covers every state. The **rollup** is where the depth question sits.

Nine names carry ≥20 distinct addresses and cover **1,197 of 1,588 locations (75.4%)** — Motion 403, W.W. Grainger 225, Applied Industrial 225, Kaman 135, DXP 64, BDI 60, State Electric Supply 30, IBT 29, Bearing Headquarters 26. Strip those and **150 companies remain over 391 locations: 93 single-location, 57 with 2–19.** That is the real ICP yield, and it lands at the very bottom of §2's "hundreds" estimate.

Line-card material is the payoff: 110 companies list ≥1 category, **mean 8.4 of 14, 31 companies carry all 14** — per-company line-card depth no other source supplies without a page fetch.

Stop reason, superseded 2026-08-03: the collapse **has now been audited** — every multi-location group tested (domain / phone / geography) and hand-read, provenance traced for all 157 keys by entity membership (zero lost), and the census ceiling-checked against the live `Input2` name axis (positive control returned its exact branch set) and PTDA's own published scale (">300 distribution and manufacturing companies"). Report: `emails/data/_ptda-rollup-audit-2026-08-03.md`.

## 4. What's left on the table

**Nothing on the pull side, and nothing from the rollup.** The 2026-08-03 audit answered the open question: 0/58 confirmed false merges among multi-location independents; the hoped-for "tens of recoverable Segment-B independents" do not exist. The `(source, company, apex_domain)` override was measured to be strictly harmful here — it would split three real dual-domain companies (Agilix, Mechanical Drives & Belting, Troy) into fabricated duplicates and recover nothing.

What the audit yielded instead — **three gated fixes at the cross-source merge layer** (report §5, all GATE:HUMAN, none applied):

1. **Allied cluster split** — one `seated-v5` row holds three distinct companies (Allied NC / Allied LA / Allied Nashville) plus the LA rep firm Stephens-Harris; hoseshop-class, s4h-style fix.
2. **Field survivorship** — the seated BDS row carries dead `autopartintl.com` (NXDOMAIN) over `bds-usa.net` (25+ rows) because `mergeRecords.pick()` is first-non-null, not majority.
3. **Junk-apex anchor** — `us.com` (a PTDA `http://`-husk neighbor) pulled an unrelated SERP row into Troy's entity; `domainAnchors` needs an apex denylist.

Reopen the source itself only if PTDA's membership materially grows (homepage claim: ">300 distribution and manufacturing companies") or the ICP extends to non-US members.

## 5. Registry row

| ptda | DONE-DEEP | 23,105 | 45 | 2026-08-01 | 0 — rollup audited clean 2026-08-03; 3 gated cross-source fixes filed | ptda/ |
