# usaspending — USAspending.gov federal prime awards (folded in as evidence, never seated)

> STATUS (2026-08-03): FOLDED — 3,975 companies, zero contact data, so it became an enrichment layer on companies we already had. It matched 3.0% of the seated list and left 3,711 rows in the identity backlog.

Prompts in this folder: `01-prompt.md` — reopen check: re-pull only for recency, and only after the unmatched backlog is worked.

Prerequisite reading, in order: [`00-sourcing-strategy.md` §3 Tier-2 item 6](../../strategy/00-sourcing-strategy.md) · [`01-build-plan.md` §5h (why the wave ran), **§5p and §5q** (what it measured and what it cost)](../../strategy/01-build-plan.md) · [`_acquisition-log-2026-08-01.md` "USAspending.gov federal prime awards"](../../../data/raw/_acquisition-log-2026-08-01.md) · [`data/_usaspending-foldin-report-2026-08-01.md`](../../../data/_usaspending-foldin-report-2026-08-01.md)

## 1. What it is

The open USAspending.gov API — **no key, no auth, no rate wall, $0.00** — scoped to six distributor NAICS codes plus four adjacent ones. Per company: UEI, DUNS, legal name and DBA/`alternate_names`, address, award history, PSC product codes, NAICS, and SAM.gov business-type flags.

Compliance: a US government open API. No robots question, no origin to be polite to. `emails/scripts/acquire/usaspending_acquire.py`.

## 2. What we pulled

**26,964 award records @ 2026-08-01** → **3,975 distinct US companies**, deduped 100% on UEI, in ~2,915 requests over 2.3 hours for **$0.00**.

Fill: UEI 100% · DUNS 93% · state 94.6% · full street/city/ZIP5 58% overall and 100% on the detail tier · **website, email and phone: 0%.**

Contributed to the send list: **0 seated.** Folded to `emails/data/enrichment/federal-2026-08-01.csv` (268 matched pairs) and `emails/data/side-pools/pool-usaspending-unmatched.csv` (**3,711 rows**, 2,772 of them under a new `identity-backlog` disposition — deliberately *not* `no-website`, which would have polluted the already-decided Segment W).

## 3. How deep we went

Deep enough to page past a lying API: **`hasNext` lies at depth.** NAICS 423610 reported `false` at page 120 with 550 awards still outstanding. The pull paged until genuinely empty and reconciled all ten codes against the count endpoint. Any future pagination here must do the same or it silently truncates.

Then the fold-in measured how little it touches us: **264 of 3,975 matched (6.6%)** — 146 on name+ZIP5, 118 on a name+state tier added because HQ-versus-branch ZIP mismatch is the dominant miss. Against the deliverable, **90 of 3,000 seated (3.0%)**. **False positives: 0 across all 268 pairs, hand-checked in full rather than sampled.** No re-rank, no `seated-v2` from this stage — 3.0% is not material and award value is not a rank input.

Two join insights worth keeping: **26 matches (9.8%) exist only through `alternate_names`** (Enerpac→Actuant, Curtiss-Wright→Enertech), and **41 matched rows (16.2%) inherit a *parent's* award total** (VSE Corporation → `vseaviation.com`).

## 4. What's left on the table

**The 3,711 unmatched companies**, which are the single largest identity-resolution opportunity in the program — 0% website, 0% phone, but 100% UEI and near-complete NAP on the detail tier. That work has its own file: `no-domain-backlog/`.

What is **not** left: a revenue floor. §5h justified this wave partly as an independent revenue-band proxy, and measurement says it does not do that job — small-business median federal spend is $266K against $616K for other-than-small (2.3× separation, heavy overlap), and **Jamaica Bearings holds $149M in federal awards while still carrying the `small_business` flag** because SBA's wholesale standard is employee-based. **Use it to exclude nationals at the top; never as evidence that a company clears $2M.**

Two more standing rules from this source. **Do not route on NAICS alone** — 62.2% sit under a manufacturing NAICS but 44.2% of those are not flagged `manufacturer_of_goods`, because agencies code by the part, not the seller. And **product-code descriptions are safe to quote in copy; dollar figures are not.**

## 5. Registry row

| usaspending | FOLDED | 26,964 | 0 | 2026-08-01 | 3,711 unmatched → identity-resolution work, not seating | usaspending/ |
