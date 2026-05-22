# Patterns: Reusable Visual Moments

A catalog of distinct section treatments that work across many products. Each solves a specific problem and has a specific use case.

**Don't use all of them on one page.** Pick 4–6 that serve your narrative. Using every pattern = visual chaos.

---

## 1. ConceptPicker (design-iteration wrapper)

**When to use:** You need to compare 2–3 variants of a section (hero, headline, mockup) and want the user to scroll through them side-by-side in the live page.

**What it is:** A visible wrapper with a sticky label bar marking each variant. Dashed border frames each concept. High-contrast label at the top ("CONCEPT A" / "CONCEPT B").

**Why it works:** The user sees all variants in actual rendered context, not in a Figma comp. Scrolling is faster than toggling. The visible label makes it safe to ship all variants to the branch — the reviewer can't confuse them for production.

**Key implementation points:**
- Sticky top label with high-contrast color
- Dashed border frame around the section
- Subtle background tint to further distinguish from production
- Short note next to the label explaining what each variant is

**When to remove:** Once the user picks, delete losing variants and the wrapper. It's scaffolding, not production UI.

---

## 2. Sticky-Note Wall (recognition moment)

**When to use:** A section whose job is pure recognition — reflecting the reader's current reality so they feel seen.

**What it is:** A grid of 6–8 tiles styled as real sticky notes. Mixed colors (yellow, pink, blue, green). Handwritten fonts varied across notes. Tape on top. Curled bottom-right corner. Slight rotation. Hover straightens and lifts.

**Why it works:** Looks like an actual bulletin board, not a designed grid. The physicality makes recognition land harder than a neutral list.

**Key implementation points:**
- **Three handwritten fonts** loaded via font provider (Kalam, Caveat, Architects Daughter all work well). Cycle across notes.
- **Four colors:** amber-100, pink-100, sky-100, lime-100.
- **Tape element:** small semi-transparent rectangle at top, slightly rotated.
- **Curl effect:** absolute `div` at bottom-right using `clip-path: polygon(100% 0, 100% 100%, 0 100%)` and a 135deg gradient for shadow.
- **Scatter feel:** rotations between -3 and 3 degrees plus `translate-y` offsets of ±1–3.
- **Hover state:** `hover:rotate-0 hover:scale-[1.04]` — lifts and straightens.

**Content principle:** Each note should be a single line that makes the reader go "that's me." Avoid generic statements. Be uncomfortably specific.

---

## 3. Trade / Specialty Wall (recognition over reading)

**When to use:** "Who is this for" sections with 10+ specific audiences. Replaces typical 4-card grids.

**What it is:** A grid of small chips, each with an icon + name (optional subtag for category). 12–20 chips in a 4-column grid. Different accent colors for different categories.

**Why it works:** Recognition over reading. The reader finds themselves in 2 seconds by scanning, not by reading four paragraphs. Feels like a wall of specialties, not a decision tree.

**Key implementation points:**
- Icons from a single library (Lucide, Heroicons, etc.). Varied across the wall.
- Category distinction via accent colors (e.g., orange for one group, amber for another).
- Chip styling: `rounded-xl`, white bg, subtle border, hover lift.
- Closer line below: "If your name's on this wall, this is for you."
- Optional secondary row: "Want a deeper dive for your specific [type]?" with deep links to per-audience pages.

**Anti-patterns to avoid:**
- Don't use the same icon for every chip (defeats the scanning purpose)
- Don't use vague emoji (reads as juvenile on B2B)
- Don't sort alphabetically — sort by relevance to your primary audience

---

## 4. Growing Cards (visualize compounding)

**When to use:** Illustrating something that builds on itself over time. Years, stages, or milestones where each stage inherits from the prior.

**What it is:** Three columns (Year 1 / Year 2 / Year 3 or Stage 1 / 2 / 3). Card heights grow left-to-right. Each card shows inherited items (dimmed, labeled "FROM [previous stage]") plus new items (bright, labeled "NEW IN [current stage]"). Cards align to bottom, stair-stepping upward.

**Why it works:** Compounding is abstract. The visual makes it physical. The reader sees all prior stages stacked inside the latest one — claims become diagrams.

