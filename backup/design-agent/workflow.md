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

Each step has specific techniques. Skipping one almost always costs you.

---

## Setup (do this once per session)

### 1. Start the dev server
```bash
npm run dev
```
Note the port it actually uses (Next.js falls back to 3001, 3002 if 3000 is occupied).

### 2. Handle any auth/password gate
If the app is behind a password protection middleware or auth wall, authenticate via the browser tool first, then proceed.

### 3. Load Playwright MCP tools (or equivalent)
You'll need at minimum:
- `browser_navigate`, `browser_take_screenshot`
- `browser_resize` (for mobile viewport testing)
- `browser_evaluate` (for DOM queries, scrolling, overflow detection)
- `browser_snapshot` (when `take_screenshot` doesn't give you what you need)

### 4. Defeat the service worker (if PWA-enabled)
```js
// Run once via browser_evaluate
if ('serviceWorker' in navigator) {
  const regs = await navigator.serviceWorker.getRegistrations();
  for (const r of regs) await r.unregister();
}
if ('caches' in window) {
  const keys = await caches.keys();
  await Promise.all(keys.map(k => caches.delete(k)));
}
```
Use `?bust=N` query strings on subsequent navigations to force fresh responses.

---

## The audit phase

Before editing anything, walk the page. This prevents polishing cut-bound sections.

### Collect section offsets
```js
// Run via browser_evaluate
() => {
  const find = (text) => {
    for (const el of document.querySelectorAll('h2, h1, section')) {
      if (el.textContent?.includes(text)) {
        let p = el; while (p && p.tagName !== 'SECTION') p = p.parentElement;
        return p ? p.offsetTop : el.offsetTop;
      }
    }
    return null;
  }
  return {
    hero: find('your headline anchor'),
    section2: find('another anchor'),
    // ...
    pageHeight: document.body.scrollHeight,
  }
}
```
This gives you a map. Scroll to each offset, screenshot, audit.

### Per-section audit template
For each section, answer:
- **What is this section's job?** (In one sentence. If you can't name it, cut the section.)
- **Does the content achieve the job?** (Yes / partially / no)
- **Is the visual treatment serving the content or fighting it?**
- **Does it overlap with another section's job?** (If yes, one of them cuts.)
- **Improvement probability:** High / Medium / Low. Only invest in High.

### The 7-dimension framework

On a rigorous audit pass — especially when auditing via sub-agents — every block gets scored on all seven dimensions, not just "is this working":

| Dimension | Key questions |
|---|---|
| **Structure** | What job is this block doing? Does it do one clear thing or multiple? Is it necessary? |
| **Messaging** | Is the copy strong? Voice-consistent? Any forbidden words? Reading level appropriate? |
| **Visual** | Density, hierarchy, whitespace, rhythm with neighbors. Is the eye guided? Dead zones? |
| **Elements** | Components used (cards, chips, diagrams, stats). Right tool for the job? Missed opportunities? |
| **Imagery** | Photo / illustration / diagram present? Should one be? Does existing earn its place? |
| **Flow** | How does this block receive momentum from the previous and hand off to the next? |
| **Order** | Right position in the page narrative? Would moving it earlier/later help? |

A common failure mode: touching only one or two dimensions (usually Messaging + Visual) and calling it done. If your diff skews 80% copy, you've ignored 6 of the 7 dimensions — re-audit.

### The verdict system

End each block's audit with an explicit verdict. `TUNE` is explicitly banned — it's where audits go to die.

- **KEEP** — block is already the strongest version of itself you can produce without external input. Use sparingly; >20% of blocks getting KEEP means you're under-auditing.
- **REWRITE** — copy needs substantive rework (not a word swap — a new argument)
- **REDESIGN** — visual/structural rework: new layout, new components, new interaction, new imagery
- **REORDER** — block is fine but wrong position; name the new target position
- **REMOVE** — block doesn't earn its place
- **ADD** — (used in the summary pass for missing blocks)

If a block only deserves a comma tweak, give it KEEP and move on. If it needs work, pick one of the substantive verdicts.

