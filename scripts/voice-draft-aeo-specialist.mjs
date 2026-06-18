/**
 * Re-voice the AEO Specialist career-path DRAFT into the operator register
 * (humanizer pass applied), and PATCH only the prose fields back to the draft.
 *
 * Patches description, body, buyerSection. Does NOT touch the structured fields
 * (seniorityMatrix, relatedTerms, seo, aliases, level, status, duration,
 * lastReviewed, role, slug, title). Does NOT publish — a later step does that.
 *
 * Protected verified facts kept verbatim:
 *   - Citizens Bank "Answer Engine Optimization Manager" $131–171K + bonus,
 *     7–10+ yrs, charter to build an AEO Center of Excellence.
 *   - Stackmatix AEO guide bands (vendor guide, attributed): ~$75–95K
 *     specialist / $100–174K manager. ZipRecruiter $43–48/hr contract.
 *   - 51% of B2B buyers start research in AI chatbots (G2 Buyer Behavior
 *     Report, Apr 2025).
 *   - Industrial governance examples (pressure ratings, chemical compatibility,
 *     Grade 8 vs Class 10.9, API 600 vs 602, R-410A to R-454B, etc.).
 *
 *   node scripts/voice-draft-aeo-specialist.mjs
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
  'For SEO and content leads moving from rankings to answer-share: being the answer an AI assistant gives when a buyer asks, and making sure that answer is right. In pressure ratings and chemical compatibility, a wrong answer is a liability, not a vanity metric.'

const body = [
  p('You already run SEO. This is what changes when the goal stops being a blue-link ranking and becomes being the answer an assistant gives a buyer who asks a question. In safety-critical categories that answer is also a liability surface. Half the job is winning answer-share. The other half is making sure the machine is right about your products.'),

  p('AEO is owning the answer, not ranking', 'h2'),
  p('A ranking puts you on a list of ten. An answer puts one response in front of the buyer, and it is either yours or a competitor’s. AEO is structuring your catalog and data so that when someone asks ChatGPT, Perplexity, Gemini, or Google AI Overviews, your content is what comes back. It sits inside the GEO/AEO/SEO family: GEO is the broad work of getting cited in generative answers, AEO is the slice aimed at owning the answer to a specific question, and classic SEO is still the groundwork under both. You are aiming to be the one response, not the tenth link.'),
  test('Ask one real buyer question on two engines — say “NPT vs BSPP” on ChatGPT and Perplexity. Are you the answer, a footnote, or absent?'),

  p('Industrial buying is question-shaped', 'h2'),
  p('Industrial buyers don’t browse a catalog when they’re stuck. They ask a question. “Can I substitute brand A’s seal kit for brand B’s.” “What replaces a discontinued PowerFlex 4.” “Gates equivalent of Parker 387 hose.” “Seal kit for a Char-Lynn 104 motor.” Those are answer queries, not catalog browses, and the buyer types them into an assistant before they ever reach your site. 51% of B2B buyers now start research in AI chatbots (G2 Buyer Behavior Report, Apr 2025). One typed question fans out into several sub-queries behind the scenes, so the work is owning a question set, not a single page. Your application desk already knows the set. They answer it on the phone all day.'),
  test('List the ten questions your application desk answers by phone every week. That is your AEO target set. Start there.'),

  p('Make pages answer one question cleanly', 'h2'),
  p('Engines lift self-contained passages. They can’t lift an answer that only makes sense after three paragraphs of setup, and they can’t read spec data trapped in a PDF or a JavaScript lookup widget. The standard is easy to say and hard to hold at scale: one question per passage, a single paragraph that answers the whole thing, FAQ or Q&A schema on the template, specs in HTML tables. The unit of work is the template. Fix the pattern once and it lands across the whole catalog. A regional Parker distributor whose interchange data is a crawlable HTML table can become the answer Perplexity gives — beating Parker’s own JavaScript crossref tool, because the engine can read the distributor’s page and not the OEM’s.'),
  test('Take your best spec page. Can one paragraph stand alone as a complete answer to a buyer’s question? If not, rewrite one until it can.'),

  p('The application-engineering moat', 'h2'),
  p('This is the content an agency can’t fake and a marketplace doesn’t own: the 30-year application engineer’s knowledge. Sizing guides. Failure-mode explainers. Cross-reference and compatibility tables. The “what actually replaces this discontinued part” answers. Aftermarket automation makes the point — “1756-L61 replacement,” “SLC 500 to CompactLogix migration” — pure cross-reference work with no OEM-published answer outside a gated Radwell or Galco PDF. Or MRO: a “food-grade vs H1/H2 lubricants” decision table is the answer ChatGPT gives that a Grainger product-listing page never wins. If you run an application desk, this is already sitting in your PIM and ERP. The job is publishing it in a form an engine can read. Reading lists, not gated PDFs.'),
  test('Pick one question only your SMEs can answer well. Publish the answer as crawlable HTML, then check in a week whether an engine starts using it.'),

  p('Govern the answer', 'h2'),
  p('This is the part of AEO unique to industrial, and the reason the role isn’t a marketing nicety. The answer is a liability surface. Pressure ratings. Chemical compatibility. Fasteners: “Grade 8 vs Class 10.9,” “A2 vs A4.” PVF standards: “API 600 vs 602,” “Class 150 vs 300 at temperature.” PPE: “ANSI cut level for sheet metal,” “NFPA 70E category for 480V.” HVAC/R: “R-410A to R-454B retrofit,” the 2025 A2L transition. When an engine states one of these wrong, or credits your data to a competitor, a buyer can act on it. So governance is the AEO-specific deliverable: monitor the high-stakes claims, catch the wrong and misattributed answers, run corrections as a documented process and not a one-off. The SME signs off. The process catches the drift.'),
  test('Run your three highest-stakes spec claims through ChatGPT and Perplexity. Is each one right, wrong, or credited to a competitor? Log it.'),

  p('Measure answer-share, not rankings', 'h2'),
  p('Rankings don’t help you here, because the question never resolves to a list. So measure answer-share directly. Fix a set of real buyer questions, run them on a schedule, and track answer rate, mention rate, and share of voice across four or five engines against named competitors. The set doesn’t come from a keyword tool. It comes from your application desk’s call log — the questions are already real, already asked, already industrial. Run it every month and the trend tells you whether the structuring and the moat content are working.'),
  test('Build a 20-question set from your application desk’s real call log. Run it monthly, and track your answer-share against two named competitors.'),
]

const buyerSection = {
  whatTheyDo:
    'Makes your catalog the answer when buyers ask AI assistants question-shaped queries, sets the machine-readability standards that let engines lift those answers, and governs that the answer is accurate. In safety-critical categories that last part is compliance work, not a vanity metric.',
  signsYouNeedOne: [
    'Buyers ask AI assistants application questions (“can I substitute this seal kit,” “NPT vs BSPP”) and your catalog isn’t the answer',
    'Your application desk answers the same questions by phone all day, and none of it is published in a form an engine can read',
    'AI assistants state your products’ specs, pressure ratings, or compatibility wrong, and you have no process to catch or correct it',
    'You track rankings and clicks but have no read on answer-share — what engines actually say when buyers ask',
  ],
  inHouseVsAgency: [
    p('Don’t hire a dedicated AEO specialist. The postings don’t believe in it either — they hybridize (GEO/AEO, SEO/AEO), and the one true standalone charter on the board is Citizens Bank’s AEO Manager building a Center of Excellence, a bank-scale role. For a distributor, AEO is a discipline you buy inside a GEO or AI-search engagement, not a seat you fill.'),
    p('What you can’t outsource is the moat: the application engineer’s knowledge and the accuracy call on safety-critical specs. Keep the SME and the sign-off in-house. Buy the structuring, the monitoring, and the answer-share measurement as an outcome. If you hire one search person, make it a hybrid who owns SEO, GEO, and AEO together — not an AEO-only specialist.'),
  ],
  costReality:
    'Hard salary evidence exists, but the title rarely stands alone. Citizens Bank’s Answer Engine Optimization Manager posting runs $131–171K + bonus (7–10+ yrs, charter to build an AEO Center of Excellence). Stackmatix’s AEO guide bands it lower for most orgs: roughly $75–95K specialist, $100–174K manager. ZipRecruiter lists AEO contract work at $43–48/hr. For a distributor, that’s a reason to buy AEO inside a GEO retainer instead of carrying a dedicated salary. You pay for an outcome, and the in-house cost is the SME’s time, not a new headcount.',
}

await client
  .patch('drafts.career-aeo-specialist')
  .set({ description, body, buyerSection })
  .commit()

console.log('PATCHED drafts.career-aeo-specialist (description, body, buyerSection)')
console.log('done')
