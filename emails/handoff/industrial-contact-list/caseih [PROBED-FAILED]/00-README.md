# caseih — source handoff

> **STATUS (2026-08-04):** PROBED-FAILED. Three-metro probe run, **the volume leg
> fails and the size leg fails harder**. 31 in-circle records → 15 companies →
> **~25–57 projected national in-band net-new, against a bar of 150** — and
> **74% of the dealers sit above the $75M ceiling** once the clustering footprint
> is widened past the probe circles. The signal leg passes cleanly: this source
> has the best published qualification data in the program. No sweep was run and
> none is earned.
> **No gates.** `www.caseih.com/robots.txt` does not disallow the data path —
> 49 `*` rules, none matches. No override, nothing to sign.

Prompts in this folder: `01-prompt.md` — a reopen check with one named condition,
not a build. The probe answered the question it was funded to answer.

Prerequisite reading, in order:
[`00-sourcing-strategy.md` §9 — **ICP-EQ** (the ICP extension and the binding condition this source vindicated: *design the size filter BEFORE the sweep*); §8.1a (the ceiling and why it exists)](../../strategy/00-sourcing-strategy.md) ·
[`01-build-plan.md` §5i (test that a code sorts), §5l (a name join is not a domain)](../../strategy/01-build-plan.md) ·
`../equipment-dealers [*]/00-README.md` + `02-robots-posture-2026-08-04.md` (the workstream, and the per-origin robots working) ·
`../bobcat [*]/00-README.md` §3 — the same workstream's other OEM, which passed on volume and failed on vertical. **The two failures are opposite and both are instructive.**

## 1. What it is

Case IH (agricultural equipment; CNH Industrial) publishes its US dealer network
at `https://www.caseih.com/en-us/unitedstates/dealer-locator`. The page is a
React app; the dealer data is plain JSON from the **same origin**.

The path came out of the app's own bundle, `/dist/caseih/static/js/259.0fdf6065.chunk.js`:

```js
fetch(`/apirequest/dealer-locator/get-dealer-by-geo-code?${d}`)
```

**A rooted relative path, so `www.caseih.com` is the serving host** and its
robots file is the one that governs. Three query modes exist:

```
/apirequest/dealer-locator/get-dealer-by-geo-code?latitude=&longitude=&pageId=&language=en-US&country=US
/apirequest/dealer-locator/get-dealer-by-geographic-filter?state=&pageId=&language=en-US&country=US
/apirequest/dealer-locator/…?country=US            (the country mode)
```

**Access shape: plain anonymous GET, JSON back.** No render, no form, no key.

**Robots — clear, and no override.** `www.caseih.com/robots.txt` carries 49
`User-agent: *` rules and **none matches `/apirequest/`**. Two lookalikes are
worth naming because they would trip a careless reader and do **not** match:
`Disallow: /Search/` and `Disallow: /dealer-landing-page`. Allowed by absence.

**Credential posture: nothing to assess.** The call site is a bare
`fetch(url, {signal})` — no headers, no key, no `credentials` option. Zero 401,
zero 403 across the run. `/legal-notice` was fetched and read: **no
anti-automation, anti-crawling or data-mining clause.** The "Harvest" hits in
that page are product taxonomy.

## 2. What we pulled

| | |
|---|---|
| Raw rows | **31** — the records inside the three 100-mile probe circles, all US |
| Rows seen | 430 across 7 responses (30 geo + 300 state + 100 country) → **326 distinct `dealerNumber`** |
| Distinct companies | **15** by name · **13** domains |
| Size bands, in the circles | **in-band 22 records · unknown 5 · above-ceiling 4** |
| Size bands, on the wider footprint | **in-band 8 · above-ceiling 23 = 74% over the ceiling** |
| Net-new by domain, in-band | **9** (circle clustering) · **4** (wider footprint) |
| Seated | 0 — not folded in, and not recommended |
| Routed to pools | none yet |
| Last pull | 2026-08-04 |
| Extractor | `emails/scripts/sources/caseih.py` · `_eq_sizeband.py` (bands, written before the first fetch) |
| Raw artifacts | `emails/data/raw/caseih-2026-08-04.json`, `caseih-measure-2026-08-04.json`, 7 cached responses in `data/raw/_cache/caseih/` |

