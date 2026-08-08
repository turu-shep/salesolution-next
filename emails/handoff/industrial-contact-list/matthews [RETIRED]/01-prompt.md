# matthews — reopen check

Your mission: one honest GET to see whether the Cloudflare block has lifted. If it 403s again, stop again.

## Read first, in order

1. `../00-README.md` — the pack index: the source registry, the company/person/sendable distinction, and the new-source rule.
2. `./00-README.md` — this source's dossier. One request, one 403, source abandoned.
3. `../../strategy/00-sourcing-strategy.md` §3a E2 and **§7.1 — the Cloudflare/Akamai row. No bypass, permanently.**
4. `../../strategy/01-build-plan.md` §5i.
5. `../../../data/raw/_acquisition-log-2026-08-01.md` wave 3, "Matthews Marking — STOPPED, HTTP 403".

## The check

**RETIRED. Reopen only if the block lifts on a plain, honest GET.**

One probe against `https://matthewsmarking.com/us-distributors/`. **No retry storm.** If it 403s again, **stop again and report** — that is the whole session.

`research/06` measured this page at HTTP 200, ~70KB, **29 US address blocks**, with only the `www.` host behind Cloudflare. By the time we pulled it, the apex host returned the same Cloudflare interstitial ("Just a moment…", 5,735 bytes).

## Deliberately not attempted, and it stays that way

- The known-403 `www.` host. **Switching hosts to dodge a block is a bypass, not a fallback.**
- UA rotation, header spoofing, challenge solving, cookie replay, retry.

**No bypass, ever.** 29 known companies sit behind an access control. That is not a yield question — it is a policy one, and the policy is settled.

Do **not** reconstruct the 29 companies from `research/06`'s earlier read. A lead without live `source_url` + `captured` provenance violates §1 of the data contract.

## The transferable finding

**A source fingerprint has a shelf life.** A locator that was open in the morning can be gated by the afternoon. Re-validate before planning a sweep around any single source — that lesson is why `e4-headless-locators/` has a re-validation step before it builds anything.

## When this session's work lands

1. Update §5 Registry row in `./00-README.md` (status, counts, est. left) and the STATUS banner.
2. **RENAME THIS FOLDER** to match the new status — `matthews [NEW-STATUS]` — that is how the founder reads readiness from the directory listing. Use `IN-PROGRESS` if you stopped before the plan completed.
3. Sync the pack registry table in `../00-README.md` (SSOT rule: row first, table second).
4. Note the change in `../99-hygiene.md` ONLY if it created files to clean.
