# 05 · The automation pipeline

**Created:** 2026-07-28 · **Owner:** Artur · **Status:** specs ready, scripts unbuilt

Eight stages, list to money. Each one names what runs, what tool it runs on, what goes in and what comes out, what gate holds it, and the prompt or script spec that does the work.

**The scripts here are specs, not code.** A build session (phase 2 in the handoff run order) writes them. Nothing in this file should be pasted into a terminal as-is.

```
1 PULL → 2 VERIFY → 3 SCAN → 4 DRAFT → 5 QA → 6 SEND → 7 REPLIES → 8 MEASURE
Apollo    Truelist    DFS+probe  Claude   Claude  Instantly  human    ledger
```

---

## Stage 1 · PULL

| | |
|---|---|
| **Runs** | Segment queries against Apollo, paginated, one CSV per segment |
| **Tool** | Apollo REST. **No Apollo MCP exists** — REST only. *[playbook]* |
| **In** | The three payloads in [`02-icp-targeting.md`](02-icp-targeting.md) §2 |
| **Out** | `data/campaign/apollo-<segment>-<date>.csv`, 2,500–3,500 rows total |
| **Gate** | **G1** — `APOLLO_API_KEY` in `.env.local`, paid tier. The key is gated behind the paid plan and `email` on search results is credit-metered. |

### Script spec — `scripts/apollo-pull.mjs`

**Reference implementation already in the repo:** `scripts/precall-scan.mjs:105` — the `apollo(path, body)` helper. It posts to `https://api.apollo.io/api/v1/{path}` with an `X-Api-Key` header, handles auth and null-safety, and already calls `organizations/enrich` and `mixed_people/search`. Extend that pattern; do not start a new client.

**Behavior:**

1. Load env via the same `loadEnv()` idiom (`precall-scan.mjs:32`). Exit with a clear message if `APOLLO_API_KEY` is absent — never silently return empty.
2. Take `--segment a|b|c`, `--pages N` (default 5), `--out <path>`, `--dry-run`.
3. Post the segment payload with `per_page: 100`, incrementing `page`. Respect the limits: **per_page ≤100, ~100 requests/minute, 50,000-result search cap.** *[playbook]* Sleep between pages.
4. Post-filter every returned person on `annual_revenue` into $5M–$75M. Rows with no revenue go to `<out>.needs-review.csv`, not to the main file.
5. Enforce **1–2 contacts per company** at write time, keyed on organization id. Prefer owner/president over any secondary title.
6. Write the lineage columns from `02-icp-targeting.md` §6 on every row: `source_url`, `pulled_at`, `source_provider`, `segment`, `annual_revenue`, plus `verify_state` left empty for stage 2.
7. `reveal_personal_emails: false`, always. Not a flag.
8. Print a summary: pulled / revenue-filtered / company-capped / written.

**Endpoint and auth discrepancy — test this on the first run.** Two forms exist in the wild: `POST /api/v1/mixed_people/search` with `api_key` in the request body (the older CLI form), and `POST /mixed_people/api_search` with an `x-api-key` header (the current docs form). *[playbook]* **`precall-scan.mjs` uses the `X-Api-Key` header against `mixed_people/search` and works — that combination is the reference.** On the first paid-key run, confirm it still returns results at `per_page: 100`; if it 401s or truncates, try the header form against `api_search` before touching anything else. Record which one worked in the ledger.

**Bulk enrichment**, if needed later, caps at **10 records per request**. *[playbook]*

---

## Stage 2 · VERIFY

| | |
|---|---|
| **Runs** | Every pulled address through a verifier before it is ever sent to |
| **Tool** | Truelist (has an MCP, plus a bulk CSV path). Bulk CSV is the right path at ≥300 contacts. *[playbook]* |
| **In** | The stage-1 CSVs |
| **Out** | Four buckets, four files |
| **Gate** | Truelist account |

Apollo email accuracy runs **60–80%**, so raw sends bounce **20–40%** against a **2%** kill line. *[playbook]* Verification is not a quality step; it is the only thing standing between the campaign and a dead domain.

