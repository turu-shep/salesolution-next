# ntn — reopen check

Your mission: confirm the bulk action still returns the whole national list, check whether NTN has started publishing contact fields, and send the real residue to the workstream that owns it.

## Read first, in order

1. `../00-README.md` — the pack index: the source registry, the company/person/sendable distinction, and the new-source rule.
2. `./00-README.md` — this source's dossier. One POST, 2,468 records, `categories_raw` shipped pre-decoded, and no phone or email anywhere.
3. `../../strategy/00-sourcing-strategy.md` §3 Tier-1 item 1 (easy tier) and §5 (Segment B).
4. `../../strategy/01-build-plan.md` §5e then §5i — the vertical-code rule.
5. `../../../research/01-dealer-locator-sources.md`.

## The check

Reopen for one of two reasons:

**(a) A refresh.** One request: `POST https://ntnamericas.com/wp-admin/admin-ajax.php` with `action=get_all_stores`, no nonce required.

**(b) NTN starts publishing phone or email.** Today it publishes neither — website 89.5%, phone 0%, email 0%. If that changes, the 1,628 names behind this source become reachable and it is worth a re-pull.

**If neither applies: report that, and STOP.** The pull is exhaustive — one bulk call, no grid.

## Where the residue actually goes

The unworked residue is not a second NTN pull. It is **1,628 names with no phone and no email**, every one of which needs domain and NAP resolution before it can be mailed — the same bottleneck as the Yaskawa and SERP pools. **That work belongs to `no-domain-backlog/`, not here.** If you came looking for NTN upside, that is the folder to open.

## Standing rule

**Never seat an NTN record without reading `categories_raw`.** It is the §5e code Timken had and we failed to read — and here it arrives pre-labelled with an explicit industrial-vs-automotive filter. The seated yield is small against 1,628 names for the same reason Timken's was: a bearings locator carries the automotive aftermarket alongside industrial MRO, and the pool is dominated by names like FleetPride.

## When this session's work lands

1. Update §5 Registry row in `./00-README.md` (status, counts, est. left) and the STATUS banner.
2. **RENAME THIS FOLDER** to match the new status — `ntn [NEW-STATUS]` — that is how the founder reads readiness from the directory listing. Use `IN-PROGRESS` if you stopped before the plan completed.
3. Sync the pack registry table in `../00-README.md` (SSOT rule: row first, table second).
4. Note the change in `../99-hygiene.md` ONLY if it created files to clean.
