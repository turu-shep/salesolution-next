# adaptall — Adaptall distributor locator (consent-gated; downgraded to a lookup service)

> STATUS (2026-08-03): RETIRED-TO-LOOKUPS — the front door worked in minutes, and the sample killed the bulk case. Use it to answer "is this company Adaptall-authorized, and at what tier?", never to build a list.

Prompts in this folder: `01-prompt.md` — how to run a targeted single-company lookup without reopening the bulk route.

Prerequisite reading, in order: [`00-sourcing-strategy.md` **§8.6** (the whole verdict) + §7.1 (the consent-form row) + §9 GATE-L5 including the precedent note](../../strategy/00-sourcing-strategy.md) · [`research/07-adaptall-access.md`](../../../research/07-adaptall-access.md) · [`data/_adaptall-integration-2026-08-01.md`](../../../data/_adaptall-integration-2026-08-01.md)

## 1. What it is

A distributor lookup behind a **consent form — an identity gate with no bot protection at all**. §7.1 classifies that as "use the front door": Artur supplied his real name, title, company and `a.shepel@salesolution.net`, and the submission went in truthfully as him at 17:29 UTC on 2026-08-01. The form had four identity fields plus an address — **no phone field and no free-text field, so nothing had to be invented or withheld.** The gate returned JSON immediately, no session dependency.

**GATE-L5's precedent, kept because it will recur:** Artur first offered `Artur / CEO / Test company / test@test.com`. That was declined — a real name against a fake company and a dead mailbox is inventing an identity, which is the exact thing the front-door route exists to avoid, and it fails practically too (a verification link to a non-existent address silently kills the pull while leaving a junk record in a real manufacturer's CRM under his actual first name). **Ask for real credentials; never synthesize them.**

## 2. What we pulled

Two separate things, and they should not be confused:

- **The probe: 45 records** across Chicago, Houston and Atlanta @ 2026-08-01. This is what settled the disposition.
- **The export fold-in:** Artur supplied `emails/adaptall-data/data/` — **71 companies, 623 US contacts, 1,058 US location rows, 30 verified locator rows** — merged by `emails/scripts/s4g-adaptall.mjs` into `seated-v4.csv`. 174,072 cells diffed field-for-field, 0 differences; conservation PASS.

Contributed: **seated 1** (`hoseshop.com`, source token `adaptall-export`), 623 contacts to `data/enrichment/contacts-adaptall-2026-08-01.csv`, 23 rows to `lists/adaptall-routed-2026-08-01.csv`, and the **11 named contacts** that are currently the only named people on the seated list.

## 3. How deep we went

Deep enough to disqualify it as a list source, on four measurements:

1. **Hard cap of 15 records per query** — confirmed at three different cutoff distances, so it is `LIMIT 15`, not a radius. A national list would need *hundreds* of queries, each stamped with Artur's real name and company. That pattern would read exactly like what it would be: using a dealer-lookup form to enumerate a network under his own identity.
2. **`website` populated on only 28.9%.** Timken's 67.6% is more than double. A rich *schema* does not imply a rich *dataset*.
3. **Chains are 56% of rows and 73% of the premier tier** — and the tier signal is **inverted**: non-premier is where the independents are. Anyone using `premier` as a quality filter would select precisely the accounts we cannot sell.
4. Genuinely solid: phone 97.8%, and name/address/city/state/zip/latlng/premier/cust_class all 100%. `cust_class 31` ⟺ `premier 0` exactly; `customer_number` is the company key.

## 4. What's left on the table

Nothing worth taking. The bulk route is available and deliberately declined — volume here costs identity exposure and returns chain-heavy rows with poor website fill.

One send-blocking defect this fold-in surfaced is now fixed: seating `hoseshop.com` exposed that `thehoseshop.com` was **two unrelated companies collapsed on the normalized name "hose shop"** (Santa Cruz CA's declaration over Somerset NJ's NAP). Split in `seated-v5` by `emails/scripts/s4h-hoseshop-fix.mjs`. That is the `northernhydraulics` naming hazard, realised — and the reason `ptda/`'s rollup audit exists.

## 5. Registry row

| adaptall | RETIRED-TO-LOOKUPS | 1,058 | 1 | 2026-08-01 | lookups only — bulk route declined on identity exposure | adaptall/ |
