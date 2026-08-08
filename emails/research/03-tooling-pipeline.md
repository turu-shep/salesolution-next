# 03 · Tooling and pipeline feasibility — US industrial-dealer list build

**Created:** 2026-08-01 · **Scope:** what can be built today, what needs a purchase, what needs a fix
**Method:** env-key inventory (names only), one live DataForSEO call, code read of the existing Apollo client, on-paper assessment of two DFS endpoints, and the two named pack docs.

---

## 1. Capability matrix

| Tool / capability | Works today? | Evidence | Blocker |
|---|---|---|---|
| **DFS business listings (source US dealers)** | **YES** | Live call returned `status_code: 20000`, 10 Chicago-metro industrial listings with websites, phones, ZIPs, ratings | None. MCP auth is live |
| **DFS listings → email addresses** | **PARTIAL, free** | `contact_info[]` returned named + role mailboxes on 4 of 10 records (`source: "backlinks"`) | Provenance is scraped, not licensed. Compliance call needed (see §6) |
| **DFS listings → "no website" flag** | **YES** | 1 of 10 records had no `url`/`domain` key at all | `is_claimed` defaults `true` and hides unclaimed listings — set `false` to see the null-website tail |
| **DFS `domain_technologies` (e-comm detect)** | **LIKELY**, unproven here | Schema takes a single `target` domain; DFS taxonomy covers Shopify/Magento/WooCommerce/BigCommerce | Absent ≠ no e-comm (§3b). 1 task per domain = the costly stage |
| **DFS `whois_overview` (new domains)** | **WEAK fit** | Schema is filter-driven, no `target`; `domain like %hydraulic%` + `created_datetime >` is expressible | DFS whois DB is index-derived, not zone-file. New domains are the least likely to be in it (§3a) |
| **DFS REST from scripts** | **NO** | `precall-scan.mjs:43` reads `DFS_LOGIN`/`DFS_PASSWORD`; `.env.local` has `DATAFORSEO_USERNAME`/`DATAFORSEO_PASSWORD` | PF-6, one-line alias. MCP path unaffected |
| **Apollo org + people enrichment** | **NO** | Client exists and is sound (`precall-scan.mjs:105`), key absent | `APOLLO_API_KEY` missing + paid tier gate (G1) |
| **Playwright scraping** | **YES** | `playwright@1.60.0` is a committed devDependency, installed, chromium builds cached | None. Node v20.16.0, no `engines` pin |
| **Plain-fetch scraping (JSON/HTML)** | **YES** | Node 20 global `fetch`; `precall-scan.mjs` already uses it against DFS | None |
| **Email verification (Truelist)** | **NO** | Named in `05:52`; no `TRUELIST_*` key, no Truelist MCP in this session | Account purchase |
| **Sending (Instantly)** | **NO** | Named in `04 §4`; no `INSTANTLY_*` key | G2 purchase + 4-week warm-up |
| **Sanity as list store** | **YES** | `SANITY_API_WRITE_TOKEN` + project/dataset present; `precallLead` doc type already ships | None |
| **Resend** | Present, **do not use** | `04:108` — transactional sender on the primary domain | Cold volume through it burns brand reputation |

### Env keys present (names only)

`CRON_SECRET` · `DATAFORSEO_PASSWORD` · `DATAFORSEO_USERNAME` · `GA4_API_SECRET` · `GA4_MEASUREMENT_ID` · `HUBSPOT_FORM_ID` · `HUBSPOT_PORTAL_ID` · `NEXT_PUBLIC_CALENDLY_URL` · `NEXT_PUBLIC_GA4_ID` · `NEXT_PUBLIC_GOOGLE_ADS_ID` · `NEXT_PUBLIC_HUBSPOT_PORTAL_ID` · `NEXT_PUBLIC_META_PIXEL_ID` · `NEXT_PUBLIC_SANITY_API_VERSION` · `NEXT_PUBLIC_SANITY_DATASET` · `NEXT_PUBLIC_SANITY_PROJECT_ID` · `OPENAI_API_KEY` · `PROBE_AI_MOCK` · `PROBE_GATE_SECRET` · `RESEND_API_KEY` · `RESEND_FROM_EMAIL` · `RESEND_TO_EMAIL` · `SALES_ENABLED` · `SALES_PASSWORD` · `SALES_SESSION_SECRET` · `SANITY_API_READ_TOKEN` · `SANITY_API_WRITE_TOKEN` · `SANITY_PREVIEW_SECRET`