### The "useless section" test
Ask: "If I deleted this section, what would the page lose?" If the answer is "nothing the rest of the page doesn't also cover," cut it.

---

## The improvement phase

### Score probability honestly
- **High probability:** Section is clearly weak, fix is clear, implementation is tractable in under an hour. → Go.
- **Medium probability:** Could be better but has diminishing returns. → Park it unless nothing else is left.
- **Low probability:** Section is working. Don't touch it just to touch it.

### Propose before building
Especially for anything that changes layout, messaging, or removes content: write 1–3 options with tradeoffs. Example shape:

> **Direction A — Richer "live system" composition** (main mockup + floating notifications)
> Tradeoff: more visual density; has to be balanced or competes with headline.
>
> **Direction B — Before/After split** (chaos on one side, clean system on the other)
> Tradeoff: strong storytelling, but abstract; less product-peek.
>
> **Direction C — Per-variant unique visuals** (3 different mockups, one per hero variant)
> Tradeoff: 3x the work; only one will ship anyway.

User picks, you build. If the user says "do all 3," wrap them in a visible concept-picker so they can compare side-by-side in the live page — yellow/amber sticky label, dashed border per concept, distinct background tint. Delete the losers and the wrapper once the call is made.

### Build in parallel where possible
Multiple independent edits (different files) can batch in one tool call. Don't serialize when you don't have to.

### Always screenshot to verify
Before moving to the next section:
1. Reload with `?bust=N`
2. Scroll to the section's offset
3. Screenshot
4. Compare to your mental model of what you intended

If the screenshot reveals something off (spacing wrong, color clashing, text overflowing), fix it before moving on. The next section change will make this one harder to see.

---

## Mobile responsive pass

Do this as a **separate phase**, not mixed with content work. It has its own failure modes.

### Setup
```js
// browser_resize to 375x812 (iPhone-ish)
await page.setViewportSize({ width: 375, height: 812 });
```

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
| aspect-ratio element forces huge width | `aspect-video min-h-[280px]` → width = 280 × 16/9 = 498px | Change to `aspect-video sm:min-h-[280px]` so min-h only applies on sm+ |
| Mockup overflows right side | Fixed `max-w-md` regardless of viewport | Change to `max-w-[min(100%,28rem)]` |
| Headline wraps to 8 lines on mobile | Same font-size at all breakpoints | Mobile-specific size: `text-[1.875rem] sm:text-[2.5rem] md:text-display-xl` |
| Grid stays 2-col on mobile | Only `lg:grid-cols-2` set, default is ambiguous | Explicit: `grid grid-cols-1 lg:grid-cols-2` |

### Verify each section on mobile
Same loop as desktop. Section by section. Screenshot. Fix. Screenshot.

### Verify desktop still works
Mobile fixes can subtly break desktop. Resize back to 1440 or 1920 and scroll through.

---

## "Execute nonstop" mode

When the user tells you to drive without asking, you still need to screenshot. But you consolidate:
- Don't ask which option — make the call and state it in 1 sentence before executing
- Don't propose before building unless the change is high-risk
- Don't narrate intermediate steps — show results

When the user says "nonstop" they mean "don't stop to ask," NOT "don't stop to look." Keep the visual loop.

---

## The self-assessment iteration loop

A single execution pass almost always leaves value on the table. After a substantive audit-and-execute pass:

1. **Re-screenshot (or re-read) the page.**
2. **Score honestly:** *"If a critical reviewer opens this page, does any block still look weaker than I could make it on my own?"* For each block, answer one of:
   - Yes, and I can fix it without external input → add to next iteration's work list
   - Yes, but the fix needs external input (pricing, real testimonials, internal data) → flag as open question; don't touch
   - No, this is as strong as I can make it → block is done
3. **If the next iteration list is non-empty, loop back** and execute those changes.
4. **Terminate the loop when either:**
   - Every block is "as strong as I can make it" or blocked on external input, OR
   - An iteration produces strictly fewer substantive changes than the previous one (diminishing returns)
5. **Do not terminate early** because it feels "good enough." The termination condition is explicit — use it.

