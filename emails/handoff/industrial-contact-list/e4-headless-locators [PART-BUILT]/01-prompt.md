# e4-headless-locators — get a per-locator robots decision, build one, measure it, then decide

Your mission: if this tier gets built at all, build it for breadth of authorization-stamped companies in thin segments — one locator at a time, each with its own signed robots-posture call, each measured on three metros before any full sweep.

## Read first, in order

1. `../00-README.md` — the pack index: the source registry, the company/person/sendable distinction, and the new-source rule.
2. `./00-README.md` — this workstream's dossier. The eight targets, the three separate times the case for E4 came apart, and the one argument that survives.
3. `../../strategy/00-sourcing-strategy.md` §3a **E4**, §3b (the GATE-L4 consequence), **§7.1 (the obstacle ladder — this is the load-bearing section)**, §9 GATE-L4.
4. `../../strategy/01-build-plan.md` **§5a** (the falsification), §5b, §5f, §5h — three independent "do not spend" findings.
5. `../../../research/01-dealer-locator-sources.md` — the target table and the difficulty key.

Nothing here is billed. The cost is wall-clock and judgement.

**Before step 0, state the counter-argument to whoever signs this:** we already hold 13,719 ranked-out companies we have not worked, and §5l says the cut line is the weakest claim in the build. Buying 3,000 more companies before working the ones in hand is the same mistake §5f named — enriching everything when we were long instead of short.

## The work

### Step 0 — the per-locator robots-posture call (GATE:HUMAN, and it is per site, not once)

**This is the step people will want to skip. Do not.**

Artur's 2026-08-01 override — *"I don't care about robots.txt"* — is recorded as forward policy, but the case that triggered it was **a false premise**: Enerpac's data path was never disallowed, and §7.1 says so in terms. What that override actually establishes is a **precedent for how a decision gets made**: an explicit, dated, per-site call by Artur, recorded in the strategy doc. **It is not a blanket licence, and headless rendering is not permission.**

Two further reasons this cannot be decided once for the whole tier:

- **A rendered page fetches subresources.** `research/01` flags exactly this: a headless render of a locator page may itself be permitted while the browser fetches a disallowed API path as a subresource. That question is open policy on OCC and AEM sites and will recur across this tier.
- **The standing counter-argument, on the record in §7.1:** Sale Solution sells AI-search-readiness and SEO. Being seen ignoring a `Disallow` is an asymmetric reputational risk for this firm specifically. Artur owns that risk — per site, knowingly.

So: for each of the eight targets, read its robots.txt and terms page (the way `kennametal.py` recorded its T&C check), write down what it says about the specific path the render would hit, and **GATE:HUMAN — get a yes or no from Artur per locator before building it.** A no is a fine outcome; the tier survives on the others.

### Step 1 — re-validate before building anything

**A source fingerprint has a shelf life.** Matthews Marking went from HTTP 200 to a Cloudflare 403 inside a single day (§5i). `research/01`'s table is dated 2026-08-01. For each cleared target: one honest GET, record the status, confirm the stack is still what the table says. Any 403 stops that target immediately — no host-switching, no UA rotation, no retry.

### Step 2 — build one locator, on the existing pattern

Reuse, do not rewrite. `emails/scripts/sources/*.py` all ride the shared `_polite.py` fetcher: ≥3s per host, one worker per origin, every response cached so re-runs make zero origin requests, honest desktop UA never rotated, 403 → hard stop, 429 → one backoff then leave it alone, `source_url` + `captured` on every record. A Playwright extractor inherits all of that — pacing applies to a browser exactly as it does to a fetch, and the cache should key on the rendered payload so a re-run replays from disk.

**Start with Banner** (best signal — explicit dealer tiers exist nowhere else) or **Festo** (thinnest segment), not with SKF (obfuscated bundle, highest build cost).

### Step 3 — measure on three metros, then decide

Per locator: **validate → run three metros → report distinct companies, net-new against `deduped-v7.csv`, website/phone/email fill, and whether the source publishes a vertical or tier code.** Only then decide the full sweep.

**Decision rule, stated before the first run so it cannot be rationalised after:** a locator earns a full sweep if the three-metro probe projects **≥150 net-new companies** *and* it carries either a tier code or a per-record line card. Below that, record the measurement and close it — Interroll, FlexLink and mk together returned 23 companies for 121 requests, and that is the shape of a source not worth sweeping.

### Step 4 — capture every source-native code verbatim

Three independent sources (Timken, DataForSEO, Yaskawa) have now proved that manufacturer locators encode vertical in their own codes. **Assume every new locator does, capture every category / group / type / tier field uninterpreted, and test whether it sorts before seating anything.** Bosch Rexroth is the known landmine here — it mixes Bosch's own sites into the partner list, so without a type filter it seats a manufacturer.

### Permanently excluded — do not re-litigate

Bimba's Bullseye API returns 401 without a key: a credential boundary, the same rule that keeps us off Enerpac's leaked Oracle credentials. The eight Cloudflare/Akamai 403 brands (Parker, Gates, ESAB, Norton, WEG, Regal Rexnord, Dixon, ifm) are not in this tier at all; a stealth-patched headless browser against them is detection evasion, which is the line §7.1 draws and does not cross. Their dealers are already recovered through `serp/`.

If someone wants a cheaper win first, the adjacent non-headless targets are **Sullair** (the page references `stationary_distributor_list.csv` / `portable_distributor_list.csv`; the guessed path 404'd and the base path needs one more look) and the **429-throttle trio — ARO, Miller Electric, Ingersoll Rand** — which are a *pace* signal, not a wall: ≤1 request per 3–5s, exponential backoff, cache everything, run overnight. Miller also accepts `?product_name=`, a product-level authorization signal nothing else offers.

## When this session's work lands

1. Update §5 Registry row in `./00-README.md` (status, counts, est. left) and the STATUS banner.
2. **RENAME THIS FOLDER** to match the new status — `e4-headless-locators [NEW-STATUS]` — that is how the founder reads readiness from the directory listing. Use `IN-PROGRESS` if you stopped before the plan completed.
3. Sync the pack registry table in `../00-README.md` (SSOT rule: row first, table second).
4. Note the change in `../99-hygiene.md` ONLY if it created files to clean.
