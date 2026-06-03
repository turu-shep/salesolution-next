# Content Pipeline Configuration

Fill out every section below before using the pipeline skill. This file is read by the skill at the start of every run to configure brand-specific behavior.

---

## Brand

```yaml
brand_name: ""              # e.g. "Liori Diamonds"
website_url: ""             # e.g. "lioridiamonds.com" (no https://, no trailing slash)
website_full_url: ""        # e.g. "https://lioridiamonds.com"
logo_url: ""                # Full URL to brand logo image (used in Article schema)
issue_prefix: ""            # e.g. "LIORI" — used for folder/file naming: {PREFIX}-{ID}_{Title}
meta_title_suffix: ""       # e.g. "| Liori Diamonds" — appended to <title> tags
```

## Brand Voice

```yaml
tone: ""                    # e.g. "expert yet approachable, value-focused, no jargon"
# Write 1-2 sentences describing how the brand should sound in articles.
# This guides content creation and the brand voice scan in final review.
```

## Competitors to Scrub

List every competitor brand name that must NEVER appear in article content. The pipeline will find and replace these with generic alternatives.

```yaml
competitors:
  - ""    # e.g. "James Allen"
  - ""    # e.g. "Blue Nile"
  - ""    # e.g. "Brilliant Earth"
```

Generic replacement phrases (used when a competitor name is removed):

```yaml
generic_replacements:
  - "Leading online retailers"
  - "Most industry websites"
  - "The industry standard"
```

## Color Palette

### Core Palette (required — used in every infographic)

```yaml
palette_core:
  primary:
    name: ""                # e.g. "Deep Midnight"
    hex: ""                 # e.g. "#0C1B33"
    role: ""                # e.g. "Headings, text, card headers"
  accent:
    name: ""                # e.g. "Champagne Gold"
    hex: ""                 # e.g. "#C9A96E"
    role: ""                # e.g. "CTAs, highlights, key numbers"
  semantic:
    name: ""                # e.g. "Deep Rose"
    hex: ""                 # e.g. "#8B3A4A"
    role: ""                # e.g. "Errors, warnings, urgency"
  background:
    name: ""                # e.g. "Warm Ivory"
    hex: ""                 # e.g. "#FAF7F2"
    role: ""                # e.g. "Page and card backgrounds"
```

### Supporting Neutrals

```yaml
palette_supporting:
  alt_background:
    name: ""                # e.g. "Soft Cream"
    hex: ""                 # e.g. "#F5EFE6"
  secondary_text:
    name: ""                # e.g. "Warm Taupe"
    hex: ""                 # e.g. "#7A7067"
  body_text:
    name: ""                # e.g. "Charcoal"
    hex: ""                 # e.g. "#3D3D3D"
  card_fill:
    name: "White"
    hex: "#FFFFFF"
```

### Conditional Accent (optional — use when content fits)

```yaml
palette_conditional:
  name: ""                  # e.g. "Emerald"
  hex: ""                   # e.g. "#1A5E3B"
  when_to_use: ""           # e.g. "When infographic has recommended/pros concept and green works with ensemble"
```

### Old Colors to Flag (colors from a previous brand that should be caught by verification)

```yaml
old_colors_to_flag:
  - ""    # e.g. "#FF6F2E"
  - ""    # e.g. "#071E40"
```

## Design System

```yaml
svg_viewbox_width: 1400           # Default viewBox width in px
svg_viewbox_width_complex: 1600   # For infographics with 4+ columns
svg_font_family: "'Jost', 'Segoe UI', Arial, sans-serif"
svg_card_radius: "12-16px"
svg_card_shadow_opacity: 0.06
background_gradient_from: ""      # e.g. "#FAF7F2" (usually same as palette background)
background_gradient_to: ""        # e.g. "#F5EFE6" (usually same as alt_background)
```

## Image Generation

```yaml
image_model: "gpt-image-1"
image_size: "1536x1024"           # Landscape for hero images
image_quality: "high"
```

### Style Prompt Base

Write the base style prompt for AI-generated photos. The pipeline will append article-specific subjects to this.

```
style_prompt_base: >
  [Write your base prompt here. Example for luxury jewelry:
  "Luxury editorial jewelry photography. Shot on a medium format camera
  with a 110mm lens, f/2.8 aperture, creating a shallow depth of field.
  Natural window lighting with soft fill. The scene features
  [ARTICLE-SPECIFIC SUBJECT]. The setting is refined and aspirational.
  Color temperature is warm (around 4500K). The mood is intimate and
  sophisticated. No text, no logos, no watermarks. Photorealistic."]
```

### Subject Examples (for reference when writing per-article prompts)

```yaml
image_subject_examples:
  hero: ""        # e.g. "a jeweler's hand holding a brilliant-cut loose diamond with tweezers"
  lifestyle: ""   # e.g. "a woman's hands browsing diamond rings on a tablet"
  gift: ""        # e.g. "an elegant gift box being opened to reveal a diamond pendant"
```

## External Files

```yaml
product_context_file: ".agents/product-marketing-context.md"
cross_link_map_file: ""     # e.g. "Liori_Category_Keyword_CrossLink_Map.xlsx"
```

### Cross-Link Map Tab Names (if using a cross-link spreadsheet)

```yaml
crosslink_tabs:
  cta_tab: ""               # e.g. "Blog → Collection CTAs"
  keyword_tab: ""           # e.g. "Keyword → Category Map"
  content_gap_tab: ""       # e.g. "Content Gap Priorities"
```

If you don't have a cross-link map yet, set `cross_link_map_file` to empty and the pipeline will skip Phase 5 cross-linking (but still apply link attribute rules to any links already in the article).

## Platform & Integrations

```yaml
publishing_platform: ""     # e.g. "Shopify", "WordPress", "Webflow"
platform_auto_generates:    # List what the platform handles automatically
  - ""                      # e.g. "breadcrumbs"
  - ""                      # e.g. "some schema markup"

project_management_tool: "" # e.g. "Linear", "Asana", "Jira", or "" to skip
pm_done_status: ""          # e.g. "In Review" — status to set when article is complete
```

## Content Rules

```yaml
faq_question_count: "5-8"         # Min-max FAQ questions per article
min_internal_links: 3             # Minimum internal links in entire article
min_internal_links_per_section: 1 # Minimum per H2 section
min_images: 3                     # Minimum total images (SVG + WebP)
meta_description_length:
  min: 140
  max: 165
```

## Link Policy

```yaml
internal_link_rel: "noopener"               # For links to your own site
external_link_rel: "noopener noreferrer"     # For links to external authoritative sources
# Add nofollow ONLY for: affiliate links, sponsored content, user-generated content, untrusted sites
```

---

## How This Config Is Used

The pipeline skill reads this file at the start of every run and uses it to:

1. **Name folders and files** using `issue_prefix`
2. **Scrub competitor names** from article content
3. **Apply the color palette** to SVG infographics
4. **Flag old colors** in the verification script
5. **Generate AI images** using the style prompt
6. **Build meta tags and schema** with brand name, URL, and logo
7. **Apply link attributes** per the link policy
8. **Cross-link to collections** using the map file
9. **Update the project management tool** when complete
10. **Enforce content rules** (FAQ count, link density, image count, etc.)

If a field is left empty, the pipeline will ask for it at runtime.
