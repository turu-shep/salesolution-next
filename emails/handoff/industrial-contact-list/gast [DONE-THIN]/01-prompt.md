# gast — reopen check

Your mission: refresh the two requests if asked, and resist the temptation to treat 21 records as a truncated pull.

## Read first, in order

1. `../00-README.md` — the pack index: the source registry, the company/person/sendable distinction, and the new-source rule.
2. `./00-README.md` — this source's dossier. 21 US distributors, verified against a control query.
3. `../../strategy/00-sourcing-strategy.md` §3a E2 — Gast listed "next up but unbuilt", on the NTN/Quincy `admin-ajax` pattern.
4. `../../strategy/01-build-plan.md` §5i.
5. `../../../research/06-adjacent-segments.md`.

## The check

Reopen only for a **refresh** — 2 requests: `POST https://gastmfg.com/wp-admin/admin-ajax.php` with `action=load_distributors&country=US`, which returns the whole US list as rendered HTML. The request contract was read out of the theme's own `distributor.js`, not guessed.

**If no refresh is wanted: report that, and STOP.**

## Do not go looking for a bigger grid

**Thin because the source is small — and that was tested, not assumed.** `research/06` estimated 150–350 for this segment; measured 21. The control that settles it is recorded in the payload: **a Los-Angeles-ZIP query returns a strict subset of the same 21 records**, so the country call is not a truncated first page. There is no grid that would return more.

Gast publishes no type, tier or category on the record — the only facet is country. That is a measured absence, not an unread field.

The one recoverable item is downstream: 21 companies with a phone and **no domain** (website fill is 0.0%), 10 of them parked in Segment W. That is identity-resolution work and it belongs to `no-domain-backlog/`.

Pacing: public endpoint, 2 origin requests. `emails/scripts/sources/gast.py`.

## When this session's work lands

1. Update §5 Registry row in `./00-README.md` (status, counts, est. left) and the STATUS banner.
2. **RENAME THIS FOLDER** to match the new status — `gast [NEW-STATUS]` — that is how the founder reads readiness from the directory listing. Use `IN-PROGRESS` if you stopped before the plan completed.
3. Sync the pack registry table in `../00-README.md` (SSOT rule: row first, table second).
4. Note the change in `../99-hygiene.md` ONLY if it created files to clean.
