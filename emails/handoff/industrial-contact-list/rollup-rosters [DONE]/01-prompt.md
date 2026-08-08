# rollup-rosters — suppress the exposed domains, then sweep three acquisition rosters

Your mission: get 7 roll-up subsidiaries out of reach of the send list today, then retag every roll-up-owned row in the pool through the pipeline instead of by hand.

**State this to whoever reads your report, before any number: this workstream ADDS ZERO CONTACTS.** Its entire value is send-list correctness and removing ~1.3% contamination from the seated list. If you finish it and the seated count goes *down* by 36, it worked.

## Read first, in order

1. `../00-README.md` — the pack index: the source registry, the company/person/sendable distinction, and the new-source rule.
2. `./00-README.md` — this workstream's dossier. The three rosters, the 36/7/6 exposure, the two mis-seats, and the root cause.
3. `../../strategy/00-sourcing-strategy.md` §3 (chain suppression) and §5 (side pools — **culled ≠ deleted**, which governs every retag below).
4. `../../strategy/01-build-plan.md` §3 (S2 normalize + dedupe), §5c (chains measured), **§5m** (manufacturer contamination was fixed list-free — read this for the shape of a good fix), §5s (field-for-field readback, mandatory on every list this touches).
5. The `CHAIN_BLOCKLIST` / `CHAIN_DOMAIN_BLOCKLIST` header comments in `emails/scripts/lib/dedupe.mjs:130–230`. They explain, in the code's own voice, why the parent is caught and the subsidiaries are not.

Nothing here is billed. Three polite fetches and a lot of judgement.

## The work

Seven steps. **Step 1 runs before everything else** — it was item 5 in the plan that produced this folder and it got moved to the front on purpose, because it is the only step with a deadline attached to it.

### Step 1 — suppress the exposed domains (do this first, before the sweep)

Thirteen domains sit in lists that feed an upload. Seven in `lists/first-send-200.csv`:

```
priceeng.com          SunSource
thehopegroup.com      SunSource
westernintech.com     SunSource
amazonhose.com        SunSource
kencohydraulics.com   Singer
raylewisco.com        Singer
spartanindustrial.com Singer
```

and six in `lists/cohort-e-v1.csv`, of which three are the same rows (`priceeng.com`, `thehopegroup.com`, `westernintech.com`). **The other three are not named anywhere in this pack — enumerate them yourself** with the same grep, and report them by name.

**Do not delete rows.** The no-delete rule (strategy §5) is absolute and it already has the right mechanism: `emails/scripts/s7-export.mjs` reads **any CSV in `emails/data/suppression/` with an email or domain column** and routes matching rows out of every batch with a reason, into `routed.csv`. Write `emails/data/suppression/rollup-owned-<date>.csv` with a `domain` column plus `parent`, `evidence_url` and `confirmed_date`, then re-run the export preview and **confirm in `_MANIFEST.md` that the 13 rows appear in `routed.csv` and in no batch.** That readback is the deliverable of this step, not the file you wrote.

Nothing has sent yet — both Smartlead campaigns are DRAFTED with zero leads (`data/_smartlead-upload-2026-08-02.md`). This step exists so that stays true through the next upload, whoever runs it.

Report the 13 by name. Then continue.

### Step 2 — fetch the three rosters and build the dated name list

Public static pages, polite posture: ride `emails/scripts/lib/fetch.mjs` / `_polite.py` like every other source — ≥3s per host, one worker per origin, cache every response so a re-run makes zero origin requests, honest UA never rotated, 403 stops that host cold.

- **Singer** — `https://singerindustrial.com/brands` for the 47 operating companies, then walk `https://singerindustrial.com/category/press-releases/` for the **dates**. The dates are what makes step 6 possible, so capture `company · announced_date · release_url` per acquisition, not just names.
- **MCE** — `https://mceautomation.com` for the 30+ acquired companies.
- **SunSource** — `sun-source.com` returned empty bodies on 2026-08-03 and nobody established why. Try once, record what you get, and **do not escalate**: no UA rotation, no headless render as a workaround for a block. If it stays empty, the roster stays second-hand and you say so. Reconstruct from subsidiary pages (`unitedcentral.net/our-company` is the confirmed pattern — "joined forces with SunSource", with a year) and trade press, and tag every SunSource name with where it came from.

Two denominators need resolving while you are in there: validation matched against **45** Singer names when `/brands` publishes **47**, and against **11** MCE names when the site lists **30+**. Re-derive both from source. The dossier's hit rates are a floor.

Output: one findings file in this folder, `02-rosters-<date>.md` or `.csv`, with `parent · company · domain (if discoverable) · announced_date · evidence_url`.

### Step 3 — match against everything, on name AND domain

Match the full roster list against, at minimum:

- `emails/lists/seated-v5.csv`
- every current-generation side pool in `emails/data/side-pools/` (ranked-out, above-ceiling, chains, small-shops, segment-w — a roll-up subsidiary that ranked out is still a roll-up subsidiary and still needs the tag)
- `emails/lists/first-send-200.csv` and `first-send-200-routed.csv`
- `emails/lists/cohort-e-v1.csv`

**Both keys, separately, and report them separately.** Name matching has to survive the same normalization the pipeline uses (`emails/scripts/lib/normalize.mjs`) and it will produce false positives — "Able Hose" is not a distinctive string. Domain matching is exact and trustworthy. Where the two disagree, the domain wins and the name match goes to the adjudication pile.

