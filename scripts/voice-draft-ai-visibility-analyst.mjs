/**
 * Re-voice the AI Visibility Analyst career-path DRAFT into the operator
 * register (humanizer pass applied). Prose only.
 *
 * PATCHES — does not createOrReplace — only the prose fields:
 *   description, body (h2 chapters + tip callouts), buyerSection.
 * Leaves the structured fields untouched: seniorityMatrix, relatedTerms,
 * seo, aliases, level, status, duration, lastReviewed, role, slug, title.
 *
 * Verified facts preserved verbatim:
 *   - tool prices are APPROXIMATE (tildes kept): ~$499/mo Profound,
 *     ~€89/mo Peec, ~$29/mo Otterly
 *   - 51% of B2B buyers start research in AI chatbots (G2, Apr 2025)
 *   - the ~20-prompt panel size is an illustrative operator default (hedged)
 *   - zero standalone in-house postings (verified) — it is a function, not a title
 *
 *   node scripts/voice-draft-ai-visibility-analyst.mjs
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
const key = () => `va${(_k++).toString(36)}`
const p = (text, style = 'normal') => ({
  _type: 'block', _key: key(), style, markDefs: [],
  children: [{ _type: 'span', _key: key(), text, marks: [] }],
})
const test = (body) => ({ _type: 'callout', _key: key(), tone: 'tip', body })

const description =
  'The realistic first job in AI search, except it isn’t a job. It’s a function: you run the prompt panel that tells a distributor what ChatGPT, Perplexity, and Gemini say about its products right now — who gets cited, who gets ignored, where the answer is flat wrong about a pressure rating or a part number. The report it produces is the wake-up call that sells the fix.'

const body = [
  // Lead paragraph (sits before the first h2, as in the source)
  p('Start with the honest part. There are zero standalone in-house postings for this title — we searched, and the result set is empty (verified). That isn’t a gap to apologize for. It’s an open lane. The duties are real and they get paid for. They just sit buried inside GEO and AEO roles, which makes this the cheapest way into the field. So treat it as a function, not a title: you run the prompt panel that shows a distributor what the answer engines say about its products today, who they cite, where it’s invisible, and where the answer is wrong about a pressure rating or a part number. The chapters below walk the work, from running the monitoring to handing the optimizer a fix list.'),

  // Chapter 1
  p('Why this isn’t a job title yet', 'h2'),
  p('The tool category is funded and real. Profound, Peec, Otterly, Scrunch, and Ahrefs Brand Radar all sell into it. The duties show up embedded in other roles — Citizens Bank’s AEO Manager posting even names Brandlight as tooling. So the function exists and gets paid for. The title just hasn’t crystallized. Don’t wait for it to.'),
  p('What you do is narrow and concrete. You watch what the answer engines say about a distributor, on a schedule, against named competitors, and you flag what’s wrong. The artifact is the monitoring report, and the report is the thing that makes a buyer who never thought about AI search suddenly care. 51% of B2B buyers now start research in AI chatbots (G2, Apr 2025). The report shows a distributor exactly where it stands in those answers. Usually that’s nowhere.'),
  test('Search this role title on a job board. Count the standalone listings — there won’t be many. Then open three GEO or AEO postings and find the same duties (prompt monitoring, AI visibility tracking) buried inside a broader role.'),

  // Chapter 2
  p('Build the prompt panel', 'h2'),
  p('The prompt panel is the core deliverable. A fixed set of real buyer questions, run on a schedule so you can see the line move over time. In industrial the questions are already question-shaped and part-number-shaped, so you don’t invent them. You collect what buyers actually type.'),
  p('In hydraulics that’s “Gates equivalent of Parker 387 hose,” “seal kit for a Char-Lynn 104 motor,” “NPT vs JIC vs ORFS,” “best hydraulic hose supplier for ag OEMs.” In automation it’s cross-reference and obsolescence: “1756-L61 replacement,” “what replaces the discontinued PowerFlex 4?,” “SLC 500 to CompactLogix migration.” In broadline MRO, procurement already prompts for supplier discovery — “food-grade vs H1/H2 lubricants” — and you watch whether an independent house ever surfaces where Grainger’s product-listing pages never win. Around 20 prompts is a sane starting default, not a magic number. Pick the questions that matter. Skip the round count.'),
  test('Write 20 prompts your best customer would actually type. Include one cross-reference (a real interchange) and one “best supplier for ___.” Run them once on three engines. That rough cut is your panel’s first draft.'),

  // Chapter 3
  p('Track mentions, citations, and share of voice', 'h2'),
  p('Three things get measured, and they aren’t the same thing. Mention rate is how often you come up at all. Citation share is how often you’re the named source the engine links to. AI share of voice is your slice of the answers against named competitors. A distributor can get mentioned a lot and cited never. That gap is the story.'),
  p('Score it against specific rivals, not the whole market. Pick two named competitors and measure your citation share against them across the panel. Every tool reports a different slice of this: Profound and Peec lean enterprise, Otterly is the cheap entry point, Scrunch and Ahrefs Brand Radar add their own angles. Know what each one actually counts before you quote its number to anyone. They don’t all mean the same thing by “visibility.”'),
  test('Pick two named competitors. Score your citation share against them across your panel. One number, tracked monthly. Watch the trend, not the snapshot.'),

  // Chapter 4
  p('Catch the hallucinations', 'h2'),
  p('This is where industrial monitoring earns its keep. In most categories a wrong AI answer is embarrassing. In hydraulics, automation, and safety gear it costs a customer. A wrong pressure rating. An interchange stated backwards (SKF to NTN bearing, the wrong way round). An ANSI/ISEA cut level off by a tier. A discontinued breaker listed as current. Automation cross-references are prime territory: the real answers live in gated OEM PDFs, so the engine guesses, and the guess sounds confident.'),
  p('Log every wrong or misattributed answer, with the prompt, the engine, and the correct fact beside it. That log does two jobs at once. It’s a safety net for the buyer’s customers, and it’s the raw material for the correction work the GEO team does next. Accuracy governance isn’t a one-off audit. It’s a repair loop you run as long as the engines keep getting it wrong.'),
  test('Take your three highest-stakes spec claims — a pressure rating, an interchange, a compatibility fact. Run each through two engines. Log every answer that’s wrong or credited to the wrong source.'),

  // Chapter 5
  p('Turn the report into the GEO case', 'h2'),
  p('The monitoring report is the wake-up call. It’s also where the analyst function stops reporting and starts diagnosing. A buyer doesn’t need a dashboard. They need to know why a competitor wins the answer and they don’t, and what to do about it. So you take the worst result and explain it in one line. Is the competitor cited because their interchange chart is crawlable HTML while yours is a PDF? Is there an entity gap, the engine unsure what you even sell? Is the retrieval crawler blocked at the WAF?'),
  p('That diagnosis becomes a prioritized fix list the GEO or optimizer work executes. Monitoring doesn’t replace the fix. It justifies it and measures whether it worked. Hand off the list, keep running the panel, and show the buyer the share-of-voice line move. That loop is the whole pitch. Don’t overclaim attribution to make it land.'),
  test('Take your worst result — a prompt where a competitor is cited and you’re absent. Write the one-line diagnosis: PDF vs HTML? Entity gap? Blocked crawler? That sentence is the start of the fix list.'),
]

const buyerSection = {
  whatTheyDo:
    'Tells you what ChatGPT, Perplexity, and Gemini currently say about your products — who they cite, where you’re invisible, and where the answer is wrong about a spec — by running a fixed panel of real buyer prompts on a schedule.',
  signsYouNeedOne: [
    'You have no idea what AI assistants currently say about your brand or your parts',
    'A customer told you an AI tool recommended a competitor — or quoted a wrong spec for your product',
    'You’re about to pay for GEO or AI-search work and have no baseline to measure it against',
    'Your safety-critical data (pressure ratings, compatibility, cross-references) could be misstated by an engine and you’d never know',
  ],
  inHouseVsAgency: [
    p('Don’t hire for this. At distributor scale it’s never a headcount. It’s a tool plus a few hours a month. Think of it as the audit you ask for before you pay anyone for GEO — the cheapest way to find out whether you even have a problem, and the baseline you’ll measure the real work against.'),
    p('If you already run a GEO engagement, the monitoring lives inside it. You don’t bolt on a separate analyst. And to be clear about our own stance: we don’t place people into this role, because it isn’t a job. It’s a function you buy as part of the fix.'),
    p('Where it does work as a way in: the duties sit embedded in GEO and AEO postings — the Citizens Bank AEO posting names Brandlight as a tool — which is the realistic on-ramp for someone breaking into AI search through monitoring.'),
  ],
  costReality:
    'A monitoring program is a visibility tool plus hours, not a salary line. Profound runs ~$499/mo (described as popular with Fortune 100), Peec ~€89/mo, Otterly ~$29/mo, plus Scrunch and Ahrefs Brand Radar. Adobe has launched an AEM brand-visibility product, and Citizens Bank’s AEO Manager posting lists Brandlight as tooling. There’s no standalone salary band because there are no standalone in-house postings (verified). Budget it as tool plus hours per month, and treat the report as the lead-in to a GEO engagement, not a hire.',
}

await client
  .patch('drafts.career-ai-visibility-analyst')
  .set({ description, body, buyerSection })
  .commit()

console.log('PATCHED drafts.career-ai-visibility-analyst (prose only)')
console.log(`h2 chapters: ${body.filter((b) => b.style === 'h2').length}`)
console.log(`tip callouts: ${body.filter((b) => b._type === 'callout' && b.tone === 'tip').length}`)
console.log('done')
