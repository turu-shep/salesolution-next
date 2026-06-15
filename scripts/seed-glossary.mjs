/**
 * Seed batch-1 glossary terms as Sanity DRAFTS.
 *
 * Creates `drafts.glossary-<slug>` documents via the write token. Nothing is
 * published — every term lands in Studio for the operator to voice-edit and
 * publish (the "agent drafts → operator reviews → publish" workflow, and the
 * brand promise that paths/terms are operator-written, not ghost-generated).
 *
 * Idempotent: re-running overwrites the same draft ids. Safe to run repeatedly.
 *
 *   node scripts/seed-glossary.mjs
 *
 * Term selection + definitions: docs/strategy/career-path/05-glossary.md
 * (batch 1 — led by the measured low-KD winnable terms).
 */
import { readFileSync } from 'node:fs'
import { createClient } from 'next-sanity'

// ── Minimal .env.local loader (standalone scripts don't get Next's env) ──────
try {
  const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  for (const line of env.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
    }
  }
} catch {
  /* fall back to ambient env */
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const token = process.env.SANITY_API_WRITE_TOKEN
if (!projectId || !dataset || !token) {
  console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID / _DATASET / SANITY_API_WRITE_TOKEN')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2026-05-19',
  token,
  useCdn: false,
})

// ── Portable-text helpers ────────────────────────────────────────────────────
let _k = 0
const key = () => `k${(_k++).toString(36)}`
const p = (text, style = 'normal') => ({
  _type: 'block',
  _key: key(),
  style,
  markDefs: [],
  children: [{ _type: 'span', _key: key(), text, marks: [] }],
})
// Weak references: the targets are sibling drafts that don't exist as
// published docs yet, so strict refs would fail integrity checks. Weak refs
// resolve cleanly once each related term is published.
const ref = (slug) => ({
  _type: 'reference',
  _key: key(),
  _ref: `glossary-${slug}`,
  _weak: true,
})

const REVIEWED = '2026-06-14'

