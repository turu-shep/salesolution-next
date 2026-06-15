# Research Backlog & Write-Down Queue

**Created:** 2026-06-12 · Keep this file current — strike items when done, date the strikes.

---

## 1. Ahrefs pulls — DONE 2026-06-14 (914 units spent)

Results folded into [01-assessment.md](01-assessment.md) §1 + §3a and
[05-glossary.md](05-glossary.md). Summary:

- [x] ~~GEO-cluster volumes + KD~~ — **done.** Role/career terms near-zero (geo specialist
      40, citation engineering 0); concept terms substantial and partly low-KD (AEO 3,700/KD
      31, ai visibility 3,300/KD 25, ai share of voice 150/KD 8). Kill criterion did NOT
      fire — glossary becomes the lead asset.
- [x] ~~Legacy URL backlinks~~ — **done. Both = 0 backlinks / 0 refdomains** (live +
      all-time). "Pre-existing equity" is dead; slug-level redirects moot.
- [x] ~~Site baseline~~ — **done. DR 10, 0 organic keywords, 0 traffic**, but **252 live
      refdomains / 380 backlinks** (link substrate exists, passes no ranking value yet).
- [x] ~~Glossary-term volumes~~ — **done** (table in [05 §0](05-glossary.md)).
- [ ] **Brand Radar setup** — NOT done (left to conserve quota; measurement-config task).
      → Now tracked in Linear **SAL-406** (project SS SEO), since it serves brand-wide AI
      visibility, not just the hub. The hub-specific prompts ("what is citation
      engineering") are listed on that ticket.

### Non-career-path items → moved to Linear (project SS SEO)
These surfaced here but are operational SEO, not career-path content. Tracked in Linear so
this doc stays focused on the hub:
- **SAL-404** — Target "geo agency" (1,300 vol, KD 15, commercial) on /services/ai-seo.
  Most revenue-relevant keyword found; a service page, NOT the learning hub.
- **SAL-405** — Connect GSC + install web analytics (nothing on the site is measurable).
- **SAL-406** — Set up AI-visibility / Brand Radar tracking.

## 2. Measurement prerequisites (no quota needed — do anytime)

- [ ] **GSC + web analytics** — tracked in Linear **SAL-405** (general site infra). Without
      it the hub is unmeasurable by definition.
- [ ] Exclude `/career-paths/*` and `/glossary/*` from conversion goals and retargeting
      pools before any content ships (junk-traffic rule, [02 §6](02-scope-and-positioning.md)).
      *(Career-path-specific — stays here, do it when content ships.)*

## 3. Decisions needed (Artur)

- [x] ~~**Talent stance**~~ — DECIDED 2026-06-14: **keep "we don't hire from these paths."**
      Hub is pure authority/citation; no freelancer reframe, no rates page. ([02 §4](02-scope-and-positioning.md))
- [ ] **First-party annual artifact**: commit or not to a small yearly dataset (e.g. "SEO &
      AI-search roles in industrial distribution: rates & tooling census"). It is the only
      link-compounding mechanism in the evidence — but it's a yearly commitment, not a page.
- [ ] **Glossary URL**: confirm top-level `/glossary/` (recommended in
      [06-wiki-architecture.md](06-wiki-architecture.md)) vs nesting under the hub.
- [ ] Approve Sanity schema deltas ([06 §2](06-wiki-architecture.md)).

## 4. Write-down queue (content, in order)

| # | Item | Notes | Effort guess |
|---|------|-------|--------------|
| 1 | **GEO Specialist path** | ✅ Drafted 2026-06-14 (`scripts/seed-career-paths.mjs`) — review/voice/publish in Studio | done |
| 2 | **Citation Engineer path** | ✅ Drafted 2026-06-14 — review/voice/publish | done |
| 3 | **SEO Specialist path** (originally promised) | Industrial e-commerce flavor; uses new schema (matrix, buyer section, related terms) | 8–15 h |
| 4 | **Content Strategy Specialist path** (originally promised) | Same structure | 8–15 h |
| 3 | **Glossary P0 batch** (~15–20 terms from [05-glossary.md](05-glossary.md)) | 🟡 System built + **10 drafts seeded** (`scripts/seed-glossary.mjs`, 2026-06-14). NEXT: review/voice/publish in Studio; add ~5 more to clear the 15-term hub-index threshold | ~1 h/term |
| 4 | **Citation Engineer role page** | The coining move: definition-first, evidence from real postings, buyer section. Glossary term + path can ship together | 6–10 h |
| 5 | **GEO Specialist path** | P0 lane lead; gated on June-14 sizing only for depth, not existence | 8–15 h |
| 6 | Buyer-side one-pager: "Hiring for AI search at a distributor: roles, costs, build vs buy" | Synthesizes all buyer sections; the one career-hub artifact aimed squarely at buyers; candidate for sales collateral | 4–6 h |
| 7 | (If committed) First-party rates/tooling census v1 | Survey freelance network + public postings; publish as the annual citable artifact | scoped separately |

## 5. Open research questions (background, no deadline)

- Do industrial distributors actually hire these roles in-house at any frequency?
  (One data point so far: Caterpillar's AI SEO/GEO Specialist posting. The roles research
  in [03-roles.md](03-roles.md) adds postings evidence — extend it quarterly.)
- Track whether "citation engineering" gets adopted/contested by anyone else —
  quarterly search + Brand Radar once configured.
- Watch whether Coursera/Indeed/Semrush move into GEO-career content (the open lane will
  not stay open forever; their entry changes P0 calculus).
- HCU/topical-dilution check after 6 months of hub content: does GSC show any drag on the
  commercial pages? (Needs GSC reconnected first.)

## 6. Hygiene (this week)

- [x] ~~Strategy documented~~ (2026-06-12, this folder)
- [ ] Publish paths #1–2 **or** set `noindex` on `/career-paths/` until they ship —
      the live empty hub promising "this quarter" is a standing credibility cost.
- [ ] Update hub copy if the quarter slips.
