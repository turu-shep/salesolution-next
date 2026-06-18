/**
 * Seed ONE career path — SEO Specialist (Industrial E-commerce) — as a Sanity DRAFT.
 *
 * Same workflow as the glossary and the two live paths (GEO Specialist, Citation
 * Engineer): agent drafts → operator reviews/voices in Studio → publish. Nothing goes
 * live here. Substance is grounded in docs/strategy/career-path/03-roles.md §4.1 and
 * 04-niches.md (salary bands, niche interchange examples, the speculative $25–50M
 * in-house threshold kept as a hedge).
 *
 *   node scripts/seed-path-seo-specialist.mjs
 *
 * Idempotent (createOrReplace on drafts.career-seo-specialist). DON'T re-run after
 * editing in Studio — it clobbers the edits.
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
// relatedTerms point at PUBLISHED glossary docs (verified to exist), so strong refs are fine.
const term = (slug) => ({ _type: 'reference', _key: key(), _ref: `glossary-${slug}` })

const REVIEWED = '2026-06-16'

const path = {
  slug: 'seo-specialist',
  title: 'SEO Specialist',
  role: 'SEOs at industrial distributors working 100K-SKU catalogs',
  level: 'Mid',
  duration: 'Self-paced',
  description:
    'SEO for an industrial distributor is classic SEO bent around a catalog no generic SEO has ever seen. The unit of work is the template — one fix across 200,000 SKUs — and the money queries are part numbers with zero reported search volume and near-100% buying intent.',
  aliases: ['E-commerce SEO Specialist', 'Industrial SEO Specialist', 'Catalog SEO Specialist'],
  seniorityMatrix: [
    {
      _key: key(), _type: 'levelRow', level: 'Entry',
      focus: 'Execute template-level fixes and learn the catalog. You are a junior SEO or e-commerce analyst who has never worked at catalog scale.',
      mustLearn: [
        'Why the unit of work is the template, not the page — one change propagates across hundreds of thousands of SKUs',
        'Reading a distributor’s URL and facet structure: category → subcategory → attribute facets → SKU pages',
        'Spotting manufacturer-supplied descriptions that create site-wide duplicate content across every reseller',
        'Basic part-number intent — why a string like 1756-L61 is a money query with zero reported volume',
      ],
    },
    {
      _key: key(), _type: 'levelRow', level: 'Mid',
      focus: 'Own catalog SEO end-to-end for a distributor — templates, facets, duplicate content, and part-number coverage.',
      mustLearn: [
        'Template-level title, meta, heading, and schema patterns that scale across 200K SKUs without per-page work',
        'Faceted-navigation strategy: which attribute facets to index, which to noindex or canonical, and why PIM completeness gates it',
        'De-duplicating manufacturer-fed copy — rewriting at template scale or layering distributor-unique data so the catalog isn’t a thin mirror',
        'Part-number SEO: making SKU and cross-reference pages rank for exact part strings competitors leave to forums and gated PDFs',
      ],
    },
    {
      _key: key(), _type: 'levelRow', level: 'Senior',
      focus: 'Set catalog SEO strategy and arbitrate it against PIM, merchandising, and replatform risk.',
      mustLearn: [
        'Tying SEO outcomes to revenue the way the Zoro posting does — SEO content as a substantial portion of annual revenue',
        'Governing facet-page generation against PIM attribute completeness — no normalized attributes means no buildable facet pages',
        'Replatform and migration risk at catalog scale — preserving template equity, redirects, and crawl budget through an ERP or storefront change',
        'Deciding where catalog SEO ends and GEO/AEO begins — the same extractable spec tables that rank also get cited',
      ],
    },
  ],
  body: [
    p('This path is for SEOs who already know the craft and are now staring at a 100K-SKU industrial catalog. It assumes you can do title tags, internal links, and schema. What it teaches is how all of that changes when there are 200,000 pages, the descriptions are written by Parker and Rockwell rather than you, and the highest-intent queries are part numbers a keyword tool reports as nothing. Classic SEO, bent around a catalog no generic SEO has ever seen.'),

    p('What SEO means at catalog scale', 'h2'),
    p('At a distributor you don’t optimize pages. You optimize templates. There are 200,000 SKUs and one product template, so a single change to the title pattern or the schema block lands on every one of them at once. Get the template right and the whole catalog moves. Get it wrong and you’ve shipped the same mistake 200,000 times. The classic failure is hiring an SEO who has never seen catalog scale and watching them open SKUs one at a time, hand-editing a hydraulic fitting page while 199,999 others sit untouched. That isn’t slow. It’s the wrong unit of work.'),
    test('Count your indexable SKUs. Then ask how many edits it would take to fix a title-tag pattern across all of them. If the honest answer is “edit each page,” that’s the problem — and the first thing to fix is the template, not the pages.'),

    p('Part-number queries: zero volume, near-100% intent', 'h2'),
    p('A buyer types 1756-L61 replacement, or Gates equivalent of Parker 387 hose. Your keyword tool reports zero volume on both, so a generic SEO ignores them. But that buyer is one search away from cutting a purchase order — there is no informational intent in a part number. This is the densest in industrial automation aftermarket and hydraulics: 1756-L61 replacement, what replaces the discontinued PowerFlex 4, SLC 500 to CompactLogix migration. The OEMs answer these in gated PDFs, the volume metrics say nothing, and the distributor who builds a crawlable page for the exact string wins a sale the analytics never predicted.'),
    test('Pull your top 20 part-number queries from internal site search. Check each one: does it resolve to an indexable, rankable page, or a dead zero-results screen? Every dead end is a purchase order you handed to a competitor.'),

    p('Killing manufacturer-fed duplicate content', 'h2'),
    p('Every reseller of a Parker hose or a Rockwell drive publishes the same manufacturer blurb. Word for word. So your product page is a thin mirror of a thousand others, and Google has no reason to rank yours over any of them. The fix is either rewriting copy at template scale or layering in data only you have — your stock, your lead times, your application notes, your cross-references. A bearings distributor that adds the SKF-to-NTN interchange to a 6205-2RS1 page stops being a mirror and starts being the better answer.'),
    test('Copy one product description into Google inside quotation marks. If dozens of competitors return the same text verbatim, that page has nothing of its own — and no reason to rank. Find what only you can add to it.'),

    p('Faceted navigation and the PIM gate', 'h2'),
    p('Facet pages — by thread size, by pressure rating, by food-grade rating — are some of the best SEO real estate a distributor owns, because they match exactly how buyers narrow a search. But you can only build the facets your PIM has clean attributes for. No normalized “thread size” attribute means no “by thread size” page, no spec table on it, no schema underneath it. So the SEO bottleneck usually isn’t SEO at all. It’s data completeness in the PIM, and your real job is often arguing for attribute coverage before a single facet page can exist.'),
    test('Pick one category and try to build the “by thread size” or “by pressure rating” facet page. If the attributes aren’t normalized in your PIM, you’ve just found the real blocker — and it’s upstream of anything you can fix in a template.'),

    p('Cross-reference and interchange pages', 'h2'),
    p('Interchange and cross-reference content is the highest-intent, lowest-competition asset a distributor can own. Equivalents, obsolescence migrations, brand-to-brand swaps. A regional Parker distributor’s Parker-to-Gates interchange chart can out-rank Parker’s own crossref tool, because the distributor publishes flat crawlable HTML and Parker buried theirs in a JavaScript app a crawler never renders. Discount Hydraulic Hose, HFI, and Tompkins publish exactly this. The data usually already exists in your PIM or ERP. It just isn’t on a page yet.'),
    test('Take one interchange list you already own and publish it as a flat, crawlable HTML table — no PDF, no lookup widget. Then watch whether it starts ranking for “[competitor part] equivalent” within a few weeks. It usually does.'),

    p('Where catalog SEO meets AI search', 'h2'),
    p('The same extractable spec table that ranks in Google gets cited by an answer engine. That’s not two projects. Classic SEO is the foundation the AI-search work layers onto — clean HTML specs, real Product schema, crawlable cross-references serve both Google and the models reading the same page. The reverse is also true: a spec table locked inside a JavaScript widget or a PDF loses in both lanes at once. So the catalog SEO you do for rankings is most of the catalog SEO you’d do to get cited. Same data, two surfaces.'),
    test('Open your best spec page with JavaScript disabled. If the specs vanish, neither Google nor an AI crawler can read them — and you’re losing both lanes from a single broken page.'),
  ],
  buyerSection: {
    whatTheyDo:
      'An industrial SEO specialist makes your catalog rank for the queries buyers actually type — part numbers, cross-references, and spec facets — by working at template scale across the whole SKU base instead of optimizing one page at a time.',
    signsYouNeedOne: [
      'Buyers find competitors’ part-number pages on Google but never yours',
      'Your product pages run on manufacturer-supplied copy that’s duplicated across every reseller',
      'You can’t build “by spec” facet pages because PIM attributes aren’t normalized',
      'You own unique interchange or cross-reference data in PIM/ERP and none of it is published or crawlable',
    ],
    inHouseVsAgency: [
      p('A full-time in-house hire starts to make sense from roughly $25–50M in online revenue, though treat that threshold as a rule of thumb, not a hard line. Below it, the work is project-and-retainer shaped: a template, facet, and duplicate-content overhaul up front, then steady maintenance. That shape fits an agency or a fractional engagement better than a salaried seat sitting idle between overhauls.'),
      p('The expensive mistake is hiring a generic SEO who has never seen a 100K-SKU catalog. Catalog SEO is a different job from content-site SEO. If you hire in-house, hire someone who has worked at SKU scale — otherwise you’re paying them to learn it on your catalog, on your clock.'),
    ],
    costReality:
      'ZipRecruiter puts the average industrial e-commerce SEO specialist at $67,388 (range $53K–$90K); Salary.com level II is about $97K; Grainger’s specialist posting sits near $66K. Caterpillar runs a classic SEO Specialist req (r0000328865) in parallel with a separate GEO req (r0000330321) — enterprises are splitting the lanes. A Zoro posting ties SEO content to “a substantial portion of annual revenue,” the honest framing of what this role is worth at scale. (Sources: ZipRecruiter, Salary.com, Grainger / Zoro postings, Caterpillar reqs r0000328865 + r0000330321.)',
  },
  relatedTerms: ['part-number-seo', 'part-number-cross-reference', 'pim', 'llm-seo', 'ai-search-optimization'],
  seo: {
    _type: 'seo',
    metaTitle: 'SEO Specialist: the industrial catalog career path',
    metaDescription:
      'How catalog SEO works at an industrial distributor — templates over pages, part-number queries, duplicate manufacturer copy, the PIM gate, and when to hire vs use an agency.',
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

// Verify with the raw perspective (default published perspective HIDES drafts).
const rawClient = client.withConfig({ perspective: 'raw' })
const check = await rawClient.fetch(
  '*[_id == $id][0]{_id, title, "h2Count": count(body[_type == "block" && style == "h2"]), "relatedCount": count(relatedTerms)}',
  { id: 'drafts.career-seo-specialist' },
)
console.log('\nVerify (perspective: raw):')
console.log(JSON.stringify(check, null, 2))
