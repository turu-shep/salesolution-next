# Northern Hydraulics — Article Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Important context — this plan is portable.** It was written in a different project's session. The deliverable is a single CSS file + README for the Northern Hydraulics WordPress site (`northernhydraulics.net`). It is **NOT** a code change to whatever repo this plan happens to live in. Create the two output files wherever your current project root is appropriate (e.g., a `nh-article-redesign/` folder).

**Goal:** Produce one drop-in CSS file (`northern-hydraulics-article.css`, ~6–8KB minified) and a short installation README that, when pasted into the WordPress Customizer's "Additional CSS" panel on northernhydraulics.net, fixes broken typography hierarchy, restores readable measure, and adds a small set of reusable content components on single blog/article pages without touching the theme, plugins, product pages, or markup.

**Architecture:** Single scoped stylesheet. Every rule lives inside `body.single-post article.post` so only single blog/article pages are affected. Design tokens (palette, type scale, fonts, layout) are CSS custom properties at `:root`. Two new web fonts loaded via Google Fonts `@import`. Component patterns (callouts, formulas, numbered steps) are opt-in HTML wrappers the editor pastes into post bodies. No JavaScript, no theme-file edits, no plugin changes.

**Tech Stack:** Pure CSS (custom properties, Grid named columns, `clamp()`, `:has()`, `:nth-child()`, CSS counters). Google Fonts (Newsreader, JetBrains Mono, Inter weights 400–800). Playwright MCP for visual verification against live site.

**Source spec:** Read first → `2026-05-26-nh-article-redesign-design.md` in the same `docs/superpowers/specs/` folder (or wherever your project keeps it). The spec is authoritative on tokens, palette, type scale, and acceptance criteria. This plan operationalizes it.

**Target site:** https://northernhydraulics.net — specifically single-post pages such as:
- https://northernhydraulics.net/hydraulic-cylinder-force-calculator (technical guide with formulas + table)
- https://northernhydraulics.net/o-ring-face-seal-orfs-guide (long guide, many H3s, 22 images)
- https://northernhydraulics.net/hydraulic-cylinder-mounting-styles (short post, image-heavy)
- https://northernhydraulics.net/catalog/cylinders-faq.html (legacy URL with inline `<p style="font-size:12px">` overrides)

All four use the same `<article class="post-XXXXX post">` template under `body.single-post`.

---

## Verification approach (no JS test framework — visual)

CSS work is verified visually. For each task:

1. Build/extend the CSS file locally.
2. Use Playwright MCP to navigate to one or more of the target URLs above.
3. Inject the in-progress CSS via `page.addStyleTag({ content: ... })` (or by pasting into devtools) before screenshotting.
4. Compare the screenshot against the task's "Expected" description.
5. Iterate until it matches; then commit.

You can also build a minimal `test-mockup.html` in the project folder that contains the article wrapper markup + sample content (h1, h2, h3, p, lead, list, table, figure, callout, formula) so you can render the CSS against a synthetic page without relying on the live site. This is faster to iterate on than re-fetching the live site every task. Spec §11 acceptance criteria are the final visual contract.

---

## File structure

Create two files in your chosen project root:

- `northern-hydraulics-article.css` — the deliverable
- `README.md` — installation instructions, component usage examples, test URLs

Optional during development:

- `test-mockup.html` — synthetic article page for local iteration (delete or `.gitignore` before delivery)

The CSS file is organized in this exact section order (mirrors spec §7):

1. `@import` — Google Fonts
2. `:root` — design tokens
3. Scoping wrapper + layout grid
4. Headings (h1 display, h2 with eyebrow counter, h3, h4)
5. Inline text (p, lead, a, strong, em, code, mark)
6. Lists (ul, ol, dl, .steps)
7. Tables
8. Figures + images
9. Components (.callout variants, .formula)
10. Sidebar reposition (`.cta-block-sidebar`)
11. Responsive (@media queries)
12. Legacy inline-style overrides

Each task builds one or more of these sections.

---

## Task 1: Scaffold the deliverable

**Files:**
- Create: `northern-hydraulics-article.css`
- Create: `README.md`
- Create: `test-mockup.html` (optional local-only)

- [ ] **Step 1: Create the CSS file with the @import, :root tokens, and section comments**

```css
/* Northern Hydraulics — Article Page Redesign
   Drop-in stylesheet for body.single-post article.post pages.
   Paste this entire file into WordPress Customizer → Additional CSS.
   See README.md for installation and component usage. */

@import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,500;0,600;1,500&family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;500;600;700;800&display=swap');

:root {
  /* Fonts */
  --nh-font-display: "Newsreader", Georgia, "Times New Roman", serif;
  --nh-font-body:    "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --nh-font-mono:    "JetBrains Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace;

  /* Type scale */
  --nh-type-h1:      clamp(36px, 5vw, 60px);
  --nh-type-h1-lh:   1.05;
  --nh-type-eyebrow: 12px;
  --nh-type-h2:      34px;
  --nh-type-h3:      24px;
  --nh-type-h4:      18px;
  --nh-type-lead:    22px;
  --nh-type-body:    18px;
  --nh-type-small:   15px;

  /* Palette */
  --nh-c-surface:     #FAFAF7;
  --nh-c-ink:         #171717;
  --nh-c-ink-muted:   #5A5A5A;
  --nh-c-hairline:    #E5E3DD;
  --nh-c-soft:        #F3F1EA;
  --nh-c-brand:       #E76F1A;
  --nh-c-brand-hover: #C25510;
  --nh-c-steel:       #14495A;
  --nh-c-warn:        #B45309;

  /* Layout */
  --nh-measure-prose: 720px;
  --nh-measure-wide:  880px;
  --nh-gutter:        24px;
  --nh-rail:          320px;
}

/* ============================================================
   1. Scoping + layout grid
   ============================================================ */

/* (filled in Task 2) */

/* ============================================================
   2. Headings
   ============================================================ */

/* (filled in Task 3) */

/* ============================================================
   3. Inline text
   ============================================================ */

/* (filled in Task 4) */

/* ============================================================
   4. Lists
   ============================================================ */

/* (filled in Task 5) */

/* ============================================================
   5. Tables
   ============================================================ */

/* (filled in Task 6) */

/* ============================================================
   6. Figures + images
   ============================================================ */

/* (filled in Task 7) */

/* ============================================================
   7. Components: callouts, formulas, steps
   ============================================================ */

/* (filled in Task 8) */

/* ============================================================
   8. Sidebar reposition
   ============================================================ */

/* (filled in Task 9) */

/* ============================================================
   9. Responsive
   ============================================================ */

/* (filled in Task 10) */

/* ============================================================
   10. Legacy inline-style overrides
   ============================================================ */

/* (filled in Task 11) */
```

