# 02 · Who we target

**Created:** 2026-07-28 · **Owner:** Artur · **Status:** ready to run, gated on G1 (Apollo paid key)

The list is the campaign. Copy fixes a bad reply rate by a point or two; the wrong list can't be fixed by anything. This file is the recipe, literally — the JSON below is what `scripts/apollo-pull.mjs` posts.

---

## 1. The common ICP

**Owner, president, or CEO of a US industrial distributor or technical manufacturer, $5M–$75M revenue.**

They wear the growth hat among five others. They are not trained marketers. Their customers are engineers, maintenance, and procurement, searching by part number, spec, model, and cross-reference. AI literacy: they've heard of ChatGPT and they've seen Google's AI answers.

Two business types, both in scope: **multi-brand distributors** (hundreds of brands, tens of thousands of SKUs, want to be named over the manufacturer and over Amazon) and **manufacturers** (want to be found direct, by spec and model).

**Revenue is not an Apollo filter.** Apollo returns `annual_revenue` on a result but will not filter on it. *[playbook]* The proxy is `organization_num_employees_ranges: ["15,150"]`, which approximates $5M–$75M for this industry shape, and then **every row gets post-filtered on the returned `annual_revenue`** before it enters the sequence. The employee range is the pull; the revenue field is the qualifier. A row with no revenue returned goes to a `needs-review` bucket, not to the sequence.

---

## 2. The three segments, in priority order

### Segment A — Fluid power and hydraulics distributors

Hose and fittings, pneumatics, hydraulic components. The Parker / Enerpac / Rexroth world. This is Angle 2's natural home: the line card is long, brand resonance is strongest, and expansion deals live here. Highest priority, first pull, first sends.

```json
{
  "person_seniorities": ["owner", "founder", "c_suite"],
  "person_titles": ["Owner", "President", "CEO", "Chief Executive Officer", "Managing Partner"],
  "person_locations": ["United States"],
  "organization_num_employees_ranges": ["15,150"],
  "q_keywords": "fluid power hydraulics hose and fittings pneumatics",
  "per_page": 100,
  "page": 1,
  "reveal_personal_emails": false
}
```

### Segment B — Bearings and power transmission distributors

Bearings, motors and drives, belts. Same line-card structure as A, same expansion logic, slightly less brand drama in the AI answers.

```json
{
  "person_seniorities": ["owner", "founder", "c_suite"],
  "person_titles": ["Owner", "President", "CEO", "Chief Executive Officer", "Managing Partner"],
  "person_locations": ["United States"],
  "organization_num_employees_ranges": ["15,150"],
  "q_keywords": "bearings power transmission motors and drives belts",
  "per_page": 100,
  "page": 1,
  "reveal_personal_emails": false
}
```

### Segment C — General MRO and industrial supply with a live e-commerce catalog

The broadest pool and the loosest fit. Qualify hard on a **visible catalog of ≥1,000 SKUs**. **Angle 1 only** until G3 clears Angle 2 — a general MRO house doesn't have the line-card structure the expansion pitch depends on.

```json
{
  "person_seniorities": ["owner", "founder", "c_suite"],
  "person_titles": ["Owner", "President", "CEO", "Chief Executive Officer", "Managing Partner"],
  "person_locations": ["United States"],
  "organization_num_employees_ranges": ["15,150"],
  "q_keywords": "industrial supply MRO industrial distributor industrial products",
  "per_page": 100,
  "page": 1,
  "reveal_personal_emails": false
}
```

`q_keywords` is undocumented in Apollo's public API reference but implemented and working. *[playbook]* Verify on the first pull that it actually narrows the result set; if it silently no-ops, the segments collapse into one pool and the fallback is industry codes plus manual triage.

---

## 3. Secondary titles

Only when the owner or president genuinely can't be found, **or** when the company is above roughly 75 employees and the owner is unlikely to read cold mail:

```json
{ "person_titles": ["VP Sales", "Vice President of Sales", "General Manager", "Ecommerce Manager", "E-commerce Manager"] }
```

Owner titles reply at **7.63%** versus **4–5.8%** campaign-average *[playbook]*, so a secondary title is a downgrade, not an equivalent. One secondary contact never replaces a findable owner — it substitutes for one. Never pull both and count them as two.

---

## 4. Disqualifiers

| Disqualifier | Why | Handling |
|---|---|---|
| Under $5M revenue | The floor is real. Setup cost doesn't amortize and they're better served by a SaaS tool. | **Disqualify gracefully** — capture the email for the free-fixes one-pager. That's how a disqualification becomes a referral. |
| Under 200 SKUs visible | Nothing to rewrite. | Drop. |
| Marketplaces, pure Amazon sellers | No catalog of their own to own. | Drop. |
| Non-US | CAN-SPAM scope, GDPR/PECR exposure, and no fit with the offer's delivery formats. | Drop at pull time via `person_locations`. |

**Not disqualifying: an existing agency or an in-house marketing person.** Approved counters already exist for both (C1 and C2 in the objection library). A prospect with an agency has already decided this category is worth money.

---

## 5. Packing rules

**1–2 contacts per company, hard cap.** 1–2 contacts per company reply at **7.8%**; ten or more drops to **3.8%**. *[playbook]* The second contact is only worth pulling when it's a genuinely different reader (owner + e-commerce manager), never two peers.

**Micro-campaigns of ≤50 contacts.** Campaigns at or under 50 contacts reply **2.76× higher** than large ones. *[playbook]* Every send batch is packed to ≤50, grouped by segment and angle so the observation slot stays consistent within a batch. A 1,500-contact list is therefore 30+ micro-campaigns, not three big ones. This is a real operational cost and `05-automation-pipeline.md` stage 6 accounts for it.

**Overpull 2–3×.** Verification and dedupe cull 30–40%, and post-filtering on revenue culls again. Pull 2,500–3,500 raw to seat 1,400–2,000. Pull per segment, not in one blended query, so a weak segment is visible before it's diluted.

**SKU count is the deal-size lever.** Between two otherwise-equal prospects, the one with the visibly larger catalog or the longer line card is worth more at the same reply rate — a 10,000-SKU expansion is $30K, a 2,000-SKU Standard job is $6K. *[catalog pricing]* (See the volume-break flag in [`01-goal-math.md`](01-goal-math.md) §2 — 10,000 sits exactly on the published break and could price at $25K.) The scan in stage 3 estimates listed SKUs per prospect; use it to order the send queue, not just to write the email. Segment A prospects with long line cards go first.

---

## 6. Lineage — required on every row

CAN-SPAM requires that we can say where a contact came from and when. *[playbook]* Every row in the list CSV carries, at minimum:

| Column | Example | Why |
|---|---|---|
| `source_url` | `https://app.apollo.io/#/people/<id>` or the prospect's own site URL the address was confirmed against | Proof of origin per contact |
| `pulled_at` | `2026-08-03` | Freshness and retention window |
| `source_provider` | `apollo` | Licensed-provider data, used within ToS |
| `segment` | `A` | Kill/scale attribution in stage 8 |
| `verify_state` | `ok` | Bounce budget defense |
| `annual_revenue` | `12000000` | The post-filter that Apollo won't do |

Three standing rules that go with it: **`reveal_personal_emails` stays off** — no personal-email harvesting; **licensed-provider data is used within ToS and never shared or resold**; and a row with no `source_url` never enters a sequence, no matter how good the contact looks. *[playbook]*
