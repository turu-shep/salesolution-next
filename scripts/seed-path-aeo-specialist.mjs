/**
 * Seed the AEO Specialist career path as a Sanity DRAFT — SKILL-MODULE model,
 * cross-vertical (industrial e-commerce / home services / dental).
 *
 * Rebuilds the old essay-model, industrial-only AEO draft to the build standard
 * (docs/strategy/career-path/09-career-path-build-standard.md). Substance is
 * grounded in 03-roles.md §3.2 + the P0 summary. Verified facts kept verbatim:
 *   - Citizens Bank "Answer Engine Optimization Manager" $131–171K + bonus,
 *     7–10+ yrs, charter to build an AEO Center of Excellence.
 *   - Stackmatix AEO guide bands (vendor guide, attributed): ~$75–95K specialist
 *     / $100–174K manager. ZipRecruiter AEO contract $43–48/hr.
 *   - 51% of B2B buyers start research in AI chatbots (G2 Buyer Behavior
 *     Report, Apr 2025).
 *   - Postings hybridize (GEO/AEO, SEO/AEO) — AEO rarely stands alone.
 *
 *   node scripts/seed-path-aeo-specialist.mjs
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
// relatedTerms point at PUBLISHED glossary docs, so strong refs are fine.
const term = (slug) => ({ _type: 'reference', _key: key(), _ref: `glossary-${slug}` })
const mod = (m) => ({ _type: 'skillModule', _key: key(), ...m })
const row = (r) => ({ _key: key(), _type: 'levelRow', ...r })

const REVIEWED = '2026-06-17'

const path = {
  slug: 'aeo-specialist',
  title: 'AEO Specialist',
  kind: 'role',
  role: 'SEO and content leads moving from rankings to being the answer an AI gives',
  level: 'Entry → Senior',
  duration: 'Self-paced',
  description:
    'Answer engine optimization (AEO) is the work of being the answer an AI assistant gives when a buyer asks, and making sure that answer is right. This path is the role at scale: what to master from Entry to Senior, whether you run a big distributor catalog, a multi-location home-services site, or a dental group with several offices.',
  aliases: [
    'Answer Engine Optimization Manager',
    'GEO/AEO Manager',
    'AEO Manager',
    'SEO/AEO Specialist',
  ],
  seniorityMatrix: [
    row({
      level: 'Entry',
      label: 'find the questions',
      focus:
        'By the end you can pull the real questions buyers ask, check whether an AI assistant already answers them with your page, and spot which of your pages can be lifted as a clean answer.',
    }),
    row({
      level: 'Mid',
      label: 'own the answers',
      focus:
        'By the end you can structure a page or a whole template so an engine lifts a clean answer from it, and track your answer-share against named competitors across several engines.',
    }),
    row({
      level: 'Senior',
      label: 'govern what the machine says',
      focus:
        'By the end you can run a standing process that catches when an AI states your facts wrong or credits a rival, and set the answer-accuracy standard the rest of the search program builds on.',
    }),
  ],
  intro: [
    p('This path is for SEO and content leads who already rank pages and now want to be the answer an AI assistant gives. You know the search basics. Here is what the job becomes when the goal stops being a spot on a list of ten links and becomes being the one response a buyer reads, in the order you would learn it, from Entry to Senior. The examples span the businesses we work with: industrial e-commerce, home services, and dental. Each skill ends with a check you can run on a real site.'),
  ],
  modules: [
    // ── ENTRY ──────────────────────────────────────────────────────────────
    mod({
      level: 'Entry',
      title: 'Pull the real questions buyers actually ask',
      skill:
        'Build the list of questions your buyers type into an AI assistant, from real sources, not from a keyword tool.',
      why:
        'AEO targets questions, not keywords, and the questions live where business gets done. A distributor’s come from the application desk: “Gates equivalent of Parker 387 hose,” “seal kit for a Char-Lynn 104 motor.” A roofing company’s come from the phone: “do I need a permit to replace a roof in Tampa,” “how long does a tear-off take.” A dental group’s come from the front desk: “does a crown hurt,” “how much is an implant without insurance.” Same skill, different call log. Get the list wrong and everything after it optimizes for the wrong thing.',
      scenario:
        'A three-office dental group tracked rankings for “dentist near me” and won nothing useful. Their front desk fielded the same ten questions every day about cost, pain, and insurance. None of those answers existed on the site, so when patients asked an assistant, a directory site answered instead.',
      edgeCases: [
        'Keyword tools show near-zero volume for question phrases, so they look unimportant even when every buyer asks them.',
        'One typed question fans out into several sub-questions behind the scenes (query fan-out), so the target is a question set, not one phrase.',
        'The best questions never reach analytics: they’re asked by phone, in chat, at the counter.',
        'Branded and unbranded versions of the same question need different answers.',
      ],
      proficientWhen:
        'You can hand over a list of 20 real buyer questions, say where each one came from, and show which ones an AI assistant answers today with someone else’s page.',
    }),
    mod({
      level: 'Entry',
      title: 'Check whether you are the answer right now',
      skill:
        'Run your buyer questions through the AI assistants and record, for each one, whether you are the answer, a footnote, or absent.',
      why:
        'You cannot fix answer-share you have never looked at. Rankings will not tell you, because the question never resolves to a list of ten blue links. The only way to know is to ask the engines the way a buyer would. The reading is the same everywhere; what changes is the engine mix. A B2B distributor’s buyers lean on ChatGPT and Perplexity. A homeowner picking a roofer leans on Google AI Overviews (the AI answer at the top of a Google search) and increasingly on the assistant in their phone. Check where your buyers actually are.',
      scenario:
        'An MRO supplier assumed it owned “food-grade vs H1/H2 lubricants” because it ranked for the phrase. Asked on ChatGPT and Perplexity, the answer came back as a tidy paragraph credited to a competitor’s decision table. The supplier was nowhere in the response a buyer would actually read.',
      edgeCases: [
        'The same question gives different answers on different engines, and on the same engine a week later.',
        'You appear as a source link but your name never gets said in the answer, which is not the same as being the answer.',
        'A logged-in account or a paid tier returns a different answer than a cold, logged-out one.',
        'The engine answers confidently and wrong, which still counts as you being absent.',
      ],
      proficientWhen:
        'You can take any buyer question, ask it across two or three assistants, and log whether you are the answer, merely cited, or absent, with the response pasted in as proof.',
    }),
    mod({
      level: 'Entry',
      title: 'Spot which pages can be lifted as a clean answer',
      skill:
        'Read one of your pages the way an engine does and judge whether a single self-contained passage answers the question without setup.',
      why:
        'Engines lift passages, not pages. A passage that only makes sense after three paragraphs of preamble cannot be lifted, and a number trapped in a PDF or a JavaScript widget (a lookup box that only fills in after code runs) cannot be read at all. The failure looks different by business but it is the same failure. A distributor buries the spec in a download. A roofer writes a 1,200-word “about our process” page that never plainly says what a tear-off costs. A dental practice hides the implant price behind a “call us.” None of them give the engine a clean line to quote.',
      scenario:
        'A roofing site had a strong page about metal roofs, but the answer to “how long does a metal roof last” was scattered across four paragraphs and a brochure PDF. There was no single sentence an engine could lift, so it quoted a manufacturer’s site instead.',
      edgeCases: [
        'The real answer lives only in a downloadable PDF or a spec sheet, which most engines do not read.',
        'The answer is correct but spread across the page, with no one passage that stands on its own.',
        'The page answers a slightly different question than the one buyers ask.',
        'The page hides the answer behind “contact us” or a login.',
      ],
      proficientWhen:
        'You can point at one passage on a page and say, this stands alone as a complete answer to a real buyer question, or explain exactly what is stopping it.',
    }),
    // ── MID ────────────────────────────────────────────────────────────────
    mod({
      level: 'Mid',
      title: 'Make a page answer one question cleanly',
      skill:
        'Restructure a page so one question gets one self-contained answer up front, with the supporting detail below it.',
      why:
        'This is the core production skill of AEO. The rule is easy to say and hard to hold: one question per passage, a single paragraph that answers the whole thing, the proof underneath. Lead with the answer the buyer wants. A homeowner wants the price range and the timeline before the company history. A patient wants “yes, it can be sore for a day or two” before the clinical explanation. A maintenance engineer wants the cross-reference part number before the brand story. Put the answer first and you give the engine something to lift; bury it and you do not.',
      scenario:
        'A dental group rewrote its implant page to open with one plain paragraph: what an implant costs without insurance, how long it takes, and how much it hurts. The clinical detail stayed, moved below. Within weeks that opening paragraph was the answer assistants gave for “dental implant cost,” ahead of the directory listings.',
      edgeCases: [
        'The honest answer is a range, and the team wants to soften it into mush an engine cannot use.',
        'Legal or compliance review waters the answer down until it no longer answers anything.',
        'The clean answer makes the rest of the page look like filler, which it often was.',
        'One page tries to answer five questions, so it answers none of them cleanly.',
      ],
      proficientWhen:
        'You can take a vague page and ship a version where the first passage stands alone as a complete, accurate answer, and the engine starts lifting it.',
    }),
    mod({
      level: 'Mid',
      title: 'Fix the pattern once, across the whole site',
      skill:
        'Work at the template level so one structural fix lands across every page built from the same pattern.',
      why:
        'At scale the unit of work is the template, not the page. A distributor has hundreds of thousands of product pages off one template; you fix the spec-table pattern once and it lands across all of them. A home-services company has a page per city and service, so you fix the city-page template and every location inherits the clean answer. A dental group has a page per office and treatment with the same structure repeated. Fixing pages one at a time is a job you can never finish; fixing the template is a job you can.',
      scenario:
        'A 40-location HVAC contractor had a separate page for every city it served, each missing a plain answer to “what does an AC install cost in [city].” One edit to the shared template added a clear price-range passage to all 40 pages at once, instead of 40 hand edits that would never have happened.',
      edgeCases: [
        'A template fix that helps most pages breaks the handful built differently, so you have to find the exceptions.',
        'Per-location facts (price, permits, response time) still vary, so the template needs real fields, not boilerplate.',
        'Duplicated city or treatment pages with one word swapped read as thin to engines, and the template choice is what saved or sank them.',
        'The CMS will not let you change the template without engineering, so the fix turns into a ticket, not an edit.',
      ],
      proficientWhen:
        'You can make one change to a template and show the clean answer now appears on every page built from it, not just the one you tested.',
    }),
    mod({
      level: 'Mid',
      title: 'Mark up the page so engines trust the answer',
      skill:
        'Add the right structured data and Q&A markup so engines can read the answer with confidence, and put spec data in HTML they can parse.',
      why:
        'Structured data (extra code that labels what each part of a page means) and FAQ or Q&A markup help an engine find the exact answer and trust it enough to use. It is not magic; a marked-up bad answer is still a bad answer. But the right markup plus a clean passage is what gets lifted. The flavor differs by business: a distributor needs product and spec markup with part numbers in real HTML tables, a dental practice needs FAQ markup on cost and procedure questions, a roofer needs service and local-business markup so the answer ties to the right city.',
      scenario:
        'A regional Parker distributor published its interchange data as a crawlable HTML table with Q&A markup instead of a JavaScript lookup tool. Perplexity started quoting the distributor’s table for “Gates equivalent of Parker 387 hose,” ahead of Parker’s own tool, because the engine could read the table and not the widget.',
      edgeCases: [
        'Markup that does not match the visible page can get the page ignored or penalized, so the code and the words must agree.',
        'FAQ markup stuffed with questions buyers never ask is noise, not help.',
        'The spec table lives in a JavaScript widget or a PDF, so there is nothing for the markup to describe.',
        'Engines change which markup they reward, so a one-time setup quietly goes stale.',
      ],
      proficientWhen:
        'You can mark up a page so a testing tool reads the question and answer cleanly, and the underlying spec data sits in HTML an engine can parse without running code.',
    }),
    mod({
      level: 'Mid',
      title: 'Measure answer-share, not rankings',
      skill:
        'Track answer rate, mention rate, and share of voice across several engines against named competitors, on a schedule.',
      why:
        'Rankings do not help here, because the question never resolves to a list. So measure the thing that matters directly: how often you are the answer (answer rate), how often you get named (mention rate), and how you stack up against rivals (share of voice). The question set comes from the work, not a tool: the distributor’s application-desk log, the roofer’s incoming calls, the dental front desk’s FAQs. Run the same set monthly and the trend tells you whether the structuring is working.',
      scenario:
        'A roofing company built a 20-question set from its call log, then ran it monthly across Google AI Overviews, ChatGPT, and Perplexity against two named local competitors. Three months in, its answer rate on “does insurance cover a roof replacement” had gone from absent to the lead answer, and the trend, not a hunch, proved the content work paid off.',
      edgeCases: [
        'Engine answers drift week to week, so a single snapshot misleads and only a tracked trend is trustworthy.',
        'Being cited as a source is not the same as being the answer, so count them separately.',
        'Visibility tools sample a fixed prompt set that may not match your real questions.',
        'A competitor’s answer can be wrong yet still be the one shown, which is a finding, not noise.',
      ],
      proficientWhen:
        'You can show a monthly chart of your answer rate and share of voice on a real question set, against named competitors, and explain what moved and why.',
    }),
    // ── SENIOR ─────────────────────────────────────────────────────────────
    mod({
      level: 'Senior',
      title: 'Govern what the machine says about you',
      skill:
        'Run a standing process that catches when an AI states your facts wrong or credits a rival, and gets it corrected.',
      why:
        'This is the senior, AEO-specific job, and the reason the role is not a marketing nicety. The answer is a liability surface. In industrial that is pressure ratings and chemical compatibility, where a wrong answer can hurt someone. In home services it is permit rules, code requirements, and price claims that have to hold up. In dental it is clinical and cost claims a patient can act on. When an engine states one of these wrong, or hands your data to a competitor, you need a documented way to catch it and fix it, not a one-off panic. The subject-matter expert signs off; the process catches the drift.',
      scenario:
        'A distributor found ChatGPT confidently stating a pressure rating for one of its fittings that was higher than the real spec. Left alone, a buyer could have ordered on that number. A standing monthly check on its highest-stakes claims caught it, the team published a corrected, clearly-marked answer, and the engine picked up the right figure.',
      edgeCases: [
        'Engines hallucinate specs that appear nowhere on your site, so the fix is publishing the right answer more clearly, not editing a page that was already correct.',
        'Your accurate data gets credited to a competitor, which is a different problem than a wrong number.',
        'High-stakes claims need a real subject-matter expert to sign off, not a marketer guessing.',
        'There is no “submit a correction” button on most engines, so the lever is republishing clearer, more citable proof.',
      ],
      proficientWhen:
        'You can run your highest-stakes claims through the assistants on a schedule, catch a wrong or misattributed answer, and show the corrected answer getting picked up.',
    }),
    mod({
      level: 'Senior',
      title: 'Set the standard the rest of the search program runs on',
      skill:
        'Make answer-accuracy and answer-share a defined standard with owners and a measurement framework, so AEO is not one person’s side project.',
      why:
        'At the senior level AEO stops being a task and becomes a system other people work inside. It sits within a wider family: GEO is the broad work of getting cited in generative answers (generative engine optimization), AEO is the slice aimed at owning the answer to a specific question, and classic SEO is still the groundwork under both. Someone has to draw those lines so content, technical, and SME teams know who owns what. The same framework serves a distributor, a contractor network, and a dental group; only the question set and the experts change.',
      scenario:
        'A multi-location services company kept relearning AEO every time a new content hire started. A senior lead wrote down the standard: where the question set comes from, what a clean answer looks like, who signs off on accuracy, and how answer-share gets measured. New hires followed the playbook instead of reinventing it, and the program held steady through turnover.',
      edgeCases: [
        'AEO, GEO, and classic SEO overlap, so without clear ownership the same work gets done twice or not at all.',
        'The standard rots as engines change, so it needs a review owner, not a one-time document.',
        'SME sign-off is a bottleneck if no one schedules it, and accuracy is where the role earns its keep.',
        'Leadership wants a single vanity number, and the honest answer is a small framework, not one metric.',
      ],
      proficientWhen:
        'You can hand a new hire a written AEO standard, the live question set, and the measurement framework, and they can run the program without you.',
    }),
  ],
  buyerSection: {
    whatTheyDo:
      'An AEO specialist makes your business the answer when buyers ask AI assistants question-shaped queries: pulling the real questions, structuring pages so engines lift a clean answer, measuring your answer-share, and governing that what the AI says about you is accurate. That last part is compliance-grade work in safety-critical or regulated categories, not a vanity metric.',
    signsYouNeedOne: [
      'Buyers ask AI assistants question-shaped queries (“can I substitute this seal kit,” “do I need a permit for a new roof,” “how much is an implant”) and your site is not the answer.',
      'Your team answers the same questions all day by phone or at the desk, and none of it is published in a form an engine can read.',
      'AI assistants state your prices, specs, or claims wrong, or credit your data to a competitor, and you have no process to catch it.',
      'You track rankings and clicks but have no read on answer-share, what engines actually say when buyers ask.',
    ],
    inHouseVsAgency: [
      'Do not hire a dedicated AEO specialist. The job market does not believe in the title either: postings hybridize it (GEO/AEO, SEO/AEO), and the one true standalone charter on the board is Citizens Bank’s Answer Engine Optimization Manager building a Center of Excellence, a bank-scale role most businesses will never staff.',
      'For a distributor, a contractor, or a dental group, AEO is a discipline you buy inside a broader GEO or AI-search engagement, not a seat you fill. The work is front-loaded (structuring, markup, the first answer-share baseline) and then becomes monitoring, which does not justify a full-time salary at most companies.',
      'What you cannot outsource is the moat: the expert knowledge and the accuracy sign-off on high-stakes claims. Keep the subject-matter expert and the final say in-house. Buy the structuring, the measurement, and the governance process as an outcome, fractionally or through an agency. If you hire one search person total, make it a hybrid who owns SEO, GEO, and AEO together, not an AEO-only role.',
    ],
    costReality:
      'Hard salary evidence exists, but the title rarely stands alone. Citizens Bank’s Answer Engine Optimization Manager posting runs $131–171K plus bonus (7–10+ years, charter to build an AEO Center of Excellence). Stackmatix’s AEO guide bands it lower for most orgs: roughly $75–95K for a specialist, $100–174K for a manager. ZipRecruiter lists AEO contract work at $43–48 an hour. For most businesses the math says buy AEO inside a GEO retainer rather than carry a dedicated salary; your in-house cost is the expert’s time, not a new headcount. (Source: docs/strategy/career-path/03-roles.md §3.2.)',
  },
  relatedTerms: [
    'answer-engine-optimization',
    'answer-engine',
    'ai-overviews',
    'query-fan-out',
    'ai-share-of-voice',
    'generative-engine-optimization',
  ],
  seo: {
    _type: 'seo',
    metaTitle: 'AEO Specialist: the answer-engine career path',
    metaDescription:
      'Answer engine optimization as a career: being the answer AI assistants give buyers, and keeping it accurate. The role from Entry to Senior, plus hire-vs-agency.',
  },
}

const doc = {
  _id: `drafts.career-${path.slug}`,
  _type: 'careerPath',
  title: path.title,
  slug: { _type: 'slug', current: path.slug },
  kind: path.kind,
  role: path.role,
  level: path.level,
  duration: path.duration,
  description: path.description,
  aliases: path.aliases,
  status: 'drafting',
  seniorityMatrix: path.seniorityMatrix,
  modules: path.modules,
  body: path.intro,
  buyerSection: path.buyerSection,
  relatedTerms: path.relatedTerms.map(term),
  lastReviewed: REVIEWED,
  seo: path.seo,
}

await client.createOrReplace(doc)
console.log(`Seeded career-path draft: ${doc._id}`)

// VERIFY with a raw-perspective query (default perspective hides drafts).
const raw = client.withConfig({ perspective: 'raw' })
const check = await raw.fetch(
  `*[_id == $id][0]{
    _id, title, kind, status, level, "slug": slug.current,
    "modules": count(modules),
    "entry": count(modules[level=="Entry"]),
    "mid": count(modules[level=="Mid"]),
    "senior": count(modules[level=="Senior"]),
    "matrixRows": count(seniorityMatrix),
    "relatedCount": count(relatedTerms),
    "introBlocks": count(body)
  }`,
  { id: doc._id },
)
console.log('\nVERIFY (perspective: raw):')
console.log(JSON.stringify(check, null, 2))
if (!check) {
  console.error('VERIFY FAILED: draft not found')
  process.exit(1)
}
