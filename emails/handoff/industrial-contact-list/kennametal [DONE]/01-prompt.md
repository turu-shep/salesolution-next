# kennametal — reopen check

Your mission: refresh the single export call if asked, and otherwise stop.

## Read first, in order

1. `../00-README.md` — the pack index: the source registry, the company/person/sendable distinction, and the new-source rule.
2. `./00-README.md` — this source's dossier. The official export endpoint, and the terms check that was run and recorded.
3. `../../strategy/00-sourcing-strategy.md` §3 Tier-1 item 1 and §7 (compliance posture).
4. `../../strategy/01-build-plan.md` §5i.
5. `../../../research/01-dealer-locator-sources.md`.

## The check

Reopen only for a **refresh** — one request: `GET https://www.kennametal.com/ws/v2/kmt/find-distributors?county=&stateOrProvince=&country=US`. That is the endpoint behind the locator's own **"Export the List" button**; the CSV that button produces is generated client-side from this exact payload.

**If no refresh is wanted: report that, and STOP.** The export endpoint returns the national list in one call. There is no grid and no pagination to go deeper into.

## Two notes for a re-run

- **The terms check has already been run and recorded**, and `kennametal.py` is the pattern for how to do it on a new source: Kennametal's linked T&C page is *General Terms and Conditions of Sale* — no site-use, crawling or data-reuse clause, and no other terms page is linked from the locator. robots.txt blocks named SEO crawlers only. Re-check it if the site has changed, and record the result the same way.
- Metalworking/tooling distributors sit slightly off the Segment A/B centre, which is why more of this source landed in `ranked-out` (27) than seated (23). That is the expected shape, not a ranking failure.

Pacing: one public endpoint, one origin request. `emails/scripts/sources/kennametal.py`.

## When this session's work lands

1. Update §5 Registry row in `./00-README.md` (status, counts, est. left) and the STATUS banner.
2. **RENAME THIS FOLDER** to match the new status — `kennametal [NEW-STATUS]` — that is how the founder reads readiness from the directory listing. Use `IN-PROGRESS` if you stopped before the plan completed.
3. Sync the pack registry table in `../00-README.md` (SSOT rule: row first, table second).
4. Note the change in `../99-hygiene.md` ONLY if it created files to clean.
