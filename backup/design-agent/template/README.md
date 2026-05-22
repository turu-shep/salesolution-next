# Design Agent Guidebook

A working methodology for iterating on landing-page (or marketing-page) design with an AI agent driving a real browser. Built from hard-earned lessons across real project work.

This isn't a style guide or a design system. It's a **working process**: how to diagnose, iterate, and ship a page that actually lands for real humans — without building blind, without polishing what's about to be cut, without writing copy that sounds smart but doesn't land.

---

## How to use this template

1. Copy this `/design-agent/` folder to the root of any project where you're iterating on a marketing page with an agent
2. Read the files in order below
3. As you work, record project-specific lessons at the bottom of each file (what jargon you replaced, what patterns you built, what mistakes you made)
4. Hand the folder to the next agent who picks up the project

The template captures the **methodology**. Your project adds the **specifics**.

---

## Read in order

1. **[workflow.md](./workflow.md)** — The core loop: audit → propose → build → verify. Setup, tools, mobile pass, scoring rubric.
2. **[content.md](./content.md)** — Messaging and copy principles. Voice, jargon blacklist, recognition vs. aspiration, headline tests.
3. **[patterns.md](./patterns.md)** — Catalog of reusable visual patterns, when to use each, implementation notes.
4. **[checklist.md](./checklist.md)** — Print-and-tape reference. Per-section audit loop, mobile checks, common pitfalls.

---

## The seven principles that actually matter

