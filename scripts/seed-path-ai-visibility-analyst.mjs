/**
 * Seed ONE career path (AI Visibility Analyst) as a Sanity DRAFT.
 *
 * Same workflow as the glossary + the two P0 paths: agent drafts → operator
 * reviews/voices in Studio → publish. Nothing goes live here. Content is
 * grounded in docs/strategy/career-path/03-roles.md (§3.5) + 04-niches.md and
 * the inlined, verified brief in
 * prompts/career-paths/_generated/author-ai-visibility-analyst.md.
 *
 *   node scripts/seed-path-ai-visibility-analyst.mjs
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
  slug: 'ai-visibility-analyst',
  title: 'AI Visibility Analyst',
  role: 'analysts and SEOs running AI-visibility monitoring — the realistic first job in AI search',
  level: 'Entry',
  duration: 'Self-paced',
  description:
    'AI Visibility Analyst is a function, not a title: you run the prompt panel that tells a distributor what ChatGPT, Perplexity, and Gemini say about its products today — who gets cited, who gets ignored, and where the answer is flat wrong about a pressure rating or a part number. It is the only entry-accessible job in AI search, and the report it produces is the wake-up call that sells the fix.',
  aliases: ['AI Visibility Analyst', 'AI Search Analyst', 'GEO Analyst'],
  seniorityMatrix: [
    {
      _key: key(), _type: 'levelRow', level: 'Entry',
      focus: 'Run the monitoring. You maintain the prompt panel and report what the engines say.',
      mustLearn: [
        'Building and maintaining a prompt panel — a fixed set of real buyer questions, run on a schedule',
        'Tracking mentions, citations, and share of voice versus named competitors across ChatGPT, Perplexity, and Gemini',
        'Spotting hallucinations about products and specs (wrong pressure rating, wrong cross-reference, discontinued part listed as current) and logging them',
        'Reading the visibility tools — Profound, Peec, Otterly, Scrunch, Ahrefs Brand Radar — and knowing what each actually measures',
      ],
    },
    {
      _key: key(), _type: 'levelRow', level: 'Mid',
      focus: 'Diagnose, not just report. You explain why competitors get cited and hand the optimizer a fix list. (This is what the monitoring function owns as the program matures, not a separate posting.)',
      mustLearn: [
        'Diagnosing why a competitor gets cited and the distributor doesn’t (crawlable HTML vs PDF, entity gaps, corroboration)',
        'Turning the monitoring output into a prioritized fix list the GEO work can execute',
        'Tracking share of voice as a trend, not a snapshot — separating noise from real movement',
        'Designing the prompt panel so it covers the query fan-out a buyer actually triggers (cross-reference, sizing, substitution, “best supplier for X”)',
      ],
    },
    {
      _key: key(), _type: 'levelRow', level: 'Senior',
      focus: 'Own the measurement framework and the accuracy governance. (Again, how the function deepens, not a named promotion.)',
      mustLearn: [
        'Defining the measurement framework — what “AI share of voice” means here and how it’s reported to a buyer who’s never seen it',
        'Governing accuracy of what engines say about safety-critical products (pressure, compatibility, ratings) as an ongoing repair loop, not a one-off audit',
        'Connecting the monitoring deliverable to the GEO engagement it justifies, without overclaiming attribution',
        'Choosing and integrating the tool stack against budget — the whole program is a $29–499/mo tool plus hours, never a headcount',
      ],
    },
  ],
  body: [
    p('This is the realistic first job in AI search, and it isn’t really a job. It’s a function: you run the prompt panel that shows a distributor what ChatGPT, Perplexity, and Gemini say about its products right now. Who they cite, where you’re invisible, and where the answer is wrong about a pressure rating or a part number. The path below walks the work from running the monitoring to handing the optimizer a fix list. No standalone postings exist for this title yet (we checked). The duties do — buried inside GEO and AEO roles — which makes this the cheapest way into the field.'),

    p('What an AI Visibility Analyst actually does (and why it isn’t a job title yet)', 'h2'),
    p('Start with the honest part. There are zero standalone in-house postings for this title — we searched, and the result set is empty. That’s not a gap to apologize for; it’s an open lane. The tool category is funded and real (Profound, Peec, Otterly, Scrunch, Ahrefs Brand Radar all sell into it), and the duties show up embedded in other roles. Citizens Bank’s AEO Manager posting names Brandlight as tooling. So the function exists and gets paid for. The title just hasn’t crystallized.'),
    p('What you do, concretely: you watch what the answer engines say about a distributor, on a schedule, against named competitors, and you flag what’s wrong. The artifact you produce — the monitoring report — is the thing that makes a buyer who has never thought about AI search suddenly care. 51% of B2B buyers now start research in AI chatbots (G2 Buyer Behavior Report, Apr 2025). The report shows a distributor exactly where it stands in those answers, which is usually nowhere.'),
    test('Search this role title on a job board. Note how few standalone listings come back. Then open three GEO or AEO postings and look for the same duties — prompt monitoring, AI visibility tracking — listed inside a broader role.'),

    p('Build the prompt panel', 'h2'),
    p('The prompt panel is the core deliverable. A fixed set of real buyer questions, run on a schedule so you can see movement over time. The trick in industrial is that the questions are already question-shaped and part-number-shaped, which makes them easy to source — you’re not inventing them, you’re collecting what buyers actually type.'),
    p('In hydraulics that looks like “Gates equivalent of Parker 387 hose,” “seal kit for a Char-Lynn 104 motor,” “NPT vs JIC vs ORFS,” “best hydraulic hose supplier for ag OEMs.” In automation it’s cross-reference and obsolescence: “1756-L61 replacement,” “what replaces the discontinued PowerFlex 4?,” “SLC 500 to CompactLogix migration.” In broadline MRO, procurement staff already prompt for supplier discovery — “food-grade vs H1/H2 lubricants” — and you watch whether an independent house ever surfaces where Grainger’s product-listing pages never win. A panel of around 20 prompts is a sane starting default, not a magic number. Pick the questions that matter, not a round count.'),
    test('Write 20 prompts your best customer would actually type — include one cross-reference (a real interchange) and one “best supplier for ___.” Run them once on three engines. That rough cut is your panel’s first draft.'),

    p('Track mentions, citations, and share of voice', 'h2'),
    p('Three things get measured, and they aren’t the same thing. Mention rate is how often you come up at all. Citation share is how often you’re the named source the engine links to. AI share of voice is your slice of the answers against named competitors. A distributor can get mentioned a lot and cited never — that gap is the story.'),
    p('Score it against specific rivals, not the whole market. Pick two named competitors and measure your citation share against them across the panel. The tools each report a different slice of this: Profound and Peec lean toward enterprise tracking, Otterly is the cheap entry point, Scrunch and Ahrefs Brand Radar add their own angles. Know what each one actually counts before you quote its number to anyone, because they don’t all mean the same thing by “visibility.”'),
    test('Pick two named competitors. Score your citation share against them across your panel. One number, tracked monthly. Watch the trend, not the snapshot.'),

    p('Catch the hallucinations', 'h2'),
    p('This is where industrial monitoring earns its keep. In most categories a wrong AI answer is embarrassing. In hydraulics, automation, and safety gear it costs a customer. A wrong pressure rating, an interchange stated backwards (SKF to NTN bearing, the wrong way round), an ANSI/ISEA cut level off by a tier, a discontinued breaker listed as current. Automation cross-references are prime territory — the real answers live in gated OEM PDFs, so the engine guesses, and the guess sounds confident.'),
    p('Your job is to log every wrong or misattributed answer, with the prompt, the engine, and the correct fact beside it. That log is two things at once: a safety net for the buyer’s customers, and the raw material for the correction work the GEO team does next. Accuracy governance isn’t a one-off audit. It’s a repair loop you run as long as the engines keep getting it wrong.'),
    test('Take your three highest-stakes spec claims — a pressure rating, an interchange, a compatibility fact. Run each through two engines. Log every answer that’s wrong or credited to the wrong source.'),

    p('Turn the report into the GEO case', 'h2'),
    p('The monitoring report is the wake-up call. It’s also where the analyst function stops reporting and starts diagnosing. A buyer doesn’t need a dashboard; they need to know why a competitor wins the answer and they don’t — and what to do about it. So you take the worst result and explain it in one line. Is the competitor cited because their interchange chart is crawlable HTML while yours is a PDF? Is there an entity gap, the engine not certain what you even sell? Is the retrieval crawler blocked at the WAF?'),
    p('That diagnosis becomes a prioritized fix list the GEO or optimizer work executes. The monitoring doesn’t replace the fix; it justifies it and measures whether it worked. Hand off the list, keep running the panel, and show the buyer the share-of-voice line move. That loop is the whole pitch — and you don’t overclaim attribution to make it land.'),
    test('Take your worst result — a prompt where a competitor is cited and you’re absent. Write the one-line diagnosis of why: PDF vs HTML? Entity gap? Blocked crawler? That sentence is the start of the fix list.'),
  ],
  buyerSection: {
    whatTheyDo:
      'An AI visibility analyst tells you what ChatGPT, Perplexity, and Gemini currently say about your products — who they cite, where you’re invisible, and where the answer is wrong about a spec — by running a fixed panel of real buyer prompts on a schedule.',
    signsYouNeedOne: [
      'You have no idea what AI assistants currently say about your brand or your parts',
      'A customer told you an AI tool recommended a competitor — or quoted a wrong spec for your product',
      'You’re about to pay for GEO or AI-search work and have no baseline to measure it against',
      'Your safety-critical data (pressure ratings, compatibility, cross-references) could be misstated by an engine and you’d never know',
    ],
    inHouseVsAgency: [
      p('Don’t hire for this. At distributor scale it’s never a headcount — it’s a tool ($29–499/mo) plus a few hours a month. Think of it as the audit you should ask for before you pay anyone for GEO. It’s the cheapest way to find out whether you even have a problem, and it sets the baseline you’ll measure the real work against.'),
      p('If you already run a GEO engagement, the monitoring lives inside it. You don’t bolt on a separate analyst. And to be clear about our own stance: we don’t place people into this role, because the role isn’t a job — it’s a function you buy as part of the fix.'),
      p('Where it does work as a way in: the duties sit embedded in GEO and AEO postings (the Citizens Bank AEO posting names Brandlight as a tool), which is the realistic on-ramp for someone trying to break into AI search through monitoring.'),
    ],
    costReality:
      'A monitoring program is a visibility tool plus hours, not a salary line. Profound runs ~$499/mo (described as popular with Fortune 100), Peec ~€89/mo, Otterly ~$29/mo, plus Scrunch and Ahrefs Brand Radar; Adobe has launched an AEM brand-visibility product, and Citizens Bank’s AEO Manager posting lists Brandlight as tooling. There is no standalone salary band because there are no standalone in-house postings (verified). Budget it as tool plus hours per month, and treat the report as the lead-in to a GEO engagement, not a hire.',
  },
  relatedTerms: ['ai-visibility', 'ai-share-of-voice', 'llm-citation', 'query-fan-out', 'generative-engine-optimization'],
  seo: {
    _type: 'seo',
    metaTitle: 'AI Visibility Analyst: the entry-level AI-search role',
    metaDescription:
      'AI Visibility Analyst is a function, not a job title — running the prompt panel that tracks what ChatGPT, Perplexity, and Gemini say about an industrial distributor. The work by level, plus the honest buyer’s guide to tool-plus-hours vs a hire.',
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

client
  .createOrReplace(doc)
  .then(async () => {
    console.log(`Seeded career-path draft: ${doc._id}`)
    console.log('\nReview + voice + publish in Studio (Career paths). Nothing is live until published.')

    // Verify the draft exists, using the raw perspective (published hides drafts).
    const rawClient = client.withConfig({ perspective: 'raw' })
    const verify = await rawClient.fetch(
      `*[_id == $id][0]{ _id, title, "h2Count": count(body[_type == "block" && style == "h2"]) }`,
      { id: 'drafts.career-ai-visibility-analyst' },
    )
    console.log('\nVerify (perspective: raw):')
    console.log(`  _id:      ${verify?._id ?? '(not found)'}`)
    console.log(`  title:    ${verify?.title ?? '(none)'}`)
    console.log(`  h2 chapters: ${verify?.h2Count ?? 0}`)
  })
  .catch((err) => {
    console.error('Seed failed:', err.message)
    process.exit(1)
  })
