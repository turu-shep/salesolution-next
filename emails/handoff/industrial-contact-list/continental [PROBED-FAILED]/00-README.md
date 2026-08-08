# continental — source handoff

> **STATUS (2026-08-03):** PROBED-FAILED. Three-metro probe run; **the volume leg
> failed and the sweep was not run.** 152 US records → 84 companies → 13 net-new
> domains → **82 projected nationally**, against a 150 bar — and the 13 do not
> survive inspection intact. Website fill is 70.4%, the best of any E4 target, so
> the failure here is genuinely about volume rather than about unusable records.
> **No gates.** robots.txt is `Allow: /`; no override, no credential, nothing to
> sign.

Prompts in this folder: `01-prompt.md` — the reopen condition and the one
untested axis (`aftermarket`). Not a build; the build exists and stopped on the
rule.

Prerequisite reading, in order:
`../e4-headless-locators [*]/02-robots-posture-2026-08-03.md` ·
[`01-build-plan.md` §5i (the vertical-code rule), §5l (why a name join is not a domain), §5h (a wave needs a signal we lack)](../../strategy/01-build-plan.md) ·
[`00-sourcing-strategy.md` §7.1](../../strategy/00-sourcing-strategy.md)

## 1. What it is

Continental / ContiTech (hose, fittings, belts — Segment "hose & fittings") runs
its distributor locator on **AEM Edge Delivery (Franklin)** at
`https://www.continental-industry.com/global/en/about-us/tools-services/distributor-locator`,
a 5.8 KB shell. `research/01` filed it `hard JS`.

**It needs no browser.** The block at
`/blocks/distributor-locator/distributor-locator.js` builds a same-origin URL:

```
GET https://www.continental-industry.com/apis/v1/distributors
    ?locatorType=<gad|aftermarket>
    &radius=<10|20|50|100>&distanceUnit=<mi|km>
    &latitude=<lat>&longitude=<lng>
    [&<filterKey>=true …]
```

The base comes from `new URL("apis/v1/distributors", window.location.origin)` —
**scheme and host only, so this is same-origin**, not one of the cross-host cases
Banner and Festo turned out to be. The backend is Salesforce: response fields are
Account API names (`Name`, `BillingStreet`, `BillingCity`, `BillingState`,
`BillingPostalCode`, `BillingLatitude`, `BillingLongitude`, `Website`, `Phone`,
`Email`) and the hydraulics filter carries `Locator_Hydraulics__c`.

**Robots — no gate.** `www.continental-industry.com/robots.txt` is verbatim:

```
User-agent: *
Allow: /

User-agent: Linguee
Disallow: /
```

Longest match on `/apis/v1/distributors` for `*` → **`Allow: /`. Allowed.**
Nothing anywhere disallows `/apis/`.

**Credential: none.** The call is a bare `fetch(u)` — no init object, no headers,
no `Authorization`, no key parameter, no `credentials` option. The one `apiKey`
in the block is a **Google Maps browser key** read from the page's own DOM and
handed only to the Maps provider for geocoding; it is published in the anonymous
HTML to every visitor. A public widget identifier, not a credential boundary.
Value not recorded.

## 2. What we pulled

| | |
|---|---|
| Raw rows | **157** (3-metro probe only) |
| US records | **152** |
| Distinct companies | **84** |
| Unique domains | **28** (107 records carry one) |
| Seated (`seated-v5`) | 0 |
| Last pull | 2026-08-03 |
| Extractor | `emails/scripts/sources/continental.py` |
| Raw artifacts | `emails/data/raw/continental-2026-08-03.json` |

Fill on US records: **website 70.4% · phone 94.1% · email 0.0%.**

**That website figure is the best in the E4 tier and it matters.** Walter is 0%,
SKF's main feed is 0%, and the pipeline is domain-keyed end to end. Continental's
records can actually enter it. Its failure is a volume failure, not the
structural one that sidelined the other two.

Provenance 100% filled: `source`, `source_url`, `captured`.

## 3. How deep we went

Three metros on the industrial (`gad`) axis at 100-mile radius, plus one
`aftermarket` probe on Houston to test whether the two locator types return
disjoint sets. Then a full stop, as the handoff required. **5 origin requests.**

> ⚠ **`gad_only` and `gad_plus_aftermarket` are identical in the stats block, and
> that is not a result — it is a failure.** `locatorType=aftermarket` returns
> **HTTP 400**, verbatim:
> `{"code":"b22a458c-…","error":"Response is not valid 'message/http'."}` — Azure
> APIM reporting a **backend** failure. The route exists (an invalid
> `locatorType` would 404); its backend is not answering. Not transient over
> minutes: it was re-sent 5× across 345s of backoff for the same 400. No other
> host was tried. **The disjointness question is unanswered, not answered
> negatively.** Do not read those two identical numbers as evidence.

