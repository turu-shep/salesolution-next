# apollo-enrichment · Workstream B — a named human on 2,593 unswept seated domains

Your mission: fold in the 138 people already paid for, then sweep the 2,593 seated domains that have never been searched, so a list with 11 named contacts becomes a campaign.

This is the people-for-sending half of Apollo. The revenue-for-the-dashboard half is `./01-prompt-org-revenue.md` and runs independently. Both start at the same access gate.

## Read first, in order

1. `../00-README.md` — the pack index: the source registry, and the **company vs. person vs. sendable** distinction. 23,579 companies, ≈772 people, 366 sendable. This workstream moves the second and third numbers only.
2. `./00-README.md` — this workstream's dossier. The two access paths, the standing per-call rules, the pilot's measured rates, and the wrong-entity failure modes with the alias list.
3. `../../strategy/00-sourcing-strategy.md` §6 (S5 in the pipeline) and §7.2 (why some emails are already in hand, and why they ship in an isolated cohort).
4. `../../strategy/01-build-plan.md` §5v (S5 unblocked; S7 measured 787 of 2,782 batchable) and the "Known debt" list.
5. `../../../data/_s5-apollo-report-2026-08-02.md` — the pilot. Read it before planning a batch.

## Standing rules for every call, non-negotiable

- **`reveal_personal_emails` stays OFF.** GATE:HUMAN to change it, and the default answer is no — personal addresses are a different consent question from business ones, and the campaign pack's CAN-SPAM posture is built on business contact.
- **All reveal/waterfall flags false.** The pilot ran this way; keep it.
- **Phone credits are exhausted.** No `reveal_phone_number`, ever — there is nothing to spend.
- **1–2 contacts per company, hard cap** (§6 S7 rule). The pilot enforced 2 and ranked president > owner > CEO > GM > principal, with the second slot only for the top three classes.
- **Page 1 only, no pagination.** If the owner isn't on page 1, the company gets no contact from this pass.
- **Nothing reaches a send list without a NeverBounce `valid` verdict** — `emails/scripts/s6-verify.mjs`, 2% bounce kill line. Apollo's own `email_status: verified` is **not** that verdict and must not be treated as one.

## The work

Run in this order. Every phase writes a checkpoint before it writes an output, and every list write gets a **field-for-field readback** (§5s: `makeRecord()` before `toCsv()` silently blanked 35,927 cells while conservation PASSED).

### Phase 0 — answer the access gate (GATE:HUMAN, 10 minutes)

**GATE:HUMAN — either Artur adds `APOLLO_API_KEY` to `.env.local` (scripts run unattended, checkpointed, resumable) or every batch runs interactively through the Apollo MCP in a claude.ai session.**

- The **claude.ai Apollo MCP connector** is live in-session with ~47k lead credits on a cycle running to 2027-05.
- The **REST fallback** is already written — `scripts/precall-scan.mjs:116` (`X-Api-Key` header, keyed off `APOLLO_API_KEY` at line 54) — but **`APOLLO_API_KEY` is absent from `.env.local`**, so the headless path does not run today.

Do not start the sweep without answering it; 2,593 domains is not something to drive by hand call-by-call.

### Phase 1 — fold in the pilot (no credits, ~1 hour)

The freebie: **110 already-paid-for emails and 138 people sitting unfolded in a CSV.**

Join `emails/data/s5-apollo-contacts-2026-08-02.csv` onto `seated-v5.csv` by domain, into `contact_first_name / contact_last_name / contact_title / contact_email / contact_email_status / contact_linkedin / contact_source`.

Apply the apex-mismatch rule and the alias list from the dossier's §3:

- **If the revealed email's apex ≠ the company's apex, drop it** unless it is on the known-alias list. Expect to drop `martinsupply.com` and `remisi.com`'s wrong row.
- Known legitimate aliases that the rule would otherwise kill: `brenner-fiedler.com` → `brfa.com`, `customhydraulicsdesign.com` → `chdnc.com`, `greatlakesindustrial.com` → `greatlakesrubber.com`, `spartanindustrial.com` → `spartan-industrial.com`, `wilsonironworks.com` → `wiwinc.net`, `transmission-equipment.com` → `weimerbearing.com`. Keep the list explicit; do not loosen the rule.
- Screen out the title junk that scored as owner-class in the pilot: ESOP "Employee Owner", "Principal <grade> Engineer", "Former/Past President", "Asst to the CEO", "General Ledger Manager", reversed-name duplicates, first names that are company fragments.

Run the 110 emails through `s6-verify.mjs` — **only a NeverBounce `valid` admits a row to a send batch.** Calibration from the current cumulative file: of 1,566 verifications so far, **422 `valid` · 805 `unknown` · 289 `catchall` · 50 `invalid`** — so plan on roughly a third of revealed emails surviving, not all of them.

Deliverable: `seated-v6.csv` + readback diff + the updated batchable count against §5v's 787.

### Phase 2 — people enrichment on the 2,593 unswept seated domains

Run the pilot's shape: 10 domains per `apollo_mixed_people_api_search`, titles `president / owner / chief executive officer / general manager / principal`, `per_page 25`, page 1 only, then `bulk_match` in 10s. Cap 2/company. Checkpoint to JSONL after every call — restart-safe, deduped by `apollo_person_id`.

Projection from the pilot's 0.73 credits/domain and ~51% email yield: **~1,300–1,600 domains with a named owner-class person and ~1,200–1,400 with an email, for ~1,900–2,100 credits** — comfortably inside the balance. **Discount it for tail effects**: the pilot ran on the top-ranked 200, which skews toward larger, better-indexed companies.

**GATE:HUMAN per batch of 500 domains: state the expected credit spend before the run and the actual after.** Budget from the pilot: ~365 credits per 500 domains. Stop and report if actual runs >25% over.

Then S6: every new email through `s6-verify.mjs`, and only `valid` reaches an export batch.

### Phase 3 — ranked-out, on demand only

Do not sweep `pool-ranked-out-v7.csv` speculatively. It is 13,719 rows against a Track-2 need of 1,200–1,500, and §5l is explicit that **membership at the cut line is the weakest claim in the build**. Enrich a ranked-out slice only when a specific campaign needs it, and only after the seated sweep is done.

### Things that will bite

- Apollo's `email_status: verified` ≠ sendable. NeverBounce decides.
- One search in the pilot returned bleed-over rows from an earlier batch's org. **Dedupe by `apollo_person_id`, always.**
- 81 of the pilot's 189 domains had no qualifying owner-class person on page 1. That is the expected shape, not a bug — the company gets no contact from this pass.

## When this session's work lands

1. Update §5 Registry row in `./00-README.md` (status, counts, est. left) and the STATUS banner.
2. **RENAME THIS FOLDER** to match the new status — `apollo-enrichment [NEW-STATUS]` — that is how the founder reads readiness from the directory listing. Use `IN-PROGRESS` if you stopped before the plan completed. Note in the banner which workstream moved: this folder holds two, and finishing one is not finishing both.
3. Sync the pack registry table in `../00-README.md` (SSOT rule: row first, table second).
4. Note the change in `../99-hygiene.md` ONLY if it created files to clean.
