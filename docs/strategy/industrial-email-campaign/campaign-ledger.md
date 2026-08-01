# Campaign ledger — industrial cold email

**Created:** 2026-07-28 · **Owner:** Artur · **Status:** seeded, nothing signed

This is the campaign's shared state. Every session that touches the campaign reads it first and appends to it last. The ledger is the handoff — the program survives being picked up three weeks later because the decisions are here and not in a conversation.

---

## The contract

**One row per gate, per decision, and per weekly metric.** Nothing else goes in here. Notes, drafts, and thinking live in the numbered files.

**Never delete a row.** A gate that was declined is data. A week that went badly is data. A decision that turned out wrong is the most useful row in the file.

**Corrections are written inline as amendments, not by editing the original.** The wrong version stays visible with the correction underneath it:

```
**Correction (2026-09-02):** this was recorded as signed on Aug 29. The countersigned
copy came back Sep 2. Original date left above.
```

**Status lifecycle:** `OPEN` → `SIGNED` or `DECLINED` (gates) · `OPEN` → `FIXED`, `PROPOSED`, or `DEFERRED` (pre-flight items). A `DEFERRED` row carries the reason and the date it gets revisited.

**Row shape:**

```
### G3 · gate · OPEN
**Decision:** One sentence. What Artur is choosing between.
**Blocks:** What cannot happen until this is signed.
**Specified in:** file · section
**Signed:** —
**Notes:** —
```

**Who writes what.** An AI session may append WEEKLY-METRICS rows and may change a PF row's status to `FIXED` with the commit reference. **Gate rows are Artur's.** No session flips a gate, and no session softens one.

---

## Gates

### G1 · gate · OPEN
**Decision:** Buy the Apollo paid tier and put `APOLLO_API_KEY` into `.env.local`.
**Blocks:** All list building. Stage 1 of the pipeline returns nothing without it. The API key is a paid-tier feature and `email` on search results is credit-metered.
**Specified in:** `05-automation-pipeline.md` stage 1
**Signed:** —
**Notes:** `scripts/precall-scan.mjs:105` is the working REST client — no new integration needed, just the key.

### G2 · gate · OPEN
**Decision:** Instantly (or Smartlead) account plus 2–3 dedicated sending domains. ~$300–500 for the 60 days.
**Blocks:** Track 2 entirely. **Longest-lead gate in the pack** — warm-up is four weeks and starts the day DNS validates, so this is the one to clear on day 1.
**Specified in:** `04-deliverability-infra.md` §3–4
**Signed:** —
**Notes:** Both tools are already on our own published vendor shortlist. Recommending a tool to clients and using something else is a credibility leak that costs nothing to avoid.

