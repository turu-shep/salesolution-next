# cmco — settle the two open questions, then route the 212 or close it

Your mission: answer the two questions §4 of the dossier leaves open, and turn
212 email-reachable companies into either a staged GATE-L6 micro-cohort or a
written decision not to.

## Read first, in order

1. `../00-README.md` — the pack index: the source registry, the
   company/person/sendable distinction, and the new-source rule.
2. `./00-README.md` — this source's dossier. The 12.2%/212/113 split is the
   whole story; do not re-derive it.
3. `../../strategy/00-sourcing-strategy.md` **§7.2 (GATE-L6)** — the decision
   that makes these addresses usable and the safeguard that is not optional.
4. `../../strategy/01-build-plan.md` §5h (the signal test), §5i (source-native
   codes must be shown to sort before anything is seated), §5l (the cut line
   is the weakest claim in the build).

**Nothing here is billed** except the verification step, which is stated
inline with its cap.

## The work

### Step 1 — the two open questions, offline, zero network

Both are answerable from `emails/data/raw/cmco-2026-08-04.json` alone.

- **The `preferred` anomaly.** It is `True` on 80.7% of rows. Either it means
  something narrower than the word suggests, or the sweep's `brand=""` made
  every row "preferred" by default. Cross-tabulate `preferred` against
  `distributorLevel`, `locator` and `metros_seen_in`. **If it does not sort,
  say so and stop using the word** — §5i's rule is that an uninterpreted code
  stays uninterpreted until it is shown to partition.
- **The second network.** 107 companies appear in both locators. Establish
  whether `service-repair` is a subset of `how-to-buy`, a distinct network, or
  an overlap — by comparing the (company, street, city) key sets, not by
  reasoning about the names.

### Step 2 — build the cohort, or write down why not

The 212 are non-chain, not in `seated-v7`, and carry a working email. Before
any of them is staged:

- **Apply §7.2's role-address filter.** Most of these are named individuals
  (`jime@accentkc.com`). Where a role address exists for the same company,
  prefer it. Where only an individual exists, that is a §7.2 judgement call —
  make it explicitly, in writing, per the section's own wording.
- **Verify.** NeverBounce the cohort. **Batch limit: 212 verifications,
  hard ceiling 250.** Report valid/catchall/unknown/invalid separately, the
  way `data/verify-results.csv` already does.
- **Stage as its own campaign.** §7.2: never blended into the main list. If
  that means a fourth Smartlead campaign, create it; if the cohort cannot be
  isolated, **do not send it** — the safeguard exists because bounce rates on
  manufacturer-published addresses are unmeasured and the program dies at 2%.

### Step 3 — the 113 are the copy asset; write one email, not a template family

113 companies carry a tier or a certification *and* a line card. That is the
sharpest personalization available anywhere in this program:

> You're a CM **Platinum** distributor and a **U.S. Hoist Technician
> Certified** rigging center, and you don't come up for hoist repair in
> Kansas City.

Write it against real records, check the claim per record before it ships
(a wrong authorization claim is worse than a generic email), and run the
**humanizer** skill before it goes near a campaign.

### Step 4 — decide the 386 non-emailed remainder

386 non-chain companies, 47 with a domain. The rest are Segment W shaped.
**Do not push them into `no-domain-backlog` reflexively** — that workstream
measured ≈$77 for ~150–260 seated across 8,156 rows, and these 339 would be a
rounding error on that spend with the same recovery odds. State the arithmetic
and let it be a decision, not a default.

### Step 5 — reopen check (for a later session)

Reopen this source only if: the `filters` route's 19 brands turn out to return
rows the geographic sweep missed (unmeasured, see dossier §3), or CM publishes
a tier on more than the current ~21% of rows. Neither is worth a scheduled
re-run; both are worth one query if someone is already here.

## When this session's work lands

1. Update §5 Registry row in `./00-README.md` (status, counts, est. left) and
   the STATUS banner.
2. **RENAME THIS FOLDER** to match the new status — `cmco [NEW-STATUS]` —
   that is how the founder reads readiness from the directory listing. Use
   `IN-PROGRESS` if you stopped before the plan completed.
3. Sync the pack registry table in `../00-README.md` (SSOT rule: row first,
   table second).
4. Note the change in `../99-hygiene.md` ONLY if it created files to clean.
