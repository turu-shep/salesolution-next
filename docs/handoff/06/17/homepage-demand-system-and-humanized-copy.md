# Handoff — Homepage demand-system diagram + humanized copy

**Date:** 2026-06-17
**Author:** Artur + Claude (session)
**Scope:** Homepage (`app/(site)/page.tsx`) — a new interactive funnel diagram, plus a copy pass that swaps marketer jargon for the founder's own language.

> Git note (read first): the repo was being rewritten by a concurrent process while this work landed. The commit it went into was last seen as `4407ac4 "Multi-vertical pivot checkpoint…"` on branch `seo-readiness-fixes`, but the working tree has since bounced back to `main` (`10382f0`). **Before continuing, confirm which branch/commit actually holds these files** (`git log --oneline -- components/sections/DemandSystem.tsx`). The files themselves are tracked; only the branch story is messy.

---

## TL;DR

1. Built **`DemandSystem`** — a vertical, interactive funnel diagram on the homepage. It shows every channel a customer can come from, routed into the stage of the funnel where that buyer actually is (cold → TOFU, researching → MOFU, ready → BOFU), down to a booked decision, with a retention loop that returns existing customers to the next purchase.
2. Reviewed the whole homepage story and **rewrote the most jargon-heavy copy** (hero, Signals, FrameworkTimeline) into plain, outcome-first founder language.
3. Installed a **`humanizer` skill** and saved the copy-voice direction to memory.

---

## 1. The DemandSystem diagram (main deliverable)

**What it is:** a single engineered figure on the homepage — a drawn funnel "vessel" (tapering SVG walls + faint gradient fill) with stage bands sitting inside it. Source channels sit above the stage they enter; connectors flow them in; the funnel narrows to a decision; a return path loops existing customers back.

**Files:**
- `components/sections/DemandSystem.tsx` — the section/diagram (server component; no animation library).
- `lib/demand-system.ts` — all the data + copy. **Edit node text here.** Each source has a `stage: 'tofu' | 'mofu' | 'bofu'` (reassign a channel by changing one line), a `group` (earned/paid/owned, drives the dot colour), and a `note`. Funnel stages, the decision node, and the retention node also live here.
- `app/globals.css` — three CSS blocks for the diagram: `.demand-flow` (marching-dash connector animation), `.demand-rise` (staggered scroll-in), and the `[data-funnel-band]` responsive width (full-ish on mobile, narrows on `sm+`). All reduced-motion safe.
- `app/(site)/page.tsx` — renders `<DemandSystem />` after the hero.
- `scripts/screenshot-demand-system.mjs` — desktop/mobile/hover capture helper.

**The model it teaches (important — this is the corrected version):**
- Channels do **not** all dump into the top. Each enters where the buyer's awareness is:
  - **TOFU (cold):** AI search & chat, Social media, Social ads, Cold email, + other
  - **MOFU (researching):** Google/Bing organic, Reddit/Quora
  - **BOFU (ready):** Search ads, Retargeting
- **Retention is not a top source** — returning-customer email sits *below* the decision and loops back into it (existing customers skip the funnel and re-enter ready to buy).

**Interaction:** hover/focus/tap a source chip → tooltip with its `note`. Funnel stages render their note inline. Pure CSS (group-hover/group-focus-within) — no JS handlers.

**Visual decisions that survived the polish loop:**
- Drawn funnel **vessel** (SVG walls + gradient) so it reads as one funnel, not stacked cards.
- **Blue intensity ramp** down the stages → solid brand-blue decision node.
- **Figure frame** (`border + bg`, with a `<figcaption>`) to match the house chart style (see `ProblemShift.tsx`).
- §-numbers `01–05`, family legend, "illustrative" caption.
- A real **loop-back path**: decision + retention share one container so an SVG return path exits retention, rises through the right gutter, and lands an arrowhead back on the decision (desktop; mobile shows a "↻ loops back" note).

**How it was built:** v1 (naive: all sources → TOFU) → corrected to stage-routing + retention loop after Artur's feedback → a visual-improvement loop (≈3 iterations + a confirming pass) using parallel read-only critique agents on screenshots.

---

## 2. Homepage copy pass

