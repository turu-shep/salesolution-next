# enerpac — reopen check

Your mission: confirm the locator still resolves at the same path with the same fields, refresh if it has moved, and leave the credential wall alone.

## Read first, in order

1. `../00-README.md` — the pack index: the source registry, the company/person/sendable distinction, and the new-source rule.
2. `./00-README.md` — this source's dossier. One request, the whole global network, per-record `Products Carried`, and the robots misreading we imposed on ourselves.
3. `../../strategy/00-sourcing-strategy.md` §3a E3 and **§7.1 including the Enerpac correction**.
4. `../../strategy/01-build-plan.md` §5a and §7 risk-1.
5. `../../../research/05-widget-sweep.md`.

## The check

Reopen only if **Enerpac republishes the locator at a different path or adds fields.** One honest GET against `https://www.enerpac.com/ccstore/v1/files/thirdparty/distributorLocator/distributorLocator.json` settles it: same path, same record shape, same count band → nothing to do.

**If the payload is unchanged: report that, and STOP.** The payload is the complete network and it is on disk — 1,475 records, 433 US, 204 distinct US companies.

## Standing rules, whatever you find

- **Do not touch the Oracle Integration Cloud endpoint under any circumstance.** Enerpac's page source leaks Oracle Integration Cloud service credentials. **They were never used and never recorded.** Leaked credentials are unauthorized access to a system, categorically different from a crawl directive, and Artur's robots override does not touch that line. That is a credential wall, not an obstacle.
- Get the robots history right if it comes up: `research/01` recorded Enerpac as robots-blocked and excluded it, and that was **our own misreading**. robots.txt disallows `/ccstore**x**/custom/v1`, while the distributor data resolves through OSF `getFile` to `/ccstore/v1/files/...` — a path robots.txt never disallowed. Enerpac was accessible under the *old* policy all along. The 2026-08-01 override stands as forward policy but is not what unlocked this source.
- If a re-pull runs: **email is 64% of US rows and this is a GATE-L6 manufacturer-published-email source.** Those addresses ship in their own micro-campaign cohort, never blended into the main list (§7.2).
- Pacing: one public endpoint, one request. `emails/scripts/sources/enerpac.mjs`.

## When this session's work lands

1. Update §5 Registry row in `./00-README.md` (status, counts, est. left) and the STATUS banner.
2. **RENAME THIS FOLDER** to match the new status — `enerpac [NEW-STATUS]` — that is how the founder reads readiness from the directory listing. Use `IN-PROGRESS` if you stopped before the plan completed.
3. Sync the pack registry table in `../00-README.md` (SSOT rule: row first, table second).
4. Note the change in `../99-hygiene.md` ONLY if it created files to clean.
