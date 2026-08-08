# skf — do not sweep; answer the two open questions or close it

Your mission: SKF failed both legs of the decision rule on a measured probe. **Do
not run a national sweep.** There are exactly two questions that could change
that verdict, both cheap. Answer them or close the source.

## Read first, in order

1. `../00-README.md` — the pack index and the company/person/sendable
   distinction.
2. `./00-README.md` — the dossier. **§2's `site`-partition table and §3's
   constant-code finding are the whole decision.** Read them before anything else.
3. `../../strategy/01-build-plan.md` **§5i** — SKF is this rule's sharpest
   vindication anywhere in the program. A rich decoding table in a bundle is not
   a rich code in the data.
4. `../e4-headless-locators [*]/02-robots-posture-2026-08-03.md` — why no gate
   applies.

## Why it failed, so you do not re-derive it

| Leg | Measured | Verdict |
|---|---|---|
| ≥150 projected net-new | **44** (5 observed ÷ 0.11404 scaler) | FAIL |
| tier code or per-record line card | `distributor_category` is a **constant** on all 82 US rows; `product_category` sorts company-level only | FAIL / partial |

And the structural problem underneath both: **the `United States` feed carries
zero websites and zero emails** on all 82 records. The 9 websites in the pull all
come from a separate 10-row `Lubrication TE` side-feed. The pipeline is
domain-keyed; those 82 rows cannot enter it.

## The two questions worth one request each

**Q1 — does `distributor_category` vary outside these three metros?** If the
constant `"DC001, DC028, DC021, DC011"` is an artifact of sampling three
industrial metros, the DC axis might sort elsewhere and the code leg would pass.
Probe **two geographically unlike boxes** — somewhere rural and somewhere coastal
— and compare the distribution. **2 requests.** If it is still constant, the code
leg is settled and closed forever.

**Q2 — is the constant an artifact of `locationNew` versus the legacy
`location`?** All three call sites use `locationNew`, so that is what we called.
One request against `location` with the same bounding box answers whether the
older route projects more fields. **1 request.**

**Budget for this whole session: 3 origin requests.** If both come back negative,
mark the source `RETIRED` and stop.

Even if Q1 flips the code leg, **the volume leg still fails at 44 against 150**
and the main feed still has no domains. Two failing legs becoming one does not
earn a sweep. Q1 and Q2 are worth answering because they close a question
permanently, not because they are likely to reopen the source.

## Do not re-litigate

- **The host.** `addressServiceConfig.config.url = "/address/distributors/"`,
  read from `https://www.skf.com/v2/assets/config/config.json`. **Same origin.**
  `research/01`'s "API path obfuscated" is resolved.
- **The route.** `locationNew`, not `location`, for dealers. `offices=true`
  returns SKF's own offices — **never send it, never seat those rows.**
- **robots.** `skf.py`'s `robots_gate()` re-verifies live before every run and
  raises if the answer changes. None of the 17 `*` Disallow rules matches
  `/address/distributors/…`. Note that `/*/authorized-general/` and
  `/*/certified-rebuilder/` *sound* like distributor paths and do not match.
  Nothing to sign.
- **Credentials.** MSAL's `protectedResourceMap` positively excludes the address
  service. Bare `httpClient.get`, no headers. If a 401 ever appears, **stop** —
  that is a credential boundary, not a puzzle.
- **The field list.** `research/01`'s is stale. `visit_website` is a CSS class.
  `phone_no_2`, `fax_no`, `distributor_offer`, `distributor_category_names` and
  `product_category_names_translated` are **absent from the payload**. The real
  19-key union is in `./00-README.md` §3.
- **`--sweep` refuses with exit 1 by design.** Do not implement it to "just
  check." The rule was stated before the first request precisely so it could not
  be rationalised after.
- **Chain share.** 77% of probe records are Motion, DXP, Applied, BDI and EIS —
  all far above the $75M ceiling. High overlap in Segment B was expected; Timken,
  NTN and PTDA already cover it.

## When this session's work lands

1. Update §5 Registry row in `./00-README.md` (status, counts, est. left) and the
   STATUS banner.
2. **RENAME THIS FOLDER** to match the new status — `skf [NEW-STATUS]` — that is
   how the founder reads readiness from the directory listing. `RETIRED` is the
   expected outcome.
3. Sync the pack registry table in `../00-README.md` (SSOT rule: row first, table
   second).
4. Note the change in `../99-hygiene.md` ONLY if it created files to clean.