### G3 · gate · OPEN
**Decision:** Angle 2 — approve (a) the expansion framing, (b) the dropship language, (c) naming manufacturer brands in outbound (nominative use, only brands actually on the prospect's line card, never implying partnership or endorsement), and (d) whether the Catalog AI page gets an expansion block or the angle stays outbound-only.
**Blocks:** Every Angle-2 send. Angle 1 runs day 1 without it.
**Specified in:** `00-README.md`, `03-angles-and-copy.md`
**Signed:** —
**Notes:** "Dropship" appears nowhere in the repo — a full-corpus grep for `dropship|drop-ship|authorized distrib|MAP polic|minimum advertised` returned zero hits. This is new positioning with no approved copy and no fact-ledger backing. Angle 2 is also where the $30K deals are, so declining it re-weights the whole plan toward the volume route in `01-goal-math.md` §2.

### G4 · gate · OPEN
**Decision:** Approve the three new objection counters — "we can't sell what we don't stock", "data entry is cheap offshore", "our system can't handle it".
**Blocks:** Reply handling on Angle 2.
**Specified in:** `03-angles-and-copy.md`
**Signed:** —
**Notes:** No documented counter exists for any of the three. The closest on-file analogues are IND3 (reps), C2 (nephew), and nothing at all for the third. Written as PROPOSED in the objection library's voice: belief-first, concede what's true, one question back.

### G5 · gate · OPEN
**Decision:** Track 1 — accept founder-manual sending from the established mailbox for days 1–28 (volume-capped ≤15/day, verified-only, reply-first, instant suppression), or decline and wait for warm-up.
**Blocks:** The 60-day goal itself.
**Specified in:** `04-deliverability-infra.md` §2, verdict in `01-goal-math.md` §5
**Signed:** —
**Notes:** The trade-off is real and has no clever answer: it sends cold mail from or adjacent to the primary domain, which our own service page says we never do for clients. Declining costs roughly three weeks of the 60 and moves the honest target to $25–40K. **This row changes the number in `01`. Record the date.**

### G6 · gate · OPEN
**Decision:** The four gated pre-flight items — PF-2 (revenue band), PF-3 (SKU floor), PF-4 (`/catalog-snapshot/` URL stability), PF-8 (NAP sweep).
**Blocks:** Sending traffic to `/catalog-snapshot/` and shipping the CAN-SPAM footer.
**Specified in:** `07-preflight-fixes.md`
**Signed:** —
**Notes:** PF-8 is the hard blocker — CAN-SPAM requires a valid postal address and three variants are still live on-site.

### G7 · gate · OPEN
**Decision:** Confirm which booking link the positive-reply CTA hands out — `NEXT_PUBLIC_CALENDLY_URL` or `/book-growth-call/`.
**Blocks:** Positive-reply triage. A positive reply gets the booking link and the snapshot intake in the same message, so the link has to be right before the first send.
**Specified in:** `05-automation-pipeline.md` stage 7
**Signed:** —
**Notes:** Smallest gate on the list. Two minutes to close.

---

## Pre-flight items

### PF-1 · S2 · copy · OPEN
**Where:** `components/sections/catalog-ai/CatalogCaseStudyCallout.tsx:24`
**Claim:** The pull quote still ends "…Qualified leads doubled inside two quarters" — a sentence the fact ledger killed for contradicting +43.5% over the same window.
**Authority:** PROPOSED (copy). Urgent — this is the page our emails point at.
**Fixed:** —

### PF-2 · S2 · positioning · OPEN
**Where:** `components/sections/catalog-snapshot/CatalogSnapshotHero.tsx:50-54`, `CatalogSnapshotFit.tsx:13`
**Claim:** The page says $2M–$50M; the campaign targets $5M–$75M. The top half of the band we email is excluded by the page we send them to.
**Authority:** GATE:HUMAN — G6
**Fixed:** —

### PF-3 · S3 · copy · OPEN
**Where:** `components/sections/catalog-snapshot/CatalogSnapshotFit.tsx`
**Claim:** "Strong fit" is 1,000+ SKUs, "Skip it if" is under 200. The 200–999 band is both a fit and not a fit.
**Authority:** GATE:HUMAN — G6
**Fixed:** —

### PF-4 · S2 · flow · OPEN
**Where:** `docs/strategy/multi-vertical-pivot/00-phase-plan.md` — Phase 3, "Catalog AI funnel rehoming"
**Claim:** `/catalog-snapshot/` may be replaced or merged when the v2-1 design is salvaged. Destination TBD. E2's UTM'd link points there.
**Authority:** GATE:HUMAN — G6. Freezing the URL for 60 days is an acceptable answer.
**Fixed:** —

### PF-5 · S3 · config · OPEN
**Where:** `brand/tools.yaml`
**Claim:** `tools: {}` with a comment saying no tools are live. Two are, registered in `lib/tools/pages.ts`. The engine's resolver flags links to them as missing slugs.
**Authority:** Autonomous
**Fixed:** —

### PF-6 · S3 · config · OPEN
**Where:** `scripts/precall-scan.mjs:43` vs `.env.local`
**Claim:** The script reads `DFS_LOGIN`/`DFS_PASSWORD`; the env file has `DATAFORSEO_USERNAME`/`DATAFORSEO_PASSWORD`. The scanner reports "no DFS auth" with working credentials in the same file.
**Authority:** Autonomous. One line. Unblocks the entire personalization engine.
**Fixed:** —

### PF-7 · S3 · correctness · OPEN
**Where:** `scripts/precall-scan.mjs:173` — `parseCsv()`
**Claim:** Splits on `,` with no quote handling. An Apollo export with a comma inside a company name shifts every subsequent column.
**Authority:** Autonomous (build session — needs a quoted-comma fixture test)
**Fixed:** —

### PF-8 · S2 · compliance · OPEN
**Where:** `lib/business.ts` (locked SSOT) vs three address variants live on-site
**Claim:** CAN-SPAM requires a valid physical postal address in every message. The NAP sweep is unconfirmed and the file's own comment says GBP, old WordPress, and directory listings still carry historical variants.
**Authority:** GATE:HUMAN — G6. Blocks the first send.
**Fixed:** —

### PF-9 · S4 · hygiene · OPEN
**Where:** `ss local env` at repo root
**Claim:** 16 keys, an older copy of `.env.local`. Gitignored and untracked, so nothing leaked — but it's a second secret store that will drift, and `APOLLO_API_KEY` is about to land in one of them.
**Authority:** Autonomous (delete locally)
**Fixed:** —

---

## Weekly metrics

One row every Friday. **Post it even when it's bad** — a ledger with a gap is a ledger nobody trusts at day 60.

Open rate is not a column and is not collected. Our own page calls open tracking "reporting noise," and collecting it for our own campaign would contradict a published position to gain a number we've said in public is worthless.

| Week | Ending | Sends | Replies | Positive | Snapshots | Pilots | $ signed | Bounce % | Complaint % |
|---|---|---|---|---|---|---|---|---|---|
| *template* | *YYYY-MM-DD* | *0* | *0* | *0* | *0* | *0* | *$0* | *0.0%* | *0.00%* |

**Red lines, checked on every row:** bounce ≥2% halts the domain and forces a re-verify · complaints ≥0.3% halts the domain permanently · reply under 5% by week 6 stops the campaign for offer-and-list rework.

**Running totals, updated with each row:**

- **$ signed:** $0 — against **$60K** (stretch) and **$25–40K** (base case).
- **$ in live pilots and proposals:** $0 — against **$40–80K** (base case).
- **Verified contacts in sequence:** 0 — against **1,400–2,000** required.

Both dollar lines get read at the day-45 checkpoint and the day-60 review. Signed money with no pipeline behind it is the plan failing quietly, and that is only visible if both lines are posted every week.

---

## Decisions

Anything that isn't a gate and isn't a metric but changes how the campaign runs. Kill/scale calls, the day-45 decision, segment reweighting, a domain halted and why.

The four below were decided when the pack was written, on 2026-07-28. They are recorded here so a session three weeks in doesn't rediscover them or quietly pick a different number. Any of them can be amended — as an amendment underneath, per the contract, never by editing the row.

### D-01 · decision · RECORDED 2026-07-28
**Decision:** A contact who completes all five touches with zero engagement is retired for **90 days**, and only re-enters with a genuinely new reason.
**Changes:** List replenishment math. Retired contacts leave the sendable pool for a quarter, so weekly replenishment has to cover them.
**Specified in:** `05-automation-pipeline.md` stage 6 · Retirement
**Recorded:** 2026-07-28 — pack decision, open to amendment.
**Notes:** "We're following up again" is not a new reason.

### D-02 · decision · RECORDED 2026-07-28
**Decision:** Any email address older than **30 days** is re-verified before it enters a second sequence.
**Changes:** Adds a verification cost to every re-use and a step to the Friday loop. It is also what keeps the 2% bounce line from tripping on stale data.
**Specified in:** `05-automation-pipeline.md` stage 2 · `06-process-runbook.md` weekly loop, item 5
**Recorded:** 2026-07-28 — pack decision, open to amendment.
**Notes:** Distinct from D-03. An address can be fresh while the scan behind the email is stale.

### D-03 · decision · RECORDED 2026-07-28
**Decision:** Every scan datum older than **14 days** is re-scanned before the send goes out.
**Changes:** Sets the weekly scan batch's real job — it refreshes as much as it collects. Budget the DataForSEO calls for both.
**Specified in:** `03-angles-and-copy.md` §1 and §9 Gate 3 · `05-automation-pipeline.md` stage 5, Lint C item 10
**Recorded:** 2026-07-28 — pack decision, open to amendment.
**Notes:** The whole pitch is "we checked." A two-week-old check is the outer edge of what that sentence survives.

### D-04 · decision · RECORDED 2026-07-28
**Decision:** The scan-pilot acceptance bar: the 50-domain pilot has to produce observation lines with a **fallback rate under 50%**. At or above 50%, the scan stage gets reworked before launch rather than shipping a sequence that is half generic.
**Changes:** Makes the week-0 pilot a gate on the copy, not a rehearsal. A failed bar moves work into week 0 instead of discovering the problem at 400 sends.
**Specified in:** `05-automation-pipeline.md` stage 3 · run in `06-process-runbook.md` week 0, Thu Aug 6
**Recorded:** 2026-07-28 — pack decision, open to amendment.
**Notes:** A fallback is a legitimate line, not a failure. But a batch that is mostly fallback means the scan is not finding the gap the angle is built on, and no amount of copy editing fixes that.
