# 10 — Enriched career paths + glossary: the roadmap.sh lesson and the enrichment vision

**Status:** Vision / strategy. Captured 2026-06-17, after studying roadmap.sh and an owner decision
to lift the cost cap on page enrichments.
**Companion:** [11-enriched-paths-tech-task.md](11-enriched-paths-tech-task.md) — the engineering
spec that implements this.
**Builds on:** [09-career-path-build-standard.md](09-career-path-build-standard.md) (per-path build
rules), [01-assessment.md](01-assessment.md) + [02-scope-and-positioning.md](02-scope-and-positioning.md)
(why the hub exists), [05-glossary.md](05-glossary.md) (glossary plan).

---

## 0. What changed — the owner decision (2026-06-17)

Until now, career paths were scoped as **cheap** citation plays. "Keep them cheap" was a hard
constraint, so anything heavy — interactive tools, calculators, formulas, diagrams, a roadmap-style
graph — was ruled out on cost.

**That cost cap is lifted for enrichments.** The owner is fine investing real build time in
calculators, formulas, diagrams, even a full dependency graph — *when a page genuinely needs it.*

So the gate moves:

- **Old gate:** "Is it cheap?" → if not, skip.
- **New gate:** "Does this page need it, will it help the reader, and is it citable — without turning
  the hub into a course or a SaaS product?" → if yes, build it, however much work it is.

Enrichment is **optional by default** and decided **per page**, as an explicit step in the
create/update process for any glossary term, page, or career path (see §3).

> **This is the same gate already locked for the glossary, generalized.** The glossary strategy home
> (`docs/strategy/glossary/glossary.md` + `tech-task.md` §M6) already locks an **interactive-aids
> gate**: assess every term for a tool, tracked via `interactiveAidStatus`/`toolKey`, tools built as
> real components in `components/tools/registry.ts`. This doc extends that same gate to **career
> paths** and broadens the menu beyond tools (datasets, diagrams, a role map, JSON-LD). One gate, one
> tool registry across the whole hub — not two systems.

This decision does **not** loosen the other locks. Still true: citation/entity play (never measured
on leads), "we don't hire from these paths," multi-vertical, minimal nav footprint, ungated forever.
What opens up is only the *page format* — richer where it earns its place.

---

## 1. The lesson from roadmap.sh

We studied roadmap.sh's current mechanics in depth (the JSON node-graph format, the on-canvas
legend, topic detail panels, progress tracking, the AI suite, the open-source repo, Teams). The
finding that matters:

> **roadmap.sh's reusable value is its editorial dependency layer — what's core vs optional, what's
> interchangeable, what unlocks what — expressed as curated data. Its login-gated progress engine,
> AI suite, community editor, and hand-drawn mega-graph are a freemium-SaaS wrapper, not the thing
> people cite.**

The dependency layer is exactly the "what do I learn, in what order, and what's actually required"
structure that reads as authoritative reference — the format LLMs lift. That is the part worth
owning. Everything else exists to run roadmap.sh's business, which is not ours.

The full research (mechanics inventory, a GEO/citability lens, and the steal/avoid synthesis) was
run as a multi-agent analysis on 2026-06-17; the conclusions are folded into §2 below.

---

## 2. The split — enrichments we'll build vs. mechanics we still refuse

Two buckets. **Bucket A is now open** (cost is no longer the gate; need + citability + architecture
are). **Bucket B stays closed** for strategic reasons that have nothing to do with time.

### A. Enrichments — build when the content earns it (optional, per page)

**Foundational (low cost, apply broadly — these are the cheap roadmap.sh steals):**

1. **Per-module weight tag** — `core` / `alternative` / `flexible`. roadmap.sh's purple/green/gray
   legend, minus the graph and the color. The editorial-opinion layer is the most copyable idea and
   needs zero JS.
2. **`prerequisites` / `leadsTo` relations between paths** — model the dependency edges as data, not
   a canvas. Finally renders the real on-ramp story we have content for but don't show
   (per [03-roles.md §2](03-roles.md): there are *no* entry-level GEO/AEO jobs — you arrive via SEO
   Specialist → GEO Specialist). Our single biggest structural gap.
3. **Per-path JSON-LD** — `ItemList` (modules as ordered items) + `Occupation` for role-kind paths.
   Makes the numbered progression machine-extractable; pure citation leverage.
4. **Per-module glossary links** — let a skill name the 1–2 glossary terms it teaches and link them
   inline (roadmap.sh's "node → deeper resource" behavior), pushing equity into the glossary (our
   lead asset).
