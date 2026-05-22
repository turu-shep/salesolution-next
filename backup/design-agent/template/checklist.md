# Checklist: Quick Reference for Starting a Design Pass

Print this. Tape it over your monitor. Follow it.

---

## Before you touch a pixel

- [ ] Read the existing page top-to-bottom once
- [ ] Write down the **one specific person** you're writing for (not a persona — a named individual with a life)
- [ ] Ask: **what does their Monday look like?** Write it out in a full paragraph
- [ ] Identify the **2–3 jobs** the page must do (e.g., "convince audience that [core claim]")
- [ ] List sections that exist → assign each a job → flag any without a clear job (candidates for cutting)
- [ ] Note which messaging angles are missing and need to be added
- [ ] Audit the current page against [content.md](./content.md) voice principles

---

## Setup checklist (do once per session)

- [ ] Dev server running, port noted
- [ ] Auth / password gate (if any) handled
- [ ] Playwright browser launched; first screenshot confirms it works
- [ ] Service worker unregistered + caches cleared (if PWA)
- [ ] Dev server output being monitored (background terminal / tail)
- [ ] Task tracker (TodoWrite or equivalent) set up with main work items

---

## Per-section audit loop

For each section on the page:

- [ ] Scroll to the section, screenshot it
- [ ] Answer: **what job is this section doing?**
- [ ] Answer: **does the content deliver the job?** (Yes / partial / no)
- [ ] Answer: **does the visual treatment help or fight the content?**
- [ ] Answer: **does this overlap with another section's job?** (If yes, one has to cut)
- [ ] Score improvement probability: **High / Medium / Low**
- [ ] Write a single-line diagnosis (specific, not "could be better")
- [ ] Decide: skip / propose options / execute

---

## 7-dimension audit

For a rigorous pass (especially sub-agent-driven), score each block across **all seven** dimensions:

- [ ] **Structure** — one clear job? Is it necessary?
- [ ] **Messaging** — voice check, forbidden words, clarity
- [ ] **Visual** — density, hierarchy, whitespace, rhythm with neighbors
- [ ] **Elements** — components appropriate? Better alternatives?
- [ ] **Imagery** — photo/illustration earning its place? Missing where it should be?
- [ ] **Flow** — momentum from previous block, handoff to next
- [ ] **Order** — right position in the narrative?

**Red flag:** if your audit diff is 80%+ copy changes, you've only touched Messaging. Re-audit the other 6 dimensions.

---

## Verdict system

End each block's audit with a verdict. `TUNE` is **not** a valid verdict — it's where audits go to die.

- [ ] **KEEP** — block is already the strongest it can be without founder input *(use on <20% of blocks; any more means under-auditing)*
- [ ] **REWRITE** — copy needs substantive rework (new argument, not a word swap)
- [ ] **REDESIGN** — visual/structural rework: new layout, components, interaction, imagery
- [ ] **REORDER** — block fine but wrong position; name the target position
- [ ] **REMOVE** — block doesn't earn its place
- [ ] **ADD** — missing block (used in summary pass)

If a block only deserves a comma tweak → KEEP. If it needs real work → pick one of the substantive verdicts.

---

## Before making any edit

- [ ] Screenshot current state
- [ ] For high-risk changes (layout, content removal, messaging): propose 1–3 options with tradeoffs
- [ ] Confirm which option to execute (if user is available) OR make the call with reasoning
- [ ] Make the edit
- [ ] Screenshot the result
- [ ] Verify the result matches the intent

---

## Language review checklist

Run every section's copy through these questions:

- [ ] Any **jargon** from the blacklist in [content.md](./content.md)? Replace.
- [ ] Any sentences that would sound weird at a diner / coffee shop? Rewrite.
- [ ] Any headlines that close the gap instead of creating one? Rewrite.
- [ ] Any section without a **closer line** that rewards scrolling? Add one.
- [ ] Any specific **numbers** in quotes that aren't highlighted? Highlight.
- [ ] Any fabricated **names / numbers** not marked as illustrative? Mark them.
- [ ] Any promises of features that **don't actually exist yet**? Scale back or remove.
- [ ] Any phrase with **deliberate structure** (duality, contrast, parallelism) I'd lose if I replace it?

---

## Mobile responsive checklist

At 375×812 viewport:

- [ ] No horizontal overflow (`document.scrollWidth === clientWidth`)
- [ ] Run the overflow detection script (see [workflow.md](./workflow.md)) to find any element wider than viewport
- [ ] Hero text containers have `min-w-0 w-full` on the grid item
- [ ] Any `aspect-video` element with `min-h-[Xpx]` changed to `sm:min-h-[Xpx]`
- [ ] Grids explicitly use `grid-cols-1` at base (not just `lg:grid-cols-2`)
- [ ] Mockup max-widths use responsive: `max-w-[min(100%,28rem)]` or equivalent
- [ ] Mobile-specific font sizes on headlines: `text-[1.875rem] sm:text-[2.5rem] md:text-display-xl`
- [ ] Floating elements with negative offsets are inside `overflow-hidden` parents
- [ ] Horizontal arrows / decorative overlaps: `hidden md:block` or `hidden md:flex`

Screenshot every section at mobile. Verify.

