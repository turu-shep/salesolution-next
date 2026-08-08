# Industrial contact list — handoff pack

> **STATUS (2026-08-03):** Index live. The pack is one dashboard handoff, one
> hygiene handoff, and 30 source/workstream folders. Every folder is startable in
> its own session and assumes nothing from the others. No gate is open on this
> index itself; individual folders carry their own.

**How to read this directory.** The directory listing *is* the status board.
Every source is a folder named `{token} [{STATUS}]` — `dfs [DONE-DEEP]`,
`apollo-enrichment [NOT-STARTED]` — so readiness is legible from `ls` without
opening anything. Each folder holds `00-README.md` (what the source is and what
we know) plus the prompt(s) that do the remaining work. Every prompt ends with a
completion ritual whose second step is renaming its own folder, which is what
keeps the titles honest as work lands.

## Prerequisite reading, in order

1. `emails/README.md` — the workspace, the two things that block the first send,
   the dashboard.
2. `handoff/strategy/02-list-guide.md` — which list to open, what the columns
   mean, what is still wrong with them.
3. `handoff/strategy/00-sourcing-strategy.md` §3 (channel stack) and §9
   (decision log — what is already settled and must not be re-litigated).
4. This file — the source registry and the new-source rule.
5. `handoff/strategy/01-build-plan.md` §5 — the measured record. Read the
   subsection for your source. It is 92 KB; nobody needs all of it.

Then open the one file you came for.

---

## What this pack is

The contact list is an asset with a maintenance surface, not a finished
artifact. `handoff/strategy/` records how it was **built**. This pack records
how each piece of it gets **worked further** — one file per source, so a session
can pick up a single source with full context and no archaeology.

Three kinds of file live here:

| File | What it is |
|---|---|
| `dashboard/PROMPT.md` | **Handoff package** (first under `.claude/rules/handoff-packages.md`, 2026-08-08): deploy the client-facing locations dashboard — one URL, per-person logins, Field Advisor ⇄ Hosebox switcher. Paste `dashboard/PROMPT.md`; decision history in `dashboard/specs/` (AMENDMENT 2 wins). |
| `99-hygiene.md` | Storage, duplicates, one unexplained pool swing, one missing manifest. Every deletion is GATE:HUMAN. |
| `{token} [{STATUS}]/` | One folder per source. `00-README.md` is the dossier — what it is, what we pulled, how deep, what is left. `01-prompt.md` is the executable session prompt. The status lives in the folder title. |

A parallel crew owns every `{token} [{STATUS}]/` folder. **This table is the
index, not the authority** — where a per-source dossier and this row disagree,
the dossier is right and this row gets corrected.

---

## Company vs. person vs. sendable

Three numbers. They are not the same number, and conflating them is the single
most expensive mistake available in this workspace.

| | Count | What it actually is |
|---|---|---|
| **Companies** | **23,579** | unique domains across the current generation (35,714 rows total; 9,006 rows carry no domain at all) |
| **People** | **≈772** | named-person records: 11 in `seated-v5` + 138 from the Apollo pilot + 623 from the Adaptall export. Overlap between the three is unmeasured, so the true figure is lower than 772, never higher. |
| **Sendable** | **366** | NeverBounce `valid` among seated rows with an email. The cumulative ledger `data/verify-results.csv` holds 1,566 verifications (422 valid / 289 catchall / 805 unknown / 50 invalid); the extra verdicts are non-seated rows. Scoped to seated, the split is 366 valid / 280 catchall / 770 unknown / 51 invalid — which sums to 1,467 against 1,466 seated emailed rows, a ±1 the dashboard's Phase-1 join must reconcile rather than round away. |