5. **Open, downloadable data artifact** — a JSON + Markdown map of the roles/paths under an
   attribution license, listed in `llms.txt`. The closest thing to roadmap.sh's repo link-magnet
   effect at DR ~10; an open data file is a citation magnet that survives a tiny domain rating.

**Richer (build when the concept demands it — cost no longer a blocker):**

6. **Calculator / scorecard** — when a concept has a number a reader would actually want to run
   (e.g. an AI-citation share estimator, a crawl-budget / indexable-URL estimator, a "cost of a wrong
   hire vs a project" model). Built as a real component in the **shared `components/tools/registry.ts`**
   (glossary M6) and embedded by `toolKey`. Interactive client island, no login, no saved state.
7. **Formula** — when an equation is central to the concept, render it cleanly (and make it
   interactive if that helps). Static or client island.
8. **Diagram / visual** — when a relationship is better shown than told (a flow, a before/after, a
   funnel, a comparison matrix). Prefer build-time/static SVG.
9. **Dependency / role map (the "graph done right")** — a real visual map of how roles and
   specializations connect, *when a path or the hub genuinely benefits.* Rendered static (build-time
   SVG from the same prereq/leadsTo data), not a heavy client editor — we keep roadmap.sh's
   structure without its renderer, login, or hand-positioning burden. This is now allowed; it was
   only ever refused on cost.
10. **Dataset / table** — when we can stand behind real, sourced numbers (e.g. a GEO/AEO salary
    ladder by role × seniority). Datasets dominate AI citations; ship it as a table *and* in the
    open data artifact. Only with real, maintainable numbers.
11. **Static checklist / decision aid** — a do/don't readiness list or "which approach for my case"
    table, as plain reference content (no checkbox state).

### B. Still refused — regardless of cost (strategic, not about time)

These don't get built even though time is no longer the constraint, because they reframe the hub or
need infrastructure/stance we've ruled out:

- **User accounts / sign-in / public profiles** — direct conflict with the no-login, static stance;
  pure SaaS-signup motive; earns no citation.
- **Progress tracking / per-node Done-In Progress states / "% complete" counters** — off-architecture
  (no persistence), zero citation value, and it reframes a reference page as "a course you track" —
  exactly what the minimal-nav lock guards against.
- **Gamification** (streaks, points, badges, "Started" counters) — motivation theater that signals
  "product, not reference."
- **AI suite** (roadmap generator, per-page AI tutor/mentor chat, AI quizzes) — needs an LLM backend
  + login + token metering; it's a paid funnel and adds no static citable surface.
- **Community / UGC custom roadmaps + drag-and-drop editor** — needs login and a contributor
  community we don't have, and imports off-discipline content onto a small corpus (the topical-
  dilution hazard in [01 §6](01-assessment.md)).
- **Teams / org plan** (assignments, seat billing, skill-gap dashboards) — a paid L&D SaaS built on
  accounts + the progress engine; measures on completion/seats (the opposite of our metrics) and
  collides with the permanent "we don't hire from these paths" stance.
- **Portfolio / project submission** (paste a GitHub repo / live URL) — needs login + a backend, and
  the build-toward-us framing is the recruiting/cohort reframe scope forbids.

**The line:** an enrichment is allowed if it is *content* (curated, extractable, on-discipline, no
state). It is refused if it is *a product feature* (accounts, tracking, community, an AI service)
— no matter how cheap it would be.

---

## 3. The enrichment principle — the new process step

**For every glossary term, page, or career path we create or update, we now run an enrichment
check** before finalizing. It is a deliberate step, not an afterthought, and it is **optional by
default** — most pages will pass through as plain reference content, and that's correct.

The check asks, in order:

1. **Is there a number the reader would want to compute?** → consider a **calculator**.
2. **Is there a formula or equation central to the concept?** → consider **rendering the formula**
   (interactive if it helps).
3. **Is there a sequence, dependency, or relationship better shown than told?** → consider a
   **diagram** or, for roles, the **dependency/role map**.
4. **Is there a dataset we can stand behind** (salaries, benchmarks, volumes, timelines)? → consider
   a **table + an entry in the open data artifact**.
5. **Is there a real decision** ("which X for my situation")? → consider a **comparison table or
   decision aid**.

Then the **three-part gate** — build the enrichment only if all three hold:

- **Need / help** — it genuinely makes the page teach or answer better, not just decorate it.
- **Citability** — it produces something a person or an AI engine would lift, embed, or link
  (structured, self-contained, sourced).
