# ranked-out-backlog — re-seat at a threshold instead of a rank position

Your mission: turn the seated list's arbitrary positional cap into an explicit, defended quality threshold, and promote the companies that clear it — **at $0 and zero origin requests.**

## Read first, in order

1. `../00-README.md` — the pack index: the source registry, the company/person/sendable distinction, and the new-source rule.
2. `./00-README.md` — this workstream's dossier. §3's boundary histogram is the whole argument; §4 is the promotion curve.
3. `../../strategy/01-build-plan.md` **§5l** (the cut line is the weakest claim in the build), **§5n** (full-pool enrichment closed the fetching bias — and left the cap untouched), §5o.
4. `../../strategy/00-sourcing-strategy.md` §8.1a and §9's **P3 conflict** decision: *"P3 caps sending, the pool builds freely."* A larger seated list is not a larger send.
5. `emails/scripts/s4d-seat.mjs` — read `:84` (`--cut 3000`) and `:372–386` (the slice) before touching anything. The mechanism is four lines and you should be able to quote them.

## The work

### Step 1 — confirm the measurement yourself, do not inherit it

Re-derive §4's promotion curve from `data/side-pools/pool-ranked-out-v7.csv` and the current seated list. Report the boundary histogram (scores 48→39, seated vs ranked-out) and the count at each candidate threshold. **If your numbers disagree with the dossier's, the dossier is wrong and gets corrected** — say so rather than reconciling silently.

Then do the thing the dossier could not: **hand-read a random 25 of the companies scoring 40–44.** Are they ICP-shaped distributors, or is the score doing real work at that boundary? A promotion decision made without reading any of the companies being promoted is a spreadsheet exercise. Report what you actually saw, including the misses.

### Step 2 — GATE:HUMAN, and it is the only gate here

> **What score threshold replaces the positional cap?** The dossier recommends **≥40 (+1,577 companies)** as the defensible floor: within five points of already-seated rows, 620 of them already carrying an email. ≥30 adds 5,093. ≥25 adds 6,954.

Present the curve, your hand-read, and the trade — lower bar, lower mean quality, more inventory — and get an explicit number. **Default if nobody answers: leave the cap at 3,000 and change nothing.** Nothing is deleted either way.

Two things to state plainly when you ask, because they are what make this a real decision rather than a free win:

- **Promoted rows carrying an email are unverified.** Sendability means NeverBounce, which is separate spend on top. Do not present "+2,199 with an email" as "+2,199 sendable" — that is the exact conflation `../00-README.md` says is the most expensive mistake available in this workspace.
- **The ranked-out pool is not a clean pool.** It has never been through the roll-up retag, the manufacturer audit, or the chain-domain blocklist at the same depth the seated list has. Promotion inherits those problems. Budget for a contamination pass on whatever you promote, and measure it rather than assuming it is small.

### Step 3 — only if signed: re-seat, and prove it

Re-run the seating stage with the agreed threshold. **Prefer a `--min-score` flag over editing the default `--cut`** — the positional cap should stay available and the diff should be legible to the next reader.

Non-negotiable checks, all three:

- **Conservation.** Every row lands in exactly one bucket, and the totals reconcile against the pre-run counts. A run that does not conserve is a run that gets thrown away.
- **Field-for-field readback of every list this writes** (§5s — `makeRecord()` before `toCsv()` silently blanked 35,927 fields while conservation itself PASSED). Conservation and readback are two different tests and passing one proves nothing about the other.
- **The suppression state survives.** `data/suppression/rollup-owned-2026-08-03.csv` and the chain-domain blocklist must still hold after the re-seat. A promoted row that is a roll-up subsidiary is exactly the defect `rollup-rosters` just spent a session removing.

Write the new generation as the next version (`seated-v7` / `pool-ranked-out-v8`), never in place, and update every live consumer — `s7-export`, `s6-verify`, `declaration-review`, `suppression-bootstrap` all hard-code the seated filename, and the S4j session had to bump all four.

### Step 4 — the contamination pass on what you promoted

Run the manufacturer/chain/roll-up checks over the promoted rows only, report the hit rate, and route what fails. This is the step that decides whether the promotion was worth it, so do not skip it because the counts already look good.

## When this session's work lands

1. Update §5 Registry row in `./00-README.md` (status, counts, est. left) and the STATUS banner.
2. **RENAME THIS FOLDER** to match the new status — `ranked-out-backlog [NEW-STATUS]` — that is how the founder reads readiness from the directory listing. Use `IN-PROGRESS` if you stopped before the plan completed, and leave it `NOT-STARTED` if you stopped at the gate.
3. Sync the pack registry table in `../00-README.md` (SSOT rule: row first, table second).
4. Update the three-number block in `../00-README.md` (companies / people / sendable) if seated changed, and `../../strategy/02-list-guide.md`, which tells everyone which file to open.
5. Note the change in `../99-hygiene.md` ONLY if it created files to clean.
