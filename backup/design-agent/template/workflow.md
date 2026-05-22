# Workflow: The Core Loop

The fundamental pattern for iterating on landing-page design with an agent + browser automation.

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   1. Screenshot the current state of a section              │
│              ↓                                              │
│   2. Diagnose what's weak (specific, not general)           │
│              ↓                                              │
│   3. Score improvement probability (skip low-prob work)     │
│              ↓                                              │
│   4. Propose 1–3 concrete options with tradeoffs            │
│              ↓                                              │
│   5. Build the chosen option                                │
│              ↓                                              │
│   6. Screenshot to verify                                   │
│              ↓                                              │
│   7. Move to next section OR iterate on same if needed      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

Each step has specific techniques. Skipping any of them almost always costs you time downstream.

---

## Setup (do this once per session)

### 1. Start the dev server
```bash
npm run dev
# or whatever your dev command is
```
Note the actual port the server uses (frameworks often fall back to +1 if the default is taken).

### 2. Handle auth/password gates
If the app is behind authentication or a password middleware, handle it via Playwright first, then proceed.

### 3. Load Playwright MCP tools
You'll need at minimum:
- `browser_navigate`, `browser_take_screenshot`
- `browser_resize` (for mobile viewport testing)
- `browser_evaluate` (for DOM queries, scrolling, overflow detection)
- `browser_snapshot` (when `take_screenshot` doesn't give you what you need)
- `browser_type`, `browser_click` (for interacting with auth forms, modals)

### 4. Defeat the service worker (if PWA-enabled)
```js
// Run once via browser_evaluate
() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
  }
  if ('caches' in window) {
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))));
  }
}
```
After that, append `?bust=N` query strings on subsequent navigations (incrementing N) to force fresh responses.

### 5. Keep dev server output visible
Use a background bash/terminal that tails the dev server output. When changes don't render, the compile error is usually there.

---

## The audit phase

Before editing anything, walk the page. This prevents polishing cut-bound sections.

### Collect section offsets
```js
// Run via browser_evaluate
() => {
  const find = (text) => {
    for (const el of document.querySelectorAll('h1, h2, h3, section')) {
      if (el.textContent?.includes(text)) {
        let p = el; while (p && p.tagName !== 'SECTION') p = p.parentElement;
        return p ? p.offsetTop : el.offsetTop;
      }
    }
    return null;
  }
  return {
    // Add entries for each section's unique headline/anchor
    hero: find('your hero headline keyword'),
    features: find('some feature section keyword'),
    pricing: find('pricing headline keyword'),
    // ...
    pageHeight: document.body.scrollHeight,
  }
}
```
This gives you a scroll map. For each offset, scroll there, screenshot, audit.

### Per-section audit template
For each section, answer:
- **What is this section's job?** (In one sentence. If you can't name it, cut the section.)
- **Does the content achieve the job?** (Yes / partially / no)
- **Is the visual treatment serving the content or fighting it?**
- **Does it overlap with another section's job?** (If yes, one of them cuts.)
- **Improvement probability:** High / Medium / Low. Only invest in High.

### The 7-dimension framework

For a rigorous pass (especially sub-agent-driven), every block gets scored on all seven dimensions, not just "is this working":

| Dimension | Key questions |
|---|---|
| **Structure** | What job is this block doing? Does it do one clear thing? Is it necessary? |
| **Messaging** | Voice-consistent? Forbidden words? Reading level appropriate? |
| **Visual** | Density, hierarchy, whitespace, rhythm with neighbors. Dead zones? |
| **Elements** | Right components for the job? Missed opportunities? |
| **Imagery** | Photo/illustration/diagram earning its place? Missing where it should be? |
| **Flow** | How does this block receive momentum from the previous and hand off to the next? |
| **Order** | Right position in the page narrative? |

Common failure mode: touching only one or two dimensions (usually Messaging + Visual) and calling it done. If your diff skews 80% copy, you've ignored 6 of the 7 dimensions.

### The verdict system

End each block's audit with an explicit verdict. `TUNE` is explicitly banned — it's where audits go to die.

