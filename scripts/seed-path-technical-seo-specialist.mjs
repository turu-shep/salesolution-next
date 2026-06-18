/**
 * Seed the Technical SEO Specialist career path as a Sanity DRAFT.
 *
 * Same workflow as the glossary + the two live paths (GEO Specialist,
 * Citation Engineer): agent drafts -> operator reviews/voices in Studio ->
 * publish. Nothing goes live here. Substance is grounded in
 * docs/strategy/career-path/03-roles.md S4.2 and 04-niches.md (the verified
 * ground truth), restated exactly. The llms.txt hedge (proposed signal, Google
 * declined it) and the training-vs-retrieval-crawler distinction are kept.
 *
 *   node scripts/seed-path-technical-seo-specialist.mjs
 *
 * Idempotent (createOrReplace on the draft id). DON'T re-run after editing in Studio.
 */
import { readFileSync } from 'node:fs'
import { createClient } from 'next-sanity'

const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
for (const line of env.split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2026-05-19',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

let _k = 0
const key = () => `b${(_k++).toString(36)}`
const p = (text, style = 'normal') => ({
  _type: 'block', _key: key(), style, markDefs: [],
  children: [{ _type: 'span', _key: key(), text, marks: [] }],
})
const test = (body) => ({ _type: 'callout', _key: key(), tone: 'tip', body })
// relatedTerms point at PUBLISHED glossary docs (they exist), so strong refs are fine.
const term = (slug) => ({ _type: 'reference', _key: key(), _ref: `glossary-${slug}` })

const REVIEWED = '2026-06-16'

const path = {
  slug: 'technical-seo-specialist',
  title: 'Technical SEO Specialist',
  role: 'technical SEOs / SEO engineers on large distributor catalogs — the enforcement arm of GEO',
  level: 'Mid',
  duration: 'Self-paced',
  description:
    'Technical SEO at catalog scale is plumbing, not content. It decides whether crawlers — Google’s and the AI ones — can reach your SKUs at all. On a distributor site it is the enforcement arm of GEO, because the best spec page on earth is invisible if bot protection blocks ClaudeBot at the edge.',
  aliases: ['Technical SEO Specialist', 'SEO Engineer', 'Technical SEO (E-commerce)'],
  seniorityMatrix: [
    {
      _key: key(), _type: 'levelRow', level: 'Entry',
      focus: 'Run the audits and read the logs. You are an SEO learning where a large catalog actually breaks.',
      mustLearn: [
        'Reading server log files to see who crawled what — Googlebot, Bingbot, and the AI crawlers (GPTBot, PerplexityBot, ClaudeBot)',
        'How faceted navigation multiplies into crawl-trap URLs, plus the basics of robots.txt, canonicals, noindex, and parameter handling',
        'Checking whether AI crawlers are blocked at the edge (WAF / bot-management rules), not just in robots.txt',
        'Bing Webmaster Tools, and why Bing now matters for AI (Bing powers Copilot and ChatGPT browsing)',
      ],
    },
    {
      _key: key(), _type: 'levelRow', level: 'Mid',
      focus: 'Own crawlability and indexation for the whole catalog. This is where the title lives.',
      mustLearn: [
        'Taming faceted-nav explosion at template scale — crawl budget, canonicalization, which facet combinations get to exist as indexable URLs',
        'A standing GPTBot/PerplexityBot/ClaudeBot log-file access audit, confirming the retrieval crawlers can actually reach product and category templates',
        'Punchout / ERP storefront and contract-pricing quirks that hide the catalog from anonymous crawlers',
        'Rendering reality — spec data crawlable as HTML, not trapped in a JS catalog or PDF; XML sitemaps and llms.txt as catalog-scale signals',
      ],
    },
    {
      _key: key(), _type: 'levelRow', level: 'Senior',
      focus: 'Own crawl architecture and de-risk the replatform. Set the technical standard GEO depends on.',
      mustLearn: [
        'Replatform risk management — migrations, redirect maps, and not torching indexation or crawler access for a 100K+ SKU site',
        'Setting the catalog’s technical-SEO standard so GEO/AEO work has a crawlable foundation to build on',
        'Site performance and rendering at scale — Core Web Vitals, edge/CDN behavior, and how bot management interacts with human and crawler traffic',
        'Prioritizing lumpy, project-shaped technical work against finite engineering time',
      ],
    },
  ],
  body: [
    p('This path is for technical SEOs and SEO engineers working on large distributor catalogs. It assumes you already know on-page and crawl basics. What changes here is scale and stakes: the unit of work is the template, not the page, and the new headline deliverable is proving the AI crawlers can reach your catalog at all. On a distributor site, technical SEO is the enforcement arm of GEO.'),

    p('What technical SEO becomes at catalog scale', 'h2'),
    p('A distributor catalog is a technical-SEO worst case. Faceted nav by thread size, pressure rating, brand, and length multiplies into millions of URLs. The unit of work stops being the page and becomes the template — one fix lands across 200K SKUs, and one mistake breaks them the same way. PIM attribute completeness sets the ceiling: no normalized attributes, no facet pages to make crawlable in the first place. So before content, before GEO, before anyone optimizes a single spec page, someone has to make the catalog reachable. That someone is you.'),
    test('Count your indexable URLs against your real SKU count. If indexable URLs dwarf SKUs, faceted nav is generating crawl-trap pages and burning crawl budget on noise.'),

    p('Read the logs: who is actually crawling you', 'h2'),
    p('Server log files are the only place you see truth instead of theory. Pull access logs and separate Googlebot and Bingbot from GPTBot, PerplexityBot, and ClaudeBot. Crawl is lumpy — bots hammer some templates and never touch others. That pattern tells you what is reachable and what is orphaned. A 100K-SKU hydraulics catalog where the crawler only ever hits the homepage and a handful of brand pages has a reachability problem no content plan will fix.'),
    test('Pull a week of access logs and grep for GPTBot, PerplexityBot, and ClaudeBot. If they are absent, either they cannot reach you or they are blocked. Both are your job.'),

    p('The AI-crawler access audit', 'h2'),
    p('This is the deliverable that starts the engagement. robots.txt is not the whole story. The real block usually sits at the edge — a WAF or bot-management rule that challenges or 403s anything that does not look like a human browser. When that happens, the catalog has zero LLM retrievability no matter how good the spec pages are. Draw the distinction carefully: GPTBot and ClaudeBot are largely training crawlers, while OAI-SearchBot and PerplexityBot are the retrieval crawlers that fetch a page to ground a cited answer. Block the retrieval crawlers and you are invisible to that answer engine specifically — which is the version of the claim that holds.'),
    test('Request one product URL twice — once as a normal browser, once with a PerplexityBot or OAI-SearchBot user agent. Compare status codes. A 403 or challenge for the bot means you are invisible to that answer engine.'),

    p('Tame the faceted-nav explosion', 'h2'),
    p('Faceted nav is where crawl budget goes to die. On an MRO catalog, every combination of brand, thread size, and pressure rating can spin up its own URL, and crawlers will happily try to fetch all of them. The job is deciding, at template scale, which facet combinations are allowed to be indexable URLs, which get canonicalized to a parent, and which get blocked outright. Most should be blocked. Parameter handling, canonicals, and a sane internal-linking pattern do the work — not a per-page cleanup you could never finish across 200K SKUs.'),
    test('Take one category. List every facet-combination URL a crawler can reach from it, and decide for each: index, canonical, or block. If you are not blocking most of them, your crawl budget is being spent on pages no one searches for.'),

    p('Make the catalog renderable and reachable', 'h2'),
    p('Engines and crawlers can only read what renders as HTML. The recurring industrial failure is a hydraulics distributor running a brochure site with PDF line cards, or a JS catalog where the specs and part numbers only appear after a script runs. Pull spec data into crawlable HTML so a crawler can read the part number, the cross-reference, and the rating without executing anything. Two more traps hide the catalog from anonymous crawlers: punchout and ERP storefronts, and contract pricing behind a login. If a crawler has to authenticate to see a product, it never sees the product. XML sitemaps help at scale, and llms.txt is worth publishing as a proposed signal — but treat it as not-universally-honored (Google declined to support it), so let it complement crawlable HTML rather than substitute for it.'),
    test('Load your top category page with JavaScript disabled. If the specs and part numbers vanish, they vanish for most crawlers too — and an answer engine cannot cite a number it cannot read.'),

    p('Don’t break it on replatform', 'h2'),
    p('A replatform is the fastest way to undo years of crawlability in a weekend. Redirect maps, indexation continuity, and crawler access all have to survive the migration, and on a 100K+ SKU catalog there is no manual safety net — the redirect logic is itself a template problem. Bing Webmaster Tools earns a seat here too, because Bing powers Copilot and ChatGPT browsing, so its index is now an AI-answer surface and not just a second search engine. Snapshot before, verify after, declare success last.'),
    test('Before any replatform, snapshot your top 1,000 crawled URLs and their crawler access. After launch, re-run the same check — same URLs, same bot user agents — before you declare the migration done.'),
  ],
  buyerSection: {
    whatTheyDo:
      'A technical SEO specialist makes a large distributor catalog crawlable and indexable — taming faceted nav, fixing rendering, and auditing whether AI crawlers (GPTBot, PerplexityBot, ClaudeBot) can even reach your pages. That last part is the precondition for any GEO work paying off.',
    signsYouNeedOne: [
      'You rank fine on some pages but suspect AI engines never see your catalog at all',
      'Your faceted navigation generates far more indexable URLs than you have SKUs',
      'Your spec data lives in a JS catalog or PDFs, or behind punchout and contract pricing that anonymous crawlers can’t reach',
      'You’re about to replatform and don’t want to lose indexation, or crawler access, in the move',
    ],
    inHouseVsAgency: [
      p('Demand for this role is lumpy. The work is project-shaped — an audit, a replatform, a faceted-nav cleanup — punctuated by monitoring, not a steady full-time load. For most distributors that means buying it as a project or retainer, not a headcount line.'),
      p('An in-house hire only makes sense where an SEO team already exists for the specialist to plug into. A lone technical SEO with no content or GEO counterpart is a mishire. If you hire one search person total, make it a hybrid who also owns content and GEO (see the GEO Specialist and SEO Specialist paths), not a technical-SEO-only role.'),
    ],
    costReality:
      'ZipRecruiter puts the technical SEO specialist average at about $81K (roughly $28–57/hr). Because the work is lumpy, a project or retainer usually beats a fully-loaded full-time hire for sub-enterprise distributors. (Source: docs/strategy/career-path/03-roles.md §4.2, citing ZipRecruiter salary pages.)',
  },
  relatedTerms: ['ai-crawler', 'llms-txt', 'generative-engine-optimization', 'ai-visibility', 'part-number-seo'],
  seo: {
    _type: 'seo',
    metaTitle: 'Technical SEO Specialist: the catalog-scale AI-search path',
    metaDescription:
      'Technical SEO for industrial distributor catalogs — taming faceted nav, fixing rendering, and auditing AI-crawler access so GEO has a crawlable foundation. The role by seniority, plus hire-vs-agency.',
  },
}

const doc = {
  _id: `drafts.career-${path.slug}`,
  _type: 'careerPath',
  title: path.title,
  slug: { _type: 'slug', current: path.slug },
  role: path.role,
  level: path.level,
  duration: path.duration,
  description: path.description,
  aliases: path.aliases,
  status: 'drafting',
  seniorityMatrix: path.seniorityMatrix,
  body: path.body,
  buyerSection: path.buyerSection,
  relatedTerms: path.relatedTerms.map(term),
  lastReviewed: REVIEWED,
  seo: path.seo,
}

await client.createOrReplace(doc)
console.log(`Seeded career-path draft: ${doc._id}`)
console.log('Review + voice + publish in Studio (Career paths). Nothing is live until published.')

// VERIFY with a raw-perspective query (default perspective hides drafts).
const raw = client.withConfig({ perspective: 'raw' })
const check = await raw.fetch(
  `*[_id == $id][0]{
    _id, title, status, "slug": slug.current,
    "chapters": count(body[_type=="block" && style=="h2"]),
    "callouts": count(body[_type=="callout"]),
    "relatedCount": count(relatedTerms),
    "matrixRows": count(seniorityMatrix)
  }`,
  { id: doc._id },
)
console.log('\nVERIFY (perspective: raw):')
console.log(JSON.stringify(check, null, 2))
if (!check) {
  console.error('VERIFY FAILED: draft not found')
  process.exit(1)
}
