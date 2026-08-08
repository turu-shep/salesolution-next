# flexlink — reopen check

Your mission: refresh the 8 requests if asked, and leave the partner portal alone.

## Read first, in order

1. `../00-README.md` — the pack index: the source registry, the company/person/sendable distinction, and the new-source rule.
2. `./00-README.md` — this source's dossier. 6 US partners of 83 worldwide, and a partner level that had to be recovered by re-running the facet.
3. `../../strategy/00-sourcing-strategy.md` §3a E2.
4. `../../strategy/01-build-plan.md` §5i.
5. `../../../data/raw/_acquisition-log-2026-08-01.md` wave 3, "The other four".

## The check

Reopen only for a **refresh** — 8 requests: `GET https://partners.flexlink.com/en/partners_list?field_ptn_country_target_id=85` for the US country facet, one request per partner-level facet, one per partner detail page.

**If no refresh is wanted: report that, and STOP.** The country facet is a server-side filter over the whole partner table, so **6 of 83 is the answer, not a page-one truncation.**

## The permanent exclusion

`partners.flexlink.com` links a SharePoint **Partner login — a credential wall, not attempted, and it stays untouched permanently.** That is the same rule that keeps us off Enerpac's leaked Oracle credentials and Bimba's keyed Bullseye API.

## If a re-pull runs

The **"Partner Level" column renders empty on every row**, so the level has to be recovered by re-running the US slice once per facet value: **AUTHORIZED PARTNER (49) = 1 · BUSINESS PARTNER (50) = 5.** That is §5e's lesson in miniature — the code was in the page, unreadable where you would look for it, and had to be recovered deliberately. Capture it verbatim and leave it unmapped; per §3 it must not be read as a quality signal until validated.

**Measured absence of a vertical code:** the only facets are country and commercial partner level.

**Thin because the source is small.** `research/06` said the list skews European and it does — 77 of 83 partners are outside the US.

Pacing: public pages, 8 origin requests, zero refusals. `emails/scripts/sources/flexlink.py`.

## When this session's work lands

1. Update §5 Registry row in `./00-README.md` (status, counts, est. left) and the STATUS banner.
2. **RENAME THIS FOLDER** to match the new status — `flexlink [NEW-STATUS]` — that is how the founder reads readiness from the directory listing. Use `IN-PROGRESS` if you stopped before the plan completed.
3. Sync the pack registry table in `../00-README.md` (SSOT rule: row first, table second).
4. Note the change in `../99-hygiene.md` ONLY if it created files to clean.