- **KEEP** — block is already the strongest it can be without founder input *(use sparingly; >20% of blocks getting KEEP means you're under-auditing)*
- **REWRITE** — copy needs substantive rework (a new argument, not a word swap)
- **REDESIGN** — visual/structural rework: new layout, components, interaction, imagery
- **REORDER** — block fine but wrong position; name the new target position
- **REMOVE** — block doesn't earn its place
- **ADD** — used in the summary pass for missing blocks

If a block only deserves a comma tweak → KEEP. If it needs real work → pick a substantive verdict.

### The "useless section" test
Ask: "If I deleted this section, what would the page lose?" If the answer is "nothing the rest of the page doesn't also cover," cut it. It's often the case that 2–3 sections address similar territory; pick the strongest and delete the others.

---

## The improvement phase

### Score probability honestly
- **High probability:** Section is clearly weak, fix is clear, implementation is tractable in under an hour. → Go.
- **Medium probability:** Could be better but has diminishing returns. → Park it unless nothing else is left.
- **Low probability:** Section is working. Don't touch it just to touch it.

### Propose before building (for anything risky)
Especially for changes that alter layout, messaging, or remove content: write 1–3 options with tradeoffs. Example format:

> **Option A — [approach]**
> Tradeoff: [upside vs. downside]
>
> **Option B — [approach]**
> Tradeoff: [upside vs. downside]
>
> **Option C — [approach]**
> Tradeoff: [upside vs. downside]
>
> **Recommendation:** [which and why]

User picks, you build. If the user says "do all of them," use a [ConceptPicker wrapper](./patterns.md) so they can compare side-by-side on the live page.

### Build in parallel where possible
Multiple independent edits (different files, non-conflicting regions) can batch in one tool call. Don't serialize when you don't have to. Serial edits to the same file may need to be split across messages because of tool ordering.

### Always screenshot to verify
Before moving to the next section:
1. Reload with `?bust=N`
2. Scroll to the section's offset
3. Screenshot
4. Compare to your mental model of what you intended

If the screenshot reveals something off (spacing wrong, color clash, text overflow), fix it before moving on. The next section's change will make this one harder to see.

---

## Mobile responsive pass

Do this as a **separate phase**, not mixed with content work. It has its own failure modes.

### Setup
```js
// Resize via Playwright
await page.setViewportSize({ width: 375, height: 812 });
```
Common test viewports: 360 (small Android), 375 (iPhone), 390 (iPhone Pro), 768 (tablet), 1024, 1440, 1920.

### Overflow detection script
The go-to tool for finding mobile breaks:
```js
() => {
  const all = document.querySelectorAll('*')
  let widest = { width: 0, tag: '', cls: '' }
  for (const el of all) {
    const rect = el.getBoundingClientRect()
    if (rect.width > widest.width && rect.width > 376) {
      widest = {
        width: Math.round(rect.width),
        tag: el.tagName,
        cls: (el.className?.toString() || '').slice(0, 100),
      }
    }
  }
  return { widest, viewport: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }
}
```
This tells you exactly which element is forcing layout wider than the viewport.

### Common culprits and fixes

| Symptom | Cause | Fix |
|---|---|---|
| Grid item wider than column | `min-width: auto` (default) on grid items | Add `min-w-0 w-full` to grid item |
| aspect-ratio element forces huge width | `aspect-video min-h-[Xpx]` → width = X × 16/9 | Change to `aspect-video sm:min-h-[Xpx]` so min-h only applies on sm+ |
| Mockup overflows right side | Fixed `max-w-md` regardless of viewport | Change to `max-w-[min(100%,28rem)]` |
| Headline wraps to many lines on mobile | Same font-size at all breakpoints | Mobile-specific size: `text-[1.875rem] sm:text-[2.5rem] md:text-display-xl` |
| Grid doesn't stack on mobile | Only `lg:grid-cols-2` set, default is ambiguous | Explicit: `grid grid-cols-1 lg:grid-cols-2` |
| Absolutely-positioned element extends off-screen | Negative offsets (`-left-12`, `-right-16`) | Wrap parent with `overflow-hidden` or reduce offsets at smaller breakpoints |
| Button text doesn't fit | Long label + large horizontal padding | Responsive padding, or shorter mobile-only label |

### Verify each section on mobile
Same loop as desktop. Section by section. Screenshot. Fix. Screenshot.

### Verify desktop still works
Mobile fixes can subtly break desktop. Resize back to a large viewport (1440 or 1920) and scroll through. Compare against earlier desktop screenshots.

---

## The "execute nonstop" mode

When the user tells you to drive without asking, you still need to screenshot. But you consolidate:
- Don't ask which option — make the call, state it in 1 sentence before executing
- Don't propose before building unless the change is high-risk
- Don't narrate intermediate steps — show results

When the user says "nonstop" they mean "don't stop to ask," NOT "don't stop to look." Keep the visual loop.

---

## Handling user feedback mid-loop

When the user gives negative feedback on a recent change:
1. Acknowledge the concern specifically (repeat back what they saw)
2. Diagnose WHY it's wrong (not just that it's wrong)
3. Propose the fix before executing
4. Check if OTHER recent changes have the same issue (often one bad pattern repeats)

When the user says "this is too much" or "this breaks the messaging" — believe them. They have context you don't. Restore the previous version or a better variant. Don't defend the change.

---

## When to stop

- **You scored the page at or above target %** (~75% in-session is typical).
- **The remaining improvements require real data** (real customer stories, real screenshots, real performance testing) you can't manufacture.
- **The user has given negative feedback on the last 2 changes** — you've hit diminishing returns. Regroup.
- **Tests/lint are failing because of design changes** — stop, fix, don't accumulate debt.
- **You've been in the same section for 3+ rounds** — either the section is wrong-headed (cut it) or you're over-polishing. Move on.

---

## The % of potential scoring rubric

Rate each dimension 0–100. Average them.