Per-metro on `gad`: **Houston 51 · Chicago 49 · Cleveland 57** = 157 records, of
which 152 US and 5 Canadian (Windsor and Chatham ON fall inside Cleveland's
100-mile radius).

### The code axis: declared but not delivered

The block declares six industrial filter keys — `cbh` (conveyor belts,
heavyweight), `hydraulics`, `ihose` (industrial hose), **`ihoseStarDist`
(Industrial Hose – STAR Distributor, a genuine tier code)**, `pde` (petroleum
dispensing), `ptp` (power transmission) — and ten `aftermarket` keys.

**Not one of them appears on the returned record.** The record does carry a
`Locator_*__c` boolean for every **aftermarket** code plus Hydraulics — the wrong
network entirely.

**And 18 of the 19 Salesforce custom fields are inert** — a single value across
all 157 rows. `Services__c` and `Certifications__c` are null on 100%; all seven
`Hours_*__c` are null on 100%; nine of ten `Locator_*__c` are `false` on 100%.
The only field that sorts anything at all is `Locator_Parts_Store__c`, **true on
1 of 152 rows.** There is no per-record line card here.

The tier code was probed directly — `…&ihoseStarDist=true` on Houston returns
**3 of 51**, a strict subset — so it genuinely sorts, but **only query-side**:
labelling costs one extra request per tier per metro, and the label lives in the
query rather than the row. That is why the code leg scores as a narrow pass while
the volume leg does not.

The full 32-key payload union was captured and is identical across all three
metros. Two corrections to `research/01`'s field list fell out of it: **`Email` is
not in the payload at all** — the UI destructures `e.Email` and it is always
undefined, so 0% email is *structural, not sparse* — and **`BillingCountry` is
present**, which gave `is_us` without any inference. 22 of the 32 keys are never
rendered by the UI.

§5i's rule stands and is refined again: Sullair and Festo publish codes *on the
record*; Continental publishes them only *as query filters*; Walter publishes
none; SKF publishes a rich decoding table over a constant. **Four different
shapes of the same question, and only measurement separates them.**

## 4. What's left on the table

**Below the bar, and the sweep was not run.**

Projection uses an empirical scaler: the three 100-mile circles are geographically
disjoint (Chicago–Cleveland is ~315 mi), so their coverage is additive.
**2,264 of `deduped-v7`'s 14,284 geocoded rows fall inside them = 15.85%**, so:

```
13 net-new domains ÷ 0.1585 = 82 projected national net-new domains
```

**The denominator is a measured share of an existing list, not a guess at the
national universe** — which is what makes the number arguable rather than
invented.

### Verdict: volume leg fails

| Leg | Result |
|---|---|
| ≥150 projected net-new companies | **82. FAIL.** |
| tier code or per-record line card | `ihoseStarDist` is a usable tier code (filter-only). **Pass.** |
| **Clears both** | **No.** |

**The sensitivity analysis is the stronger claim, and it is what settles this.**
Reaching 150 would require the three circles to cover **≤8.7%** of US industrial
distribution. They cover **15.9%** of the geocoded baseline, and a
population-share denominator does not rescue it either — those three CBSAs are
~5.5% of US population, and a 100-mile radius reaches well past a CBSA boundary.
**Leg 1 fails under every plausible denominator**, not just the one chosen. For
contrast, the name axis projects 461 — precisely the ~3× branch-label inflation
seen on every source measured today (`applied.com` alone is 38 of 152 records).

**13 is a floor, not a ceiling.** 22 company names carry no website on any
branch, so they cannot be domain-joined in either direction and are excluded from
both sides of the count.

**Two of the surprises were spot-checked rather than assumed.** `applied.com`
(Applied Industrial) and `bdi-usa.com` (BDI) really are absent from `deduped-v7`
— genuine gaps, not join errors. They should still not be seated: both are far
above the $75M ICP ceiling. And **`summitracing.com` and `kauffmantire.com` came
back from the *industrial* `gad` locator**, which is the useful warning — `gad`
is not purely MRO, so this source needs the same vertical scrutiny as any other.

**Assumptions that could break the projection**, stated because they should be
argued with rather than inherited:
1. Continental's dealer density is assumed to track `deduped-v7`'s geography. It
   is a belts/hose/hydraulics network; if it is thicker or thinner in the Gulf
   and Rust Belt than our list, the projection is wrong in that direction.
2. **14.6% of the baseline has no lat/lng** and is excluded from the share
   denominator entirely.
3. Three metros is a small sample for a national extrapolation.

**Could not verify:**
- Whether `/apis/v1/distributors` returns more than the 11 fields the UI
  destructures. The block only reads what it renders.
- Whether `aftermarket` is genuinely non-additive nationally, or only in Houston.
- Whether radius >100 mi is accepted; the UI caps at 100.

## 5. Registry row

| continental | PROBED-FAILED | 157 | 0 | 2026-08-03 | ~82 projected net-new (likely 55–60 after chain/vertical strikes) — below the 150 bar | continental/ |
