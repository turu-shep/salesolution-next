# GEO content architecture + 8-week build plan

*Created 2026-06-17. Grounded in DataForSEO US keyword data pulled the same day.*
*Linear home: project **Content Crush — Salesolution** (team SAL), issues **SAL-408 → SAL-431**.*

## The bet

Sale Solution is DR ~10. It cannot win established SEO/PPC/CRO terms — those are KD 70+ and owned by high-authority sites. But the **GEO / AI-search knowledge space has no authority owner yet**, and even its *commercial* terms sit at KD 2–11. So the strategy: **claim the GEO category, then spend that earned authority to pull the money pages into AI answers.** GEO is the spine; the three verticals (industrial, home-services, dental) are the example/proof layer.

Don't build SEO, paid ads, or CRO as pillars. Touch them only at the seam where they bridge into the thesis:
- **SEO** → only the transition ("AI Overviews ate my clicks", "GEO vs SEO", "is SEO dead"). Never generic SEO tips.
- **Paid ads** → only the "engine vs fuel" foil (Revenue Engine). Never PPC tutorials.
- **CRO** → only the Revenue Engine's speed-to-lead / lead-leakage story. Never generic landing-page CRO.

## The decisive data (DataForSEO, US, 2026-06-17)

The category is young enough that buyer-intent terms are cheap to win:

| Term | Vol | KD | Intent | CPC |
|---|---|---|---|---|
| ai seo agency | 1,000 | 8 | commercial | $44 |
| generative engine optimization services | 590 | 6 | commercial | $44 |
| aeo agency | 390 | 3 | navigational | $54 |
| generative engine optimization agency | 320 | — | commercial | $99 |
| generative engine optimization tools | 480 | 4 | informational | $39 |
| answer engine optimization tool | 320 | 3 | commercial | — |
| ai search visibility tool | 1,000 | 8 | commercial | $31 |
| ai visibility tools | 1,300 | 16 | commercial | $34 |
| geo vs seo | 2,900 | 26 | informational | — |
| aeo vs seo | 1,600 | 27 | commercial | — |
| is seo dead | 880 | 27 | informational | — |
| how to rank in ai overviews | 260 | 8 | informational | — |
| ai overviews | 90,500 | 60 | informational | $2 |
| generative engine optimization | 5,400 | 57 | informational | $26 |
| answer engine optimization | 2,400 | 41 | informational | $25 |

Read: the **commercial GEO/AEO/AI-visibility "agency / services / tools" terms are KD 2–16 with $39–116 CPC** — a closing land-grab window. The head terms (ai overviews 90.5k, GEO 5.4k) are KD 57–60: citation magnets, not quick ranks. Traffic comes from the KD 4–27 clusters that hang off them.

## The three-layer model

| Layer | What | Sanity type / URL | Measured on |
|---|---|---|---|
| **Pillar** | Broad authority hub; anchors a cluster | `guide` → `/guides/{slug}` | AI citations |
| **Cluster** | One specific term/question; links up to pillar | `post`/`guide` → `/{slug}` | Traffic + citations (or leads if commercial) |
| **Glossary term** | Short quotable definition, linked inline everywhere | `glossaryTerm` → `/glossary/{term}` | Citations + referring domains |

**Overlap rule:** a concept is a glossary term by default; it graduates to a *cluster* when it has its own search intent, and to a *pillar* when it's a head term that organizes a cluster. A head term can hold both a glossary entry (definition) and a pillar (the full guide) — they interlink, not duplicate.

**Linking:** every cluster links **up** to its pillar; pillars list **down** to clusters; siblings cross-link; every page links inline to glossary terms. That glossary mesh is what makes the hub read as one entity graph to an LLM — the point of the whole thing.

**Glossary is a parallel track** (10–20 terms/week, off the publishing calendar), fed by the term-capture rule on every published piece.

## Pillars → clusters