**Absent and needed:** `APOLLO_API_KEY`, `TRUELIST_*`, `INSTANTLY_*` (or `SMARTLEAD_*`), and the `DFS_LOGIN`/`DFS_PASSWORD` aliases the existing script expects. No Hunter / NeverBounce / ZeroBounce keys either — Truelist is the pack's pick and nothing competing is provisioned.

---

## 2. The DataForSEO test call

**Request:** `business_data_business_listings_search`, `categories: ["industrial_equipment_supplier"]`, `location_coordinate: "41.8781,-87.6298,50"` (Chicago, 50km), `limit: 10`.

**Result: `status_code: 20000`, `"Ok."`, 10 items.** Auth through the MCP is live and needs no new key. Note this is the MCP's own credential path — it does **not** prove the `.env.local` DataForSEO pair works for the REST scripts (PF-6 still stands).

### Fields returned, and what each is worth to the list

| Field | Present on | Pipeline use |
|---|---|---|
| `title` | all | Company name → dedupe key |
| `url` + `domain` | **9 of 10** | The qualifier spine. Missing on 1 → **null-website bucket, detectable for free** |
| `phone` (+ `contact_info[].telephone`) | all | Dedupe key #2; several records carried 2–5 numbers |
| `address` + `address_info{address, city, zip, region, country_code}` | all | Dedupe key #3 (ZIP); US-only filter |
| `category`, `category_ids[]`, `additional_categories[]` | all | Segment routing (A fluid power / B bearings-PT / C general MRO) |
| `rating{value, votes_count}` + `rating_distribution` | 6 of 10 | Size proxy, neglect signal; filterable and sortable server-side |
| `contact_info[].mail` | **4 of 10** | **Emails, free.** Mix of role (`sales@`, `info@`) and named (`bsherwood@wwmh.net`, `CJSchultz@rmbsales.com`). `source: "backlinks"` |
| `people_also_search[]` | all | Up to 5 named competitors with ratings — cross-brand/competitor matching seed, and the `competitor_named` slot in the drafting prompt |
| `work_time.work_hours.current_status` | 7 of 10 | Hard disqualifier: one record read `temporarily_closed` |
| `description` | 4 of 10 | Free positioning text — brands carried, "distributes", "manufactures" language |
| `services[]` | 1 of 10 | Category + service title pairs |
| `is_claimed` | 5 of 10 | Ownership signal; **request param defaults `true`** |
| `total_photos`, `logo`, `main_image` | all | Neglect proxy |
| `latitude` / `longitude` | all | Radius expansion, metro tiling |
| `cid`, `place_id`, `feature_id`, `check_url` | all | Stable IDs; `cid` is already the `precallLead._id` basis (`precall-scan.mjs:leadId`) |
| `first_seen`, `last_updated_time` | all | Satisfies the `02 §6` lineage columns (`source_url`, `pulled_at`, `source_provider`) |

### Throughput and cost shape

- `limit` maxes at **1,000 per request**, with `offset` for pagination → **1,000 sourced records is one task**, not 1,000 tasks. This is the cheapest stage in the whole pipeline.
- `filters` accepts up to 8 conditions with `and`/`or`; `order_by` up to 3 rules. Server-side filtering on `rating.votes_count` etc. means you don't pay to pull junk.
- Exact per-task $ — **unknown**, DFS bills per call and the price list wasn't consulted. The structural point stands: sourcing is cheap, per-domain enrichment is not.

---

## 3. The two on-paper endpoint assessments

### 3a. `whois_overview` — newly-registered industrial domains

The schema has **no `target` field**. It is a database search driven entirely by `filters` (max 8 conditions), `limit` (≤1,000), `offset`, `order_by`. (The schema also exposes an `is_claimed` param, which is a copy-paste artifact from the business-listings tool and means nothing here.)

**Expressible:** `[["domain","like","%hydraulic%"],"and",["created_datetime",">","2026-01-01 00:00:00 +00:00"]]`, plus the enrichment fields DFS layers on (backlink stats, organic/paid ranking metrics).

**Why it's still a weak fit — two reasons:**