Typical iteration count: **2–5 loops** for a substantive audit.

### Fresh-eyes passes

Even after an honest self-assessment loop terminates, a **different agent** running the same loop will often find real improvements the first agent missed — especially on mobile responsiveness, accessibility (ARIA correctness), skim-path (what's a scroller's takeaway?), and cross-block coherence. Budget for a fresh-eyes pass before shipping.

---

## The polish pass (anti-template)

A distinct iteration type, worth calling out separately. Once the page has substance (content, interactivity, imagery), its biggest enemy stops being "missing pieces" and becomes "template residue" — the visual tells that make a page read as AI-generated.

See [patterns.md — anti-patterns](./patterns.md) for the full catalog of tells to hunt. The pass rules:

1. At least 2 blocks must NOT use the dominant rounded-2xl bordered-card pattern.
2. At least 1 block must have no icons at all.
3. At least 1 proof/stat must appear as plain text, not wrapped in a pill.
4. At least 1 block's opener must NOT be `eyebrow → display headline → lede`.
5. Vary typographic scale — not every section headline at the same size.
6. Remove ≥3 decorative elements that can't justify their place.
7. Vary CTA treatments — not every button the same pill+arrow.
8. Keep only ONE gradient-accent-word headline technique per page.

**Rule of thumb:** the polish pass diff should be **net-subtractive**. If your polish diff is net-additive on a maturing page, you're adding new template residue, not removing old.

**Anti-anti-pattern warning:** don't overcorrect into "quirky" — wobbly borders, random rotations, novelty interactions. That's just a different flavor of AI tell. The goal is intentional restraint, not monastic minimalism and not theatrical quirkiness.

---

## Parallel agents for multi-page portfolios

When auditing multiple pages (e.g., several sibling audience pages), run agents in parallel rather than sequentially. Each agent owns one page's file tree. Rules:

**File-boundary discipline (non-negotiable):**
- Each agent may only touch its own page route, its own scoped component folder, its own image assets, its own generation scripts, and its own audit report.
- Every brief must explicitly list the SIBLING agents' trees as off-limits **by name**, not just "shared files."
- Never touch top-level shared components, layout chrome, UI primitives, hooks, lib, middleware, env files, the home page, or any config file.

**Shared design vocabulary:**
- Each agent reads the same set of reference components to absorb the shared visual language.
- Each agent has a distinct accent color so sibling pages stay visually differentiated.
- Agents don't see each other's in-flight work — they only see what's already committed. Plan accordingly.

**Dev server considerations:**
- Multiple agents screenshot-ing the same dev server can cause compile load; accept degraded screenshot reliability during parallel runs.
- See screenshot fallback below.

---

## Screenshot fallback

The ideal is a Playwright browser with the user's cached session. Reality:

- **MCP browser often locked** by the user's own Chrome on the same profile → `Browser is already in use` error.
- **Headless Playwright via a script** works but client-side auth-hydration gates can leave a "Initializing…" loader that never clears within timeout. Screenshots of the spinner are the symptom.
- **Stale `.next/trace` lockfiles** from crashed prior dev-server processes can deadlock new `npm run dev` attempts. Clearing the build directory unblocks.

**Practical guidance:** treat screenshots as best-effort, not blocking. Code-based analysis is rich enough on a typed React/Tailwind codebase to carry rigor — component trees, class lists, referenced design vocabulary — and the human can verify on their own browser.

When screenshots matter most: mobile breakpoint (375px), and the first/last visual of the page (hero + final CTA). If only a few screenshots land, prioritize those.

---

## When to stop

- **You scored the page at or above target %** (~75% is a reasonable in-session bar).
- **The remaining improvements require real data** (real customer stories, real screenshots, real performance testing) you can't manufacture.
- **The user has given negative feedback on the last 2 changes** — diminishing returns. Regroup.
- **Tests/lint are failing because of design changes** — stop, fix, don't accumulate debt.

---

## The % of potential scoring rubric

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

Score each dimension 0–100, average them. 75% in session is good. 90%+ requires out-of-session assets.
