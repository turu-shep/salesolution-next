# adaptall — targeted lookup, not a list source

Your mission: answer "is this specific company Adaptall-authorized, and at what tier?" for a company we already found elsewhere — one query at human pace, never a sweep.

## Read first, in order

1. `../00-README.md` — the pack index: the source registry, the company/person/sendable distinction, and the new-source rule.
2. `./00-README.md` — this source's dossier. The consent form, the four measurements that disqualified it as a list source, and the export fold-in.
3. `../../strategy/00-sourcing-strategy.md` **§8.6 (the whole verdict)**, §7.1 (the consent-form row), and §9 GATE-L5 including the precedent note.
4. `../../../research/07-adaptall-access.md`.
5. `../../../data/_adaptall-integration-2026-08-01.md`.

## The work

**Targeted lookups only (§9, decided).** Use Adaptall to enrich companies already found elsewhere: authorized? which tier? **Query at human pace, never in a sweep.**

**Do not re-litigate the metro sweep.** The bulk route is available and was deliberately declined. If a session arrives wanting a national list from here, the answer is in §8.6 and in the four measurements below — not in a fresh attempt.

If a sales follow-up arrives at `a.shepel@salesolution.net`, that is expected. The submission was truthful and under Artur's own name.

## Why the bulk route is closed — four measurements

1. **Hard cap of 15 records per query** — confirmed at three different cutoff distances, so it is `LIMIT 15`, not a radius. A national list would need *hundreds* of queries, each stamped with Artur's real name and company. That pattern would read exactly like what it would be: using a dealer-lookup form to enumerate a network under his own identity.
2. **`website` populated on only 28.9%.** Timken's 67.6% is more than double. A rich *schema* does not imply a rich *dataset*.
3. **Chains are 56% of rows and 73% of the premier tier** — and the tier signal is **inverted**: non-premier is where the independents are. Anyone using `premier` as a quality filter would select precisely the accounts we cannot sell.
4. Genuinely solid, and why lookups still pay: phone 97.8%, and name/address/city/state/zip/latlng/premier/cust_class all 100%. `cust_class 31` ⟺ `premier 0` exactly; `customer_number` is the company key.

## GATE:HUMAN — the identity rule, if the form ever needs re-submitting

**Ask for real credentials; never synthesize them.** The gate is an identity form with no bot protection, which §7.1 classifies as "use the front door" — but the front door only works if you walk through it honestly.

GATE-L5's precedent, kept because it will recur: Artur first offered `Artur / CEO / Test company / test@test.com`. **That was declined.** A real name against a fake company and a dead mailbox is inventing an identity, which is the exact thing the front-door route exists to avoid — and it fails practically too, because a verification link to a non-existent address silently kills the pull while leaving a junk record in a real manufacturer's CRM under his actual first name.

The form has four identity fields plus an address — no phone field and no free-text field — so nothing has to be invented or withheld.

## One defect this source surfaced, now fixed

Seating `hoseshop.com` exposed that `thehoseshop.com` was **two unrelated companies collapsed on the normalized name "hose shop"** (Santa Cruz CA's declaration over Somerset NJ's NAP). Split in `seated-v5` by `emails/scripts/s4h-hoseshop-fix.mjs`. That is the `northernhydraulics` naming hazard, realised — and the reason `ptda/`'s rollup audit exists.

## When this session's work lands

1. Update §5 Registry row in `./00-README.md` (status, counts, est. left) and the STATUS banner.
2. **RENAME THIS FOLDER** to match the new status — `adaptall [NEW-STATUS]` — that is how the founder reads readiness from the directory listing. Use `IN-PROGRESS` if you stopped before the plan completed.
3. Sync the pack registry table in `../00-README.md` (SSOT rule: row first, table second).
4. Note the change in `../99-hygiene.md` ONLY if it created files to clean.