Then resize back to 1920 and verify nothing broke on desktop.

---

## Multi-viewport verification

Before declaring the page responsive, screenshot at each:

- [ ] 360px (smallest mobile)
- [ ] 375px (iPhone standard)
- [ ] 768px (tablet)
- [ ] 1024px (small laptop)
- [ ] 1440px (standard desktop)
- [ ] 1920px (full HD)
- [ ] 2400px+ (large monitor — is the container too narrow?)

---

## Useless section test

For any section that feels weak, ask:

- [ ] If I deleted this section, what would the page lose?
- [ ] Is that something another section is already covering?
- [ ] Does this section have a distinct job or is it decoration?

**If the answer is "nothing" or "another section covers it," cut the section.** Pages are almost always better shorter.

---

## Before shipping / handing back

- [ ] Every section has a clear job
- [ ] Every piece of copy passed the jargon check
- [ ] Every section has a closer that rewards scrolling
- [ ] Every mockup works at 375px and 1920px
- [ ] Header and footer containers align with content containers (same max-width)
- [ ] No fabricated content presented as real without a disclaimer *(including the "Composite" pattern on testimonials — see [content.md](./content.md))*
- [ ] No claims about features that don't exist
- [ ] The CTA path is obvious from any section on the page
- [ ] Forbidden-word grep returns zero hits *(see [content.md](./content.md) for the list)*
- [ ] Score the % of potential (see [workflow.md](./workflow.md)) honestly
- [ ] For multi-pass audits: run a fresh-eyes pass before shipping *(another agent, same brief, different POV — typically finds 5–15 founder-independent improvements the original author missed)*

---

## Anti-template polish checklist

Run a dedicated polish pass once the page has substance. Goal: remove template residue, make it read as human-designed.

**Prescribed minimums (non-negotiable for a polish pass):**

- [ ] At least 2 blocks do NOT use the dominant rounded-card pattern
- [ ] At least 1 block has zero icons
- [ ] At least 1 proof/stat appears as plain text, not in a pill
- [ ] At least 1 block's opener is NOT `eyebrow → display headline → lede`
- [ ] Section-headline scale varies (not every one the same display size)
- [ ] ≥3 decorative elements removed per the "does this earn its place?" audit
- [ ] CTA treatments vary (not every button the same pill+arrow)
- [ ] Only ONE gradient-accent-word headline technique survives

**Anti-pattern counts (flag if over threshold):**

- [ ] Eyebrow openings per page: ≤3 (flag if ≥7)
- [ ] Proof pills per page: ≤3 (flag if ≥10)
- [ ] Gradient-accent-word headlines: 1 (flag if ≥3)
- [ ] Em-dashes in prose: <10 (flag if >20)
- [ ] Blocks using card-grid pattern: ≤70% (flag if all of them do)

**Expected diff profile:** net-**subtractive**. If your polish diff has more lines added than removed, you're adding template residue, not removing it.

**Do not overcorrect into** wobbly borders, random rotations, novelty interactions. Quirky-for-the-sake-of-quirky is just a different AI tell. Goal: *intentional restraint*, not theatrical quirkiness and not monastic minimalism.

---

## When to call it done

Stop when one of these is true:

- [ ] You've hit the target % of potential
- [ ] The remaining gaps require real data (customer photos, real screenshots, A/B results) you can't manufacture
- [ ] The last 2 edits were negatively received — diminishing returns
- [ ] Tests/lint are failing — stop, fix, don't accumulate debt

---

## Common pitfalls and how to avoid them

| Pitfall | Avoidance |
|---|---|
| Building blind without screenshots | Rule: no edit without before/after screenshot |
| Over-simplifying copy and losing structure | Preserve parallelism / duality when replacing jargon |
| Caching issues hiding your changes | Add `?bust=N` to every navigation; clear service worker |
| Polishing a section that's about to be cut | Structure-first pass before any style work |
| Fabricated content mistaken for real | Mark illustrative content visibly, plan replacement |
| Promising features that don't exist | Check roadmap before writing promises |
| Building only for desktop | Mobile pass as dedicated phase, not afterthought |
| Mixing icon libraries | Pick one source, stick to it |
| Three dark sections on one page | Max 2, alternate with light sections |
| Adding a pattern because it's cool | Every pattern must serve a specific job |
| Using a persona instead of a specific person | Write for Mike, age 54 — not "small business owners" |
| Defending a change the user pushes back on | Believe the user; they have context you don't |
| Skipping the "useless section" test | Run it for every section that feels weak |

---

## The 10-second page test

After you think you're done:

1. Close the dev tools
2. Refresh the page
3. Scroll from top to bottom in 10 seconds
4. Stop. What do you remember?

**If you remember:**
- The voice (how it felt to read it)
- One or two specific moments (a recognition beat, a price reveal, a specific headline)
- What the product does (roughly)
- What the price is (roughly)
- That you could figure out the next step to take

→ The page works.

**If you remember:**
- Just generic SaaS vibes
- A feeling of "I don't know what this actually is"
- That you felt talked down to or talked at
- Nothing specific at all

→ Go back to the top of the checklist.

---

## Project-specific additions

_Record pitfalls, checks, or tests unique to your project or stack._

- _(add entries here as you work)_