Recon 2026-08-03. Post-recon: S4j (`rollup-rosters`, same day) moved 46 seated
rows to `pool-chains`, and S4k (2026-08-04, the deep pass) moved 1 more (GHX
Industrial, whose row carried a NeverBounce-valid email) → seated fell to
2,735 (`seated-v7`); of the 47 movers, 18 carried an email and 3 were
NeverBounce-valid, so scoped-to-seated sendable is **363**, not 366.
Companies/people counts are untouched (culled ≠ deleted). S4l (2026-08-04,
the AD fold-in) then moved 39 AD-member rows UP from ranked-out across the
cut → seated rose to 2,774 (`seated-v8`); sendable stays 363 (crosser
emails are unverified, new AD rows carry none — AD publishes no email).
S4n (later the same night) re-applied the one retag the fold-in had raced
past — McCarty Equipment, SunSource-via-GHX — so **seated is now 2,773**
(`seated-v9`); 48 roll-up movers total across S4j/S4k/S4n.

"We have 23,579 companies" is true. "We can email 23,579 companies" is wrong by
a factor of 64. Every tile, export and status line in this pack labels which of
the three it is counting. The dashboard's Everything tab shows all three at once
for exactly this reason.

Two related figures that look like they should match and do not: 9,006 rows
carry no domain in the current generation, while the `no-domain-backlog`
workstream scopes 8,156. That reconciliation belongs to `no-domain-backlog/`;
do not paper over it here.

---

## Source registry

31 source rows + 6 workstream rows = 37 handoff folders. 21 source tokens appear
in current-generation data (the rest were harvested, retired, or folded in
without leaving a live token). Of the three workstreams added 2026-08-03,
`equipment-dealers` **executed on 2026-08-04** once Artur signed ICP-EQ and now
holds 2,708 raw records under the bare tokens `bobcat` and `caseih`. ⚠ **Those
two tokens have no folder of their own**, so the new-source rule will raise a
`NEW` badge for each **the moment a fold-in puts them in the list data** — they
are only in `data/raw/` today because no fold-in was run. Whoever runs it either
splits this workstream into `bobcat [*]/` and `caseih [*]/` source folders or
teaches the Sources tab that `equipment-dealers/` covers both. **Do not clear the
badge by editing this row;**
`rollup-rosters` executed later the same day (roster parses under
`data/raw/rollup-rosters/`, no bare source token — it adds zero contacts by
design); `linecard-locators` probed six locators the same day and **built two
of them on 2026-08-04** after Artur signed R-L1 and R-L2.

**Three source rows were added 2026-08-04 out of that build** — `cmco`,
`samsonrope` and `ocenco`. All three have raw data and **zero seated**, so they
will show as `NEW` on the dashboard's Sources tab until they are folded in; the
folders exist, which is what clears the badge. `linecard-locators`' own 2,615
rows stay under `linecard-*` prefixes and are not a source token.

**The lesson those three rows carry is worth reading before you open any of
them, because they split cleanly in two directions.** `samsonrope` is the
textbook pass — 88.3% website, 59 net-new domains, 6.6% chain contamination —
and it carries no authorization signal at all. `cmco` **fails** the §5a
website test outright at 12.2% and is still the most valuable thing the lane
produced, because it publishes **dealer emails, authorization tiers and a
per-record line card**: a GATE-L6 source, not a domain source. **Judging every
locator on domain fill alone would have kept the thin one and thrown away the
rich one.**

**Five source rows were added 2026-08-03 out of the E4 work** — `waltersurface`,
`sullair`, `festo`, `continental`, `skf`. All five have raw data in `data/raw/`
and **zero seated**, so they will show as `NEW` on the dashboard's Sources tab
until they are folded in; the folders exist, which is what clears the badge.

**A sixth was added 2026-08-04** — `pepperlfuchs`, built after GATE R-2 was
signed. It has raw data and zero seated like the others, and it is the tier's
cheapest failure: **4 origin requests, 0 US distributors.** Its one US domain is
`pepperl-fuchs.com`, the manufacturer's own.

Two things they share are worth knowing before you open any of them. **None of
them needed a browser** — E4 was funded as a headless-render tier and the dealer
data turned out to be plain JSON/HTTP on six of eight targets. And **every one of
the six failed the tier's own ≥150-net-new decision rule**, the closest being
Continental at a projected 82. The evidence and the gate record are in
`e4-headless-locators [PART-BUILT]/02-robots-posture-2026-08-03.md`.