Fill on the 31: **website 90.3% · phone 100% · email 100%.** Name/domain
inflation **1.15×** — the lowest measured anywhere in this program, because the
source publishes real company names rather than branch labels.

**That 100% email fill is the most interesting thing about a source we are
closing.** Under §7.2 those are manufacturer-published dealer addresses: send-
eligible after verification, in an isolated micro-campaign cohort. At 31 records
it is not a cohort.

Provenance is 100% filled — `source`, `source_url`, `captured` on every record.

**Cost: 7 origin requests.** ⚠ The payload's own `requests_log` lists 6; the
seventh — the country-mode pull — is on disk at `_cache/caseih/country-US.json`
and is counted in the acquisition log. **The cache is the honest count.**

## 3. How deep we went

Three metros, one widening pass, then a full stop. **The widening pass is the
finding**, and it is worth more than the 31 records.

### ⚠ The flattering number, caught by the rule that exists to catch it

Measured inside the three probe circles, Case IH looks like a good source:
22 of 31 records in band, 90% website fill, 100% email, clean names.

**Then the clustering footprint was widened to the three whole states, and 14
in-band records plus 5 unknowns flipped straight to above-ceiling** — 8 in band,
23 over the ceiling, **74%**. Nothing about the dealers changed. The probe simply
could not see the rest of each group's stores, so a four-store cluster inside one
circle was a fourteen-store group in reality.

That is exactly the failure `ICP-EQ`'s binding condition — *the size-band filter
is designed BEFORE the sweep* — was written to catch, and it caught it. It is
also stated ahead of time in `_eq_sizeband.py` §2: a cluster size measured in a
probe is a **lower bound** on the group's national footprint, which biases every
band **toward** calling groups in-band. The optimistic direction. Expect it.

*Reproducibility note: the 22/5/4 circle split is in the shipped payload and the
measure file. The 8/23 wider-footprint split is a session measurement that no
shipped file records — an independent re-clustering during this handoff, using
domain-authoritative joins but without the proxy-downgrade step, reproduces the
direction at 12 in-band / 19 above-ceiling (61%). Both readings say the same
thing. Treat 61–74% as the range and the direction as settled.*

### The signal leg passes, and it is the best in the program

| Field | Distinct on 31 rows | Verdict |
|---|---|---|
| `dealershipAttributes.dealerClasses[].classCode` | **3** — `D` Full-line **29** · `O` Specialty **1** · `S` Parts & Service **1** | **SORTS. A genuine tier code.** |
| `dealershipAttributes.contractDetails[]` | **28 distinct combinations** | **SORTS. A per-record line card.** |
| `cnhOwnershipGroupSAPNumber` | **15 across 31 rows** | **SORTS. The real group key.** |
| `cnhZ3SAPNumber` | 16 across 31 rows | sorts; a near-duplicate of the group key |
| `cnhPrimarySAPNumber` | **31 across 31 rows** | ⚠ **looks like a group key and is NOT** — it is one value per store |
| `brand` | 1 (`Case IH`) | constant. Sorts nothing. |

⚠ **`S` is Parts & Service and `O` is Specialty**, per the payload's own
`classDescription` on every row. They are easy to transpose from memory and the
`S` row is the one that would evidence the parts-counter premise behind ICP-EQ.
**Exactly one record in 31 carries it.**

**`cnhPrimarySAPNumber` is the trap in that table.** It is named like a parent
account and behaves like a store id — 31 distinct values across 31 stores.
Clustering on it would have produced 31 single-store companies and a 100%
in-band verdict. `cnhOwnershipGroupSAPNumber` is the field that actually groups.

### ⚠ The decoy-website trap, and it cost real money

**`dealerWebsite` is an OEM-hosted landing page on `caseih.com`. The dealer's own
site is at `dealershipAttributes.website`.** The first run read the wrong field
and reported **88.9% website fill with ONE distinct domain** — a fill rate that
looks healthy and is worthless.

The second failure was worse than the cosmetic one. Because clustering is
domain-first, **the shared fake domain collapsed all 24 dealers in that read into
a single cluster**, which the size filter then correctly called above-ceiling.
One wrong field turned an entire source into one imaginary mega-group.