| Bucket | Meaning | What we do |
|---|---|---|
| `ok` | Deliverable | **Send.** The only bucket that enters a normal sequence. |
| `email_invalid` | Undeliverable | **Drop to an invalid file, visibly.** Never silently discarded — the drop rate is a signal about the pull. |
| `accept_all` | Domain accepts everything; verifier can't say | **Quarantine** to the catch-all sending domain, low volume, sent last (`04` §5). Never in a Track 1 batch. |
| `risky` / `unknown` | Verifier isn't confident | **Skip.** Not worth 1% of a bounce budget. Keep for a later re-verify pass. |

Truelist runs at **10 requests/second**. *[playbook]* Re-verify any row older than 30 days before a second sequence.

---

## Stage 3 · SCAN — the personalization engine

| | |
|---|---|
| **Runs** | A per-domain scan producing the facts the observation slot is built from |
| **Tool** | DataForSEO (MCP in-session, or REST from a script) + the existing `/api/probe` scorer |
| **In** | Verified domains, batched 50 at a time |
| **Out** | One JSON object per prospect |
| **Gate** | None for the MCP path. The REST path needs the env alias fix (PF-6). |

### The output contract

```json
{
  "domain": "example-hydraulics.com",
  "company": "Example Hydraulics",
  "segment": "A",
  "brand": "Parker",
  "listed_skus": 340,
  "line_card_brands": ["Parker", "Enerpac", "Bosch Rexroth"],
  "ai_named": false,
  "competitor_named": "Regional Fluid Power Co",
  "ai_query": "who sells hydraulic hose fittings in Ohio",
  "probe_score": 41,
  "site_speed": { "lcp_ms": 4200, "perf": 0.52 },
  "scanned_at": "2026-08-04"
}
```

Every field is either a measured value or `null`. **There is no "estimated" state.** A `null` field means stage 4 uses a fallback line for that slot.

### The four checks

1. **Line card.** Fetch the prospect's `/line-card`, `/brands`, or `/manufacturers` page. Extract the brand list. Individual prospect sites only — never a marketplace, a platform, or an aggregator.
2. **Listed SKUs per brand.** Either a `site:` query through DataForSEO SERP, or the count from their own category pagination. Whichever is available; record which one was used.
3. **AI-answer check.** Ask "who sells {{category}} in {{region}}" and record exactly who was named. This produces both `ai_named` and `competitor_named`. It is the sharpest signal for this ICP and the least proven one in our tooling — `DFS_AI_PATH` defaults to `ai_optimization/chat_gpt/llm_responses/live/advanced` and is flagged "confirm on first live run."
4. **Probe score.** Reuse the existing `/api/probe` logic. Optional: Lighthouse for `site_speed`.

### Two paths to run it

**Path A — in-session, today, zero new keys.** The DataForSEO MCP is already connected (`mcp__dfs-mcp__*`) and exposes the same endpoints the scanner calls over REST: `serp_organic_live_advanced`, `on_page_lighthouse`, `domain_analytics_technologies_domain_technologies`, and the `ai_opt_*` family. **A 50-domain pilot batch can be personalized in-session before any key is bought.** This is how the copy gets proven while Track 2 warms up. Do it in week 0.

**Path B — scripted REST, for volume.** Two fixes first, both one-liners:

- **PF-6, the env alias.** `.env.local` has `DATAFORSEO_USERNAME` / `DATAFORSEO_PASSWORD`; `scripts/precall-scan.mjs:43` reads `DFS_LOGIN` / `DFS_PASSWORD`. The scanner reports "no DFS auth" while the credentials sit right there. Alias in the script or add the `DFS_*` names to `.env.local`.
- **PF-7, the CSV parser.** `parseCsv()` at `precall-scan.mjs:173` splits on `,` with no quote handling. An Apollo export with a comma inside a company name corrupts the row. **Swap in a real parser before importing anything from stage 1.**

Then extend the scanner's existing seams: `--seed-csv` (`seedCsv()`, line 188) already accepts `name, city, region/state, phone, website/site, address` and takes an Apollo export after a header rename. `--export` (lines 419–431) already emits a cards JSON, which is the natural hand-off artifact into stage 4.