```
A · Generative Engine Optimization  [gen engine optimization 5,400/KD57]   SAL-408
   ├─ GEO vs SEO 2,900/KD26                                                 SAL-409
   ├─ How GEO works (mechanism)                                            SAL-410
   ├─ Best GEO tools (roundup) 480/KD4                                     SAL-421
   └─ GEO checklist 110/KD54                                               SAL-427
B · Google AI Overviews  [ai overviews 90,500/KD60]                        SAL-414
   ├─ How to rank in AI Overviews 260/KD8                                  SAL-415
   ├─ Why your traffic dropped (zero-click) 720/KD50                       SAL-416
   └─ AI Overviews & SEO / tracking 590/KD20                               SAL-419
C · Answer Engine Optimization  [answer engine optimization 2,400/KD41]    SAL-420
   ├─ AEO vs SEO 1,600/KD27                                                SAL-418
   └─ Best AEO tools (roundup) 260/KD5                                     SAL-422
D · AI Visibility / measurement  [ai visibility 590/KD16]                  SAL-423
   ├─ Best AI-visibility tools (roundup) 1,300/KD16                        SAL-424
   └─ Track brand mentions in ChatGPT 390/KD38                             SAL-425
E · AI SEO / GEO Agency  (MONEY PAGE /services/ai-seo)  [ai seo agency 1,000/KD8]  SAL-411
   ├─ How to choose a GEO agency (+ cost)                                  SAL-412
   ├─ In-house vs agency for GEO                                           SAL-428
   └─ Is SEO dead? 880/KD27                                                SAL-413
Cross-engine: How to show up in ChatGPT & Perplexity 480/KD18              SAL-417
Authority:   Data study "who gets cited in AI Overviews"                   SAL-426
Verticals:   Speed to lead 880/KD23 (Revenue Engine)                       SAL-429
             Manufacturer SEO is now GEO 590/KD4 (industrial)              SAL-430
Proof:       Does GEO actually work?                                       SAL-431
```

## The 8-week calendar (Mon/Wed/Fri, 3/week)

| Wk | Mon | Wed | Fri |
|---|---|---|---|
| 1 (06-22) | 408 Pillar A GEO | 409 GEO vs SEO | 410 How GEO works |
| 2 (06-29) | 411 Pillar E money page | 412 Choose a GEO agency | 413 Is SEO dead? |
| 3 (07-06) | 414 Pillar B AI Overviews | 415 Rank in AI Overviews | 416 Traffic dropped |
| 4 (07-13) | 417 ChatGPT/Perplexity | 418 AEO vs SEO | 419 AIO & SEO / tracking |
| 5 (07-20) | 420 Pillar C AEO | 421 Best GEO tools | 422 Best AEO tools |
| 6 (07-27) | 423 Pillar D AI visibility | 424 Best AI-vis tools | 425 Track ChatGPT mentions |
| 7 (08-03) | 426 Data study | 427 GEO checklist | 428 In-house vs agency |
| 8 (08-10) | 429 Speed to lead (RE) | 430 Manufacturer SEO (industrial) | 431 Does GEO work? (proof) |

Front-loads the low-KD commercial + winnable seam; pillars seed early so clusters aren't orphaned.

## Per-piece pipeline

```
source scripts/engine-env.sh && .venv/bin/python scripts/serp-pull.py \
  --keyword "<target>" --liori-id SAL-NNN \
  --folder analysis/briefs/<slug> --liori-root . --provider dataforseo
# → engine draft → humanizer → verify → analyzer → term-capture
node scripts/engine-to-sanity.mjs <article.html> --type <post|guide>   # → drafts.* in /studio, review + publish
```

Targets: 2,000+ words (pillars 2,500+), FK ≤ 8, verifier pass, analyzer ≥ 80. Answer the head question in the first ~60 words (quotable for AI). Run the humanizer; honor the brand voice doc (`.agents/product-marketing-context.md`) — no kill-list terms, never invent a price, honor the case-study disclosure + Northern Hydraulics naming hazard.

## Measurement

- Rankings/traffic: GSC (baseline in `seo-project/data/`), connect + install analytics — **SAL-405**.
- AI citations (the real KPI for the authority pieces): Brand Radar — **SAL-406**.
- DataForSEO **AI-Optimization** add-on is off the current plan — needed for the citation study (SAL-426) to pull real ChatGPT mentions; otherwise infer from SERPs.

## What's next (after Wave 1)

1. **Baseline first** — wire GSC + Brand Radar (SAL-405/406) before drafting, or Wave 2 is blind.
2. **Checkpoints at weeks 4 + 8** — re-pull DataForSEO + read GSC; this category moves weekly.
3. **Wave 2 is data-driven** — deepen whichever pillar shows citation/ranking traction; prune losers. Don't pre-write it.
4. **Verticals graduate to their own mini-programs** — Revenue Engine (home-services + dental, Revenue Leak Audit funnel) and industrial catalog, as separate clusters/funnels.
5. **Recurring original research** — one quotable data study/month is the #1 DR/citation lever at DR 10.
6. **Distribution ≠ build** — promote the pillars + study (pitch stats, syndicate, earn links). The citations come from promotion, not publishing alone.
7. **Quarterly refresh** the fast-movers (AI Overviews, measurement).
