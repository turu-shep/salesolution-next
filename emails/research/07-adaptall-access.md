# Adaptall: identity gate passed, schema verified

**Date:** 2026-08-01
**Source:** `https://www.adaptall.com/distributors.php` → `POST https://www.adaptall.com/distributors_fetch.php`
**Status:** Access granted. 45 records pulled across 3 US metros as a schema sample. No enumeration attempted.
**Authorization:** Artur Shepel, 2026-08-01, verbatim — *"you can use my email a.shepel@salesolution.net for adaptall"*. Submitted under his real identity as founder of Sale Solution.

## Verdict up front

The gate opens on the first try and the schema is as rich as the JS promised. But two things found in the live data change the recommendation:

1. **Every query is hard-capped at 15 records.** All three metros returned exactly 15, at three different cutoff distances (23km, 12km, 19.8km). That is `ORDER BY distance LIMIT 15`, not a radius. There is no all-records call and no way to widen the window.
2. **`website` is populated on 28.9% of records**, not the majority. The JS made it look like a first-class field. It is present but sparse — well below Timken's measured 67.6%.

So: best-in-file schema, worst-in-file extraction economics. **Adaptall does not earn the easy tier.** Details below.

---

## What was submitted

The live form (verified today, not assumed from the JS notes) has exactly five inputs: four identity fields and one address field.

| Field | Value submitted |
|---|---|
| `name` | Artur Shepel |
| `title` | Founder & AI-Growth Strategist |
| `company` | Sale Solution |
| `email` | a.shepel@salesolution.net |
| `search` | the metro string, e.g. `Chicago, IL, USA` |
| `lat` / `lng` | metro centroid |
| `country` | `US` |

**Timestamp:** 2026-08-01 17:29:19 UTC (first submission). All three queries finished by 17:29:51 UTC, spaced ≥4s.

**Nothing was invented.** Two fields the task anticipated do not exist on this form:

- **No phone field.** Not in the HTML, not in the POST body. Nothing to fabricate and nothing withheld.
- **No free-text purpose or message field.** The honest one-line explanation of why we were looking had nowhere to go, and it was not stuffed into another field. Adaptall received the four identity values and a city string, nothing more.

**Client-side encoding bug worth knowing.** `js/distributors.js` builds the POST body with a chain of `encodeURI()` calls, which does not escape `&`. A real browser submitting the title "Founder & AI-Growth Strategist" would have split it into a broken parameter mid-value. The request here was properly form-encoded, so the truthful title arrived intact — more accurate than what their own front end would have sent.

## The gate's response

- **HTTP 200, JSON array, immediately.** No `Access denied`, no interstitial, no approval delay.
- **No email confirmation or verification step.** No double opt-in, no "check your inbox," no token in the response. Access was granted in the same request that carried the identity.
- **No session dependency.** The endpoint returns `access-control-allow-origin: *` and sets no cookie. The `PHPSESSID` from the page load was carried but is not what unlocks it. The gate is a server-side presence check on the four identity fields, nothing more.
- **No rate limiting, CAPTCHA, or bot protection observed.**

**Action for Artur:** the HTTP flow triggered no verification email, but the four identity fields are plainly written to a lead log, and a fluid-power manufacturer receiving a founder-title inbound is a normal reason to follow up. **Watch a.shepel@salesolution.net for a sales reply from Adaptall.** We cannot read that mailbox. Nothing is pending on our side; this is a heads-up, not a task.

## Verified schema

18 fields per record. Seventeen match `setDistMarkers` in the JS. One extra field, **`same_country`**, is returned by the server but never read by the client — a server-side filter flag, `"1"` on all 45 records.

Population across the 45-record sample (`null` and `""` both counted as empty):

| Field | Populated | Rate | Notes |
|---|---|---|---|
| `customer_number` | 45/45 | 100% | **Company key** — 31 distinct across 45 rows |
| `cust_branch_num` | 45/45 | 100% | **Location key** — `MAIN`, `ST-0000`, or `ST-nnnn` |
| `cust_class` | 45/45 | 100% | 31 / 46 / 51 / 71 in this sample |
| `same_country` | 45/45 | 100% | Undocumented in JS; `"1"` throughout |
| `premier` | 45/45 | 100% | 26 premier (58%), 19 regular |
| `Distributor_name` | 45/45 | 100% | |
| `address1` | 45/45 | 100% | |
| `address2` | 15/45 | 33.3% | `""` when empty |
| `address3` | 0/45 | **0%** | Never populated in this sample |
| `city` | 45/45 | 100% | |
| `state_province` | 45/45 | 100% | |
| `zip_postal_display` | 45/45 | 100% | |
| `phone` | 44/45 | **97.8%** | Direct branch lines, formatted `nnn-nnn-nnnn` |
| `website` | 13/45 | **28.9%** | `""` when empty |
| `webhost` | 13/45 | 28.9% | `null` when empty; always mirrors `website`'s host |
| `lat` / `lng` | 45/45 | 100% | |
| `distance` | 45/45 | 100% | Kilometres, one decimal |

### `website` and `premier`: both real, neither what was assumed

**`website` is confirmed present but sparse at 28.9%.** `webhost` carries no independent information — it is the hostname of `website` and is `null` in exactly the rows where `website` is `""`. Treat it as one field, not two. Counter-intuitively the *non*-premier tier has better website coverage (7/19, 37%) than premier (6/26, 23%), because premier is where the national chains sit and chain branches carry no branch-level URL.

One website value in the sample is a typo in their own data: `www.ezhydraulichose.cocm`. Any pipeline must validate these, not trust them.

