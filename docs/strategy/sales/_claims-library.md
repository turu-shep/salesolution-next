# Approved Claims Library

**Status:** canonical for any external-facing or on-call number on the Revenue Engine surfaces.
**Last updated:** 2026-06-21
**Supersedes:** the inline-only claims notes scattered across page data and scripts. This is the one place a claim's exact phrasing, source, and status live.

> Rule: every number that reaches a prospect — on a page, in an ad, or out loud on a
> call — must trace to a row below at or under the **max strength permitted**. No row,
> no claim. Hedged claims stay hedged. Never state an industry-average as *this*
> client's number unless it was measured for them. Source of record for the table is
> `docs/strategy/roofing/revenue-engine-site-injection-spec.md` §4; live wording is the
> tie-breaker (`TheLeak.tsx`, the vertical page `leaks`, `leak-concepts/data.ts`).

---

## The claims

| ID | Max-strength phrasing permitted | Source | Status | Where it's used |
|---|---|---|---|---|
| **C-01** | "The industry-average reply to a new lead is 47 hours." | LeadSync, 2026 (via cosmeticsgrowth.com/cosmetic-dental-marketing-cost) | **VERIFIED — cite as "LeadSync, 2026."** | `TheLeak.tsx` leak 02; `dentists/page.tsx`, `medical/page.tsx`; `leak-concepts/data.ts`. On a call: cite as the industry average, never as the prospect's own number (cockpit reconciled to VERIFIED, 2026-06-21). |
| **C-02** | "Average non-branded Google Ads cost per lead for roofing: $124 (Q1 2026); 75th percentile $256." | searchlightdigital.io/roofing-google-ads-cost-per-lead | VERIFIED — **contractors page / blog only.** | roofing blog math piece. Not in the cold-call wedge. |
| **C-03** | "Qualified roofing leads typically cost $80–$220; competitive metros push above $300." | getbiddable.com (avg cost-per-lead for roofing contractors) | VERIFIED — cite as "Getbiddable, 2026." | `home-services/page.tsx` leak 02 ("$80–$220 to buy a single qualified roofing lead"). |
| **C-04** | "Practices are commonly advised to invest 5–8% of gross revenue in marketing." | optimizedgrowth.com/dental-marketing | VERIFIED — **phrase as guidance, never a promise.** | `dentists/page.tsx` + `medical/page.tsx` budget FAQ. |
| **C-05** | "Businesses miss as many as one in three inbound calls." | none on file | **SOFTEN-OR-SOURCE — keep the "as many as" hedge** until a primary source is filed and approved. Never a hard per-client figure. | `TheLeak.tsx` leak 01 ("As many as 1 in 3"); `leak-concepts/data.ts`; dental/home-services leaks. |
| **C-06** | Any treatment-plan acceptance % or estimate close-rate % | none on file | **DO NOT USE until sourced.** Use qualitative phrasing only: "a large share of estimates are never followed up," "estimates won, then lost." | `TheLeak.tsx` leak 03 ("A large share"); `home-services` leak 03 ("Won, then lost"); dental "of treatment plans go unaccepted and unfollowed." |

---

## Phrasing constraints that travel with the claims

- **C-01 (47 hours):** state it as the *industry* average, never as this client's reply time, unless measured for them. Cite the source the first time it appears.
- **C-03 ($80–$220):** roofing only; pair with the leak frame ("every missed call is that much spent to make a phone ring nobody picked up"), never as a price Sale Solution charges or guarantees.
- **C-04 (5–8%):** guidance, not a quote and not a promise. The point is "make that spend convert," not "spend more."
- **C-05 (1 in 3):** the hedge "as many as" is load-bearing — it is the claim. Dropping it overstates.
- **C-06 (estimate/plan close rates):** qualitative only. No percentage until a row exists here.

## What is NOT an approved external claim

- The canonical proof stats in `lib/stats.ts` ($378M driven, 91% retention, 2.5x/5.2x ROI, NPS 96, $575k ARR/client) are **industrial/services case-study figures**, not Revenue Engine claims. Do not blend them into a Revenue Engine page or a local-service cold call.
- Bar proportions in `TheLeak.tsx` / leak concepts are **illustrative** and labelled as such — not a measured leak split.
- The only hard number about a *specific* prospect on a cold call is the leak the rep personally observed in the pre-call check. Everything else is a range from this table or it waits for the audit.

## Governance

- A new claim enters by adding a row here **and** in the spec §4 source table, with a source URL and a status.
- `SOFTEN-OR-SOURCE` and `DO NOT USE` rows cannot be promoted to a hard figure without a filed primary source and human sign-off (`GATE:HUMAN`).