1. **Coverage.** The DFS whois database is built from domains already in the DFS index (ranking or backlink presence). A domain registered last month with no rankings and no links is exactly the kind least likely to be in it. Filtering for "newly registered" inside an index of "domains we already track" is close to a contradiction.
2. **Relevance.** A brand-new `%supply%`/`%hose%` domain skews toward dropshippers and startups — not the $5M–$75M distributor the ICP describes.

**The better use of the same filter grammar:** industrial keyword match **plus low organic metrics** — a domain that exists but has almost no search presence. That's a Catalog AI signal, it's expressible in the same call, and it doesn't depend on the coverage assumption. Confirm exact field names against `domain_analytics_whois_available_filters` before building on it.

**Verdict:** do not plan a sourcing stage around new-domain discovery. Keep whois as an optional qualifier probe, MEDIUM confidence, one live filter test required.

### 3b. `domain_technologies` — e-commerce platform detection

The schema takes one required `target` domain and returns that domain's technology list. DFS's technology taxonomy is BuiltWith-shaped and carries Shopify, Magento, WooCommerce, and BigCommerce as standard ecommerce-category entries, so detection should work.

**Two cautions that matter more than the detection itself:**

1. **Absent ≠ negative.** The endpoint reads a crawled database, not a live fetch. A small dealer site DFS has never crawled returns empty — which is indistinguishable from "brochure site, no cart" unless you separately confirm the domain is in the DB. The qualifier "has a website but no catalog online" would silently over-count.
2. **No e-comm platform ≠ no product catalog.** Plenty of distributors publish a real catalog on WordPress with no cart, or a PDF line card. Platform absence is a proxy, not the fact.

**Recommended two-signal qualifier instead of one API call per domain:**

- **Primary, free:** one plain `fetch` of the homepage, regex the HTML for platform fingerprints — `cdn.shopify.com` / `Shopify.theme`; `cdn11.bigcommerce.com`; `wp-content/plugins/woocommerce`; `Magento_` / `/static/version`. Same fetch also grabs the `/line-card`, `/brands`, `/manufacturers`, `/products` link targets that stage 3 of the pack already wants. One request, two answers, zero API spend.
- **Fallback / confirm:** `domain_technologies` on the ambiguous residue only. Budget it as 1 task per domain and cap the batch.

---

## 4. Apollo client assessment

**File:** `/Users/artur/Documents/Projects/Salesolution new/scripts/precall-scan.mjs`

**The client (line 105):**

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

**Env key expected:** `APOLLO_API_KEY`, read at line 46 (`const APOLLO_KEY = env.APOLLO_API_KEY || null`). **Not present in `.env.local`.**

**Endpoints called today** — both inside `scanOwner()` (lines 276–282), and only when a lead already has a website:

| Endpoint | Payload | Purpose |
|---|---|---|
| `organizations/enrich` | `{ domain }` | Org record, used only for a fallback phone |
| `mixed_people/search` | `{ q_organization_domains, person_seniorities: ['owner','founder','partner'], page: 1, per_page: 1 }` | One owner-level contact |

**What reusing it for bulk enrichment needs:**

1. **Org search, which doesn't exist yet.** `organizations/enrich` is a per-domain match, not a search. If Apollo is the *source* (pack stage 1), a company-search call has to be added; if Apollo is only *enrichment* on a DFS-sourced list, `organizations/enrich` per domain is the right primitive and the missing piece is batching (bulk enrichment caps at **10 records per request** per `05:43`).
2. **People search at volume.** `per_page` is hardcoded to 1 and `page` to 1. Bulk needs `per_page: 100` with page increments, plus the pack's post-filters: `annual_revenue` $5M–$75M, `reveal_personal_emails: false` always, and 1–2 contacts per company enforced at write time on organization id.
3. **Rate limiting and backoff — absent.** No sleep, no 429 handling. The pack cites ~100 requests/minute. The existing `sleep()` helper is used in the seed loop but not in the Apollo path.
4. **Silent failure — the real defect.** `if (!res.ok) return null` makes a 401 on a wrong key, a 429, and a genuine zero-result search indistinguishable. At single-lead scan scale that's tolerable; at 2,500–3,500 rows it will quietly produce an empty list and look like a bad ICP. Convert to throw-or-log before any bulk run.
5. **Endpoint/auth form to confirm on first paid run** (`05:41`): `mixed_people/search` + `X-Api-Key` header is the reference combination, but a `mixed_people/api_search` form exists in the wild. Verify at `per_page: 100` and record which worked.
6. **PF-7, the CSV parser** (`parseCsv`, ~line 173): splits on `,` with no quote handling. An Apollo export with a comma inside a company name corrupts the row. Must be replaced before importing stage-1 output.