*(Five are from the original landing-page session. Two were earned in a later multi-page audit cycle — they're included now so your project starts from the updated floor.)*


### 1. Never build blind
Every design change needs visual confirmation. Code → screenshot → react → next change. When you skip the screenshot, you're gambling. Half the "obviously correct" changes will look wrong at the pixel level. You can't tell which half without looking.

### 2. The visual feedback loop is the product
If you don't have a fast way to see your changes in context, you're building in a vacuum. Set up a real browser (Playwright MCP or similar), dev server on localhost, per-section screenshots after every meaningful change. Setup takes 10 minutes. Skipping it costs hours.

### 3. Structure before style
Don't polish a section that's going to be cut. Don't obsess over copy in a section that shouldn't exist. Walk the whole page first, decide what earns its space, then improve what stays. Expect to delete at least one section you thought was essential — it's often redundant with two or three others.

### 4. Write to one specific person, not a persona
A persona is a demographic. A specific person is a named individual with a daily schedule, specific pains, and vocabulary. You can't write good copy for "small business owners." You can for "Mike, 54, who runs [their shop] with his spouse doing the books, whose senior employee is retiring next year and has no succession plan." Write for the named person.

### 5. Plain language beats clever language
Every business has its jargon. Kill it. "Moat" is business school. "Hard to copy" is English. "MRR" is SaaS. "Monthly income" is English. "Capture demand" is marketing. "Get the calls before the competitor does" is English. When the reader doesn't know what your word means, they aren't the problem — you are.

### 6. Remove more than you add
On any second or third pass, the default instinct to add something (a new block, a calculator, an image, a proof badge) is almost always wrong. By then the page has enough *substance*; what it's missing is *restraint*. The highest-leverage single action a maturing design pass can take is to kill decorative elements that don't earn their place. If your diff skews heavily additive, you're probably adding template residue.

### 7. Hunt the AI-design tells
AI-generated landing pages have recognizable tells: every block opens `eyebrow → display headline → lede`, every feature has an icon in a colored rounded square, every stat lives in an accent-colored proof pill, every accent word in a headline gets a gradient color span, every closer is a dark section with a radial gradient + stat pills + single orange button. The individual choices are fine. The *sameness* across every block is the tell. A thoughtful human designer breaks rhythm deliberately — asymmetric layouts, some blocks with no icons, some with no cards, varied CTA treatments. See [patterns.md — Anti-patterns](./patterns.md).

---

## A typical working order

Not prescriptive — the order changes per project — but this flow works:

1. **Context loading** — read the existing page/materials, understand the stack, check conventions
2. **Audience investigation** — demographics, industry climate, real pain points, the tools they actually use
3. **Positioning reset** — decide the core story and 2–3 jobs the page must do
4. **Section-level restructure** — propose a new page order, delete anything without a clear job
5. **Multi-concept exploration** — for high-stakes blocks (hero, headline), build 2–3 variants side-by-side and compare
6. **Block-by-block visual audit** — per-section screenshot, diagnose, score improvement probability, fix where probability is high
7. **Mobile responsive pass** — resize browser to 375px, fix overflow issues section by section
8. **Language simplification** — replace jargon with plain language, catch your own over-corrections
9. **Consistency pass** — align header/footer/section containers so the page feels unified
10. **Honest scoring** — what % of potential is realized? What would require real data/assets to push further?

---

## Things that reliably go wrong

Record new ones as you hit them. These are the reliable offenders:

### Building blind
Writing/changing things without looking at the rendered result. Solution: no edit ships without a before and after screenshot in hand.

### Over-simplifying copy
Removing jargon but also removing intentional structure (parallelism, duality, contrast). Solution: before replacing a phrase, check whether it has deliberate grammatical structure worth preserving.

### Service worker caching
If the project is PWA-enabled, a service worker can cache the old page indefinitely. Your changes "aren't showing up." Solution: unregister service workers, clear caches, use `?bust=N` query strings.

### Promising features that don't exist
Landing page says "we'll walk you through it" when no one has built the onboarding yet. Solution: verify every promise against the product roadmap before shipping copy.

### Fabricated content read as real
Placeholder names, photos, dollar numbers that look like real testimonials. Solution: mark illustrative content visibly, plan the swap, never launch without disclosure.

### Mobile as an afterthought
Fixing mobile responsive after all desktop work is done. Solution: treat mobile as a dedicated phase with its own screenshot pass at 375px.

### Polishing the wrong section
Investing in a block that's going to be cut in the restructure. Solution: structure pass before style pass, always.

### Mixing icon libraries
Lucide + emoji + custom SVGs in the same page. Solution: pick one source, stick to it.

---

## When to use this guidebook

- Starting a landing-page redesign from scratch
- Iterating on an existing landing page that needs a refresh
- Auditing a page that "technically works but doesn't land"
- Building a multi-role or multi-persona pitch
- Shipping responsive design under time pressure
- Handing off design work to another agent mid-project

---

## When NOT to use this

- Production pages with real customer data — this workflow uses illustrative names/numbers as placeholders. Real shipping pages need real proof.
- Transactional flows (checkout, dashboard, settings) — those are UX engineering, not marketing design.
- Brand systems / design tokens / component libraries — different job.
- Pages where the content is 100% user-generated — no copy to craft.

---

## The scoring framework

Rate each dimension 0–100. Average them for your % of potential.

| Dimension | 100% means |
|---|---|
| Information architecture | Every section earns its space, redundancy removed, clear narrative arc |
| Visual variety per section | Each section has distinct treatment, no three-card-tile repetition |
| Copy quality | Voice-matched to audience, plain language, specific examples, earned punch lines |
| Distinctiveness vs competitors | Unique framings and visual moments, nothing generic |
| Conversion clarity | CTA path obvious, pricing clear, next step concrete |
| Mockup authenticity | Real product screenshots, not HTML/CSS mockups |
| Real proof | Real names, photos, numbers from real customers |
| Mobile responsiveness | Tested at 360, 768, 1024, 1440, 1920+ without overflow |
| Performance | Lighthouse > 90, fonts optimized, images lazy-loaded |
| Trust signals | Compliance badges, customer counts, logos where appropriate |
| Demo / video | Working demo video embedded, not a placeholder |

**~75% is typical for in-session work.** The remaining 25% usually requires out-of-session assets: real customers, real screenshots, real testing, A/B data. Acknowledge those as known gaps, not failures.

---

## Iteration-pass taxonomy

Not every design pass is the same kind of pass. Know which one you're running:

| Pass type | When | What you do | What success looks like |
|---|---|---|---|
| **Structural redesign** | The page is new or the structure is wrong | Rebuild blocks, add interactivity, generate images, move blocks | +N lines of substantive work across all 7 dimensions |
| **Fresh-eyes review** | After a substantive pass, before shipping | New agent challenges the previous "100%" claim — mobile, a11y, skim-path, coherence | Finds 5–15 things the original author missed, no big rewrites |
| **Design polish (anti-template)** | Page has substance but looks template-y | Remove decorative elements, break rhythm, vary scales, drop icon/pill templates | Net diff is **subtractive** (removes more than it adds) |
| **Founder-blocked open-questions** | Everything else is done | Flag real-testimonial gaps, pricing decisions, routing gaps — don't invent answers | A list of decisions the human needs to make before launch |

Running the wrong pass type at the wrong time wastes effort. Pick deliberately.

---

## Project-specific notes

_Use this space to record lessons specific to your project: audience details, jargon you replaced, patterns you built, mistakes that were unique to your stack._

- _(add entries here as you work)_
