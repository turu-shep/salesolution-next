# 00 · Internal context for the prospect-list build

**Mined:** 2026-08-01 · **Sources:** `docs/strategy/industrial-email-campaign/` (all 9 files), `docs/handoff/industrial-email-campaign/00-README.md`, `docs/strategy/icp/industrial-distribution.md`, `.agents/product-marketing-context.md`, `scripts/precall-scan.mjs`, repo-wide artifact search.

Everything below is quoted or restated from what is already written down. Nothing here is a new decision. Where the pack is silent, it says **GAP**.

---

## 1. ICP spec

### The one-line ICP (verbatim, `02-icp-targeting.md` §1)

> **Owner, president, or CEO of a US industrial distributor or technical manufacturer, $5M–$75M revenue.**

Restated identically in `docs/strategy/icp/industrial-distribution.md` (locked 2026-06-17) and `.agents/product-marketing-context.md` §Target Audience.

### Hard criteria

| Criterion | Value | Source |
|---|---|---|
| **Revenue band** | **$5M–$75M** | `02` §1 · icp doc · marketing context |
| **Geography** | **United States only.** `person_locations: ["United States"]` at pull time | `02` §4, `04` §8 |
| **Titles (primary)** | Owner, President, CEO, Chief Executive Officer, Managing Partner | `02` §2 payloads |
| **Seniorities (Apollo)** | `owner`, `founder`, `c_suite` | `02` §2 payloads |
| **Titles (secondary, downgrade only)** | VP Sales, Vice President of Sales, General Manager, Ecommerce Manager, E-commerce Manager | `02` §3 |
| **Employee proxy** | `organization_num_employees_ranges: ["15,150"]` — the pull filter, **not** the qualifier | `02` §1 |
| **SKU floor** | ≥200 SKUs visible (hard drop below). Segment C additionally qualifies on a **visible catalog of ≥1,000 SKUs** | `02` §2, §4 |
| **Business types** | Multi-brand distributors (hundreds of brands, tens of thousands of SKUs) **and** manufacturers (found direct, by spec and model) | `02` §1 · icp doc |

### Pass/fail, as written

**PASS requires all of:**
1. US-based (`person_locations` filter at pull).
2. Returned `annual_revenue` post-filters into $5M–$75M. *Apollo returns `annual_revenue` but will not filter on it — every row is post-filtered.*
3. Owner/president/CEO-class contact found (or a documented secondary substitute, never an addition).
4. ≥200 SKUs visible on their own catalog (≥1,000 for Segment C).
5. Their own e-commerce catalog, not a marketplace storefront.
6. `verify_state == ok` from the verifier (§ stage 2).
7. `source_url` present. **"A row with no `source_url` never enters a sequence, no matter how good the contact looks."**

**FAIL / disqualifiers (`02` §4, verbatim table):**

| Disqualifier | Handling |
|---|---|
| Under $5M revenue | **Disqualify gracefully** — capture email for the free-fixes one-pager. "That's how a disqualification becomes a referral." |
| Under 200 SKUs visible | Drop. |
| Marketplaces, pure Amazon sellers | Drop. |
| Non-US | Drop at pull time. CAN-SPAM scope + GDPR/PECR exposure. |

**Explicitly NOT disqualifying:** an existing agency or an in-house marketing person. Counters C1 and C2 already exist. *"A prospect with an agency has already decided this category is worth money."*

**Rows with no revenue returned** go to a `needs-review` bucket (`<out>.needs-review.csv`), never straight to sequence.

### Anti-persona (marketing context §Objections)

Industrial businesses below the $5M floor; buyers who want a one-time project rather than a system; anyone who responds to manufactured urgency.

### Language rules that bind list-adjacent copy

- **Their words:** quotes, RFQs, counter sales, line card, "our reps," "getting found for our parts," "Amazon and the manufacturers going direct."
- **Never cold:** schema, GEO, citation share, ERP, PIM, faceted navigation, CTR, coverage, impressions, pipeline, ARR.
- AI literacy "somewhat" — ChatGPT / Google AI Overviews / "the AI answer" are safe.

---

## 2. What the pack already says about list building

### Target list size — three numbers, all in `01-goal-math.md` §3

