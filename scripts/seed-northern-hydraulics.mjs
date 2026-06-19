/**
 * SAMPLE / TEST — Northern Hydraulics hub-and-spoke case studies.
 *
 * One named caseStudyClient + a full-engagement ANCHOR (Full Growth Ownership)
 * + four discipline CUTS (web dev, AI search, editorial, outbound). Each study
 * headlines ONLY the metric its discipline produced, so credit is never
 * double-counted (the qualified-lead growth lives on the anchor alone).
 *
 * createOrReplace on NH-prefixed _ids only — non-destructive to other docs.
 * Run: node scripts/seed-northern-hydraulics.mjs
 *
 * ⚠ SAMPLE: numbers are representative placeholders. Replace with NH's real
 *   figures and confirm written naming consent before publishing as "named".
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const env = {}
for (const line of readFileSync(resolve(process.cwd(), '.env.local'), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}
const pid = env.NEXT_PUBLIC_SANITY_PROJECT_ID
const ds = env.NEXT_PUBLIC_SANITY_DATASET
const tok = env.SANITY_API_WRITE_TOKEN
const ver = env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2026-05-19'
if (!pid || !ds || !tok) {
  console.error('Missing Sanity env (project id / dataset / write token) in .env.local')
  process.exit(1)
}

let n = 0
const key = () => `nh${(++n).toString(36)}`
const tidy = (s) => s.replace(/'/g, '’') // straight apostrophe → curly, to match the site
function block(text) {
  const children = []
  for (const part of tidy(text).split(/(\*\*[^*]+\*\*)/)) {
    if (!part) continue
    if (part.startsWith('**') && part.endsWith('**')) {
      children.push({ _type: 'span', _key: key(), text: part.slice(2, -2), marks: ['strong'] })
    } else {
      children.push({ _type: 'span', _key: key(), text: part, marks: [] })
    }
  }
  return { _type: 'block', _key: key(), style: 'normal', children, markDefs: [] }
}
const pt = (...paras) => paras.map(block)
const stat = (value, label) => ({ _type: 'statItem', _key: key(), value, label: tidy(label) })
const phase = (title, detail, timeframe) => ({
  _type: 'approachPhase', _key: key(), title: tidy(title), detail: tidy(detail),
  ...(timeframe ? { timeframe } : {}),
})
const method = (metric, m) => ({ _type: 'methodologyItem', _key: key(), metric: tidy(metric), method: tidy(m) })
const quote = (text, role) => ({ text: tidy(text), role: tidy(role) })
const ref = (id) => ({ _type: 'reference', _ref: id })
const slug = (s) => ({ _type: 'slug', current: s })

const SAMPLE_NOTE =
  'SAMPLE/TEST for the hub-and-spoke structure. Numbers are representative placeholders — replace with Northern Hydraulics’ real figures. Confirm written naming consent before publishing as "named". Likely the same client as the existing anonymized "Industrial hydraulics distributor" studies; decide whether to consolidate.'

const client = {
  _id: 'caseStudyClient-northern-hydraulics',
  _type: 'caseStudyClient',
  name: 'Northern Hydraulics',
  publicName: 'Northern Hydraulics',
  descriptor: 'Industrial hydraulics distributor',
  industry: 'Industrial distribution · fluid power',
  scale: '~8,500 SKUs',
  internalNotes: SAMPLE_NOTE,
}

const studies = [
  // ── ANCHOR · Full engagement ──────────────────────────────────────────
  {
    _id: 'caseStudy-nh-anchor',
    _type: 'caseStudy',
    title: '1,840 to 2,640 qualified leads a month.',
    titleMuted: 'The full-stack rebuild behind it.',
    slug: slug('northern-hydraulics-full-engagement'),
    client: ref('caseStudyClient-northern-hydraulics'),
    primaryService: 'fullgrowth',
    supportingServices: ['dev', 'search', 'editorial', 'outbound'],
    engagementRole: 'anchor',
    summary:
      'Northern Hydraulics is an industrial hydraulics distributor — ~8,500 SKUs of JIC/NPT fittings, adapters, and assemblies sold to engineers and MRO buyers. Over a three-year relationship (2022–2025) we ran the whole growth function: brand and design, a Magento 1 to headless replatform, AI-search and technical SEO, an AI-assisted catalog rewrite, pillar content, paid ads, and cold outbound. Qualified leads went from 1,840 to 2,640 a month, up 43.5%.',
    engagementWindow: '2022 – 2025',
    durationLabel: '3-year relationship',
    situation: pt(
      "Northern Hydraulics had a real business and a website that worked against it. They carried **~8,500 SKUs across 150+ categories** and sold to people who knew exactly what thread and pressure rating they needed. The site was Magento 1: slow, past end-of-life, and impossible to extend. Category pages took seconds to load. Most product pages had a part number and almost no usable copy.",
      "The buyers were already searching. They just weren't finding Northern Hydraulics. Manufacturers and a handful of larger distributors owned the category terms, and the answer engines were starting to cite those same names. Inbound sat at **1,840 qualified leads a month** and had been flat for a year. They didn't want five vendors and a project manager to coordinate them. They wanted one team to own the number.",
    ),
    constraint: pt(
      "Everything depended on the rebuild, and the rebuild couldn't break the catalog. **8,500 live SKUs** had to come off Magento 1 with URLs, part data, and search intent intact, while the site stayed open for orders. SEO, content, and ads all had to wait on infrastructure that didn't exist yet, then move fast once it did. And the product copy that AI search and editorial needed at scale didn't exist. Most pages were a part number and a price.",
    ),
    approach: [
      phase('Brand and replatform', 'Rebuilt the brand and design system, then moved all 8,500 SKUs off Magento 1 onto a headless stack, schema-complete from day one. Category-browse and product pages were rebuilt for speed and for machine readability.', '2022 · ~6-month build'),
      phase('Catalog rewrite at scale', 'Ran an AI-assisted rewrite of the product catalog — specs, fitment, and use language on pages that had carried a part number and nothing else — so both buyers and answer engines had something to read.', '2022 – 2023'),
      phase('AI-search and editorial', 'Layered technical and AI-search SEO onto the clean build, then published pillar and category content aimed at the questions buyers actually ask. Targeted the terms manufacturers had owned.', '2023 – 2024'),
      phase('Paid and outbound', 'Added paid ads against high-intent commercial queries and cold outbound to a built distributor and OEM list on engineered sender reputation. Both fed the same qualified-lead pipeline.', '2024 – 2025'),
    ],
    mechanism: pt(
      "One team owned the whole chain, so each discipline made the next one cheaper. The replatform shipped schema and fast, readable pages. That gave AI-search something clean to cite and gave editorial a structure to plug pillar pages into. The catalog rewrite turned 8,500 thin pages into pages worth ranking and worth quoting. None of those steps works in isolation. Pillar content with no schema doesn't get cited. A fast site with empty product pages has nothing to say.",
      'Because the same team ran ads and outbound on top of that foundation, demand capture sat on real inventory of indexed, citable pages instead of fighting a broken site. Coordination was the product. No handoffs between agencies, no waiting on a third party to ship a schema change before content could move. The lead number moved because every input pointed at the same pipeline.',
    ),
    resultsNarrative: pt(
      "It was slow before it was fast. The first six months were almost entirely the rebuild, and the lead number didn't move during it. Replatforming 8,500 SKUs without breaking the catalog is not a quarter where inbound jumps. Through 2023 the early lift came from the rebuilt category pages and the catalog rewrite getting indexed, not from any single campaign.",
      'The compounding showed up in 2024. AI-search citations, pillar content, ads, and outbound all started feeding the same pipeline at once, and the curve steepened. By the close of the engagement, qualified leads had grown from 1,840 to **2,640 a month, a 43.5% increase**, with no single channel carrying it. Each discipline’s result is written up in its own cut below (the citations, the replatform, the editorial sessions, the outbound reply rate), so no number is counted twice.',
    ),
    keyMetric: { prefix: '+', value: '43.5', unit: '%', label: 'Qualified leads a month, across the full engagement', sourceLine: '2022 – 2025 · client CRM' },
    stats: [
      stat('1,840 → 2,640', 'Qualified leads a month over the engagement'),
      stat('+800', 'Additional qualified leads a month'),
      stat('5', 'Disciplines run by one team: design, dev, AI search, content, outbound'),
      stat('3 yrs', 'One coordinated growth function, 2022–2025'),
    ],
    quote: quote("We stopped managing vendors and started looking at one number. When the site, the content, the ads, and the outbound are run by the same people, you can actually tell what's working.", 'VP of Sales, Northern Hydraulics'),
    methodology: [
      method('Qualified leads 1,840 to 2,640 / month (+43.5%)', "Qualified inbounds counted in the client's CRM, monthly aggregate. Baseline = 2022 monthly average before the rebuild; end = final quarter of 2025. “Qualified” uses the client's own lead definition, held constant across the window."),
      method('Channel attribution', 'Leads tagged by source in the CRM (organic, AI-referred, paid, outbound reply). No single channel exceeds the growth on its own; the headline is the coordinated total, not a sum of channel claims.'),
    ],
    disclosure: 'named',
    featured: false,
    publishedAt: '2026-06-18T09:00:00Z',
    seo: {
      metaTitle: 'Northern Hydraulics: a full-stack rebuild, +43.5% qualified leads',
      metaDescription: 'Three years, one team: brand, a Magento 1 → headless replatform, AI-search, catalog rewrite, editorial, ads, and outbound took Northern Hydraulics from 1,840 to 2,640 qualified leads a month.',
    },
    internalNotes: `${SAMPLE_NOTE} ANCHOR — owns the qualified-lead number only; discipline metrics live on the cuts.`,
  },

  // ── CUT · Web development ──────────────────────────────────────────────
  {
    _id: 'caseStudy-nh-dev',
    _type: 'caseStudy',
    title: '8,500 SKUs off Magento 1,',
    titleMuted: 'onto a storefront AI can read.',
    slug: slug('northern-hydraulics-headless-replatform'),
    client: ref('caseStudyClient-northern-hydraulics'),
    primaryService: 'dev',
    supportingServices: ['search'],
    engagementRole: 'cut',
    summary:
      "Northern Hydraulics ran an 8,500-SKU catalog on Magento 1, which hit end-of-life with no security patches and product markup AI search engines couldn't parse. Over 6 months we replatformed the whole catalog to a headless Next.js storefront on Shopify Hydrogen, schema-complete from day one, and carried the JIC/NPT spec quote flow across intact. Mobile category-browse INP dropped from 600ms+ to under 200ms. This was the web-dev cut of the full engagement; the qualified-lead growth is reported on the anchor study.",
    engagementWindow: '2022',
    durationLabel: '6-month build',
    situation: pt(
      'Northern Hydraulics sold **8,500 SKUs across 150+ categories** of JIC and NPT hydraulic fittings, adapters, and assemblies to engineers and MRO buyers. The whole storefront ran on **Magento 1**, which reached end-of-life in 2020 and stopped getting security patches years before we touched it.',
      "Two things forced the rebuild. The platform was a standing liability with no vendor support. And the product markup was a mess of legacy templates AI search engines couldn't read, so the catalog was invisible to the engines that were starting to answer buyers' spec questions directly. On top of that, **mobile category-browse INP sat above 600ms**, and the lag landed right on the add-to-cart tap.",
    ),
    constraint: pt(
      "The catalog wasn't a set of marketing pages. It was a working quote tool. Engineers filtered by thread spec, seal type, pressure rating, and material, then built multi-line quote requests by JIC/NPT spec. All of that logic had to survive the move to a new stack with **zero data loss across 8,500 SKUs**, and the site had to stay live and selling the entire **6 months**.",
    ),
    approach: [
      phase('Audit and data model', 'Pulled the full 8,500-SKU catalog out of Magento 1, mapped every attribute (thread spec, seal, pressure rating, material), and designed a clean product schema with Product and Offer structured data baked into the model, not bolted on later.', 'Weeks 1–4'),
      phase('Headless build', 'Built the storefront in Next.js against Shopify Hydrogen for catalog, cart, and checkout. Rebuilt category browse and faceted filtering as server-rendered routes so spec filtering stayed fast on mobile.', 'Weeks 3–14'),
      phase('Quote flow carryover', "Ported the JIC/NPT spec quote flow line for line: filter to part, add by spec, build a multi-line quote request. Matched the old field logic so buyers didn't have to relearn it.", 'Weeks 10–18'),
      phase('Cutover and hardening', 'Ran the new storefront in parallel, validated all 8,500 SKUs and their schema, set 301s off every Magento URL, then cut DNS over. Tuned INP on category-browse interactions before and after launch.', 'Weeks 18–26'),
    ],
    mechanism: pt(
      'Headless split the problem in two. Shopify Hydrogen handled catalog, cart, and checkout as a system a vendor patches, which retired the Magento 1 security risk outright. Next.js handled rendering, so we could server-render category and product pages and ship structured data as part of every page instead of injecting it after load.',
      'The INP win came from moving filtering and add-to-cart off a heavy client bundle. On Magento 1, a category tap fired a full client round-trip, and the **600ms+** delay was the page rebuilding itself in the browser. Server-rendered routes with a thin interaction layer cut the main-thread work, so tap-to-response dropped **under 200ms**. Schema-complete from day one meant the AI-search and catalog work that came later had clean, machine-readable pages to build on.',
    ),
    resultsNarrative: pt(
      '**All 8,500 SKUs moved off Magento 1 to the headless Next.js + Shopify Hydrogen build in 6 months, schema-complete from day one, with mobile category-browse INP down from 600ms+ to under 200ms.** The JIC/NPT spec quote flow carried across with no loss of function, and the Magento 1 security liability was gone at cutover.',
      "It wasn't clean the whole way. The first cutover rehearsal surfaced ~120 SKUs with malformed legacy attributes that broke schema validation, so we held DNS for two weeks to fix the data rather than ship broken markup. This build is the foundation the AI-search and catalog growth compounded on. Those gains, and the qualified-lead growth, are reported on the anchor and AI-search studies, not here.",
    ),
    keyMetric: { value: '8,500', label: 'SKUs replatformed off Magento 1', sourceLine: '6 months · schema-complete from day one' },
    stats: [
      stat('8,500', 'SKUs replatformed off Magento 1 in 6 months'),
      stat('<200ms', 'Mobile category-browse INP, down from 600ms+'),
      stat('Day 1', 'Schema-complete: Product/Offer markup on every URL'),
      stat('0', 'Data loss across the JIC/NPT spec quote flow'),
    ],
    quote: quote('The platform stopped being a risk we talked about every quarter. And the catalog finally browses fast on a phone, which is where half our buyers actually are.', 'VP of E-commerce, Northern Hydraulics'),
    methodology: [
      method('8,500 SKUs replatformed, schema-complete', "Counted against the Magento 1 product export reconciled at cutover; schema completeness validated SKU-by-SKU through Google's Rich Results Test and a crawl checking Product/Offer markup on every product URL before DNS cutover."),
      method('Mobile category-browse INP 600ms+ to under 200ms', 'INP measured on category-browse and filter interactions via Chrome DevTools and field CrUX data, mobile profile. Baseline taken on the live Magento 1 site; post figure on the Hydrogen build at the 24-week mark.'),
      method('JIC/NPT quote flow carried across', 'Validated by replaying a fixed set of representative quote-build journeys (filter by spec, add multi-line, submit) against both old and new stacks and diffing the resulting quote payloads.'),
    ],
    disclosure: 'named',
    featured: false,
    publishedAt: '2026-06-18T08:00:00Z',
    seo: {
      metaTitle: 'Northern Hydraulics: 8,500-SKU headless replatform off Magento 1',
      metaDescription: 'Magento 1 EOL, schema AI engines couldn’t read, 600ms+ INP. Six months later: a headless Next.js + Shopify Hydrogen storefront, schema-complete from day one, INP under 200ms.',
    },
    internalNotes: `${SAMPLE_NOTE} WEB-DEV CUT — owns the build (SKUs, INP, schema) only; never the leads or citations.`,
  },

  // ── CUT · AI Search ────────────────────────────────────────────────────
  {
    _id: 'caseStudy-nh-search',
    _type: 'caseStudy',
    title: '4 to 34 AI-Overview citations',
    titleMuted: 'on the top 50 commercial queries.',
    slug: slug('northern-hydraulics-ai-search-citations'),
    client: ref('caseStudyClient-northern-hydraulics'),
    primaryService: 'search',
    supportingServices: ['catalog'],
    engagementRole: 'cut',
    summary:
      'Northern Hydraulics is an industrial hydraulics distributor with ~8,500 SKUs. On the top 50 commercial queries, AI Overviews were citing its manufacturers, not its own pages, so it sat in AI answers exactly 4 times. Six months of product-schema and answer-shaped page work took that to 34 AIO citations (×8.5), making the distributor the citable source instead of its suppliers.',
    engagementWindow: '2023',
    durationLabel: '6 months',
    situation: pt(
      'Northern Hydraulics sells hydraulic fittings, adapters, and assemblies. JIC, NPT, the full lineup. Roughly 8,500 SKUs across 150-plus categories, sold to engineers and MRO buyers. The site ranked fine in the classic blue links. But the engineering queries that used to land on its category pages were getting answered above those links, inside AI Overviews.',
      'On the **top 50 commercial queries**, Northern Hydraulics showed up in AI Overview responses exactly **four times**. The citations went to the **manufacturers** instead. Their spec sheets were the cleanest structured source around, so the engines pulled from them and named them. A distributor sat downstream of its own suppliers in the one place buyers were now reading first.',
    ),
    constraint: pt(
      "The manufacturers had the structural advantage by default. Their product data was machine-clean. Northern Hydraulics ran the same manufacturer-supplied descriptions every competitor used, with product schema full of gaps. Engines had no reason to pick the distributor's page over the source it was quoting from. To get cited, the catalog had to give the engines something better to assemble an answer from than a spec sheet. And it had to do that across **8,500 SKUs**, not a handful of hero pages.",
    ),
    approach: [
      phase('Product schema rewrite', "Full structured-data rebuild across the ~8,500-SKU catalog — product, offer, and spec properties exposed at a depth that gave engines a complete, parseable source at the distributor level.", 'Months 1–2'),
      phase('Answer-shaped category pages', 'Reworked 150+ category pages so the answer sat up top: direct-answer blocks, spec tables a machine can read, and manufacturer spec data folded in alongside stock, pricing, and cross-compatibility the manufacturer page never carries.', 'Months 2–4'),
      phase('Engineering-query answer hubs', 'Dedicated hubs for the questions buyers actually type — thread identification, pressure ratings, sizing, JIC-to-NPT conversion — written to be the citable source AI Overviews assemble answers from.', 'Months 3–6'),
      phase('Citation tracking from day one', 'Tracked the top 50 commercial queries against AI Overview responses every week, watching which pages got named so the next round of work targeted the gaps still going to manufacturers.', 'Months 1–6'),
    ],
    mechanism: pt(
      "AI engines cite whichever page makes the answer easiest to assemble. The manufacturers won because their spec data was structured and the distributor's was not. The schema rewrite closed that gap, and the answer-shaped pages went one better. They carried the spec data plus the things a manufacturer page never has: live stock, pricing, cross-compatibility, and the application context an engineer is actually asking about.",
      'So when an engine built an answer to a thread-sizing or pressure-rating query, Northern Hydraulics now held the more complete, more citable source. The citations moved from the supplier to the distributor. That visibility is what fed the qualified-lead growth, which is reported on the full-engagement anchor study. This cut claims the AI-search visibility only.',
    ),
    resultsNarrative: pt(
      'The shift was gradual, not a step change. The schema work shipped first and citations barely moved for weeks, because engines re-crawl and re-evaluate on their own clock. The slope picked up once the restructured category pages and answer hubs went live and the engines had a better source to pull from. **Across the top 50 commercial queries, AI Overview citations went from 4 to 34 over six months. ×8.5.**',
      "Some queries stayed with the manufacturers, usually where the question was about a raw spec the manufacturer genuinely owns. Most of the gain came on application and selection queries (sizing, compatibility, identification) where the distributor's added context made it the better thing to cite. This cut is one part of the full Northern Hydraulics engagement. The qualified-lead growth that visibility helped drive is claimed on the anchor study, not here.",
    ),
    keyMetric: { prefix: '×', value: '8.5', label: 'AI-Overview citations, top 50 commercial queries', sourceLine: '4 → 34 · 6-month engagement' },
    stats: [
      stat('4 → 34', 'AI Overview citations on the top 50 commercial queries'),
      stat('×8.5', 'Growth in AIO citations over the six-month window'),
      stat('50', 'Top commercial queries tracked weekly'),
      stat('~8,500', 'SKUs covered by the product-schema rewrite'),
    ],
    quote: quote('AI Overviews used to send our buyers straight to the manufacturer. Now the answer cites us, and the engineer who clicks through already knows what they need.', 'Operations Director, Northern Hydraulics'),
    methodology: [
      method('AIO citations 4 → 34', 'A fixed set of the top 50 commercial queries, checked weekly against live AI Overview responses with a citation tracker. A citation counts when an AI Overview answer names or links a Northern Hydraulics page. Baseline 4 is the month-one actual on that query set, before any schema work shipped; 34 is the six-month read on the same 50 queries.'),
      method('×8.5', '34 ÷ 4 on the identical query set, start to end of the six-month window. Same queries, same definition of a citation throughout — no change to the tracked set mid-engagement.'),
    ],
    disclosure: 'named',
    featured: false,
    publishedAt: '2026-06-18T07:00:00Z',
    seo: {
      metaTitle: 'Northern Hydraulics: AI-Overview citations 4 → 34 (×8.5)',
      metaDescription: 'AI Overviews were citing Northern Hydraulics’ manufacturers, not the distributor. A schema rewrite + answer-shaped pages made it the citable source: 4 → 34 citations on the top 50 commercial queries.',
    },
    internalNotes: `${SAMPLE_NOTE} AI-SEARCH CUT — owns the AIO-citation number only; the lead growth is on the anchor.`,
  },

  // ── CUT · Editorial ────────────────────────────────────────────────────
  {
    _id: 'caseStudy-nh-editorial',
    _type: 'caseStudy',
    title: 'Pillar content that out-writes the manufacturers.',
    titleMuted: 'Informational sessions, doubled.',
    slug: slug('northern-hydraulics-editorial-authority'),
    client: ref('caseStudyClient-northern-hydraulics'),
    primaryService: 'editorial',
    engagementRole: 'cut',
    summary:
      "Editorial cut of the Northern Hydraulics engagement (2022–2025). Over six months, senior subject-matter pillar-and-cluster content on the core fitting categories roughly doubled organic sessions from informational and pillar pages, and pushed Northern's pillars to the top of AI-Overview answers for six category terms the manufacturers used to own. This was one discipline inside the full engagement; the qualified-lead growth is reported on the anchor study.",
    engagementWindow: '2023 – 2024',
    durationLabel: '6 months',
    situation: pt(
      "Northern Hydraulics sells JIC and NPT fittings, adapters, and assemblies to engineers and MRO buyers. They had ~8,500 SKUs across 150+ categories and almost no editorial layer. A buyer searching how to size a JIC swivel or why an NPT seal weeps landed on a manufacturer's page. Northern wasn't in that conversation. The distributor was invisible at the question stage.",
      'When we picked up content, the catalog rebuild was already in flight and the SKU pages were getting structured. What was missing was the layer above the SKUs: the reference content engineers read before they buy. We set a baseline. **Informational and pillar pages drove a small, flat slice of organic sessions**, and on six core category terms the top AI-Overview answers cited the manufacturers rather than the distributor selling the part.',
    ),
    constraint: pt(
      "Hydraulic fitting content is unforgiving. Get a thread callout or a pressure rating wrong and an engineer leaves and doesn't come back. That ruled out LLM ghostwriting, which produces fluent copy that is confidently wrong on dash sizes and seal materials. Every pillar had to be written or closely directed by someone who knew the parts, then checked against spec. Slower to produce, and the only way the pages would hold up to the audience reading them.",
    ),
    approach: [
      phase('Map the category questions', 'Pulled the real questions engineers and MRO buyers ask across the core fitting categories, then mapped each to a pillar page with its supporting cluster. Chose six category terms where manufacturers held the AI-Overview answer and Northern could outwrite them.', 'Weeks 1–4'),
      phase('Write the pillars, senior-led', 'Subject-matter writers produced the pillar pages on JIC and NPT selection, sizing, and failure modes. No LLM ghostwriting. Each page checked against spec tables before publish.', 'Weeks 3–16'),
      phase('Build the clusters', 'Wrote the supporting cluster articles under each pillar and internally linked them into the matching catalog categories, so a question page led to the parts that answer it.', 'Weeks 8–22'),
      phase('Measure and re-cut', 'Tracked sessions per pillar and AI-Overview answer placement on the six target terms, then revised the pages that under-indexed and expanded the clusters that pulled.', 'Weeks 16–26'),
    ],
    mechanism: pt(
      "Manufacturers write spec sheets. They don't answer the buyer's actual question, which is usually a sizing, compatibility, or failure question with a part at the end of it. A distributor that answers the question well, and links straight to the part, is a better result for that query than a PDF datasheet. That is why the pillars could displace manufacturer pages in AI-Overview answers on category terms. The page was simply more useful to the person asking.",
      'Senior-led writing is what made it hold. Engineers can tell within a paragraph whether the author has handled the part. Pages that read as correct earned the dwell time and the links, and AI-Overview systems pulled from the pages that read as authoritative. The catalog rebuild gave these pages clean SKUs to point at, so the editorial layer compounded with the build instead of sitting beside it.',
    ),
    resultsNarrative: pt(
      'Over six months, **organic sessions from informational and pillar pages roughly doubled (×2)**. The curve was not linear. The first pillars sat for several weeks before they indexed and began to pull, which is normal for new reference content, and the cluster pages lagged the pillars they hung under. The second half of the window is where most of the gain landed.',
      "On the six category terms we targeted, Northern's pillar pages now top the AI-Overview answers, displacing the manufacturer pages that used to own them. This study claims the content output only. The overall qualified-lead growth and the AI-search citation count across the top commercial queries are reported on the anchor and AI-search cuts of the same engagement, so no number is counted twice.",
    ),
    keyMetric: { prefix: '×', value: '2', label: 'Organic sessions from informational & pillar pages', sourceLine: '6-month pillar-and-cluster build' },
    stats: [
      stat('×2', 'Organic sessions from informational and pillar pages'),
      stat('6', 'Category terms where the pillars now top the AI-Overview answer'),
      stat('0', 'Pages LLM-ghostwritten; senior subject-matter authored'),
      stat('6 mo', 'Pillar-and-cluster build on the core fitting categories'),
    ],
    quote: quote('These read like our senior people wrote them, because effectively they did. We stopped sending buyers to the manufacturers to get their questions answered.', 'Head of E-commerce, Northern Hydraulics'),
    methodology: [
      method('Organic sessions from informational/pillar pages roughly doubled (×2)', 'Google Analytics + Search Console, organic-only, filtered to the pillar and cluster URL set. Baseline is the 30-day average before the first pillar published; comparison is the same page set at the 6-month mark.'),
      method('6 category terms where pillar pages now top the AI-Overview answer', "Bi-weekly AI-Overview answer checks on the six target category terms. Baseline at kickoff recorded the manufacturer page as the cited source; re-checked at month 6 with Northern's pillar as the top-cited answer."),
    ],
    disclosure: 'named',
    featured: false,
    publishedAt: '2026-06-18T06:00:00Z',
    seo: {
      metaTitle: 'Northern Hydraulics: pillar content that doubled informational sessions',
      metaDescription: 'Senior-authored pillar-and-cluster content on the core fitting categories doubled organic sessions from informational pages and took six category terms to the top of AI-Overview answers.',
    },
    internalNotes: `${SAMPLE_NOTE} EDITORIAL CUT — owns the content output (doubled sessions, 6 terms) only.`,
  },

  // ── CUT · Outbound email ───────────────────────────────────────────────
  {
    _id: 'caseStudy-nh-outbound',
    _type: 'caseStudy',
    title: 'A 12% reply rate to a cold distributor list.',
    titleMuted: 'Deliverability, engineered first.',
    slug: slug('northern-hydraulics-outbound-email'),
    client: ref('caseStudyClient-northern-hydraulics'),
    primaryService: 'outbound',
    engagementRole: 'cut',
    summary:
      'Cold outbound email to a built list of hydraulics distributors and OEM buyers, run over 8 weeks as one part of the full Northern Hydraulics engagement. Deliverability came first: SPF, DKIM, and DMARC set up, sending domains warmed, then a tight 5-touch sequence to a researched list. The list returned a 12% reply rate.',
    engagementWindow: '2024',
    durationLabel: '8 weeks',
    situation: pt(
      'Northern Hydraulics sells JIC and NPT fittings, adapters, and assemblies to engineers and MRO buyers. The buying side is concentrated: a known set of distributors and OEM accounts, most of whom already buy hydraulic fittings from someone. Reaching them by email is easy to attempt and easy to get wrong.',
      'Their prior attempts at cold email had gone straight to spam. No SPF or DKIM alignment, no DMARC policy, a cold primary domain sending hundreds a day. We started this cut with deliverability at zero and a target of a **12% reply rate** from a built list, measured over an **8-week** window. The qualified-lead growth from the wider program is reported on the anchor study, not here.',
    ),
    constraint: pt(
      "Cold B2B email to industrial buyers fails on two axes at once. It lands in spam, or it lands in the inbox and reads like every other vendor blast. Fixing deliverability is plumbing work with no shortcut. Domains warm on their own clock, and reputation is unforgiving once burned. We had **8 weeks** and couldn't torch the sending domains on volume.",
    ),
    approach: [
      phase('Authentication and sender setup', 'Stood up SPF, DKIM, and DMARC on separate sending domains kept off the primary corporate domain. Set DMARC to monitor first, then enforce, so a misconfiguration could not silently tank delivery.', 'Weeks 1–2'),
      phase('Warm the domains', 'Ramped send volume slowly across warmed inboxes, seeding real replies and engagement before any cold send went out. Held daily volume per inbox low until placement tests landed in the inbox, not spam.', 'Weeks 2–4'),
      phase('Build and research the list', "Built a list of distributors and OEM buyers, verified every address, and removed catch-all and risky domains. Researched each account so the first line referenced the buyer's real product lines, not a mail-merge token.", 'Weeks 3–5'),
      phase('Run the 5-touch sequence', 'Shipped a 5-email sequence: a specific opener, two short follow-ups, a value touch with a catalog reference, and a clean break-up. Plain text, one ask, no images or tracking pixels that trip filters.', 'Weeks 5–8'),
    ],
    mechanism: pt(
      'Reply rate on cold email is mostly a deliverability problem wearing a copywriting costume. If the message never reaches the inbox, the best copy in the world replies to no one. Getting SPF, DKIM, and DMARC aligned, then warming the domains slowly, meant the sequence landed in front of buyers instead of dying in a spam folder.',
      "The second half was relevance. A researched list and a first line that named the buyer's own product lines turned a cold send into something that read like it was meant for one person. Industrial buyers reply when an email proves the sender knows what they stock. Five touches gave the message enough chances to catch someone at the right moment without becoming noise.",
    ),
    resultsNarrative: pt(
      'Over the 8-week window the sequence returned a **12% reply rate** from cold outbound to the built distributor and OEM list. The first two weeks produced almost nothing, by design. Nobody cold-emails during domain warmup. Replies started landing in week 5 once the sequence went live on domains that were already trusted.',
      "Not every reply was a yes. The 12% includes referrals, not-now responses, and unsubscribes handled cleanly to protect sender reputation for the next cycle. The point of this cut was a list that reaches the inbox and earns answers. Whether those conversations became qualified leads is counted once, on the anchor study, so the credit isn't double-claimed.",
    ),
    keyMetric: { value: '12', unit: '%', label: 'Reply rate, cold outbound to a built distributor list', sourceLine: '8-week run · engineered sender reputation' },
    stats: [
      stat('12%', 'Reply rate from cold outbound to the built list'),
      stat('5', 'Touches per sequence, plain text, one ask each'),
      stat('3/3', 'SPF, DKIM, DMARC aligned before the first cold send'),
      stat('8 weeks', 'From zero deliverability to a sequence returning replies'),
    ],
    quote: quote("First cold campaign we have run that didn't end up in spam. The replies actually came from buyers who stock what we sell.", 'VP of Sales, Northern Hydraulics'),
    methodology: [
      method('12% reply rate', 'Replies divided by unique recipients delivered, tracked in the outbound sending platform over the 8-week run. Bounces and undeliverables excluded from the denominator; auto-replies and out-of-office excluded from the numerator.'),
      method('Deliverability / inbox placement', 'SPF, DKIM, and DMARC alignment verified per domain; inbox-versus-spam placement confirmed with seed-list tests before and during the warmup ramp.'),
    ],
    disclosure: 'named',
    featured: false,
    publishedAt: '2026-06-18T05:00:00Z',
    seo: {
      metaTitle: 'Northern Hydraulics: 12% reply rate from cold outbound',
      metaDescription: 'Deliverability first — SPF/DKIM/DMARC, warmed domains — then a 5-touch sequence to a researched distributor list returned a 12% reply rate over 8 weeks.',
    },
    internalNotes: `${SAMPLE_NOTE} OUTBOUND CUT — owns the reply rate only; never the leads or citations.`,
  },
]

const mutations = [client, ...studies].map((doc) => ({ createOrReplace: doc }))

const res = await fetch(`https://${pid}.api.sanity.io/v${ver}/data/mutate/${ds}?returnIds=true`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` },
  body: JSON.stringify({ mutations }),
})
const json = await res.json()
if (!res.ok) {
  console.error('seed failed:', JSON.stringify(json, null, 2))
  process.exit(1)
}
console.log(`Seeded Northern Hydraulics: 1 client + ${studies.length} studies (1 anchor + ${studies.length - 1} cuts):`)
for (const r of json.results ?? []) console.log(`  ${r.operation} ${r.id}`)
