# matthews — Matthews Marking Systems US distributor list

> STATUS (2026-08-03): RETIRED — went from HTTP 200 to a Cloudflare 403 inside one day; one request, one block, source abandoned.

Prompts in this folder: `01-prompt.md` — reopen check: one honest GET; if it 403s again, stop again.

Prerequisite reading, in order: [`00-sourcing-strategy.md` §3a E2 + **§7.1 (the Cloudflare/Akamai row — no bypass, permanently)**](../../strategy/00-sourcing-strategy.md) · [`01-build-plan.md` §5i](../../strategy/01-build-plan.md) · [`_acquisition-log-2026-08-01.md` wave 3, "Matthews Marking — STOPPED, HTTP 403"](../../../data/raw/_acquisition-log-2026-08-01.md)

## 1. What it is

`https://matthewsmarking.com/us-distributors/` — a WordPress page listing US distributors as address blocks. `research/06` measured it at HTTP 200, ~70KB, **29 US address blocks**, with only the `www.` host behind Cloudflare.

**By the time we pulled it, the apex host returned the same Cloudflare interstitial** ("Just a moment…", 5,735 bytes). One honest GET, one 403, source stopped.

Deliberately not attempted, and recorded as such: the known-403 `www.` host (switching hosts to dodge a block is a bypass, not a fallback), UA rotation, header spoofing, challenge solving, cookie replay, retry.

## 2. What we pulled

**0 records @ 2026-08-01.** One origin request, one 403. `emails/scripts/sources/matthews.py`; the block itself is recorded in `emails/data/raw/matthews-2026-08-01.json` with a zero-record payload.

Contributed: **nothing, anywhere.**

## 3. How deep we went

One request. That is the correct depth for a 403 under §7.1.

The 29 companies `research/06` saw are real and currently unreachable. **They were not reconstructed from the earlier read**, because a lead without live `source_url` + `captured` provenance violates §1 of the data contract.

## 4. What's left on the table

29 known companies, behind an access control. Not a yield question — a policy one, and the policy is settled.

The transferable finding: **a source fingerprint has a shelf life.** A locator that was open in the morning can be gated by the afternoon. Re-validate before planning a sweep around any single source.

## 5. Registry row

| matthews | RETIRED | 0 | 0 | 2026-08-01 (403) | 29 known companies, behind Cloudflare — no bypass | matthews/ |
