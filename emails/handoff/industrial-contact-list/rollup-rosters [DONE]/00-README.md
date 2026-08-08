# rollup-rosters — three PE roll-ups that publish the list of independents they bought

> STATUS (2026-08-04): DONE — executed 2026-08-03 the day it was validated, deep pass 2026-08-04. **62 confirmed roll-up rows retagged `chain` across S4j/S4k/S4n (current list: `seated-v9` = 2,773; conservation PASS and field-for-field readback 0 diffs at every stage), 11 exposed send-list domains suppressed with per-domain evidence, and `first-send-200.csv` rebuilt to 200 individually-verified rows (9 roll-ups out → `first-send-200-routed.csv`, 9 verified replacements in — S4m, §5t precedent).** Rosters re-derived first-hand (Singer 47 + 19 dated releases; MCE ~30, 26 dated announcements); SunSource second-hand by necessity (JS-only shell, cause ESTABLISHED) — **21 confirmed subsidiaries incl. GHX, K+S, Vytl (+4 divisions), Dover Hydraulics, and McCarty Equipment, which was on no list anywhere and surfaced only via its own footer during backfill verification** (process rule: every individual read checks the footer; the confirmed roster is a floor). `CHAIN_DOMAIN_BLOCKLIST` ~90 apexes + 2 name entries make the fix permanent. Seven adjudicated-independent recorded (Zemarc, JHF×2, Aberdeen, Sloan, Airline, Livingston & Haven). No gate opened. Findings incl. the S4l version race with the AD fold-in: `02-rosters-2026-08-03.md` §6 · copy asset: `03-copy-ammo.md`. Open: re-sweep as roll-ups buy (Dover 2026-05 was 3 months old when caught).

Prompts in this folder: `01-prompt.md` — suppress the exposed send-list domains first, then sweep all three rosters against every pool and retag through the pipeline (**EXECUTED 2026-08-03**; kept for provenance). Findings: `02-rosters-2026-08-03.md` · copy asset: `03-copy-ammo.md`. Scripts: `emails/scripts/sources/rollup_rosters.mjs` (fetch), `emails/scripts/rollup-roster-match.mjs` (match), `emails/scripts/s4j-rollup-retag.mjs` (retag stage).

Prerequisite reading, in order: [`00-sourcing-strategy.md` §3 (chain suppression, named at the channel level), §5 (side pools — culled ≠ deleted)](../../strategy/00-sourcing-strategy.md) · [`01-build-plan.md` §3 (S2 normalize + dedupe), §5c (chains measured), §5m (manufacturer contamination fixed list-free — the shape to copy here), §5s (field-for-field readback)](../../strategy/01-build-plan.md) · the header comments on `CHAIN_BLOCKLIST` and `CHAIN_DOMAIN_BLOCKLIST` in [`emails/scripts/lib/dedupe.mjs:162`](../../../scripts/lib/dedupe.mjs) — they document the exact hole this workstream fills, in the code's own words

## 1. What it is

**Not a lead source. A disqualification feed.** Three private-equity roll-ups operating in our segment publish, on their own websites, the roster of independent distributors they have already bought. Every name on those rosters is a company that can no longer buy from us: the owner we write to either answers to a platform CEO now or is gone.

| Roll-up | Owner | Roster | What it publishes |
|---|---|---|---|
| **Singer Industrial** | AEA Investors | `https://singerindustrial.com/brands` | **47 named operating companies**, 115+ locations. Plus **dated** press releases at `https://singerindustrial.com/category/press-releases/` |
| **SunSource** | Clayton, Dubilier & Rice | none readable on its own site | Self-describes as a "family of over 30 companies". The ~31-name roster in hand was assembled from trade press and subsidiary pages, not from sun-source.com |
| **Motion & Control Enterprises** | Frontenac | `https://mceautomation.com` | **30+ acquired companies**, ~$488M, including Ritter Technology |

Singer's archive is the crown jewel because it is **dated**: Conveyor Consulting & Rubber 2026-05-04, Wilmington Rubber & Gasket 2025-05-06, Fluid Tech Hydraulics 2024-11-19, HOSER Inc 2024-01-02 (announced as the "10th acquisition of 2023"). A dated list is a copy asset; an undated one is only a filter.

Access posture: public static pages, no login, no CAPTCHA, no 403. Polite fetching is enough. **`sun-source.com` returned empty bodies to fetches on 2026-08-03 and the cause is UNVERIFIED** — block, client-side render, or a server fault, nobody established which. Confirmation that the SunSource relationships are real came from the subsidiary side instead: `unitedcentral.net/our-company` states United Central "joined forces with SunSource" in 2018.

## 2. What validation measured (2026-08-03)

**Roster hit rate against our data**, matching on name:

| Roll-up | Roster names matched |
|---|---|
| Singer | 28 / 45 |
| SunSource | 18 / 31 |
| MCE | 6 / 11 |