`est. left on table` is `—` wherever nobody has sized it. That column is the
per-source handoff's first deliverable, and a guessed number there is worse than
an empty cell.

**SSOT rule:** each source's §5 registry row, inside its own
`{token} [{STATUS}]/00-README.md`, is the source of truth; this table is
regenerated from those rows (last sync 2026-08-03). Edit the dossier, then sync
here — never the other way around.

The `handoff` cells are **inline code, not links**, and that is deliberate: a
folder name carries the status, so it changes whenever work lands. A link would
rot on the first status change; a name you type into `cd` does not.

| token | status | raw rows | seated | last pull | est. left on table | handoff |
|---|---|---|---|---|---|---|
| dfs | DONE-DEEP | 74,578 | 2,437 | 2026-08-04 | ~30k listings across 8 measured specific categories (~$12) — volume, not signal | `dfs [DONE-DEEP]/` |
| serp | DONE-DEEP | 32,439 | 1,046 | 2026-08-01 | ~2,000 domains/wave at ~$3, uncapped | `serp [DONE-DEEP]/` |
| ad | DONE-DEEP | 12,235 | 152 | 2026-08-03 | nothing — pulls exhausted both axes; folded in + ad_member live (S4l 2026-08-04); residue is enrichment of the 24 new ranked-out rows | `ad [DONE-DEEP]/` |
| ptda | DONE-DEEP | 23,105 | 45 | 2026-08-01 | 0 — rollup audited clean 2026-08-03; 3 gated cross-source fixes filed | `ptda [DONE-DEEP]/` |
| timken | DONE-DEEP | 10,031 | 120 | 2026-08-01 | nothing — reopen only if the ICP extends to automotive | `timken [DONE-DEEP]/` |
| enerpac | DONE | 1,475 | 82 | 2026-08-01 | nothing — complete network in one payload | `enerpac [DONE]/` |
| nord | DONE | 1,450 | 81 | 2026-08-01 | nothing — whole network in one payload | `nord [DONE]/` |
| ntn | DONE | 2,468 | 44 | 2026-08-01 | nothing new to fetch; residue is NAP-resolution work | `ntn [DONE]/` |
| spxflow | DONE | 2,157 | 43 | 2026-08-01 | nothing — state grid is exhaustive, curve flat | `spxflow [DONE]/` |
| yaskawa | DONE | 1,248 | 42 | 2026-08-01 | nothing to fetch; 95 W rows need domain resolution | `yaskawa [DONE]/` |
| dorner | DONE | 116 | 37 | 2026-08-01 | nothing — 116 is the whole US network | `dorner [DONE]/` |
| lovejoy | DONE | 1,553 | 35 | 2026-08-01 | nothing — chain-dominated, overlaps Timken | `lovejoy [DONE]/` |
| ballymore | DONE | 1,250 | 31 | 2026-08-01 | nothing — one undecoded category legend | `ballymore [DONE]/` |
| quincy | DONE | 111 | 27 | 2026-08-01 | nothing — matches the server's own US total | `quincy [DONE]/` |
| kennametal | DONE | 387 | 23 | 2026-08-01 | nothing — official export endpoint, complete | `kennametal [DONE]/` |
| banjo | DONE | 437 | 20 | 2026-08-01 | nothing — complete, ag-leaning network | `banjo [DONE]/` |
| gast | DONE-THIN | 21 | 8 | 2026-08-01 | nothing — 21 is the complete US network | `gast [DONE-THIN]/` |
| atlascopco | DONE-THIN | 27 | 4 | 2026-08-01 | unknown, likely 100+ behind the rendered locator (E4) | `atlascopco [DONE-THIN]/` |
| interroll | DONE-THIN | 14 | 4 | 2026-08-01 | nothing — 14 is the published US network | `interroll [DONE-THIN]/` |
| flexlink | DONE-THIN | 6 | 1 | 2026-08-01 | nothing — 6 of 83 partners are US | `flexlink [DONE-THIN]/` |
| mknorthamerica | DONE-THIN | 76 | 0 | 2026-08-01 | nothing — 3 real companies, do not revisit | `mknorthamerica [DONE-THIN]/` |
| matthews | RETIRED | 0 | 0 | 2026-08-01 (403) | 29 known companies, behind Cloudflare — no bypass | `matthews [RETIRED]/` |
| adaptall | RETIRED-TO-LOOKUPS | 1,058 | 1 | 2026-08-01 | lookups only — bulk route declined on identity exposure | `adaptall [RETIRED-TO-LOOKUPS]/` |
| usaspending | FOLDED | 26,964 | 0 | 2026-08-01 | 3,711 unmatched → identity-resolution work, not seating | `usaspending [FOLDED]/` |
| apollo-enrichment | NOT-STARTED | 138 | 0 | 2026-08-02 (pilot) | ~1,300–1,600 named contacts across 2,593 unswept seated domains | `apollo-enrichment [NOT-STARTED]/` |
| waltersurface | DONE-NO-DOMAINS | 12,368 | 0 | 2026-08-03 | nothing to fetch; 2,562 independents carry NO domain → no-domain-backlog input, ~100–170 seatable after resolution | `waltersurface [DONE-NO-DOMAINS]/` |
| sullair | DONE-THIN | 650 | 0 | 2026-08-03 | nothing — 177 companies is the whole published network; 52–60 net-new, 18 in-ICP | `sullair [DONE-THIN]/` |
| festo | DONE-THIN | 119 | 0 | 2026-08-03 | nothing — 51 companies is the whole US network; 24 net-new, ~12 after strikes | `festo [DONE-THIN]/` |
| continental | PROBED-FAILED | 157 | 0 | 2026-08-03 | ~82 projected net-new (likely 55–60 after chain/vertical strikes) — below the 150 bar | `continental [PROBED-FAILED]/` |
| skf | PROBED-FAILED | 92 | 0 | 2026-08-03 | ~44 net-new projected — fails both legs; main US feed has 0 websites/emails | `skf [PROBED-FAILED]/` |
| pepperlfuchs | DONE-NO-US-DEALERS | 214 | 0 | 2026-08-04 | nothing on this source — 0 US distributors, the only US domain is the manufacturer's; live lead is `quotepf.com/wheretobuy` (robots-allowed, unprobed) | `pepperlfuchs [DONE-NO-US-DEALERS]/` |
| indsci | PROBED-FAILED | 74 | 0 | 2026-08-04 | zero usable net-new (5 net-new domains, all chains); ICP feed is 0% websites — but the PriceSpider pattern in its §1 is reusable across brands | `indsci [PROBED-FAILED]/` |
| banner | DONE-THIN | 348 | 0 | 2026-08-04 | nothing — national sweep already ran; 42 genuine net-new independents vs a 150 bar; **R-1 revoke recommended** | `banner [DONE-THIN]/` |
| lincolnelectric | PROBED-FAILED | 271 | 0 | 2026-08-04 | ~44 projected net-new by domain; 21.4% website fill; brand line-card columns all `false`; 5 of 6 tabs unswept | `lincolnelectric [PROBED-FAILED]/` |
| boschrexroth | BLOCKED-UPSTREAM | 0 | 0 | 2026-08-04 | unresolved — endpoint pinned and un-gated, but the `-dev` data tier returns HTTP 500; best code schema in the tier (tier + per-record line card), entirely unproven | `boschrexroth [BLOCKED-UPSTREAM]/` |
| e4-headless-locators | PART-BUILT | 0 | 0 | 2026-08-03 | 2 of 8 blocked on unsigned robots gates (Banner, Pepperl+Fuchs); 4 cleared-but-unbuilt (Continental, SKF, Lincoln, Bosch Rexroth) | `e4-headless-locators [PART-BUILT]/` |
| no-domain-backlog | DONE | 8,156 | 0 | 2026-08-04 (full run) | fold-in of 2,241 recovered (→ ~150–260 seated) + GATE-L2 re-decision on ~3,510 verified-W residue | `no-domain-backlog [DONE]/` |
| ranked-out-backlog | NOT-STARTED | 13,719 | 0 | 2026-08-01 | **+1,577 at score ≥40 · +5,093 at ≥30 — $0, already enriched**; GATE:HUMAN on the cut | `ranked-out-backlog [NOT-STARTED]/` |
| rollup-rosters | DONE | 3 rosters (~140 names) | 0 | 2026-08-04 | re-sweep as roll-ups buy; footer-check rule on every individual read | `rollup-rosters [DONE]/` |
| cmco | DONE-EMAIL-SOURCE | 2,904 | 0 | 2026-08-04 | 212 email-reachable non-chain unseated companies (113 with tier/cert) — GATE-L6 cohort work, not domains; only 16 net-new domains | `cmco [DONE-EMAIL-SOURCE]/` |
| samsonrope | DONE | 200 | 0 | 2026-08-04 | nothing to fetch (17 of 576 queries clipped at the 24-row cap); 59 net-new domains pending the §5i vertical-code sort | `samsonrope [DONE]/` |
| ocenco | DONE-THIN | 11 | 0 | 2026-08-04 | nothing — 11 rows is the complete published network; 1 net-new US domain | `ocenco [DONE-THIN]/` |
| linecard-locators | BUILT | 2,615 | 0 | 2026-08-04 | **220 net-new Flexco domains already captured, fold-in unspent (Artur's call)** + a queue of 136 unassessed manufacturers ranked by how many of our own distributors name them (29 clean, ≥3 pages); the 92-name list itself is exhausted | `linecard-locators [BUILT]/` |
| bobcat | DONE-SEATED-SEPARATE | 2,677 | 0 | 2026-08-04 | nothing to fetch — national index swept; **767 in-band net-new domains SEATED under ICP-EQ-2**, but 75.5% turf/lawn — isolated cohort + new copy required | `bobcat [DONE-SEATED-SEPARATE]/` |
| caseih | PROBED-FAILED | 31 | 0 | 2026-08-04 | 25–57 projected in-band net-new vs a 150 bar (both readings recorded); 61–74% of dealers above the $75M ceiling | `caseih [PROBED-FAILED]/` |
| kubota | DONE-SEATED-SEPARATE | 1,039 | 0 | 2026-08-04 | nothing to fetch — full census, 1,039/1,039; **511 in-band net-new domains, 495 genuinely new** (16 are dual-line dealers already in the Bobcat pull); 98.3% website / 100% phone / 98.9% email; **100% ag/turf, 0% industrial MRO** → same isolated-cohort treatment as Bobcat under ICP-EQ-2 | `kubota [DONE-SEATED-SEPARATE]/` |
| equipment-dealers | PART-BUILT | — | — | 2026-08-04 | **workstream row — the counts live in the three source rows above, not here.** Bobcat DONE-SEATED-SEPARATE · Case IH PROBED-FAILED · Kubota PROBED-PASSED under the signed override. JLG stays excluded (403). | `equipment-dealers [PART-BUILT]/` |

**Status vocabulary**

| Status | Means |
|---|---|
| `DONE-DEEP` | Worked to exhaustion. Reopening costs more than it returns. |
| `DONE` | Worked once, cleanly. More is available; nobody has sized how much. |
| `DONE-THIN` | Ran, returned almost nothing. Either the source is small or the extractor is wrong — the handoff says which. |
| `UNDERWORKED` | Large raw pull, small seated yield. The gap is the opportunity and the per-source handoff owns it. |
| `IN-PROGRESS` | A prompt ran but did not finish. The folder's `00-README.md` says where it stopped. |
| `RETIRED` | Deliberately stopped. Reason recorded; do not restart without reading it. |
| `RETIRED-TO-LOOKUPS` | Not a bulk source any more. Query it per-company when a specific answer is needed. |
| `FOLDED` | Its records live inside other rows as evidence, not as a standalone list. |
| `NOT-STARTED` / `NOT-BUILT` | No data exists. The handoff is a build plan. |
| `PROBED-FAILED` | A bounded probe ran and **failed its own stated decision rule**. The measurement is the deliverable; the sweep was deliberately not run. Reopening means answering a specific named question, not re-running the probe. |
| `DONE-NO-DOMAINS` | Pulled completely and cleanly, but the records carry **no website**. Not seatable as-is — this is input to `no-domain-backlog`, not to the list. |
| `PART-BUILT` | A multi-target workstream where some targets are built, some are blocked on unsigned gates, and some are cleared but unbuilt. The dossier says which is which. |

`seated` counts rows in `seated-v5.csv` attributed to that token. A row's
`source` field is a **pipe chain** — a company found three times carries three
tokens — so these columns sum to more than 2,782. Any cross-source or cross-pool
count must dedupe by domain first. Side pools overlap each other; only the
seated list is exclusive.

---

## Candidates evaluated — 2026-08-03

Five founder-proposed candidates went through source validation. Two are not
sources at all and one is gated on a decision nobody has made; what survived
became the three workstream folders above.

- **`sun-source.com`** — a chain platform (CD&R-owned), not a source. Publishes
  no readable roster on its own site; fetches returned empty bodies — cause
  ESTABLISHED 2026-08-03: a client-side-rendered JS shell, not a block. Its
  subsidiary roster, assembled second-hand and confirmed name-by-name,
  lives in `rollup-rosters [DONE]/`.
- **`unitedcentral.net`** — a SunSource division with 25+ branches, and
  **MIS-SEATED in `seated-v5` as an industrial distributor via `serp`.** The
  mis-seat is **RESOLVED** (2026-08-03): retagged `chain` by S4j, out of
  `seated-v6`. Its clean 92-name supplier list is the whole basis of
  `linecard-locators [NOT-STARTED]/`.
- **United Rentals / Sunbelt / Herc** — rental giants with no third-party
  surface to harvest. Already correctly culled by the existing filters.
  **Closed**, no folder.
- **`ritter`** — resolves to Ritter Technology under Motion & Control
  Enterprises, a Frontenac-owned chain at ~$488M. **Closed** as a source; the
  MCE roster goes to `rollup-rosters`. **Resolved (2026-08-03):** the seated
  row `ritter technology` on `questenginc.com` was MCE either way — Quest
  Engineering is an MCE acquisition (2022-09-01) and Ritter is MCE itself —
  retagged `chain` by S4j and the domain suppressed from cohort-e.
- **`singerindustrial.com`** — an AEA-owned roll-up, 115+ locations, and
  **MIS-SEATED** under the company name `triad bellows design manufacturing`
  — **RESOLVED** (2026-08-03): Triad Bellows is real (`triadbellows.com`) but
  is itself a Singer brand, so both rows retagged `chain`. Its 47-name roster
  plus **dated** press releases is the crown jewel of `rollup-rosters`.

**Send risk: CLOSED 2026-08-03** by the `rollup-rosters` execution. Re-measured
exposure was **9** first-send rows (validation's 7 + `rwconnection.com` +
`texasrubbersupply.com`) and **5** cohort-e rows (the 6th was a name-grep false
positive). All 11 domains are suppressed with per-domain evidence
(`data/suppression/rollup-owned-2026-08-03.csv`), verified out of every batch
and off the Track 1 hand-send sheet; the seated list itself is clean as of
`seated-v6` (S4j). Nothing had sent — both campaigns were still DRAFTED with
zero leads.

---

## The new-source rule

Sources arrive faster than anyone documents them. The mechanism that catches
that is mechanical, not a habit:

**Any `source` token present in the data with no matching `{token} [*]/` folder
in this directory renders a `NEW` badge at the top of the dashboard's Sources
tab.** The match is on the token, not on the status — `dfs [DONE-DEEP]/` and
`dfs [IN-PROGRESS]/` both clear the badge for `dfs`.

That badge is the founder's "tell me when we're pulling from somewhere I don't
know about" signal. It clears exactly one way: create the folder from the
template below — `{token} [{STATUS}]/` with its `00-README.md` and its
`01-prompt.md` — and add its row to the registry table above. There is no
dismiss button, and adding one would defeat the point.

The inverse is fine and deliberate: a handoff folder with no data token is a
planned source that has not run yet (`apollo-enrichment`,
`e4-headless-locators`). Those show as `PLANNED`, not `NEW`.

### Per-source folder template

A source is a **folder**, not a file:

```
{token} [{STATUS}]/
├── 00-README.md     the dossier — five sections, always in this order
└── 01-prompt.md     the executable session prompt
```

The folder name carries the readiness state, uppercase inside square brackets,
one space before the bracket. That is how the founder reads the pack without
opening it, and it is the reason every prompt's last instruction is to rename
its own folder.

More than one prompt is allowed when the work genuinely splits into runs that a
session would take on separately — `apollo-enrichment` carries
`01-prompt-org-revenue.md` and `02-prompt-people.md` because revenue-for-the-dashboard
and people-for-sending are different jobs with different gates. Number them in
the order they would normally run.

Copy this into `{token} [{STATUS}]/00-README.md` and fill it. Five sections, in
this order, every time — a session that opens two of these should not have to
re-learn the shape.

````markdown
# {token} — source handoff

> **STATUS (YYYY-MM-DD):** {DONE-DEEP|DONE|DONE-THIN|UNDERWORKED|IN-PROGRESS|RETIRED|NOT-STARTED}.
> {One sentence: what a session picking this up walks into.}
> {Gates, if any: "GATE:HUMAN — robots posture unsigned." Otherwise: "No gates."}

Prompts in this folder: `01-prompt.md` — {half a line on what it does}.

Prerequisite reading, in order: {the strategy and build-plan sections this
source depends on, with paths relative to this folder — `../../strategy/…`,
`../../../research/…`}.

## 1. What it is

What the source publishes, who runs it, and why it is in this program at all.
Access shape: open JSON / static HTML / ASP.NET postback / headless-only.
Robots + access posture, stated plainly. Login, CAPTCHA and 403 walls are
excluded by policy; robots.txt alone is not (Artur's override 2026-08-01,
strategy §7.1).

## 2. What we pulled

| | |
|---|---|
| Raw rows | |
| Unique domains | |
| Seated (`seated-v5`) | |
| Routed to pools | {disposition: n, …} |
| Last pull | |
| Extractor | `emails/scripts/…` |
| Raw artifacts | `emails/data/raw/…` |

Provenance is 100% filled on every current file — `source`, `source_url`,
`captured`. Say if this source is an exception. It should not be.

## 3. How deep we went

What was swept and what was not: which queries, which geographies, which
divisions, which pages. The unswept axis is the whole point of the next
section, so be specific about the edge of the sweep.

## 4. What's left on the table

The estimate, with the arithmetic that produced it. If nobody has sized it,
write "unsized" — never a placeholder number. Name the constraint: query
budget, render tier, rate limit, or the source simply being small.

## 5. Registry row

The row this folder claims in `../00-README.md`. Update both together. **The
last cell is the bare folder path `{token}/`** — token only, no status — because
the status is already in column 2 and duplicating a mutable value into two cells
of the same row is how they drift apart. All 30 dossiers use this exact form and
the Sources tab parses it.

```
| {token} | {STATUS} | {raw} | {seated} | {last pull} | {est. left} | {token}/ |
```
````

And this into `{token} [{STATUS}]/01-prompt.md`. The work plan lives here, not
in the dossier — the dossier is what is known, the prompt is what to do:

````markdown
# {token} — {what this session is for, in four or five words}

Your mission: {the whole job in one sentence}.

## Read first, in order

1. `../00-README.md` — the pack index: the source registry, the
   company/person/sendable distinction, and the new-source rule.
2. `./00-README.md` — this source's dossier.
3. {the specific strategy / build-plan / research sections, by section number,
   with a half-line on why each one matters}

## The work

{Numbered steps a session can execute, with scripts, paths, batch limits and
expected yield. State batch limits BEFORE any billed run — queries, credits,
ceiling. Restate every **GATE:HUMAN** inline at the step it blocks, with the
question being asked and the default if nobody answers.}

{For a DONE / RETIRED / FOLDED source this section is a short reopen check
instead: name the reopen condition, test whether it now holds, report, and STOP
if it does not.}

## When this session's work lands

1. Update §5 Registry row in `./00-README.md` (status, counts, est. left) and
   the STATUS banner.
2. **RENAME THIS FOLDER** to match the new status — `{token} [NEW-STATUS]` —
   that is how the founder reads readiness from the directory listing. Use
   `IN-PROGRESS` if you stopped before the plan completed.
3. Sync the pack registry table in `../00-README.md` (SSOT rule: row first,
   table second).
4. Note the change in `../99-hygiene.md` ONLY if it created files to clean.
````

That closing section is the **completion ritual**, and it is mandatory on every
prompt in the pack. Without step 2 the directory listing lies, which is worse
than not having statuses in the titles at all.

---

## Conventions

- **GATE:HUMAN** on exactly three classes of decision: robots-posture changes,
  credit spend, and deletion of any data file. Everything else is autonomous.
  A gate is a line in the file that says what is being asked and what the
  default is if nobody answers — not a pause with no written question.
- **Batch limits stated before billed runs.** Queries, credits and hard ceiling,
  written down before the first request, not after the invoice.
- **No invented numbers.** `—` is a legitimate cell. A plausible-looking
  estimate with no arithmetic behind it is worse than an empty one, because the
  next reader cannot tell them apart.
- **Projections: quote the baseline-share method as a FLOOR, not an estimate.**
  Measured twice on 2026-08-04 against a completed census, and it undershot both
  times — **Bobcat 1.9×–2.1×, Kubota 2.38×.** The bias is structural, not noise:
  scaling by *our* pool's share of a probe area assumes the source's dealers are
  distributed like `deduped-v7`, and `deduped-v7` is metro-skewed industrial
  distribution. Kubota's three probe circles held **15.85% of our geocoded
  baseline but only 6.45% of Kubota's own dealers**, so the divisor was 2.5× too
  large. **Where a source publishes a national denominator, one control query
  gets it** — that method predicted 527 against an actual 511, accurate to 3%.
  Prefer it; keep baseline-share as the conservative floor. Both predictions were
  recorded *before* the census ran, so this is a test rather than a retrofit.
- **Culled ≠ deleted.** Disqualified records get a `disposition` and land in
  `data/side-pools/`. `pool-small-shops` is reserved for Artur's separate
  small-shops project; `pool-adjacent-trades` is a second, unclaimed project.
- **Project separation is disposition → file.** There is no `project` or `owner`
  column anywhere. The routing map lives in `emails/scripts/s4-merge-rank.mjs:93`
  and `emails/scripts/s4d-seat.mjs:99`. Per-project state goes in overlay files
  (`emails/data/projects/{name}/`), never in the master CSVs.
- **Schema drift is real.** Generations run 23 → 56 columns.
  `scripts/lib/dashboard-data.mjs` is column-tolerant; new consumers are not
  unless they are written that way. See `99-hygiene.md` H5.
- **Size proxies are not revenue.** `size_band`, `location_count`,
  `sku_estimate`, `size_score`, `review_count`, `brand_count`. No revenue or
  employee column exists anywhere in this data. Label them "size proxies;
  revenue data does not exist yet" and never render a tile called "revenue" off
  them.
