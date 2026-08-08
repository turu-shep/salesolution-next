# Which list do I actually use?

**Written 2026-08-01.** The build produced 16 files in `emails/lists/` and 34 in
`data/side-pools/`. Almost all of them are intermediate. This page says which
two to open, what the columns mean, and what is still wrong with them.

---

## The short answer

| You want to… | Open |
|---|---|
| **Send the first campaign** | **`lists/first-send-200.csv`** — 200 rows, all individually verified (9 roll-up-owned rows replaced 2026-08-04; see `first-send-200-routed.csv`) |
| **Everything that passed qualification** | **`lists/seated-v9.csv`** — 2,773 rows |
| Feed the small-shops project | `data/side-pools/pool-small-shops-v9.csv` — 2,811 rows |
| Anything else | Probably nothing. See "Do not use" below. |

**`seated-v9` supersedes `seated-v8`** (2026-08-04, S4n — re-applies the
McCarty Equipment retag on top of the AD fold-in: the two stages raced on the
v8 number, the fold-in won the file, and McCarty — a SunSource company via GHX,
discovered by its own footer during backfill verification — is now in
`pool-chains-v11`; audit `data/_rollup-retag4-2026-08-04.json`).

**`seated-v8` superseded `seated-v7`** (2026-08-04, S4l — the AD fold-in:
the 2026-08-03 AD pulls merged in, the `ad_member` rank term (+6) applied, and
**39 AD-member rows crossed the cut up from `pool-ranked-out`**; 454 net-new AD
companies routed to the pools (424 adjacent-trades · 24 ranked-out · 4 chains ·
2 segment-w). New rows are unenriched and none carry an email — sendable is
unchanged. Report `data/_ad-foldin-2026-08-04.md`, script
`emails/scripts/s4l-ad-foldin.mjs`).

**`seated-v7` superseded `seated-v6`** (2026-08-04, S4k — one row:
`ghxinc.com` is GHX Industrial, a SunSource company confirmed after the main
retag; audit `data/_rollup-retag2-2026-08-04.json`).

**`seated-v6` superseded `seated-v5`** (2026-08-03, the roll-up retag — 46 PE
roll-up subsidiaries moved to `pool-chains`, every kept row byte-identical;
audit `data/_rollup-retag-2026-08-04.json`, script
`emails/scripts/s4j-rollup-retag.mjs`, findings
`emails/handoff/industrial-contact-list/rollup-rosters [DONE]/02-rosters-2026-08-03.md`).

**`seated-v5` superseded `seated-v4`** (2026-08-02, the `thehoseshop.com` NAP
split — 8 cells on one row, everything else byte-identical; audit trail in
`data/_hoseshop-fix-2026-08-02.md`, script `emails/scripts/s4h-hoseshop-fix.mjs`).

**`seated-v4` superseded `seated-v3`** (2026-08-01, the Adaptall fold-in). It is
`seated-v3` plus one verified net-new company, minus seven that a branch census
proved are 30–92-branch national networks, plus seven **contact columns** —
`contact_first_name` / `_last_name` / `_title` / `_email` / `_email_status` /
`_linkedin` / `_source`. Eleven rows carry a named person; four of them are
inside `first-send-200`, and every one of those four is a sitting President.
Full account: `data/_adaptall-integration-2026-08-01.md`.

**Start with `first-send-200.csv`.** Every one of those 200 companies was read
individually. Measured manufacturer contamination is **1.5%**, against **14.8%**
across the wider list. The pilot is capped at ≤100 accounts anyway, so the
entire first campaign fits inside this file with room to spare.

---

## `first-send-200.csv` — the send list

200 rows, ranked best-first. Same columns as `seated-v4` plus two:

- **`verification`** — the individual verdict: `distributor`, `manufacturer`,
  `manufacturer-that-also-distributes`, `ambiguous`.
- **`verification_note`** — the one-line reason. Read this before writing copy
  for a company; it often contains the hook.

Full per-company reasoning: `data/_first-send-200-reasoning-2026-08-01.md`.
The 5 companies removed during verification: `lists/first-send-200-routed.csv`.

**Tier 1 (the founder-manual cohort) is 32 companies inside this file.** The
strict definition — three independent sources of evidence — yields 43 across
the whole list, short of Track 1's 50. Relaxing to two sources yields ~400.
That decision is still open.