**Cost:** roughly 5 API calls per prospect. 200 domains ≈ 1,000 calls. Budget it and state the batch limit before the run. DataForSEO bills per call.

**The scanner is domain-second by design** — it seeds from Google Business Profile listings and only fetches an owner when a lead already has a website. For an Apollo-sourced, domain-first list, invert the flow: seed from Apollo, then scan. `--seed-csv` is the seam.

---

## Stage 4 · DRAFT

| | |
|---|---|
| **Runs** | Fills one slot per email. Nothing else. |
| **Tool** | Claude, one prospect per call, scan JSON as input |
| **In** | Scan JSON + the frozen sequence bodies from [`03-angles-and-copy.md`](03-angles-and-copy.md) |
| **Out** | One observation line per prospect per touch |
| **Gate** | Copy freeze (G3/G4 for Angle 2) |

**The system is five trigger templates against a constant body.** *[playbook]* The sequence body is fixed per segment × angle and never regenerated. The only variable content is the observation. Merge-tags-only personalization lifts replies about **5%**; real personalization lifts **50–250%**. *[playbook]* The observation slot is where that difference lives, which is also why it is the only thing worth spending a model call on.

### The drafting prompt — paste-ready, verbatim

```
You write ONE line. Nothing else.

INPUT: a scan JSON object for a single industrial distributor, and the touch number (E1–E5).

TASK: write the observation line that opens that touch. One or two sentences. Plain
American English, first person singular, operator register — terse, declarative,
concrete. Artur is writing to the owner of a distribution business.

HARD RULES — violating any of these fails the output:
1. Use ONLY facts present in the scan JSON. If a field you need is null, absent, or
   empty, STOP and return the segment fallback line for that touch, unchanged.
2. NEVER invent a number, a brand name, a competitor name, an AI-answer result, a
   SKU count, or a load time. Not "approximately." Not "likely." Not a range you
   derived. If it is not in the JSON, it does not exist.
3. Do not name any client of ours. Do not quote any of our case-study numbers.
4. Do not promise a ranking, a result, or any outcome. No guarantees.
5. Do not use these words: schema, GEO, citation share, ERP, PIM, faceted navigation,
   CTR, coverage, impressions, pipeline, ARR. If the concept is needed, say it in
   their words or cut it.
6. No em dashes beyond one. No exclamation marks. No questions in the observation
   line itself — the question lives in the fixed body that follows.
7. State what you observed and when. "I asked ChatGPT ... this morning" is fine
   because it happened. "Your buyers are asking ChatGPT" is not, because you did
   not observe it.

FIELD → PHRASING MAP:
  ai_named: false + competitor_named  → name the competitor the AI returned, and the
                                        query you asked. Nothing more.
  brand + listed_skus                 → their line card lists {brand}; their site
                                        lists ~{listed_skus} of that brand's SKUs.
  probe_score                         → only usable as a plain statement of what the
                                        crawl found, never as a grade or a warning.
  site_speed.lcp_ms                   → seconds, one decimal, as an observed number.

OUTPUT: the line. No preamble, no explanation, no alternatives, no quotation marks.
If you used the fallback, prefix the output with [FALLBACK] so QA can see it.
```

### Fallback lines

Used verbatim when a slot has no datum. **DRAFT — final wording is owned by [`03-angles-and-copy.md`](03-angles-and-copy.md); if 03 differs, 03 wins.**

| Segment | Angle 1 fallback |
|---|---|
| **A** — fluid power | "Most fluid-power sites I look at are running the manufacturer's own description on every fitting they list. So is everyone else selling that fitting." |
| **B** — bearings & PT | "Most bearing and power-transmission catalogs I look at carry the manufacturer's copy word for word, same as the other distributors listing that part number." |
| **C** — general MRO | "Most industrial supply catalogs I look at run manufacturer-supplied copy on every SKU. It's the same text the other distributors are running." |