**Verdict:** the client is a correct 15-line foundation with the right auth form, and the pack is right that it should be extended rather than replaced. It is roughly 30% of a bulk puller — missing pagination, rate limiting, error surfacing, and any org-search path.

---

## 5. Scraping stack

**Better than the `npm i --no-save` pattern the brief assumed.** Playwright is a committed devDependency:

- `package.json` devDependencies: `"playwright": "^1.60.0"` — installed at `node_modules/playwright` (1.60.0).
- Chromium builds already cached in `~/Library/Caches/ms-playwright` (chromium-1148 / 1200 / 1223 / 1234 plus headless-shell variants). **Nothing to install.**
- Reference implementation: `/Users/artur/Documents/Projects/Salesolution new/scripts/_visual-check.mjs` — `chromium.launch()` → `newPage({viewport})` → `goto(url, {waitUntil:'networkidle'})` → `page.evaluate()` → optional `screenshot()`. Serial, single browser.

**Node:** v20.16.0. `package.json` declares **no `engines` field**, so nothing is enforced; Next 16 / React 19 in the dependency tree imply Node ≥20, which is satisfied. Scripts are ESM `.mjs` with top-level await, fine on 20.

**Practical guidance for locator scraping:**

- Global `fetch` is available on Node 20. For JSON endpoints and server-rendered HTML, **use plain fetch** — no browser, an order of magnitude faster, no flakiness.
- Most dealer-locator pages that look JS-rendered are fetching a JSON endpoint underneath. Find that XHR once (Playwright, or devtools by hand), then hit it directly for the bulk run. Reserve Playwright for locators that genuinely need a rendered DOM.
- Reuse the repo's `loadEnv()` idiom (`precall-scan.mjs:32`) so scripts pick up `.env.local` without a flag.

---

## 6. Verification and sending — what the pack chose

From `docs/strategy/industrial-email-campaign/05-automation-pipeline.md` and `04-deliverability-infra.md`:

**Verification: Truelist.** *"has an MCP, plus a bulk CSV path. Bulk CSV is the right path at ≥300 contacts"* (`05:52`). Rate: **10 requests/second** (`05:66`) — that plus the MCP claim implies a REST API, though the pack never names an endpoint. **No Truelist MCP is connected in this session** (only `dfs-mcp`, `linear`, `21st`), and no `TRUELIST_*` key exists. Treat "has an MCP" as a vendor fact, not an environment fact.

Four buckets and their handling (`05:59–66`): `ok` → send · `email_invalid` → dropped to a visible file, never silently · `accept_all` → quarantined to the catch-all sending domain, low volume, sent last, never in a Track 1 batch · `risky`/`unknown` → skipped, kept for re-verify. Re-verify anything older than **30 days**.

Why it's non-optional: Apollo email accuracy runs **60–80%**, so raw sends bounce **20–40%** against a **2%** kill line (`05:57`).

**Sending: Instantly**, with Smartlead as the named equal (`04 §4`). Chosen for warm-up pool included, blocklist API, and campaign API. **~$300–500 for the 60 days including domains. GATE:HUMAN — G2.** Explicitly **not Resend**.

**Volume numbers across both docs:**

| Number | Source |
|---|---|
| 2,500–3,500 rows total from the pull | `05:23` |
| ≤50 contacts per micro-campaign (2.76× reply lift) | `05:338` |
| 1–2 contacts per company | `05:36`, `05:340` |
| Scan batches of 50 domains; ~5 API calls per prospect (200 domains ≈ 1,000 calls) | `05:76`, `05:119` |
| Track 1: 10–15/day, ~250 contacts over weeks 1–4 | `04:33`, `04:37` |
| Track 2: ~1,200–1,500 contacts, ramp 120–450/day | `04:90` |
| 2–3 fresh `.com` domains × 2–3 mailboxes = 6–9 mailboxes | `04 §3` |
| 4-week warm-up, sends start week 5, 6–7 weeks to first reply data | `04:23`, `04:52` |
| Red lines: bounce ≥2% halt · complaints ≥0.3% permanent · reply <5% by week 6 = stop | `04 §7` |

