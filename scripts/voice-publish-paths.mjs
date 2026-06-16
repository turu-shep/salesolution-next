/**
 * Revoice the two career-path drafts into the operator register and PUBLISH.
 *
 * Reads each draft, overrides the prose fields (description, body, buyerSection)
 * with voiced copy, keeps the structured fields (seniorityMatrix, relatedTerms,
 * seo, aliases, lastReviewed), sets status=published + publishedAt, then
 * publishes (writes the published doc, deletes the draft) atomically.
 *
 * Verified facts preserved verbatim from the 2026-06-14 verification pass.
 *   node scripts/voice-publish-paths.mjs
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
const key = () => `v${(_k++).toString(36)}`
const p = (text, style = 'normal') => ({
  _type: 'block', _key: key(), style, markDefs: [],
  children: [{ _type: 'span', _key: key(), text, marks: [] }],
})
const test = (body) => ({ _type: 'callout', _key: key(), tone: 'tip', body })

const PUBLISHED_AT = '2026-06-14T12:00:00Z'

const voiced = {
  'geo-specialist': {
    description:
      'For SEOs who already rank on Google and now have to get the catalog cited inside ChatGPT, Perplexity, and AI Overviews. Schema, entities, crawler access, visibility testing — on an industrial catalog, not a blog.',
    body: [
      p('You already know SEO. This is what changes when the goal is being cited inside an answer instead of ranked in a list — on a catalog with a hundred thousand SKUs, not a blog. No tool does this for you yet. It is hand work.'),
      p('What GEO actually is (and isn’t)', 'h2'),
      p('GEO is getting AI engines to retrieve, summarize, and cite you. It is not getting a blue link to rank. The plumbing overlaps with SEO — Google itself shrugs and calls GEO/AEO “still SEO” — but the target is a citation and you measure it differently. It sits on top of solid SEO. It does not replace it.'),
      test('Ask ChatGPT and Perplexity a question your best customer would actually type. Are you mentioned? Cited? Or is it a competitor and a generic blog?'),
      p('Make the catalog extractable', 'h2'),
      p('Engines cite what they can read. The industrial failure mode is specs trapped in PDFs or a JavaScript catalog the crawler never renders. Get specs into HTML tables. Put Product schema with MPN and GTIN on the template, not the SKU. Publish cross-reference data as flat tables. You fix it once at the template and it lands across every SKU.'),
      test('Open your top category page with JavaScript disabled (or “view source”). Can you still read the specs? If not, neither can most AI crawlers.'),
      p('Build the entity graph', 'h2'),
      p('An engine decides who you are from your pages plus the sources it already trusts. Say the same thing everywhere — what you sell, which brands, where — across your site, the manufacturer’s pages, the directories, Wikidata. Thin or contradictory signals are why a real distributor loses the answer to a marketplace.'),
      test('Search your brand on three engines. Do they agree on what you sell and where? Every disagreement is entity work to do.'),
      p('Open the doors to AI crawlers', 'h2'),
      p('Two kinds of bot: training (GPTBot, ClaudeBot) and retrieval (OAI-SearchBot, PerplexityBot). Block the retrieval bots — usually by accident, in your WAF — and you are not in the answer, full stop, however good the page is. Run the crawler-access audit first, not last.'),
      test('Check your robots.txt and WAF rules for OAI-SearchBot and PerplexityBot. Blocked means invisible to those answers.'),
      p('Measure what you can’t rank for', 'h2'),
      p('Rankings don’t help you here — only about 12% of AI-cited URLs sit in Google’s top 10 for the same prompt. So fix a set of real buyer prompts, run them on a schedule, and count mention rate, citation share, and share of voice against named competitors. Brand Radar, Profound, and Otterly do the sampling.'),
      test('Build a 20-prompt set of real buyer questions. Run it monthly. Track your citation share against two named competitors.'),
    ],
    buyerSection: {
      whatTheyDo:
        'Makes your products show up — and get named — when buyers ask an AI assistant instead of Googling. Schema, entity consistency, crawler access, and visibility tracking across ChatGPT, Perplexity, Gemini, and AI Overviews.',
      signsYouNeedOne: [
        'Buyers mention they “found a competitor through ChatGPT”',
        'Your spec data lives in PDFs or a JavaScript catalog AI tools can’t read',
        'You rank on Google but never appear in AI answers',
        'You have no idea what AI engines currently say about your brand',
      ],
      inHouseVsAgency: [
        p('Front-loaded work — schema, entity cleanup, template and crawler fixes — that drops into monthly monitoring once it’s done. For most distributors that’s an agency or a fractional seat, not a full-time hire. (Caterpillar hired the exact role in 2025. You are probably not Caterpillar.)'),
        p('If you hire one search person, hire the hybrid who owns SEO and GEO together — not a GEO specialist who can’t do the rest.'),
      ],
      costReality:
        'Mid-level GEO salary runs roughly $90–137K plus $30–500/mo in tooling (2025–26 US postings). A retainer covers the front-loaded work for a fraction of fully-loaded headcount.',
    },
  },
  'citation-engineer': {
    description:
      'Getting AI engines to name your domain as the source. The citation-focused slice of GEO — not local-SEO “citation building” — built on the reference data a distributor already owns but never publishes.',
    body: [
      p('Citation engineering is one slice of GEO and AEO: the part that is only about getting named as the source in an AI answer. It is not local-SEO “citation building” (directory listings) — same word, different job. This is for GEO and content people who want the citation itself to be the deliverable.'),
      p('Citation is not ranking', 'h2'),
      p('About 12% of the URLs AI assistants cite also rank in Google’s top 10 for that prompt. Read that again: a spec page can be quoted by ChatGPT without ranking anywhere. That gap is the entire opportunity — citation is worth engineering on its own, separate from rank.'),
      test('Find one AI answer in your category. List the cited sources. How many actually rank on Google’s first page? (Usually few.)'),
      p('Build things engines must cite', 'h2'),
      p('The most citable thing you can publish is reference data: interchange and cross-reference tables, spec databases, compatibility charts. You already own it — it is sitting in the PIM and the ERP. You just haven’t published it as flat, crawlable HTML instead of a PDF or a lookup widget. Do that and you become the answer to “what replaces X?”'),
      test('Pick one dataset only you have — an interchange list, a compatibility table. Publish it as a flat HTML table. That is a citation magnet.'),
      p('Structure for extraction', 'h2'),
      p('Engines lift self-contained passages. Write so one paragraph is a complete answer, name the entities (part numbers, standards, brands), and add a clear source line. An answer that only makes sense after three paragraphs of run-up does not survive being pulled out.'),
      test('Take your best spec page. Can one paragraph stand alone as a complete answer? If not, rewrite one until it can.'),
      p('Corroborate across sources', 'h2'),
      p('Engines trust a fact more when it shows up the same way in several places they already weight. Get your key facts stated identically on the manufacturer’s pages, the directories, the reputable third-party sites. That is corroboration — still not directory citations.'),
      test('Search a key product fact on three engines. If they disagree or omit it, that’s a corroboration gap to close.'),
      p('Track and repair attribution', 'h2'),
      p('Watch which URLs get cited for your prompts, and watch for misattribution — the named source is not always the real one, and the error rates are not small. When an engine credits your interchange data to a competitor, or states it wrong, that is a correction job, not a vanity metric.'),
      test('Run your brand’s top claim through ChatGPT and Perplexity. Is it attributed to you, to a competitor, or simply wrong? Log it.'),
    ],
    buyerSection: {
      whatTheyDo:
        'Gets your domain named as the source inside AI answers — by structuring extractable content, publishing reference assets from your own data, and keeping your facts consistent across the web. The citation slice of GEO. Not local-SEO “citation building.”',
      signsYouNeedOne: [
        'AI answers in your category cite generic blogs instead of your catalog',
        'You sit on unique data (interchanges, compatibility, specs) not published in a citable form',
        'Competitors get named by AI assistants and you don’t',
        'You want measurable AI-search results but rankings aren’t moving',
      ],
      inHouseVsAgency: [
        p('Nobody staffs a “citation engineer” as a real job title yet — it is bought as an outcome, usually inside a GEO retainer. The one thing only you can supply is the raw data: the interchange lists, the compatibility tables. Structuring, corroboration, and tracking is the part you buy.'),
        p('Have the data and a way to publish it? An in-house GEO hybrid can run it. If not, buy the outcome.'),
      ],
      costReality:
        'Priced like GEO retainers, not salaries — there is no “citation engineer” pay band because it isn’t a standalone job yet. Anchor on what a GEO / AI-visibility engagement costs.',
    },
  },
}

const tx = client.transaction()
const log = []
for (const [slug, v] of Object.entries(voiced)) {
  const draft = await client.getDocument(`drafts.career-${slug}`)
  if (!draft) { log.push(`SKIP ${slug} (no draft)`); continue }
  const published = {
    ...draft,
    _id: `career-${slug}`,
    description: v.description,
    body: v.body,
    buyerSection: v.buyerSection,
    status: 'published',
    publishedAt: draft.publishedAt ?? PUBLISHED_AT,
  }
  delete published._rev
  delete published._createdAt
  delete published._updatedAt
  tx.createOrReplace(published)
  tx.delete(`drafts.career-${slug}`)
  log.push(`PUBLISH ${slug} (voiced)`)
}
await tx.commit()
console.log(log.join('\n'))
console.log('done')
