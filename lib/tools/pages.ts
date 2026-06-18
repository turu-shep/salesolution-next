/**
 * Catalog of standalone tool pages (/tools/<slug>/). Dependency-free (no React,
 * no Sanity) so app/sitemap.ts can import it without pulling the client. The
 * `toolKey` maps to the rendered component in components/tools/registry.ts; the
 * page metadata + glossary cross-links live here.
 *
 * Standalone tool pages are the link-magnet surface of the learning hub: a free,
 * shareable calculator earns referring domains + AI citations on its own, and
 * funnels into the glossary terms that explain the concept.
 */
export type ToolPageRelated = { term: string; slug: string }

export type ToolPage = {
  slug: string
  toolKey: string
  name: string
  intro: string
  metaTitle: string
  metaDescription: string
  related: ToolPageRelated[]
}

export const TOOL_PAGES: ToolPage[] = [
  {
    slug: 'ai-visibility-calculator',
    toolKey: 'ai-visibility-calculator',
    name: 'AI visibility calculator',
    intro:
      'Run one prompt set across the AI engines, count what comes back, and turn it into mention rate, citation rate, and share of voice. Your numbers, computed in the browser — nothing is saved.',
    metaTitle: 'AI Visibility Calculator (free): SoV & citation rate',
    metaDescription:
      'Free AI visibility calculator — enter your prompt-set results to get mention rate, citation rate, and share of voice across ChatGPT, Perplexity, and AI Overviews.',
    related: [
      { term: 'AI share of voice', slug: 'ai-share-of-voice' },
      { term: 'AI citation tracking', slug: 'ai-citation-tracking' },
      { term: 'AI impression share', slug: 'ai-impression-share' },
      { term: 'Mention rate vs citation rate', slug: 'mention-rate-vs-citation-rate' },
    ],
  },
  {
    slug: 'catalog-ai-readiness',
    toolKey: 'catalog-readiness-scorecard',
    name: 'Catalog AI-readiness scorecard',
    intro:
      'Check what is true of your product catalog today. The scorecard weights each item by how much it affects whether AI engines can read and cite your SKUs, and shows the heaviest gaps first.',
    metaTitle: 'Catalog AI-Readiness Scorecard (free)',
    metaDescription:
      'Free scorecard — check whether AI engines can crawl, read, and cite your industrial product catalog. Get a weighted score plus the highest-leverage fixes first.',
    related: [
      { term: 'AI-ready product catalog', slug: 'ai-ready-product-catalog' },
      { term: 'Crawlability for AI bots', slug: 'crawlability-for-ai-bots' },
      { term: 'Part-number cross-reference content', slug: 'part-number-cross-reference' },
      { term: 'Spec-sheet content (datasheet SEO)', slug: 'spec-sheet-content' },
    ],
  },
]

export function getToolPage(slug: string): ToolPage | undefined {
  return TOOL_PAGES.find((t) => t.slug === slug)
}