| Dimension | What 100% looks like |
|---|---|
| Information architecture | Every section earns its space, redundancy removed, clear narrative arc |
| Visual variety per section | Each section has distinct treatment; no three-card-tile repetition |
| Copy quality | Voice-matched to audience, plain language, specific examples, earned punch lines |
| Distinctiveness vs competitors | Unique framings, unique visual moments, nothing you could find on a generic SaaS page |
| Conversion clarity | CTA path obvious, math reveal clear, trial offer concrete |
| Mockup authenticity | Real product screenshots, not HTML/CSS mockups |
| Real proof | Real names, photos, dollar numbers from real customers |
| Mobile responsiveness | Tested at 360, 768, 1024, 1440, 1920+ without overflow or broken layouts |
| Performance | Lighthouse > 90, fonts optimized, images lazy-loaded |
| Trust signals | Compliance badges, customer counts, logos where appropriate |
| Demo / video | Working demo video embedded, not a placeholder |

Score ~75% in session is good. 90%+ requires out-of-session assets.

---

## The self-assessment iteration loop

A single execution pass almost always leaves value on the table. After a substantive audit-and-execute pass:

1. **Re-screenshot (or re-read) the page.**
2. **Score honestly:** *"If the founder opens this page, does any block still look weaker than I could make it on my own?"* For each block, answer one of:
   - Yes, and I can fix it without founder input → add to next iteration's work list
   - Yes, but the fix needs founder input (pricing, real testimonials, internal data) → flag as open question; don't touch
   - No, this is as strong as I can make it → block is done
3. **If the next iteration list is non-empty, loop back** and execute those changes.
4. **Terminate the loop when either:**
   - Every block is "as strong as I can make it" or blocked on founder input, OR
   - An iteration produces strictly fewer substantive changes than the previous one (diminishing returns)
5. **Do not terminate early** because it feels "good enough." The termination condition is explicit — use it.

Typical iteration count: **2–5 loops** for a substantive audit.

### Fresh-eyes passes

Even after an honest self-assessment loop terminates, a **different agent** running the same loop will often find real improvements the first agent missed — especially on mobile responsiveness, accessibility, skim-path (what's a scroller's takeaway?), and cross-block coherence. Budget for a fresh-eyes pass before shipping.

---

## The polish pass (anti-template)

A distinct iteration type, worth calling out separately. Once the page has substance (content, interactivity, imagery), its biggest enemy stops being "missing pieces" and becomes "template residue" — the visual tells that make a page read as AI-generated.

See [patterns.md — Anti-patterns](./patterns.md) for the catalog. Pass rules:

1. At least 2 blocks must NOT use the dominant rounded-card pattern.
2. At least 1 block must have no icons at all.
3. At least 1 proof/stat must appear as plain text, not wrapped in a pill.
4. At least 1 block's opener must NOT be `eyebrow → display headline → lede`.
5. Vary typographic scale — not every section headline at the same size.
6. Remove ≥3 decorative elements that can't justify their place.
7. Vary CTA treatments — not every button the same pill+arrow.
8. Keep only ONE gradient-accent-word headline technique.

**Rule of thumb:** polish-pass diffs should be **net-subtractive**. If additive, you're adding new template residue, not removing old.

**Don't overcorrect** into "quirky" (wobbly borders, random rotation, novelty interactions) — that's a different flavor of AI tell. The goal is intentional restraint, not monastic minimalism and not theatrical quirkiness.

---

## Parallel agents for multi-page portfolios

When auditing multiple pages (e.g., 4+ sibling pages), run agents in parallel rather than sequentially. Each agent owns one page's file tree.

**File-boundary discipline (non-negotiable):**
- Each agent touches only its own page route + its own component subfolder + its own scripts/images + its own audit report
- Every brief must explicitly list the SIBLING agents' trees as off-limits by name, not just "shared files"
- Never touch shared UI, layout, lib, hooks, middleware, env, home page, or any config file

**Shared design vocabulary:** each agent reads the same reference components to absorb the visual language. Each agent gets a distinct accent color so sibling pages stay visually differentiated.

**Dev server:** multiple agents screenshotting the same dev server causes compile load; accept degraded reliability during parallel runs. Treat screenshots as best-effort.

---

## Screenshot fallback

The ideal is the MCP Playwright browser with the user's cached session. Reality:

- **MCP browser often locked** by the user's own Chrome on the same profile → "already in use" error.
- **Headless Playwright** works, but pages gated behind client-side auth hydration may not clear the loader in time (headless has no cached session).
- **Stale `.next/trace` lockfiles** from crashed dev-server processes deadlock new `npm run dev` starts.

**Practical guidance:** treat screenshots as best-effort, not blocking. Code-based analysis (component trees, Tailwind classes, referenced vocabulary) is rich enough for a rigorous audit. The human can verify on their own browser.

When screenshots matter most: mobile breakpoint (375px) on consumer-facing pages, and first/last visual of each page (hero + final CTA). If only a few screenshots land, prioritize those.

---

## Project-specific workflow notes

_Record any workflow quirks specific to your project: auth flows, cache issues, special tooling._

- _(add entries here as you work)_
