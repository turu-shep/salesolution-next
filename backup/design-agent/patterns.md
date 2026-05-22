# Patterns and Anti-patterns

The methodology in [workflow.md](./workflow.md) is the spine. This file is the catalog of what to look for as you run the loop:

- **Anti-patterns** — the AI-SaaS tells to hunt and kill on every polish pass.
- **Distinct visual moments** — the kinds of section treatments worth building so the page doesn't read as a card-grid template.

The patterns themselves are *kinds of moments*, not specific component implementations. The whole point is that each project will produce its own concrete versions.

---

# Anti-patterns: the AI-SaaS tells

After pages have substance, their biggest enemy becomes **template residue** — the visual patterns that make them read as AI-generated. Every polish pass should audit against these.

## A1. Eyebrow → big headline → lede on every block

**Tell:** every section opens with the same 3-line pattern:
```
EYEBROW IN ACCENT COLOR, UPPERCASE, TRACKING-WIDE
Display Headline With One Accent Word
Body lede that sets up the rest of the block.
```

Used once or twice, this pattern orients readers. Used 10 times in a row, no human designer would repeat it — it's a tell.

**Fix:** vary openers across the page. Some blocks open with just a quote. Some with a single sentence. Some with a number set in huge type. Some with an image. Keep the eyebrow pattern on 2–3 blocks, not all of them.

## A2. Icon-in-colored-rounded-square on every feature

**Tell:** `w-12 h-12 rounded-xl bg-<accent>-100 text-<accent>-600` — the shadcn default tile. Every feature row, every stat, every trust cue has one. The pattern lives in every AI-generated SaaS page because it's in every component-library template.

