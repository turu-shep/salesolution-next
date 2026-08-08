# timken — Timken bearings dealer locator (WPGMZA markers JSON)

> STATUS (2026-08-03): DONE-DEEP — the deepest locator in the program and the one that taught the whole build to read source-native vertical codes; two-thirds of it turned out to be automotive.

Prompts in this folder: `01-prompt.md` — reopen check: the layer is complete; reopen only for a new map layer or an automotive ICP.

Prerequisite reading, in order: [`00-sourcing-strategy.md` §2 + §3 Tier-1 item 1](../../strategy/00-sourcing-strategy.md) · [`01-build-plan.md` §5e (the vertical-code finding) then §5a, §5c, §5i](../../strategy/01-build-plan.md) · [`research/01-dealer-locator-sources.md`](../../../research/01-dealer-locator-sources.md)

## 1. What it is

`GET https://locations.timken.com/wp-json/wpgmza/v1/markers?filter={"map_id":"2"}` — a WP Google Maps plugin REST endpoint that returns the entire marker set in **one unauthenticated request** (4.7 MB). Per marker: title, full address string, lat/lng, a phone in the description HTML, a `link` (the dealer's site or a Timken landing page), and **`category`** — the field that decided everything.

Compliance: one public endpoint, one request, no auth, no bot wall. `emails/scripts/sources/timken.mjs`.

## 2. What we pulled

**10,031 raw markers @ 2026-08-01** (map 2). Map 8 was pulled as a control — 9,002 markers — and **re-checked at 4 net-new, so the exclusion holds** (§5a); it is a near-duplicate layer, not a second network.

US website fill 67.6%; **1,622 of 5,002 US records (32.4%) carry no website link**, which is what originally sized Segment W (and what §5c then showed was mostly stale manufacturer data — 76% of those companies do have sites).

Contributed: **seated 120 · ranked-out 108 · small-shops 20** (plus 22 in Segment W).

## 3. How deep we went

Exhaustive by construction — the endpoint returns the whole map layer, so there is no grid, no radius and no pagination to be deeper about. The depth question was never acquisition; it was **interpretation**.

Raw `category` on map 2: code 4 → 5,833 markers, code 5 → 4,188, code 6 → 9. Decoded against the records (§5e): **category 4 = 95.2% automotive/truck, category 5 = 98.8% industrial.** Reading it collapsed seated Timken from 1,187 category-4 records to 15, and routed exactly one category-5 record out. **Our largest source was around two-thirds wrong-vertical, and nothing in a company's name or homepage separates "Joe's Bearing & Auto" from "Joe's Bearing & Supply" — the code decided 2,165 markers that no other axis could read.**

The decision to keep `tier_raw` and every source-native code unmapped (§3's rule, set after Adaptall's `premier` flag turned out to be inverted) is the only reason that field survived three stages to be decoded. It has since replicated on DataForSEO and Yaskawa — three independent confirmations, now a standing rule for every new source.

## 4. What's left on the table

Nothing on this endpoint. The layer is complete, map 8 is a duplicate, and the automotive two-thirds is correctly out of scope rather than unworked.

Reopen only if Timken publishes a new map layer, or if the ICP ever extends to the automotive aftermarket — in which case ~2,150 category-4 companies are already on disk and need no new request.

## 5. Registry row

| timken | DONE-DEEP | 10,031 | 120 | 2026-08-01 | nothing — reopen only if the ICP extends to automotive | timken/ |
