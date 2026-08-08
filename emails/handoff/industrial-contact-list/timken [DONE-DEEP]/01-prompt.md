# timken — reopen check

Your mission: confirm that neither reopen condition holds and stop, or — if one does — replay the payload from cache without re-requesting anything.

## Read first, in order

1. `../00-README.md` — the pack index: the source registry, the company/person/sendable distinction, and the new-source rule.
2. `./00-README.md` — this source's dossier. One request, 10,031 markers, and the `category` field that decided two-thirds of them.
3. `../../strategy/00-sourcing-strategy.md` §2 and §3 Tier-1 item 1.
4. `../../strategy/01-build-plan.md` §5e (the vertical-code finding) then §5a, §5c, §5i.
5. `../../../research/01-dealer-locator-sources.md`.

## The check

Reopen only if one of these is true:

**(a) Timken publishes a new map layer.** Map 2 is what we hold; map 8 was pulled as a control (9,002 markers) and **re-checked at 4 net-new, so the exclusion holds** — it is a near-duplicate layer, not a second network. A genuinely new `map_id` is a different question.

**(b) The ICP extends to the automotive aftermarket.** In that case **~2,150 category-4 companies are already on disk and need no new request.**

**If neither holds: report that, and STOP.** The endpoint returns the whole map layer — there is no grid, no radius and no pagination to be deeper about. Nothing is left on this endpoint.

## If you do reopen

- **Re-running `emails/scripts/sources/timken.mjs` replays from cache at zero cost** if a re-emit needs the raw payload.
- **Do not re-seat any Timken record without reading `category`.** That is the rule this source wrote: category 4 = 95.2% automotive/truck, category 5 = 98.8% industrial. Reading it collapsed seated Timken from 1,187 category-4 records to 15. Nothing in a company's name or homepage separates "Joe's Bearing & Auto" from "Joe's Bearing & Supply".
- Keep `tier_raw` and every source-native code **unmapped** (§3's rule). That decision is the only reason `category` survived three stages to be decoded, and it has since replicated on DataForSEO and Yaskawa.

## When this session's work lands

1. Update §5 Registry row in `./00-README.md` (status, counts, est. left) and the STATUS banner.
2. **RENAME THIS FOLDER** to match the new status — `timken [NEW-STATUS]` — that is how the founder reads readiness from the directory listing. Use `IN-PROGRESS` if you stopped before the plan completed.
3. Sync the pack registry table in `../00-README.md` (SSOT rule: row first, table second).
4. Note the change in `../99-hygiene.md` ONLY if it created files to clean.
