# Design Agent Guidebook

A working methodology for iterating on landing-page design with an AI agent. This is a **working process**, not a style guide: how to diagnose, iterate, and ship a landing page that lands for real humans.

The spine of the whole thing is one loop:

```
screenshot → diagnose → propose → build → screenshot → repeat
```

Everything else is scaffolding around that loop.

---

## Read these in order

1. **[workflow.md](./workflow.md)** — The core loop, audit framework, mobile pass, parallel-agent rules
2. **[content.md](./content.md)** — Voice, plain language, anti-jargon, testimonial ethics
3. **[patterns.md](./patterns.md)** — Anti-patterns (AI-SaaS tells) to hunt and kill, plus the kinds of visual moments worth building
4. **[checklist.md](./checklist.md)** — Quick reference, 7-dimension audit, verdict system

---

## The seven principles that actually matter

### 1. Never build blind
Every design change needs visual confirmation. Code → screenshot → react → next change. When you skip the screenshot, you're gambling. Half of the "obviously correct" changes you ship will look wrong at the pixel level. The other half will be fine. You can't tell which is which without looking.

### 2. The visual feedback loop is the product
If you don't have a fast way to see your changes in context, you're building in a vacuum. Set up Playwright (or equivalent) as the browser, dev server on localhost, and screenshot per-section after every meaningful change. Setup takes minutes. It saves hours downstream.

### 3. Structure before style
Don't polish a section that's going to be cut. Don't obsess over copy in a section that shouldn't exist. Walk the whole page first, decide what earns its space, then improve what stays.

### 4. Write to one specific person, not a persona
A persona is "small business owner, 35-55." A specific person is a named individual with an age, a daily schedule, a spouse who has opinions, a senior employee with no succession plan, and a phrase they'd use to describe their own problem. You can't write good copy for a persona. You can for a person.

### 5. Plain language beats clever language
Jargon is a tax on the reader. Whenever you can swap a business-school word for an English word, do it. If the reader has to look up a term, you've lost them. If a sentence sounds like a TED talk, rewrite it until it sounds like two people talking at a diner.

### 6. Remove more than you add
The default instinct on a maturing page is to add — a new block, a calculator, an image, a proof badge. That instinct is almost always wrong on the second or third pass. By then the page has enough *substance*; what it's missing is *restraint*. The highest-leverage single action a polish pass can take is to kill decorative elements that don't earn their place. If your diff skews heavily additive on a maturing page, you're probably adding template residue, not value.

### 7. Hunt the AI-design tells
AI-generated landing pages have recognizable tells: every block opens with `eyebrow pill → display headline → lede`; every feature has an icon in a colored rounded square; every stat lives in an accent-colored proof pill; every accent word in a headline gets a gradient color span; every closer is a dark section with a radial gradient, stat pills, and a single accent button. The individual choices are fine. The sameness across every block is the tell. Thoughtful designers break rhythm deliberately. See [patterns.md — anti-patterns](./patterns.md).

---

## What a typical pass actually does

Order changes per project, but the flow is roughly:

1. **Context loading** — read the existing page, understand the stack, check conventions
2. **Audience investigation** — demographics, real pain points, tools they actually use
3. **Positioning reset** — before any pixel work, decide the core story
4. **Section-level restructure** — propose a new page order, decide what to delete, add, or move
5. **Multi-concept exploration** — write 2–3 hero variants, wrap them in a visible picker so they can be compared in-context
6. **Block-by-block visual audit** — per-section screenshot, diagnose, score improvement probability, fix where probability is high
7. **Mobile responsive pass** — resize browser to 375px, fix overflow section by section
8. **Language simplification** — replace jargon with plain language, catch over-corrections
9. **Header + footer alignment** — make containers consistent across the page
10. **Honest scoring** — assess what's done vs. what still needs real customer data, real screenshots, A/B data

---

## The mistakes that will burn you

Recording these so the next pass doesn't repeat them:

- **Building without looking** — making "obviously correct" changes without screenshotting. Every subsequent change should get a screenshot.
- **Over-simplifying copy** — replacing a phrase with deliberate parallelism (their/your, before/after) with a flat version that loses the structure. Preserve parallelism when you simplify.
- **Service-worker caching** — spending rounds wondering why changes aren't rendering because a PWA service worker is caching the old page. Unregister + clear caches + use cache-busting query strings.
- **Promising features that don't exist** — first-draft copy promising capabilities that aren't built. Confirm everything you claim is real before merging.
- **Fabricated content presented as real** — using realistic-sounding placeholder names and numbers and forgetting to flag them. Mark every fabrication clearly, every time. See [content.md — testimonial ethics](./content.md) for the safe pattern.
- **First audit passes that are all copy, no design** — the agent picks the safe escape hatch (a `TUNE` verdict, a few word swaps) and declares the block done. Kill `TUNE` from your verdict set; require all 7 audit dimensions to be addressed.
- **"100% done" claims after one pass** — a single execution pass almost always leaves value on the table. Loop until the block is genuinely as strong as you can make it without external input. Then run a fresh-eyes pass with a different agent.
- **Parallel-agent file-boundary violations** — when running multiple agents on sibling pages, they'll touch shared trees unless their briefs are explicit. Every brief must list off-limits files by name.
- **Treating screenshots as blocking** — when headless browser auth gates fail, the temptation is to abandon the audit. Code-based analysis can carry rigor without screenshots; treat screenshots as best-effort.
- **Composite testimonials that look real** — fabricated quotes attached to fabricated names with "Verified" badges. That's deceptive-advertising territory. Use the Composite pattern (see [content.md](./content.md)).
- **Skipping generated imagery** — defaulting to "no photos" instead of "photos specific to this moment." A carefully-prompted documentary image can carry emotional weight that a CSS mockup can't.

---

## When to use this guidebook

- Starting a landing-page redesign from scratch
- Iterating on an existing landing page that needs a refresh
- Auditing a page that "technically works but doesn't land"
- Building a multi-role or multi-persona pitch
- Shipping responsive design under time pressure

## When NOT to use it

- Production pages with real customer data — this workflow uses fabricated names/numbers as placeholders. Real shipping pages need real proof.
- Transactional flows (checkout, dashboard) — that's UX engineering, not marketing design.
- Brand systems / design tokens — different job.

---

## The iteration-pass taxonomy

Not every design pass is the same kind of pass. Pick the type deliberately before you start:

| Pass type | When | What you do | What success looks like |
|---|---|---|---|
| **Structural redesign** | Page is new or structure is wrong | Rebuild blocks, add interactivity, generate images, move blocks around | +N lines of substantive work; every block audited against 7 dimensions |
| **Fresh-eyes review** | After a substantive pass, before shipping | New agent challenges the previous pass's "100%" claim — mobile, a11y, skim-path, cross-block coherence | Finds 5–15 things the original author missed, but no big rewrites |
| **Design polish (anti-template)** | Page has substance but looks template-y | Remove decorative elements, break rhythm, vary scales, drop icon/pill templates | Net diff is **subtractive**; feels more human, less AI |
| **Open-questions pass** | Everything else is done | Flag real-testimonial gaps, pricing decisions, routing gaps — don't try to invent answers | A list of decisions the human needs to make before launch |

Running the wrong pass type at the wrong time wastes effort. Anti-template polish on an empty page is silly. Structural redesign on a page that's already too dense is harmful.