| Segment | Angle 2 fallback — **GATE:HUMAN, G3** |
|---|---|
| **A** — fluid power | "Most fluid-power distributors I talk to are authorized on more lines than their site actually lists." |
| **B** — bearings & PT | "Most bearing houses I talk to carry more of the line card than the website shows." |

**A fallback is not a failure.** It is a segment-true statement with no fabricated specifics in it. A fabricated specific is the failure — one made-up AI-answer result destroys the entire premise of the pitch, which is that we checked.

### The variables contract

`{{first_name}}` `{{company}}` `{{category}}` `{{region}}` `{{brand}}` `{{sku_count}}` `{{competitor_named}}` `{{probe_score}}`

Every one traces to a scan field or a list field. No variable renders empty into a send — a missing variable routes the contact to the fallback body, not to a sequence with a hole in it.

---

## Stage 5 · QA

| | |
|---|---|
| **Runs** | Three lints, in order, on every drafted email before it enters the tool |
| **Tool** | Claude, one lint per pass. Do not merge them — a combined lint misses things. |
| **In** | Drafted emails |
| **Out** | PASS, or a numbered fail list |
| **Gate** | None. This one is never skipped for time. |

### Lint A — spam and deliverability

```
Check this cold email against the list below. Return PASS, or a numbered list of
every violation with the exact offending text quoted.

SUBJECT LINE
1. 2–4 words. Two is best.
2. All lowercase.
3. Reads like internal mail between colleagues.
4. NO digits and NO % sign anywhere. NO brackets.
5. NO "Re:" or "Fwd:" fakery.
6. NO first name.
7. A statement, not a question.
8. No pitch, no offer, no product name in the subject.
9. None of: free, guarantee, guaranteed, act now, limited time, offer, deal,
   discount, urgent, don't miss, exclusive, risk-free, click here, buy, sale,
   winner, congratulations. ONE carve-out: "Free, yours to keep" stays — it
   describes the snapshot's price, and it's our published wording.

BODY
10. 25–75 words. Count them and report the count.
11. Plain text only. No HTML tags, no images, no attachments, no tracking pixel.
12. Link count: E2 may have exactly ONE link, and it is the raw URL carrying the
    five campaign UTM parameters — no shorteners, no redirect wrappers. Every
    other touch: ZERO links.
13. No urgency, no countdown, no scarcity, no deadline. Same "Free, yours to
    keep" carve-out as #9.
14. No ALL CAPS words. No exclamation marks. No multiple question marks.
15. One question maximum, at the end.
16. Sign-off present. CAN-SPAM footer present. Unsubscribe line present.

Report the word count and the link count as numbers even on a PASS.
```

*Why:* emails under 75 words get **+83%** more replies; two-word subjects get **+60%** more opens than five-word; going 2→4 words costs **17.5%** of replies; numbers or % in a subject cost **46%** of opens; a pitch in the subject costs **57%** of replies; salesy words cost **17.9%**; a first name in the subject costs **12%**. *[playbook]*

### Lint B — slop

```
Rewrite nothing. Find and quote every instance of the following in this email.
Return PASS or a numbered list.

BANNED WORDS (any form, any casing):
leverage · utilize · seamless · robust · scalable · holistic · cutting-edge ·
world-class · unlock · supercharge · elevate · empower · game-changer ·
guaranteed rankings · full-service agency · digital marketing agency

BANNED COLD (industrial ICP — these are friction, not vocabulary):
schema · GEO · citation share · ERP · PIM · faceted navigation · CTR · coverage ·
impressions · pipeline · ARR

BANNED CONSTRUCTIONS:
- "not just X but Y" in any form
- rule-of-three padding (three parallel items where one would do)
- more than one em-dash per email. At most one, the one after the name. Zero
  elsewhere.
- any semicolon
- hedging filler: "it's worth noting", "that said", "in today's landscape",
  "as you may know", "I hope this finds you well"
- cold-email boilerplate: "I came across", "just checking in", "circling back",
  "touching base", "I never heard back"
- manufactured urgency of any kind
- any sentence that could be sent unchanged to a business in another industry

REQUIRED, and report which are present:
- first person singular ("I"), because these emails are from Artur
- at least one concrete noun from their world: quotes, RFQs, counter sales,
  line card, part number, cross-reference, reps
- sentence-length variation (not every sentence the same length)
- numbers before adjectives
```

