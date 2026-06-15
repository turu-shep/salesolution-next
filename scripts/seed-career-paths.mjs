/**
 * Seed the two P0 career paths (GEO Specialist, Citation Engineer) as Sanity DRAFTS.
 *
 * Same workflow as the glossary: agent drafts → operator reviews/voices in Studio →
 * publish. Nothing goes live here. Content is grounded in
 * docs/strategy/career-path/03-roles.md and the 2026-06-14 verification pass
 * (e.g. "citation engineering" framed as a slice of GEO/AEO, not coined-by-us).
 *
 *   node scripts/seed-career-paths.mjs
 *
 * Idempotent (createOrReplace on the draft ids). DON'T re-run after editing in Studio.
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

const REVIEWED = '2026-06-14'

const paths = [
  {
    slug: 'geo-specialist',
    title: 'GEO Specialist',
    role: 'SEOs moving into AI search',
    level: 'Mid',
    duration: 'Self-paced',
    description:
      'How to make an industrial catalog the source AI answer engines cite — schema, entities, crawler access, and visibility testing — for SEOs moving into generative search.',
    aliases: ['Generative Engine Optimization Specialist', 'AI SEO Specialist', 'GEO/AEO Specialist'],
    seniorityMatrix: [
      {
        _key: key(), _type: 'levelRow', level: 'Entry',
        focus: 'Learn the surfaces and run the audits. You are an SEO or content analyst adding AI-search literacy.',
        mustLearn: [
          'How ChatGPT, Perplexity, Gemini and Google AI Overviews actually retrieve and cite sources',
          'Reading schema.org / JSON-LD (Product, FAQ, Organization)',
          'Running prompt audits — what engines say about your brand vs competitors',
          'Checking whether AI crawlers (GPTBot, PerplexityBot) can even reach your pages',
        ],
      },
      {
        _key: key(), _type: 'levelRow', level: 'Mid',
        focus: 'Own GEO execution for a brand or client portfolio.',
        mustLearn: [
          'Template-level schema rollouts across a large catalog',
          'Entity and corroboration work — consistent facts across trusted third-party sources',
          'Monthly AI-visibility reporting across four or five engines',
          'Fixing extractability of key templates (HTML tables, not PDFs or JS widgets)',
        ],
      },
      {
        _key: key(), _type: 'levelRow', level: 'Senior',
        focus: 'Set GEO strategy and arbitrate it against classic SEO.',
        mustLearn: [
          'Building the measurement framework — mention rate, citation share, AI share of voice',
          'Deciding the SEO-vs-GEO resourcing split',
          'Educating the wider org — GEO is a teaching function, not just execution',
          'Governing the accuracy of what engines say about safety-critical products',
        ],
      },
    ],
    body: [
      p('This path is for SEOs and technical content people moving into AI search. It assumes you already know classic SEO; it focuses on what changes when the goal is being cited inside an answer rather than ranked in a list — specifically inside an industrial e-commerce catalog.'),
      p('What GEO actually is (and isn’t)', 'h2'),
      p('Generative engine optimization is structuring your content and data so AI answer engines retrieve, summarize, and cite it — not so you rank a list of blue links. The technical groundwork overlaps heavily with SEO (Google itself calls GEO/AEO “still SEO”), but the target is a citation and the measurement is different. Treat it as a citation-and-extraction discipline layered on solid SEO, not a replacement for it.'),
      test('Ask ChatGPT and Perplexity a question your best customer would actually type. Are you mentioned? Cited? Or is it a competitor and a generic blog?'),
      p('Make the catalog extractable', 'h2'),
      p('Engines can only cite what they can read. The recurring industrial failure is spec data trapped in PDFs or a JavaScript catalog that crawlers never render. Pull specs into HTML tables, add Product schema with MPN and GTIN at template scale, and publish cross-reference data as flat, crawlable tables. The unit of work is the template — one fix across hundreds of thousands of SKUs.'),
      test('Open your top category page with JavaScript disabled (or “view source”). Can you still read the specs? If not, neither can most AI crawlers.'),
      p('Build the entity graph', 'h2'),
      p('Answer engines assemble a picture of who you are from your site plus corroborating third-party sources. Make the core facts — what you sell, which brands you carry, where you operate — consistent across your pages, manufacturer pages, directories, and Wikidata. Inconsistent or thin entity signals are why a capable distributor gets skipped in favor of a marketplace.'),
      test('Search your brand on three engines. Do they agree on what you sell and where? Every disagreement is entity work to do.'),
      p('Open the doors to AI crawlers', 'h2'),
      p('Distinguish training crawlers (GPTBot, ClaudeBot) from retrieval crawlers (OAI-SearchBot, PerplexityBot) that fetch pages to ground cited answers. Aggressive bot protection that blocks the retrieval crawlers removes you from those answers entirely, no matter how good your content is. Auditing crawler access is usually the first concrete deliverable of GEO work.'),
      test('Check your robots.txt and WAF/bot-management rules for OAI-SearchBot and PerplexityBot. Blocked means invisible to those answers.'),
      p('Measure what you can’t rank for', 'h2'),
      p('You can’t use rankings here — only about 12% of AI-cited URLs rank in Google’s top 10 for the same prompt. Build a fixed set of real buyer prompts, run them on a schedule, and track mention rate, citation share, and AI share of voice against competitors. Tools like Ahrefs Brand Radar, Profound, and Otterly automate the sampling.'),
      test('Build a 20-prompt set of real buyer questions. Run it monthly. Track your citation share against two named competitors.'),
    ],
    buyerSection: {
      whatTheyDo:
        'A GEO specialist makes your products show up — and get cited — when buyers ask AI assistants instead of Googling. They handle structured data, entity consistency, AI-crawler access, and visibility tracking across ChatGPT, Perplexity, Gemini and Google AI Overviews.',
      signsYouNeedOne: [
        'Buyers mention they “found a competitor through ChatGPT”',
        'Your spec data lives in PDFs or a JavaScript catalog AI tools can’t read',
        'You rank on Google but never appear in AI answers',
        'You have no idea what AI engines currently say about your brand',
      ],
      inHouseVsAgency: [
        p('The work is front-loaded — schema, entity cleanup, template and crawler fixes — then settles into monthly monitoring. That shape suits an agency or fractional engagement for most distributors; a full-time hire only pays off at enterprise scale. (Caterpillar posted exactly this role in 2025 — but Caterpillar is Caterpillar.)'),
        p('If you only hire one search person, make it a hybrid who owns both classic SEO and GEO, not a GEO-only specialist.'),
      ],
      costReality:
        'Mid-level GEO salary runs roughly $90–137K plus $30–500/mo in tooling (2025–26 US postings). An agency retainer covers the front-loaded work for a fraction of fully-loaded headcount.',
    },
    relatedTerms: ['generative-engine-optimization', 'ai-visibility', 'citation-engineering', 'ai-crawler', 'query-fan-out'],
    seo: {
      _type: 'seo',
      metaTitle: 'GEO Specialist: the AI-search career path',
      metaDescription:
        'How to become a generative engine optimization (GEO) specialist for industrial e-commerce — what to learn at each level, and when a distributor should hire vs use an agency.',
    },
  },
  {
    slug: 'citation-engineer',
    title: 'Citation Engineer',
    role: 'GEO and content engineers',
    level: 'Mid',
    duration: 'Self-paced',
    description:
      'Citation engineering is the citation-focused slice of GEO: structuring content and evidence so AI answers name your domain as the source. Here is the practice — and where it fits in an industrial catalog.',
    aliases: ['AI citation engineering', 'citation optimization'],
    seniorityMatrix: [
      {
        _key: key(), _type: 'levelRow', level: 'Entry',
        focus: 'Restructure existing pages into citable, extractable passages.',
        mustLearn: [
          'Why ranking and being cited are different outcomes (most AI-cited URLs don’t rank top 10)',
          'Writing self-contained, entity-explicit passages an engine can lift',
          'Why local-SEO “citation building” (NAP directory listings) is an unrelated thing',
          'Turning PDFs and JS widgets into crawlable HTML tables',
        ],
      },
      {
        _key: key(), _type: 'levelRow', level: 'Mid',
        focus: 'Design citation targets and build corroboration.',
        mustLearn: [
          'Mapping which buyer prompts should resolve to which page',
          'Building reference assets — cross-reference tables, spec databases, glossaries — engines must cite',
          'Getting brand facts stated consistently across trusted third-party sources',
          'A/B-testing content structures against citation pickup',
        ],
      },
      {
        _key: key(), _type: 'levelRow', level: 'Senior',
        focus: 'Run citations as an acquisition channel.',
        mustLearn: [
          'Treating citation share as a tracked outcome with its own reporting',
          'Owning the reference-asset roadmap',
          'Telling real citations from hallucinated or misattributed ones — and fixing them',
          'Connecting citation work to the funnel without overclaiming attribution',
        ],
      },
    ],
    body: [
      p('Citation engineering is the citation-focused slice of GEO and AEO — the part concerned specifically with getting AI answer engines to name your domain as the source. It is not local-SEO “citation building” (business directory listings), which is a different practice with the same word. This path is for GEO and content people who want to make citation the deliverable.'),
      p('Citation is not ranking', 'h2'),
      p('Only about 12% of the URLs AI assistants cite also rank in Google’s top 10 for that prompt, and AI Overviews increasingly cite pages outside the top results. That gap is the whole opportunity: a distributor’s spec page can be quoted by an engine without holding a top ranking — so citation is worth engineering for on its own terms.'),
      test('Find one AI answer in your category. List the cited sources. How many actually rank on Google’s first page? (Usually few.)'),
      p('Build things engines must cite', 'h2'),
      p('The most citable content is reference material: interchange and cross-reference tables, spec databases, compatibility and decision tables. Distributors already own this data in their PIM and ERP but rarely publish it in a form an engine can quote. Publishing it as flat, crawlable HTML — not a PDF, not a JS lookup widget — is the highest-leverage move available.'),
      test('Pick one dataset only you have — an interchange list, a compatibility table. Publish it as a flat HTML table. That is a citation magnet.'),
      p('Structure for extraction', 'h2'),
      p('Engines lift self-contained passages. Write so a single paragraph answers a complete question, name the entities explicitly (part numbers, standards, brands), and add a clear source line. Avoid answers that only make sense after three paragraphs of setup — those don’t survive being pulled into a synthesized answer.'),
      test('Take your best spec page. Can one paragraph stand alone as a complete answer? If not, rewrite one until it can.'),
      p('Corroborate across sources', 'h2'),
      p('Engines trust facts that appear consistently across multiple sources they already weight. Getting your key product facts stated the same way on manufacturer pages, directories, and reputable third-party sites raises the odds you’re the cited source. This is corroboration — again, distinct from local citation listings.'),
      test('Search a key product fact on three engines. If they disagree or omit it, that’s a corroboration gap to close.'),
      p('Track and repair attribution', 'h2'),
      p('Monitor which URLs get cited for your target prompts, and watch for misattribution — the named source isn’t always the true one, and documented error rates are high. When an engine credits your data to a competitor or states it wrong, that’s a correction campaign, not a vanity metric.'),
      test('Run your brand’s top claim through ChatGPT and Perplexity. Is it attributed to you, to a competitor, or simply wrong? Log it.'),
    ],
    buyerSection: {
      whatTheyDo:
        'Citation engineering gets your domain named as the source inside AI answers — by structuring extractable content, building reference assets from your own data, and keeping your brand’s facts consistent across the web. It is the citation-focused slice of GEO, distinct from local-SEO “citation building.”',
      signsYouNeedOne: [
        'AI answers in your category cite generic blogs instead of your catalog',
        'You sit on unique data (interchanges, compatibility, specs) not published in a citable form',
        'Competitors get named by AI assistants and you don’t',
        'You want measurable AI-search results but rankings aren’t moving',
      ],
      inHouseVsAgency: [
        p('No one staffs a “citation engineer” as a standardized job yet — it’s bought as an outcome, usually inside a GEO or AI-visibility retainer. What only you can supply is the raw data: the interchange lists, the compatibility tables. The structuring, corroboration, and tracking is what an operator or agency adds.'),
        p('If you already have the data and a publishing pipeline, an in-house GEO hybrid can own this. Otherwise, buy it as an outcome.'),
      ],
      costReality:
        'Priced like GEO retainers, not salaries — there is no established “citation engineer” pay band because it isn’t yet a standalone job title. Anchor on what a GEO / AI-visibility engagement costs.',
    },
    relatedTerms: ['citation-engineering', 'llm-citation', 'ai-visibility', 'part-number-cross-reference', 'grounding'],
    seo: {
      _type: 'seo',
      metaTitle: 'Citation Engineering: getting cited by AI answers',
      metaDescription:
        'Citation engineering — the GEO sub-discipline of getting AI answer engines to name your domain as the source. The practice by seniority, plus hire-vs-agency for industrial e-commerce.',
    },
  },
]

const docs = paths.map((pth) => ({
  _id: `drafts.career-${pth.slug}`,
  _type: 'careerPath',
  title: pth.title,
  slug: { _type: 'slug', current: pth.slug },
  role: pth.role,
  level: pth.level,
  duration: pth.duration,
  description: pth.description,
  aliases: pth.aliases,
  status: 'drafting',
  seniorityMatrix: pth.seniorityMatrix,
  body: pth.body,
  buyerSection: pth.buyerSection,
  relatedTerms: pth.relatedTerms.map(term),
  lastReviewed: REVIEWED,
  seo: pth.seo,
}))

const tx = docs.reduce((t, d) => t.createOrReplace(d), client.transaction())
tx.commit()
  .then(() => {
    console.log(`Seeded ${docs.length} career-path drafts:`)
    for (const d of docs) console.log(`  - ${d._id}`)
    console.log('\nReview + voice + publish in Studio (Career paths). Nothing is live until published.')
  })
  .catch((err) => {
    console.error('Seed failed:', err.message)
    process.exit(1)
  })
