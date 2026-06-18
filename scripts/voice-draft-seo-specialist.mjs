/**
 * Re-voice the SEO Specialist career-path DRAFT into the operator register
 * (humanizer pass applied) and PATCH only the prose fields.
 *
 * Touches description, body (h2 chapters + tip callouts), and buyerSection.
 * Does NOT touch seniorityMatrix, relatedTerms, seo, aliases, level, status,
 * duration, lastReviewed, role, slug. Does NOT publish — patches the draft only.
 *
 * Verified facts preserved verbatim:
 *   ZipRecruiter avg $67,388 (range $53K–$90K); Salary.com level II ~$97K;
 *   Grainger specialist ~$66K; the $25–50M in-house-revenue threshold stays
 *   hedged as a rule of thumb (SPECULATIVE); "100K / 200K SKUs" stays as
 *   illustrative order-of-magnitude shorthand.
 *
 *   node scripts/voice-draft-seo-specialist.mjs
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
const key = () => `vs${(_k++).toString(36)}`
const p = (text, style = 'normal') => ({
  _type: 'block', _key: key(), style, markDefs: [],
  children: [{ _type: 'span', _key: key(), text, marks: [] }],
})
const test = (body) => ({ _type: 'callout', _key: key(), tone: 'tip', body })

const description =
  'SEO for an industrial distributor is the SEO you know, bent around a catalog no generic SEO has ever touched. The unit of work is the template, not the page — one fix lands across 200,000 SKUs. And the money queries are part numbers your keyword tool swears have zero volume.'

const body = [
  p('You already know SEO. Now you are staring at a 100,000-SKU industrial catalog. You can do title tags, internal links, schema. None of that is the hard part here. The hard part is that there are 200,000 pages, the descriptions were written by Parker and Rockwell instead of you, and the highest-intent queries are part numbers a keyword tool reports as nothing.'),

  p('SEO at catalog scale', 'h2'),
  p('You don’t optimize pages at a distributor. You optimize templates. There are 200,000 SKUs and one product template, so a single change to the title pattern or the schema block hits every one of them at once. Get the template right and the whole catalog moves. Get it wrong and you shipped the same mistake 200,000 times. The classic failure is an SEO who has never seen catalog scale, hand-editing one hydraulic fitting page while 199,999 sit untouched. That isn’t slow. It’s the wrong unit of work.'),
  test('Count your indexable SKUs. Now ask how many edits it takes to fix one title-tag pattern across all of them. If the honest answer is “edit each page,” the template is the problem, not the pages.'),

  p('Part numbers: zero volume, near-100% intent', 'h2'),
  p('A buyer types 1756-L61 replacement, or Gates equivalent of Parker 387 hose. Your keyword tool reports zero volume on both, so a generic SEO ignores them. That buyer is one search from cutting a purchase order. Nobody types a part number to browse. The pattern is densest in automation aftermarket and hydraulics: 1756-L61 replacement, what replaces the discontinued PowerFlex 4, SLC 500 to CompactLogix migration. The OEMs answer these in gated PDFs, the volume metrics say nothing, and the distributor who builds one crawlable page for the exact string wins a sale the analytics never saw coming.'),
  test('Pull your top 20 part-number queries from internal site search. Check each one. Does it land on an indexable, rankable page, or a dead zero-results screen? Every dead end is a purchase order you handed a competitor.'),

  p('Killing manufacturer-fed duplicate content', 'h2'),
  p('Every reseller of a Parker hose or a Rockwell drive runs the same manufacturer blurb. Word for word. So your product page is a thin mirror of a thousand others, and Google has no reason to pick yours. You fix it one of two ways: rewrite copy at template scale, or layer in data only you have — your stock, your lead times, your application notes, your cross-references. Add the SKF-to-NTN interchange to a 6205-2RS1 bearing page and it stops being a mirror. It starts being the better answer.'),
  test('Paste one product description into Google inside quotation marks. If dozens of competitors return the same text verbatim, that page owns nothing of its own. Find what only you can add to it.'),

  p('Faceted navigation and the PIM gate', 'h2'),
  p('Facet pages — by thread size, by pressure rating, by food-grade rating — are some of the best SEO real estate a distributor owns, because they match exactly how a buyer narrows a search. But you can only build the facets your PIM has clean attributes for. No normalized “thread size” attribute, no “by thread size” page, no spec table on it, no schema under it. So the SEO bottleneck usually isn’t SEO. It’s data completeness in the PIM. Your real job is often fighting for attribute coverage before a single facet page can exist.'),
  test('Pick one category and try to build the “by thread size” or “by pressure rating” facet page. If the attributes aren’t normalized in your PIM, you just found the real blocker. It sits upstream of anything you can fix in a template.'),

  p('Cross-reference and interchange pages', 'h2'),
  p('Interchange content is the highest-intent, lowest-competition asset a distributor can own. Equivalents, obsolescence migrations, brand-to-brand swaps. A regional Parker distributor’s Parker-to-Gates interchange chart can out-rank Parker’s own crossref tool — the distributor publishes flat crawlable HTML, and Parker buried theirs in a JavaScript app a crawler never renders. Discount Hydraulic Hose, HFI, and Tompkins already publish exactly this. The data usually lives in your PIM or ERP already. It just isn’t on a page yet.'),
  test('Take one interchange list you already own and publish it as a flat, crawlable HTML table. No PDF, no lookup widget. Then watch whether it starts ranking for “[competitor part] equivalent” within a few weeks. It usually does.'),

  p('Where catalog SEO meets AI search', 'h2'),
  p('The same extractable spec table that ranks in Google gets cited by an answer engine. That’s not two projects. Classic SEO is the foundation the AI-search work sits on top of: clean HTML specs, real Product schema, crawlable cross-references serve Google and the models reading the same page. The reverse holds too. A spec table locked inside a JavaScript widget or a PDF loses both lanes at once. So the catalog SEO you do for rankings is most of the catalog SEO you’d do to get cited. Same data, two surfaces.'),
  test('Open your best spec page with JavaScript disabled. If the specs vanish, neither Google nor an AI crawler can read them. You’re losing both lanes from one broken page.'),
]

const buyerSection = {
  whatTheyDo:
    'Makes your catalog rank for the queries buyers actually type — part numbers, cross-references, spec facets — by working at template scale across the whole SKU base instead of optimizing one page at a time.',
  signsYouNeedOne: [
    'Buyers find competitors’ part-number pages on Google but never yours',
    'Your product pages run on manufacturer copy that’s duplicated across every reseller',
    'You can’t build “by spec” facet pages because PIM attributes aren’t normalized',
    'You own unique interchange or cross-reference data in PIM/ERP and none of it is published or crawlable',
  ],
  inHouseVsAgency: [
    p('A full-time hire starts to make sense from roughly $25–50M in online revenue. Treat that as a rule of thumb, not a hard line. Below it, the work is project-and-retainer shaped: a template, facet, and duplicate-content overhaul up front, then steady maintenance. That shape fits an agency or a fractional seat better than a salaried hire sitting idle between overhauls.'),
    p('The expensive mistake is hiring a generic SEO who has never seen a 100,000-SKU catalog. Catalog SEO is a different job from content-site SEO. If you hire in-house, hire someone who has worked at SKU scale. Otherwise you are paying them to learn it on your catalog, on your clock.'),
  ],
  costReality:
    'ZipRecruiter puts the average industrial e-commerce SEO specialist at $67,388 (range $53K–$90K). Salary.com level II is about $97K. Grainger’s specialist posting sits near $66K. Caterpillar runs a classic SEO Specialist req (r0000328865) alongside a separate GEO req (r0000330321) — the enterprises are splitting the lanes. A Zoro posting ties SEO content to “a substantial portion of annual revenue,” which is the honest framing of what the role is worth at scale. (Sources: ZipRecruiter, Salary.com, Grainger / Zoro postings, Caterpillar reqs r0000328865 + r0000330321.)',
}

await client
  .patch('drafts.career-seo-specialist')
  .set({ description, body, buyerSection })
  .commit()

console.log('PATCHED drafts.career-seo-specialist (description + body + buyerSection)')
console.log('done')
