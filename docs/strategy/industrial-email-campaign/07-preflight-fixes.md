# 07 · Pre-flight fixes

**Created:** 2026-07-28 · **Owner:** Artur · **Status:** 4 autonomous, 4 gated (G6 covers PF-2, PF-3, PF-4, PF-8), 1 PROPOSED (PF-1)

Nine things to fix before traffic reaches the pages. Four are code or config and get fixed without asking — PF-5, PF-6, PF-7, PF-9. Five are copy, pricing, or positioning — PF-1 plus the four G6 items — and those get written up as `PROPOSED` and stop, per the house rule: code, config, and tests are fixed autonomously; copy, pricing, positioning, and any GATE-signed decision are proposed and left alone.

The severity scale is the house one: **S1** exploitable, data-losing, or legally exposed · **S2** real user or revenue impact · **S3** quality and maintainability · **S4** nit.

All nine are seeded as OPEN rows in [`campaign-ledger.md`](campaign-ledger.md) as PF-1 through PF-9.

---

| # | Sev | What | Where | Authority |
|---|-----|------|-------|-----------|
| **PF-1** | S2 | Retracted claim still live on the page our emails point at | `components/sections/catalog-ai/CatalogCaseStudyCallout.tsx:24` | **PROPOSED** (copy) — urgent |
| **PF-2** | S2 | Revenue band mismatch: campaign targets $5M–$75M, snapshot page says $2M–$50M | `components/sections/catalog-snapshot/CatalogSnapshotHero.tsx:50-54`, `CatalogSnapshotFit.tsx:13` | **GATE:HUMAN — G6** |
| **PF-3** | S3 | SKU floor contradicts itself on one page: 1,000+ is a "strong fit", under 200 is "skip it" | `components/sections/catalog-snapshot/CatalogSnapshotFit.tsx` | **GATE:HUMAN — G6** |
| **PF-4** | S2 | `/catalog-snapshot/` URL stability undecided while campaign UTMs are about to point at it | `docs/strategy/multi-vertical-pivot/00-phase-plan.md` Phase 3 | **GATE:HUMAN — G6** |
| **PF-5** | S3 | `brand/tools.yaml` is stale-empty; two tools are live | `brand/tools.yaml`, `lib/tools/pages.ts` | **Autonomous** |
| **PF-6** | S3 | DataForSEO env name mismatch blocks the whole scanner | `scripts/precall-scan.mjs:43` vs `.env.local` | **Autonomous** |
| **PF-7** | S3 | CSV parser has no quote handling; Apollo exports will corrupt | `scripts/precall-scan.mjs:173` | **Autonomous** (build session) |
| **PF-8** | S2 | NAP sweep unconfirmed; the CAN-SPAM footer needs a correct address | `lib/business.ts` is locked; three variants still live on-site | **GATE:HUMAN — G6** |
| **PF-9** | S4 | Stray plaintext secrets file at repo root | `ss local env` | **Autonomous** (delete locally) |

---

### PF-1 · S2 · The retracted claim is still on the landing page

`CatalogCaseStudyCallout.tsx:24` ends its pull quote with *"…Qualified leads doubled inside two quarters."* The fact ledger killed that sentence — "Don't reinstate" — because it contradicts the +43.5% recorded over the same six-month window. It was removed from `Evidence.tsx:28` and the Catalog AI page was never swept. The founder-approved trimmed version of the quote already exists and is the replacement.

**Before traffic:** this is the page a prospect lands on when they click through from our email. A campaign built on "we only claim what we observed" that routes people to a claim we internally retracted fails on its own premise, in public, at the exact moment we've asked for trust. It is also the one item on this list that a prospect can catch us on.

### PF-2 · S2 · Two different revenue bands

The campaign targets **$5M–$75M** — the locked ICP band, used in every sales doc. `/catalog-snapshot/` says **$2M–$50M** in its fit box. The top half of the band we're emailing is excluded by the page we send them to, and the bottom of the page's band is below our real floor.

**Before traffic:** an owner at $60M reads "$2M–$50M" and concludes the offer isn't for them, on the page whose whole job is to convert. GATE because it's a positioning number, not a typo — someone has to decide which band is correct rather than picking the one that's more convenient.