---

## `seated-v9.csv` — the full qualified pool

2,773 rows. Everything that survived vertical filtering, chain suppression
(now including the PE roll-up subsidiary sweeps, S4j 2026-08-03 + S4k
2026-08-04), size scoring, ranking (now including the `ad_member` membership
term, S4l 2026-08-04) and the manufacturer audit. The 39 rows S4l promoted
from `pool-ranked-out` are AD buying-group members — vetted for independence
and scale by AD itself — but are largely unenriched: expect missing e-commerce
class and few emails until the next enrichment pass.

✅ *Resolved 2026-08-02:* `thehoseshop.com` was two companies in one row —
its declaration was The Hose Shop of Santa Cruz, CA while its NAP belonged to
The Hose Shop, Inc. of Somerset, NJ (`hoseshop.com`, its own row). v5 carries
the Santa Cruz NAP from the DFS Google-Business listing; see
`data/_hoseshop-fix-2026-08-02.md`. Its declaration is still nav junk with a
brand name in it — it must fail the declaration review, so the row sends E1-B.

**Read these columns first:**

| Column | What it is |
|---|---|
| `company_display` | **Use this in copy.** `company` is the normalized join key — lowercase, suffixes stripped. |
| `domain`, `email`, `phone_e164`, `address_1`/`city`/`state`/`zip5` | The contact record. Domain 100% populated; phone ~98%; email ~55%. |
| `self_declaration` | **The dealer's own sentence about the lines they carry, byte-exact as published.** The single best copy asset in the file. ~23% of rows have one. |
| `self_declaration_verbatim` | `true` = read off their own page. `false` = from a search snippet, which Google truncates. |
| `brand_authorized` | Manufacturer brands they demonstrably carry. **387 rows (~13%) have 2+.** |
| `line_card` | Product families/categories. **Not brands** — never treat as brand breadth. |
| `ecommerce_class` | `catalog_no_cart` is the sharpest prospect shape: products online, can't transact. |
| `sku_estimate` | **Ranking signal only, never a filter.** ~52% unknown, measured precision 0.60. |
| `segment` | A = fluid power · B = bearings/power transmission · C = general MRO |
| `tier` | T1 hot → T4. **T4 is $2–5M and must be reported separately** — that band rarely absorbs $10–30K, so its silence is not a copy failure. |
| `cohort` | `E` = the email came from a manufacturer's published directory, not the dealer. **Send these in their own campaign.** |
| `rank_score` / `rank_components` | The ordering and its breakdown, so any placement can be audited. |
| `source`, `source_url`, `captured` | Provenance. Every row has it. Required for CAN-SPAM lineage. |

### Three things to honour when sending from this file

1. **Cohort E (232 rows) goes in its own campaign.** Those emails were
   published by a manufacturer, not by the dealer. Their bounce rate is
   unmeasured and the program dies at 2%. Isolated, a bad batch can be killed;
   blended, it poisons every domain you send from.
2. **Never quote a `self_declaration` without checking it reads as a boast.**
   Three negated ones were caught and cleared — including a company that
   publishes *"We are a Non-Authorized Stocking Distributor."* The field is
   clean now, but the failure mode is bad enough to warrant an eye check.
3. **T4 gets measured separately** or you will misread its reply rate as a copy
   problem.

---

## Do not use

**Intermediate build stages.** `deduped-v1` … `deduped-v7`, `shortlist-v1`,
`shortlist-v2`, `seated-v1` … `seated-v8`. Each was superseded by the next, and
several carry known defects fixed downstream — `seated-v1` has ~445
manufacturers in it; `shortlist-v1`'s ordering is an artifact of which domains
had been enriched at the time. They are kept only so results can be reproduced.

**Superseded side pools.** Where a pool exists in several versions, the
**highest version number is current** (`pool-not-a-distributor-v10`, not the
unsuffixed file). The unsuffixed originals are the oldest, not the newest —
the easiest mistake to make in this directory.

---

## The side pools — nothing was ever deleted

