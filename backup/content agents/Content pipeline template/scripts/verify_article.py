#!/usr/bin/env python3
"""
Content Pipeline — Article Verification Script
Runs automated checks against a completed article folder.
Returns a structured report of PASS/FAIL for each check.

Reads CONFIG.md from the skill folder to get brand-specific settings.
Usage: python verify_article.py <article_folder_path> [--config CONFIG.md]
"""

import sys
import os
import re
import json
import glob
import yaml
from html.parser import HTMLParser


# ---------------------------------------------------------------------------
# Config loader — reads CONFIG.md and extracts YAML blocks
# ---------------------------------------------------------------------------

def load_config(config_path):
    """Parse CONFIG.md and extract all YAML code blocks into a flat dict."""
    if not os.path.exists(config_path):
        print(f"Warning: Config file not found at {config_path}")
        print("Using defaults. Pass --config /path/to/CONFIG.md for brand-specific checks.")
        return {}

    with open(config_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract all ```yaml ... ``` blocks
    yaml_blocks = re.findall(r'```yaml\s*\n(.*?)```', content, re.DOTALL)
    merged = {}
    for block in yaml_blocks:
        try:
            parsed = yaml.safe_load(block)
            if isinstance(parsed, dict):
                merged.update(parsed)
        except yaml.YAMLError:
            continue
    return merged


def get_config_value(config, key, default=None):
    """Get a value from config dict, supporting nested keys with dots."""
    keys = key.split('.')
    val = config
    for k in keys:
        if isinstance(val, dict):
            val = val.get(k, None)
        else:
            return default
    return val if val is not None else default


# ---------------------------------------------------------------------------
# HTML Parser
# ---------------------------------------------------------------------------

class LinkExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.current_link = None
        self.current_text = ""
        self.images = []
        self.headings = []
        self.current_tag = None
        self.faq_section = False
        self.has_faq_schema = False
        self.h2_count = 0
        self.h2_links = {}
        self.current_h2 = -1

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag == 'a':
            self.current_link = attrs_dict
            self.current_text = ""
        if tag == 'img':
            self.images.append(attrs_dict)
        if tag in ('h1', 'h2', 'h3', 'h4'):
            self.current_tag = tag
            self.current_text = ""
            if tag == 'h2':
                self.h2_count += 1
                self.current_h2 = self.h2_count
                self.h2_links[self.current_h2] = []
        if tag == 'script':
            stype = attrs_dict.get('type', '')
            if 'ld+json' in stype:
                self.current_tag = 'schema_script'
                self.current_text = ""

    def handle_endtag(self, tag):
        if tag == 'a' and self.current_link is not None:
            self.links.append({
                'href': self.current_link.get('href', ''),
                'rel': self.current_link.get('rel', ''),
                'target': self.current_link.get('target', ''),
                'text': self.current_text.strip(),
                'h2_section': self.current_h2
            })
            if self.current_h2 >= 0:
                self.h2_links.setdefault(self.current_h2, []).append(self.links[-1])
            self.current_link = None
        if tag in ('h1', 'h2', 'h3', 'h4') and self.current_tag == tag:
            self.headings.append({'level': tag, 'text': self.current_text.strip()})
            self.current_tag = None
        if tag == 'script' and self.current_tag == 'schema_script':
            try:
                data = json.loads(self.current_text)
                if isinstance(data, dict) and data.get('@type') == 'FAQPage':
                    self.has_faq_schema = True
                if isinstance(data, list):
                    for item in data:
                        if isinstance(item, dict) and item.get('@type') == 'FAQPage':
                            self.has_faq_schema = True
            except:
                pass
            self.current_tag = None

    def handle_data(self, data):
        if self.current_link is not None:
            self.current_text += data
        elif self.current_tag:
            self.current_text += data


# ---------------------------------------------------------------------------
# Verification
# ---------------------------------------------------------------------------

def verify_article(folder_path, config):
    results = []

    def check(name, passed, detail=""):
        results.append({"check": name, "passed": passed, "detail": detail})

    # --- Read config values ---
    issue_prefix = get_config_value(config, 'issue_prefix', 'PROJ')
    website_url = get_config_value(config, 'website_url', '')
    competitors = get_config_value(config, 'competitors', [])
    if not isinstance(competitors, list):
        competitors = []

    old_colors = get_config_value(config, 'old_colors_to_flag', [])
    if not isinstance(old_colors, list):
        old_colors = []
    # Expand old colors to include both cases
    old_colors_expanded = []
    for c in old_colors:
        if c:
            old_colors_expanded.append(c)
            old_colors_expanded.append(c.lower())
            old_colors_expanded.append(c.upper())
    old_colors_expanded = list(set(old_colors_expanded))

    min_internal_links = get_config_value(config, 'min_internal_links', 3)
    min_images = get_config_value(config, 'min_images', 3)
    meta_desc_min = get_config_value(config, 'meta_description_length.min', 140)
    meta_desc_max = get_config_value(config, 'meta_description_length.max', 165)

    # --- File Structure Checks ---
    html_files = glob.glob(os.path.join(folder_path, "*.html"))
    svg_files = glob.glob(os.path.join(folder_path, "*.svg"))
    png_files = glob.glob(os.path.join(folder_path, "*.png"))
    webp_files = glob.glob(os.path.join(folder_path, "*.webp"))
    placeholder_files = glob.glob(os.path.join(folder_path, "*.webp.txt"))

    folder_name = os.path.basename(os.path.normpath(folder_path))

    # Check folder naming convention
    prefix_pattern = re.escape(issue_prefix) + r'-\d+_'
    folder_match = re.match(prefix_pattern, folder_name)
    check(f"Folder naming ({issue_prefix}-{{ID}}_{{Title}})", bool(folder_match),
          f"Folder: {folder_name}")

    # Check HTML file exists and naming
    check("HTML article file exists", len(html_files) == 1,
          f"Found {len(html_files)} HTML files: {[os.path.basename(f) for f in html_files]}")

    if html_files:
        html_name = os.path.basename(html_files[0])
        html_match = re.match(prefix_pattern, html_name)
        check(f"HTML file naming ({issue_prefix}-{{ID}}_{{Title}}.html)", bool(html_match),
              f"File: {html_name}")

    # Check for placeholder files (failed image generation)
    check("No placeholder .webp.txt files", len(placeholder_files) == 0,
          f"Found {len(placeholder_files)} placeholders: {[os.path.basename(f) for f in placeholder_files]}")

    # Check SVGs have corresponding PNGs
    for svg in svg_files:
        svg_base = os.path.splitext(os.path.basename(svg))[0]
        matching_png = os.path.join(folder_path, svg_base + ".png")
        check(f"SVG rendered to PNG: {svg_base}",
              os.path.exists(matching_png),
              f"Expected: {svg_base}.png")

    # Check minimum image count
    total_images = len(svg_files) + len(webp_files)
    check(f"Minimum image count ({min_images}+ SVGs/WebPs)", total_images >= min_images,
          f"SVGs: {len(svg_files)}, WebPs: {len(webp_files)}")

    # Check SVG file sizes (too small = probably broken)
    for svg in svg_files:
        size = os.path.getsize(svg)
        check(f"SVG file size > 2KB: {os.path.basename(svg)}",
              size > 2000,
              f"Size: {size} bytes")

    # Check PNG file sizes (too small = rendering failed)
    for png in png_files:
        size = os.path.getsize(png)
        check(f"PNG file size > 5KB: {os.path.basename(png)}",
              size > 5000,
              f"Size: {size} bytes")

    # --- HTML Content Checks ---
    if not html_files:
        check("HTML content analysis", False, "No HTML file found")
        return results

    with open(html_files[0], 'r', encoding='utf-8') as f:
        html_content = f.read()

    parser = LinkExtractor()
    parser.feed(html_content)

    # Check for competitor mentions
    if competitors:
        found_competitors = [c for c in competitors if c.lower() in html_content.lower()]
        check("No competitor brand mentions", len(found_competitors) == 0,
              f"Found: {found_competitors}" if found_competitors else "Clean")

    # --- Link Checks ---
    if website_url:
        internal_links = [l for l in parser.links if website_url in l.get('href', '')]
        external_links = [l for l in parser.links if l.get('href', '').startswith('http')
                          and website_url not in l.get('href', '')]
    else:
        # No website URL configured — treat all http links as external
        internal_links = []
        external_links = [l for l in parser.links if l.get('href', '').startswith('http')]

    check(f"Has internal links ({min_internal_links}+)", len(internal_links) >= min_internal_links,
          f"Found {len(internal_links)} internal links")

    # Internal links: rel="noopener" only, NO noreferrer, NO nofollow
    if internal_links:
        bad_internal = []
        for link in internal_links:
            rel = link.get('rel', '')
            issues = []
            if 'nofollow' in rel:
                issues.append('has nofollow')
            if 'noreferrer' in rel:
                issues.append('has noreferrer')
            if 'noopener' not in rel:
                issues.append('missing noopener')
            if issues:
                bad_internal.append(f"{link['text'][:30]}: {', '.join(issues)}")

        check("Internal links: rel='noopener' only", len(bad_internal) == 0,
              f"Issues: {bad_internal[:5]}" if bad_internal else "All correct")

    # External links: rel="noopener noreferrer", no nofollow (for authoritative)
    if external_links:
        bad_external = []
        for link in external_links:
            rel = link.get('rel', '')
            issues = []
            if 'noopener' not in rel:
                issues.append('missing noopener')
            if 'noreferrer' not in rel:
                issues.append('missing noreferrer')
            if 'nofollow' in rel:
                issues.append('has nofollow (check if authoritative source)')
            if issues:
                bad_external.append(f"{link['href'][:50]}: {', '.join(issues)}")

        check("External links: rel='noopener noreferrer'", len(bad_external) == 0,
              f"Issues: {bad_external[:5]}" if bad_external else "All correct")

    # Check internal link density per H2 section
    if internal_links and website_url:
        sections_without_links = []
        for h2_idx, links in parser.h2_links.items():
            internal_in_section = [l for l in links if website_url in l.get('href', '')]
            if len(internal_in_section) == 0:
                sections_without_links.append(h2_idx)

        check("At least 1 internal link per H2 section",
              len(sections_without_links) == 0,
              f"H2 sections without internal links: {sections_without_links}" if sections_without_links
              else f"All {parser.h2_count} H2 sections have internal links")

    # Check anchor text quality (no "click here" or "here")
    all_links = internal_links + external_links
    bad_anchors = [l for l in all_links
                   if l['text'].strip().lower() in ('click here', 'here', 'this', 'link', 'read more')]
    check("No generic anchor text ('click here', 'here')", len(bad_anchors) == 0,
          f"Bad anchors: {[a['text'] for a in bad_anchors]}" if bad_anchors else "All descriptive")

    # Check same anchor text doesn't point to different URLs
    if internal_links:
        anchor_urls = {}
        duplicate_anchors = []
        for link in internal_links:
            text = link['text'].strip().lower()
            href = link['href'].rstrip('/')
            if text in anchor_urls and anchor_urls[text] != href:
                duplicate_anchors.append(f"'{text}' -> {anchor_urls[text]} AND {href}")
            anchor_urls[text] = href

        check("No duplicate anchor text pointing to different URLs", len(duplicate_anchors) == 0,
              f"Conflicts: {duplicate_anchors[:3]}" if duplicate_anchors else "Clean")

    # --- Image Reference Checks ---
    img_srcs = [img.get('src', '') for img in parser.images]

    # Check all images use relative paths
    absolute_img = [s for s in img_srcs if s.startswith('/') or s.startswith('http') or 'images/' in s]
    check("All image src use same-folder relative paths", len(absolute_img) == 0,
          f"Non-relative: {absolute_img}" if absolute_img else "All relative")

    # Check all referenced images exist in folder
    missing_images = []
    for src in img_srcs:
        if not src.startswith('http') and not src.startswith('data:'):
            full_path = os.path.join(folder_path, src)
            if not os.path.exists(full_path):
                missing_images.append(src)

    check("All referenced images exist in folder", len(missing_images) == 0,
          f"Missing: {missing_images}" if missing_images else "All present")

    # Check all images have alt attributes
    imgs_without_alt = [img.get('src', '?') for img in parser.images
                        if not img.get('alt', '').strip()]
    check("All images have alt text", len(imgs_without_alt) == 0,
          f"Missing alt: {imgs_without_alt}" if imgs_without_alt else "All have alt text")

    # Check images have width="100%"
    imgs_without_width = [img.get('src', '?') for img in parser.images
                          if img.get('width', '') != '100%']
    check("All images have width='100%'", len(imgs_without_width) == 0,
          f"Missing width: {imgs_without_width}" if imgs_without_width else "All have width=100%")

    # --- FAQ Checks ---
    has_faq_heading = any('faq' in h['text'].lower() for h in parser.headings)
    check("Has FAQ section", has_faq_heading,
          "Found FAQ heading" if has_faq_heading else "No FAQ heading found")

    # Check FAQ questions are H2 headings (not H3 or other)
    faq_started = False
    faq_questions_as_h2 = 0
    faq_questions_wrong_level = []
    for h in parser.headings:
        if 'faq' in h['text'].lower() or 'frequently asked' in h['text'].lower():
            faq_started = True
            continue
        if faq_started and h['text'].endswith('?'):
            if h['level'] == 'h2':
                faq_questions_as_h2 += 1
            else:
                faq_questions_wrong_level.append(f"{h['text'][:40]}... is <{h['level']}> not <h2>")

    if has_faq_heading:
        check("FAQ questions use H2 headings", len(faq_questions_wrong_level) == 0 and faq_questions_as_h2 > 0,
              f"Found {faq_questions_as_h2} H2 questions" if faq_questions_as_h2 > 0 and len(faq_questions_wrong_level) == 0
              else f"Wrong levels: {faq_questions_wrong_level[:3]}" if faq_questions_wrong_level
              else "No question headings found after FAQ header")

    check("Has FAQ schema markup (JSON-LD)", parser.has_faq_schema,
          "FAQPage schema found" if parser.has_faq_schema else "No FAQPage JSON-LD schema found")

    # --- Meta & SEO Structure Checks ---
    html_lower = html_content.lower()

    has_title = '<title>' in html_lower and '</title>' in html_lower
    check("Has <title> tag", has_title,
          "Title tag found" if has_title else "No <title> tag found — add <head> section")

    has_meta_desc = 'name="description"' in html_lower or "name='description'" in html_lower
    check("Has meta description", has_meta_desc,
          "Meta description found" if has_meta_desc else "No meta description found")

    # Check meta description length
    if has_meta_desc:
        desc_match = re.search(r'name=["\']description["\'][^>]*content=["\']([^"\']*)["\']', html_content, re.IGNORECASE)
        if not desc_match:
            desc_match = re.search(r'content=["\']([^"\']*)["\'][^>]*name=["\']description["\']', html_content, re.IGNORECASE)
        if desc_match:
            desc_len = len(desc_match.group(1))
            check(f"Meta description length ({meta_desc_min}-{meta_desc_max} chars)",
                  meta_desc_min <= desc_len <= meta_desc_max,
                  f"Length: {desc_len} chars")

    # Open Graph tags
    has_og_title = 'og:title' in html_lower
    has_og_desc = 'og:description' in html_lower
    has_og_image = 'og:image' in html_lower
    has_og_type = 'og:type' in html_lower
    og_tags = [has_og_title, has_og_desc, has_og_image, has_og_type]
    missing_og = []
    if not has_og_title: missing_og.append('og:title')
    if not has_og_desc: missing_og.append('og:description')
    if not has_og_image: missing_og.append('og:image')
    if not has_og_type: missing_og.append('og:type')
    check("Open Graph tags (og:title, og:description, og:image, og:type)", all(og_tags),
          f"Missing: {missing_og}" if missing_og else "All OG tags present")

    # Twitter Card tags
    has_twitter_card = 'twitter:card' in html_lower
    check("Twitter Card meta tag", has_twitter_card,
          "Twitter card found" if has_twitter_card else "No twitter:card meta tag")

    # robots meta with max-snippet
    has_robots_maxsnippet = 'max-snippet' in html_lower
    check("robots meta allows max-snippet (for AI Overviews)", has_robots_maxsnippet,
          "max-snippet found in robots meta" if has_robots_maxsnippet else "No max-snippet in robots meta")

    # Table of Contents
    has_toc = bool(re.search(r'(table.of.contents|in.this.guide)', html_lower))
    check("Has Table of Contents", has_toc,
          "TOC found" if has_toc else "No Table of Contents found")

    # H2 anchor IDs
    h2_with_id = len(re.findall(r'<h2[^>]+id=', html_content, re.IGNORECASE))
    h2_total = len(re.findall(r'<h2', html_content, re.IGNORECASE))
    check("H2 headings have id attributes (for TOC anchors)",
          h2_with_id >= h2_total * 0.5 if h2_total > 0 else False,
          f"{h2_with_id}/{h2_total} H2s have id attributes")

    # Last Updated date
    has_updated = bool(re.search(r'(last updated|updated:?\s*\w+\s*\d{4}|date.modified)', html_lower))
    check("Has 'Last Updated' date visible", has_updated,
          "Updated date found" if has_updated else "No visible 'Last updated' date")

    # Article schema
    has_article_schema = False
    for match in re.finditer(r'<script[^>]*application/ld\+json[^>]*>(.*?)</script>', html_content, re.DOTALL | re.IGNORECASE):
        try:
            data = json.loads(match.group(1))
            if isinstance(data, dict) and data.get('@type') in ('Article', 'BlogPosting'):
                has_article_schema = True
            if isinstance(data, list):
                for item in data:
                    if isinstance(item, dict) and item.get('@type') in ('Article', 'BlogPosting'):
                        has_article_schema = True
        except:
            pass
    check("Has Article/BlogPosting schema (JSON-LD)", has_article_schema,
          "Article schema found" if has_article_schema else "No Article JSON-LD schema found")

    # --- SVG Color Palette Check ---
    if old_colors_expanded:
        svgs_with_old_colors = []
        for svg in svg_files:
            with open(svg, 'r', encoding='utf-8') as f:
                svg_content = f.read()
            found_old = list(set(c for c in old_colors_expanded if c in svg_content))
            if found_old:
                svgs_with_old_colors.append(f"{os.path.basename(svg)}: {found_old}")

        check("SVGs use correct palette (no flagged old colors)", len(svgs_with_old_colors) == 0,
              f"Old colors found: {svgs_with_old_colors}" if svgs_with_old_colors else "All SVGs use correct palette")

    # --- Summary ---
    passed = sum(1 for r in results if r['passed'])
    failed = sum(1 for r in results if not r['passed'])

    return {
        "folder": folder_name,
        "total_checks": len(results),
        "passed": passed,
        "failed": failed,
        "checks": results
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python verify_article.py <article_folder_path> [--config CONFIG.md]")
        sys.exit(1)

    folder = sys.argv[1]
    if not os.path.isdir(folder):
        print(f"Error: {folder} is not a directory")
        sys.exit(1)

    # Find config file
    config_path = None
    if '--config' in sys.argv:
        idx = sys.argv.index('--config')
        if idx + 1 < len(sys.argv):
            config_path = sys.argv[idx + 1]

    # Default: look for CONFIG.md in the same directory as this script
    if not config_path:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        config_path = os.path.join(script_dir, '..', 'CONFIG.md')

    config = load_config(config_path)
    report = verify_article(folder, config)

    print(f"\n{'='*60}")
    print(f"VERIFICATION REPORT: {report['folder']}")
    print(f"{'='*60}")
    print(f"Passed: {report['passed']} / {report['total_checks']}")
    print(f"Failed: {report['failed']} / {report['total_checks']}")
    print(f"{'='*60}\n")

    for chk in report['checks']:
        status = "PASS" if chk['passed'] else "FAIL"
        icon = "  " if chk['passed'] else "  "
        print(f"{icon} [{status}] {chk['check']}")
        if chk.get('detail') and not chk['passed']:
            print(f"         {chk['detail']}")

    if report['failed'] > 0:
        print(f"\n  {report['failed']} check(s) failed. Fix issues and re-run verification.")
        sys.exit(1)
    else:
        print(f"\n  All checks passed!")
        sys.exit(0)