**A compliance note on the free DFS emails.** `04 §8` requires *"licensed-provider data used within ToS"* and *"source URL and pull date retained per contact."* DFS `contact_info` mail entries carry `source: "backlinks"` — scraped from the open web, not licensed contact data. The lineage requirement is satisfiable (`check_url`, `first_seen`, `last_updated_time` are all returned), but whether a backlink-scraped mailbox clears the pack's own sourcing standard is a founder call, not an engineering one. They are also mostly role addresses, which reply worse than a named owner. Treat them as a **fallback tier and a free Apollo cross-check**, not as the primary contact source.

---

## 7. Pipeline sketch

| # | Stage | Tool | Works today? | Blocker | Cost per 1,000 records |
|---|---|---|---|---|---|
| 1 | **SOURCE A** — GBP listings | DFS `business_listings_search`, tiled by metro × category, `limit: 1000` + `offset` | **YES** | None. Set `is_claimed: false` on a second pass to catch the null-website tail | 1–2 DFS tasks per 1,000. $ unknown, but this is the cheap end |
| 1b | **SOURCE B** — brand dealer locators | Plain `fetch` against the locator's JSON XHR; Playwright only where a DOM is genuinely required | **YES** | Per-brand reverse-engineering, ~1–2h each. Manufacturer ToS is a per-site read | $0 (compute only) |
| 1c | **SOURCE C** — Apollo firmographic pull | `mixed_people/search` + org search, per the pack's segment payloads | **NO** | **G1: `APOLLO_API_KEY` absent + paid tier; `email` is credit-metered** | Unknown — plan-dependent credits |
| 2 | **NORMALIZE + DEDUPE** | Local Node script; store in Sanity `precallLead` (already exists) | **YES** | `parseCsv` (PF-7) corrupts any comma-bearing CSV — fix first | $0 |
| | *Match key:* normalized company name (lowercase, strip `inc/llc/co/corp/the`, collapse punctuation) + E.164 phone + ZIP. `cid` is the hard ID when the record came from DFS. Cross-brand dealer matching: same phone **or** same (name-stem + ZIP) collapses to one company; keep every brand as a `line_card[]` array on the survivor, because "authorized on more lines than the site lists" is Angle 2's entire premise. `people_also_search[]` gives a free competitor set per record. | | | | |
| 3 | **QUALIFY — website status** | Homepage `fetch` + platform-fingerprint regex (primary); DFS `domain_technologies` on the ambiguous residue | **YES** | "Absent ≠ no e-comm" (§3b). Fingerprint first or you'll over-count brochure sites | $0 for the fetch tier; 1 DFS task/domain for the residue |
| | *Buckets:* `none` (no `url` on the listing) · `brochure` (site resolves, no platform fingerprint, no product-listing path) · `ecomm` (platform detected). Size proxies available free from stage 1: `rating.votes_count`, `total_photos`, `is_claimed`, `services[]`, `description` length, multi-location phone clusters. | | | | |
| 4 | **ENRICH** | Apollo `organizations/enrich` + `mixed_people/search`, extending `precall-scan.mjs:105` | **NO** | G1 key. Plus: add pagination, rate limiting, and stop the silent `return null` | Unknown (credits) |
| 4b | **ENRICH fallback** | DFS `contact_info[].mail` already returned in stage 1 | **YES, free** | Provenance is `backlinks`, mostly role addresses — founder call on ToS fit (§6) | $0, already paid for in stage 1 |
| 5 | **VERIFY** | **Truelist**, bulk CSV path at ≥300 contacts | **NO** | Account signup. No key, no MCP in this environment | Unknown — the pack prices sending but not verification |
| 6 | **SEGMENT** | Local script | **YES** | Angle 2 copy is unfrozen (G3/G4) | $0 |
| | *Buckets:* Angle 1 (catalog/duplicate-manufacturer-copy) → `ecomm` + `brochure` with a product listing · Angle 2 (line-card gap / dropship) → dealers whose `line_card[]` from cross-brand matching exceeds what their own site lists · Null-website → `none` bucket, a different offer entirely, and the highest-signal DFS-only segment · Catch-all → routed by stage 5's `accept_all`, quarantined to its own sending domain. Segment A/B/C (fluid power / bearings-PT / general MRO) routes off `category_ids[]`. | | | | |
| 7 | **EXPORT** | CSV → Instantly (campaign API available, so scriptable) | **NO** | **G2: account + 2–3 domains + 4-week warm-up** | ~$300–500 for the full 60 days incl. domains (`04:106`) |