Fixed in `_eq_sizeband.py`: `OEM_DOMAINS` blocks OEM apexes (`caseih.com`,
`bobcat.com`, `kubotausa.com`, `deere.com`, `newholland.com`, `cnh.com`, …) from
**both** the `domain` field and the join key. **Any future OEM extractor must
check for this pattern before it measures anything.** A locator that publishes a
website field is not necessarily publishing the dealer's website.

### Every query mode caps at a round number

| Mode | Rows returned | Reading |
|---|---|---|
| `get-dealer-by-geo-code` | **10, 10, 10** | cap 10 |
| `get-dealer-by-geographic-filter?state=…` | **100, 100, 100** | cap 100 |
| country mode | **100** | cap 100 |

**And `state=` is not a state filter — it is a sort seed.** `state=Texas` returns
43 TX rows plus 57 from KS, LA, OK, AR, NM, MO and CO. The country pull's 100
rows cover eight western and central states and stop. Per the pack's own rule, a
locator that returns a round number is clipping, and treating that as the answer
under-reports silently. **There is no mode here that returns a census.**

## 4. What's left on the table

**~25–57 projected national in-band net-new domains, against a bar of 150. The
source fails on volume and it is not close.**

Projection uses the same empirical scaler as SKF, Continental, Lincoln and
Bobcat, so all five are comparable: **2,264 of `deduped-v7`'s 14,284 geocoded
rows fall inside the three 100-mile circles = 0.1585**, so national ≈ probe ÷
0.1585.

| Reading | In-band net-new observed | Projected national |
|---|---|---|
| Circle clustering (the shipped payload + run log) | **9** | **~57** |
| Wider 3-state footprint (the honest size verdict) | **4** | **~25** |
| Circle clustering, minus one parse artifact | 8 | ~50 |

**Use 25–57 and say which you mean.** The run log and the pack registry both
carry 57; the wider-footprint reading gives 25 and is the one consistent with the
74%-over-ceiling finding. Every value in that column is under 150 by 3–6×, so the
verdict does not turn on the choice.

⚠ **One of the 9 "net-new domains" is the literal string `https`** — a URL parse
that lost everything after the scheme. It is in the shipped measure file's
`net_new_domains_sample` and it is not a company. Real net-new in the circles is
**8**. Anyone folding this source in must strip it; anyone quoting the 9 should
know what the ninth is.

**The 25–57 is still an upper bound, for two independent reasons:** every query
mode caps at a round number, so no pull here is exhaustive; and the wider
footprint would keep flipping rows over the ceiling as it widened further. A
national sweep would raise the raw count and lower the in-band share at the same
time.

### Verdict against the tier rule

The rule is **≥150 projected net-new AND (a tier code OR a per-record line
card)**.

- **Volume: 25–57 < 150. FAIL**, by 3–6×.
- **Signal: PASS, twice over.** `classCode` is a real tier code; `contractDetails`
  is a real per-record line card. This source has better qualification data than
  anything else in the program.
- **And a third leg the rule does not test: 74% of the dealers are above the $75M
  ceiling.** That is disqualifying on its own.

**The tension is the real finding of this workstream.** Case IH *can* evidence a
parts counter (`S` = Parts & Service) and has no volume. Bobcat has 767 net-new
domains and nulls the field that would evidence a parts counter. The two OEMs
fail in opposite directions and neither one is the source ICP-EQ was signed for.

### Could not verify, stated as such

1. **The national dealer count.** No mode returns a census; all three cap. Every
   national figure here is a projection.
2. **The exact 8/23 wider-footprint split.** Not recorded in any shipped file;
   independently reproduced at 12/19 during this handoff. See §3.
3. **Whether the caps can be paged.** No `offset`, `page` or cursor parameter was
   found in the bundle, and none was tried — the probe stopped at its budget.
4. **Whether the 100% email fill holds outside the probe circles.** 31 records is
   not a sample worth generalising from.
5. **The projection assumes Case IH's dealer density tracks our pool's
   geography**, which for an agricultural network is the least likely assumption
   in this document. Our pool is industrial-metro-weighted; Case IH is not.

## 5. Registry row

| caseih | PROBED-FAILED | 31 | 0 | 2026-08-04 | ~25–57 projected in-band net-new vs a 150 bar (25 on the wider-footprint reading, 57 on the circle-only count); 61–74% of dealers above the $75M ceiling | caseih/ |