**Critique (the lens: clear story, show what the customer fixes/gets, talk the founder's language):**
- Story spine is sound, but **Signals** (self-diagnosis) sits late (~§9) when it belongs near the problem (ProblemShift, ~§3), and **proof** (Evidence) comes after the pitch.
- Biggest issue: copy kept slipping into mechanism-speak (GEO, AIO, schema, E-E-A-T, JSON-LD, PPC, CLV) where the founder is deciding. Outcomes were strong but buried.
- Pivot voice was inconsistent ("your store" e-commerce framing), and CTAs used 3–4 names for ~2 actions.

**Rewritten this session (verified: typecheck + lint clean, screenshotted):**
- **Hero** — was "AI search, engineered." Now leads with the buyer's outcome. (Note: the hero was further revised after our pass into a **two-lane** version — "Win the customers you already pay for." with industrial vs home-services/dental CTAs. Keep the two-funnel split; do not merge the lanes.)
- **Signals** (`components/sections/Signals.tsx`) — checklist reframed from marketer KPIs to founder pains ("Leads from Google have quietly dried up…", "Ask ChatGPT about your category and it names a competitor, not you."). Now has dual CTAs (industrial audit / Revenue Leak Audit) matching the two lanes.
- **FrameworkTimeline** (`components/sections/FrameworkTimeline.tsx`) — every phase + item translated to plain language ("Get AI-ready", "Pages that answer real questions", "Watch what AI says about you"); metric labels plainened ("more AI answers cite you", "return on spend").

---

## 3. Tooling + conventions (so the next session moves fast)

- **Humanizer skill** — installed at `~/.claude/skills/humanizer/SKILL.md` (outside the repo; persists across sessions). Now a standing rule: run it on **all** SEO + customer-facing copy before handing over. Voice = plain, outcome-first, founder language; preserve facts/numbers verbatim; don't announce it.
- **Copy-voice memory** — `~/.claude/projects/.../memory/copy-voice-and-humanizer.md` captures the voice rules + the de-jargon TODOs.
- **No animation library.** Animations = inline SVG + the `InView` wrapper (`components/sections/InView.tsx`) flipping `data-in-view`, with CSS in `globals.css`. Reuse this pattern; don't add framer-motion.
- **Visual-loop protocol** (Artur's rule for any visual change): one dev server, one browser, screenshots serial; fan out ≤5 **read-only** critique agents on the screenshot (layout / type / colour / responsiveness / brand); never spawn a second browser or server.
- Dev server is pinned to `--webpack`. If Next 16 gets flaky: `pkill -f "next dev"; rm -rf .next; pnpm dev`, then poll for stable 200s before screenshotting.
- Screenshots dir is gitignored.

---

## 4. What's left (ranked)

1. **Move Signals up** near ProblemShift (one-line reorder in `page.tsx`; check tone rhythm — Signals is `surface`).
2. **Standardize CTAs** — pick one name for the call and one for the audit across the page (currently "full audit" / "readiness audit" / "Revenue Leak Audit" / "strategy call").
3. **De-jargon the rest:** `ServicesTabs`, `FAQ`, and the **hero probe widget** (still scores "Schema / AI-readable / Authority" and says "AI-Readiness Probe").
4. **Unify pivot voice** everywhere (Evidence + FAQ still lean industrial/SEO while the hero is now cross-vertical).
5. **Publish the Sanity humanizer drafts** — a separate pass wrote 53 prose edits to 2 careerPath + 20 glossaryTerm docs as `drafts.<id>`, pending review/publish in `/studio`.
6. Optional diagram polish: faint stage-divider ticks on the vessel walls.

---

## 5. Gotchas

- **Concurrent git activity:** a parallel process has been rewriting history fast (commits and branches changed within seconds during this session). Verify branch/commit state before committing anything; avoid `--amend`/force operations until it settles.
- **Notes for the diagram are hardcoded TS** (`lib/demand-system.ts`), not Sanity — matches how the rest of the homepage stores data. Editing a note = a code change + deploy.
- **Two funnels must stay separate** (industrial → `/industries/...` / `/unlock-growth-audit/`; local-service → `/revenue-engine/`). Don't merge the hero lanes.

---

## File map

| File | What |
|------|------|
| `components/sections/DemandSystem.tsx` | The funnel diagram |
| `lib/demand-system.ts` | Diagram data + node copy (edit here) |
| `app/globals.css` | `.demand-flow`, `.demand-rise`, `[data-funnel-band]` |
| `app/(site)/page.tsx` | Renders `<DemandSystem />` after the hero |
| `scripts/screenshot-demand-system.mjs` | Screenshot helper |
| `components/sections/HeroProbe.tsx` | Hero (now two-lane) |
| `components/sections/Signals.tsx` | Self-diagnosis (founder pains) |
| `components/sections/FrameworkTimeline.tsx` | 3-phase plan (de-jargoned) |
| `~/.claude/skills/humanizer/SKILL.md` | Humanizer skill (outside repo) |