**What this means in practice:** stages 1, 1b, 2, 3, 4b, and 6 can all be built and run **today with zero new keys**. That's a normalized, deduped, website-qualified, segmented US industrial-dealer list with phones, ZIPs, competitor sets, and partial emails. What it cannot do without a purchase is turn that into named owner contacts (Apollo), prove the addresses (Truelist), or send (Instantly).

**The pack already sanctions this order** — `05:110`, Path A: *"A 50-domain pilot batch can be personalized in-session before any key is bought… Do it in week 0."*

---

## 8. Blockers, ranked by lead time

| # | Blocker | Lead time | Notes |
|---|---|---|---|
| 1 | **G2 — sending infra: domains, mailboxes, Instantly, 4-week warm-up** | **4+ weeks, calendar-bound** | The only irreducible one. Nothing in the list pipeline shortens it; every day it isn't bought is a day added at the far end. Buy on day 1 regardless of where the list stands |
| 2 | **G1 — `APOLLO_API_KEY` absent, paid tier, credit-metered email** | Hours to days (procurement) | Blocks stages 1c and 4. Partially routed around: DFS can source the list today, and returns some emails free |
| 3 | **Truelist account** | Hours | Hard gate on every send — 20–40% raw bounce against a 2% kill line. Cheap and fast, but nothing ships without it |
| 4 | **G6 / PF-8 — NAP conflict** | Founder, unknown | Three different postal addresses on the live site. CAN-SPAM needs a correct one, and a footer that disagrees with the website is worse than no footer |
| 5 | **G5 — Track 1 decision** | Founder, single decision | Worth ~3 weeks of the 60 and the gap between the $60K and $25–40K cases |
| 6 | **PF-6 — DFS env alias** | Minutes | `DFS_LOGIN`/`DFS_PASSWORD` vs `DATAFORSEO_USERNAME`/`DATAFORSEO_PASSWORD`. Scripted REST path only; the MCP path is unaffected |
| 7 | **PF-7 — CSV parser** | Under an hour | Naive comma split corrupts any Apollo export with a comma in a company name. Must land before stage 1 output is imported |
| 8 | **Apollo client swallows `!res.ok`** | Under an hour | A 401 and a zero-result search look identical. At 3,000 rows this reads as a bad ICP instead of a bad key |
| 9 | **`domain_technologies` absent-vs-negative ambiguity** | Design decision | Mitigated by fingerprint-first (§3b). If ignored, the "no catalog online" qualifier over-counts silently |
| 10 | **G3/G4 — Angle 2 copy freeze; G7 — booking link** | Founder | Blocks stage 6 segmentation output and stage 7 reply handling, not the list build |
| 11 | **whois new-domain discovery unproven** | Optional | Don't plan a sourcing stage on it. One live filter probe would settle it |
| 12 | **DFS `contact_info` email provenance** | Founder call | `source: "backlinks"` vs the pack's "licensed-provider data within ToS" standard |

---

## Files referenced

- `/Users/artur/Documents/Projects/Salesolution new/scripts/precall-scan.mjs` — Apollo + DFS REST clients, `loadEnv()`, `parseCsv()`, `seedCsv()`, `--export`
- `/Users/artur/Documents/Projects/Salesolution new/scripts/_visual-check.mjs` — Playwright reference pattern
- `/Users/artur/Documents/Projects/Salesolution new/package.json` — playwright 1.60.0 devDependency, no `engines`
- `/Users/artur/Documents/Projects/Salesolution new/docs/strategy/industrial-email-campaign/04-deliverability-infra.md`
- `/Users/artur/Documents/Projects/Salesolution new/docs/strategy/industrial-email-campaign/05-automation-pipeline.md`
