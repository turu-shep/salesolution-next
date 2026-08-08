# quincy — reopen check

Your mission: refresh the 54-request sweep if asked, and never call the Bullseye endpoint directly.

## Read first, in order

1. `../00-README.md` — the pack index: the source registry, the company/person/sendable distinction, and the new-source rule.
2. `./00-README.md` — this source's dossier. A country pass plus a 52-state sweep, provably complete against the server's own total.
3. `../../strategy/00-sourcing-strategy.md` §3 Tier-1 item 1 (easy tier) and §7.1 (the credential line).
4. `../../strategy/01-build-plan.md` §5i.
5. `../../../research/01-dealer-locator-sources.md`.

## The check

Reopen only for a **refresh** — 54 requests: `POST https://www.quincycompressor.com/wp-admin/admin-ajax.php` with `action=fx_get_locations`, a country pass followed by a 52-state sweep, **because the country response caps at 50 rows.**

**If no refresh is wanted: report that, and STOP.** The server's own `total_results` for the US is **111** and we hold all of it — the pull is provably complete, not merely exhausted.

## The line that does not move

**Never call `ws.bullseyelocations.com` directly.** Quincy's server proxies Bullseye, and the echoed upstream URL carries **Quincy's own ApiKey**. It is redacted in our output and the vendor endpoint **was never called**. Using someone else's key against their vendor is the Enerpac-credentials line — same rule, different vendor.

## Two notes for a re-run

- No vertical code exists here: Quincy is compressors only, and `IsLeadManager` is a routing flag, not a quality tier (left unmapped per §3).
- 27 of 109 companies seated is the best conversion rate of any locator in the program — compressor distributors sit close to the ICP centre and the source carries almost no chains. If a refresh returns a materially different ratio, that is worth explaining rather than accepting.

Pacing: public endpoint, `_polite.py`, 54 origin requests, no 429/403. `emails/scripts/sources/quincy.py`.

## When this session's work lands

1. Update §5 Registry row in `./00-README.md` (status, counts, est. left) and the STATUS banner.
2. **RENAME THIS FOLDER** to match the new status — `quincy [NEW-STATUS]` — that is how the founder reads readiness from the directory listing. Use `IN-PROGRESS` if you stopped before the plan completed.
3. Sync the pack registry table in `../00-README.md` (SSOT rule: row first, table second).
4. Note the change in `../99-hygiene.md` ONLY if it created files to clean.