Expected shape from validation: ~36 seated hits. If you get materially more, you are matching too loosely; if materially fewer, check that you re-derived the full rosters in step 2.

### Step 4 — one-line ownership confirm per match (this is the actual work)

**Validation confirmed roster presence, not current ownership.** That distinction is the whole risk in this step: a roster proves the company *was* acquired, and PE platforms divest. Every match needs one line of evidence before it is retagged:

- the parent's own press release naming the company (best — dated, primary), or
- the subsidiary's site stating the relationship (`unitedcentral.net/our-company` shape), or
- current presence on the parent's live `/brands`-equivalent page.

Where the evidence says the relationship ended, **mark it `DIVESTED` and leave the row seated.** A divested company is an independent again and is a legitimate prospect. Record the finding either way — a `DIVESTED` line is as valuable as a confirm, because the next session will otherwise re-open it.

Where you cannot confirm in one line, mark it `UNCONFIRMED` and **do not retag it**. Suppression from the send list (step 1) is cheap and reversible; a wrong `chain` tag buries a real prospect in a side pool where nobody looks.

Note for the seated pool: the two mis-seats need different treatment from the 36. `unitedcentral.net` is a **division**, not a subsidiary trading independently — it is the parent under another name, so it retags to `chain` on the same grounds as `sunsource.com`. `singerindustrial.com` is worse: the row is the **name of a different company** (`triad bellows design manufacturing`, from AD) attached to Singer's corporate domain. Do not simply tag it — establish whether Triad Bellows exists as a real independent with its own domain, in which case the fix is a domain correction and the company stays. That is the `s4d-seat.mjs` "wearing a domain that is not theirs" class, and `pool-duplicate-sites` already exists for it.

### Step 5 — apply the retags through the PIPELINE, never by hand-editing generated CSVs

`seated-v5.csv` and every pool file are **generated**. A hand edit survives exactly until the next run of S4, which is how this kind of fix silently un-fixes itself.

Read `emails/scripts/s4-merge-rank.mjs` and `emails/scripts/s4d-seat.mjs` and find the seam:

1. **If an override or blocklist input already exists**, use it. The obvious candidate is `CHAIN_DOMAIN_BLOCKLIST` in `emails/scripts/lib/dedupe.mjs:196` — it is already a flat list of apexes that route to `disposition: chain`, it already carries `sunsource.com` / `sun-source.com`, and adding ~36 confirmed subsidiary apexes to it is a change of *data*, not of shape. That is the cheapest correct fix and it is probably the right one.
2. **If you judge that inlining 36 evidence-bearing rows into a source file is wrong** — and there is a good argument that it is, because each row needs `parent`, `evidence_url` and `confirmed_date` and a JS array cannot hold them — add a small explicit overrides input instead: `emails/data/overrides/rollup-owned.csv` with `domain,parent,evidence_url,confirmed_date`, read at the top of the chain-suppression stage, with a minimal patch that unions it into the existing domain test. Keep the patch small enough to read in one screen.
3. **GATE:HUMAN if either route requires a schema change** — a new column on the seated/pool contract, a new disposition value, or a change to what `s4d-seat.mjs` writes back. The question to put to Artur, in writing: *"retagging 36 roll-up subsidiaries needs {the specific change}; approve or prefer the flat-blocklist route?"* Default if nobody answers: **take route 1 and lose the evidence columns**, keeping the evidence in this folder's findings file. A correct tag with the provenance one directory away beats a perfect design that never ships.

Then run the stage and do the **field-for-field readback** (§5s) on everything it touched. Report conservation: seated before, seated after, 36 moved to `pool-chains`, nothing vanished.

### Step 6 — write the copy ammo into this folder

The dated Singer list is a campaign asset and it does not belong in a data file. Write it here as findings — a section in `02-rosters-<date>.md` or its own `03-copy-ammo.md`:

- per roll-up: the acquisitions, dated, newest first, with the press-release URL for each
- the counts that make a sentence: *"Singer has bought 11 shops in your segment since 2023, named and dated on their own site."* **Derive that count from what you actually fetched** — do not carry the example number forward as if it were measured.
- one line on what it is for: it is proof the consolidation pressure is real and local, addressed to an owner who is still independent. It is not a threat and it is not a list of our prospects' competitors to name at them.

The campaign pack cites this file. Do not edit campaign files from here.

### Step 7 — cross-note ptda

`ptda [UNDERWORKED]/00-README.md` carries the registry line *"tens of Segment-B independents, pending the rollup audit"*, and its §4 asks whether the 10:1 name-collapse merged companies that are not the same company. **That is a different rollup question from this one** — theirs is about `rollupBranches` merging distinct entities on a shared normalized name; ours is about a real corporate parent that the name never mentions.

Add one line to the ptda dossier saying the corporate-ownership half is answered here, with the count you measured, and leave their audit question alone. One line, in their §4 or their STATUS banner. Do not restructure their file.

## When this session's work lands

1. Update §5 Registry row in `./00-README.md` (status, counts, est. left) and the STATUS banner.
2. **RENAME THIS FOLDER** to match the new status — `rollup-rosters [NEW-STATUS]` — that is how the founder reads readiness from the directory listing. Use `IN-PROGRESS` if you stopped before the plan completed.
3. Sync the pack registry table in `../00-README.md` (SSOT rule: row first, table second).
4. Note the change in `../99-hygiene.md` ONLY if it created files to clean.
