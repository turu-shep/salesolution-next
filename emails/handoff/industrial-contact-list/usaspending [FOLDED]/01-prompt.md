# usaspending — reopen check

Your mission: decide whether a re-pull for recency is justified yet. It is not, until the 3,711-row unmatched backlog has been worked.

## Read first, in order

1. `../00-README.md` — the pack index: the source registry, the company/person/sendable distinction, and the new-source rule.
2. `./00-README.md` — this source's dossier. 3,975 companies, zero contact data, folded in as an enrichment layer that touched 3.0% of the seated list.
3. `../../strategy/00-sourcing-strategy.md` §3 Tier-2 item 6.
4. `../../strategy/01-build-plan.md` §5h (why the wave ran), **§5p and §5q** (what it measured and what it cost).
5. `../../../data/raw/_acquisition-log-2026-08-01.md`, "USAspending.gov federal prime awards".
6. `../../../data/_usaspending-foldin-report-2026-08-01.md`.

## The check

**FOLDED — the fold-in is done and `emails/data/enrichment/federal-2026-08-01.csv` is the artifact.**

Re-pull only for **recency** (awards are a timing signal and this snapshot ages), and **only after the unmatched backlog is worked** — a re-pull adds rows to a queue that is already 3,711 deep.

**If the backlog is still unworked: report that, and STOP.** That backlog is the single largest identity-resolution opportunity in the program, and it has its own folder: `no-domain-backlog/`.

## If you do re-pull

- **`hasNext` lies at depth.** NAICS 423610 reported `false` at page 120 with 550 awards still outstanding. **Page until genuinely empty and reconcile every code against the count endpoint**, or the pull silently truncates.
- The API is open — no key, no auth, no rate wall, **$0.00** — scoped to six distributor NAICS codes plus four adjacent ones. `emails/scripts/acquire/usaspending_acquire.py`. Last run: ~2,915 requests over 2.3 hours.
- Match on **name+ZIP5, name+state, and `alternate_names`.** HQ-versus-branch ZIP mismatch is the dominant miss; **26 of 264 matches (9.8%) existed only through `alternate_names`** (Enerpac→Actuant, Curtiss-Wright→Enertech). And **41 matched rows (16.2%) inherit a *parent's* award total** (VSE Corporation → `vseaviation.com`) — do not read those as the subsidiary's.

## Three standing rules from this source

- **Never use federal spend as evidence that a company clears $2M.** §5h justified this wave partly as an independent revenue-band proxy and measurement says it does not do that job: small-business median federal spend is $266K against $616K for other-than-small — 2.3× separation with heavy overlap — and **Jamaica Bearings holds $149M in federal awards while still carrying the `small_business` flag**, because SBA's wholesale standard is employee-based. Use it to exclude nationals at the top, nothing more.
- **Do not route on NAICS alone.** 62.2% sit under a manufacturing NAICS but 44.2% of those are not flagged `manufacturer_of_goods`, because agencies code by the part, not the seller.
- **Product-code descriptions are safe to quote in copy; dollar figures are not.**

## Carry the bug forward as a warning

The first cut read `manufacturer_of_goods` from `business_flags` instead of `business_types[]`, got `undefined` on all 3,975 records, and **reported zero manufacturers — silently, in the reassuring direction.** `business_flags` is written 19-keys-all-false on every record including the 1,742 never profiled, so all-false means "not profiled" and observation must read `has_detail`.

**A zero that confirms what you hoped is the most dangerous number in the pipeline.**

## When this session's work lands

1. Update §5 Registry row in `./00-README.md` (status, counts, est. left) and the STATUS banner.
2. **RENAME THIS FOLDER** to match the new status — `usaspending [NEW-STATUS]` — that is how the founder reads readiness from the directory listing. Use `IN-PROGRESS` if you stopped before the plan completed.
3. Sync the pack registry table in `../00-README.md` (SSOT rule: row first, table second).
4. Note the change in `../99-hygiene.md` ONLY if it created files to clean.
