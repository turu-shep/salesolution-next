/**
 * Re-voice the Technical SEO Specialist career-path DRAFT into the operator
 * register (humanizer pass applied). PATCHES prose only — description, body,
 * buyerSection. Does NOT publish, does NOT touch the structured fields
 * (seniorityMatrix, relatedTerms, seo, aliases, level, status, duration,
 * lastReviewed).
 *
 * Protected facts preserved verbatim:
 *   - ZipRecruiter avg ~$81K ($28–57/hr)
 *   - llms.txt is a PROPOSED signal, not universally honored (Google declined it)
 *   - training crawlers (GPTBot, ClaudeBot) vs retrieval crawlers
 *     (OAI-SearchBot, PerplexityBot); "blocked = invisible" scoped to RETRIEVAL
 *   - in-house only "where an SEO team already exists" (no invented revenue threshold)
 *
 *   node scripts/voice-draft-technical-seo-specialist.mjs
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
  apiVersion: '2026-05-19', token: process.env.SANITY_API_WRITE_TOKEN, useCdn: false, perspective: 'raw',
})

let _k = 0
const key = () => `t${(_k++).toString(36)}`
const p = (text, style = 'normal') => ({
  _type: 'block', _key: key(), style, markDefs: [],
  children: [{ _type: 'span', _key: key(), text, marks: [] }],
})
const test = (body) => ({ _type: 'callout', _key: key(), tone: 'tip', body })

const description =
  'Technical SEO at catalog scale is plumbing, not content. It decides whether crawlers — Google’s and the AI ones — can reach your SKUs at all. On a distributor site it is the enforcement arm of GEO: the best spec page on earth is invisible if bot protection blocks ClaudeBot at the edge.'

const body = [
  p('This is for technical SEOs working on big distributor catalogs. You already know on-page and crawl basics. What changes here is scale and stakes. The unit of work is the template, not the page. And the new headline deliverable is proving the AI crawlers can reach your catalog at all. On a distributor site, technical SEO is the enforcement arm of GEO.'),

  p('What technical SEO becomes at catalog scale', 'h2'),
  p('A distributor catalog is a worst case. Faceted nav by thread size, pressure rating, brand, and length multiplies into millions of URLs. You stop fixing pages and start fixing templates. One fix lands across 200K SKUs. So does one mistake. PIM attribute completeness sets the ceiling: no normalized attributes, no facet pages worth making crawlable. Before content, before GEO, before anyone touches a spec page, someone has to make the catalog reachable. That someone is you.'),
  test('Count your indexable URLs against your real SKU count. If indexable URLs dwarf SKUs, faceted nav is minting crawl-trap pages and burning crawl budget on noise.'),

  p('Read the logs: who is actually crawling you', 'h2'),
  p('Server logs are the only place you see truth instead of theory. Pull access logs. Separate Googlebot and Bingbot from GPTBot, PerplexityBot, and ClaudeBot. Crawl is lumpy — bots hammer some templates and never touch others. That pattern tells you what is reachable and what is orphaned. A 100K-SKU hydraulics catalog where the crawler only ever hits the homepage and a few brand pages has a reachability problem no content plan will fix.'),
  test('Pull a week of access logs and grep for GPTBot, PerplexityBot, and ClaudeBot. If they are absent, either they cannot reach you or you blocked them. Both are your job.'),

  p('The AI-crawler access audit', 'h2'),
  p('This is the deliverable that opens the engagement. robots.txt is not the whole story. The real block usually sits at the edge: a WAF or bot-management rule that challenges or 403s anything that does not look like a human browser. When that happens, the catalog has zero LLM retrievability, however good the spec pages are. Draw the line carefully. GPTBot and ClaudeBot are mostly training crawlers. OAI-SearchBot and PerplexityBot are the retrieval crawlers that fetch a page to ground a cited answer. Block the retrieval crawlers and you are invisible to that answer engine specifically. That is the version of the claim that holds.'),
  test('Request one product URL twice: once as a normal browser, once with a PerplexityBot or OAI-SearchBot user agent. Compare status codes. A 403 or challenge for the bot means you are invisible to that answer engine.'),

  p('Tame the faceted-nav explosion', 'h2'),
  p('Faceted nav is where crawl budget goes to die. On an MRO catalog, every combination of brand, thread size, and pressure rating can spin up its own URL, and crawlers will happily try to fetch all of them. Your job is to decide, at template scale, which combinations get to be indexable URLs, which canonicalize to a parent, and which get blocked outright. Most should be blocked. Parameter handling, canonicals, and a sane internal-linking pattern do the work. Not a per-page cleanup you could never finish across 200K SKUs.'),
  test('Take one category. List every facet-combination URL a crawler can reach from it. Decide for each: index, canonical, or block. If you are not blocking most of them, your crawl budget is paying for pages no one searches.'),

  p('Make the catalog renderable and reachable', 'h2'),
  p('Crawlers read what renders as HTML. The recurring industrial failure is a hydraulics distributor running a brochure site with PDF line cards, or a JS catalog where the specs and part numbers only show up after a script runs. Pull spec data into crawlable HTML so a crawler can read the part number, the cross-reference, and the rating without executing anything. Two more traps hide the catalog from anonymous crawlers: punchout and ERP storefronts, and contract pricing behind a login. If a crawler has to log in to see a product, it never sees the product. XML sitemaps help at scale. llms.txt is worth publishing, but it is a proposed signal, not universally honored — Google declined to support it — so let it complement crawlable HTML, never substitute for it.'),
  test('Load your top category page with JavaScript disabled. If the specs and part numbers vanish, they vanish for most crawlers too. An answer engine cannot cite a number it cannot read.'),

  p('Don’t break it on replatform', 'h2'),
  p('A replatform is the fastest way to undo years of crawlability in a weekend. Redirect maps, indexation continuity, and crawler access all have to survive the migration. On a 100K+ SKU catalog there is no manual safety net: the redirect logic is itself a template problem. Bing Webmaster Tools earns a seat here, because Bing powers Copilot and ChatGPT browsing, so its index is now an AI-answer surface and not just a second search engine. Snapshot before. Verify after. Declare success last.'),
  test('Before any replatform, snapshot your top 1,000 crawled URLs and their crawler access. After launch, re-run the same check — same URLs, same bot user agents — before you call the migration done.'),
]

const buyerSection = {
  whatTheyDo:
    'A technical SEO specialist makes a large distributor catalog crawlable and indexable: taming faceted nav, fixing rendering, and auditing whether AI crawlers (GPTBot, PerplexityBot, ClaudeBot) can even reach your pages. That last part is the precondition for any GEO work paying off.',
  signsYouNeedOne: [
    'You rank fine on some pages but suspect AI engines never see your catalog at all',
    'Your faceted navigation generates far more indexable URLs than you have SKUs',
    'Your spec data lives in a JS catalog or PDFs, or behind punchout and contract pricing that anonymous crawlers can’t reach',
    'You’re about to replatform and don’t want to lose indexation, or crawler access, in the move',
  ],
  inHouseVsAgency: [
    p('Demand for this role is lumpy. The work is project-shaped — an audit, a replatform, a faceted-nav cleanup — with monitoring in between, not a steady full-time load. For most distributors that means buying it as a project or a retainer, not a headcount line.'),
    p('An in-house hire only makes sense where an SEO team already exists for the specialist to plug into. A lone technical SEO with no content or GEO counterpart is a mishire. If you hire one search person total, make it a hybrid who also owns content and GEO (see the GEO Specialist and SEO Specialist paths), not a technical-SEO-only seat.'),
  ],
  costReality:
    'ZipRecruiter puts the technical SEO specialist average at about $81K (roughly $28–57/hr). Because the work is lumpy, a project or retainer usually beats a fully-loaded full-time hire for sub-enterprise distributors. (Source: docs/strategy/career-path/03-roles.md §4.2, citing ZipRecruiter salary pages.)',
}

await client
  .patch('drafts.career-technical-seo-specialist')
  .set({ description, body, buyerSection })
  .commit()

console.log('PATCHED drafts.career-technical-seo-specialist (prose only)')
console.log('h2 chapters:', body.filter((b) => b.style === 'h2').length)
console.log('tip callouts:', body.filter((b) => b._type === 'callout').length)
console.log('done')
