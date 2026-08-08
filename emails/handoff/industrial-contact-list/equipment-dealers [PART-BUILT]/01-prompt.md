# equipment-dealers — check the gate first; build nothing until it is signed

Your mission: find out whether the ICP has been extended to franchised single-line equipment dealers. If it has not, stop and say so. If it has, run an E4-style validate-and-measure on three OEM locators with a size-band filter designed before the first sweep.

## Read first, in order

1. `../00-README.md` — the pack index: the source registry, the company/person/sendable distinction, and the new-source rule.
2. `./00-README.md` — this workstream's dossier. The size math, the franchise mismatch, and the surviving tail.
3. `../../strategy/00-sourcing-strategy.md` **§8.1a** — the revenue floor, the priority tier and the $75M soft ceiling. The whole gate turns on this section, and on the *reason* for the ceiling: decision speed, not affordability.
4. `../../strategy/01-build-plan.md` §5a, **§5h** (a wave is worth running only if it adds a qualification signal or a copy asset we do not already have), §5i.
5. `../e4-headless-locators [NOT-BUILT]/00-README.md` — the cost tier these locators sit in, the per-locator robots gate, and the three-metro decision rule.

## The work

### Step 1 — THE GATE. This is the whole step, and it comes before everything.

> **GATE:HUMAN (unsigned as of 2026-08-03): has Artur signed extending the ICP to franchised single-line equipment dealers — the 1–4-location tail, on a parts-counter angle?**

Check for a signature: the decision log in `../../strategy/00-sourcing-strategy.md` §9, §8.1a, and any dated entry elsewhere in the strategy pack. A signature means a dated, explicit call by Artur naming this cohort. Silence is not a signature. Neither is this folder existing.

**If it is not signed: STOP. Do nothing else.** Do not fetch a locator, do not render a page, do not size the tail, do not write a candidate list. Report the gate, put the question in front of Artur in one paragraph, and rename the folder to reflect that it is blocked, not in progress.

The question to put to him, with the case on both sides stated honestly:

- **For.** These are real independents with real parts counters — Kubota alone lists 1,100+ authorized dealers — and they run catalogues that are demonstrably hard to search. The 1–4-location tail is owner-led and still signable by one person.
- **Against.** The typical dealer group is ≈$175M (NAEDA: $24.4M per location × 7.2 locations), which is 2.3× §8.1a's $75M soft ceiling, and Titan Machinery is $2.4B. The right-sized tail is consolidating away. And they are **franchised single-line resellers**: the catalogue is the OEM's, parts sit behind machine sales, service and rental in the P&L, and the franchise agreement bounds what a dealer can change on their own site. **The leak story we sell does not map cleanly onto that business.**
- **The cost of finding out.** E4 tier. All three locators are JS shells returning zero names to a fetch (Bobcat, Kubota, Case IH; JLG 403), so measuring this costs a headless build plus a robots call per site.

Default if nobody answers: **not signed.** The folder stays NOT-STARTED, which costs nothing and loses nothing.

### Step 2 — only if signed: validate before building

Re-fetch `bobcat.com/dealer`, `kubotausa.com/regional-dealers` and the Case IH dealer-locator. Record the status honestly. A fingerprint dated 2026-08-03 has a shelf life — Matthews went 200 → Cloudflare 403 in a day (§5i). **Any 403 stops that target immediately:** no UA rotation, no host switching, no stealth patching. JLG already 403s and stays out.

### Step 3 — only if signed: the per-locator robots gate

**GATE:HUMAN, per site, not once for the tier.** Read each OEM's robots.txt and terms page, write down what they say about the specific path a headless render would hit, including any API path the render fetches as a subresource, and get a yes or no from Artur for that site. The Enerpac override (§7.1) is a precedent for *how* the call gets made — explicit, dated, per site — not a blanket licence. A no on one OEM is fine; the others stand on their own. Default if nobody answers: do not build that one.

### Step 4 — only if signed: design the size-band filter BEFORE the sweep

This is the step that decides whether the source is usable, and it has to exist before any records land, not after.

**Only the 1–4-location tail is in scope.** Everything above it is `above-ceiling` by §8.1a and routes to `pool-above-ceiling` — not deleted, per the no-delete rule, but never seated. Write the filter down first:

- `location_count` from the locator itself where it publishes one, and from address clustering where it does not
- the proxy stack §8.1a names, in confidence order: employee count, branch count, SKU count visible on site, line-card breadth. **Never a single field**, and never Apollo's revenue field, which the pack has already ruled unreliable
- an explicit rule for dealer groups that publish one row per store — those are the $175M groups arriving disguised as four separate small dealers, and address clustering is what catches them

State the expected outcome before running: most of what comes back is over the ceiling. If the filter is not doing that, the filter is wrong.

### Step 5 — only if signed: measure three metros, then decide

Per locator: run three metros, report **distinct companies, net-new against `deduped-v7.csv`, website / phone / email fill, and whether the source publishes a dealer type or tier code.** Capture every source-native code verbatim and uninterpreted (§5i).

Inherit E4's decision rule and do not soften it: a locator earns a full sweep if the three-metro probe projects **≥150 net-new companies *within the size band*** and it carries either a tier code or a per-record line card. Net-new counted before the size filter is not a number, it is a flattering one.

Below that line, record the measurement and close it.

## When this session's work lands

1. Update §5 Registry row in `./00-README.md` (status, counts, est. left) and the STATUS banner.
2. **RENAME THIS FOLDER** to match the new status — `equipment-dealers [NEW-STATUS]` — that is how the founder reads readiness from the directory listing. Use `IN-PROGRESS` if you stopped before the plan completed. **If you stopped at the gate, leave the name as `equipment-dealers [NOT-STARTED]`** — no data exists, the pack's status vocabulary has no separate blocked token, and inventing one would break the Sources tab's parse. Record the date you asked in the STATUS banner instead.
3. Sync the pack registry table in `../00-README.md` (SSOT rule: row first, table second).
4. Note the change in `../99-hygiene.md` ONLY if it created files to clean.