| Pool (current version) | Rows | What it is |
|---|---|---|
| `pool-small-shops-v9` | 2,811 | **Below the $2M floor — inventory for the separate small-shops project.** |
| `pool-ranked-out-v10` | 13,695 | Qualified but below the rank cut. Real prospects; use to replenish. |
| `pool-segment-w-v8` | 4,447 | **No website found.** Candidates, not confirmed — a prior cohort lost 76% on verification. |
| `pool-not-a-distributor-v10` | 3,475 | Manufacturers, marketplaces, retail, wrong vertical. |
| `pool-adjacent-trades-v8` | 2,850 | Real B2B distributors in electrical, plumbing, HVAC. Wrong buyer for this offer, possibly right for another. S4l added 424 from AD's off-ICP division sweep. |
| `pool-usaspending-unmatched` | 3,711 | Federal contractors with no contact data. Identity-resolution backlog. |
| `pool-chains-v11` | 993 | National chains — Grainger, Motion, Applied, DXP, Kaman — plus 62 PE roll-up subsidiaries (Singer/MCE/SunSource) retagged by S4j/S4k/S4n 2026-08-03/04, and 4 AD-sourced chain rows (S4l). |
| `pool-non-us-v9` | 520 | Outside the US. |
| `pool-duplicate-sites-v8` | 782 | Same company on multiple domains. |
| `pool-above-ceiling-v9` | 110 | Genuine industrial distributors above the size ceiling. |

---

## What is still wrong

**Fine for the pilot. Must be fixed before scaling past the first 200.**

1. **~294 manufacturers (~10%) remain in the tail of `seated-v4`.** The
   detector runs 0.892 precision but only **0.27 recall** — it catches obvious
   cases and misses most. The top 200 measured 1.5%, so rank correlates with
   being a real distributor, but the tail is not clean.
2. **282 rows have an email whose domain doesn't match the company's.**
   Deliberately left in place rather than nulled on suspicion. Truelist
   verification should resolve most.
3. **`sku_estimate` is unknown on ~52% of rows** and 0.60 precise where present.
   Rank with it; never filter on it.

**And two things block sending entirely, whichever list you use:**

- **No suppression / DNC list exists anywhere in the repo.** The join is built
  and tested; there is no data to join. Nothing should send until you supply
  any prior-contact, opt-out or existing-customer list you have.
- **Sender warmup has never run** — not "is off", never, since the mailboxes
  were created in 2024. The four-week clock starts from zero. See
  `01-build-plan.md` §5r, which also recommends retiring both current domains.

---

## Before the first send: S5 → S6 → S7

The list is finished; the pipeline is not. Status as of 2026-08-02:

- **S5 is running on the pilot cohort** via the Apollo MCP connector (the G1
  block is over — working Apollo access exists in-session). Output lands in
  `data/s5-apollo-contacts-2026-08-02.csv`; fold-in to the seated list is a
  separate, later step.
- **S7's machinery is built:** `emails/scripts/s7-export.mjs` produces the
  micro-batch preview (≤50, campaign × body × segment, Cohort E isolated, T4
  separate, voided rows out, Segment C parked) and stamps `_DO-NOT-UPLOAD.md`
  until the send gates clear. The `{{declaration}}` review queue exists at
  `data/declaration-review-2026-08-02.csv` — Artur approves, then
  `node emails/scripts/declaration-review.mjs --extract`.
- **S6 (Truelist) remains gated on an account.** Nothing sends without
  `verify_state == ok`.

The original framing, still true:

- **S5 — Apollo** for named owner/president contacts (~55% of rows have an
  email now, and few are named individuals). **The Adaptall export arrived with
  `apollo_org_id` on 39 companies and `apollo_person_id` on all 623 contacts,
  plus paid revenue fields — so working Apollo access exists somewhere in the
  estate.** That is what G1 is blocked on. Worth chasing before budgeting for a
  new seat; see `data/_adaptall-integration-2026-08-01.md` §T4.
- **S6 — Truelist** verification. Nothing sends without `verify_state == ok`;
  raw lists bounce 20–40% against a 2% kill line.
- **S7 — export** to the sending tool in micro-campaigns of ≤50, 1–2 contacts
  per company, Cohort E isolated.

Expect 30–40% attrition across S5–S6. From 2,788 that projects to roughly
1,700–1,950 mailable contacts — inside the campaign pack's 1,400–2,000 target.
