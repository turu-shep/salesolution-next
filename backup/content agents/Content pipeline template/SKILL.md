---
name: content-pipeline
description: |
  End-to-end content creation pipeline for blog articles. Covers all 7 phases: content prep, SEO structure (meta tags, TOC, schema, key takeaways), image creation (SVG infographics + AI photos via API), HTML integration, cross-linking with the category map, final QA, and project management updates. Each phase has built-in verification gates that MUST pass before moving on. Use this skill whenever the user mentions "new article," "content pipeline," "run the playbook," "blog post," any {PREFIX}-{number} issue reference, or wants to create/finish/fix a blog article. Also trigger when the user says "redo this step" or "recheck" on an existing article — the skill supports re-running individual phases.
---

# Content Pipeline

This skill runs the full content creation workflow. It produces a self-contained article folder with HTML, SVG infographics (with verified PNG renders), AI-generated hero images, optimized internal/external links, structured data, and an updated project management issue.

**The core principle: verify everything, skip nothing.** Every phase ends with a verification gate. If a gate fails, fix the issue and re-verify before moving on. Never proceed past a failed gate.

## Before You Start

1. **Read the pipeline config:** `CONFIG.md` in the skill folder — this contains all brand-specific settings (colors, competitors, URLs, etc.). Every `{CONFIG.*}` reference below comes from this file.
2. **Read the product marketing context:** `{CONFIG.product_context_file}` (default: `.agents/product-marketing-context.md`)
3. **Read the cross-link map** (if configured): `{CONFIG.cross_link_map_file}` (you will need the `xlsx` skill for this)
4. Get the issue details (issue ID, title, description) from the user or from the project management tool directly
5. Create a TodoList with all 7 phases so the user can track progress

---

## Phase 1: Content Preparation

**Goal:** Get the article HTML ready for image and link work.

### Steps

1. **Receive or create the article HTML.** If the user provides raw content, wrap it in clean semantic HTML. If generating from scratch, follow the brand voice from CONFIG: `{CONFIG.tone}`.

2. **Competitor audit.** Search the entire HTML for every brand name listed in `{CONFIG.competitors}` (case-insensitive). Replace every instance with generic terms from `{CONFIG.generic_replacements}`:
   - Never say "Unlike [competitor]..." or "Better than [competitor]..."

3. **Identify image insertion points.** Mark 4-6 natural breaks in the content where images will go:
   - Top of article -> hero image (AI photo)
   - After each major concept introduction -> SVG infographic
   - At "Where to Buy" or shopping section -> lifestyle AI photo
   - Images go AFTER the concept they illustrate, not before

4. **Evaluate H2 headings for question format.** Review every H2 in the article and consider whether rephrasing it as a question would better match how users actually search. This is not mandatory for every heading — only do it where it genuinely improves navigation and search alignment. Ask yourself: would a user type this heading into Google as a question? If yes, rephrase it. If the statement form reads better or is more compelling, keep it.

5. **Add the FAQ section.** Every article MUST end with an FAQ section containing `{CONFIG.faq_question_count}` questions. Each question is an `<h2>` heading — Google treats H2 FAQ headings as stronger semantic signals and they render properly in all contexts.

   ```html
   <h2>Frequently Asked Questions</h2>

   <h2>What is [topic-specific question]?</h2>
   <p>[Concise, authoritative answer.]</p>

   <!-- repeat for each Q&A -->
   ```

6. **Add FAQ schema markup.** Immediately after the last FAQ answer, add a JSON-LD script block. The questions and answers MUST exactly match the visible FAQ section above.

   ```html
   <script type="application/ld+json">
   {
     "@context": "https://schema.org",
     "@type": "FAQPage",
     "mainEntity": [
       {
         "@type": "Question",
         "name": "What is [topic-specific question]?",
         "acceptedAnswer": {
           "@type": "Answer",
           "text": "[Concise, authoritative answer.]"
         }
       }
     ]
   }
   </script>
   ```

### Phase 1 Gate

