/**
 * Re-voice the AI Search Specialist career-path DRAFT into the operator register.
 *
 * Reads .env.local the same way as voice-publish-paths.mjs, creates the
 * next-sanity write client (perspective: 'raw' so the draft is visible),
 * and PATCHES only the prose fields (description, body, buyerSection) on
 * drafts.career-ai-search-specialist. It does NOT publish, does NOT
 * createOrReplace the whole doc, and does NOT touch the structured fields
 * (seniorityMatrix, relatedTerms, seo, aliases, level, status, duration,
 * lastReviewed, role).
 *
 * Same chapter structure as the draft: 6 h2 chapters, one tip callout per
 * chapter. Verified facts preserved verbatim (numbers, attributions, hedges).
 *
 *   node scripts/voice-draft-ai-search-specialist.mjs
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
const key = () => `s${(_k++).toString(36)}`
const p = (text, style = 'normal') => ({
  _type: 'block', _key: key(), style, markDefs: [],
  children: [{ _type: 'span', _key: key(), text, marks: [] }],
})
const test = (body) => ({ _type: 'callout', _key: key(), tone: 'tip', body })

const description =
  'One person, two jobs that are really one. At a mid-size distributor you are the whole search function: keep category pages ranking on Google, and get the catalog cited inside ChatGPT, Perplexity, and AI Overviews. Not a GEO-only specialist. Not an SEO who pretends answer engines don’t exist. The hybrid who does both.'

const body = [
  p('At a mid-size distributor, you are the search function. Not a team. You. So “should we do SEO or AI search” is a question that never lands — both are your job and there is one of you. This path is the hybrid version of the work: category pages ranking on Google, and the catalog cited inside ChatGPT, Perplexity, Gemini and AI Overviews, run as one program by one person. The field hasn’t agreed on a title yet (AI SEO Specialist, AI Search Specialist, SEO & AI Search Specialist all name the same role). The job is real. 51% of B2B buyers now start research in an AI chatbot (G2 Buyer Behavior Report, Apr 2025).'),

  p('One hire, one program', 'h2'),
  p('Treat this as one program, not two teams. You don’t have the headcount to split it, and splitting it is the wrong instinct anyway — the technical groundwork is the same data and the same templates either way. A buyer hunting a Char-Lynn 104 seal kit might land on you through a Google result, a ChatGPT answer, or an Amazon Business listing that scraped your specs. Those aren’t separate channels with separate owners. Same product, found in different places, and your job is to be in all of them. The title hasn’t converged. The work has.'),
  test('List every place a buyer could find one of your products: Google, ChatGPT, Perplexity, a marketplace listing. Mark the ones you actually show up in today. The blanks are your roadmap.'),

  p('Don’t skip classic SEO', 'h2'),
  p('There is no AI-search shortcut around SEO fundamentals. Every GEO and AEO posting wants 3–10 years of prior SEO for a reason. Category pages still have to rank. Internal links still have to route authority. A site that crawls badly is invisible to everyone, human or machine. AI search is a layer on top of solid SEO, not a swap for it. The on-ramp is honest about this: there are essentially no entry-level GEO/AEO jobs you get hired into cold, so “entry” means a junior SEO who picked up AI-tool fluency, not a separate discipline you skip ahead to. Put the rankings fire out before you touch the AI work.'),
  test('Pull the Google positions for your top 10 category pages. Slipping? That’s the fire. Put it out before you spend a day on answer-engine visibility.'),

  p('Produce at catalog scale without shipping slop', 'h2'),
  p('AI is genuinely useful at catalog scale: drafting, attribute cleanup, building spec tables out of messy supplier data. The trap is distributor-specific. Most of your product copy came straight from the manufacturer, so the same paragraph sits on your page, the manufacturer’s page, and every competitor who pulled the same feed. That is sitewide duplicate content, and an answer engine has nothing to choose between. Dedup is the deliverable here. Not volume. And clean PIM attributes sit upstream of all of it — if the attributes are a mess, you can’t even build the facet pages, let alone make them different from everyone else’s.'),
  test('Take one supplier description used across 50 SKUs. Count how many of your pages are near-duplicates of it and of each other. That number is the size of your dedup job.'),

  p('Win the part-number long-tail', 'h2'),
  p('This is the most distributor-distinctive lane you have. “Gates equivalent of Parker 387 hose.” “1756-L61 replacement.” “What replaces the discontinued PowerFlex 4?” “Imperial equivalent of Class 10.9.” Near-zero reported search volume, near-100% buyer intent, and answer engines have no good source for them today. Rockwell answers obsolescence questions only inside gated PDFs. Parker buries cross-references in a JavaScript lookup tool. So publish your interchange and cross-reference data as flat, crawlable HTML — not a PDF, not a JS widget. A small hydraulics distributor that does this gets cited exactly where the manufacturer’s own tool can’t be read. That is the whole play.'),
  test('Type three real competitor-part-number queries into ChatGPT — “seal kit for a Char-Lynn 104 motor,” “1756-L61 replacement.” Does anyone get cited? Is it you?'),

  p('Make the catalog readable to engines and crawlers', 'h2'),
  p('You can do everything above and still be invisible. Two blockers do it. First, login-walled pricing and specs: if the data only renders after a sign-in, an engine never sees it. Second, aggressive bot protection that blocks the retrieval crawlers — OAI-SearchBot, PerplexityBot — that fetch pages to ground a cited answer. Block those and you are out of the answers, full stop, however good the page is. Add Product schema with MPN and GTIN, and do it at the template, not the SKU. One fix lands across 100,000+ products. The unit of work is always the template.'),
  test('View-source your best spec page with JavaScript off — can you still read the specs? Then check robots.txt and your WAF for OAI-SearchBot and PerplexityBot. If the specs vanish or the bot is blocked, you are invisible.'),

  p('Report blended visibility, and survive the AI-Overviews dip', 'h2'),
  p('Put Google rankings and traffic next to AI mention and citation share in one report. You can’t proxy AI visibility with rankings — only about 12% of AI-cited URLs rank in Google’s top 10 for the same prompt. A page can be quoted by an engine without ranking, and the reverse. So fix a set of real buyer prompts, run it on a schedule, and track citation share against named competitors. Then there’s the hard conversation: AI Overviews eating clicks. Traffic drops, leadership wants to know what happened, and “AI Overviews” is not an answer anyone can act on. Your job is to separate what is actually lost from what got replaced by a citation, and brief that plainly instead of letting the traffic chart do the talking.'),
  test('Build a 20-prompt set of real buyer questions. Run it monthly. Put citation share next to organic traffic in one report, so leadership sees both numbers instead of just the falling one.'),
]

const buyerSection = {
  whatTheyDo:
    'Runs one program for both goals at once: category and product pages ranking on Google, and the catalog cited inside ChatGPT, Perplexity, Gemini and Google AI Overviews. One person does both, instead of you splitting the work across an SEO and a separate AI-search hire you can’t justify.',
  signsYouNeedOne: [
    'You can fund exactly one search person, not a team, and you need rankings and AI visibility from them both',
    'Buyers tell you they “found a competitor through ChatGPT,” but you also can’t let Google rankings slide',
    'Your catalog is full of manufacturer-supplied descriptions (sitewide duplicate content), and part-number queries have no good answer-engine source',
    'Pricing or specs sit behind a login, or bot protection blocks AI crawlers, so you’re invisible to LLMs no matter how good the content is',
  ],
  inHouseVsAgency: [
    p('If you hire exactly one search person, make it this hybrid — someone who owns classic SEO and AI search together, not a GEO-only specialist who can’t do the rest. The field hasn’t agreed on a title (AI SEO Specialist, AI Search Specialist, SEO & AI Search Specialist all describe it), and 74% of enterprises say they’ll hire an AI-skilled SEO within a year (Semrush, via the Webflow 2026 salary guide). A title existing doesn’t mean you fill it in-house. (Caterpillar posted a role like this in 2025. You are probably not Caterpillar.)'),
    p('Below roughly $50M in revenue — a speculative threshold, not a hard line — a fractional operator or an agency almost always wins. The front-loaded work (schema, dedup, crawler access, cross-reference publishing) doesn’t need a full-time salary, and one generalist hire rarely has both the SEO depth and the AI-search literacy. Above that, an in-house hybrid starts to pay off. The real decision on this page is one hybrid hire versus an agency. Not GEO versus SEO.'),
  ],
  costReality:
    'Mid-level pay sits around $70–117K, AI skills at the top of the band. Hiring the single search person, budget ~$70–110K (2025–26 US postings, per 03-roles.md; Webflow 2026 salary guide / Semrush). Entry is effectively a junior SEO (~$53K) — the “AI” label adds little at that level, and there are essentially no true entry GEO/AEO openings. A fractional or agency engagement covers the front-loaded build for a fraction of fully-loaded headcount.',
}

await client
  .patch('drafts.career-ai-search-specialist')
  .set({ description, body, buyerSection })
  .commit()

console.log('PATCHED drafts.career-ai-search-specialist (prose only: description, body, buyerSection)')
console.log('done')