**Key implementation points:**
- Cards aligned via `items-end` on grid — forces bottom-aligned stair step.
- Inherited items: dimmed text (`text-white/35`), dimmed checkmark.
- New items: full intensity, accent color on checkmark.
- Sparkle or accent icon next to "NEW IN [stage]" label.
- Final card gets a bottom line earning the payoff ("Everything you built before is still working for you" or similar).

**Don't use if:** Your story isn't literally about accumulation. Don't force this on "features" that don't inherit.

---

## 5. Numbered Process Cards with Big Background Numerals

**When to use:** Sections that describe a sequence or service offering. Replaces the generic 3-feature-tile grid.

**What it is:** 3 horizontal cards stacked vertically. Each card has:
- Icon + "STEP 01" label on the left
- Title + description on the right
- **Massive faded "01" / "02" / "03" numeral as background art** in the top-right
- Hover tints border to brand color

Below the cards, a dark banner with avatar cluster + tagline + CTA link.

**Why it works:** Big background numerals give personality. Vertical stack makes the section feel like "a guided process," not "three separate features." The bottom banner anchors the emotional message.

**Key implementation points:**
- Background numerals: very large (160–200px), very faded (~5-10% brand color).
- Absolute positioning top-right with slight offset so they bleed.
- Hover increases opacity subtly.
- Cards in a narrower `max-w-4xl` container to emphasize sequential flow.

---

## 6. Stat Strip with Avatar Cluster (final CTA weight)

**When to use:** Final CTA section on a long page. Need to leave a strong impression with tangible numbers.

**What it is:** 4-tile strip of stats above the CTA button. Each tile shows a single bold number + short label. Below the button, an avatar cluster (overlapping circles with initials) + "Join X who already switched" line.

**Why it works:** After a long page, the reader needs a reason to click. The stat strip is a last concrete reminder. Avatar cluster adds social proof without requiring testimonials.

**Key implementation points:**
- Stats: semi-transparent on dark section, bold orange/accent numbers, muted labels.
- Avatar cluster: 4 overlapping circles with `-space-x-2`, colored backgrounds, 2-letter initials.
- Tagline: specific-but-honest ("Join shop owners who already switched") — not a fake number unless you have a real one.

---

## 7. Value Math Stack (the $X reveal)

**When to use:** Price is part of the pitch and you need to earn the reveal. Replaces traditional pricing section with tiers.

**What it is:** Multi-row table. Each row: "What you're paying now" (X icon + cost range) on the left, "What [product] replaces it with" (check icon + description) on the right. Below rows, a dark card with the monthly price and CTA.

**Why it works:** The reader does the math themselves. By the time they see the price, it feels like a steal because they've mentally added up the stack.

**Key implementation points:**
- 12-col grid: 5 cols for "paying now" / 7 cols for "replaced with"
- X icon in muted gray, check icon in success green
- Cost ranges under the label (e.g., "$300–$2,000 / mo") — specific ranges beat single numbers
- Dark price card: full-bleed dark bg, price in brand accent, CTA button
- Pre-header: "Replaces all of this." — makes the stack explicit

**Content principle:** Cover 5–6 real cost buckets the audience actually pays for. Use real industry ranges, not round numbers. Include a non-monetary line ("Saturday evenings doing paperwork / Priceless") — it lands differently than dollar lines.

---

## 8. Before/After Layered Composition (hero visual)

**When to use:** Hero visual for a product that replaces chaos. Strong storytelling in a single image.

**What it is:** Composition with "chaos" elements scattered in the background (messy relevant artifacts for your industry — sticky notes, papers, missed-call phone, broken dashboard widgets) and a clean product interface in the foreground center. Prominent badge: "REPLACES ALL THIS ↓" or equivalent.

**Why it works:** The page's thesis in one image. The reader sees their own desk in the chaos and the alternative in the clean interface. The badge makes the relationship explicit.

**Key implementation points:**
- Container with fixed height and absolute-positioned children
- Chaos elements: rotated 5–15 degrees, at reduced opacity (70–80%), scattered in corners
- Center mockup: `absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`, wrapped in a subtle accent ring
- "REPLACES ALL THIS" badge: brand accent bg, uppercase, positioned above the mockup