- [ ] **Step 2: Create README.md skeleton**

```markdown
# Northern Hydraulics — Article Page Redesign

Drop-in stylesheet that restyles single blog/article pages on northernhydraulics.net.

## Install

1. WordPress admin → **Appearance → Customize → Additional CSS**.
2. Paste the entire contents of `northern-hydraulics-article.css`.
3. Click **Publish**.

The CSS only affects pages matching `body.single-post`. Product pages, archives, homepage, and the header/footer are not touched.

## Verify

After publishing, spot-check these URLs:

- https://northernhydraulics.net/hydraulic-cylinder-force-calculator
- https://northernhydraulics.net/o-ring-face-seal-orfs-guide
- https://northernhydraulics.net/hydraulic-cylinder-mounting-styles
- https://northernhydraulics.net/catalog/cylinders-faq.html

And confirm no regressions on:

- https://northernhydraulics.net/ (homepage)
- Any product page
- Any category archive

## Components (opt-in HTML)

(filled in Task 12)
```

- [ ] **Step 3: Create the test mockup (optional but recommended)**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>NH Article Mockup</title>
  <link rel="stylesheet" href="northern-hydraulics-article.css">
</head>
<body class="single-post wp-singular">
  <article class="post post-test type-post">
    <div class="entry-content">
      <p>Home » Hydraulic Cylinder » Article Title</p>
      <h1>Hydraulic Cylinder Force Calculator for Precision Tonnage</h1>
      <p>Curious about the force your hydraulic cylinder can generate? Use a calculator to get accurate, real-time results.</p>

      <h2>What You'll Learn</h2>
      <ul>
        <li>Accurate calculations of hydraulic cylinder force based on bore, rod, and pressure.</li>
        <li>The role of <strong>safety factors</strong> in engineering decisions.</li>
        <li>Converting hydraulic force to tonnage.</li>
      </ul>

      <h2>Understanding Hydraulic Cylinder Force</h2>
      <p>Hydraulic cylinders are powerful tools found in many machines like bulldozers and factory equipment.</p>

      <h3>Push Force</h3>
      <p>The push force is the maximum force a cylinder can exert in the extending direction. Calculate it with:</p>

      <figure class="formula">
        <div class="formula__expr">F = P × A</div>
        <figcaption>Force equals pressure times area.</figcaption>
      </figure>

      <h3>Pull Force</h3>
      <p>When extended, a cylinder pulls back. The pull force is reduced because the rod takes up part of the piston area.</p>

      <aside class="callout callout--key">
        <p>Always include a 25% safety factor for unpredictable loads.</p>
      </aside>

      <aside class="callout callout--note">
        <p>Pressure is typically measured in <code>psi</code> or <code>bar</code>.</p>
      </aside>

      <aside class="callout callout--warn">
        <p>Exceeding rated pressure can cause seal failure.</p>
      </aside>

      <h2>Metric Unit Conversion Table</h2>
      <table>
        <thead>
          <tr><th>Unit</th><th>Symbol</th><th class="num">Conversion</th></tr>
        </thead>
        <tbody>
          <tr><td>Pascal</td><td><code>Pa</code></td><td class="num">1.00</td></tr>
          <tr><td>Bar</td><td><code>bar</code></td><td class="num">100,000</td></tr>
          <tr><td>PSI</td><td><code>psi</code></td><td class="num">6,894.76</td></tr>
          <tr><td>Megapascal</td><td><code>MPa</code></td><td class="num">1,000,000</td></tr>
        </tbody>
      </table>

      <h2>Step-by-Step Calculation</h2>
      <ol class="steps">
        <li>Measure the cylinder's bore diameter in inches.</li>
        <li>Determine the hydraulic system pressure in psi.</li>
        <li>Multiply pressure by piston area to get push force in pounds.</li>
        <li>Divide by 2,000 to convert to tons.</li>
      </ol>

      <h3>Glossary</h3>
      <dl>
        <dt>Bore</dt>
        <dd>The inside diameter of the cylinder barrel.</dd>
        <dt>Rod</dt>
        <dd>The shaft that extends from one end of the cylinder.</dd>
        <dt>Stroke</dt>
        <dd>The distance the rod travels from fully retracted to fully extended.</dd>
      </dl>
    </div>
  </article>
  <div class="cta-block-sidebar">
    <p>Right-rail CTA placeholder.</p>
  </div>
