/**
 * Glossary indexing policy + cluster metadata. Kept in its own dependency-free
 * module so the glossary hub route, the cluster routes, and app/sitemap.ts can
 * all import it without pulling the Sanity client — sanity/env.ts throws at
 * module load when env vars are missing, and the sitemap must fail soft.
 * This file imports nothing.
 */

/**
 * Below this many published terms the /glossary/ hub stays out of the index AND
 * out of the sitemap — a thin, mostly-empty glossary is a quality-signal cost.
 * Per-term pages are always indexable on their own. Shared by the hub route
 * (its noindex gate) and the sitemap (hub inclusion) so the two never disagree.
 */
export const GLOSSARY_INDEX_THRESHOLD = 15

/**
 * A /glossary/cluster/<slug>/ page is indexable + listed in the sitemap only once
 * the cluster holds this many published terms — the same quality gate as the hub,
 * at cluster scale. Thinner clusters (e.g. Roles) stay accessible and linked but
 * noindex until they fill out.
 */
export const CLUSTER_INDEX_THRESHOLD = 5

export type GlossaryCluster =
  | 'ai-search-core'
  | 'measurement'
  | 'technical'
  | 'industrial-ecommerce'
  | 'roles'

export type GlossaryClusterMeta = {
  value: GlossaryCluster
  label: string
  /** One- to two-sentence section intro (operator voice). Shown on the hub + cluster page. */
  intro: string
  metaTitle: string
  metaDescription: string
}

/**
 * The five glossary clusters, in stable display order. Canonical here (pure data,
 * no deps) and re-exported from sanity/lib/glossary.ts for component imports, so
 * the hub, cluster routes, and sitemap never drift. Intros generated with the
 * humanizer (operator voice) — see docs/strategy/glossary/.
 */
export const GLOSSARY_CLUSTERS: GlossaryClusterMeta[] = [
  {
    value: 'ai-search-core',
    label: 'AI search',
    intro:
      "These terms map how AI search actually answers a buyer's question and whether your catalog gets cited. AI Overviews, AI Mode, and the generative and answer engines pull from your PIM and part data, then either name you or hallucinate attribution to a competitor. GEO, AEO, and citation engineering are how we fix that.",
    metaTitle: 'AI Search Glossary: GEO, AEO & LLM Citation',
    metaDescription:
      'Plain definitions of AI Overviews, AI Mode, GEO, AEO, answer engines, query fan-out, LLM citation, and brand hallucination for industrial distributor catalogs.',
  },
  {
    value: 'measurement',
    label: 'Measurement',
    intro:
      'These terms tell you whether an AI answer engine actually surfaces and cites your catalog, or just paraphrases it. Share of voice, citation rate, impression share, and benchmark prompt sets turn "are we showing up?" into numbers you can track per part family and defend in a budget review.',
    metaTitle: 'AI Search Measurement Glossary: SoV, Citations',
    metaDescription:
      'Plain definitions of AI search measurement terms for industrial distributors: AI share of voice, citation tracking, impression share, mention rate, zero-click search.',
  },
  {
    value: 'technical',
    label: 'Technical & structural',
    intro:
      'These terms cover the plumbing that decides whether an AI engine can read your catalog and cite it correctly: how crawlers reach your pages, how content gets chunked and grounded, how product schema and entities make a part number machine-legible, and how RAG and llms.txt feed it all back. Get the structure wrong and your SKUs never make the answer.',
    metaTitle: 'Technical AI-Search Glossary: Schema, RAG, Crawlers',
    metaDescription:
      'Definitions of the technical groundwork behind AI search for industrial catalogs: AI crawlers, content chunking, RAG, grounding, product schema, entity SEO, and llms.txt.',
  },
  {
    value: 'industrial-ecommerce',
    label: 'Industrial e-commerce',
    intro:
      "A distributor's catalog is only as findable as its data and content. These terms cover what decides whether AI answers cite your SKUs: PIM and ETIM-classified, normalized attributes feeding part-number SEO, cross-reference and spec-sheet content, syndication, and the punchout catalogs that hide everything from a crawler.",
    metaTitle: 'Industrial e-commerce glossary: PIM to part-number SEO',
    metaDescription:
      'Plain definitions of the catalog data and content terms behind AI-findable distributor SKUs: PIM, ETIM, normalized attributes, part-number SEO, syndication, punchout.',
  },
  {
    value: 'roles',
    label: 'Roles',
    intro:
      "Someone has to make your catalog show up when a buyer asks ChatGPT for a Parker hose cross-reference. These terms name that person: the AI search specialist, the citation engineer, the GEO specialist. Mostly the same scope under different labels, and for most distributors it's a service outcome, not a full-time hire.",
    metaTitle: 'AI Search Roles Glossary: Who Does GEO Work',
    metaDescription:
      'Definitions for the people who get industrial catalogs cited in AI answers: AI search specialist, citation engineer, GEO specialist, and how the titles overlap.',
  },
]

/** Lookup a cluster's metadata by value. */
export function getClusterMeta(value: string): GlossaryClusterMeta | undefined {
  return GLOSSARY_CLUSTERS.find((c) => c.value === value)
}
