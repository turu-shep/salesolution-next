# linecard-locators — run four queries, measure the website field, then decide

Your mission: submit one polite query against each of the four ranked locators, measure whether the payload carries a website field, and turn "six maybe-locators" into a build/skip decision with a number behind it.

**The decision this session exists to make:** build-plan §5a says website coverage decides build-worthiness, and **Timken's 67.6% is the benchmark**. A locator that returns name, address and phone but no domain feeds Segment W, and Segment W already holds 8,156 rows nobody has worked. Four queries settle four cases. Do not build anything before they are answered.

## Read first, in order

1. `../00-README.md` — the pack index: the source registry, the company/person/sendable distinction, and the new-source rule.
2. `./00-README.md` — this workstream's dossier. The 92-name list, the 4/6/25/57 breakdown, the ranked six with their discounts, the dead list, and the caveat that none of them was queried.
3. `../../strategy/01-build-plan.md` **§5a** (the criterion), §5b (the line-card rescue), **§5h** (a wave is worth running only if it adds a signal or a copy asset we do not already have), §5i (the small-locator tail — Interroll, FlexLink and mk returned 23 companies for 121 requests; that is the shape of a source not worth sweeping).
4. `../../strategy/00-sourcing-strategy.md` §3a and **§7.1** — the obstacle ladder, which governs the robots gate in step 4.
5. `../e4-headless-locators [NOT-BUILT]/00-README.md` — where JS-rendered survivors go, and the three-metro decision rule they inherit.

Nothing here is billed. The cost is wall-clock and one page fetch per target.

## The work

### Step 1 — the probes (four required, two optional)

One query each. Polite posture, no exceptions: ride `emails/scripts/lib/fetch.mjs` / `emails/scripts/sources/_polite.py` — ≥3s per host, one worker per origin, cache every response, honest desktop UA never rotated. **A 403 stops that target immediately.** No UA rotation, no host switching, no retry loop. Matthews went from 200 to a Cloudflare 403 inside one day (§5i); a fingerprint from 2026-08-03 has a shelf life and re-validation is part of the probe, not a preliminary to it.

| # | Target | Query to submit |
|---|---|---|
| 1 | **Flexco** — `flexco.com/NA/EN/Flexco/Contact-Us/Distributors.htm` | Use the **any-distance** option if it works without a postal code. If it needs one, a single dense metro. Any-distance is the highest-value thing to test on this whole list: it may return the entire network in one payload, which is what made Enerpac and NORD complete-in-one |
| 2 | **Samson Rope** — `samsonrope.com/resources/find-a-distributor` | One postal query, and **capture the 16-option industry filter verbatim** — options, values and labels. §5i's rule: manufacturer locators encode vertical in their own codes, so record it uninterpreted and test whether it sorts before it is used |
| 3 | **Columbus McKinnon** — `cmco.com/en-us/how-to-buy/` | JS-rendered, nav-only in raw HTML. Establish **whether the "CM Authorized Rigging Centers" tier is in the payload** and whether the separate service-repair-centers locator is a second network or the same one. The authorization stamp is the point; the addresses are not |
| 4 | **Industrial Scientific** — `indsci.com/en/where-to-buy` | Two empty list containers in the shell. Test the cheap hypothesis first: does the full list arrive on render with no query at all? If yes this is the easiest complete network on the list |

Optional, and the discount is stated so nobody rediscovers it: **Chromalox** (`locate-a-rep` — skews manufacturer *reps*, and a rep firm is not our buyer) and **Zoeller** (`zoellerpumps.com/locations` — easiest build here, but plumbing drifts off-ICP). Run them only if the four above finish fast.

### Step 2 — record the payload shape, not a summary of it

Per locator, in writing:

- **transport** — static HTML, JSON endpoint (with the URL), form POST, or JS-only
- **fields returned**, named exactly as the source names them
- **website coverage** — the number that decides everything. Percentage of returned records carrying a usable domain, against the **67.6% benchmark**
- phone and street coverage, secondary
- **every source-native code, verbatim and uninterpreted** — tier, type, category, group, industry. §5i: assume every locator has one until disproven
- distinct companies in the sample, and how many are chains you would suppress anyway

Save the raw payload under `emails/data/raw/` with `source_url` and `captured` on every record, the way every other source in the pack does. Provenance is 100% filled across the current generation and this must not be the exception.

### Step 3 — decide per locator, against the criterion you wrote down first

State the rule before the first fetch so it cannot be rationalised afterwards:

- **Website coverage at or near 67.6%** and the network is plausibly a few hundred companies → **build-worthy**.
- **Website coverage materially below it** → skip, record the number, close it. It feeds Segment W, and paying to grow a backlog nobody works is the §5f mistake — enriching everything while long instead of short.
- **No website field at all** → dead, regardless of how clean the locator is.
- **Carries an authorization tier or a per-record line card** → keep it alive even at mediocre website coverage, because §5h's real test is whether it adds a signal we do not already have. Columbus McKinnon is the case in point.

### Step 4 — route the survivors, do not build both kinds here

- **Static survivors** get a harvester on the existing `emails/scripts/sources/` pattern. Reuse, do not rewrite: the shared polite fetcher, the cache, the provenance fields, 403 → hard stop, 429 → one backoff then leave it alone.
  **GATE:HUMAN per locator before building:** read that site's robots.txt and terms page, write down what they say about the specific path the harvester would hit, and get a yes or no from Artur. The Enerpac precedent (§7.1) is a precedent for *how the decision is made* — an explicit, dated, per-site call — not a blanket licence. A no is a fine outcome. Default if nobody answers: **do not build that one**, and say so in the dossier.
- **JS-rendered survivors are not built here.** Append them to the target table in `../e4-headless-locators [NOT-BUILT]/00-README.md`, with the payload shape you measured and the reason they qualify. That folder already owns the per-locator robots gate and the three-metro rule (≥150 net-new projected, plus a tier code or a line card). Do not duplicate that machinery in this folder.

### Step 5 — the 10-minute skim of the remaining 57

Time-boxed, and the box is the point. Take the 57 never-assessed names off `https://unitedcentral.net/suppliers-we-carry/` and look for an obvious locator URL on each — `/where-to-buy`, `/find-a-distributor`, `/distributors`, `/dealer-locator`. No fetching beyond what the skim needs, no assessment, no ranking.

Append what you find to §3 of `./00-README.md` as a candidate table: `manufacturer · locator URL or "none found" · segment`. That table is the next session's queue, and it is the only cheap way to learn whether the 92-name list holds another Flexco or is exhausted at six.

If the skim finds nothing, write that down. "57 names, no further locators found" is a real and useful result that closes the workstream.

## When this session's work lands

1. Update §5 Registry row in `./00-README.md` (status, counts, est. left) and the STATUS banner.
2. **RENAME THIS FOLDER** to match the new status — `linecard-locators [NEW-STATUS]` — that is how the founder reads readiness from the directory listing. Use `IN-PROGRESS` if you stopped before the plan completed.
3. Sync the pack registry table in `../00-README.md` (SSOT rule: row first, table second).
4. Note the change in `../99-hygiene.md` ONLY if it created files to clean.
