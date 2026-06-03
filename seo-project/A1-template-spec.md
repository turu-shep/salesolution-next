# A1 Framework Template — Spec

**Purpose:** Downloadable artifact embedded in A1 post. Drives the `b2b marketing strategy framework template` modifier query (5 imp/quarter, high commercial intent) and acts as a real lead-capture artifact.

**Format:** Google Sheets (primary) + PDF print version (mirror)
**Distribution:** Free download. Email gate optional — recommend **no gate** for the public template, gated upgrade ("the filled-in worked example") as the lead magnet.

---

## Why a real template matters

Every competitor B2B framework post sends users to a generic blog conclusion. None ship a real usable artifact. Shipping one:

1. Earns the modifier query
2. Closes the buyer journey loop (read → use → realize gap → engage)
3. Generates backlinks (people link to templates more than to articles)
4. Demonstrates the same Sale Solution principle: "engineered artifacts, not opinions"

---

## Template structure (Google Sheets — 8 tabs)

### Tab 1: README / How to use this template

- 1-page instructions (text-only sheet)
- 7 steps named with cell links to their tabs
- Reading order
- "When to revisit" cadence (quarterly)
- Credit line: "Built by Sale Solution — salesolution.net"
- Last updated date (auto-fill)

### Tab 2: Step 1 — Market Research + Demand Signals

| Column | Type | Example |
|--------|------|---------|
| Customer segment | text | Hydraulic fittings buyers — procurement engineers |
| Annual deal size band | text | $50k–500k |
| Top 5 buyer questions | text × 5 | "What's the working pressure of a JIC-NPT adapter?" |
| Primary search source | enum | Google / ChatGPT / Perplexity / Internal procurement / Trade catalogs |
| AIO presence on top questions | enum | High / Medium / Low / Unknown |
| Demand signals (last 12mo) | text | "+18% in technical-spec queries; -22% on 'best X' commoditized queries" |
| Confidence | enum | High / Medium / Low |

5 row capacity (5 customer segments).

### Tab 3: Step 2 — Goal Setting + KPI Architecture

Two sub-tables:

**Revenue / pipeline goals:**
| Goal | Year 1 target | Year 2 target | Current baseline | Owner |

**KPI architecture (post-AIO):**
| KPI category | KPI name | Definition | Target | Measured via | Reporting cadence |
| Leading | AIO citation share | % of target queries where we're cited in AIO | 25% | Manual SERP audit + Brandwatch | Monthly |
| Leading | Schema completeness rate | % of pages with required schema | 95% | Sitebulb / manual | Monthly |
| Lagging | Qualified leads from organic | MQL count attributed to organic | 40/mo | GA4 + form | Weekly |
| Lagging | Revenue from organic | ARR attributable to organic | $1.2M | CRM + analytics | Quarterly |

Pre-fill 8–10 standard B2B KPIs as starter rows.

### Tab 4: Step 3 — Brand Positioning + Citation Stance

| Field | Type | Example |
|-------|------|---------|
| Positioning statement (one sentence) | text | "The only operator-led GEO consultancy specialized in industrial e-commerce." |
| Who we ARE for | text | "Industrial distributors $200k+/mo with technical buyers" |
| Who we are NOT for | text | "DTC brands, B2C ecom, SaaS products under $50k ACV" |
| Citation stance | text | "We want to be the cited source for: AIO/industrial schema, B2B citation engineering, GEO measurement" |
| Top 3 citation-worthy claims | text × 3 | "We've moved X clients from pos 60+ to top 10 on Y query class" |
| Proof points behind each claim | text × 3 | Case study URL, metric, date |
| Differentiators (vs competitors) | text × 5 | Per the published list in CONFIG/site copy |

### Tab 5: Step 4 — AI-Search & GEO Strategy

This is the differentiator step. Structure:

**Section A — Query inventory:**
| Target query | Current AIO trigger? | Current cited sources | Our citation goal | Status |

**Section B — Schema audit:**
| Schema type | Required for | Implemented? | Last verified | Notes |
| Product | All product pages | ☐ | — | — |
| FAQPage | Pillar posts, services | ☐ | — | — |
| HowTo | Tutorial / step posts | ☐ | — | — |
| Article + BlogPosting | All blog | ☐ | — | — |
| Organization | Site-wide | ☐ | — | — |

**Section C — AIO-ready content checklist:**
- ☐ Direct-answer block at top of each pillar
- ☐ Question-format H2s on FAQ-style pages
- ☐ Specifications and tables (AI parses these well)
- ☐ Author/expertise signals (E-E-A-T)
- ☐ Citation sources / external authoritative links

