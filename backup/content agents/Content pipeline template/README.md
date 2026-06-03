# Content Pipeline Template

Automated blog article pipeline for Claude Cowork. Produces publication-ready HTML articles with SVG infographics, AI-generated photos, structured data, SEO meta tags, internal cross-linking, and automated QA — all configured per brand.

---

## What's in the Template

```
pipeline template/
├── CONFIG.md              ← Fill this out per project (all brand-specific settings)
├── SKILL.md               ← The 7-phase pipeline (reads CONFIG.md automatically)
├── README.md              ← You are here
└── scripts/
    └── verify_article.py  ← Automated QA script (reads CONFIG.md at runtime)
```

---

## Setup (New Project)

### 1. Copy the template

Copy the entire `pipeline template` folder into your new project at:

```
your-project/
└── .agents/
    └── skills/
        └── content-pipeline/
            ├── CONFIG.md
            ├── SKILL.md
            └── scripts/
                └── verify_article.py
```

### 2. Fill out CONFIG.md

Open `CONFIG.md` and fill in every section. The required fields are:

**Brand basics** — name, website URL, logo URL, issue prefix (for folder naming like `PROJ-42_Article_Title`), meta title suffix

**Brand voice** — 1-2 sentence description of how the brand should sound

**Competitors** — list of brand names to automatically scrub from content

**Color palette** — 4 core colors (primary, accent, semantic, background) + supporting neutrals + any old colors to flag

**Design system** — SVG viewBox width, font family, card styling

**Image generation** — base style prompt for AI photos (the `[ARTICLE-SPECIFIC SUBJECT]` placeholder gets swapped per article)

**Platform & integrations** — publishing platform (Shopify/WordPress/etc.), project management tool (Linear/Asana/etc. or leave empty to skip)

**Content rules** — FAQ count, minimum links, minimum images, meta description length

Fields left empty will be asked for at runtime, but it's better to fill everything upfront.

### 3. Create product marketing context

Create `.agents/product-marketing-context.md` in your project root. This should contain your brand's product overview, target audience, personas, competitive positioning, and proof points. You can use the `product-marketing-context` skill in Cowork to generate this interactively.

### 4. Create cross-link map (optional)

If the brand has product collections or category pages to link to from articles, create an `.xlsx` cross-link map with three tabs:

- **Tab 1** — article-to-collection CTA mappings
- **Tab 2** — keyword-to-category URL mappings
- **Tab 3** — content gap priorities (underserved collections)

Set the file path and tab names in CONFIG.md. If you don't have this yet, leave `cross_link_map_file` empty — the pipeline will skip cross-linking but still apply link attribute rules.

### 5. Verify the setup

Open a Cowork session on the project folder and run:

> Set up the content pipeline for [Brand Name]. Read the skill at `.agents/skills/content-pipeline/SKILL.md` and the config at `.agents/skills/content-pipeline/CONFIG.md`. Verify the config is complete — flag anything that's empty or missing. Then run a test of the verification script against an empty test folder to confirm it loads the config correctly. Show me a summary of what's configured.

---

## Usage

### Run a full article

> Run the content pipeline for [PROJ-XX] — [article title]

Or just provide the issue ID if the project management tool has the details:

> Run the content pipeline for [PROJ-XX]

### Redo a specific phase

> Redo phase 3 for [PROJ-XX]

Phase numbers: 1 Content Prep, 2 SEO/Meta, 3 Images, 4 HTML Integration, 5 Cross-Linking, 6 Final QA, 7 File Org & PM Update

### Fill config interactively

If you haven't filled out CONFIG.md yet:

> I'm setting up a new content pipeline for [Brand Name]. Read the config at `.agents/skills/content-pipeline/CONFIG.md` and walk me through filling it out.

---

## What the Pipeline Produces

Each article run creates a self-contained folder:

```
PROJ-42_Article_Title/
├── PROJ-42_Article_Title.html    ← Full article with meta, schema, TOC, FAQ
├── hero-image.webp               ← AI-generated hero photo
├── infographic-1.svg             ← SVG infographic source
├── infographic-1.png             ← PNG render (for QA)
├── infographic-2.svg
├── infographic-2.png
└── lifestyle-image.webp          ← AI-generated lifestyle photo (if applicable)
```

The HTML includes: title/meta/OG/Twitter tags, key takeaways, table of contents with anchor links, optimized H2 headings, inline images, internal cross-links to money pages, FAQ section with H2 questions, FAQPage JSON-LD schema, Article JSON-LD schema, last updated date, and robots directives for AI Overview citation.

---

## Pipeline Phases

| # | Phase | What it does |
|---|-------|-------------|
| 1 | Content Prep | HTML structure, competitor scrub, FAQ section + schema, H2 question evaluation |
| 2 | SEO & Meta | Title, meta description, OG/Twitter tags, TOC, key takeaways, Article schema, last updated date |
| 3 | Images | SVG infographics (3-step QA: review source → render PNG → visual inspect) + AI photos via API |
| 4 | HTML Integration | Wire images into article, verify paths and alt text |
| 5 | Cross-Linking | Internal links to collections per keyword map, link attribute policy |
| 6 | Final QA | Automated verification script (38 checks) + brand voice scan + final visual inspection |
| 7 | File Org & PM | Verify folder structure, update project management issue |

Every phase has a verification gate that must pass before the next phase starts.

---

## Automated Verification

The `verify_article.py` script runs ~38 checks covering:

- File structure and naming conventions
- SVG/PNG pairs and file sizes
- Competitor brand mentions
- Internal link count and per-section density
- Link rel attributes (noopener policy)
- Anchor text quality (no "click here")
- Duplicate anchor conflicts
- Image paths (relative only), alt text, width
- FAQ section, H2 headings, FAQ schema
- Title tag, meta description + length
- Open Graph and Twitter Card tags
- robots max-snippet directive
- Table of Contents presence
- H2 id attributes for anchor links
- Last updated date
- Article/BlogPosting JSON-LD schema
- SVG color palette (flags old/wrong colors)

Run manually:

```bash
python3 .agents/skills/content-pipeline/scripts/verify_article.py PROJ-42_Article_Title/
```

Pass a custom config path:

```bash
python3 scripts/verify_article.py PROJ-42_Article_Title/ --config /path/to/CONFIG.md
```

---

## Requirements

- Claude Cowork session with folder access to the project
- Python 3.10+ (for verify_article.py)
- `cairosvg` pip package (installed automatically by pipeline for SVG→PNG rendering)
- `openai` pip package + `OPENAI_API_KEY` env variable (for AI image generation)
- `pyyaml` pip package (installed automatically for config parsing)
- Product marketing context file (`.agents/product-marketing-context.md`)
- Cross-link map `.xlsx` (optional)
