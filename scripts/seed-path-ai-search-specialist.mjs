/**
 * Seed ONE career path — AI Search Specialist — as a Sanity DRAFT.
 *
 * Same workflow as the existing paths: agent drafts → operator reviews/voices in
 * Studio → publish. Nothing goes live here. Substance is grounded in
 * docs/strategy/career-path/03-roles.md (§3.3 — the "bridge title") and 04-niches.md,
 * with the verified vs flagged facts from the author brief respected exactly.
 *
 *   node scripts/seed-path-ai-search-specialist.mjs
 *
 * Idempotent (createOrReplace on drafts.career-ai-search-specialist).
 * DON'T re-run after editing in Studio — it clobbers the edits.
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
  slug: 'ai-search-specialist',
  title: 'AI Search Specialist',
  role: 'the single search hire at a mid-size distributor — one program for rankings AND AI visibility',
  level: 'Mid',
  duration: 'Self-paced',
  description:
    'One program for rankings and AI visibility, run by the single search hire a mid-size distributor actually makes. Not a GEO-only specialist, and not a classic SEO who ignores answer engines: the hybrid who keeps category pages ranking on Google and gets the catalog cited inside ChatGPT, Perplexity, and AI Overviews.',
  aliases: ['AI SEO Specialist', 'AI Search Specialist', 'SEO & AI Search Specialist', 'AI SEO Manager'],
  seniorityMatrix: [
    {
      _key: key(), _type: 'levelRow', level: 'Entry',
      focus: 'A junior SEO who has added AI-tool fluency. You own classic on-page work and content production, and you are learning where answer engines change the job. (Around $53K. The "AI" label adds little to entry pay.)',
      mustLearn: [
        'Classic SEO fundamentals first — on-page, internal linking, technical hygiene. There is no AI-search shortcut around them.',
        'AI-tool fluency for production at scale (drafting, dedup, attribute cleanup) without shipping slop',
        'How ChatGPT, Perplexity, Gemini and Google AI Overviews retrieve and cite sources, versus how Google ranks a list',
        'Running a prompt audit: what engines currently say about your brand and products versus competitors',
      ],
    },
    {
      _key: key(), _type: 'levelRow', level: 'Mid',
      focus: 'Owns one program for rankings and AI visibility. This is where the title lives: 2–5 years, around $70–117K, with AI skills at the top of the band.',
      mustLearn: [
        'Running rankings and AI visibility as a single roadmap, not two competing workstreams',
        'AI-assisted production at catalog scale, plus deduping manufacturer-supplied descriptions so it is not sitewide duplicate content',
        'Blended visibility reporting — Google rankings and traffic alongside AI mention and citation share, in one view',
        'The part-number long-tail: near-zero reported volume, near-100% buyer intent, and the place answer engines have no good source yet',
      ],
    },
    {
      _key: key(), _type: 'levelRow', level: 'Senior',
      focus: 'Becomes Head of Search, owning SEO, GEO and AEO across the org. $120–150K and up.',
      mustLearn: [
        'Owning SEO, GEO and AEO as one function and resourcing the split between them',
        'Guiding stakeholders through AI-Overviews traffic loss: what is actually lost, what is replaced by citations, and what to do about it',
        'The measurement framework: when to trust rankings, when to trust citation/mention share, and how to report blended visibility to leadership',
        'Where the catalog (PIM/ERP data) is the real lever, and prioritizing data fixes over content volume',
      ],
    },
  ],
  body: [
    p('At a mid-size distributor, you are the search function. Not a team — you. So the question "should we do SEO or AI search" never really lands, because both are your job and there is one of you. This path is the hybrid version of the work: keeping category pages ranking on Google and getting the catalog cited inside ChatGPT, Perplexity, Gemini and AI Overviews, run as one program by one person. The field has not agreed on a title for it (AI SEO Specialist, AI Search Specialist, and SEO & AI Search Specialist all describe the same role), but the job is real. 51% of B2B buyers now start research in an AI chatbot (G2 Buyer Behavior Report, Apr 2025).'),

    p('The one-hire reality: rankings and AI visibility are one job', 'h2'),
    p('Treat this as one program, not two teams. You do not have the headcount to split it, and splitting it is the wrong instinct anyway — the technical groundwork for both is mostly the same data and the same templates. A buyer looking for a Char-Lynn 104 seal kit might land on you through a Google result, through a ChatGPT answer, or through an Amazon Business listing that scraped your specs. Those are not separate channels with separate owners. They are one product, found in different places, and your job is to be present in all of them. The honest part: the title has not converged, but the work has.'),
    test('List every place a buyer could find one of your products — Google, ChatGPT, Perplexity, a marketplace listing. Mark which ones you are actually present in today. The blanks are your roadmap.'),

    p('Do not skip classic SEO', 'h2'),
    p('There is no AI-search shortcut around SEO fundamentals. Every GEO and AEO posting wants 3–10 years of prior SEO for a reason: category pages still have to rank, internal links still have to route authority, and a site that crawls badly is invisible to everyone. AI search is a layer on solid SEO, not a replacement for it. The on-ramp is honest about this. There are essentially no entry-level GEO/AEO jobs you can be hired into cold, so "entry" here means a junior SEO who has added AI-tool fluency, not a separate discipline you skip ahead to. Get the rankings fire out before you touch the AI work.'),
    test('Pull the Google positions for your top 10 category pages. If they are slipping, that is the fire. Put it out before you spend a day on answer-engine visibility.'),

    p('Run AI-assisted production without shipping slop', 'h2'),
    p('AI is genuinely useful for catalog-scale production: drafting, attribute cleanup, generating spec tables from messy supplier data. The trap is distributor-specific. Most of your product descriptions came straight from the manufacturer, which means the same paragraph sits on your page, the manufacturer\'s page, and every competitor who pulled the same feed. That is sitewide duplicate content, and answer engines have nothing to choose between. Dedup is the actual deliverable here, not volume. PIM attribute completeness is upstream of all of it. If the attributes are not clean, you cannot even build the facet pages, let alone differentiate them.'),
    test('Take one supplier description used across 50 SKUs. Check how many of your pages are near-duplicates of it, and of each other. That count is the size of your dedup job.'),

    p('Win the part-number long-tail', 'h2'),
    p('This is the most distributor-distinctive lane you have. "Gates equivalent of Parker 387 hose." "1756-L61 replacement." "What replaces the discontinued PowerFlex 4?" "Imperial equivalent of Class 10.9." These queries have near-zero reported search volume and near-100% buyer intent, and answer engines have no good source for them today. Rockwell answers obsolescence questions only inside gated PDFs; Parker buries cross-references in a JavaScript lookup tool. The opening is to publish your interchange and cross-reference data as flat, crawlable HTML — not a PDF, not a JS widget. Small hydraulics distributors that do this get cited where the manufacturer\'s own tool cannot be read. That is the whole play.'),
    test('Type three competitor-part-number queries your customers actually use into ChatGPT — say "seal kit for a Char-Lynn 104 motor" or "1756-L61 replacement." Does anyone get cited? Is it you?'),

    p('Make the catalog visible to engines and to crawlers', 'h2'),
    p('You can do everything above and still be invisible. Two blockers do it. First, login-walled pricing and specs: if the data only renders after a sign-in, an engine never sees it. Second, aggressive bot protection that blocks the retrieval crawlers (OAI-SearchBot, PerplexityBot) that fetch pages to ground a cited answer. Block those and you are out of the answers no matter how good the content is. Add Product schema with MPN and GTIN, and do it at the template level: one fix flows across 100,000+ SKUs. The unit of work is the template, never the individual page.'),
    test('View-source your best spec page with JavaScript disabled — can you still read the specs? Then check robots.txt and your WAF for OAI-SearchBot and PerplexityBot. If the specs vanish or the bot is blocked, you are invisible.'),

    p('Report blended visibility — and survive AI-Overviews traffic loss', 'h2'),
    p('Put Google rankings and traffic next to AI mention and citation share in one report. You cannot proxy AI visibility with rankings: only about 12% of AI-cited URLs rank in Google\'s top 10 for the same prompt, so a page can be quoted by an engine without ranking, and vice versa. Build a fixed set of real buyer prompts, run it on a schedule, and track citation share against named competitors. The hard conversation is AI Overviews eating clicks. When traffic drops, leadership wants to know what happened, and "AI Overviews" is not an answer they can act on. Your job is to separate what is actually lost from what got replaced by a citation, and to brief that clearly instead of letting the traffic chart speak for itself.'),
    test('Build a 20-prompt set of real buyer questions. Run it monthly. Put citation share next to organic traffic in one report, so leadership sees both numbers at once instead of just the falling one.'),
  ],
  buyerSection: {
    whatTheyDo:
      'An AI search specialist runs one program for both goals at once: keeping your category and product pages ranking on Google, and getting your catalog cited inside ChatGPT, Perplexity, Gemini and Google AI Overviews. One person does both, instead of splitting the work across an SEO and a separate AI-search hire you cannot justify.',
    signsYouNeedOne: [
      'You can fund exactly one search person, not a team, and you need both rankings and AI visibility from them',
      'Buyers tell you they "found a competitor through ChatGPT," but you also cannot afford to let Google rankings slide',
      'Your catalog is full of manufacturer-supplied descriptions (sitewide duplicate content), and part-number queries have no good answer-engine source',
      'Pricing or specs sit behind a login, or bot protection blocks AI crawlers, so you are invisible to LLMs no matter how good the content is',
    ],
    inHouseVsAgency: [
      p('If you hire exactly one search person, make it this hybrid — someone who owns classic SEO and AI search, not a GEO-only specialist. The field has not agreed on a title (AI SEO Specialist, AI Search Specialist, SEO & AI Search Specialist all describe it), and 74% of enterprises say they will hire an AI-skilled SEO within a year (Semrush, via the Webflow 2026 salary guide). A job title existing does not mean you should fill it in-house, though.'),
      p('Below roughly $50M in revenue (a speculative threshold, not a hard line), a fractional operator or an agency almost always wins. The front-loaded work (schema, dedup, crawler access, cross-reference publishing) does not need a full-time salary, and one generalist hire rarely has both the SEO depth and the AI-search literacy. Above that, an in-house hybrid starts to pay off. The real decision on this page is one hybrid hire versus an agency, not GEO versus SEO.'),
    ],
    costReality:
      'Mid-level pay sits around $70–117K, with AI skills commanding the top of the band. If you are hiring the single search person, budget ~$70–110K (2025–26 US postings, per 03-roles.md; Webflow 2026 salary guide / Semrush). Entry is effectively a junior SEO (~$53K). The "AI" label adds little at that level, and there are essentially no true entry GEO/AEO openings. A fractional or agency engagement covers the front-loaded build for a fraction of fully-loaded headcount.',
  },
  relatedTerms: ['llm-seo', 'ai-search-optimization', 'generative-engine-optimization', 'answer-engine-optimization', 'ai-visibility'],
  seo: {
    _type: 'seo',
    metaTitle: 'AI Search Specialist: the hybrid search career path',
    metaDescription:
      'The AI search specialist runs rankings and AI visibility as one program — the single search hire a mid-size distributor makes. What to learn at each level, and when to hire vs use an agency.',
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

// Verify with perspective: 'raw' — the default 'published' perspective HIDES drafts.
const raw = client.withConfig({ perspective: 'raw' })
const check = await raw.fetch(
  `*[_id == $id][0]{ _id, title, "h2": count(body[style == "h2"]), "relatedTerms": relatedTerms[]->slug.current }`,
  { id: doc._id },
)
if (!check) {
  console.error('VERIFY FAILED: draft not found.')
  process.exit(1)
}
console.log('\nVerify (perspective: raw):')
console.log(`  _id:           ${check._id}`)
console.log(`  title:         ${check.title}`)
console.log(`  h2 chapters:   ${check.h2}`)
console.log(`  relatedTerms:  ${JSON.stringify(check.relatedTerms)}`)
console.log('\nDraft only. Review + voice + publish in Studio (Career paths). Nothing is live.')