### Tab 6: Step 5 — Tactical Execution + Channel Mix

**Channel allocation table:**
| Channel | Tier (primary/secondary/test) | Budget % | Monthly target | Owner | Cadence |
| Organic content (blog + guides) | Primary | 35% | 4 posts | — | Weekly |
| SEO/GEO technical work | Primary | 25% | 8 hrs | — | Weekly |
| YouTube technical | Secondary | 15% | 2 videos | — | Bi-weekly |
| LinkedIn authority | Secondary | 10% | 3 posts | — | Weekly |
| Industrial marketplaces (Thomasnet, GlobalSpec) | Test | 10% | 1 listing optimization | — | Monthly |
| Outbound email | Test | 5% | 1 sequence | — | Quarterly |

Pre-fill 6 channels matching Sale Solution's actual mix.

### Tab 7: Step 6 — Measurement + Citation Tracking

Monthly tracker — one row per month, one column per KPI from Tab 3:

| Month | AIO citation share | Schema completeness | Qualified leads | Revenue from organic | Avg position (target queries) | Notes |
| 2026-05 | 12% | 78% | 18 | $40k | 38 | Baseline |
| 2026-06 | — | — | — | — | — | |
| ... | | | | | | |

12-month roll.

### Tab 8: Step 7 — Adaptation + Quarterly Review

**Quarterly review structure (one block per quarter):**

| Field | Q1 | Q2 | Q3 | Q4 |
| What worked | text | text | text | text |
| What didn't | text | text | text | text |
| Reallocation decisions | text | text | text | text |
| Next quarter focus (top 3) | text | text | text | text |
| Framework version updates | text | text | text | text |

---

## Color and styling

Match Sale Solution brand palette:
- **Header rows:** background `#050C23` (dark band from site), text `#FFFFFF`
- **Section dividers:** `#2652EF` (primary brand blue) accent stripe
- **Body cells:** background `#FFFFFF`, text `#404040`
- **Editable cells (placeholders):** light yellow background `#FAF8E7` to indicate "fill me in"
- **Pre-filled examples:** italic, gray text `#737D9D`
- **Status enums:** color-coded data validation (High = green, Medium = amber, Low = red)

Font: Inter (matches the live site secondary type).

---

## PDF print version

Mirror of the Google Sheets content as a 10–12 page printable PDF:
- Cover page: title + version + last updated + "by Sale Solution"
- One page per step (8 pages total)
- Final 2 pages: "How to use this template" + "Engage Sale Solution"
- Print-friendly: A4, no color-blocking that fails on greyscale, page numbers

Tool to produce: Canva or Figma. Spec'd as: a Notion-doc-style minimal layout, brand-blue accent header per page, monospace eyebrow above each step title (matching site `.font-mono.uppercase.tracking-[0.18em]` style).

---

## File naming convention

- Google Sheets master: `B2B Marketing Strategy Framework Template — Sale Solution.gsheet`
- Public-view URL: `salesolution.net/templates/b2b-marketing-strategy-framework/` *(decision: create a `/templates/` collection in Sanity, or host as static asset?)*
- PDF print: `b2b-marketing-strategy-framework-template-2026.pdf`
- Public download: `salesolution.net/downloads/b2b-marketing-strategy-framework-template.pdf`

---

## Lead-capture decision (Artur to decide)

**Option A — Ungated download.** PDF available directly. Higher download volume, no leads captured.

**Option B — Email gate on PDF.** Email required for PDF download. Lower download volume, lead capture.

**Option C — Hybrid (RECOMMENDED).** PDF ungated (drives backlinks + value-first signal). The "filled-in worked example" version — the same template with the hydraulic-fittings worked example filled in — is gated by email. Best of both: free template earns links, filled example captures leads.

---

## Production checklist (when ready)

1. ☐ Artur creates the Google Sheets file from this spec
2. ☐ Artur designs the PDF mirror (Canva/Figma per styling notes above)
3. ☐ Decide hosting path (Sanity `/templates/` collection vs static asset)
4. ☐ Decide lead-capture path (A/B/C above)
5. ☐ Update A1 draft body to embed: "Download the template (Google Sheets)" + "Get the PDF version" links
6. ☐ Update post schema to include the template as a `mainEntity` if hosting on its own URL

This template is not blocking the A1 draft — the draft can ship with placeholder links and the template lands in a fast follow.
