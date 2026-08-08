# lincolnelectric — sweep ONE more tab, then report before buying anything else

Your mission: the probe swept 1 of 6 tabs and projected 44 net-new domains
against a bar of 150. **There is exactly one open question that could move that
number: do the other five tabs hold companies the distributor tab does not?**
Answer it on **one** tab, in **three** metros, and report. Do not sweep five tabs
and do not sweep nationally.

## Read first, in order

1. `../00-README.md` — the pack index: the source registry, the
   company/person/sendable distinction, and the new-source rule.
2. `./00-README.md` — this source's dossier. **§3's code section and §4's
   "Could not verify" item 1 are the whole brief.** Read them before you write a
   line of code.
3. `../../strategy/01-build-plan.md` **§5i** (capture codes verbatim and test
   that they sort — this source is the rule's fourth confirmation in one tier)
   and **§5l** (a name join is not a domain; the name axis overstates 28× here,
   the worst measured anywhere).
4. `../e4-headless-locators [*]/02-robots-posture-2026-08-03.md` §2 — how the
   longest-match verdict was reached. **A naive prefix reader kills this source.**
5. `../skf [*]/00-README.md` §3 and `../banner [*]/00-README.md` §3 — the same
   constant-code failure, two sources earlier.

## The one question worth buying

**Q — do the unswept tabs hold companies the distributor tab does not, in enough
volume to matter?**

The shape probe says they might. At 50 mi, per tab, 3 calls each:

| Tab | Rows returned | Rows absent from the distributor tab |
|---|---|---|
| `whereToRent` | 30 | **30 / 30** |
| `wholesale` | 30 | **30 / 30** |
| `industrial` | 30 | 11 / 30 |
| `specialtyGas` | 30 | 7 / 30 |
| `serviceLocations` | 17 | 7 / 17 |

**The six tabs are not nested.** Two of them returned nothing the swept tab had
seen. So the 1,394-company projection covers the distributor tab only, and a full
pull would return materially more.

### The work

1. **Sweep `wholesale`, and only `wholesale`.** Same three metros
   (Houston / Chicago / Cleveland), same adaptive quadtree, same 50-mile
   half-side, same closure rule. It ties `whereToRent` for the highest disjoint
   share and its `Wholesale__c = true` predicate is the one most likely to be a
   distribution business rather than a rental counter. Flip `wholesale: true` and
   `isDistributor: false` in `requestMap` — nothing else changes.
2. **Budget, stated before the first request: ≤120 origin requests.** The
   distributor sweep cost 107 calls across the same three metros, so this is one
   comparable tab plus headroom. Hard-stop in code, not in a comment. Every
   response cached; ≥3s per host; one worker; honest UA, never rotated.
3. **Measure net-new on the DOMAIN axis.** Against `emails/lists/deduped-v7.csv`,
   and against the 24 domains this source already produced, so the answer is
   *incremental* net-new rather than a second count of the same companies.
   **Report the union axis too** — website ∪ email domain — because the dossier
   already measured that the email column carries 17 registrable domains the
   website column never publishes.
4. **Expect the domain-fill problem to persist and say so if it does.** The
   distributor tab is **21.4% website fill**: 213 of 271 records carry no site at
   all. There is no reason a wholesale predicate on the same
   `Distributor_Profile__c` object would be populated differently, and if it is
   not, a bigger row count buys very little. **Report fill before you report
   net-new** — it is the number that decides whether the rest matters.
5. **STOP and report.** Do not continue to the remaining four tabs, do not go
   national. The decision to buy tabs 3–6 belongs to whoever reads your numbers.

### The bar this has to clear

The rule is **≥150 projected net-new AND (a tier code OR a per-record line
card)**. The distributor tab gives **44** on the domain axis, ~114 on the most
generous honest reading (union axis, chains struck). **One tab would have to add
roughly 40+ projected net-new domains for the source to become arguable, and
~110 for it to pass outright.** If it adds fewer than 20, the remaining four tabs
cannot close the gap either and the source is closed permanently.

**GATE:HUMAN — none.** robots is allowed and re-verified in code, the credential
posture is public, and this spends no money. The only gate here is the budget in
step 2, which is yours to enforce.

## Do not re-litigate

- **robots.** `Disallow: /` + `Allow: /s` + `Allow: /northamerica/s`. Under RFC
  9309 §2.2.2 longest-match, `Allow: /northamerica/s` (15 chars) beats
  `Disallow: /` (1 char), so both the store-locator page and the Aura endpoint are
  **ALLOWED**. `robots_gate()` re-fetches and re-executes that match at run time
  and **raises before the first data request** if it ever changes. **A reader who
  stops at `Disallow: /` gets this source exactly backwards and kills it** — the
  E4 posture doc caught that error once already. The legacy `.aspx` locator 403s
  and is never touched. **No override, nothing to sign.**
- **The transport.** Aura classic, not LWR. The shell counts `aura` 134,
  `auraConfig` 15, `fwuid` 3, `markup://` 184 against `webruntime` 0 and
  `LWR.define` 0. Walter Surface's `webruntime` bridge does not exist here and
  reusing it gets nothing.
- **`aura.token` is the four-character literal `null`.** The anonymous page ships
  `auraConfig["token"] == null` and `authenticated == "false"`, so Aura runs
  csrfV2 and the client sends the literal. **Nothing is session-derived and
  nothing was harvested from a login.** Zero 401, zero 403 across 145 origin
  interactions. If a 401 ever appears, that is a boundary — stop.
- **Plain `urllib` carries the data.** Chromium ran exactly once, for wire
  discovery. Do not reintroduce a browser; the funded premise for this tier was
  "the data is behind a render" and it was not.
- **`LIMIT 10` is hardcoded server-side.** `limit`, `resultLimit`, `maxResults`,
  `pageSize` and `recordLimit` were each added in a separate deliberate request
  and the emitted SOQL never changed. `range` **is** honoured. There is no
  offset, no cursor, no page key, and the sitemap has no distributor detail
  pages. **Subdivision is the only correct way to enumerate** — do not go looking
  for a bulk route.
- **The brand line card is dead.** `Lincoln_Electric__c`, `Oerlikon__c`,
  `Saffro__c`, `Equipment__c`, `Filler_Metals__c` — the SOQL SELECTs all five and
  **every one is `false` on every one of 271 rows.** A published column is not a
  code. Fourth instance in this tier after SKF, Banner and Industrial Scientific.
- **The `has*` flags are not a line card.** `hasRetailCapability` 138T/133F,
  `hasGasAvailable` 46T, `hasServiceCapability` 27T, `hasRentalCapability` 25T,
  `hasEngineCapability` 17T. They describe **what a branch can do, not what it
  stocks.** Never report them as a line card.
- **The only genuine tier field ranks nobody.** `X4_5_Star_Preferred__c` is true
  on **2 of 271 records (0.7%)**.
- **`tabs_raw` is not a code.** It sorts 15 ways and it records **which of our own
  queries returned the row** — a probe artifact of the sampling design. It was
  excluded from both code legs on purpose. Counting it manufactures a signal.
- **The 5 net-new domains are a fragile count and were reported as one.**
  `airgas.com` counts only because the pool holds `airgasspecialtyproducts.com`
  and not the apex — and Airgas is a national chain we would strike on sight.
  One domain either way moves the projection by ~9 companies.
- **Chains do not explain the missing websites.** 103 of 271 records (38.0%) are
  chains — Airgas 50, Linde 32, Fastenal 17, Praxair 4 — and website fill is
  essentially identical chain (22.3%) versus non-chain (20.8%).
- **`/store-locator-wtb` is a different dataset.** It is a third-party
  PriceSpider widget (`PriceSpider_Key__c` / `PriceSpider_Url__c`), never loaded.
  If anyone opens it, the whole request pattern is already solved in
  `../indsci [*]/00-README.md` §1 — do not re-derive it.
- **What kind of network this is.** `htownoxygen.com`, `weldstar.com`,
  `youngstownoxygen.com` — welding gas and welding supply, **adjacent to
  industrial MRO rather than inside it.** That is a read on the names, not a
  measurement, and it does not need re-arguing.

## When this session's work lands

1. Update §5 Registry row in `./00-README.md` (status, counts, est. left) and the
   STATUS banner.
2. **RENAME THIS FOLDER** to match the new status — `lincolnelectric
   [NEW-STATUS]` — that is how the founder reads readiness from the directory
   listing. Use `IN-PROGRESS` if you stopped before the plan completed.
   `PROBED-FAILED` stands if the wholesale tab adds under 20 projected net-new.
3. Sync the pack registry table in `../00-README.md` (SSOT rule: row first, table
   second).
4. Note the change in `../99-hygiene.md` ONLY if it created files to clean — a
   second sweep will add ~100 cached responses under `_cache/lincolnelectric/`.