**Fix:** strip the tiles from at least 2 blocks. Let content breathe without a decorative anchor on every row. Icons can stay in product-UI mocks (where they're functional) — just not on every marketing feature.

## A3. Accent-colored proof pill on every stat

**Tell:** `bg-<accent>-50 text-<accent>-700 border-<accent>-200 rounded-full px-2.5 py-1 uppercase tracking-wider font-bold text-[11px]` on every stat. Appears 15+ times on a page.

**Fix:** most stats should be plain text in prose. A pill is for 1–2 stats per page, not 15. `"up to 30% fewer truck rolls"` as body copy beats `"UP TO 30% FEWER TRUCK ROLLS"` in a pill. Reserve pills for stats that genuinely need to be scanned in 1 second.

## A4. Gradient text on every accent word

**Tell:** `<span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">one word</span>` on every H2. Omnipresent, subtle-seeming, unmistakable.

**Fix:** use this technique on **one** headline per page, not eight. The page's strongest typographic moment gets the gradient; everything else stays monochrome or uses solid `text-<accent>-600`.

## A5. The cliché dark closer

**Tell:** dark section (`bg-slate-950` or similar) + `radial-gradient(ellipse at top, accent/0.15, transparent)` + a stat strip of 3–4 pills + a single accent pill button + an avatar cluster. Every SaaS closer looks like this.

**Fix:** vary. The closer can be warm white with a big typographic statement. Or a single left-aligned paragraph. Or tied back to the page's calculator result. If you must use the dark-gradient form, strip most of the decoration — the stat strip and avatar cluster are both optional.

## A6. Every block is a card grid

**Tell:** 2-col, 3-col, 4-col — all rounded-2xl bordered white cards. Hero + card grid + card grid + card grid + dark closer. The page has the same visual weight 11 times.

**Fix:** at least 2 blocks per page should break the card pattern. A block that's just typography in air. A 1-big + 2-small asymmetric block. A full-width quote with no frame. A timeline with stats but no card around the copy.

## A7. Checkmark + muted text list for every enumeration

**Tell:** `<CheckCircle2 className="text-emerald-500" /> Feature description in muted gray`. Every enumeration is a bulleted check list.

**Fix:** vary list presentation. Some lists read better as flowing paragraphs with inline emphasis. Some as numbered steps. Some as a 2-column table. Some as prose.

## A8. "Verified" badge on fabricated testimonials

**Tell:** green "Verified" badge next to a placeholder name on a testimonial card whose quote was invented. Legal-risk plus it-looks-fake-anyway.

**Fix:** see the Composite testimonial pattern in [content.md](./content.md). If the testimonial isn't real, don't claim it is.

## A9. Em-dashes everywhere

**Tell:** em-dashes appearing 20+ times in a page's prose. Known LLM tell. Humans use em-dashes — just not at that frequency.

**Fix:** when polishing copy, grep for `—`. For each, ask: would a period or a comma work here? Usually yes. Target: under 10 em-dashes on a full page.

## A10. "N ways / N steps / N pillars" framing

**Tell:** bulleted structures used as a crutch regardless of whether the content fits — "5 ways our platform...", "3 simple steps", "4 core pillars." The framing is forced when the content is really 2 things or 7.

**Fix:** write the content first, let the structure emerge. Don't force "five ways" onto what's naturally two things.

---

## How to audit against anti-patterns

Before declaring a polish pass done, walk the page and count:

- Eyebrow openings per page (target: ≤3; flag if ≥7)
- Icon tiles per block (target: ≤2 per block; flag if every feature row has one)
- Proof pills per page (target: ≤3; flag if ≥10)
- Gradient-accent-word headlines per page (target: 1; flag if ≥3)
- Dark-with-radial closers per page (target: ≤1; flag if the closer has all 4 sub-elements — stat strip + avatar cluster + radial + accent button)
- Blocks using the card-grid pattern (target: ≤70% of blocks; flag if all of them do)
- Em-dashes in prose (target: <10; flag if >20)

If any count is in the flag range, you have template residue to kill.

---

# Distinct visual moments worth building

Below: kinds of section treatments that solve specific problems. Don't use all of them on one page — pick the 3–5 that serve your narrative.

## Concept-picker (design-iteration wrapper)

**When to use:** comparing 2–3 variants of a section (hero, headline, mockup) in the live page.

**What it is:** a visible wrapper with a sticky label bar marking each variant. Dashed border per concept. High-contrast label ("CONCEPT A" / "CONCEPT B") at the top.

**Why:** the user sees variants in actual rendered context, not in a Figma comp. The visible label makes it safe to ship all variants to the branch — the reviewer can't confuse them for production.

**When to remove:** once the user picks, delete the losing variants and the wrapper. It's design-iteration scaffolding, not production UI.

## Recognition wall (sticky notes / bulletin board)

**When to use:** a section whose job is pure recognition — reflecting the reader's current reality back at them so they feel seen.

**What it is:** a grid of 6–8 tiles styled as physical objects (sticky notes, index cards, post-its). Mixed colors. Multiple handwritten fonts cycled. Slight rotations, hover straightens. Each tile is a single line that makes the reader go "oh shit, that's me."

**Why:** the visceral physicality makes the recognition land harder than a neutral list would.

**Content principle:** specifics over generics. "A stack of 'call back' notes you'll never get to" > "A way to stay organized."

## Scannable chip wall (who-this-is-for)

**When to use:** when you have 10+ specific audiences/use-cases. Replaces the 4-card grid that reads as template SaaS.

**What it is:** a grid of small chips, each with an icon + a name. Two color accents to distinguish categories. Subtle hover lift.

**Why:** recognition over reading. The reader finds themselves in 2 seconds by scanning, not by reading four paragraphs.

## Compounding cards (visualize accumulation)

**When to use:** illustrating something that builds on itself over time — years, stages, milestones where each stage inherits from the prior.

**What it is:** stair-stepped columns (e.g., Year 1 → Year 2 → Year 3) with growing heights. Each card shows inherited items dimmed and labeled "FROM YEAR 1," plus new items bright and labeled "NEW IN YEAR X." Bottom-aligned grid.

**Why:** abstract compounding becomes physical. By the time the reader looks at Year 3, they literally see all prior years stacked inside it.

**Don't use if:** the story isn't literally about accumulation.

## Numbered process cards with big background numerals

**When to use:** sections that describe a sequence or guided process. Replaces the generic 3-feature-tile grid.

**What it is:** vertically-stacked horizontal cards (not side-by-side). Each card has a step label, title, and description, plus a massive faded "01" / "02" / "03" numeral as background art at top-right. Hover tints to brand color.

**Why:** the big numerals give the section personality. Vertical stack makes it feel like "a guided process," not "three separate features."

## Value-math stack (the price reveal)

**When to use:** when price is part of the pitch and you need to earn the reveal. Replaces a traditional pricing tier section.

**What it is:** a 5–6-row table. Each row: "What you're paying now" (with X icon, cost range) on the left, "What [Product] replaces it with" (with check icon, description) on the right. Below the rows, a dark card with the monthly price and CTA.

**Why:** the reader does the math themselves. By the time they see the price, it feels like a steal because they've just mentally added up the current stack.

**Content principle:** use real industry ranges, not round numbers. Include a non-monetary line ("Saturday evenings doing paperwork / Priceless") — it lands differently than dollar lines.

## Before/After hero composition

**When to use:** hero visual for a product replacing chaos. Strong storytelling in a single image.

**What it is:** "chaos" elements scattered in the background (sticky notes, paper invoices, missed-call phone) and a clean product dashboard in the foreground center. Prominent badge: "REPLACES ALL THIS ↓"

**Why:** it's the page's thesis in one image. The reader sees their own desk in the chaos, the alternative in the dashboard.

**Warning:** complex to build mobile-responsive. Needs a simplified mobile variant or hide chaos elements below tablet.

## Live-system hero (floating notifications)

**When to use:** hero that conveys "this is a platform with many things happening at once."

**What it is:** central mockup card with 3–4 floating notification cards scattered around it. Each notification is a real-looking toast: icon + bold line + sub-line. Colors differentiate types.

**Why:** conveys activity/volume without making the reader read a feature list.

**Constraints:** 4 floating cards max — more becomes chaotic. High `z-index` to layer above the mockup. Reduce offsets at smaller breakpoints so cards don't clip on mobile.

## Video-player placeholder hero

**When to use:** hero when you have (or will have) a demo video. Immediate credibility boost.

**What it is:** browser-framed video player with traffic-light dots, title bar, dark video frame with a hint of scene gradient, big play button with an animated ping behind it, caption overlay, progress bar at the bottom, "LIVE DEMO" floating badge.

**Why:** the reader trusts a video player more than static art because they expect to click and see.

**Mobile gotcha:** an `aspect-video` container with `min-h-[280px]` forces a width of ~498px on mobile. Use `sm:min-h-[280px]` so the min-height only applies above the small breakpoint.

**Replacement pathway:** when you have the real video, replace the static frame with a `<video>` element. Keep the chrome, badge, and caption overlay.

## Live calculator with live-updating CTA

**When to use:** a page making an economic argument (cost savings, ROI) where the reader's specific numbers differ materially from an illustrative default.

**What it is:** a multi-slider calculator on one block, where each slider controls a real input. Numbers recompute live. The calculator dispatches a CustomEvent carrying its current total; a downstream block (typically the final CTA) subscribes and reflects the reader's tuned number.

**Why:** "here's the math for a generic shop" doesn't land — the reader thinks "but my shop is different." Letting them tune the inputs and then carrying their number forward makes the pitch feel specifically about them. The CustomEvent wiring is clean — no shared global state, no prop drilling.

**Implementation skeleton:**
- `'use client'` on both the calculator and its subscriber
- Dispatch: `window.dispatchEvent(new CustomEvent('<page-slug>-math:update', { detail: { total, mrr, ... } }))`
- Subscribe: `useEffect(() => { const h = e => setState(e.detail); window.addEventListener(...); return () => window.removeEventListener(...) }, [])`
- Subscriber's default state matches the calculator's default — a reader who never touches a slider sees the canonical worked example

**When NOT to use:** the main landing page — too heavy for first impressions. Works on sub-pages where the reader has already self-identified.

## Documentary-style generated imagery

**When to use:** a page that needs emotional weight at a specific moment (payoff, humanization, a real scenario) and can't wait for a real photo shoot.

**What it is:** images generated via OpenAI `gpt-image-1` (or equivalent) using documentary/editorial prompts. Not stock. The prompts explicitly say "NOT stock photography" and specify a real moment.

**Why:** generated images *can* look like stock, but carefully-prompted ones at high quality don't.

**Implementation notes:**
- Model `gpt-image-1`, size `1536x1024`, quality `high`
- Convert PNG → WebP via ImageMagick: `magick src.png -quality 82 dst.webp`. Page-weight drops 80–90%.
- Save to `/public/<page-slug>-<moment>.webp`
- Commit the generation script so prompts are reproducible

**Prompt template:**
> *Documentary-style photograph of [specific moment with specific people]. [Setting description]. [Age + clothing details that feel real]. Natural [time-of-day] light from [specific source]. Shot on Kodak Portra 400 35mm, subtle film grain, shallow depth of field. Captured-in-the-moment, not posed. Editorial magazine feel — NOT stock photography. Wide landscape composition, authentic.*

**Where imagery earns its place:** payoff moments; humanization of an abstract feature; anchoring a specific claim.

**Where it usually doesn't:** generic "team at work" hero images; every block having one (1–2 per page is usually right).

## Composite testimonial card (the ethical framing)

**When to use:** the page needs testimonial weight but you don't yet have real named customers who've consented to quotes.

**What it is:** an anonymized testimonial card framed as supporting evidence, not a real customer quote.

**Implementation:**
- No named person — replace with role + setting
- Badge says **Composite** in muted slate, not **Verified** in emerald
- Section intro makes attribution explicit
- Never pair with a fabricated avatar photo

**Why:** the unsafe pattern (full name + location + star rating + "Verified" badge on a fabricated quote) is deceptive-advertising territory. See [content.md — testimonial ethics](./content.md) for full details.

## Scoped sub-component folder

**When to use:** any audience/persona page with 10+ blocks.

**What it is:** instead of a single 1000+ line client component, each block is its own `.tsx` in a scoped folder matching the route. The parent page is a thin orchestrator (≤50 lines) that composes blocks wrapped with header/footer.

**Structure:**
```
app/<route>/page.tsx                     # thin Server Component shell + metadata
components/landing/<route>/
  <Route>Page.tsx                        # 'use client' orchestrator
  <BlockN>.tsx                           # one per block
```

**Why:**
- **Auditable.** A 1000-line component is impossible to audit block-by-block because there are no blocks.
- **Reorderable.** Move a block by reordering one line in the orchestrator.
- **Parallelizable.** Different agents can work on different blocks without conflict.
- **Boundaried.** Each block has one clear job; it's obvious when a block is trying to do two.

**When you discover this matters:** the first audit pass on any page that shipped as a monolith will demand the structural refactor before any design work. Better to start scoped.

---

## Composition rules

- **No more than 2 dark sections** on one page — they overpower. Reserve them for the page's biggest narrative moments.
- **Alternate whites and grays** for light sections to create rhythm. Avoid 3 whites in a row.
- **One "wow" pattern per page.** If you use 7 distinct treatments on one page, none of them stand out. Pick the 3–5 that serve the narrative.
- **Match vertical rhythm.** Every section uses a consistent `py-section-*` value. Breaking rhythm looks like a bug.
- **Reuse the same icon library.** Don't mix Lucide + emoji + custom SVGs. Pick one source and stick to it.