### Lint C — claims

```
This email may be sent to a real prospect. Check every factual assertion in it.
Return PASS or a numbered list of what must be cut or sourced.

1. OBSERVED-OR-CUT. Every claim about THIS prospect must trace to a field in the
   attached scan JSON. Quote the claim and name the field. Any claim without a
   field is a fabrication — mark it CUT. "Only claim a leak you actually observed.
   A made-up leak is worse than no call."
2. NO CLIENT NAMES. Zero client or case-study names. "Northern Hydraulics" is
   under a hard naming block.
3. NO CLIENT NUMBERS. No case-study figures, no lift percentages, no lead counts.
   The proof is their gap, not our portfolio.
4. NO GUARANTEES. No promised ranking, no promised result, no implied outcome.
   The industrial side carries a no-guarantee disclaimer stance; results are
   illustrative, not predictive.
5. NO BANNED AGENCY NAMES. Check the email against the full list in
   brand/competitor-policy.yaml (case-insensitive substring match, heritage_allowed
   is empty). Amazon and "the manufacturers going direct" ARE fair to reference —
   that is how this ICP names the threat.
6. PRICE POSTURE. Published tier rates may be stated as published rates. A specific
   quote for THIS prospect's catalog may not be given cold.
7. CAN-SPAM BLOCK PRESENT, verbatim:
     IT Sale Solution LLC, a Florida limited liability company, doing business as
     Salesolution
     17071 W Dixie Hwy, PH42, North Miami Beach, FL 33160, US
     connect@salesolution.net · 561-531-4339
8. OPT-OUT LINE PRESENT and it works.
9. STAT SOURCING. Any on-page statistic reused from /services/catalog-ai/ must
   carry its source string with it (e.g. "BrightEdge AIO tracker · Q1 2026").
   A number without its source string is CUT.
10. SCAN FRESHNESS. Every scan datum older than 14 days is re-scanned before the
    send goes out. Check the stored scan date on every datum quoted. This is not
    the 30-day address re-verification — a freshly verified address can still be
    carrying a three-week-old scan, and that scan gets re-run.
```

---

## Stage 6 · SEND

| | |
|---|---|
| **Runs** | Loads micro-campaigns into the tool and releases them on schedule |
| **Tool** | Instantly (or Smartlead) |
| **In** | QA-passed emails, packed into batches of ≤50 |
| **Out** | Sends, and the reply stream that feeds stage 7 |
| **Gate** | **G2** — account, domains, and a completed 4-week warm-up |

### Campaign setup checklist — per micro-campaign

- [ ] **≤50 contacts.** Campaigns at or under 50 reply **2.76×** higher. *[playbook]* This is the single cheapest lift available and it is purely operational.
- [ ] **One segment, one angle per campaign.** Mixed batches make stage 8's kill/scale numbers meaningless.
- [ ] **1–2 contacts per company** verified at load time, not assumed from the pull.
- [ ] **Sending domain assigned**, and it is not the primary. Catch-all contacts on the catch-all domain only.
- [ ] **Throttle set to the current warm-up stage**, not to the tool's default. Week 5 is 20/mailbox/day, not 50.
- [ ] **Schedule: Tuesday–Thursday bias.** Thursday peaks at **6.87%** reply. *[playbook]*
- [ ] **Send window 4–7pm recipient-local** — the after-hours read. Working days only.
- [ ] **No two touches to the same contact in the same hour.**
- [ ] **Sequence: 5 touches over ~18 days.** 4–7 email sequences reply at **27%** versus **9%** for 1–3. *[playbook]* First follow-up at day 3 adds **+31%**. *[playbook]*
- [ ] **Plain text. No open tracking, no pixel, no image.** We do not report opens and we will not collect them.
- [ ] **Link tracking off except E2**, and E2's single link carries its UTM.
- [ ] **Blocklist synced** from the master suppression list immediately before release.
- [ ] **Stop-on-reply enabled** across the whole sequence.
- [ ] **Reply-to routes to a monitored inbox**, not a shared alias nobody opens.