```
4–6 closes
  ← ~30–50 positive replies
  ← ~70–120 replies                    (positive ≈ 40–50% of replies)
  ← ~1,400–2,000 contacts in sequence  (reply 6–7.6% at owner titles, manufacturing)
  ← ~2,500–3,500 raw Apollo pulls      (verification + dedupe culls 30–40%)
```

- **Seated target: 1,400–2,000 verified contacts in sequence.**
- **Raw pull target: 2,500–3,500.** Overpull **2–3×** (`02` §5).
- Cull rate is not conservatism: **Apollo email accuracy runs 60–80%**, raw sends bounce 20–40% against a 2% kill line.
- Handoff "Done looks like": *"1,400–2,000 verified contacts in sequence, every row carrying `source_url`, `pulled_at`, `source_provider`, `segment`, `verify_state`, and `annual_revenue`."*

### The three segments (`02` §2, priority order)

| Seg | Definition | `q_keywords` (verbatim) | Angle |
|---|---|---|---|
| **A** | Fluid power & hydraulics distributors — hose and fittings, pneumatics, hydraulic components. The Parker / Enerpac / Rexroth world. **Highest priority, first pull, first sends.** | `fluid power hydraulics hose and fittings pneumatics` | 1 + 2 (Angle 2's natural home) |
| **B** | Bearings & power transmission — bearings, motors and drives, belts. Same line-card structure as A. | `bearings power transmission motors and drives belts` | 1 + 2 |
| **C** | General MRO / industrial supply with a live e-commerce catalog. Broadest pool, loosest fit. Qualify hard on ≥1,000 visible SKUs. | `industrial supply MRO industrial distributor industrial products` | **Angle 1 only** |

All three payloads share: `person_seniorities`, `person_titles`, `person_locations: ["United States"]`, `organization_num_employees_ranges: ["15,150"]`, `per_page: 100`, `page: 1`, `reveal_personal_emails: false`.

**Pull per segment, never one blended query** — "so a weak segment is visible before it's diluted."

### Sources named in the pack

| Stage | Tool named | Status |
|---|---|---|
| **Pull** | **Apollo REST** (`mixed_people/search`, `organizations/enrich`). *"No Apollo MCP exists — REST only."* | Gated on **G1** (paid key) |
| **Verify** | **Truelist** (has an MCP + bulk CSV path; bulk CSV is right at ≥300 contacts, runs at 10 req/sec) | Needs a Truelist account (not a lettered gate) |
| **Enrich/scan** | **DataForSEO** (MCP already connected in-session, or REST) + the existing `/api/probe` scorer | MCP path needs no key; REST path needs PF-6 |
| **Send** | **Instantly** (recommended) or **Smartlead** | Gated on **G2** |

**That is the entire list-source inventory.** No trade-association directory, no ThomasNet/IndustryNet/MDM/DSG list, no manufacturer line-card reverse-lookup, no BuiltWith/e-commerce-platform firmographic source, no state business registry, no conference/exhibitor list, and no manual-build fallback are named anywhere in the pack. **GAP — see §8.**

### Send volume the list must support (`04` §3 ramp × `01` §4 capacity)

| Track | Window | Per-mailbox/day | Contacts it reaches |
|---|---|---|---|
| Track 1 — founder-manual | weeks 1–4 (Aug 10 – Sep 4) | ≤15/day total | **~250** |
| Track 2 — warmed domains | weeks 5–8 (Sep 1 – Sep 29) | 20 → 30 → 40 → 50 | **~1,200–1,500** |
| | | **Total** | **~1,500–1,750** |

Track 2 ceiling range **120–450/day** depending on 6 vs 9 mailboxes. Working days only, send window 4–7pm recipient-local, Tuesday–Thursday bias (Thursday peaks at 6.87% reply).

> `01` §4, verbatim: *"Inside the required range. At the bottom of it. There is no slack."*

**List replenishment is a standing weekly task**, not a one-time build (`06` weekly loop item 3: *"Pull, verify, and post-filter enough to keep 2–3 weeks of sending queued. Running the list dry in week 6 costs more than any copy problem."*). D-01 compounds it: a contact who finishes 5 touches with zero engagement is **retired for 90 days**, so replenishment must cover the retired pool too.

### Packing rules (`02` §5) — these shape the list structure, not just the send

1. **1–2 contacts per company, hard cap.** 1–2/company reply at **7.8%**; ten or more drops to **3.8%**. The second contact must be a genuinely different reader (owner + e-commerce manager), never two peers. *"Never pull both and count them as two."*
2. **Micro-campaigns of ≤50 contacts.** ≤50-contact campaigns reply **2.76×** higher. A 1,500-contact list is **30+ micro-campaigns**, not three big ones — grouped by segment × angle.
3. **Overpull 2–3×.**
4. **SKU count is the deal-size lever** — order the send queue by it. Segment A prospects with long line cards go first.

### Lineage columns required on every row (`02` §6)

`source_url` · `pulled_at` · `source_provider` · `segment` · `verify_state` · `annual_revenue`

Three standing rules with it: `reveal_personal_emails` stays **off**; licensed-provider data used within ToS, never shared or resold; no `source_url` = no sequence.

---

## 3. Angle → segment mapping

| | **Angle 1 — "The AI answer skips your catalog"** | **Angle 2 — "The line-card gap"** |
|---|---|---|
| **Status** | **CLEARED.** Ships day 1. | **DRAFTED, GATE:HUMAN (G3).** Zero sends until signed. |
| **Segments** | A, B, C — all three | **A and B only.** C is Angle 1 only "until G3 clears Angle 2 — and probably after," because MRO houses have shallow line cards. |
| **Prospect type it needs** | Any qualifying distributor/manufacturer with a live catalog ≥200 SKUs. Personalization needs an **AI-answer check result** (`competitor_named`) or degrades to Opener B, which needs no scan at all. | A prospect with a **findable `/line-card`, `/brands`, or `/manufacturers` page** and a **countable per-brand listed-SKU gap.** No line-card page → the contact routes to Angle 1. |
| **Deal shape** | Standard $9–24K / Pro $7–21K first deals | **Expansion $24–36K.** Headline case: 10,000 added SKUs × $3.00 = $30,000 |
| **List consequence** | Baseline. Segments in priority order A > B > C. | **Angle 2 is where the size is; Angle 1 is where the certainty is.** Route (i) in `01` §2 (2 expansion deals ≈ $60K) needs "Segment A prospects with long line cards." Declining G3 re-weights the whole plan onto the volume route (iii), which needs *double* the closes and therefore double the top of funnel. |

**Segment A is the priority for both reasons at once** — first pull, first sends, and the only place expansion-size deals live.

Two additional list-relevant angle constraints from `03`:
- **Segment C, `{{category}}`:** never "industrial supply" — too broad to be an observation. Use their single biggest visible category from their nav. *"Default when the scan is thin: don't send."* So Segment C rows without a captured category are **not sendable**, which effectively raises C's scan requirement above A and B.
- **`{{first_name}}` and `{{company}}` are no-send fields.** A row missing either drops out of the list or routes to the manual-research queue. That is a hard list-build acceptance criterion, not a copy note.

Angle 2 also carries an unresolved deliverable conflict (G3 item d): A2-E2 promises a per-brand listed-SKU count that `/catalog-snapshot/` does not currently deliver.

---

## 4. The pipeline already specced (`05-automation-pipeline.md`)

```
1 PULL → 2 VERIFY → 3 SCAN → 4 DRAFT → 5 QA → 6 SEND → 7 REPLIES → 8 MEASURE
Apollo    Truelist    DFS+probe  Claude   Claude  Instantly  human    ledger
```

**All scripts in `05` are specs, not code. `scripts/apollo-pull.mjs` does not exist** (confirmed: not in `scripts/`).

### Stage 1 · PULL

- **Tool:** Apollo REST. **Gate G1.** In: the three payloads. Out: `data/campaign/apollo-<segment>-<date>.csv`, 2,500–3,500 rows. (**`data/` does not exist in the repo yet.**)
- **Reference implementation:** `scripts/precall-scan.mjs:105` — extend the `apollo(path, body)` helper, "do not start a new client."
- **Behavior spec:** `--segment a|b|c`, `--pages N` (default 5), `--out <path>`, `--dry-run`; `per_page ≤100`, ~100 req/min, 50,000-result search cap, sleep between pages; post-filter `annual_revenue`; enforce 1–2/company at write time keyed on org id; write lineage columns; `reveal_personal_emails: false` always; print pulled / revenue-filtered / company-capped / written.
- **Two open technical risks the pack itself flags:**
  1. **`q_keywords` is undocumented** in Apollo's public API reference but "implemented and working." *"Verify on the first pull that it actually narrows the result set; if it silently no-ops, the segments collapse into one pool and the fallback is industry codes plus manual triage."*
  2. **Endpoint/auth discrepancy.** `POST /api/v1/mixed_people/search` + `X-Api-Key` header is the working reference (that's what `precall-scan.mjs` does). The docs form is `POST /mixed_people/api_search`. Confirm on first paid run; record which worked in the ledger.
- Bulk enrichment caps at **10 records per request**.

### Stage 2 · VERIFY

Four buckets, four files: `ok` → send (only bucket entering a normal sequence) · `email_invalid` → drop to a visible invalid file ("the drop rate is a signal about the pull") · `accept_all` → **quarantine to its own catch-all sending domain**, low volume, sent last, never in a Track 1 batch · `risky`/`unknown` → **skip**, keep for a later re-verify pass. Re-verify anything older than 30 days (D-02).

### Stage 3 · SCAN

Four checks per prospect: **line card** (fetch `/line-card`, `/brands`, `/manufacturers`; individual prospect sites only, never a marketplace/platform/aggregator) · **listed SKUs per brand** (DataForSEO `site:` query or their own category pagination; record which was used) · **AI-answer check** ("who sells {{category}} in {{region}}", record exactly who was named) · **probe score** (`/api/probe` on three product URLs, use the lowest).

Output contract is a flat JSON per prospect — `domain, company, segment, brand, listed_skus, line_card_brands, ai_named, competitor_named, ai_query, probe_score, site_speed, scanned_at`. **Every field is a measured value or `null`. There is no "estimated" state.**

Two paths: **Path A** — in-session via the already-connected DataForSEO MCP, zero new keys, "a 50-domain pilot batch can be personalized in-session before any key is bought. Do it in week 0." **Path B** — scripted REST, blocked on PF-6 (env alias) and PF-7 (CSV parser).

**Cost: ~5 API calls per prospect. 200 domains ≈ 1,000 calls.** State the batch limit before running.

**D-04 acceptance bar:** the 50-domain pilot must produce observation lines with a **fallback rate under 50%**. At or above 50%, the scan stage gets reworked before launch.

Stages 4–8 (draft / QA / send / replies / measure) are downstream of the list and summarized only where they constrain it: micro-campaigns of ≤50 one-segment-one-angle each (stage 6); kill/scale reweights segment share (stage 8: a segment at 2× benchmark doubles its next-cycle share, taken from the weakest segment, not from the total; a segment under half benchmark after 200 sends pauses — "check the observation quality before blaming the copy").

### Where "list acquisition" is underspecified

The pack specifies **how to pull, filter, dedupe, verify, and lineage-tag** a list. It does not specify **where the list comes from beyond a single vendor.** Concretely:

1. **Single-source dependency.** Apollo is the only acquisition source named. If G1 is declined or delayed, `05` stage 1 "returns nothing" and there is no documented alternative. `03-execution-plays.md` (company-strategy pack) has a one-clause fallback — *"Apollo if the key exists; manual build otherwise"* — but "manual build otherwise" is never specified anywhere.
2. **`q_keywords` may no-op**, and the stated fallback ("industry codes plus manual triage") is one clause with no industry-code list, no SIC/NAICS mapping, and no triage procedure.
3. **No TAM sizing per segment.** `01` gives funnel math (how many contacts we need) but never asks whether Apollo can *return* 2,500–3,500 owner-title rows across three narrow industrial segments at 15–150 employees in the US. There is no estimate of the addressable universe per segment and no plan for what happens if Segment A alone can only produce 400 companies.
4. **No domain-first path.** The scan (stage 3) is domain-keyed; Apollo is person-keyed. The pack notes the scanner is "domain-second by design" and says to invert via `--seed-csv`, but there is no source that yields *domains* (e.g. a catalog-platform or line-card crawl) to feed the reverse direction.
5. **No dedupe against existing contacts.** Nothing checks the pulled list against HubSpot inbound leads, the `precallLead` Sanity docs, the internal do-not-call list, or previously-emailed contacts, other than the suppression sync at send time. Suppression is enforced at stage 6 load, not at pull.
6. **No named tier/scoring model.** `02` §5 says "SKU count is the deal-size lever … use it to order the send queue," and `04` §2 references a "top-50 hot tier" for Track 1 — but the tiering rule that produces that top-50 is never written down.
7. **Segment C's ≥1,000-SKU qualifier has no stated acquisition method.** Visible-catalog size is a scan output (stage 3), which runs *after* verification (stage 2) — so C rows are paid for and verified before they can be disqualified.
8. **No cost model for the list itself.** $300–500 is budgeted for the sender (G2); Apollo's paid tier and Truelist are both named as required but neither is priced, and Apollo's `email` field is credit-metered on top of the subscription.

---

## 5. Gates and pre-flight items — status as written, and what blocks LIST work

**All seven gates are `OPEN`. All nine pre-flight items are `OPEN`.** Nothing is signed. Gate rows are Artur's alone — "No session flips a gate, and no session softens one."

| Gate | Decision | Blocks | **Blocks LIST work?** |
|---|---|---|---|
| **G1** | Buy Apollo paid tier, `APOLLO_API_KEY` into `.env.local` | "All list building" | **YES — the only hard list blocker.** Stage 1 returns nothing without it. |
| **G2** | Instantly/Smartlead + 2–3 sending domains, ~$300–500 | Track 2 entirely; longest lead (4-week warm-up) | **No** — sending only. But it sets the *deadline* the list must be ready by. |
| **G3** | Angle 2: expansion framing, dropship language, brand naming, Catalog AI page block | Every Angle-2 send | **Partially — it changes the list's shape, not its existence.** Declining re-weights toward volume route (iii), which needs roughly double the top of funnel, and demotes the "long line card" ranking signal. Segments A/B still get pulled either way. |
| **G4** | Three new objection counters (IND5/6/7) | Reply handling on Angle 2 | **No.** |
| **G5** | Track 1 founder-manual sending, days 1–28 | The 60-day goal itself | **Partially.** Declining removes ~250 contacts of week-1–4 demand and, per `06`, "use weeks 1–4 for list depth and scan coverage instead" — it changes list *sequencing*, not the target. |
| **G6** | PF-2 (revenue band), PF-3 (SKU floor), PF-4 (`/catalog-snapshot/` URL), PF-8 (NAP sweep) | Traffic to `/catalog-snapshot/` and the CAN-SPAM footer | **PF-2 and PF-3 bite the list directly** — see below. PF-4/PF-8 are send-side. |
| **G7** | Which booking link the reply CTA hands out | Positive-reply triage | **No.** "Two minutes to close." |

### Pre-flight items, list-relevance

| PF | Sev | Authority | Blocks LIST? |
|---|---|---|---|
| **PF-1** | S2 | PROPOSED (copy), urgent | No — landing-page claim |
| **PF-2** | S2 | GATE:HUMAN G6 | **YES, materially.** The campaign targets **$5M–$75M**; `/catalog-snapshot/` says **$2M–$50M**. Until someone picks a band, the list's own revenue post-filter is arguing with the page it sends people to. This is the single gated item that changes a list criterion. |
| **PF-3** | S3 | GATE:HUMAN G6 | **YES, partially.** The SKU floor contradicts itself: "strong fit" 1,000+, "skip it" under 200, FAQ says under 1,000 the $3,000 minimum "doesn't amortize well." Our disqualifier is 200. The 200–999 band is both a fit and not a fit — and the campaign "will send people into that ambiguity by design." |
| **PF-4** | S2 | GATE:HUMAN G6 | No — URL stability, send-side |
| **PF-5** | S3 | Autonomous | No — `brand/tools.yaml` stale |
| **PF-6** | S3 | **Autonomous, one line** | **YES for the scripted scan path.** `precall-scan.mjs:43` reads `DFS_LOGIN`/`DFS_PASSWORD`; `.env.local` has `DATAFORSEO_USERNAME`/`DATAFORSEO_PASSWORD` (**verified — that is exactly what's in the file**). "Cheapest fix on the list by a wide margin." |
| **PF-7** | S3 | Autonomous (build session) | **YES.** `parseCsv()` at `precall-scan.mjs:173` splits on `,` with no quote handling. *"Swap in a real parser before importing anything from stage 1."* Apollo exports carry commas inside company names routinely. |
| **PF-8** | S2 | GATE:HUMAN G6 | No — footer/CAN-SPAM, blocks first send |
| **PF-9** | S4 | Autonomous | No, but `APOLLO_API_KEY` is about to land in one of two drifting secret stores. **Verified: `ss local env` exists at repo root with 16 keys** and is a subset of `.env.local`. |

**Summary for list work: G1 is the only hard blocker. PF-6 and PF-7 are autonomous fixes that block the scripted path. PF-2 (revenue band) and PF-3 (SKU floor) are gated decisions that change list criteria. Everything else gates sending, not sourcing.**

---

## 6. `precall-scan.mjs` capabilities

**One line:** a Sanity-backed, GBP-seeded local-service prospect scanner that pulls Google Business Profile + map-pack + Lighthouse + AI-answer signals per prospect, synthesizes them into ranked "leaks" and a cold-call opener, and carries a working Apollo REST client that can enrich a domain into an owner name/title/email/phone.

| | |
|---|---|
| **Path** | `/Users/artur/Documents/Projects/Salesolution new/scripts/precall-scan.mjs` (451 lines) |
| **Commands** | `--status` · `--seed-search <cfg.json>` · `--seed-csv <file> --vertical <v> --source <s>` · `--scan --limit N` (default 100) · `--export [--today] --out <file>` · `--dry-run` |
| **Store** | Sanity `precallLead` docs. Status lifecycle `queued` → `scanned` \| `error`. `--scan` retries errored leads. |
| **Env expected** | `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_API_WRITE_TOKEN` (all present) · **`DFS_LOGIN` / `DFS_PASSWORD`** (required for `--scan`/`--seed-search`; **absent — `.env.local` has `DATAFORSEO_USERNAME`/`DATAFORSEO_PASSWORD` instead → PF-6**) · **`APOLLO_API_KEY`** (optional; **absent → G1**) · `DFS_AI_PATH` (default `ai_optimization/chat_gpt/llm_responses/live/advanced`, "confirm on first live run") |
| **Env loader** | `loadEnv()` at line 32 — reads `.env.local` line by line, does not overwrite already-set vars. |

### Apollo client — `apollo(path, body)`, line 105

```js
async function apollo(path, body) {
  if (!APOLLO_KEY) return null
  const res = await fetch(`https://api.apollo.io/api/v1/${path}`, {
    method: 'POST',
    headers: { 'X-Api-Key': APOLLO_KEY, 'Content-Type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) return null
  return res.json()
}
```

- **Base:** `https://api.apollo.io/api/v1/{path}` · **Auth:** `X-Api-Key` header · POST-only.
- **Endpoints already called** (`scanOwner()`, line 275): `organizations/enrich` `{ domain }` and `mixed_people/search` `{ q_organization_domains, person_seniorities: ['owner','founder','partner'], page, per_page }`.
- **What it can fetch today:** given a domain, the owner's `first_name`/`last_name`, `title`, `email`, and org phone. That is exactly the shape stage 1 needs, minus pagination, revenue post-filtering, per-company capping, and CSV writing.
- **Failure mode to fix when extending:** it **silently returns `null`** on a missing key or any non-2xx (including a 401 on an unpaid tier). The `apollo-pull.mjs` spec explicitly requires the opposite: *"Exit with a clear message if `APOLLO_API_KEY` is absent — never silently return empty."*

### DataForSEO endpoints it already uses

`business_data/business_listings/search/live` (GBP seed + lookup) · `serp/google/organic/live/advanced` (map-pack rank, mobile, depth 20) · `on_page/lighthouse/live/json` (perf score, LCP, TTFB, bytes, CMS) · `DFS_AI_PATH` (AI presence, best-effort, wrapped so a failure never blocks a scan).

### Seams the pack wants reused

- **`seedCsv()` / `parseCsv()` (lines 173–195)** — accepts headers `name|business, city, region|state, phone, website|site, address`. This is the Apollo-import seam, and it is the one **PF-7** says is broken.
- **`runExport()` (lines 419–435)** — emits a cards JSON (`prospect, phone, vertical, items[{action, detail, openerFuel}]`), the natural hand-off into stage 4.
- **Directional mismatch to invert:** the scanner is **domain-second** (seeds from GBP listings, only fetches an owner when a lead already has a website). An Apollo-sourced list is **domain-first** — seed from Apollo, then scan. `--seed-csv` is the stated seam.
- **Not reusable as-is:** `mapItemToLead()`, `VERTICAL_WORD`, `synthesize()`, and `buildOpener()` are all local-service shaped (dentist/roofer/shop, map pack, reviews, photos). None of the six leak types maps to the industrial angles (line-card gap, duplicate manufacturer copy, catalog readability). The industrial scan output contract in `05` §3 is a different object entirely.
- **Throttling already in place:** `sleep(500)` between leads, `sleep(400)` between seed cities. Per-prospect failures are caught and the lead is marked `status: error` with a reason, so a batch always finishes.

### Never run live

`docs/strategy/sales/11-precall-scanner.md` (2026-06-24): *"built, not yet run live — pending the DataForSEO + Apollo REST keys."* Cost note there matches the pack: **~5 calls/prospect ≈ 500 API calls per 100-lead night.**

---

## 7. Existing prospect artifacts in the repo

**None.** No prospect list, no lead list, no Apollo export, no segment CSV exists anywhere in the tracked or untracked tree.

Searches run: `git ls-files | grep -iE 'prospect|leads|apollo|outreach'`; `git ls-files | grep -iE '\.csv$'`; `find . -name '*.csv'` excluding `node_modules`/`.git`/`.next`.

| Found | What it actually is |
|---|---|
| `app/strategy/offers/dentist/outreach/page.tsx` | The dentist **outreach manual** page (gated `/strategy`). Copy, not contacts. |
| `lib/strategy/docs/dentist-outreach-manual.ts` | Its content module. Same. |
| `seo-project/data/Pages.csv`, `Queries.csv` | GSC exports (our own site's performance). |
| `analysis/gsc/Pages.csv`, `Queries.csv` | Engine data-input copies of the same. |
| `backup/.claude/worktrees/**/*.csv` | ClickUp exports from an unrelated project ("Field Advisor"). Noise. |
| `scripts/precall.targets.json` | **The closest thing to a list artifact:** a 617-byte DataForSEO GBP seed config — dental (Miami, Hialeah, Coral Gables) and home-services/roofing (Tampa). **Local-service only. Zero industrial rows.** |
| Sanity `precallLead` docs | Unknown count; scanner was never run live, so presumed empty or near-empty. **All local-service** by schema (`vertical: dental \| medical \| home-services \| local-retail \| other`). |

**Not present:** `scripts/apollo-pull.mjs`, any `data/` directory, any `data/campaign/` directory, `APOLLO_API_KEY` in either secret store, `DFS_LOGIN`/`DFS_PASSWORD` in either secret store.

**Env inventory (names only, verified):** `.env.local` has 27 keys including `DATAFORSEO_USERNAME`, `DATAFORSEO_PASSWORD`, `OPENAI_API_KEY`, `HUBSPOT_*`, `RESEND_*`, `NEXT_PUBLIC_CALENDLY_URL`, `SANITY_*`. `ss local env` (PF-9) has 16, all a subset. Neither has Apollo or Truelist.

---

## 8. Contradictions and overlap risks for the new `/emails` workspace

### A. Two Apollo doctrines already exist in the repo, and they disagree on the tool

- `docs/strategy/sales/00-build-and-cockpit-design.md:20, 154–160` — the cold-call cockpit: *"Apollo list-building and CRM stay a **prep step** run via the **Apollo MCP** between call blocks."* Repeated at `README.md:33`.
- `docs/strategy/industrial-email-campaign/05-automation-pipeline.md` stage 1 — *"**No Apollo MCP exists** — REST only."*

**Both cannot be true.** The email pack is the newer document (2026-07-28 vs 2026-06). The `/emails` workspace should assume REST and treat the sales pack's MCP references as stale, but the sales pack has not been amended and will mislead anyone reading it first.

### B. A second, different industrial segmentation is already recorded as a decision

`docs/handoff/company-strategy/v1/08-decision-queue.md` **DQ-4** and `03-execution-plays.md` **P3** say the first two ≤50 industrial segments are **hydraulics/fluid-power + fasteners/MRO adjacents** ("domains where the claims banks and case-study material already live").

The campaign pack's Segment B is **bearings and power transmission**, not fasteners. **Fasteners appear nowhere in `02-icp-targeting.md`.** A new list build has to pick one; picking silently splits the two packs' segment attribution permanently.

### C. P3's validation gate is stricter and earlier than the email pack's

`03-execution-plays.md` P3: the industrial outbound lane opens as a **2-week test, 2 segments, ≤100 accounts total**, and *"earns its permanent daily block only if reply rate ≥2% or ≥1 Growth Call books by week 3. If it fails: shrink to LinkedIn-only."*

The email pack sizes for **1,400–2,000 contacts** immediately and sets its stop line at **under 5% reply by week 6**. These are two different bets on the same motion. A ≤100-account validation gate and a 2,500–3,500-row pull are not the same first move.

### D. Suppression is shared, and the pull does not check it

`04` §6: the campaign's suppression list is *"the **same list as the internal do-not-call list** in `docs/strategy/sales/07-compliance.md`. A prospect who says 'take me off' on a phone call must not receive an email on Tuesday."* That compliance doc runs a company-specific internal DNC list, an owner-cell scrub rule, and a "honor it immediately, outside limit 10 business days" standard.

**But nothing in stage 1 or stage 2 checks a pull against it.** Suppression is enforced at stage 6 (blocklist synced before release). A list built in `/emails` that ships straight to a sequence without a suppression join risks emailing someone Artur already took off the call list — the exact failure `04` §6 names. This is the highest-consequence gap of the eight in §4.

### E. Two doors, two lists, hard separation

`01-strategy-overview.md:30, 189`: *"Two separate Apollo lists, one per motion. Never one combined list."* Handoff guardrail: *"Industrial door only… No contact in this campaign ever sees a Revenue Engine door."* Any `/emails` list schema has to carry the motion, and `precallLead` (local-service) must never merge into it.

### F. Revenue band and SKU floor are contested on live pages

PF-2 ($5M–$75M vs $2M–$50M) and PF-3 (200 vs 1,000 SKUs). If `/emails` writes an ICP spec, it will be the **fourth** place these numbers live (icp doc, marketing context, `02-icp-targeting.md`, the `/catalog-snapshot/` components). Reference `02` §1 and §4; do not restate the numbers as if newly decided.

### G. Duplication risk against the pack itself

`02-icp-targeting.md` already **is** the list recipe — *"This file is the recipe, literally — the JSON below is what `scripts/apollo-pull.mjs` posts."* A `/emails` doc that re-specifies segments, payloads, disqualifiers, packing rules, or lineage columns creates two sources of truth for the thing the campaign ledger is explicitly designed to prevent drifting. The non-duplicating contribution is the part `02` **doesn't** cover: source discovery beyond Apollo, per-segment TAM, the fallback when `q_keywords` no-ops, the tiering rule behind the "top-50 hot tier," and the suppression/dedupe join.

### H. Copy ownership

`00-README.md` file map: `03-angles-and-copy.md` is *"Written separately — do not edit from this pack's sessions."* And the handoff guardrail: *"GATE-signed copy is untouchable."* An `/emails` workspace that generates sequence copy will collide with a file that is already frozen-by-convention and whose Angle 2 half is unsigned.

### I. Metered APIs

Three bill per call: **DataForSEO, Apollo, OpenAI.** Apollo's `email` field on search results is credit-metered *on top of* the subscription. *"State the batch limit before any run that touches them. No unbounded loops, no 'let's just scan the whole list and see.'"*

---

## Appendix · Numbers worth not re-deriving

| Number | Meaning | Source tag |
|---|---|---|
| 6.1% | Manufacturing-sector reply rate | [playbook] |
| 7.63% | CEO/founder-title reply rate | [playbook] |
| 4.1% | North America overall reply | [playbook] |
| 4–5.8% | Campaign-average reply (5–10% = good) | [playbook] |
| **2.76×** | Reply lift for campaigns ≤50 contacts | [playbook] |
| **7.8% vs 3.8%** | 1–2 contacts/company vs 10+ | [playbook] |
| ~48% | Share of replies that are positive (plan 40–50%) | [playbook] |
| 60–80% | Apollo email accuracy → 20–40% raw bounce | [playbook] |
| 2% / 0.3% / 5% | Bounce halt / complaint permanent-halt / reply stop-line | [our page] |
| 6.87% | Thursday reply peak | [playbook] |
| 27% vs 9% | 4–7 touch sequences vs 1–3 | [playbook] |
| $3 / $7 / from $15K/mo | Standard / Pro / Enterprise per-SKU rates | [catalog pricing] |
| $30,000 | 10,000 added SKUs × $3.00 — the headline expansion deal (**disputed: sits exactly on the 10K volume break, could be $25,000**) | [catalog pricing] |
