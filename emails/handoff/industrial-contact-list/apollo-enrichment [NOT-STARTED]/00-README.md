# apollo-enrichment — named contacts and firmographics for a list that has almost neither

> STATUS (2026-08-03): NOT-STARTED — a 189-domain pilot ran and was never folded in. 11 of 2,782 seated rows carry a named person (0.4%), and only 366 rows carry an email a verifier has cleared. This is the gap between "a list" and "a campaign".

Prompts in this folder: `01-prompt-org-revenue.md` — Workstream A, firmographics per domain into the dashboard's `apollo-orgs-*.csv` contract · `02-prompt-people.md` — Workstream B, fold in the pilot then sweep 2,593 seated domains for named owner-class contacts.

Prerequisite reading, in order: [`00-sourcing-strategy.md` §6 (S5 in the pipeline) + §7.2 (why some emails are already in hand)](../../strategy/00-sourcing-strategy.md) · [`01-build-plan.md` §5v (S5 unblocked; S7 measured 787 of 2,782 batchable) and the "Known debt" list](../../strategy/01-build-plan.md) · [`data/_s5-apollo-report-2026-08-02.md`](../../../data/_s5-apollo-report-2026-08-02.md) — the pilot, read it before planning a batch

## 1. What it is

Apollo.io, used the way the strategy's §1 thesis intends: **not as a discovery source — every prospect here was found elsewhere — but as the layer that attaches a named human and a firmographic band to a domain we already hold.**

Two access paths, and which one you have decides the whole shape of the work:

- **The claude.ai Apollo MCP connector** — live in-session, **~47k lead credits, cycle running to 2027-05**. **Phone credits are exhausted: this is email-only.** No `reveal_phone_number`, ever, and not because of policy — there is nothing to spend.
- **The REST fallback**, already written: `scripts/precall-scan.mjs:116` (`X-Api-Key` header, keyed off `APOLLO_API_KEY` at line 54). **`APOLLO_API_KEY` is absent from `.env.local`**, so the headless path does not run today.

That is the first gate. **GATE:HUMAN — either Artur adds `APOLLO_API_KEY` to `.env.local` (scripts run unattended, checkpointed, resumable) or every batch runs interactively through the MCP in a claude.ai session.** Do not start Workstream B without answering it; a 2,593-domain sweep is not something to drive by hand call-by-call.

Standing rules for every call, non-negotiable:

- **`reveal_personal_emails` stays OFF.** GATE:HUMAN to change it, and the default answer is no — personal addresses are a different consent question from business ones and the campaign pack's CAN-SPAM posture is built on business contact.
- **All reveal/waterfall flags false** (the pilot ran this way; keep it).
- **1–2 contacts per company, hard cap** (§6 S7 rule). The pilot enforced 2 and ranked president > owner > CEO > GM > principal, with the second slot only for the top three classes.
- **Page 1 only, no pagination.** If the owner isn't on page 1, the company gets no contact from this pass.
- **Nothing reaches a send list without a NeverBounce `valid` verdict** — `emails/scripts/s6-verify.mjs`, 2% bounce kill line. Apollo's own `email_status: verified` is **not** that verdict and must not be treated as one.

## 2. What we pulled

**Pilot only, 2026-08-02** (`emails/data/s5-apollo-contacts-2026-08-02.csv`, 138 rows; checkpoint at `s5-apollo-2026-08-02.jsonl`):

| Measure | Pilot |
|---|---|
| Domains swept | 189 (the first-send cohort + its no-email rows) |
| Searches | 19 × `apollo_mixed_people_api_search`, 10 domains/call, `per_page 25`, page 1 |
| People selected | **138 across 108 domains** (57.1% of domains) |
| Domains with no qualifying owner-class person on page 1 | 81 |
| Enrichment | 14 × `bulk_match`, 10-then-8 per call, **138/138 matched, 0 missing** |
| Emails revealed | **110** (107 `verified` + 3 `extrapolated`) across **97 domains** (51.3%) |
| Credits consumed | **138** — 1 per enrichment attempt, **<0.3% of the ~47k balance** |

**None of it has been folded into `seated-v5.csv`.** The list still shows 11 named contacts, all of them from the Adaptall export.

## 3. How deep we went

One cohort, one pass, and it produced two reusable numbers: **0.73 credits per domain swept** and **~51% of domains yield an email**. Both are almost certainly optimistic for the tail — the pilot ran on the top-ranked 200, which skews toward larger, better-indexed companies.

It also produced the failure modes to code against:

- **Wrong-entity reveals.** `martinsupply.com` → a person whose email is on `martinjewelers.com`; `remisi.com` → an email on `remindustrial.mx`. **Rule: if the revealed email's apex ≠ the company's apex, drop it** unless it is on the known-alias list.
- **Legitimate mail-domain aliases** that the same rule would otherwise kill: `brenner-fiedler.com` → `brfa.com`, `customhydraulicsdesign.com` → `chdnc.com`, `greatlakesindustrial.com` → `greatlakesrubber.com`, `spartanindustrial.com` → `spartan-industrial.com`, `wilsonironworks.com` → `wiwinc.net`, `transmission-equipment.com` → `weimerbearing.com`. Keep an explicit alias list; do not loosen the rule.
- **Title junk that scored as owner-class:** ESOP "Employee Owner", "Principal <grade> Engineer", "Former/Past President", "Asst to the CEO", "General Ledger Manager", reversed-name duplicates, first names that are company fragments.

## 4. What's left on the table

Effectively everything.

- **Workstream A (orgs): 2,782 seated domains have never been enriched for firmographics.** The revenue floor ($2M) and the priority band ($10–50M) currently rest on inferred proxies — §8.1a says so plainly, and warns that a floor you cannot measure is fiction.
- **Workstream B (people): 2,593 of 2,782 seated domains have never been swept for a contact.** At the pilot's rates that projects to **~1,300–1,600 domains with a named owner-class person and ~1,200–1,400 with an email, for ~1,900–2,100 credits** — comfortably inside the balance. Discount it for tail effects.
- **The 13,719-row ranked-out pool** is untouched and stays that way until seated is done.
- The immediate freebie: **110 already-paid-for emails and 138 people sitting unfolded in a CSV.**

## 5. Registry row

| apollo-enrichment | NOT-STARTED | 138 | 0 | 2026-08-02 (pilot) | ~1,300–1,600 named contacts across 2,593 unswept seated domains | apollo-enrichment/ |
