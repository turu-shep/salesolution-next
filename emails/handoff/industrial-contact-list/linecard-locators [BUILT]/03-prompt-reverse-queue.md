# linecard-reverse — probe the 29, but read §1 before you get excited

Your mission: take the ranked manufacturer queue this workstream produced from
406 cached distributor pages, probe the top names the same way the first six
were probed, and close each one with a number.

## 1. Read this first — the queue is free, not promising

Every previous session that touched a locator tier over-estimated it, so here
is the honest prior before you spend a day:

- **E4 built eight locators and every one failed its own ≥150-net-new rule.**
  Walter returned 4,991 companies with **0% domains**. SKF's main US feed has
  zero websites. Pepperl+Fuchs has no US distributors at all.
- **Four of the top names on this queue** — Balluff, Turck, Omron, Sick — sit
  in exactly the automation/sensor tier where Banner and Pepperl+Fuchs measured
  worst.
- **Siemens and ABB are the two highest-frequency names and both are
  electrical**, which E2 measured as skewing **above the $75M ceiling**. High
  frequency here means "our distributors mention them a lot", not "their
  dealers are our buyer".
- **The ranking is biased by construction.** The 406 pages are a SERP-selected
  sample from the self-identification play, so brands we searched for rank
  highest. Read the order as relative interest inside a biased sample.

**What the queue actually is: free and ordered.** Nobody has to guess which
manufacturer to try next. That is its whole value, and it is enough.

## 2. Read in order

1. `../00-README.md` — the pack index and the new-source rule.
2. `./00-README.md` §4 — where this queue came from and what it is not.
3. `./02-probe-log-2026-08-03.md` **§2 (the decision rule, committed before the
   first fetch)** and **§6g (how the queue was built, including the negative
   result)**. §2's bands bind this session too — do not re-derive them.
4. `../../strategy/01-build-plan.md` §5a, **§5h**, §5i ·
   `../../strategy/00-sourcing-strategy.md` §7.1.
5. `../e4-headless-locators [*]/00-README.md` §2 — the measured table of what a
   locator tier actually returns. This is the reality check.

Source data: `emails/data/raw/linecard-reverse-2026-08-04.json`
(`queue_unassessed`, 136 names; `all_brands`, 196).

## 3. The work

### Step 1 — pick the ten worth a probe, and say why the others are not

The 29 clean names ranked by how many of our own distributors name them:

| Brand | Pages | Segment note |
|---|---|---|
| Siemens · ABB | 19 · 18 | automation/electrical — **above-ceiling risk (E2)** |
| SMC · Clippard · Camozzi | 9 · 6 · 5 | **pneumatics — Segment A, thin since Parker was lost** |
| Graco | 9 | fluid handling / finishing |
| Balluff · Turck · Omron · Sick | 7 · 6 · 6 · 4 | sensors — **the tier that measured worst** |
| Dwyer · Ashcroft · Wika | 6 · 5 · 3 | instrumentation |
| NSK · Sealmaster · Sumitomo · Fenner | 5 · 3 · 3 · 3 | **bearings / PT — Segment B core** |
| Grundfos · Gorman-Rupp · Flowserve | 5 · 4 · 4 | pumps |
| Hypertherm · Sandvik · Osborn | 5 · 5 · 3 | cutting / abrasives |
| Hydac | 4 | hydraulics — Segment A |
| Norgren · SEW-Eurodrive · Snap-on | 3 · 3 · 3 | pneumatics · drives · tools |
| DeWalt · Makita | 4 · 4 | **power tools — retail-skewed, probably off-ICP** |

**Choose on segment fit, not on frequency.** Segment A (pneumatics/hydraulics)
is the thin one and the strongest argument for probing at all: SMC, Clippard,
Camozzi, Norgren, Hydac. Write down the ten you pick **and one line on why each
of the other 19 is not worth it** — that list is the deliverable if the probes
disappoint.

### Step 2 — probe exactly as the first six were probed

Reuse, do not rewrite: `_linecard_evidence.py` (robots per serving origin,
RFC 9309 longest match, one honest page GET, transport discovery) then one
query each. Ride `_polite.py`'s posture — ≥3s, one worker, cache everything,
honest UA never rotated, **403 stops that target immediately**.

**Two traps this lane already hit, so you do not have to:**

- **The serving host governs, not the www host.** Ansul died on exactly this —
  its locator is a MetaLocator embed and the vendor host says `Disallow: /`.
  **If a target turns out to be MetaLocator-hosted, it is blocked by R-L3 and
  you stop** unless that gate has been signed since.
- **`_polite.Fetcher` still ladders 5xx.** Some locators answer 500 for inputs
  they cannot parse. Fetch single-attempt on 5xx, the way `cmco.py` and
  `samsonrope.py` do.

### Step 3 — decide against §2's committed bands, and look past domains

Website coverage ≥55% and a plausible network → build-worthy. Below → skip and
record the number. No website field → dead.

**But apply the CMCO correction:** that source scored 12.2% and was still the
most valuable thing this lane produced, because it carried **dealer emails, an
authorization tier and a per-record line card**. Before you close a locator on
domain fill alone, check whether it publishes an email or a tier. A GATE-L6
email source is a real outcome, not a consolation prize.

### Step 4 — anything that survives becomes its own folder

Per the new-source rule: `{token} [{STATUS}]/` with `00-README.md` and
`01-prompt.md`, plus a row in `../00-README.md`. Do not accumulate several
sources inside this workstream folder — `cmco`, `samsonrope` and `ocenco`
each got their own, and that is the pattern.

## When this session's work lands

1. Update §5 Registry row in `./00-README.md` (status, counts, est. left) and
   the STATUS banner.
2. **RENAME THIS FOLDER** to match the new status. Use `IN-PROGRESS` if you
   stopped before the plan completed.
3. Sync the pack registry table in `../00-README.md` (SSOT rule: row first,
   table second).
4. Note the change in `../99-hygiene.md` ONLY if it created files to clean.
