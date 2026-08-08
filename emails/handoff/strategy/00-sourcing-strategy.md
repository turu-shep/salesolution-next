# Prospect sourcing strategy — industrial cold-email list

**Status: ACTIVE — GATE-L1 APPROVED 2026-08-01 (full pool; see the §9 decision log).** The S1–S7 build has run against this strategy; measured findings live in `01-build-plan.md` §5. *(Header corrected 2026-08-03 — it still read DRAFT two days after the gate was signed and the harvest ran.)*
**Date:** 2026-08-01 · **Author:** Fable synthesis over four Opus research passes
**Evidence:** [`../../research/00-internal-context.md`](../../research/00-internal-context.md) · [`01-dealer-locator-sources.md`](../../research/01-dealer-locator-sources.md) · [`02-alternative-channels.md`](../../research/02-alternative-channels.md) · [`03-tooling-pipeline.md`](../../research/03-tooling-pipeline.md)
**SSOT respected:** ICP, segments, angles, copy, deliverability = `docs/strategy/industrial-email-campaign/` (esp. `02-icp-targeting.md`). This doc adds the **acquisition layer** the pack itself flags as missing (Apollo is its only named source; no domain-first source, no second source, no pull-time suppression join).

---

## 1. Thesis

Invert the pack's pipeline. Don't *discover* prospects in Apollo — **discover them in places firmographic databases don't index, then use Apollo only to attach named contacts.**

The sources below know things Apollo/ZoomInfo structurally cannot:

- **Manufacturer dealer locators** know *who is authorized on which brand lines* — the line card.
- **Buying-group membership (AD)** knows *who is an independent at real scale* — membership is the $5M+ independence filter, pre-applied.
- **Locator records with no website** know *who sells equipment with no web presence* — the "thinking about opening one" segment, unfindable by any domain-keyed database **by definition**.
- **New-member press releases** know *who just decided to invest in competing* — a timing signal.

Every cold-email shop pulls the same Apollo NAICS queries. Nobody merges dealer locators. That asymmetry is the edge, and it directly feeds Angle 2's evidence needs ("you're authorized on lines you barely list").

## 2. Need vs. available

Pack requirement (`01-goal-math` + `04-deliverability-infra`): **2,500–3,500 raw → 1,400–2,000 seated** after the 30–40% cull, packed into 30+ micro-campaigns of ≤50, supporting ~250 Track-1 contacts (wks 1–4) + 1,200–1,500 Track-2 (wks 5–8).

| Source (validated 2026-08-01) | Est. unique US companies | Status |
|---|---|---|
| Self-identification SERP (blocked-brand recovery) | **650–800** at 250 queries; 1,800–2,800 exhaustive | Verified live; 128 distinct dealers from 14 test queries, &lt;$15 API cost |
| E1 widget sweep (Enerpac, Lovejoy, Ballymore, FS-Curtis, Wesco) | **150–250 net-new** (~400 distinct gross) | Verified live 2026-08-01; Enerpac carries most of the net-new |
| E2 adjacent segments (SPX FLOW, Dorner, Interroll, FlexLink, mk NA, Matthews) | **250–450** after chain suppression | Verified live 2026-08-01; 59 brands assessed, 6 easy-tier |
| Dealer locators, easy tier (Timken, Atlas Copco, Banjo, Kennametal, NTN, Quincy…) | **1,500–2,500** post chain-suppression + cross-brand dedupe | Verified live; Timken alone: 10,031 records / 1,261 single-location US independents |
| AD member locator (all 11 divisions × metro sweep) | **1,000–1,500** | Verified live; 301 pulled in a 20-metro × 3-division sample (`../../data/validation/`) |
| PTDA find-a-distributor | hundreds (branch→company rollup needed) | Verified live (ASP.NET postback; exposes website + 14 product categories) |
| DataForSEO business listings (category × metro) | 1,000/request, unbounded | Auth verified live; includes null-website flag |
| USAspending.gov by 6 distributor NAICS | 2,000–5,000 (needs domain enrichment) | Open API, no key |
| Locator headless-render tier (Banner, Miller, ARO…) | +2,500–3,500 more | Build-gated (GATE-L4) |

**Raw pool comfortably exceeds requirement without Apollo as a discovery source.** Overlap across sources is a feature, not waste — a company found in 3 places is triangulated (High confidence per the prospecting rubric) and richer.

## 3. Channel stack

**Tier 1 — run at build start (all validated, no new keys):**
1. **Dealer-locator easy tier** — the verified top-8 shortlist, of which six run now via open JSON/HTML/Excel: Timken (WPGMZA JSON), Atlas Copco (static HTML incl. website), Banjo (storelocatorwidgets JSONP), Kennametal (official Excel export), NTN + Quincy (WP admin-ajax). The other two: Sullair (CSV path unresolved — timebox it), Banner (hard JS → Tier 2, but the only source with explicit dealer tiers). Segment coverage: B-heavy (bearings/PT), C (MRO), some A.
2. **AD member locator** — full sweep: 11 divisions × top-50 metros, the proven GET pattern (`research/scripts/ad_sweep.py`). Note: AD's website field sometimes holds a Google-Maps URL, not a domain — needs the website-cleaning step (S2).
3. **PTDA find-a-distributor** — full category pull; suppress national chains (Grainger/Motion skew); product categories ≈ line-card lite.
4. **DataForSEO business listings** — category × metro sweeps for Segment A/C fill (fluid power is locator-thin after the Parker 403 loss) + the free null-website flag.
5. **Self-identification SERP play** — *validated 2026-08-01, see [`../../research/04-self-identification-play.md`](../../research/04-self-identification-play.md).* Dealers advertise their own authorizations ("Authorized Parker Distributor", "Parker Store", line-card pages) on their own public sites. 14 test queries → 372 organic results → **128 distinct US distributors**, 8/8 fetched verified ICP-shaped, zero false positives. This is how we recover the 403-blocked brands **without touching their servers** — and it reaches Dixon, which has no locator at all.
   - **Query axis rule (structural finding):** state-scope the *line-card* phrase, not the brand phrase. Brand-phrase state-scoping returned 6 net-new of 13; line-card state-scoping returned 12 of 17. Distributors write one national authorization page but state geography on line cards.
   - **Budget:** a 250-query program yields 650–800 unique dealers; ~1,100 queries yields 1,800–2,800; hard ceiling ~3,000–4,000 (bounded by who ranks, not by spend). SERP API cost is **under $15 even exhaustive** — dedupe and fetch budget are the real constraints.
   - **Bonus vector:** dealers host manufacturer catalog PDFs carrying printed authorization boilerplate. That found 6/6 Norton dealers including one that self-declares nothing anywhere on its own site.