### Retirement

A contact who finishes all five touches with zero engagement is retired. **No re-run for 90 days, and only with a genuinely new reason.** "We're following up again" is not a reason.

---

## Stage 7 · REPLIES

| | |
|---|---|
| **Runs** | Human triage. Not automated, not templated past the first line. |
| **Tool** | The monitored inbox |
| **In** | Replies |
| **Out** | Snapshot intakes, booked calls, suppressions |
| **Gate** | **G7** — confirm which booking link the positive reply hands out |

**SLA: a senior operator replies within 2 hours during send windows.** That is our own published promise — *"reply triage routed to a real inbox, not a shared account; senior operator within 2h."* **[our page]** Two hours, in practice, means Artur.

| Reply type | Response | Same reply includes | Timing |
|---|---|---|---|
| **Positive** — interested, "tell me more", "send it" | Confirm and move. Do not re-pitch. | The booking link **and** the snapshot intake, in the same message. Never make them choose a next step, and never make them wait for a second email. | ≤2h |
| **Question** — how does it work, what does it cost, what do you need from us | Answer the question directly, in one paragraph. Published tier rates may be quoted as published rates; a quote for their catalog may not be given cold. | The snapshot offer as the natural next step. | ≤2h |
| **Objection** | Use the matching counter from the objection library. Belief-first, concede what's true, one question back. | Nothing else. Do not stack an offer on top of a counter. | ≤2h |
| **Negative** — "no", "stop", "take me off", "not interested" | One line: acknowledge, thank, done. Never argue, never "just one more thing." | Nothing. | **Suppress globally, same day** |
| **Out of office** | No reply. | — | Re-queue **+2 weeks** |
| **Wrong person / referral** | Thank them, ask for the right name. | — | ≤24h |

**Breakup emails draw 10–15% response** *[playbook]*, and a meaningful share of those are negatives. That is the sequence working as designed: a clean no is a result. **"I never heard back" reduces bookings by 12%** *[playbook]* — do not use it, in any phrasing.

Suppression on a negative is global and same-day: email, calls, and LinkedIn (`04` §6).

---

## Stage 8 · MEASURE

| | |
|---|---|
| **Runs** | Weekly, one row appended to the ledger |
| **Tool** | The sending tool's numbers, hand-checked against the ledger |
| **In** | The week's sends and replies |
| **Out** | A WEEKLY-METRICS row in [`campaign-ledger.md`](campaign-ledger.md) |
| **Gate** | None |

### What gets counted

**sends · replies · positive replies · snapshots delivered · pilots started · $ signed · bounce % · complaint %**

**Open rate is not on the list and is not collected.** Our own page: *"Apple Mail Privacy Protection (2021) and Gmail's image proxy made open tracking statistically unreliable… Reporting opens today is reporting noise."* **[our page]** Turning it on for our own campaign would contradict a published position to gain a number we've said in public is worthless.

Post the row every week even when it's bad. A ledger with three good weeks and a gap is a ledger nobody will trust at day 60.

### Kill and scale rules

| Trigger | Action |
|---|---|
| **Reply rate under 5% by week 6** | **Stop.** The offer or the list is wrong. Rework both before sending again. Our own standard. **[our page]** |
| **Bounce ≥2% on a domain** | Halt that domain. Re-verify the remaining batch. Resume only on a clean verify. |
| **Complaints ≥0.3% on a domain** | Halt that domain **permanently**. |
| **A segment running at 2× benchmark** | **Double its share of next cycle's list.** Take the volume from the weakest segment, not from the total. |
| **A segment under half of benchmark after 200 sends** | Pause it. Check the observation quality before blaming the copy — a segment full of `[FALLBACK]` lines is a scan problem, not a copy problem. |

Benchmark for this campaign is manufacturing reply **6.1%** *[playbook]*, adjusted up for owner titles and ≤50-contact packing. Judge against the trend, not against a single week: at 50 sends a week, one reply moves the rate two points.