// ── Batch 1 ──────────────────────────────────────────────────────────────────
const terms = [
  {
    slug: 'generative-engine-optimization',
    term: 'Generative engine optimization (GEO)',
    cluster: 'ai-search-core',
    opportunity: 'reference-only',
    aliases: ['GEO', 'generative engine optimisation'],
    shortDefinition:
      'Generative engine optimization (GEO) is the practice of structuring a brand’s content and data so AI answer engines — ChatGPT, Perplexity, Google AI Overviews, Gemini — retrieve, summarize, and cite it inside generated answers, instead of optimizing for a ranked list of links.',
    body: [
      p('Why it matters', 'h2'),
      p('Traditional SEO competes for a position on a results page. GEO competes to be the source an AI engine quotes when it writes the answer — a different and increasingly separate outcome, since only a minority of AI-cited URLs also rank in the top 10 for the same query.'),
      p('For an industrial distributor, GEO means the product catalog itself becomes the citable source: extractable spec tables, cross-reference data, and Product schema that an engine can lift when a maintenance engineer asks ChatGPT for a replacement part — even when the distributor never ranked #1 on Google for that query.'),
      p('GEO vs SEO', 'h3'),
      p('SEO targets rankings and clicks; GEO targets being retrieved and cited inside a synthesized answer. They share technical groundwork (crawlability, structured data, entities) but diverge on the goal and on measurement.'),
    ],
    related: ['answer-engine-optimization', 'citation-engineering', 'query-fan-out'],
  },
  {
    slug: 'answer-engine-optimization',
    term: 'Answer engine optimization (AEO)',
    cluster: 'ai-search-core',
    opportunity: 'contest',
    aliases: ['AEO'],
    shortDefinition:
      'Answer engine optimization (AEO) is the practice of formatting content as direct, extractable answers — concise definitions, question-led sections, comparison tables — so answer engines can lift a complete response and attribute it to your site.',
    body: [
      p('Why it matters', 'h2'),
      p('Industrial buying is question-shaped: “what’s the difference between NPT and BSPP threads,” “can I substitute this seal kit.” AEO turns a distributor’s application-engineering knowledge into the concise, self-contained answers those engines prefer to quote — a content moat broadline competitors can’t fake.'),
      p('AEO vs GEO', 'h3'),
      p('AEO is about answer-shaped formatting (the unit is a clean, liftable answer); GEO is the broader discipline of being retrieved and cited across generative engines. In practice the two converge into one AI-search function.'),
    ],
    related: ['generative-engine-optimization', 'answer-engine', 'query-fan-out'],
  },
  {
    slug: 'answer-engine',
    term: 'Answer engine',
    cluster: 'ai-search-core',
    opportunity: 'contest',
    aliases: [],
    shortDefinition:
      'An answer engine is a search interface that returns a single synthesized answer to a query instead of a ranked list of links — such as ChatGPT, Perplexity, or Google’s AI Overviews — usually citing a handful of sources it drew the answer from.',
    body: [
      p('Why it matters', 'h2'),
      p('When a procurement manager asks an answer engine “who supplies food-grade hydraulic fluid in the Midwest,” the engine names a few sources and the rest are invisible. Being one of the cited few is the whole game — there is no page 2 to win later.'),
    ],
    related: ['answer-engine-optimization', 'generative-engine-optimization'],
  },
  {
    slug: 'ai-visibility',
    term: 'AI visibility',
    cluster: 'measurement',
    opportunity: 'contest',
    aliases: ['AI search visibility'],
    shortDefinition:
      'AI visibility is the degree to which a brand appears — as a mention or a cited source — in the answers AI engines generate for the questions its buyers ask. It is the AI-search analogue of search rankings.',
    body: [
      p('Why it matters', 'h2'),
      p('Most industrial distributors are entirely absent from AI answers in their category today, while Grainger, Zoro, or Amazon Business get named by default. Measuring AI visibility is the wake-up call — it shows exactly which buyer questions surface a competitor instead of you.'),
    ],
    related: ['ai-share-of-voice', 'citation-engineering'],
  },
  {
    slug: 'ai-share-of-voice',
    term: 'AI share of voice',
    cluster: 'measurement',
    opportunity: 'own',
    aliases: ['AI SOV'],
    shortDefinition:
      'AI share of voice is the percentage of a defined set of buyer prompts for which an AI engine mentions or cites your brand, measured against competitors — a benchmark of how often you appear in AI answers for your category.',
    body: [
      p('Why it matters', 'h2'),
      p('Pick the 30 prompts your buyers actually ask — spec questions, cross-reference lookups, “best supplier for X” — run them across engines, and count how often each brand appears. The resulting share is a clearer category scoreboard than keyword rankings, because it measures the surface buyers now act on.'),
      p('How to measure it', 'h3'),
      p('Define a stable prompt set, sample each engine repeatedly (answers vary per run), and track your mention and citation counts against named competitors over time.'),
    ],
    related: ['ai-visibility'],
  },
  {
    slug: 'query-fan-out',
    term: 'Query fan-out',
    cluster: 'ai-search-core',
    opportunity: 'contest',
    aliases: [],
    shortDefinition:
      'Query fan-out is the technique AI search systems use to answer one prompt by silently issuing several related sub-queries, gathering passages for each, then synthesizing them — so pages that cleanly answer a specific sub-question get pulled into the final answer.',
    body: [
      p('Why it matters', 'h2'),
      p('A single buyer prompt like “spec a hydraulic power unit for a 3,000 PSI press” fans out into sub-questions about pump sizing, reservoir volume, and fluid type. A distributor page that answers one of those sub-questions cleanly can be cited even if it never targeted the original prompt — which is why narrow, well-structured reference pages outperform broad ones in AI answers.'),
    ],
    related: ['answer-engine-optimization', 'generative-engine-optimization'],
  },
  {
    slug: 'citation-engineering',
    term: 'Citation engineering',
    cluster: 'ai-search-core',
    opportunity: 'own',
    aliases: ['AI citation engineering'],
    shortDefinition:
      'Citation engineering is the practice of deliberately structuring content, entities, and corroborating evidence so AI answer engines cite your domain as a named source. It targets attribution as the outcome — not search rank, and not local-SEO citation building.',
    body: [
      p('Why it matters', 'h2'),
      p('Because an AI engine can cite a page that never ranked, citation is a distinct outcome worth engineering for on its own. The most citable assets are reference materials — glossaries, spec databases, cross-reference tables — the exact data a distributor already owns in its PIM and ERP but rarely publishes in a form an engine can quote.'),
      p('Not to be confused with citation building', 'h3'),
      p('In local SEO, “citations” are NAP (name, address, phone) listings in directories. Citation engineering is unrelated — it is about being quoted as a source inside AI-generated answers.'),
    ],
    related: ['generative-engine-optimization', 'citation-engineer', 'ai-visibility'],
  },
  {
    slug: 'citation-engineer',
    term: 'Citation engineer',
    cluster: 'roles',
    opportunity: 'own',
    aliases: [],
    shortDefinition:
      'A citation engineer is the emerging practitioner role responsible for getting a brand cited in AI answers — structuring extractable content, building entity consistency across trusted sources, and tracking citations. Today the work is bought as a service outcome rather than filled as a job title.',
    body: [
      p('Why it matters', 'h2'),
      p('No company posts “citation engineer” as a job yet, which is precisely why the role is worth defining: the work is real and growing, and the businesses that need it — distributors sitting on citable catalog data — buy it as an outcome from an operator or agency, not as a hire.'),
    ],
    related: ['citation-engineering', 'geo-specialist'],
  },
  {
    slug: 'geo-specialist',
    term: 'GEO specialist',
    cluster: 'roles',
    opportunity: 'own',
    aliases: ['generative engine optimization specialist', 'AI SEO specialist'],
    shortDefinition:
      'A GEO specialist is the practitioner who makes a brand visible inside AI answer engines — implementing structured data, entity and corroboration signals, and prompt-based visibility testing across ChatGPT, Perplexity, Gemini, and AI Overviews.',
    body: [
      p('Why it matters', 'h2'),
      p('The role is real enough that industrial OEMs are hiring it — Caterpillar has posted a Generative Engine Optimization (GEO) Specialist req, run alongside a separate classic SEO role. Most distributors are a tier smaller and will buy the function fractionally rather than hire it full-time.'),
      p('In-house vs agency', 'h3'),
      p('At enterprise scale the role goes in-house; for most distributors the work is front-loaded (schema, entity cleanup, template fixes) then becomes monitoring — which fits an agency or fractional engagement better than a full-time hire.'),
    ],
    related: ['citation-engineer', 'generative-engine-optimization'],
  },
  {
    slug: 'part-number-seo',
    term: 'Part-number SEO',
    cluster: 'industrial-ecommerce',
    opportunity: 'own',
    aliases: ['MPN SEO'],
    shortDefinition:
      'Part-number SEO is the practice of making every SKU discoverable by its manufacturer part number, OEM equivalents, and specifications — in both traditional search and AI answers — so high-intent queries like “replacement for Parker 387 hose” resolve to your catalog.',
    body: [
      p('Why it matters', 'h2'),
      p('Part-number queries show almost no volume in keyword tools yet convert at near-100% intent — someone searching “6Z-3401 seal kit” wants to buy one now. The work is done at template scale (one fix across hundreds of thousands of SKUs) and depends on clean PIM attribute data, which is also what makes the catalog citable by AI engines.'),
    ],
    related: ['generative-engine-optimization', 'part-number-cross-reference'],
  },
  {
    slug: 'ai-search-optimization',
    term: 'AI search optimization',
    cluster: 'ai-search-core',
    opportunity: 'contest',
    aliases: ['AI SEO'],
    shortDefinition:
      'AI search optimization is the umbrella discipline of making a brand discoverable and citable across AI-powered search surfaces — AI Overviews, ChatGPT, Perplexity, Gemini — encompassing both GEO (generative engines) and AEO (answer formatting).',
    body: [
      p('Why it matters', 'h2'),
      p('It is the buyer’s-language term for the whole problem. A distributor’s e-commerce lead won’t ask for “GEO” by name — they ask whether the catalog “shows up in AI search.” Owning the umbrella definition lets the narrower technical terms hang off it.'),
    ],
    related: ['generative-engine-optimization', 'answer-engine-optimization', 'llm-seo'],
  },
  {
    slug: 'llm-seo',
    term: 'LLM SEO',
    cluster: 'ai-search-core',
    opportunity: 'contest',
    aliases: ['LLM optimization'],
    shortDefinition:
      'LLM SEO is the practice of optimizing content so large language models — the systems behind ChatGPT, Gemini, and Copilot — surface and cite a brand in their responses. It overlaps heavily with GEO and AEO and is often used as a catch-all synonym for AI search optimization.',
    body: [
      p('Why it matters', 'h2'),
      p('The terminology hasn’t settled — GEO, AEO, LLM SEO, and AI search optimization describe largely the same work. Defining them in one place, and saying plainly where they overlap, is itself useful reference content for a confused market.'),
    ],
    related: ['ai-search-optimization', 'generative-engine-optimization', 'answer-engine-optimization'],
  },
  {
    slug: 'llm-citation',
    term: 'LLM citation',
    cluster: 'ai-search-core',
    opportunity: 'own',
    aliases: ['AI citation'],
    shortDefinition:
      'An LLM citation is a reference an AI answer engine attaches to a generated response, naming the source it drew a claim from. Earning citations is distinct from ranking — most AI-cited URLs do not rank in the top 10 for the same query.',
    body: [
      p('Why it matters', 'h2'),
      p('Because citation and ranking have come apart, a distributor’s spec page can be quoted by ChatGPT even if it never reached Google’s first page — which is exactly why citation is worth engineering for as its own outcome.'),
    ],
    related: ['citation-engineering', 'ai-visibility', 'generative-engine-optimization'],
  },
  {
    slug: 'ai-overviews',
    term: 'AI Overviews',
    cluster: 'ai-search-core',
    opportunity: 'reference-only',
    aliases: ['AIO', 'Google AI Overviews'],
    shortDefinition:
      'AI Overviews are Google’s AI-generated answer summaries that appear above traditional results for many queries, citing a handful of source links. They are among the most consequential answer-engine surfaces because they sit inside Google itself.',
    body: [
      p('Why it matters', 'h2'),
      p('AI Overviews now trigger on the bulk of AI-search and industrial concept queries, which means the answer — and its cited sources — is the first thing many buyers see. Appearing in that citation set is the new top of the funnel.'),
    ],
    related: ['answer-engine', 'query-fan-out', 'generative-engine-optimization'],
  },
  {
    slug: 'retrieval-augmented-generation',
    term: 'Retrieval-augmented generation (RAG)',
    cluster: 'technical',
    opportunity: 'reference-only',
    aliases: ['RAG'],
    shortDefinition:
      'Retrieval-augmented generation (RAG) is the technique where an AI model fetches relevant external documents at query time and grounds its answer in them, rather than relying only on training data. It is why fresh, crawlable web content can be cited without being in a model’s training set.',
    body: [
      p('Why it matters', 'h2'),
      p('RAG is the reason publishing matters again: a distributor that puts clean spec and cross-reference data on crawlable pages can be retrieved and cited today, without waiting to be absorbed into a future model training run.'),
    ],
    related: ['grounding', 'llm-citation', 'generative-engine-optimization'],
  },
  {
    slug: 'grounding',
    term: 'Grounding',
    cluster: 'technical',
    opportunity: 'reference-only',
    aliases: [],
    shortDefinition:
      'Grounding is connecting an AI model’s generated output to specific retrieved sources, so the answer reflects — and can cite — real documents instead of unverified model memory. It is the mechanism that makes citation engineering possible.',
    body: [
      p('Why it matters', 'h2'),
      p('When an engine grounds an answer in your published spec table, it both quotes you and reduces its risk of stating a wrong figure under your brand. Structured, unambiguous reference data is what makes a page easy to ground against.'),
    ],
    related: ['retrieval-augmented-generation', 'llm-citation', 'citation-engineering'],
  },
  {
    slug: 'llms-txt',
    term: 'llms.txt',
    cluster: 'technical',
    opportunity: 'reference-only',
    aliases: ['llms.txt file'],
    shortDefinition:
      'llms.txt is a proposed plain-text file placed at a site’s root that lists its most important pages in a clean, LLM-friendly form. Adoption by the major AI providers is not confirmed, so treat it as low-cost, low-certainty hygiene rather than a guaranteed ranking factor.',
    body: [
      p('Why it matters', 'h2'),
      p('The honest take is itself the differentiator: most write-ups oversell llms.txt. It costs almost nothing to ship and may help discovery, but no major engine has confirmed it as a signal — so do it, and don’t expect miracles.'),
    ],
    related: ['ai-crawler', 'generative-engine-optimization'],
  },
  {
    slug: 'ai-crawler',
    term: 'AI crawler',
    cluster: 'technical',
    opportunity: 'contest',
    aliases: ['GPTBot', 'ClaudeBot', 'PerplexityBot'],
    shortDefinition:
      'An AI crawler is a bot that fetches web pages to feed AI systems — for training (e.g. GPTBot, ClaudeBot) or live answer retrieval (e.g. OAI-SearchBot, PerplexityBot). If a site’s bot protection blocks them, its content is invisible to those AI engines regardless of quality.',
    body: [
      p('Why it matters', 'h2'),
      p('Many distributor storefronts run aggressive bot protection that blocks AI crawlers sitewide — so the catalog is invisible to ChatGPT and Perplexity no matter how good the data is. Auditing AI-crawler access is the first technical deliverable of any GEO engagement.'),
    ],
    related: ['llms-txt', 'generative-engine-optimization'],
  },
  {
    slug: 'part-number-cross-reference',
    term: 'Part-number cross-reference content',
    cluster: 'industrial-ecommerce',
    opportunity: 'own',
    aliases: ['interchange content', 'cross-reference chart'],
    shortDefinition:
      'Part-number cross-reference content is structured data mapping one manufacturer’s part to its equivalents — OEM and competitor — published as crawlable tables. It is the single most AI-citable asset a distributor owns, because “what crosses to part X” is a native AI prompt with few good published answers.',
    body: [
      p('Why it matters', 'h2'),
      p('A Parker-to-Gates hose interchange table, published as an HTML table rather than a PDF or a JS app, can become the page Perplexity cites for “Gates equivalent of Parker 387 hose” — beating even the manufacturer’s own tool. The data already lives in the distributor’s PIM; it just isn’t published in a citable form.'),
    ],
    related: ['part-number-seo', 'citation-engineering', 'generative-engine-optimization'],
  },
  {
    slug: 'pim',
    term: 'PIM (product information management)',
    cluster: 'industrial-ecommerce',
    opportunity: 'reference-only',
    aliases: ['product information management'],
    shortDefinition:
      'A PIM (product information management system) is the central store for a catalog’s product attributes, descriptions, and specs. In AI search it is decisive: incomplete or inconsistent PIM data becomes missing spec tables, broken facets, and hallucinated AI answers about your products.',
    body: [
      p('Why it matters', 'h2'),
      p('Every AI-search tactic downstream — spec tables, Product schema, facet pages, cross-reference content — is only as good as the PIM feeding it. The honest first step for many distributors is fixing product-data quality before paying for GEO at all.'),
    ],
    related: ['part-number-seo', 'part-number-cross-reference', 'generative-engine-optimization'],
  },
]

// ── Write ────────────────────────────────────────────────────────────────────
const docs = terms.map((t) => ({
  _id: `drafts.glossary-${t.slug}`,
  _type: 'glossaryTerm',
  term: t.term,
  slug: { _type: 'slug', current: t.slug },
  shortDefinition: t.shortDefinition,
  cluster: t.cluster,
  opportunity: t.opportunity,
  ...(t.aliases?.length ? { aliases: t.aliases } : {}),
  body: t.body,
  ...(t.related?.length ? { relatedTerms: t.related.map(ref) } : {}),
  lastReviewed: REVIEWED,
}))

const tx = docs.reduce((t, doc) => t.createOrReplace(doc), client.transaction())

tx.commit()
  .then(() => {
    console.log(`Seeded ${docs.length} glossary drafts:`)
    for (const d of docs) console.log(`  - ${d._id}`)
    console.log('\nReview + publish each in Studio at /studio. Nothing is live until published.')
  })
  .catch((err) => {
    console.error('Seed failed:', err.message)
    process.exit(1)
  })