**Warning:** Complex to build mobile-responsive. The absolute positioning doesn't degrade well below tablet. Plan a simplified mobile variant or hide chaos elements at small breakpoints.

---

## 9. Live System with Floating Notifications (hero visual)

**When to use:** Hero visual that conveys "this is a platform with many things happening at once."

**What it is:** Central mockup card with 3–4 floating notification cards scattered around it. Each notification is a real-looking toast: icon + bold line + sub-line. Colors differentiate types.

**Why it works:** Conveys activity/volume without requiring a feature list. Feels like a peek into a real product day.

**Key implementation points:**
- 3–4 floating cards max — more becomes chaotic
- Positioned outside main mockup edges with negative offsets
- High z-index to layer above mockup
- Reduce offsets at smaller breakpoints to prevent clipping

---

## 10. Economic Dashboard (hero for cost-pressure audiences)

**When to use:** Hero visual when the angle is "you're being squeezed by rising costs — here's how this helps."

**What it is:** Top row: small red cost-pressure indicators ("INSURANCE +18% YoY" / "PARTS +24%" / etc.). Center: a branded "statement" dashboard with big positive number, growth chart, stat row, green savings footer. Dark badge below: "[action verb] BACK ↑" (e.g., "YOUR SHOP FIGHTS BACK").

**Why it works:** Directly counters the economic pressure narrative. Red indicators agree with what the reader feels. The dashboard shows the fight-back.

**Key implementation points:**
- Cost indicators across the top as small cards
- Central dashboard with accent header strip
- Simple bar chart using divs with increasing heights
- Green savings footer strip

---

## 11. Video Player Placeholder (demo video hero visual)

**When to use:** Hero visual when you have (or will have) a demo video. Immediate credibility boost for a product peek.

**What it is:** Browser-framed player (traffic-light dots, title, duration). Dark video frame with subtle scene gradient. Big white play button with accent triangle icon, ping animation behind it. Caption overlay. Progress bar at bottom. Floating badge ("LIVE DEMO" or similar).

**Why it works:** Promises a demo without needing one yet. The reader trusts a video player more than static art — they expect clicking to do something.

**Key implementation points:**
- aspect-video container for 16:9 proportion
- **On mobile: use `sm:min-h-[Xpx]` not `min-h-[Xpx]`** — otherwise the aspect ratio forces width wider than viewport
- Play button with `animate-ping` behind for pulse
- Floating badge with pulsing dot for liveness

**Replacement pathway:** When the real video exists, replace the static frame with a `<video>` element. Keep the chrome, badge, and caption overlay.

---

## 12. Connected Flow (features-as-system)

**When to use:** Features section when you need to show that features connect as a system, not just coexist.

**What it is:** 3 cards in a row. Each has a "flow pill" at top naming its role in the system (e.g., "Brings customers in" / "Builds trust" / "Turns them into customers"). Arrow circles between cards. Big background numerals per card. Bottom callout pill tying the system together.

**Why it works:** "Everything connects" stops being a claim and becomes a visual. Flow pills make each card's role in the system explicit.

**Key implementation points:**
- Connector arrows between cards (hidden on mobile)
- Optional horizontal line gradient across cards at the icon level
- Flow pill: rounded-full pill with small bullet dot
- Bottom callout pill summarizing the system

---

## 13. Timeline with Per-Milestone Stats

**When to use:** Timeline / milestone sections where you want concrete numbers per stage.

**What it is:** Vertical timeline (icon + milestone badge + title + description) on the left. Right column has per-milestone stats card showing "BY THEN YOU'LL HAVE" header + list of stat/value pairs. Final milestone gets a special treatment (colored badge, accent values) for visual hierarchy.

**Why it works:** Timelines without numbers feel like vague promises. Adding concrete stats per milestone makes the arc believable.

**Key implementation points:**
- 12-col grid: 7 for content, 5 for stats card
- Stats card intensifies as milestones progress (neutral → lightly accented → fully accented)
- Final milestone: accent badge ("THE PAYOFF" / "THE RESULT"), accent color on stat values

---

## 14. Social Proof with Avatar Circles and Highlighted Numbers

**When to use:** Testimonial / social proof section. Replaces generic gray cards with higher-trust treatment.

