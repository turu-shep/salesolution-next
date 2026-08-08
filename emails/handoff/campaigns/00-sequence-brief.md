# Handoff — email sequences for the industrial list

**Written 2026-08-02.** Spec for building two cold-email campaigns against
`emails/lists/seated-v4.csv` and uploading them to Smartlead as **drafts**.
Read this before writing a word of copy.

> **STATUS (2026-08-02): EXECUTED — both campaigns staged as gated drafts.**
> `IND-C1` = **3751334**, `IND-C2` = **3751335**; DRAFTED, 0 senders, 0 leads,
> no schedule. Copy is parsed from `01-…`/`02-…` below by
> `scripts/industrial-smartlead-setup.mjs` (dry-run / `--apply` / `--verify`;
> re-verify any time with `--verify`). Full account + caveats:
> `emails/data/_smartlead-upload-2026-08-02.md`. The list is now
> **`seated-v5.csv`** (thehoseshop split — see `strategy/02-list-guide.md`);
> export previews + the declaration review queue exist (`emails/scripts/
> s7-export.mjs`, `declaration-review.mjs`). Sending stays blocked on the
> gates in §"Nothing sends until these clear".

**Prerequisite reading, in order:**
1. `.agents/product-marketing-context.md` — voice, ICP language rules, kill-list. **The SSOT for copy.**
2. `docs/strategy/industrial-email-campaign/03-angles-and-copy.md` — existing copy that already passed three lint gates. **Build on it; don't re-invent.**
3. `docs/strategy/icp/industrial-distribution.md` — the anti-jargon rules (never use cold: schema, GEO, CTR, ERP/PIM, faceted navigation).
4. `emails/handoff/strategy/02-list-guide.md` — which list, which columns.

---

## The two campaigns

| | **C1 — Catalog AI** | **C2 — industrial growth** |
|---|---|---|
| **Sends** | First | **~1 month after C1** |
| **Audience** | The list | Same list, C1 non-responders |
| **Angle** | **Angle 1 only — "the AI answer skips your catalog."** Cleared; matches the live offer and objection library. | Broader services book → **Book a Growth Call** |
| **Offer** | Catalog AI, the specific engagement | The six-service book: AI Search & GEO, Catalog AI, Editorial Authority, Website Development, Outbound Email, Full Growth Ownership |
| **CTA** | Per the existing pack | Book a Growth Call |

**Angle 2 ("you're authorized on lines you barely list") stays unsigned — G3.**
The line-card evidence now exists (387 rows with 2+ verified brands, plus the
self-declarations), which strengthens the case for signing it, but **it is not
signed and must not appear in C1 or C2.**

**Why a month apart:** C1 makes a specific, falsifiable claim about their
catalog. C2 is positioning. Running them together muddies which message earned
the reply, and doubles the send load on domains that have never warmed.

---

## Personalization — use what the list actually has

Real columns in `seated-v4.csv`, with honest fill rates:

| Variable | Fill | Notes |
|---|---|---|
| `company_display` | 100% | **Use this, never `company`** (that's a lowercase join key) |
| `domain` | 100% | |
| `contact_first_name` / `_title` | 11 rows (0.4%) | **The 4 inside `first-send-200` are all sitting Presidents**; the other 7 are 3 GM, 1 Purchasing, 1 Ops and 2 more — my "every one a President" claim held only for the cohort. **The pack's rule of "no `first_name` → no send" would kill 99.6% of this list — copy is built on `company_display` instead.** |
| `self_declaration` | ~23% present, **but `self_declaration_verbatim` is true on only 5.2%** | The dealer's own sentence about the lines they carry. **Not clean text out of the box** — even verbatim ones carry scrape artifacts ("0 Skip to Content…"). Approving these is a real human review pass, not a glance. |
| ~~`brand_authorized`~~ | 13% have 2+ | **DO NOT USE — my error.** Naming manufacturer brands in outbound is exactly what **G3 gates**, and G3 is unsigned. Listing it here as an asset contradicted the gate. Excluded from both sequences; **open decision for Artur.** |
| `ecommerce_class` | most | `catalog_no_cart` = products online, can't transact. The offer's thesis. |
| `sku_estimate` | ~48% | Ranking signal — **never quote a SKU number in copy**, precision is 0.60 |

**Rules that are not stylistic:**
- **Never quote a `self_declaration` without eyeballing it.** Three negated ones were caught — one company publishes *"We are a Non-Authorized Stocking Distributor."* Quoting that back would be catastrophic.
- **Never state a federal award dollar figure.** 16% of matched rows inherit a *parent company's* total. Product-category descriptions are safe; dollars are not.
- **Never quote a SKU count.** See precision above.
- Every merge variable needs a fallback that reads naturally when empty. Roughly 77% of rows have no declaration.

---

## Voice — non-negotiable

**Run the `humanizer` skill on every email before it ships.** Standing global
instruction for all customer-facing copy, not a suggestion.

Operator register: terse, declarative, concrete, trade-off-aware, no hype.
"X, not Y." constructions. Kill em-dash overuse, "not just X but Y",
rule-of-three padding, hedging filler, corporate buzzwords. Lead with the
outcome in the reader's words. Translate jargon to plain stakes.

The reader is an owner or president of a $2–75M distributor who wears the
growth hat among five others and is not a trained marketer.

---

## Sequence shape

Follow `docs/strategy/industrial-email-campaign/` for cadence and volumes — it
already specifies micro-campaigns of ≤50, 1–2 contacts per company, and the
warmup-bound ramp. Do not invent a different schedule.

**Cohort E (232 rows) gets its own campaign.** Those emails came from a
manufacturer's directory, not the dealer. Bounce risk is unmeasured against a
2% kill line; isolated it can be killed, blended it poisons every domain.

**T4 ($2–5M) is tracked separately.** That band rarely absorbs $10–30K, so its
reply rate must not be read as a copy failure.

---

## Smartlead upload — drafts only

Client: `scripts/lib/smartlead.mjs`. Key in `.env.local` as `SMARTLEAD_API_KEY`.

**Auth rides in the query string, so request URLs are secrets.** Never log a
URL, never print the key, and **never route this client through
`emails/scripts/lib/fetch.mjs` (`politeFetch`)** — its disk cache would write
the key to disk.

**All eight write paths are unverified:** `createCampaign`, `saveSequences`,
`addLeads`, `addEmailAccountsToCampaign`, `updateCampaignSchedule`,
`updateCampaignSettings`, `setCampaignStatus`, `upsertWebhook`. The first write
is a test — verify each response and stop on the first failure rather than
pushing through. `setCampaignStatus` has conflicting docs (POST vs PATCH) and
is the first thing to suspect.

**Hard rules:**
- Create both campaigns as **DRAFT**. **Never call `setCampaignStatus` to start anything.**
- **Do not add leads yet.** Sequences and settings only. Leads go in after verification (S6) and after a suppression list exists.
- Campaign `3750571` is a parked draft — leave it alone.
- Read back everything written and diff it against what was intended.

---

## Nothing sends until these clear

1. **No suppression / DNC list exists anywhere.** The join is built; there is no data. The campaign pack's own highest-consequence gap.
2. **Sender warmup has never run** — not "is off", never, since the mailboxes were created in 2024. The 4-week clock starts from zero.
3. **Both current domains should be retired** (`salesolution.co`, `salesolution.io`) — 4,899 prior sends produced 204 opens and **zero replies**, with a flat 3–5% open rate across all 12 steps: the signature of mail that never reached an inbox. Fresh domains cost ~$50 and no calendar time, since warmup runs 4 weeks regardless.
4. **`thehoseshop.com` is two companies in one row** — split before it sends.

Drafting and uploading are safe now. Sending is not.