**`premier` is confirmed and `cust_class` is now partly decoded.** The crosstab is clean at n=45:

| `cust_class` | rows | `premier` |
|---|---|---|
| 31 | 19 | **0** (all) |
| 46 | 2 | 1 |
| 51 | 12 | 1 |
| 71 | 12 | 1 |

`cust_class = 31` and `premier = 0` are the same set, with no exceptions. So **31 is the standard/non-premier buying class**, and 46/51/71 are all premier sub-classes. What separates 46 from 51 from 71 is not resolvable from 45 records — both 51 and 71 contain national chains and independents alike. That part of the open item stays open.

### The composite key is the useful discovery

`customer_number` identifies the **company**; `cust_branch_num` identifies the **location**. Together they are unique on all 45 rows; `customer_number` alone collapses to 31 distinct companies. Motion Industries is one code (`MOT601`) across six branches in three states. That is a native, server-provided dedupe key — better than name-matching, which is what every other source in this inventory forces.

`cust_branch_num` also encodes single-site status: `MAIN` (10 rows) and `ST-0000` (5 rows) both mark companies with one location. Fifteen of 45 rows, and 25 of the 31 distinct companies, are single-location in this sample.

**Caution:** the key is not perfectly clean. `MOT601` returns two rows for the same Austell, GA branch (`ST-0194` and `ST-0271`), identical address and distance. Expect duplicate branch records.

## Sample

Three queries, one per metro, ≥4s apart, ~30 seconds total. Cached to the session scratchpad.

| Metro | Records | Premier | Nearest | Farthest |
|---|---|---|---|---|
| Chicago, IL | 15 | 7 | 1.8km | 23.0km |
| Houston, TX | 15 | 10 | 3.3km | 12.0km |
| Atlanta, GA | 15 | 9 | 6.7km | 19.8km |

Exactly 15 every time, with the farthest result varying by nearly 2x. The cap binds in all three metros, which means all three are truncated — the real distributor count in each is higher than 15 and unknowable from the outside.

## ICP assessment: chain-dominated at the top, independent underneath

**25 of 45 rows (56%) are branches of national or regional chains.**

| Chain | Branch rows |
|---|---|
| Motion Industries | 6 |
| PIRTEK | 5 |
| Fastenal | 3 |
| Hydraulic Supply Co. | 2 |
| Colliflower | 2 |
| BDI, SunSource, LGG Industrial, Purvis, Lawson, Hose Power USA, Force America | 1 each |

The split by tier is the important part:

- **Premier tier: 19 of 26 rows are chains (73%).** Motion, PIRTEK, BDI, SunSource, Purvis, Hydraulic Supply. The premier flag is largely a proxy for volume, and volume means chains.
- **Non-premier tier: 6 of 19 rows are chains (32%).** The remainder are the ICP shape — Briski Industrial Supply, Independent Hose, Labs Ind. Hose Supply, Anchor Products, Pioneer Rubber & Gasket, Specialty Hydraulics, EZ Hose & Fittings, Fort Dearborn, Flow Products, Aetna Truck Parts, Bristol Hose & Fitting, Georgia Equipment Solutions.

**So the usable filter is inverted from what you would guess: `premier = 0` (equivalently `cust_class = 31`) is the ICP segment, not `premier = 1`.** Filter to non-premier, single-location (`MAIN` or `ST-0000`), and the 45-row sample yields roughly 12 genuine independent targets — about 27% of rows pulled.

Data hygiene is mediocre and will cost cleanup time: `COLIFLOWER INC.` and `COLLIFLOWER INC.` are the same company spelled two ways, `TOMPKINS INDUSTIES` and `Collage Park, GA` are misspelled at source, `PIRTEK - RED OAK` and `PIRTEK RED OAK` are near-duplicates 100m apart.

## Does it earn easy tier? No.

It earns **medium**, and it is a poor bulk source regardless of tier label.

**For it:** the best-parsed address in the inventory, phone at 97.8%, a real tier flag, a server-provided company/branch key that makes dedupe trivial, and a clean non-premier filter that isolates independents. Per-record, this is the best data in the file.

**Against it:**

- **The 15-record cap is decisive.** Covering the US would take a grid fine enough that no cell holds more than 15 distributors. In dense metros that is a very tight grid — realistically hundreds to low thousands of queries.
- **Every one of those queries stamps Artur's name, title, company and email into Adaptall's lead log.** One founder lookup is a normal thing a founder does. A thousand of them under the same identity is a different act, and a conspicuous one.
- **`website` at 28.9%** undercuts the main reason to prefer it. The null-website bucket is still extractable, but the yield per query is thin.
- Duplicate and misspelled records mean the clean count is below the raw count.

**Recommendation: use it as a targeted lookup, not a list source.** When a metro or a named account matters, one query returns 15 well-structured records with phones. That is a legitimate, proportionate use of the access we were granted. Do not build a grid.

Fluid power still has no open bulk source. This does not change that.

## Open items

- **`cust_class` 46 vs 51 vs 71 remains undecoded.** 31 = non-premier is settled. A larger sample would be needed for the rest, and a larger sample is what we just decided against.
- **Watch a.shepel@salesolution.net** for an Adaptall sales follow-up. No action required unless one arrives.
- The Enerpac headless-render-vs-robots.txt policy question from `01` is untouched and still open.

## Compliance record

- One identity submission, real details, no fabrication. Three queries total, ≥4s apart, all 2026-08-01 17:29 UTC.
- 45 records retrieved — a schema sample, not a harvest. No enumeration, no grid, no credentials, no bypass of any control.
- Responses cached to the session scratchpad rather than re-fetched.
- Source URL and date recorded above.