**What it is:** Per-quote card:
- Stars at top-left
- "VERIFIED" badge at top-right
- Quote with specific numbers **highlighted** (e.g., orange tinted background)
- Avatar circle with initials (colored bg, rotating colors across quotes)
- Name, role + company, location + context

**Why it works:** Highlighting numbers makes the reader's eye land on the proof. Avatar + name + location combo feels like a real person. VERIFIED badge adds trust without needing a logo.

**Key implementation points:**
- Highlight numbers with `<span>` that has accent tinted background, padding, rounded corners
- Avatar circle: 10×10 rounded-full with 2-letter initials, colored bg
- VERIFIED badge: emerald tinted pill, small uppercase text

**Content principle:** Highlight the numbers that do the selling. Not every quote needs a highlight — only the dollar amounts / time savings / percentage wins.

---

## Composition rules

- **No more than 2 dark sections on one page** — they overpower. Place strategically (one narrative moment + final CTA).
- **Alternate whites and grays** for light sections to create rhythm. Avoid 3 of the same bg in a row.
- **One "wow" pattern per page.** If you use 7 patterns here on one page, none stand out. Pick 4–6 that serve the narrative.
- **Match vertical rhythm.** Use consistent section padding. Breaking rhythm looks like a bug.
- **Reuse one icon library.** Don't mix Lucide + emoji + custom SVGs. Pick one source and stick to it.

---

## Choosing patterns for your page

Map sections to patterns based on the job each section does:

| Section job | Pattern |
|---|---|
| Recognition of current pain | Sticky-note wall |
| "Who is this for" self-identification | Trade/specialty wall |
| Compounding / stacking over time | Growing cards |
| Service process / numbered steps | Numbered process cards |
| Feature system showing interconnection | Connected flow |
| Timeline with concrete numbers | Timeline with stats |
| Hero with product peek | Live system / Before-after / Economic dashboard / Video player |
| Social proof | Avatar + highlighted numbers |
| Price reveal | Value math stack |
| Final CTA | Stat strip + avatar cluster |

Don't force a pattern where another would fit better. Don't add a pattern because it's cool. Every pattern must serve a specific job.

---

## Additional generic patterns worth knowing

### Live calculator with live-updating CTA

**When to use:** a page making an economic argument where the reader's specific numbers differ materially from a default.

**What it is:** multi-slider calculator that recomputes live, dispatches a CustomEvent carrying its current total; a downstream block (usually the final CTA) subscribes to the event and reflects the tuned number.

**Why it works:** static "here's the math for a generic user" doesn't land. Letting the reader tune the inputs and carrying their number forward to the CTA makes the pitch feel specifically about them. CustomEvent wiring is clean — no shared global state, no prop drilling.

**Implementation notes:**
- `'use client'` on both calculator and subscriber
- Dispatch: `window.dispatchEvent(new CustomEvent('<page-slug>-math:update', { detail: { total, ... } }))`
- Subscribe: `useEffect(() => { const h = e => setState(e.detail); window.addEventListener(...); return () => window.removeEventListener(...) }, [])`
- Subscriber default matches the calculator default

### Scoped sub-component folder

**When to use:** any page with 10+ blocks.

**What it is:** each block in its own `.tsx` file in a scoped folder; the parent page is a thin orchestrator (~50 lines) that composes blocks. Prevents the 1000-line single component that's impossible to audit block-by-block.

### Documentary-style generated imagery

**When to use:** a page needs emotional weight at a specific moment (payoff, humanization, scenario) and real photography isn't available.

**What it is:** images generated via an image-generation model using documentary/editorial prompts (Kodak Portra 400, 35mm, natural lighting, captured-moment framing). **Not stock.** Prompts explicitly say "NOT stock photography" and specify a real moment.

**Prompt template:**
> *Documentary-style photograph of [specific moment with specific people]. [Setting]. [Age + clothing details]. Natural [time-of-day] light from [specific source]. Shot on Kodak Portra 400 35mm, subtle film grain, shallow depth of field. Captured-in-the-moment, not posed. Editorial magazine feel — NOT stock photography. Wide landscape composition.*

**Convert PNG → WebP** before commit: `magick src.png -quality 82 dst.webp`, delete PNG. Page-weight drops 80–90%.

