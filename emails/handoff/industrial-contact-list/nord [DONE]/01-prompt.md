# nord — reopen check

Your mission: refresh the one-request payload if it is worth refreshing, and re-apply the manufacturer-inbox rule that this source is the reason for.

## Read first, in order

1. `../00-README.md` — the pack index: the source registry, the company/person/sendable distinction, and the new-source rule.
2. `./00-README.md` — this source's dossier. One GET, the whole global network, and the 34 manufacturer inboxes that nearly shipped.
3. `../../strategy/00-sourcing-strategy.md` §3a E2 and §7.2.
4. `../../strategy/01-build-plan.md` §5i, §5t, §5u — **§5u D1 is the `info.us@nord.com` fix; read it before any re-pull.**
5. `../../../research/06-adjacent-segments.md`.

## The check

Reopen for one of two reasons:

**(a) A periodic refresh.** The payload is one unauthenticated request — `GET https://shop.nord.com/stores/finder/locations?country=US&lang=en` — so it is nearly free.

**(b) NORD adds a vertical or tier code worth decoding.** Three sources (Timken, DataForSEO, Yaskawa) have now proved manufacturer locators encode vertical in their own codes. A new field is a real reason to look.

**If neither applies: report that, and STOP.** Nothing is left on the endpoint — 1,450 raw records, 554 US, 272 distinct US companies, exhaustive in a single request.

## If you do re-pull

- **Re-apply the manufacturer-inbox rule.** NORD publishes its own corporate inbox (`info.us@nord.com`) for dealers that have none, and **34 seated rows inherited it as the prospect's email** — six of them inside the first-send cohort. All 50 manufacturer-inbox rows across all sources were voided in §5u. The rule: an email whose domain is a known manufacturer domain and does not match the company's own domain is invalid.
- The US selector is `mainAddress.countryId == 184` — measured, because NORD ships no country name. Do not substitute a country-string match.
- Email fill is 72.6%, which makes this a **GATE-L6 manufacturer-published-email source**: those addresses ship in their own micro-campaign cohort, never blended into the main list (§7.2).
- Pacing: one public endpoint, one origin request, no auth, no bot wall. `emails/scripts/sources/nord.py`.

## When this session's work lands

1. Update §5 Registry row in `./00-README.md` (status, counts, est. left) and the STATUS banner.
2. **RENAME THIS FOLDER** to match the new status — `nord [NEW-STATUS]` — that is how the founder reads readiness from the directory listing. Use `IN-PROGRESS` if you stopped before the plan completed.
3. Sync the pack registry table in `../00-README.md` (SSOT rule: row first, table second).
4. Note the change in `../99-hygiene.md` ONLY if it created files to clean.