- **Architecture-safe** — it obeys the guardrails in §4 (no login, no server state, on-discipline,
  doesn't become a course feature).

If all three hold → **spec it** (effort is not a reason to skip — see §0). If not → **skip it**; the
plain page is the right answer.

**Record the decision either way.** When a page is created/updated, note in its build notes "enrichment:
none needed" or "enrichment: salary table + calculator (see task)." This stops us re-litigating the
same question every review and gives the cascade a checklist. The capture mechanism mirrors the term
capture we already run (`scripts/glossary-queue.mjs`): the enrichment decision is logged alongside.

---

## 4. Guardrails every enrichment must obey

Even an allowed enrichment has to fit the hub's architecture and stance:

- **No accounts, no login, no server-side state.** Calculators/diagrams are static or **client
  islands** (a React client component that computes in the browser, persists nothing).
- **Static-first.** Prefer build-time output (SVG, pre-rendered tables, generated JSON) over runtime
  JS. Reach for a client island only when interactivity is the point (a live calculator).
- **On-discipline + multi-vertical.** An enrichment must teach the universal concept and flex across
  industrial e-commerce, home services, and dental — never bolt on an off-vertical tool that dilutes
  the corpus.
- **Self-contained + extractable.** The enrichment (and its surrounding copy) must read as a
  standalone, quotable unit — the first line states what it is, in plain words. A calculator carries
  a one-paragraph plain-English explanation of the formula so the *concept* is citable even when the
  widget isn't.
- **Sourced + dated.** Any number, dataset, or formula carries its source and is covered by the
  page's `lastReviewed` cadence. A wrong/stale number is a credibility liability the freshness lock
  would force us to delete — don't ship data we can't maintain.
- **No course framing, no gamification.** No "track your progress," no completion %, no streaks/
  badges. The page stays a reference, not a product.
- **Stable anchors.** If an enrichment earns a deep link/citation, its anchor must be stable across
  edits (see [11](11-enriched-paths-tech-task.md) on stable IDs) so external citations don't 404.

---

## 5. Why enrichments serve the citation goal (not a distraction from it)

This isn't feature-creep dressed up as strategy. The enrichments in Bucket A are *more* citable than
prose, which is the whole point of the hub:

- **Calculators and datasets are link/citation magnets.** levels.fyi (cited in [01 §4](01-assessment.md))
  out-links prose because unique data is what people embed and credit. A sourced salary ladder or a
  working estimator is exactly the asset a DR ~10 site can use to earn referring domains.
- **Structured progression is what RAG/LLM retrieval likes.** A numbered module list with weights,
  prerequisites, and JSON-LD is pre-chunked, machine-parseable, answer-shaped content — the format
  that gets lifted into AI answers.
- **One canonical, enriched page per entity** is a structural win that needs no authority: it makes
  Sale Solution the definition an engine anchors to.

Enrichment, done within the guardrails, *is* the citation strategy at a higher resolution.

---

## 6. Target end-state — what an "enriched" page looks like

**A career path (e.g. when fully realized):**

- Hero with kind eyebrow (Role / Specialization) + metadata, as today.
- Numbered skill modules grouped by seniority, each with a **weight tag** (core/alternative/flexible).
- A **"before this / where this leads"** rail driven by `prerequisites` / `leadsTo`.
- Inline **glossary links** inside the skill text.
- **JSON-LD** (`ItemList` + `Occupation`) on every path.
- *Optional, when warranted:* a **salary table** (role × seniority, sourced), a **calculator**
  relevant to the role (e.g. crawl-budget estimator on the Technical SEO path), a **role-map
  diagram** showing how this path connects to the others.
- The path's data included in the **open downloadable map artifact** + `llms.txt`.

**A glossary term:**

- Definition-first (`shortDefinition`) + "why it matters" + "in practice," as today.
- *Optional, when the concept has one:* a **formula** (e.g. share-of-voice), a small **calculator**,
  a **diagram** of the mechanism, or a **dataset/table** — each behind the §3 gate and §4 guardrails.

Most terms and many paths will stay plain. The vision is that the *option* exists and is evaluated
every time, so the pages that genuinely warrant a richer format get one — and the rest don't drift
into decoration.

---

## 7. What this is NOT

- **Not a course.** No curriculum, no cohort, no certificate, no gating — ever.
- **Not tracked.** No accounts, no saved progress, no completion %.
- **Not recruiting.** "We don't hire from these paths" still holds; the buyer section is the only
  revenue-touching surface (and only specializations nudge toward the service).
- **Not feature-creep.** Default is plain reference content. Enrichment is opt-in, gated, and
  recorded — the bar is "the content needs it," not "we could build it."