</body>
</html>
```

- [ ] **Step 4: Open the mockup in a browser**

Use Playwright MCP or just open the file directly:

```
file:///<your-project-root>/test-mockup.html
```

Expected: page renders with unstyled defaults so far (browser-default headings, no grid, plain table). This confirms the file loads and the @import resolves. Tokens are not yet applied to any rules.

- [ ] **Step 5: Commit**

```
git add northern-hydraulics-article.css README.md test-mockup.html
git commit -m "scaffold: NH article CSS file with tokens and section comments"
```

---

## Task 2: Foundation — scoping, background, layout grid

**Files:**
- Modify: `northern-hydraulics-article.css` (section 1 "Scoping + layout grid")

**Acceptance:** Article body has warm off-white background, prose constrained to 720px centered, right-rail CTA occupies 320px column on ≥1100px screens.

- [ ] **Step 1: Add scoping + grid rules**

Replace the "(filled in Task 2)" placeholder in section 1 with:

```css
body.single-post article.post {
  background: var(--nh-c-surface);
  color: var(--nh-c-ink);
  font-family: var(--nh-font-body);
  font-size: var(--nh-type-body);
  line-height: 1.65;
  font-feature-settings: "kern", "liga", "calt";
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

/* Grid wrapper around the article body */
body.single-post article.post .entry-content {
  display: grid;
  grid-template-columns:
    [full-start] minmax(var(--nh-gutter), 1fr)
    [prose-start] minmax(0, var(--nh-measure-prose)) [prose-end]
    minmax(var(--nh-gutter), 1fr) [full-end];
  column-gap: var(--nh-gutter);
  padding: 32px 0 64px;
}

/* Every direct child defaults to the prose column */
body.single-post article.post .entry-content > * {
  grid-column: prose;
}

/* Breakout helper for figures/tables/callouts */
body.single-post article.post .entry-content > .breakout,
body.single-post article.post .entry-content > .figure--breakout,
body.single-post article.post .entry-content > .callout,
body.single-post article.post .entry-content > .formula,
body.single-post article.post .entry-content > table {
  grid-column: full;
  justify-self: center;
  width: 100%;
  max-width: var(--nh-measure-wide);
}
```

- [ ] **Step 2: Reload the mockup**

Run Playwright (or refresh the browser tab) and screenshot.

Expected:
- Background is warm cream (`#FAFAF7`).
- All text now sits inside a 720px-wide centered column.
- The `.cta-block-sidebar` is still in document-flow position (sidebar repositioning comes in Task 9 — ignore for now).
- Table and any breakout elements span up to 880px.

- [ ] **Step 3: Verify against live site**

Use Playwright MCP:

```js
await page.goto('https://northernhydraulics.net/hydraulic-cylinder-force-calculator');
await page.addStyleTag({ content: <contents of northern-hydraulics-article.css> });
await page.screenshot({ path: 'task2-live.jpeg', fullPage: false, quality: 90, type: 'jpeg' });
```

Expected:
- Article body now has off-white background.
- Prose column is constrained to ~720px even though the article element is still 1250px wide.

- [ ] **Step 4: Commit**

```
git add northern-hydraulics-article.css
git commit -m "feat: scoping + layout grid + measure constraint"
```

---

## Task 3: Headings — h1 display serif, h2 with eyebrow counter, h3, h4

**Files:**
- Modify: `northern-hydraulics-article.css` (section 2 "Headings")

**Acceptance:**
- H1 uses Newsreader serif, ~60px (clamped), line-height 1.05 (lines no longer overlap).
- H2 is visually larger and heavier than H3.
- Each H2 displays an auto-generated eyebrow label above it: `§ 01 · `, `§ 02 · `, etc. in brand orange small caps.
- H3 (24px) sits clearly below H2 (34px) in the hierarchy.

- [ ] **Step 1: Add heading rules**

Replace the "(filled in Task 3)" placeholder in section 2 with:

```css
/* Reset the article's H2 counter at the entry-content root */
body.single-post article.post .entry-content {
  counter-reset: nh-section;
}

body.single-post article.post .entry-content h1 {
  font-family: var(--nh-font-display);
  font-weight: 600;
  font-size: var(--nh-type-h1);
  line-height: var(--nh-type-h1-lh);
  letter-spacing: -0.02em;
  color: var(--nh-c-ink);
  margin: 8px 0 24px;
}

body.single-post article.post .entry-content h2 {
  font-family: var(--nh-font-body);
  font-weight: 700;
  font-size: var(--nh-type-h2);
  line-height: 1.2;
  letter-spacing: -0.015em;
  color: var(--nh-c-ink);
  margin: 64px 0 16px;
  counter-increment: nh-section;
}

body.single-post article.post .entry-content h2::before {
  content: "§ " counter(nh-section, decimal-leading-zero) " · ";
  display: block;
  font-family: var(--nh-font-body);
  font-weight: 700;
  font-size: var(--nh-type-eyebrow);
  line-height: 1;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--nh-c-brand);
  margin-bottom: 12px;
}

body.single-post article.post .entry-content h3 {
  font-family: var(--nh-font-body);
  font-weight: 600;
  font-size: var(--nh-type-h3);
  line-height: 1.3;
  color: var(--nh-c-ink);
  margin: 40px 0 12px;
}

body.single-post article.post .entry-content h4 {
  font-family: var(--nh-font-body);
  font-weight: 700;
  font-size: var(--nh-type-h4);
  line-height: 1.4;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--nh-c-ink);
  margin: 32px 0 8px;
}
```

- [ ] **Step 2: Reload mockup and screenshot**

Expected:
- H1 is a serif display face, ~60px, single line of "Hydraulic Cylinder Force Calculator for Precision Tonnage" wraps gracefully (no overlap).
- Above each H2 is a tiny brand-orange label `§ 01 · WHAT YOU'LL LEARN` (the label is just `§ 01 · `; the H2 text follows on its own line).
- H2 is clearly larger and bolder than H3.

- [ ] **Step 3: Verify against live site**

Inject the CSS via Playwright into the calculator page. Screenshot the top 1200px.

Expected: H1 no longer has the overlap bug. Hierarchy now reads h1 → h2 → h3 correctly.

- [ ] **Step 4: Commit**

```
git add northern-hydraulics-article.css
git commit -m "feat: heading typography with display serif h1 and h2 eyebrow counter"
```

---

## Task 4: Inline text — body, lead, links, strong, em, code

**Files:**
- Modify: `northern-hydraulics-article.css` (section 3 "Inline text")

**Acceptance:**
- Body paragraphs are 18px Inter at line-height 1.65 with sensible margins (no doubled spacing).
- Lead paragraph (first `<p>` after H1 OR any `<p class="lead">`) is 22px and muted color.
- Links are brand orange with a subtle underline, no underline on hover.
- `<strong>` is the same color/family as body but weight 700 (no longer 14px gray).
- `<code>` is JetBrains Mono with a soft background pill.

- [ ] **Step 1: Add inline-text rules**

Replace the "(filled in Task 4)" placeholder in section 3 with:

```css
body.single-post article.post .entry-content p {
  font-family: var(--nh-font-body);
  font-size: var(--nh-type-body);
  line-height: 1.65;
  color: var(--nh-c-ink);
  margin: 0 0 1em;
}

body.single-post article.post .entry-content > p:first-of-type {
  margin-top: 0;
}

/* Lead paragraph: first <p> immediately after H1 OR opt-in .lead */
body.single-post article.post .entry-content > h1 + p,
body.single-post article.post .entry-content > p.lead {
  font-size: var(--nh-type-lead);
  line-height: 1.5;
  color: var(--nh-c-ink-muted);
  margin-bottom: 32px;
}

body.single-post article.post .entry-content a {
  color: var(--nh-c-brand);
  text-decoration-line: underline;
  text-decoration-thickness: 1px;
  text-decoration-color: rgba(231, 111, 26, 0.4);
  text-underline-offset: 3px;
  transition: color 120ms ease, text-decoration-color 120ms ease;
}

body.single-post article.post .entry-content a:hover {
  color: var(--nh-c-brand-hover);
  text-decoration-color: var(--nh-c-brand-hover);
}

body.single-post article.post .entry-content strong {
  font-family: inherit;
  font-size: inherit;
  font-weight: 700;
  color: var(--nh-c-ink);
  letter-spacing: 0;
}

body.single-post article.post .entry-content em {
  font-style: italic;
  color: inherit;
}

body.single-post article.post .entry-content code {
  font-family: var(--nh-font-mono);
  font-weight: 500;
  font-size: 0.94em;
  background: var(--nh-c-soft);
  color: var(--nh-c-ink);
  padding: 2px 6px;
  border-radius: 4px;
  font-variant-ligatures: none;
}

body.single-post article.post .entry-content mark {
  background: rgba(231, 111, 26, 0.18);
  color: inherit;
  padding: 0 2px;
}
```

- [ ] **Step 2: Reload mockup and screenshot**

Expected:
- First paragraph below H1 is noticeably larger and grayer than the rest of the body.
- `<strong>` "safety factors" reads as bolder than surrounding text in the same color.
- Inline `<code>` like `psi` has a soft cream pill.
- Body paragraph rhythm feels comfortable, not double-spaced.

- [ ] **Step 3: Verify against live site**

Inject and screenshot the calculator page. Confirm bold text in the article body is now darker/heavier, not gray.

- [ ] **Step 4: Commit**

```
git add northern-hydraulics-article.css
git commit -m "feat: inline text typography (lead, links, strong, code)"
```

---

## Task 5: Lists — ul, ol, dl, .steps

**Files:**
- Modify: `northern-hydraulics-article.css` (section 4 "Lists")

**Acceptance:**
- Unordered/ordered lists have comfortable spacing and a subtle indent.
- `<dl>` renders definition lists with semibold terms and indented definitions with a hairline left border.
- `<ol class="steps">` puts a large serif numeral in the margin to the left of each item.

- [ ] **Step 1: Add list rules**

Replace the "(filled in Task 5)" placeholder in section 4 with:

```css
body.single-post article.post .entry-content ul,
body.single-post article.post .entry-content ol {
  margin: 0 0 1.5em;
  padding-left: 1.5em;
}

body.single-post article.post .entry-content ul li,
body.single-post article.post .entry-content ol li {
  font-size: var(--nh-type-body);
  line-height: 1.65;
  color: var(--nh-c-ink);
  margin-bottom: 0.5em;
}

body.single-post article.post .entry-content ul {
  list-style: disc;
}

body.single-post article.post .entry-content ul li::marker {
  color: var(--nh-c-brand);
}

body.single-post article.post .entry-content ol {
  list-style: decimal;
}

body.single-post article.post .entry-content ol li::marker {
  font-variant-numeric: tabular-nums;
  color: var(--nh-c-ink-muted);
  font-weight: 600;
}

/* Definition lists */
body.single-post article.post .entry-content dl {
  margin: 0 0 1.5em;
}

body.single-post article.post .entry-content dl dt {
  font-family: var(--nh-font-body);
  font-size: var(--nh-type-body);
  font-weight: 600;
  color: var(--nh-c-ink);
  margin-top: 1em;
}

body.single-post article.post .entry-content dl dt:first-of-type {
  margin-top: 0;
}

body.single-post article.post .entry-content dl dd {
  font-size: var(--nh-type-body);
  line-height: 1.65;
  color: var(--nh-c-ink);
  margin: 4px 0 0;
  padding-left: 16px;
  border-left: 2px solid var(--nh-c-hairline);
}

/* Numbered-step pattern */
body.single-post article.post .entry-content ol.steps {
  list-style: none;
  padding-left: 0;
  counter-reset: nh-step;
}

body.single-post article.post .entry-content ol.steps > li {
  counter-increment: nh-step;
  position: relative;
  padding-left: 64px;
  margin-bottom: 24px;
  min-height: 48px;
}

body.single-post article.post .entry-content ol.steps > li::before {
  content: counter(nh-step);
  position: absolute;
  left: 0;
  top: -4px;
  font-family: var(--nh-font-display);
  font-weight: 600;
  font-size: 40px;
  line-height: 1;
  color: var(--nh-c-steel);
  letter-spacing: -0.02em;
}
```

- [ ] **Step 2: Reload mockup and screenshot**

Expected:
- Unordered list bullets are brand orange.
- Definition list shows "Bore", "Rod", "Stroke" terms in semibold with their definitions indented to the right under a thin gray line.
- `.steps` ordered list has large steel-blue serif numerals (1, 2, 3, 4) hanging in the left margin.

- [ ] **Step 3: Commit**

```
git add northern-hydraulics-article.css
git commit -m "feat: list typography (ul, ol, dl, .steps)"
```

---

## Task 6: Tables

**Files:**
- Modify: `northern-hydraulics-article.css` (section 5 "Tables")

**Acceptance:**
- Tables span the wide column (880px) and center themselves.
- Header row has Inter 700 with a brand-orange 2px bottom border.
- Numeric cells (`<td class="num">`) are mono, right-aligned, tabular-nums.
- Alternate rows have a soft background.
- All `<td>` use tabular-nums so numbers align even in body font.

- [ ] **Step 1: Add table rules**

Replace the "(filled in Task 6)" placeholder in section 5 with:

```css
body.single-post article.post .entry-content table {
  border-collapse: collapse;
  font-family: var(--nh-font-body);
  font-size: var(--nh-type-body);
  line-height: 1.5;
  color: var(--nh-c-ink);
  margin: 32px auto;
}

body.single-post article.post .entry-content thead th {
  font-family: var(--nh-font-body);
  font-weight: 700;
  font-size: 15px;
  text-align: left;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--nh-c-ink);
  border-bottom: 2px solid var(--nh-c-brand);
  padding: 12px 16px;
}

body.single-post article.post .entry-content thead th.num {
  text-align: right;
}

body.single-post article.post .entry-content tbody td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--nh-c-hairline);
  font-variant-numeric: tabular-nums;
}

body.single-post article.post .entry-content tbody tr:nth-child(even) td {
  background: var(--nh-c-soft);
}

body.single-post article.post .entry-content tbody td.num {
  font-family: var(--nh-font-mono);
  font-weight: 500;
  font-size: 0.94em;
  text-align: right;
  white-space: nowrap;
}

/* Mobile horizontal scroll wrapper. Tables get wrapped automatically by WP in newer
   themes; if not, the editor wraps with <div class="table-wrap">. */
body.single-post article.post .entry-content .table-wrap {
  overflow-x: auto;
  margin: 32px 0;
  -webkit-overflow-scrolling: touch;
  background:
    linear-gradient(to right, var(--nh-c-surface), var(--nh-c-surface)),
    linear-gradient(to right, var(--nh-c-surface), var(--nh-c-surface)),
    linear-gradient(to right, rgba(0,0,0,0.08), rgba(0,0,0,0)),
    linear-gradient(to left, rgba(0,0,0,0.08), rgba(0,0,0,0));
  background-position: left center, right center, left center, right center;
  background-repeat: no-repeat;
  background-size: 24px 100%, 24px 100%, 12px 100%, 12px 100%;
  background-attachment: local, local, scroll, scroll;
}
```

- [ ] **Step 2: Reload mockup and screenshot**

Expected:
- Conversion table headers `UNIT`, `SYMBOL`, `CONVERSION` are uppercase with the brand orange bottom rule.
- Numeric column (`1.00`, `100,000`, etc.) is right-aligned, monospaced, with tabular-nums alignment.
- Every other row has the soft cream background.

- [ ] **Step 3: Commit**

```
git add northern-hydraulics-article.css
git commit -m "feat: table styles with mono numeric cells and zebra rows"
```

---

## Task 7: Figures + images

**Files:**
- Modify: `northern-hydraulics-article.css` (section 6 "Figures + images")

**Acceptance:**
- `<figure><img></figure>` blocks have 8px rounded corners on the image.
- `<figcaption>` is muted, small (15px), left-aligned, with 12px top margin.
- `.figure--breakout` extends to 880px.

- [ ] **Step 1: Add figure rules**

Replace the "(filled in Task 7)" placeholder in section 6 with:

```css
body.single-post article.post .entry-content img {
  max-width: 100%;
  height: auto;
  display: block;
}

body.single-post article.post .entry-content figure {
  margin: 32px 0;
}

body.single-post article.post .entry-content figure img {
  border-radius: 8px;
}

body.single-post article.post .entry-content figcaption {
  margin-top: 12px;
  font-family: var(--nh-font-body);
  font-size: var(--nh-type-small);
  line-height: 1.55;
  color: var(--nh-c-ink-muted);
  text-align: left;
}

body.single-post article.post .entry-content .figure--breakout {
  /* grid-column: full applied via the breakout helper in section 1 */
  text-align: center;
}

body.single-post article.post .entry-content .figure--breakout img {
  margin: 0 auto;
}
```

- [ ] **Step 2: Verify against the image-heavy mounting-styles post**

```js
await page.goto('https://northernhydraulics.net/hydraulic-cylinder-mounting-styles');
await page.addStyleTag({ content: <stylesheet> });
await page.screenshot({ fullPage: true, path: 'task7-mounting.jpeg', type: 'jpeg', quality: 90 });
```

Expected: images sit within the 720px prose column with rounded corners. Captions (if present) appear small and muted underneath.

- [ ] **Step 3: Commit**

```
git add northern-hydraulics-article.css
git commit -m "feat: figure + image styles with rounded corners and muted captions"
```

---

## Task 8: Components — callouts and formulas

**Files:**
- Modify: `northern-hydraulics-article.css` (section 7 "Components")

**Acceptance:**
- `<aside class="callout callout--key">` renders with a 4px brand-orange left rule, soft background, `KEY TAKEAWAY` label.
- `callout--note` uses steel blue, label `NOTE`.
- `callout--warn` uses warning amber, label `WARNING`.
- `<figure class="formula">` renders centered with mixed-font expression (variables italic serif, operators mono) and a small muted caption.

- [ ] **Step 1: Add component rules**

Replace the "(filled in Task 8)" placeholder in section 7 with:

```css
/* Callouts ----------------------------------------------------- */
body.single-post article.post .entry-content .callout {
  position: relative;
  background: var(--nh-c-soft);
  border-left: 4px solid var(--nh-c-brand);
  border-radius: 6px;
  padding: 20px 24px 20px 28px;
  margin: 32px 0;
}

body.single-post article.post .entry-content .callout::before {
  display: block;
  font-family: var(--nh-font-body);
  font-weight: 700;
  font-size: var(--nh-type-eyebrow);
  line-height: 1;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 8px;
  color: var(--nh-c-brand);
}

body.single-post article.post .entry-content .callout--key::before {
  content: "Key takeaway";
}

body.single-post article.post .entry-content .callout--note {
  border-left-color: var(--nh-c-steel);
}

body.single-post article.post .entry-content .callout--note::before {
  content: "Note";
  color: var(--nh-c-steel);
}

body.single-post article.post .entry-content .callout--warn {
  border-left-color: var(--nh-c-warn);
  background: rgba(180, 83, 9, 0.06);
}

body.single-post article.post .entry-content .callout--warn::before {
  content: "Warning";
  color: var(--nh-c-warn);
}

body.single-post article.post .entry-content .callout > *:last-child {
  margin-bottom: 0;
}

body.single-post article.post .entry-content .callout p {
  margin: 0 0 0.75em;
}

body.single-post article.post .entry-content .callout p:last-child {
  margin: 0;
}

/* Formula -------------------------------------------------------- */
body.single-post article.post .entry-content .formula {
  background: var(--nh-c-soft);
  border-radius: 8px;
  padding: 32px 24px 20px;
  margin: 32px auto;
  text-align: center;
}

body.single-post article.post .entry-content .formula__expr {
  font-family: var(--nh-font-display);
  font-style: italic;
  font-weight: 500;
  font-size: 28px;
  line-height: 1.2;
  color: var(--nh-c-ink);
  letter-spacing: 0.01em;
}

/* Operators and unit-symbols inside formula can be wrapped in <code>
   to render in JetBrains Mono. The .formula context keeps that subtle. */
body.single-post article.post .entry-content .formula__expr code {
  font-family: var(--nh-font-mono);
  font-style: normal;
  font-size: 0.85em;
  background: transparent;
  padding: 0;
  color: var(--nh-c-ink);
}

body.single-post article.post .entry-content .formula figcaption {
  margin-top: 16px;
  text-align: center;
  color: var(--nh-c-ink-muted);
}
```

- [ ] **Step 2: Reload mockup and screenshot**

Expected:
- Three callouts render in sequence with `KEY TAKEAWAY`, `NOTE`, `WARNING` labels in their respective colors.
- Formula block has soft background, centered italic serif expression "F = P × A", caption below.

- [ ] **Step 3: Commit**

```
git add northern-hydraulics-article.css
git commit -m "feat: callout and formula components"
```

---

## Task 9: Sidebar reposition

**Files:**
- Modify: `northern-hydraulics-article.css` (section 8 "Sidebar reposition")

**Acceptance:**
- On ≥1100px viewports the `.cta-block-sidebar` sits in a dedicated column to the right of the prose, top-aligned with the lead paragraph.
- Below 1100px it falls back into normal document flow below the article opening.
- The H1 area is no longer crowded by the sidebar.

The challenge: the sidebar in the existing HTML is a sibling of the article, not inside `.entry-content`. We can either re-grid the parent container OR use position-based layout. Easier and lower-risk: position the sidebar absolutely on desktop only.

- [ ] **Step 1: Inspect the DOM via Playwright**

```js
await page.goto('https://northernhydraulics.net/hydraulic-cylinder-force-calculator');
await page.evaluate(() => {
  const sidebar = document.querySelector('.cta-block-sidebar');
  const article = document.querySelector('article.post');
  return {
    sidebarParent: sidebar?.parentElement?.tagName + '.' + (sidebar?.parentElement?.className.split(' ')[0] || ''),
    articleParent: article?.parentElement?.tagName + '.' + (article?.parentElement?.className.split(' ')[0] || ''),
    sameParent: sidebar?.parentElement === article?.parentElement,
    sidebarPosition: getComputedStyle(sidebar).position,
    sidebarFloat: getComputedStyle(sidebar).float
  };
});
```

Expected output tells you the parent element. Use it to scope the next step.

- [ ] **Step 2: Add sidebar repositioning rules**

Replace the "(filled in Task 9)" placeholder in section 8 with:

```css
/* On desktop, position the sidebar in a fixed right column.
   The parent of <article> needs position: relative for this to anchor.
   The parent is identified in Step 1 — adjust the selector below if needed. */

@media (min-width: 1100px) {
  body.single-post {
    /* Anchor the sidebar within whatever parent it lives in. */
  }
  body.single-post article.post {
    padding-right: calc(var(--nh-rail) + 32px);
    position: relative;
  }
  body.single-post .cta-block-sidebar {
    position: absolute;
    top: 96px;          /* aligns roughly with lead paragraph; tune after visual check */
    right: 24px;
    width: var(--nh-rail);
    float: none;        /* override theme float if present */
    margin: 0;
  }
}

/* Below 1100px: stack naturally. Reset any float/position the theme applied. */
@media (max-width: 1099px) {
  body.single-post .cta-block-sidebar {
    float: none;
    width: 100%;
    max-width: var(--nh-measure-prose);
    margin: 32px auto;
  }
}
```

If Step 1 revealed the sidebar lives at the body level (not inside `<article>`), the `body.single-post article.post` `padding-right` and `position: relative` won't work — switch to:

```css
@media (min-width: 1100px) {
  body.single-post {
    position: relative;
  }
  body.single-post .cta-block-sidebar {
    position: absolute;
    top: 250px;          /* approximate top of article opening; tune visually */
    right: max(24px, calc((100vw - 1300px) / 2));
    width: var(--nh-rail);
    float: none;
    margin: 0;
  }
}
```

Pick whichever variant matches the actual parent structure.

- [ ] **Step 3: Verify against the calculator post**

Inject CSS, screenshot the top 1000px. Expected: sidebar sits to the right of (not overlapping) the H1/lead, no longer floating into the title.

- [ ] **Step 4: Commit**

```
git add northern-hydraulics-article.css
git commit -m "feat: reposition CTA sidebar to dedicated right column on desktop"
```

---

## Task 10: Responsive

**Files:**
- Modify: `northern-hydraulics-article.css` (section 9 "Responsive")

**Acceptance:**
- At 768–1099px: sidebar stacks (already handled in Task 9). Prose stays 720px max.
- At <768px: H1 shrinks via `clamp()` (already declared in tokens), body padding tightens, tables scroll horizontally.
- At <480px: lead paragraph drops to 19px, eyebrow margin tightens.

- [ ] **Step 1: Add responsive rules**

Replace the "(filled in Task 10)" placeholder in section 9 with:

```css
@media (max-width: 1099px) {
  body.single-post article.post .entry-content {
    grid-template-columns:
      [full-start] minmax(var(--nh-gutter), 1fr)
      [prose-start] minmax(0, var(--nh-measure-prose)) [prose-end]
      minmax(var(--nh-gutter), 1fr) [full-end];
  }
  body.single-post article.post {
    padding-right: 0;
  }
}

@media (max-width: 767px) {
  body.single-post article.post .entry-content {
    padding: 24px 0 48px;
    grid-template-columns:
      [full-start] 20px
      [prose-start] minmax(0, 1fr) [prose-end]
      20px [full-end];
  }
  body.single-post article.post .entry-content > .callout,
  body.single-post article.post .entry-content > .formula,
  body.single-post article.post .entry-content > .figure--breakout,
  body.single-post article.post .entry-content > table {
    max-width: none;
  }
  body.single-post article.post .entry-content > h1 + p,
  body.single-post article.post .entry-content > p.lead {
    font-size: 19px;
  }
  body.single-post article.post .entry-content h2 {
    margin-top: 48px;
    font-size: 28px;
  }
  body.single-post article.post .entry-content h3 {
    font-size: 21px;
  }
  /* Tables: wrap in horizontal scroll automatically */
  body.single-post article.post .entry-content table {
    display: block;
    overflow-x: auto;
    max-width: 100%;
    -webkit-overflow-scrolling: touch;
  }
  /* Hide eyebrow counter on very small screens — too cluttered */
}

@media (max-width: 479px) {
  body.single-post article.post .entry-content h2::before {
    font-size: 11px;
  }
  body.single-post article.post .entry-content .callout {
    padding: 16px 20px 16px 24px;
    border-radius: 4px;
  }
  body.single-post article.post .entry-content .formula {
    padding: 24px 16px 16px;
  }
  body.single-post article.post .entry-content .formula__expr {
    font-size: 24px;
  }
  body.single-post article.post .entry-content ol.steps > li {
    padding-left: 48px;
  }
  body.single-post article.post .entry-content ol.steps > li::before {
    font-size: 32px;
  }
}
```

- [ ] **Step 2: Verify at three viewport widths**

```js
for (const [w, label] of [[1440, 'desktop'], [900, 'tablet'], [375, 'mobile']]) {
  await page.setViewportSize({ width: w, height: 900 });
  await page.goto('https://northernhydraulics.net/hydraulic-cylinder-force-calculator');
  await page.addStyleTag({ content: <stylesheet> });
  await page.screenshot({ path: `task10-${label}.jpeg`, fullPage: true, type: 'jpeg', quality: 85 });
}
```

Expected:
- Desktop (1440): sidebar in right column, prose centered.
- Tablet (900): sidebar stacks, prose still ~720px, eyebrow labels still readable.
- Mobile (375): no horizontal scroll, H1 ~36px, table scrolls within its box, callouts span full width minus 20px gutters.

- [ ] **Step 3: Commit**

```
git add northern-hydraulics-article.css
git commit -m "feat: responsive layout for tablet and mobile"
```

---

## Task 11: Legacy inline-style overrides

**Files:**
- Modify: `northern-hydraulics-article.css` (section 10 "Legacy inline-style overrides")

**Acceptance:**
- On `/catalog/cylinders-faq.html` and other legacy posts where `<p>` has `style="font-size:12px"` (or similar), the paragraph renders at 18px body size.
- No regression elsewhere — only inline `font-size` is overridden.

- [ ] **Step 1: Add legacy override rules**

Replace the "(filled in Task 11)" placeholder in section 10 with:

```css
/* Single targeted exception for legacy posts that have inline font-size on paragraphs.
   This is the ONLY use of !important in the stylesheet. */
body.single-post article.post .entry-content p[style*="font-size"] {
  font-size: var(--nh-type-body) !important;
  line-height: 1.65 !important;
}

body.single-post article.post .entry-content span[style*="font-size"] {
  font-size: inherit !important;
}

/* Some legacy posts use <font> tags. */
body.single-post article.post .entry-content font {
  font-family: inherit !important;
  font-size: inherit !important;
  color: inherit !important;
}
```

- [ ] **Step 2: Verify against the legacy FAQ page**

```js
await page.goto('https://northernhydraulics.net/catalog/cylinders-faq.html');
await page.addStyleTag({ content: <stylesheet> });
await page.evaluate(() => {
  const p = document.querySelector('article .entry-content p[style*="font-size"]');
  return p ? getComputedStyle(p).fontSize : 'no inline-styled p found';
});
```

Expected: `18px` (or whatever `--nh-type-body` evaluates to). Visual: paragraphs on the catalog FAQ are now full body size, not the previous 12px.

- [ ] **Step 3: Commit**

```
git add northern-hydraulics-article.css
git commit -m "feat: defeat legacy inline font-size overrides on catalog posts"
```

---

## Task 12: README — installation + component usage examples

**Files:**
- Modify: `README.md`

**Acceptance:** README explains installation, gives copy-pasteable HTML snippets for each component, lists test URLs, and documents the one `!important` usage.

- [ ] **Step 1: Replace the "(filled in Task 12)" components section**

Open `README.md` and replace the `## Components (opt-in HTML)` section (and append a `## How it works` section) with:

```markdown
## Components (opt-in HTML)

These wrappers are pasted directly into the post body in the editor. The base styles (typography, palette, hierarchy) work on raw HTML alone — components are only for emphasis blocks.

### Key takeaway callout

```html
<aside class="callout callout--key">
  <p>Always include a 25% safety factor for unpredictable loads.</p>
</aside>
```

### Note callout

```html
<aside class="callout callout--note">
  <p>Pressure is typically measured in <code>psi</code> or <code>bar</code>.</p>
</aside>
```

### Warning callout

```html
<aside class="callout callout--warn">
  <p>Exceeding rated pressure can cause seal failure.</p>
</aside>
```

### Formula block

```html
<figure class="formula">
  <div class="formula__expr">F = P × A</div>
  <figcaption>Force equals pressure times area.</figcaption>
</figure>
```

To put unit symbols in mono inside a formula:

```html
<div class="formula__expr">F = P × A &middot; <code>lbf</code></div>
```

### Numbered steps

```html
<ol class="steps">
  <li>Measure the cylinder's bore diameter.</li>
  <li>Determine the hydraulic system pressure in psi.</li>
  <li>Multiply pressure by piston area to get push force.</li>
</ol>
```

### Definition list (built-in HTML, no class needed)

```html
<dl>
  <dt>Bore</dt>
  <dd>The inside diameter of the cylinder barrel.</dd>
  <dt>Rod</dt>
  <dd>The shaft that extends from one end of the cylinder.</dd>
</dl>
```

### Comparison table

Standard `<table>` markup works automatically. To make a numeric column render in monospace with right alignment, add `class="num"` to the relevant `<th>` and `<td>`:

```html
<table>
  <thead>
    <tr><th>Unit</th><th>Symbol</th><th class="num">Conversion</th></tr>
  </thead>
  <tbody>
    <tr><td>PSI</td><td><code>psi</code></td><td class="num">6,894.76</td></tr>
  </tbody>
</table>
```

### Inline code / units

Wrap any unit, model number, or technical value in `<code>`:

```html
The pressure is <code>2,500 psi</code> at the rod.
```

### Lead paragraph

The first `<p>` immediately following the `<h1>` automatically renders as a larger, muted lead. If your post has a date or image between the H1 and the lead, opt in explicitly:

```html
<p class="lead">Your opening paragraph here.</p>
```

### Breakout figure (extends past prose column)

```html
<figure class="figure--breakout">
  <img src="..." alt="..." />
  <figcaption>Optional caption.</figcaption>
</figure>
```

## How it works

- Every rule is scoped to `body.single-post article.post`. Product pages, archives, the homepage, header, footer, and any non-blog content are untouched.
- Design tokens live in `:root` CSS custom properties. To rebrand, edit the values at the top of the file.
- Two new web fonts (Newsreader, JetBrains Mono) are loaded from Google Fonts via `@import`. Existing Inter is also loaded with extra weights. Total wire cost: ~50KB.
- One `!important` is used: `p[style*="font-size"]` overrides legacy inline `font-size` on old catalog posts. It is scoped to the article context only and is the only exception.
- No JavaScript. No theme files modified. No plugin files modified. No editor (Gutenberg) block changes.

## Uninstall

Delete the contents of Customizer → Additional CSS and re-publish. Pages revert to theme defaults.
```

- [ ] **Step 2: Commit**

```
git add README.md
git commit -m "docs: README with installation, components, and how-it-works"
```

---

## Task 13: Final verification against spec acceptance criteria

**Files:** none (verification only)

Run the full spec §11 acceptance checklist. Document results in `docs/test-results.md` (create the file).

- [ ] **Step 1: Run each acceptance check via Playwright**

For each item below, perform the check on the live site with the in-progress CSS injected via `addStyleTag`. Record PASS/FAIL with a screenshot reference.

| # | Acceptance criterion | How to verify |
|---|---|---|
| 1 | H1 wraps without overlapping lines | Visit calculator post, screenshot above-fold, confirm H1 readable |
| 2 | H2 is visually larger and heavier than H3 | Screenshot section breakdown; compare H2 "Understanding..." vs H3 "Push Force" |
| 3 | Body prose column = 60–75 chars/line at desktop | Count chars in any paragraph; should be 60–75 |
| 4 | `<strong>` is bolder and same color as body | Find a `<strong>` in calculator post; computed color = `#171717`, weight 700 |
| 5 | Right-rail CTA does not collide with H1 | Screenshot top 600px; sidebar must not overlap H1 |
| 6 | Comparison table has zebra striping and right-aligned mono numerals | Visit calculator post, find the metric conversion table |
| 7 | At least one `.callout--key` renders correctly | Add a callout to a test post or to test-mockup.html |
| 8 | No horizontal scroll on mobile (375px) | Set viewport 375x900, scroll full page, confirm |
| 9 | Catalog FAQ has 18px paragraph text | Visit `/catalog/cylinders-faq.html`, check computed font-size |
| 10 | No regression on product pages, homepage, category archives | Visit `/`, a product page, a category page — confirm no visual change |

- [ ] **Step 2: Document results**

Create `test-results.md`:

```markdown
# Acceptance Test Results — YYYY-MM-DD

CSS file version: <git short SHA>

| # | Criterion | Result | Notes / screenshot |
|---|---|---|---|
| 1 | H1 wraps without overlap | PASS | task1-h1.png |
| 2 | H2 > H3 hierarchy | PASS | task2-hierarchy.png |
| ... | ... | ... | ... |
```

- [ ] **Step 3: Commit**

```
git add test-results.md
git commit -m "test: spec acceptance results"
```

---

## Task 14: Minification + final delivery package

**Files:**
- Create: `northern-hydraulics-article.min.css`
- Modify: `README.md` (add note about minified version)

- [ ] **Step 1: Minify the CSS**

Use any minifier (e.g., `npx clean-css-cli northern-hydraulics-article.css -o northern-hydraulics-article.min.css`, or paste into cssminifier.com). Target output size: ≤8KB.

If `clean-css-cli` is unavailable, an inline regex strip is acceptable: remove comments (`/* ... */`), collapse whitespace, remove newlines between rules. Verify the output still parses by loading it in `test-mockup.html`.

- [ ] **Step 2: Confirm minified file works**

Update `test-mockup.html` to point at `.min.css` temporarily, reload, verify visual parity with the non-minified version. Revert the link tag.

- [ ] **Step 3: Add a note to README**

Append to the Install section:

```markdown
A minified version (`northern-hydraulics-article.min.css`) is also provided for production paste; the unminified file is identical in behavior and easier to read or edit.
```

- [ ] **Step 4: Commit**

```
git add northern-hydraulics-article.min.css README.md
git commit -m "build: minified production stylesheet"
```

---

## Done

Final deliverables in the project folder:

- `northern-hydraulics-article.css` — readable source
- `northern-hydraulics-article.min.css` — production paste
- `README.md` — installation + components + uninstall
- `test-results.md` — acceptance verification record
- `test-mockup.html` — keep or delete; not part of delivery

Hand the two CSS files + README to the site owner. They paste the min CSS into **Appearance → Customize → Additional CSS** and publish.