Two arithmetic notes to carry into the sweep rather than paper over: the Singer grep ran against 45 names while `/brands` names 47, and the MCE denominator (11) is far short of the 30+ the site lists. The sweep re-derives all three rosters from source and re-runs the match; treat these as a floor, not a census.

**≈36 of 2,784 seated rows are roll-up subsidiaries seated as independents — about 1.3% of the seated list.** Named examples: `ablehose.com`, `hannarubbercompany.com`, `dakotafluidpower.com`, `wilmingtonrubber.com`, `carotek.com`, `thehopegroup.com`, `stuarthose.com`, `westernintech.com`.

**Send-list exposure — the part that is time-sensitive:**

| List | Roll-up domains | Which |
|---|---|---|
| `lists/first-send-200.csv` | **7** | `priceeng.com`, `thehopegroup.com`, `westernintech.com`, `amazonhose.com` (SunSource) · `kencohydraulics.com`, `raylewisco.com`, `spartanindustrial.com` (Singer) |
| `lists/cohort-e-v1.csv` | **6** | three are the same rows — `priceeng.com`, `thehopegroup.com`, `westernintech.com`. The other three are **not** among the seven above and validation did not name them. The sweep enumerates them. |

All seven first-send domains were confirmed present on 2026-08-03. Nothing has been sent: Smartlead holds both industrial campaigns as DRAFTED with zero leads (`data/_smartlead-upload-2026-08-02.md`), so this is upload risk, not live-send damage — for as long as nobody uploads.

**Two outright mis-seats**, both in `seated-v5`:

- **`unitedcentral.net`** — a SunSource division with 25+ branches, seated via `serp` as an industrial distributor.
- **`singerindustrial.com`** — seated under the company name `triad bellows design manufacturing` via `ad|serp`. That is the roll-up's own corporate site wearing an AD member-locator row's name, the failure mode `s4d-seat.mjs` already names: a company "wearing a domain that is not theirs".

**Root cause, and it is not a bug.** Chain suppression matches a normalized company NAME against `CHAIN_BLOCKLIST`, an apex against `CHAIN_DOMAIN_BLOCKLIST`, or ≥20 distinct in-dataset addresses. `sunsource` is on the name list and both `sunsource.com` and `sun-source.com` are on the domain list — so the **parent** is caught and every **subsidiary** walks straight past, because each one trades under its own name on its own domain and none of them individually reaches 20 addresses. Singer and MCE are on neither list. Spot-checks of `kencohydraulics.com`, `priceeng.com`, `spartanindustrial.com` and `amazonhose.com` found **no parent badge on any homepage**; Spartan still describes itself as independent. There is nothing on the subsidiary's own page for the pipeline to read. The parent's press release is the only evidence that exists, and no automated stage has ever looked at one.

**UNVERIFIED — do not upgrade this:**

- **Current ownership of every matched row.** A roster proves a company *was* acquired. It does not prove it is *still* owned — divestitures are invisible from this evidence, and PE platforms sell parts of themselves. Each match needs its own one-line confirm before it is retagged.
- **SunSource roster completeness.** It was assembled second-hand from trade press and subsidiary pages, and the primary source is unreadable. Expect it to be short, and never state a SunSource count as complete.

## 3. How deep we went

Validation only. Three roster pages read, four Singer press releases dated, four subsidiary homepages spot-checked, one grep of the assembled ~90 names against `seated-v5`, the current side pools, `first-send-200.csv` and `cohort-e-v1.csv`.

**No retag has been applied. No data file has been changed. The seven exposed domains are still in the send list.** Everything in §2 is a measurement, not a fix.

## 4. What's left on the table

**This workstream adds zero contacts.** Say it before anything else, because every other row in this registry is measured in contacts gained and this one is measured in errors removed:

- ~36 seated retags to `disposition: chain` — 1.3% contamination off the seated list
- 7 first-send and 6 cohort-e domains suppressed before any upload
- 2 mis-seats corrected
- one copy asset

The copy asset is the only outward-facing value, and it is real: *"Singer has bought 11 shops in your segment since 2023, named and dated on their own site."* That sentence is true, checkable by the reader in thirty seconds, and it is the reason an owner-operator reads the next one. It belongs to the campaign pack; this folder produces it as findings and the campaign pack cites it.

The constraint is not the matching, which is a grep. It is the **~36 one-line ownership confirms**, which are manual by construction, plus whatever the pipeline needs to accept an explicit override list. A hand-edit of a generated CSV would be undone by the next pipeline run, so the fix has to land upstream of the generator or it is not a fix.

## 5. Registry row

| rollup-rosters | DONE | 3 rosters (~140 names) | 0 | 2026-08-04 | re-sweep as roll-ups buy; footer-check rule on every individual read | rollup-rosters/ |