### Composite testimonial (ethical framing)

**When to use:** your page needs testimonial weight but you don't yet have real named customers who've consented to quotes.

**What it is:** an anonymized card framed as supporting evidence, not a real customer quote.

- **Name field:** role + size + setting, not a first name. `"GM of a 22-truck shop · Southwest U.S. · Runs on [major tool]"` instead of `"Lisa M., [Shop Name]"`
- **Badge:** muted **Composite** in slate/gray, never **Verified** in emerald
- **No avatar photo** — even a generated one reads as deceptive next to a composite quote
- **Section intro** makes attribution explicit: *"Composite quotes drawn from conversations with N [audience]. Real named customers will replace these at launch."*

**Why this matters:** the alternative (full name + location + star rating + "Verified" badge on an invented quote) is deceptive-advertising territory.

---

# Anti-patterns: the AI-SaaS tells to hunt and kill

After pages have substance, their biggest enemy becomes **template residue** — patterns that make them read as AI-generated. Every polish pass should audit against these.

## A1. Eyebrow → big headline → lede on every block

**Tell:** every section opens with the same 3-line pattern. Used 10 times in a row, no human designer would repeat it.

**Fix:** vary openers. Some blocks open with a quote. Some with a single sentence. Some with a huge number. Keep the eyebrow pattern on 2–3 blocks, not all of them.

## A2. Icon-in-colored-rounded-square on every feature

**Tell:** `w-12 h-12 rounded-xl bg-<accent>-100 text-<accent>-600` — the shadcn default. Every feature, stat, trust cue has one.

**Fix:** strip tiles from at least 2 blocks. Icons can stay in product-UI mocks (where functional). Not on every marketing feature.

## A3. Accent-colored proof pill on every stat

**Tell:** `bg-<accent>-50 text-<accent>-700 rounded-full` on every stat, 15+ times per page.

**Fix:** most stats should be plain text in prose. A pill is for 1–2 stats per page.

## A4. Gradient text on every accent word

**Tell:** `bg-gradient-to-r ... bg-clip-text text-transparent` on every H2.

**Fix:** use on **one** headline per page. Strongest typographic moment gets the gradient.

## A5. The cliché dark closer

**Tell:** dark section + radial gradient + stat strip of 3–4 pills + avatar cluster + single accent button.

**Fix:** vary. Warm white with a big typographic statement works. If you must use the dark-gradient form, strip decoration.

## A6. Every block is a card grid

**Tell:** 2/3/4-col rounded-2xl bordered white cards on every block.

**Fix:** ≥2 blocks per page break the card pattern — typography in air, asymmetric 1-big + 2-small, or a full-width quote with no frame.

## A7. Checkmark + muted text list for every enumeration

**Tell:** `<CheckCircle2 /> Feature description` on every enumeration.

**Fix:** vary list presentation — flowing prose with inline emphasis, numbered steps, 2-col table.

## A8. "Verified" badge on fabricated testimonials

**Tell:** green "Verified" next to a placeholder name on an invented quote.

**Fix:** use the Composite pattern. If the testimonial isn't real, don't claim it is.

## A9. Em-dashes everywhere

**Tell:** em-dashes appearing 20+ times. Known LLM tell.

**Fix:** grep for `—`. For each, ask: would a period or comma work? Usually yes. Target: <10 on a full page.

## A10. "N ways / N steps / N pillars" framing

**Tell:** bulleted structure forced regardless of content fit.

**Fix:** write content first, let structure emerge. Don't force "five ways" onto what's naturally two things.

---

## Audit-against-anti-patterns counts

Before declaring a polish pass done, count:

- Eyebrow openings per page: ≤3 (flag ≥7)
- Icon tiles per block: ≤2 (flag if every feature has one)
- Proof pills per page: ≤3 (flag ≥10)
- Gradient-accent-word headlines per page: 1 (flag ≥3)
- Blocks using card-grid pattern: ≤70% (flag if all do)
- Em-dashes in prose: <10 (flag >20)

If any count is in the flag range, you have template residue to kill.

---

## Project-specific patterns

_Build your own patterns here. Document the ones you create that are unique to your product._

- _(add entries here as you create project-specific patterns)_