### PF-3 · S3 · The SKU floor contradicts itself

Same page: "Strong fit" is **1,000+ SKUs**, "Skip it if…" is **under 200 SKUs**, and the FAQ says under 1,000 SKUs the $3,000 minimum "doesn't amortize well." The 200–999 band is simultaneously a fit and not a fit. Our own disqualifier is 200 SKUs, so the campaign will send people into that ambiguity by design.

**Before traffic:** less urgent than PF-2 because it confuses rather than excludes, but it undercuts the honest-disqualifier posture the offer leans on. Pick one number and let the FAQ explain the economics.

### PF-4 · S2 · `/catalog-snapshot/` may move

Phase 3 of the pivot plan is "Catalog AI funnel rehoming" — salvage the v2-1 design into the Catalog AI funnel, destination **TBD**, replace-vs-merge with `/catalog-snapshot/` undecided, delete `/v2-1/` after.

**Before traffic:** E2's single UTM'd link points here, and that link is the campaign's only artifact CTA. A URL change mid-flight breaks every already-sent email, and 404s from a cold-email UTM are the kind of thing that shows up in a deliverability review. Decide replace or merge, or explicitly freeze the URL for 60 days. Either answer unblocks; no answer does not.

### PF-5 · S3 · `brand/tools.yaml` is empty and stale

The file says `tools: {}` with the comment *"No interactive calculators/finders live on salesolution.net yet."* Two are live: `/tools/catalog-ai-readiness/` and `/tools/ai-visibility-calculator/`, both registered in `lib/tools/pages.ts`. The content engine's tool resolver will flag any link to them as a missing slug and raise `needs_issue`.

Register both. Autonomous — it's a config file catching up to reality.

### PF-6 · S3 · The DataForSEO env alias

`.env.local` holds `DATAFORSEO_USERNAME` and `DATAFORSEO_PASSWORD`. `scripts/precall-scan.mjs:43` reads `DFS_LOGIN` and `DFS_PASSWORD`. The scanner reports "no DFS auth" with working credentials sitting in the same file.

One line: alias in the script, or add the `DFS_*` names to `.env.local`. This unblocks the entire personalization engine — stage 3's scripted path, the AI-answer check, and every observation line that isn't a fallback. Cheapest fix on the list by a wide margin.

### PF-7 · S3 · The CSV parser will corrupt Apollo rows

`parseCsv()` at `precall-scan.mjs:173` splits on `,` with no quote handling. Apollo exports carry commas inside company names routinely — "Smith, Anderson & Co Industrial Supply" shifts every column after it by one.

Swap in a real parser **before importing anything from stage 1.** Autonomous, but it belongs to the build session (phase 2) rather than a quick patch, because it needs a test with a quoted-comma fixture.

### PF-8 · S2 · The NAP sweep is unconfirmed

`lib/business.ts` is the locked SSOT, founder-confirmed 2026-07-26: *17071 W Dixie Hwy, PH42, North Miami Beach, FL 33160.* Its own comment warns that Google Business Profile, the old WordPress site, and directory listings still carry historical variants. Three addresses appear on the live site.

**Before traffic:** CAN-SPAM requires a **valid physical postal address** in every message. A footer address that disagrees with the website and the Google listing is worse than a missing one — it reads as a shell. This gates the footer block in [`04`](04-deliverability-infra.md) §8, which gates the first send. GATE because confirming an address is a founder act, not a grep.

*Related and unresolved:* the "Sale Solution" vs "Salesolution" spelling is F-17, still open. The footer composes as `IT Sale Solution LLC … doing business as Salesolution`, which is correct either way, so the spelling question doesn't block the send.

### PF-9 · S4 · The stray secrets file

`ss local env` sits at the repo root — 16 keys, an older copy of `.env.local`. It is gitignored and untracked, so nothing leaked. It is a second secret store that will drift out of sync with the first, and this campaign is about to add `APOLLO_API_KEY` to one of them.

Delete it locally. Note only, no ceremony.