Verify before proceeding:
- [ ] No competitor names in the HTML (run: `grep -i "{CONFIG.competitors joined by \\|}" article.html`)
- [ ] H2 headings reviewed — question format used where it adds value
- [ ] FAQ section exists with 5+ questions as H2 headings
- [ ] FAQ JSON-LD schema is present and valid JSON
- [ ] Schema questions/answers match the visible FAQ text exactly
- [ ] Image insertion points are identified and noted

Report gate results to the user. If anything fails, fix it now.

---

## Phase 2: SEO Structure & Meta

**Goal:** Add the HTML wrapper, meta tags, table of contents, key takeaways, and Article schema. These are the elements that help the article rank, get cited by AI search engines, and display correctly when shared on social media. `{CONFIG.publishing_platform}` will auto-generate: `{CONFIG.platform_auto_generates}` — this phase covers everything else.

### Steps

1. **Wrap in full HTML structure.** The article needs a proper `<head>` section with meta tags:

   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">

     <!-- SEO Meta -->
     <title>{Article Title} {CONFIG.meta_title_suffix}</title>
     <meta name="description" content="{150-160 char summary with primary keyword}">

     <!-- Open Graph (social sharing) -->
     <meta property="og:title" content="{Article Title}">
     <meta property="og:description" content="{Same as meta description or shorter variant}">
     <meta property="og:type" content="article">
     <meta property="og:image" content="{hero-image-filename.webp}">

     <!-- Twitter Card -->
     <meta name="twitter:card" content="summary_large_image">
     <meta name="twitter:title" content="{Article Title}">
     <meta name="twitter:description" content="{Same as meta description}">
     <meta name="twitter:image" content="{hero-image-filename.webp}">

     <!-- Allow AI Overviews to cite this content -->
     <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
   </head>
   <body>
   <!-- article content here -->
   </body>
   </html>
   ```

   Write a genuinely compelling meta description: include the primary keyword, a specific claim or number, and a reason to click.

2. **Add Key Takeaways block.** Place this immediately after the `<h1>` title, before the main body content. This is the #1 way to get cited in Google AI Overviews and Perplexity — AI systems parse structured summary blocks near the top of the page.

   If the article already opens with a strong summary, that counts — don't duplicate it. Only add a separate Key Takeaways block if the article opens with narrative prose without clear summary points.

   When adding one, keep it to 50-70 words:
   ```html
   <div class="key-takeaways">
     <p><strong>Key Takeaways:</strong> [Concise summary with key facts, numbers, and the brand's differentiator.]</p>
   </div>
   ```

3. **Add Table of Contents with anchor links.** Place after the key takeaways / intro, before the first H2 section. Give every H2 an `id` attribute and link to it from the TOC.

   ```html
   <nav class="table-of-contents">
     <p><strong>In This Guide:</strong></p>
     <ul>
       <li><a href="#section-id">Section Title</a></li>
       <!-- one per H2 -->
     </ul>
   </nav>

   <!-- Then each H2 gets a matching id: -->
   <h2 id="section-id">Section Title</h2>
   ```

   Use lowercase, hyphen-separated ids that match the heading text. Include all major H2s but skip FAQ individual questions — just link to the "Frequently Asked Questions" header.

4. **Add "Last Updated" date.** Place a visible date line near the top of the article, right after the H1 or after the key takeaways block:

   ```html
   <p class="last-updated"><em>Last updated: {Current Month Year}</em></p>
   ```

5. **Add Article schema (JSON-LD).** Place this in the `<head>` or at the bottom of `<body>` alongside the FAQ schema.

   ```html
   <script type="application/ld+json">
   {
     "@context": "https://schema.org",
     "@type": "Article",
     "headline": "{Article Title}",
     "description": "{Same as meta description}",
     "image": "{hero-image-filename.webp}",
     "datePublished": "{YYYY-MM-DD}",
     "dateModified": "{YYYY-MM-DD}",
     "author": {
       "@type": "Organization",
       "name": "{CONFIG.brand_name}",
       "url": "{CONFIG.website_full_url}"
     },
     "publisher": {
       "@type": "Organization",
       "name": "{CONFIG.brand_name}",
       "url": "{CONFIG.website_full_url}",
       "logo": {
         "@type": "ImageObject",
         "url": "{CONFIG.logo_url}"
       }
     }
   }
   </script>
   ```

### Phase 2 Gate

- [ ] `<head>` section exists with `<title>` and `<meta name="description">`
- [ ] Meta description is 150-160 characters, contains primary keyword, and reads as a compelling pitch
- [ ] Open Graph tags present (og:title, og:description, og:type, og:image)
- [ ] Twitter Card tags present (twitter:card, twitter:title, twitter:description, twitter:image)
- [ ] robots meta allows max-snippet and max-image-preview
- [ ] Key Takeaways block present near top (or article already opens with clear summary points)
- [ ] Table of Contents present with working anchor links to each H2
- [ ] Every H2 has a matching `id` attribute
- [ ] "Last updated" date visible in the article
- [ ] Article schema (JSON-LD) present with headline, dates, author, publisher

---

## Phase 3: Image Creation

**Goal:** Create all visual assets — SVG infographics and AI-generated photos.

### 3A: SVG Infographics (2-3 per article)

Each SVG follows the brand design system defined in CONFIG.

**Canvas & Layout:**
- viewBox width: **{CONFIG.svg_viewbox_width}px** (use {CONFIG.svg_viewbox_width_complex}px for complex infographics with 4+ columns). Height varies by content.
- Background: subtle linear gradient from {CONFIG.background_gradient_from} to {CONFIG.background_gradient_to}
- Cards: white (#FFFFFF) background, {CONFIG.svg_card_radius} border-radius, refined drop shadow (feDropShadow dx=0 dy=2 stdDeviation=4, flood-opacity={CONFIG.svg_card_shadow_opacity})
- Font: font-family="{CONFIG.svg_font_family}" on root SVG
- Spacing: generous padding inside cards (20-30px) and between elements — luxury design breathes

**Color Palette:**

Read the palette from CONFIG. The core palette has four mandatory colors:

| Role | Color Name | Hex | Usage |
|------|-----------|-----|-------|
| Primary | {CONFIG.palette_core.primary.name} | {CONFIG.palette_core.primary.hex} | {CONFIG.palette_core.primary.role} |
| Accent | {CONFIG.palette_core.accent.name} | {CONFIG.palette_core.accent.hex} | {CONFIG.palette_core.accent.role} |
| Semantic | {CONFIG.palette_core.semantic.name} | {CONFIG.palette_core.semantic.hex} | {CONFIG.palette_core.semantic.role} |
| Background | {CONFIG.palette_core.background.name} | {CONFIG.palette_core.background.hex} | {CONFIG.palette_core.background.role} |

Supporting neutrals and conditional accent are also in CONFIG. Use the conditional accent (`{CONFIG.palette_conditional.name}` / `{CONFIG.palette_conditional.hex}`) only when: `{CONFIG.palette_conditional.when_to_use}`.

**Critical Rules:**
- NEVER use Unicode emoji in SVG text. Draw all icons with SVG primitives (circle, rect, path, line, polyline, polygon)
- Calculate card positions mathematically: start_x = (viewBox_width - total_cards_width) / 2
- viewBox height must leave 16-24px bottom padding below the lowest element
- Text must never overflow its container card. Calculate max string width before choosing font sizes.
- For long labels or price ranges, reduce font-size or use `<tspan>` line breaks rather than letting text collide

**SVG Source Review -> Render -> Inspect (three-step QA):**

Before rendering to PNG, review the SVG source code first. This catches structural issues before they become visual bugs:

**Step 1 — Review SVG source:**
- Read the SVG file and check for:
  - Any Unicode emoji characters (these will render as blank rectangles)
  - Text elements that might overflow their container
  - Card position math: verify start_x = (viewBox_width - total_cards_width) / 2
  - That viewBox height has 16-24px padding below the lowest element
  - All fills and strokes use the brand palette colors from CONFIG (no old colors from `{CONFIG.old_colors_to_flag}`)
  - No hardcoded widths that assume a different viewBox
- Fix any issues found in the source before rendering

**Step 2 — Render to PNG:**
```bash
pip install cairosvg --break-system-packages 2>/dev/null
python3 -c "
import cairosvg
cairosvg.svg2png(url='INPUT.svg', write_to='OUTPUT.png', output_width={CONFIG.svg_viewbox_width})
print('Rendered successfully')
"
```

**Step 3 — Visually inspect the PNG:**
Use the Read tool to open the PNG and check:
1. **Text overflow** — any text extending beyond card boundaries or viewBox
2. **Card alignment** — all cards in a row are equal width and evenly spaced
3. **No blank rectangles** — would indicate emoji characters that failed to render
4. **Bar proportionality** — comparison bars are mathematically proportional to values
5. **Color accuracy** — fills match the brand palette
6. **Bottom clipping** — nothing cut off at the viewBox bottom edge
7. **Overall appearance** — does it look like something this brand would use?

If ANY issue is found: fix the SVG source (Step 1), re-render (Step 2), re-inspect (Step 3). Repeat the full three-step cycle until the PNG is clean.

### 3B: AI Photos via API (1-2 per article)

AI image generation uses the OpenAI API ({CONFIG.image_model}). This is more reliable and automatable than browser-based generation.

**Setup:**
```bash
pip install openai --break-system-packages 2>/dev/null
```

The API key should be available as `OPENAI_API_KEY` environment variable. If not set, ask the user for it.

**Generation script:**
```python
import openai, base64, os

client = openai.OpenAI()

response = client.images.generate(
    model="{CONFIG.image_model}",
    prompt=PROMPT,       # see style prompt template below
    size="{CONFIG.image_size}",
    quality="{CONFIG.image_quality}",
    n=1
)

# Save the image
image_bytes = base64.b64decode(response.data[0].b64_json)
with open("OUTPUT.webp", "wb") as f:
    f.write(image_bytes)
```

**Style prompt template — use `{CONFIG.style_prompt_base}` as the base for every image, then add article-specific context.**

For each image, customize the `[ARTICLE-SPECIFIC SUBJECT]` part using the subject examples in CONFIG as reference.

**After generation:**
1. Use the Read tool to visually inspect the generated image
2. Check for: distorted hands/fingers, unwanted text, unrealistic artifacts, anything that looks off-brand
3. If unsatisfactory, regenerate with a refined prompt
4. Rename to descriptive, lowercase, hyphen-separated name (e.g., `hero-topic-name.webp`)

If the API key is unavailable or generation fails, create a placeholder file named `{intended-name}.webp.txt` containing the exact prompt used, so the user can generate manually. Report this clearly in the phase gate.

### Phase 3 Gate

For each SVG infographic, verify:
- [ ] SVG source was reviewed and issues fixed before rendering
- [ ] SVG file exists and is > 2KB
- [ ] PNG render exists and is > 5KB
- [ ] PNG has been visually inspected (describe what you see in each one)
- [ ] No emoji characters in SVG source
- [ ] Colors match the brand palette (no old/flagged colors)
- [ ] Overall look is premium and on-brand

For AI photos, verify:
- [ ] WebP files exist (not .webp.txt placeholders)
- [ ] Images visually inspected and look realistic and on-brand
- [ ] No text, logos, or artifacts in the images

Report the full gate results to the user, including a description of what each rendered PNG and generated photo looks like. If any SVG has issues, fix and re-render now.

---

## Phase 4: HTML Integration

**Goal:** Wire images into the article HTML and verify rendering.

### Steps

1. **Move all assets into the article folder.** The folder lives at the project root:
   ```
   {CONFIG.issue_prefix}-{ID}_{Article_Title_In_Underscores}/
   ├── {CONFIG.issue_prefix}-{ID}_{Full_Article_Title}.html
   ├── hero-image.webp
   ├── infographic-1.svg
   ├── infographic-1.png    (render — kept for QA, not referenced in HTML)
   ├── infographic-2.svg
   ├── infographic-2.png
   └── lifestyle-image.webp
   ```

2. **Insert `<img>` tags** at the marked insertion points:
   ```html
   <img src="filename.ext" width="100%" alt="Descriptive alt text explaining image content">
   ```
   - `src` uses same-folder relative paths (just the filename, no subdirectories)
   - `width="100%"` on every image
   - `alt` must be descriptive and include relevant keywords (not "image" or "photo")

3. **Update all image paths.** If any `src` attributes point to subdirectories or absolute paths, change them to same-folder relative: `src="filename.ext"`

### Phase 4 Gate

- [ ] All `<img>` tags use relative same-folder `src` (no `/`, no `http`, no `images/`)
- [ ] All referenced image files exist in the folder
- [ ] Every `<img>` has `width="100%"`
- [ ] Every `<img>` has a non-empty, descriptive `alt` attribute
- [ ] Open the HTML in a browser (or read it) to verify images appear at the correct positions

---

## Phase 5: Link Optimization & Cross-Linking

**Goal:** Maximize internal link equity to money pages and ensure correct rel attributes.

### Setup

If `{CONFIG.cross_link_map_file}` is configured, open it (use the xlsx skill if needed). You need the tabs defined in `{CONFIG.crosslink_tabs}`:
- **"{CONFIG.crosslink_tabs.cta_tab}"** — find this article's primary and secondary collection targets + pre-written CTA text
- **"{CONFIG.crosslink_tabs.keyword_tab}"** — look up keywords to find matching collection URLs
- **"{CONFIG.crosslink_tabs.content_gap_tab}"** — check if this article can support any underserved collections

If no cross-link map is configured, skip to step 5 (link attributes) and apply rules to any links already in the article.

### Steps

1. **Insert in-context links.** Scan each H2 section for keyword phrases. Cross-reference with the keyword tab. For each match, wrap the keyword in a link:
   ```html
   <a target="_blank" rel="{CONFIG.internal_link_rel}" href="{CONFIG.website_full_url}/collections/...">keyword phrase</a>
   ```
   Rules:
   - Minimum {CONFIG.min_internal_links_per_section} internal link per H2 section, aim for 2-3 in long sections
   - Place the most important link in the first two paragraphs of each section
   - Use keyword-rich anchor text (the exact keyword from the map or a close variant)
   - Vary anchors when linking to the same collection multiple times
   - NEVER link the same anchor text to two different URLs
   - Link to the deepest relevant collection (specific sub-collection > broad parent)

2. **Add end-of-section CTAs.** After each product-relevant H2, add a transitional sentence with a collection link. Use the CTA text from the CTA tab if available.

3. **Add end-of-article CTA.** The conclusion MUST include a strong CTA to the primary collection. This is the highest-intent position.

4. **Check Content Gap Priorities.** If the article can naturally link to any underserved collection, add that link.

5. **Set link attributes.**

   **Internal links ({CONFIG.website_url}):**
   ```html
   <a target="_blank" rel="{CONFIG.internal_link_rel}" href="{CONFIG.website_full_url}/...">text</a>
   ```
   - NEVER add noreferrer to internal links (blocks your own referral data)
   - NEVER add nofollow to internal links (blocks your own SEO equity)

   **External links (other domains):**
   ```html
   <a target="_blank" rel="{CONFIG.external_link_rel}" href="https://...">text</a>
   ```
   - NO nofollow for authoritative sources (this boosts E-E-A-T)
   - DO add nofollow only for: affiliate links, sponsored content, user-generated content, untrusted sites

### Phase 5 Gate

Run the verification script to check links programmatically:
```bash
python3 {SKILL_FOLDER}/scripts/verify_article.py ARTICLE_FOLDER/
```

Additionally verify:
- [ ] Every H2 section has at least {CONFIG.min_internal_links_per_section} internal link
- [ ] Internal links use rel="{CONFIG.internal_link_rel}" ONLY
- [ ] External links use rel="{CONFIG.external_link_rel}"
- [ ] No generic anchors ("click here", "here", "read more")
- [ ] No duplicate anchor text pointing to different URLs
- [ ] End-of-article CTA links to primary collection
- [ ] All links actually resolve (spot-check 3-4 URLs)

---

## Phase 6: Final Review

**Goal:** Catch anything the earlier gates missed.

### Steps

1. **Run the full verification script:**
   ```bash
   python3 {SKILL_FOLDER}/scripts/verify_article.py ARTICLE_FOLDER/
   ```
   This checks: file structure, naming conventions, placeholder files, SVG/PNG pairs, image references, link attributes, anchor text quality, FAQ presence, FAQ schema, meta tags, TOC, Article schema, competitor mentions, color palette, and more.

2. **Fix every FAIL.** Re-run the script after each fix until all checks pass.

3. **Brand voice scan.** Read the article from top to bottom and check:
   - Tone matches `{CONFIG.tone}`
   - Value-focused messaging
   - No competitor mentions that slipped through
   - Natural transitions between sections
   - Keywords from product marketing context used naturally

4. **Re-inspect every SVG PNG one more time.** Open each PNG with the Read tool. This is the final visual check — confirm nothing has been broken by edits in Phases 4-5. Describe what you see in each one to the user.

### Phase 6 Gate

- [ ] Verification script: ALL checks PASS
- [ ] Brand voice is consistent throughout
- [ ] All SVG PNGs visually confirmed clean (described to user)
- [ ] Article reads naturally as a cohesive piece

Report the full verification script output to the user.

---

## Phase 7: File Organization & Project Management Update

**Goal:** Finalize the folder structure and update the project management tool.

### Steps

1. **Verify folder structure matches this layout exactly:**
   ```
   {CONFIG.issue_prefix}-{ID}_{Article_Title}/
   ├── {CONFIG.issue_prefix}-{ID}_{Full_Article_Title}.html
   ├── {infographic-1}.svg
   ├── {infographic-1}.png
   ├── {infographic-2}.svg
   ├── {infographic-2}.png
   ├── {hero-image}.webp
   └── {lifestyle-image}.webp  (if applicable)
   ```

2. **Update the project management issue** (if `{CONFIG.project_management_tool}` is configured). Pull the issue by ID and update:
   - **Description:** Add a deliverables section listing every file in the folder
   - **Status:** Move to "{CONFIG.pm_done_status}"

### Phase 7 Gate

- [ ] Folder contains exactly the expected files (no extras, no missing)
- [ ] PM issue description updated with deliverables (if PM tool configured)
- [ ] PM issue status updated (if PM tool configured)

---

## Re-Running Individual Phases

When the user says "redo step X" or "recheck phase Y":

1. Identify which phase they mean (by number or description)
2. Re-run ONLY that phase's steps
3. Re-run that phase's verification gate
4. If the phase modified things that downstream phases depend on (e.g., Phase 3 images affect Phase 4 integration), re-run the downstream gates too
5. Always finish with a full verification script run (Phase 6 step 1)

---

## Quick Reference: Common Mistakes to Avoid

These are the issues that come up most often. Pay extra attention to them:

1. **Skipping SVG source review before rendering.** Always review SVG code first (Step 1), fix issues, THEN render to PNG (Step 2), THEN inspect visually (Step 3). Never go straight from code to PNG without reviewing.

2. **Skipping PNG visual inspection.** Every SVG MUST be rendered to PNG and visually inspected with the Read tool. Code that looks correct can produce broken visuals. Describe what you see to the user.

3. **Missing FAQ schema.** The JSON-LD FAQPage schema block is required on every article. It's separate from the visible FAQ HTML. Questions must be H2 headings.

4. **Missing Article schema or meta tags.** Every article needs both the `<head>` meta block (title, description, OG, Twitter) AND the Article JSON-LD schema. These are separate from what the platform generates.

5. **Wrong rel attributes on internal links.** Internal links get rel="{CONFIG.internal_link_rel}" ONLY. Adding noreferrer or nofollow to internal links directly hurts SEO.

6. **Placeholder image files.** If API image generation didn't complete, `.webp.txt` placeholder files get left behind. These must be flagged, not silently ignored.

7. **Emoji in SVGs.** Unicode emoji render as blank rectangles in many SVG renderers. Always use SVG shape primitives for icons.

8. **Non-relative image paths.** All `<img src>` must be just the filename — no subdirectories, no absolute paths.

9. **Generic anchor text.** "Click here" and "read more" waste link equity. Every anchor must contain the target keyword.

10. **Using old/flagged colors.** Check the palette in CONFIG. If you see any color from `{CONFIG.old_colors_to_flag}` in SVG code, it's wrong.

11. **Missing Table of Contents.** Every article needs a TOC with anchor links after the intro. Every H2 needs a matching `id` attribute.