**Tier 2 — after Tier 1 proves out:**
6. USAspending NAICS pull (adds gov-contract evidence as a personalization line).
7. New-member press-release monitor (AD/Sphere 1/NetPlus/GAWDA/MDM) — small N, highest timing value; fold into weekly replenishment (D-01 retires zero-engagement contacts, so the list needs a feed anyway).
8. **GATE-L4:** headless-render locator tier (+2,500–3,500) — only if Tier 1 seats < 1,800.

**Killed — do not re-litigate** (full reasons in `02-alternative-channels.md`): 12 login-gated associations (NAHAD, FPDA, ISA, NAED, MHEDA, AHTD, AED, Sphere 1 roster, NetPlus, SupplyForce, IBC, Evergreen) · bot-gated platforms (Thomasnet/DataDome, eBay, Amazon, MachineryTrader, Surplus Record, BSA, BidSpotter, Indeed) · **STAFDA (compliance kill — explicit confidentiality notice; its reachable API stays untouched)** · trade shows (exhibitors are manufacturers — wrong side; don't buy the $550 attendee resales) · IndustryNet/MacRae's/Kompass (uniqueness 2/5) · WHOIS new-domain monitoring (DFS index-derived, weak) · 8 locators behind hard 403s (Parker, Gates, ESAB, Norton, WEG, Regal Rexnord, Dixon, ifm) — excluded by policy, no bypasses; Parker is the painful loss.

### 3a. Source-expansion program (added 2026-08-01 on Artur's "I want them ALL")

Honest status before this: only the headless tier (GATE-L4) was in the plan. Widget-grep sat as a footnote in `research/01`, and adjacent segments existed nowhere. All four now have owners and are in scope.

| # | Expansion | Method | Est. add | Status |
|---|---|---|---|---|
| **E1** | **Widget-signature sweep** | 64 brands swept for 11 widget families. | **~2,830 raw records → 150–250 net-new companies** | **DONE 2026-08-01** → `research/05-widget-sweep.md` |
| **E2** | **Adjacent segments** | 59 brands across 8 untouched segments. | **250–450 companies** (~320–570 locations) | **DONE 2026-08-01** → `research/06-adjacent-segments.md` |
| **E3** | **Enerpac** | Public unauthenticated OSF `getFile` JSON — and it was never robots-disallowed (§7.1 correction). | **433 US records / 204 distinct companies**, 131 single-location, website 82.7%, phone 99.8%, 4-level tier + distributor type + **per-record line card**. Chains absent (top name Hydradyne, 34). | **DONE — new #2 source behind Timken** |
| **E4** | ~~**Headless-render tier**~~ → **the "headless" premise was wrong** | ~~Playwright.~~ **Measured 2026-08-03: the dealer data is a plain JSON/HTTP endpoint on 6 of 8 targets — no browser needed anywhere.** What actually gates the tier is **robots posture, per site**, and it splits 6 allowed / 2 disallowed. Banner and Pepperl+Fuchs need an override; the rest do not. | ~~+2,500–3,500~~ **measured far lower — see the per-source folders** | **PART-BUILT 2026-08-03** → `handoff/industrial-contact-list/e4-headless-locators [*]/02-robots-posture-2026-08-03.md` |
| **E5** | **Self-identification SERP at scale** | §3.5's validated play, permuted on the line-card axis. | 650–800 @ 250 queries → 1,800–2,800 exhaustive | Ready; <$15 API |

The method generalizes — only the brand names change. Treat E1/E2 as repeatable sweeps to re-run whenever the list needs replenishment (D-01 retires zero-engagement contacts weekly).

**E1 results and the hypothesis it killed.** The premise was "this vertical leans heavily on locator widgets, so grepping signatures is free yield." **That was wrong.** Across 64 brands: *zero* hits for storelocatorwidgets, wpgmza, MetaLocator, Storepoint, StoreRocket, Stockist, Closeby, Mapsly, Locally, Brandify, Where2GetIt. Banjo and Timken are one-offs, not a pattern. What actually paid: **WordPress locator plugins** (3 hits) and **Storemapper** (1) — and the real lesson is that *platform tracks brand size*. All 26 enterprise-CMS brands swept clean, so future sweeps should target **sub-$500M manufacturers**, not the household names. Add Oracle OSF `getFile` to the signature list.

New sources found: **Enerpac** (433 US, richest tier+line-card metadata), **Lovejoy** (1,147 US, Agile Store Locator), **Ballymore** (1,250 US, Storemapper — **dealer email on 99.8% of records**, unique in the whole inventory), plus FS-Curtis and Wesco Mfg (radius-scoped, 25/request cap, both carry website + tier).

**Honest yield:** ~2,830 raw records collapse to ~423 distinct companies gross, ~400 after chain suppression, and realistically **150–250 net-new**. Lovejoy and Ballymore are chain-dominated (97 and 122 distinct) and overlap Timken heavily; Enerpac carries nearly all the genuine net-new volume. Raw record counts flatter this sweep — the company count is the truth.

**Bimba** is a real Bullseye hit but its API returns 401 without a key. Not pursued — credential boundary, same rule as Enerpac's leaked OIC credentials.

**E2 results.** 59 brands, none overlapping `01`'s 46. Six easy-tier: **SPX FLOW** (MetaLocator answering `format=json` unauthenticated — 26-field schema with website, email, Business Unit and four territory dimensions; richest in the program), **Dorner** (entire US set inline as `distributorPlaces` — 116 records / 76 companies / 56 single-location, **98% website, 97% email**, 4 tiers, one GET, no JS), plus Interroll, FlexLink, mk North America and Matthews Marking. Next up but unbuilt: NORD (~500 NA distributors, per-record vCards), Gast (the NTN/Quincy `admin-ajax` pattern), Yaskawa.

**Barren — do not revisit:** fasteners and industrial supply as a whole (3M and PEM walled; Bossard, Nord-Lock, SPIROL sell direct; Simpson and Pentair off-ICP) and packaging beyond Matthews (Videojet, Domino, Lantech, Signode direct; Nordson, Loveshaw, Wulftec gated). Also dead: Ashland, Span Tech, Bonfiglioli, Nidec, Alfagomma, Brennan, Busch. Electrical/controls is reachable but skews **above the $75M ceiling** — deprioritize on ICP grounds, not access grounds.

**Hytrol** returned 401 on `/wp-json/hyipmap/v1/locations` — recorded gated, one probe, no retry.

### 3b. Pool total and the GATE-L4 consequence

Summing §2 across all validated sources: **4,000–6,000+ raw companies before cross-source dedupe**, against a requirement of 2,500–3,500 raw → 1,400–2,000 seated.

**Consequence: GATE-L4 (the headless-render tier) is probably unnecessary — recommend not funding it.** It was scoped as insurance for "Tier 1 seats < 1,800." Tier 1 plus E1/E2 plus the SERP play clears that without it. Keep E4 on the shelf for one reason only: cross-brand **line-card depth** stays thin (1–2 brands/dealer) below ~5 live sources, and depth is what makes the Angle 2 evidence sharp. Revisit only if seated counts or line-card depth disappoint after the first build.

## 4. The edge stack (what others can't replicate)

1. ~~**The line-card graph.**~~ **FALSIFIED BY MEASUREMENT 2026-08-01 — see `01-build-plan.md` §5a.** The premise was that dealers appear across many manufacturer locators, so joining them reconstructs a line card no database sells. At five live sources: **98.3% of companies appear in exactly one source, 1.7% in two, none in three or more. Only 8 companies (0.3%) carry 2+ brands.** Not a join defect — validated against the literal shared-name ceiling (Timken×AD share 43 names out of 2,832). **Manufacturer dealer networks are far more disjoint than this strategy assumed**, and more sources will not rescue it.
   **Replacement (the differentiator survives, the mechanism changed): single-brand authorization + self-declared line cards.** Every locator-sourced record carries the brand that listed it — 100% coverage by construction — and that alone writes a sharp email: *"You're an authorized Enerpac distributor and you don't come up for Enerpac repair in Houston."* The SERP self-identification play then supplies the dealer's **own words** about the lines they carry, which is better copy than any database join because it is quotable verbatim. Angle 2 never required *multi*-brand evidence; it required *authorization* evidence, which we have.
   Mechanics that still hold: chain suppression BEFORE dedupe; phone as primary key (measured 91.8% on Timken, 73% on AD — not the 100% assumed); name+ZIP5 secondary at a 1.59% collision rate.
2. **The null-website segment (Segment W).** Timken US: 1,622/5,002 records (32.4%) with no website link. Rule: a missing locator field is a *candidate*, not proof — each record gets an independent domain check (DFS + search) before entering W. W **fails the pack's current ICP** (≥200 SKUs visible) → parked as data, no sends. Decision at GATE-L2.
3. **Brochure-site detector.** DFS `domain_technologies` on every domain: has website but **no e-commerce platform detected** = has the business, lacks the catalog = the Catalog AI pitch, with receipts. Caveat honored: absence-of-detection ≠ proof of absence; it tiers evidence, never auto-disqualifies.
4. **Timing + proof layers.** Buying-group membership (independence), just-joined press releases (investment timing), gov contracts (USAspending), `people_also_search` competitor sets (competitive framing) — personalization lines no template shop can fake.
5. **Self-declared authorization language.** The SERP play returns the dealer's *own words* — "New England's largest authorized PARKER distributor", "AUTHORIZED STOCKING DISTRIBUTOR SERVING NORTHERN OHIO AND WESTERN PENNSYLVANIA". Quotable verbatim in the email, which beats any database row: we're reflecting their own claim back with a gap attached. A locator scrape cannot produce this. Rank position on their own brand phrase is also free qualification — a dealer claiming "largest authorized Parker distributor" who ranks below three competitors *is* the pitch.

## 5. Segment wiring (pack segments stay canonical)

| Pack segment | Primary sources | Angle |
|---|---|---|
| **A — fluid power/hydraulics** (priority) | **Self-identification SERP (now the primary A source — 32 dealers from one Parker Store query)**, AD (ISD/PVF), DFS listings, Banjo/ARO/Sullair; locators thin — Parker 403, Enerpac robots-blocked, Adaptall consent-gated (§8.5) | Angle 2 home — **still G3-gated**; line-card graph is the evidence that argues for signing G3 |
| **B — bearings/PT** | Timken + NTN + PTDA — the deepest evidence pool | Angle 1 now; richest Track-1 hot-tier candidates |
| **C — general MRO** (≥1,000 SKUs) | AD, Atlas Copco/Quincy/Kennametal, DFS listings, USAspending | Angle 1 only |
| **W — no website** (NEW, outside pack ICP) | Locator null-website + DFS null-URL, domain-check verified | **No angle exists; GATE-L2** |

Recommendation R3: Track-1's top-50 hot tier should draw from **Segment B** (deepest multi-source evidence at week 1), even though A is the pack's priority — A's Angle-2 copy is gated anyway. Artur can override.

Side pools (rule set by Artur, 2026-08-01): records culled at S3–S4 for size — single-location and/or below the revenue floor — are **never deleted**; they route to `pool-small-shops` under `emails/data/side-pools/` as inventory for Artur's separate small-shops project. Segment W keeps its own pool; tags compose (a record can be small AND no-website). Multi-location is NOT a cull reason — regional multi-branch independents are prime ICP; only the named national chains are suppressed.

## 6. Pipeline (stage → tool → status)

| Stage | Tool | Runs today? |
|---|---|---|
| S1 SOURCE | Locator pulls + AD/PTDA scripts + DFS listings (1,000/req) | **Yes** |
| S2 NORMALIZE + DEDUPE | Chain suppression → phone/name+ZIP join → branch rollup → website-field cleaning | **Yes** |
| S3 QUALIFY | Domain check; DFS `domain_technologies`; SKU-visibility floor per PF-3 outcome | **Yes** |
| S4 SEGMENT + TIER | A/B/C/W + evidence-depth tiers; **suppression join here incl. shared phone DNC** (closes the pack's highest-consequence gap) | **Yes** |
| S5 ENRICH | Apollo REST — harden `precall-scan.mjs` client (pagination, rate limit, org search, fix silent-401) | **G1 key** |
| S6 VERIFY | Truelist bulk (≥300/batch, 4 buckets); `verify_state == ok` only | **Account needed** |
| S7 EXPORT | Instantly CSVs, ≤50/micro-campaign, 1–2 contacts/company cap | **G2 + 4-wk warmup** |

**No deletions — rule set by Artur, 2026-08-01.** Qualification tags, it never discards. Every record failing a filter keeps a `disposition` (`chain` · `sub-floor` · `single-location-small` · `no-website` · `non-US` · `dead`) and lands in `emails/data/side-pools/` with full provenance instead of being dropped. Small shops feed Artur's separate small-shops project (`pool-small-shops.csv`). Only the seated send-list is exclusive; side pools may overlap.

Build items folded in: PF-6 (DFS env alias `DATAFORSEO_*` vs `DFS_*`) and PF-7 (`parseCsv` quote handling) — both autonomous. DFS-scraped `contact_info` emails (seen on 4/10 sample records) are **discovery hints only**; every send contact passes Truelist, and named-person emails come from Apollo or the company's own site.

## 7. Compliance posture

Public pages only · no login/CAPTCHA/bot-wall bypass (8 locators + 12 directories excluded on this rule) · rate-limited + cached, desktop-UA honesty, no fingerprint spoofing · `source_url` + `captured` on every record (CAN-SPAM lineage) · data for our own outreach only, never resold · gitignored contact data (`emails/.gitignore`) · sends inherit the pack's CAN-SPAM controls (opt-out, accurate headers, the graceful <$5M disqualify).

### 7.1 The obstacle ladder (Artur's questions, 2026-08-01)

Four kinds of obstacle, four different answers. The distinction is *what kind of signal the operator sent*, not how hard the wall is:

| Obstacle | What it is | Our answer |
|---|---|---|
| ~~**429 throttle** (ARO, Miller, Ingersoll Rand)~~ | ~~A *pace* signal~~ | ~~**Honor it — slowing down IS the fix.** ≤1 req / 3–5s per host, exponential backoff, cache, run overnight.~~ **FALSIFIED BY MEASUREMENT 2026-08-03 — superseded by the row below.** The *rule* is still right for a genuine 429; these three brands were the wrong examples of it. |
| **429 wall** (ARO, Miller, Ingersoll Rand) — *reclassified 2026-08-03* | An *access control* wearing a throttle's status code | **Excluded, same treatment as the Cloudflare eight.** Measured at ≤1 request/3s with 15/30/60/120/120s exponential backoff: **all three returned 429 on `robots.txt` itself**, through five attempts each, and ARO and Miller did the same again on their locator pages. A host that will not serve its own robots file to a paced, honestly-identified client is not rate-limiting us by pace. The remedy this row used to prescribe — slow down, run overnight — does not apply, and the remedies that *would* (rotating UA, changing egress IP, stealth headless) are exactly what this section forbids. No escalation attempted. **Recovery route: the self-identification play (§3.5) via `serp/`**, which already recovered the Cloudflare eight. Evidence: `handoff/industrial-contact-list/e4-headless-locators [*]/02-robots-posture-2026-08-03.md` §4 and `data/raw/e4-evidence-2026-08-03.json`. |
| **robots.txt Disallow** (Enerpac) | A *stated preference* — advisory (RFC 9309), not law | **OVERRIDDEN by Artur, 2026-08-01** — verbatim: *"I don't care about robots.txt."* Recorded as an explicit dated exception; overrides are never silent. Policy now: robots.txt is not an automatic exclusion. Standing counter-argument, on the record: Sale Solution sells AI-search-readiness and SEO, so being seen ignoring a `Disallow` is an asymmetric reputational risk for this firm specifically. Artur owns that risk. **⚠ The triggering case was a false premise — see below.** |
| ↳ **Enerpac correction (2026-08-01)** | `research/01` misread the robots file | Enerpac's robots.txt disallows `/ccstore**x**/custom/v1`. The distributor data actually resolves through OSF `getFile` to `/ccstore/v1/files/thirdparty/distributorLocator/distributorLocator.json` — **a path robots.txt never disallowed.** Enerpac was accessible under the *old* policy all along and should never have been excluded. The override stands as forward policy; this specific exclusion was our error, not a rule we bent. |
| **Exposed credentials** (Enerpac's page source leaks Oracle Integration Cloud service credentials) | Not an obstacle — an *accident* | **Never used, and the robots override does not touch this.** Using leaked credentials is unauthorized access to a system, categorically different from a crawl directive. Values were never recorded. Public unauthenticated endpoints only. |
| **Consent form** (Adaptall) | An *identity* gate, no bot protection at all | **Use the front door.** Artur supplies his real name/title/company/email; we submit truthfully as him. Authentication grants *access*, not *bulk rights* — query at human pace, take what we need. GATE-L5. |
| **Cloudflare / Akamai 403** (Parker, Gates, ESAB, Norton, WEG, Regal Rexnord, Dixon, ifm) | A deployed *access control* | **No bypass, permanently.** Proxy rotation, stealth-patched headless browsers, TLS-fingerprint mimicry and CAPTCHA solvers all exist and all constitute detection evasion — actively disguising identity to defeat a system built to exclude us. That is the line between collecting public data and the conduct that draws IP bans and litigation. **Recovery route instead: the self-identification play (§3.5) — the dealers publish their authorizations themselves.** |

### 7.2 Manufacturer-published dealer emails (GATE-L6, new 2026-08-01)

**Six** sources now expose a **per-dealer email address**: Ballymore (99.8% of records), Dorner (97%), **Enerpac (64% of US rows — found during the S1 build, 2026-08-01)**, SPX FLOW, NORD, and DataForSEO listings (~40% of the sample). `research/01`'s locator set had none, so this is a new surface and it deserves an explicit decision rather than drifting into use.

**The distinction that matters:** these addresses are published on the **manufacturer's** site, not the dealer's own. The compliance rule we're working to allows public business contact channels published *by the business itself*. A third party publishing your address for a specific purpose — "customers, here's how to reach your local dealer" — is weaker consent ground than the dealer publishing it on their own contact page.

**DECIDED 2026-08-01: send-eligible after Truelist verification** — Artur overrode the discovery-only recommendation. Defensible for US B2B under CAN-SPAM with accurate headers, a physical address and a working opt-out.

**Mandatory safeguard, non-negotiable on deliverability grounds:** manufacturer-published addresses ship in their **own micro-campaign cohort**, never blended into the main list. Their bounce and complaint rates are unmeasured, and the program dies at 2% bounce. If they underperform, an isolated cohort can be killed without taking the sending domains' reputation down with it — blended, one bad batch poisons every campaign on that domain. Report their bounce/reply rates separately from day one.

Two filters still apply within that cohort: drop named-individual addresses in favour of role addresses (`info@`, `sales@`, `contact@`) where both exist for a company, and keep using these addresses for their *other* job — **recovering domains where the website field is blank**, which is what makes Segment W verification work.

**Strategic upside worth flagging:** a meaningful share of the pool now arrives with a working email attached, which **partially de-risks G1** — if the Apollo key is slow to clear, the build is no longer fully blocked on it for contact discovery. That is an argument for building S1–S4 now rather than waiting on procurement.

**If Artur overrides to "send to them":** it is defensible for US B2B under CAN-SPAM with accurate headers, a physical address and a working opt-out — but named-individual addresses should still be filtered out in favour of role addresses, and the bounce risk is unmeasured, against a 2% kill line.

## 8. Conflicts surfaced (not resolved here)

1. ~~**PF-2**~~ **RESOLVED 2026-08-01** — floor $2M, page-aligned; no site copy change needed. **PF-3 (SKU floor 200 vs 1,000) still open** and still freezes S3.
2. **Sales-pack P3** caps the industrial lane at ≤100 accounts/2-week test; the email pack sizes 2,500–3,500. Read: P3 governs *sending*, not *pool building* — Track-1's 50 fits inside P3. Flagged, not adjudicated.
3. **Segment naming** — sales pack says "hydraulics + fasteners/MRO," email pack says bearings. This doc follows the email pack. Flag stands.
4. Apollo MCP-vs-REST contradiction between packs — REST is correct (verified in code).
5. **Adaptall — RESOLVED, and it downgraded.** See §8.6.

### 8.1a Revenue floor — DECIDED: $2M (Artur, 2026-08-01)

**Decision: hard floor $2M · priority tier $10M–$50M · soft ceiling $75M.** Artur set the floor at $2M, overriding the $5M recommendation below. The analysis is kept as-written because it drives the *tiering*, which now does the work the floor was going to do.

**What this resolves for free:** the live services page already says **$2M–$50M**, so PF-2's page-vs-pack conflict is settled in the page's favour — no site copy needs changing, and the list now matches what we publish. Default the ceiling to the page's **$50M** for the priority tier, keeping $75M as the soft cutoff.

**What it costs, stated once:** the $2–5M band can rarely absorb $10–30K (see the table — that's 25–75% of annual net profit), so those accounts will mostly not close at the standard fee. Two ways to make the band pay, both copy decisions rather than list decisions: pitch it a lower-priced entry engagement, or accept it as top-of-funnel that converts later. **The consequence to avoid is sending $2–5M prospects the $30K pitch and reading the silence as a copy problem.** Tier the band explicitly so its reply rate is measured separately.

**The original arithmetic, retained:**

Distributors run 20–30% gross margin and **2–6% net**. Against a $30K engagement:

| Revenue | Annual net profit | $30K engagement = | Verdict |
|---|---|---|---|
| $1M | $20–60K | 50–150% of a year's profit | Unsellable. A bet-the-company decision; cold email never closes those. |
| $2M | $40–120K | 25–75% | Still brutal. |
| $5M | $100–300K | 10–30% | Hard but real — a defensible growth investment. **Floor.** |
| $10–50M | $200K–3M | 1–15% | A normal budget decision, and the owner can still sign alone. **Priority.** |
| $75M+ | — | rounding error | Affordable but buying gets layered — procurement, incumbent agencies, RFPs. Cold email converts worse. **Soft ceiling.** |

Three arguments beyond affordability:

1. **Decision speed.** Cold email works when one person can say yes. $5–50M distributors are still owner-operated; above ~$75M you hit committees.
2. **Value at stake.** Per the value-based pricing rule (`offer-pricing-philosophy`), the fee scales to what's at risk. Catalog AI on a 10,000-SKU $20M distributor is a six-figure upside; on a 300-SKU $1M shop it isn't, so the fee can't be justified honestly.
3. **The 60-day goal math.** At a $1M floor, buyers can afford $5–10K, so $60K needs 6–12 closes. At a $5M+ floor it needs 2–3. Only the second is reachable by cold email in 60 days.

**The no-delete rule makes any floor cheap.** Everything under the floor routes to `pool-small-shops.csv` for Artur's other project rather than being discarded. At the decided $2M line, the small-shops pool catches only sub-$2M — a smaller pool than $5M would have produced, but the same principle: nothing is destroyed.

**Implementation caveat: a floor you cannot measure is fiction.** Apollo's revenue field is unreliable and the pack already says it can't filter on it. Proxies, in confidence order: employee count (distribution runs $300–500K revenue/employee, so **$2M ≈ 4–7 employees** and **$5M ≈ 10–20**), branch count, SKU count visible on site, line-card breadth, and buying-group membership (AD members skew larger by construction). Score on the proxy stack, never on a single field. Note the $2M line sits close to the noise floor of every one of these proxies — expect the $2–3M boundary to be fuzzy in practice, which is another reason the priority tier matters more than the floor.

### 8.6 Adaptall — access granted, source downgraded (2026-08-01)

Form submitted 17:29 UTC with Artur's real details. It had only four identity fields plus an address — **no phone field and no free-text field**, so nothing had to be invented or withheld. The gate returned JSON immediately, no session dependency. No email verification step fired, but a sales follow-up to `a.shepel@salesolution.net` is likely — worth watching.

**Then the sample killed the bulk case.** 45 records across Chicago, Houston and Atlanta:

- **Hard cap of 15 records per query** — confirmed at three different cutoff distances, so it's `LIMIT 15`, not a radius. A national list would need *hundreds* of queries, each stamped with Artur's real name and company. That query pattern would read exactly like what it would be: using a dealer-lookup form to enumerate a network under his own identity.
- **`website` populated on only 28.9%**, not the rich coverage the JS schema implied (`webhost` is that field's hostname, not a second field). Timken's 67.6% is more than double.
- **Chains are 56% of rows and 73% of the premier tier.** The tier signal is *inverted* from the obvious reading: **non-premier is where the independents are.** Anyone using `premier` as a quality filter would select precisely the accounts we can't sell.
- Genuinely solid: phone 97.8%, and name/address/city/state/zip/latlng/premier/cust_class all 100%. `cust_class 31` ⟺ `premier 0` exactly; `customer_number` is the company key.

**Verdict: medium, not easy tier — a lookup service, not a list source.** Decision recorded: **targeted lookups only.** Use it to answer "is this company Adaptall-authorized, and at what tier?" for companies already found elsewhere. That is exactly what the form is for, keeps volume low, and leaves no scraping pattern attached to Artur personally.

**Worth noting anyway:** the front-door route worked, cleanly and in minutes. The lesson isn't that it wasn't worth it — it's that a rich *schema* doesn't imply a rich *dataset*, and only a real sample tells you which you have.

## 9. Decision log (all gates settled 2026-08-01)

| Gate | Decision | Recommendation |
|---|---|---|
| ~~**GATE-L1**~~ | Approve S1–S4 build | **APPROVED 2026-08-01 — full pool.** Build every validated source to the full 2,500–3,500 raw target. |
| ~~**GATE-L2**~~ | Segment W disposition | **DECIDED: harvest + park.** Verify which genuinely lack a site, hold as a clean segment, no sends until an angle exists. Website Development remains the natural offer if one is built later. |
| ~~**GATE-L3**~~ | Revenue band | **DECIDED 2026-08-01: $2M floor / $10–50M priority / $50M page-aligned, $75M soft cutoff** (§8.1a). PF-2 resolved page-side. **PF-3 (SKU floor) still open.** |
| ~~**GATE-L4**~~ | Fund headless locator tier | **FUNDED 2026-08-01, PART-BUILT 2026-08-03, and the premise was wrong.** It was funded for line-card depth (§5a killed that at 0.3%), then defended on volume (§5f killed that at 25,332 companies). **What 2026-08-03 measured is that "headless" was never the constraint** — the dealer data is a plain JSON/HTTP endpoint on 6 of 8 targets. The real constraint is **robots posture, and it is per-site**: 6 allowed, 2 disallowed. Festo, Walter, Sullair built and measured; Continental, SKF, Lincoln, Bosch Rexroth cleared to build. **Two new gates opened and both default NO — R-1 Banner (`Disallow: /` on its data host) and R-2 Pepperl+Fuchs (`Disallow: /api/` on a path named `/api/protected/`).** Nothing was billed. See `handoff/industrial-contact-list/e4-headless-locators [*]/02-robots-posture-2026-08-03.md`. |
| ~~**GATE-L6**~~ | Manufacturer-published dealer emails | **DECIDED: send-eligible after Truelist**, overriding the discovery-only recommendation. **Mandatory safeguard in §7.2.** |
| ~~**GATE-L5**~~ | Adaptall distributor form | **CLEARED 2026-08-01** — Artur supplied `a.shepel@salesolution.net`. Submitted truthfully as Artur Shepel · Founder & AI-Growth Strategist · Sale Solution. Results → `research/07-adaptall-access.md`. |

| **R-1 Banner** | Override `Disallow: /` on Banner's data host | **SIGNED YES — Artur, 2026-08-04.** `api2d.bannerengineering.com/robots.txt` publishes `User-agent: * / Disallow: /` for the whole host. Artur explicitly authorized building against it anyway, having been shown the counter-argument verbatim: this firm sells AI-search-readiness and SEO, so being seen to ignore a `Disallow` is an asymmetric reputational risk, and every other measured E4 source returned under 150 net-new regardless. **What he is buying is the qualification signal, not volume** — Banner is the only locator confirmed to publish explicit authorization tiers (`CATEGORY_CODE` ∈ DISTRIBUTOR/BANNER/REPRESENTATIVE, `SUBTYPE` ∈ DIGITAL/NATIONAL). **Scope: robots.txt only, this host only.** It does not touch the credential rule — Banner's `apikey` is a public site identifier published in the anonymous page and reused in `<img>` URLs, not a credential. Pacing, caching, honest UA and the no-403-bypass rule all still bind. Evidence: `handoff/industrial-contact-list/e4-headless-locators [*]/02-robots-posture-2026-08-03.md` §6 R-1.<br><br>**⚠ OUTCOME, measured 2026-08-04 — the override bought nothing it was signed for.** Banner was described to Artur, in the gate question itself, as *"the only locator confirmed to publish explicit authorization tiers."* **That claim is false, and it was false when it was put to him.** Measured across the 46 genuine distributor rows: `CATEGORY_CODE` is the single value `DISTRIBUTOR`, and `SUBTYPE` is null on every one. `DIGITAL` and `JOINT VENTURE` never appear anywhere in the corpus. There is no product or brand field, so no line card either. **What exists is an exclusion flag separating distributors from rep agencies — obtainable from the company name.** The tier vocabulary lived in the site's decoding table, never in its data: **the identical SKF `DC001` failure mode, which this pack had already documented before the question was asked.** Net-new also fails: 14 observed, ~55 projected against a 150 threshold. **Nothing about this reflects on the signature; the recommendation it rested on was wrong.** Recorded rather than quietly dropped, because a signed override that returned nothing is precisely the thing a future session must not re-litigate from the same false premise. Detail: `handoff/industrial-contact-list/banner [*]/00-README.md`. |
| **R-2 Pepperl+Fuchs** | Override `Disallow: /api/` | **SIGNED YES — Artur, 2026-08-04 (superseding the same day's "NOT SIGNED" entry, which was written before he was asked directly).** Scope is the **robots directive only**, on the `/api/protected/distributorsData` path of `www.pepperl-fuchs.com`. **The credential carve-out survives the signature and is not Artur's to waive:** if that endpoint returns 401/403 to an anonymous request, it is an authentication boundary, the pack excludes those by policy, and the build stops there — a robots override is not a credentials override. Pacing, caching, honest UA and the no-403-bypass rule all still bind. Same reputational counter-argument as R-1 was on the record when he signed. **OUTCOME 2026-08-04 — built, closed, and the signature was never spent.** The endpoint returned **403** to one anonymous, paced, un-rotated GET; the carve-out fired and the source stopped on that response with no bypass. The same payload was then found **inlined in the public, robots-allowed page** (`window.__NUXT__`, 904 KB, on `…/contact-us/view-all-subsidiaries-distributors-gp27595`), so the records were read with no override in play. **The feed carries zero US distributors** — 214 global records, 5 US rows, 2 companies, 1 domain, and that domain is `pepperl-fuchs.com` itself. 4 origin requests, $0. Write-up: `handoff/industrial-contact-list/pepperlfuchs [DONE-NO-US-DEALERS]/00-README.md`. |
| **R-L1 Samson Rope · R-L2 Columbus McKinnon** | Build the two gated `linecard-locators` targets | **BOTH SIGNED YES — Artur, 2026-08-04.** Small, cheap builds off the United Central supplier roster read backwards. R-L1 Samson: build-worthy-small on the probe. R-L2 CMCO: alive and signal-rich, pending the one corrected query the probe log names. Both inherit the tier's standing rules — ≥3s pacing, cache everything, capture source-native codes verbatim and **test whether they sort before claiming a signal** (the SKF lesson), and stop on any 403. Evidence: `handoff/industrial-contact-list/linecard-locators [*]/02-probe-log-2026-08-03.md` §4. |
| **SPEND-0804** | Three list-growth runs, approved together | **APPROVED — Artur, 2026-08-04**, on an explicit "as many companies as possible" instruction: (1) **no-domain-backlog full run ≈$77, hard stop $97** — the best measured $/seated in the program, projected ~1,790 recovered domains → ~150–260 seated; (2) **SERP wave 4 ≈$3**, cap $5; (3) **DataForSEO generic tail ≈$11**, cap $13. **(2) and (3) knowingly override §5h**, which rates both as adding no qualification signal we lack — he overrode it on volume grounds, and the override is a volume decision, not a refutation of §5h's test. Report what each actually returned against that, so the next reader can tell whether the override paid. |
| **R-L3 Ansul / MetaLocator** | Override `Disallow: /` on a *vendor* host that serves several manufacturers' locators | **NOT SIGNED — default NO, nothing queried.** Ansul's dealer data is served by **`admin.metalocator.com`**, which publishes `User-agent: * / Disallow: /` for the whole host (`code.metalocator.com` likewise). Identical shape to R-1 Banner, and **R-1's scope is explicitly "this host only", so it does not reach here.** The prize is also smaller than Banner's: fire suppression, no confirmed authorization tier, and the locator was surfaced by a skim whose measured precision is 6 hits → 1 harvestable. **What makes this one different from R-1 is that MetaLocator is a shared vendor, so a signature here is not about one manufacturer** — it would set the posture for every MetaLocator-hosted locator we meet. Evidence: `handoff/industrial-contact-list/linecard-locators [*]/02-probe-log-2026-08-03.md` §6e. |
| **⚠ SPX FLOW retro-question** | Ratify or retire data already collected from that same `Disallow: /` vendor host | **OPEN — needs an answer, and it is not a new spend.** `spxflow` was harvested on 2026-08-01 from **`admin.metalocator.com`** — the same host R-L3 is about. Its dossier records "public endpoint, ≥3s pacing, no 429/403 in 105 requests" and **no robots check**, because the per-host robots discipline did not exist until the E4 work on 2026-08-03. It contributed **2,157 raw rows → 171 companies → 43 seated**, and those rows are live in `seated-v*`. Nothing has been changed or deleted (deletion is GATE:HUMAN and `spxflow` is its own folder's lane). **The question: ratify the collection retroactively, or retire those 43 seated rows before they send?** Either answer is cheap now and expensive after a send. Found by the `linecard-locators` build session, 2026-08-04. |
| **ICP-EQ** | Extend the ICP to franchised single-line equipment dealers | **SIGNED YES — Artur, 2026-08-04.** The 1–4-location tail only, on a parts-counter angle. Asked at the gate 2026-08-03 (unsigned; that session stopped correctly with zero fetches) and signed 2026-08-04 with both sides on the record. **Against, stated and overridden:** the typical dealer group is ≈$175M (NAEDA $24.4M/location × 7.2 locations), 2.3× the $75M soft ceiling; Titan Machinery is $2.4B; and they are franchised resellers whose catalogue belongs to the OEM, so the leak story maps imperfectly. **For:** Kubota alone lists 1,100+ separately-owned authorized dealers with real parts counters and their own websites. **Binding conditions of the signature:** the size-band filter is designed BEFORE the sweep; only 1–4 locations are in scope; everything above routes to `pool-above-ceiling` (never deleted, never seated); and **the per-OEM robots gate in `equipment-dealers/01-prompt.md` Step 3 still applies per site** — this is an ICP decision, not a robots decision. |

| **R-3 Kubota** — *also filed as **R-EQ-1** in `equipment-dealers [PART-BUILT]/`* | Override `Disallow: /` on the whole `www.kubotausa.com` host. **⚠ ONE GATE, TWO NAMES.** A parallel session opened `R-EQ-1` for this same decision and its folder still reads "behind GATE R-EQ-1, default NO." **That is stale: the gate is SIGNED and the source is built.** Treat the two identifiers as aliases and do not re-ask the question. | **SIGNED YES — Artur, 2026-08-04.** The file is 27 bytes: `User-Agent: *` / `Disallow: /`. One rule, no `Allow`, no exceptions — **stricter than Banner**, where only the data host objected while `www` stayed permissive. Artur signed knowing there is **no measured prize on the other side**: the session stopped at the gate before pinning the data path, so Kubota's dealer count, fill rates and tail size are all unknown, and the recommendation on the record was NO. The case for signing is Kubota's claimed **1,100+ US dealers**, the largest single equipment network in the research, plus Bobcat having just proved this ICP can clear the bar. **Scope: robots.txt only, this host only.** Pacing, caching, honest UA and the no-403-bypass rule all still bind, and a 403 still stops the source dead. **One page GET already landed** before the verdict computed (the sweep tool fetches robots and page in one pass); nothing further was requested. |
| **CRED-4** | Anonymous **minted** bearer tokens — a fourth credential shape | **ACCEPTED — Artur, 2026-08-04.** Bobcat's Coveo search token is not published as a literal in the page; an anonymous endpoint **mints** a short-lived bearer for any visitor (`bobcat.api.bobcat.com/coveo/search/token`, claims `searchHub: DL_NA_Search`, `roles: ["queryExecutor"]`). That is a step past the three shapes the pack had already accepted — Banjo's widget uid, Banner's `apikey`, Festo's static Azure Search key — so it was surfaced rather than quietly decided. **Ruling: acceptable.** No login, no cookie, no per-user issuance, read-only claims; it grants exactly the access an ordinary anonymous browser gets. **The Bimba rule is unchanged and still binds:** an endpoint that returns 401/403 to an anonymous request, or a token derived from a login, remains a credential boundary and is excluded by policy. **Never record a token value in any file.** |

| **ICP-EQ-2** | Disposition of Bobcat's 767 net-new equipment dealers | **DECIDED: SEAT THEM — Artur, 2026-08-04.** The national sweep returned **1,689 in-band US records / 1,502 companies / 767 net-new domains** (57.1% website, 99.3% phone) — the largest yield in the program by roughly 10×, and the first source ever to clear the ≥150 rule. **The vertical was measured before the decision and it is not industrial MRO: 75.5% of the network touches turf and lawn equipment** (top line-card codes: Aerators 1,587 · Sod Cutters 1,587 · Overseeders 1,587 · Mowers 1,189), 46.1% touches compact construction, and the net-new domains read `alldadelawnmowers.com`, `allseasonsatv.com`, `aaarentalsredwoodcity.com`. Artur seated them anyway, on the stated basis that **1,502 owner-led dealers with parts counters are a real market — just a different one.**<br><br>**BINDING CONDITIONS, in Artur's own framing: "would need its own angle and its own campaign cohort — the industrial Catalog AI copy will not land on a mower dealer."** So: (1) these rows carry a distinguishing segment marker and ship in an **isolated micro-campaign cohort**, never blended into the industrial list — the same safeguard §7.2 imposes on manufacturer-published emails, and for the same deliverability reason: a landscape dealer receiving bearings-distributor copy is a complaint, and the program dies at 2% bounce; (2) **Angle 1's industrial copy is NOT cleared for them** — new copy is required before any send; (3) bounce and reply rates are reported separately from day one, so the cohort can be killed without taking the sending domains down with it. **Do not let these rows raise the headline "seated" number without the segment label attached** — conflating them with industrial distributors is the single most expensive mistake available in this workspace. Detail: `handoff/industrial-contact-list/bobcat [*]/00-README.md`. |

**GATE-L5 history, kept as precedent.** Artur first offered `Artur / CEO / Test company / test@test.com`. That was declined: submitting a real name against a fake company and a dead mailbox is inventing an identity — the exact thing the front-door route exists to avoid — and it fails practically too, since a gate that mails a verification link to a non-existent address just silently kills the pull, while leaving a junk record in a real manufacturer's CRM under Artur's actual first name. He then supplied his real address and the truthful submission went in. **Precedent for future gates: ask for real credentials, never synthesize them.** Access granted this way is real access; access faked this way is a broken pull plus a reputational trace.
| ~~**G1 / Truelist / G2**~~ | Apollo key · Truelist · Instantly + domains | **ALL AUTHORIZED 2026-08-01.** G2 first — the 4-week warmup clock is calendar-bound and gates every send date. |
| ~~**G3**~~ | Angle 2 sign-off | **DECIDED: Angle 1 only for now.** Ship the cleared angle, gather reply data, revisit Angle 2 once line-card depth is real across 5+ sources (E4 now funded, which accelerates that). |
| ~~**P3 conflict**~~ | Sales-pack ≤100-account cap vs 2,500–3,500 pool | **DECIDED: P3 caps sending, the pool builds freely.** The list is inventory, not commitment; Track 1's ~50 founder-manual sends sit inside P3. |
| ~~**Adaptall**~~ | Post-access disposition | **DECIDED: targeted lookups only** — enrich companies found elsewhere (authorized? which tier?). No metro sweep; see §8.6. |

## 10. Next

Approved 2026-08-01. **The build plan is [`01-build-plan.md`](01-build-plan.md)** — S1–S4 stage by stage, with the data contract, source order, dedupe ordering, qualification thresholds and tiering.

Day-1 items that sit outside the build: buy Instantly + domains (the only calendar-bound item), open Truelist and Apollo accounts, fix PF-6 and PF-7. Then S1 extractors in the plan's order, hardening the Apollo client while G1 clears. Copy work (Angle 1 only, per G3) starts once seated counts per segment are real.
