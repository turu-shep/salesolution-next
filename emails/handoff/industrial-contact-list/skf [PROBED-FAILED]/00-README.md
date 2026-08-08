# skf — source handoff

> **STATUS (2026-08-03):** PROBED-FAILED. Three-metro probe run, **both legs of
> the decision rule failed**, national sweep refused. 92 records → 21 companies →
> **44 net-new projected nationally**, and the main US feed carries **zero
> websites and zero emails**. `--sweep` is deliberately unimplemented and exits 1.
> **No gates.** robots.txt does not disallow the path — verified live, in-process,
> before the first data request. No override, nothing to sign.

Prompts in this folder: `01-prompt.md` — the reopen condition and the two
questions the probe could not answer. Not a build; the build exists and stopped
where it was told to.

Prerequisite reading, in order:
`../e4-headless-locators [*]/02-robots-posture-2026-08-03.md` (how the host was
resolved and why no gate applies) ·
[`01-build-plan.md` §5i (**this source is the rule's sharpest vindication**), §5l (why a name join is not a domain)](../../strategy/01-build-plan.md) ·
[`00-sourcing-strategy.md` §7.1](../../strategy/00-sourcing-strategy.md) ·
`../no-domain-backlog [*]/00-README.md` — where 82 of the 92 records belong

## 1. What it is

SKF (bearings and power transmission — Segment B) runs
`https://www.skf.com/us/support/find-a-distributor` as an Angular SPA behind
Akamai. `research/01` recorded *"endpoint not found in bundle scan; API path
obfuscated."*

**That was half right, and the wrong half mattered.** The path is in the bundle
(`chunk-F5OGGODZ.js` builds `${solrUrl}locationNew?bounding_box=…`), but
`solrUrl` is `settings.addressServiceConfig.config.url` — a value that appears as
a literal in **no bundle**, with no source map. Since Angular's `HttpClient`
accepts an absolute or a relative URL, the config value alone decides the origin,
and no amount of further bundle reading could produce it.

One GET of `https://www.skf.com/v2/assets/config/config.json` — a static app
config published to every anonymous visitor — settled it:

```
addressServiceConfig.config.url = "/address/distributors/"
```

**Relative. Same origin.** So the live routes are:

```
GET https://www.skf.com/address/distributors/locationNew?bounding_box=<JSON>&limit=<n>&countryName=US
GET https://www.skf.com/address/distributors/location/<id>
GET https://www.skf.com/address/distributors/addressSearch?search=<text>
```

**Correction to the pinned path: the live dealer route is `locationNew`, not
`location`.** All three `getDistOffices` call sites pass the flag that selects it.

**`offices=true` returns SKF's own offices, not dealers. It was never sent.**

**Robots — no gate, and re-verified in code.** `skf.py`'s `robots_gate()` parses
`www.skf.com/robots.txt` at run time and regex-tests the address-service paths
against all 17 `User-agent: *` Disallow rules with real `*`/`$` semantics. **None
matches.** Allowed by absence. The check **raises before fetching** if that ever
changes. Worth flagging: two of those rules —
`Disallow: /*/authorized-general/` and `Disallow: /*/certified-rebuilder/` —
*sound* like distributor listings and would trip a careless reader. They do not
match this path.

**Credential posture is positively established, not merely absent.** MSAL's
`protectedResourceMap` enumerates exactly which URLs receive a B2C bearer token —
`search.skf.com/…/croesus/*`, `/feedback-service/*`, `/cad-service/download-cad/*`.
The address service is **not** in that map, and the calls are bare
`httpClient.get(u)` with no headers. Akamai never challenged: **zero 403, zero
401, zero challenges across 5 requests.**

## 2. What we pulled

| | |
|---|---|
| Raw rows | **92** (3-metro probe only — no national sweep) |
| US records | 92 · 92 distinct ids · 92 distinct addresses |
| Distinct companies | **21** |
| Unique domains | **9** |
| Seated (`seated-v5`) | 0 |
| Last pull | 2026-08-03 |
| Extractor | `emails/scripts/sources/skf.py` |
| Raw artifacts | `emails/data/raw/skf-2026-08-03.json` |

Per metro, with `numFound` equal to rows returned every time (nothing truncated;
the 500 limit was never approached): **Houston 34 · Chicago 28 · Cleveland 30.**

**Cost: 5 origin requests** (1 robots + 4 data), under the 6 budgeted. Re-runs
make zero.

### ⚠ `site` is a feed partition, not a location — and it breaks every average

| `site` | recs | companies | website | email | phone | `distributor_category` |
|---|---|---|---|---|---|---|
| `United States` | 82 | 11 | **0** | **0** | 81 | `DC001, DC028, DC021, DC011` (constant) |
| `Lubrication TE` | 10 | 10 | 9 | 9 | 10 | `NA` |

**Two structurally different datasets arrive on one route.** Every website and
every email in the pull comes from the 10-row lubrication side-feed. The headline
"9.8% website fill" is an average over both and is meaningless — **the main US
dealer feed has none.** State parses to 100% after handling the three published
shapes (`Texas`, `Texas, TX`, `Ohio, OH`).

Provenance 100% filled: `source`, `source_url`, `captured`.

## 3. How deep we went

Three metros, then a full stop, exactly as the handoff required. What the probe
established is worth more than the records.

### §5i's sharpest vindication in the whole program

SKF's bundle publishes the richest decoding table anywhere in this build:
`distributor_category` **DC001–DC028** — SKF Authorized, Certified Partner, MRC,
TFO/TFS, Lubrication Systems, Agriculture, Kaydon, RecondOil, Seal Jet, Electric
Motor, Sustainability Partner, Super Precision Partner, Maintenance Partner,
Seals — and `product_category` **PC001–PC025** across bearings, lubrication,
maintenance, seals, power transmission and services.

On that basis, the briefing that commissioned this probe stated SKF would
"clearly clear the code leg."

**Measured, it does not. `distributor_category` is a CONSTANT.** All 82 US rows
carry the identical string `"DC001, DC028, DC021, DC011"`. All 10 lubrication
rows carry `"NA"`. There is nothing to sort by at this resolution.

- `product_category` **does** sort, but company-level only — three values,
  identical across every branch of a company. A line card at low resolution, not
  per-record.
- `type` = `SKF Distributor` on 100%. Constant.
- `country_code`: `USA` (82) / `usa` (10) — the same field, two casings.

**A rich decoding table in a bundle is not a rich code in the data.** §5i says
capture codes verbatim and *test whether they sort before seating anything*, and
this is the clearest demonstration of why that test is not optional: reading the
dropdown list alone would have produced a confident, wrong claim about the best
qualification signal in the program. Codes are stored **as codes** — SKF's own
bundle decodes them inconsistently (`setProductCategories` pushes PC010 and PC020
back into `distributor_category` as labels), so no decoding was applied.

**`research/01`'s field list is stale.** `visit_website` is a CSS class in the
bundle, not a payload key. The real 19-key union, verbatim: `address_1`,
`city_name`, `component_name_do_not_change`, `country_code`,
`distributor_category`, `email`, `homepage`, `id`, `map_latitude`,
`map_location`, `map_longitude`, `name`, `phone_no`, `product_category`, `site`,
`sort_order`, `state`, `type`, `zip_code` — all strings. `phone_no_2`, `fax_no`,
`distributor_offer`, `distributor_category_names` and
`product_category_names_translated` are **absent from the payload**; they are
client-side render fields.

**77% of records are five national chains** — Motion 22, DXP 18, Applied 18,
BDI 9, EIS 4 — all $1.8B–$8B and far above the $75M ICP ceiling.

## 4. What's left on the table

**Very little, and the sweep was refused on measurement.**

Projection uses an empirical scaler, not an assumption: **1,629 of `deduped-v7`'s
14,284 geocoded rows fall inside the three probe boxes = 0.11404**, so national ≈
probe ÷ 0.11404.

| Measure | Probe | Projected national |
|---|---|---|
| companies | 21 | ~184 |
| **net-new by domain** (9 domains, 44.4% overlap) | **5** | **~44** |
| net-new by `norm_company` (21, 14.3% overlap) | 18 | ~158 |

**The name axis overstates by 3.6× here**, reproducing the ~3× seen on every
source measured today. Use the domain figure.

### Verdict: both legs fail

The rule is **≥150 projected net-new AND (a tier code OR a per-record line
card)**.

- **Volume, on the trustworthy domain axis: 44 < 150. FAIL.**
- **Code: the DC tier axis is constant → fail. The PC line card is company-level,
  not per-record → partial at best.**

`--sweep` is deliberately unimplemented and refuses with exit 1. That is the
correct outcome and it should not be argued around.

Segment B is already our deepest pool through Timken, NTN and PTDA, so high
overlap was expected — 44.4% on domain — and it is what the measurement found.

**Could not verify, stated as such:**
1. **Whether `distributor_category` varies outside these three metros**, or
   whether the constant is an artifact of `locationNew` versus the legacy
   `location` route. Both need requests beyond the budget.
2. **Whether `bounding_box` accepts a US-wide box.** Not attempted — the handoff
   forbade escalating before reporting.
3. The projection assumes SKF's dealer density tracks our pool's geography.
4. A hand-check found `bearingdistributors.com`, `vallen.com`,
   `purvisindustries.com`, `unlaub.com`, `weimerbearing.com` and
   `molinebearing.com` already in the pool, while `motionindustries.com`,
   `applied.com`, `dxpe.com`, `bdiexpress.com` and `eisinc.com` are absent —
   reading as upstream ICP-ceiling filtering rather than a gap. **That framing is
   judgement, not measurement.**

## 5. Registry row

| skf | PROBED-FAILED | 92 | 0 | 2026-08-03 | ~44 net-new projected — fails both legs; main US feed has 0 websites/emails | skf/ |
