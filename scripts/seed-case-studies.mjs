/**
 * Seed canonical case-study content into Sanity.
 *
 * Usage: node scripts/seed-case-studies.mjs
 *
 * Reads NEXT_PUBLIC_SANITY_PROJECT_ID / NEXT_PUBLIC_SANITY_DATASET /
 * SANITY_API_WRITE_TOKEN from .env.local and createOrReplace-es documents
 * with stable _ids, so re-running is idempotent. Uses the Sanity HTTP
 * mutate API directly — no package imports needed under pnpm.
 *
 * CONTENT PROVENANCE: every number below is consolidated from the
 * hardcoded sections that already shipped (Evidence.tsx,
 * CatalogCaseStudyCallout.tsx, EditorialCaseStudy.tsx, PortfolioGrid.tsx).
 * Contradictions between those copies were resolved toward the committed,
 * mutually-consistent set; every resolution and open question is recorded
 * in each document's `internalNotes` field for editorial review in Studio.
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// ── Env ─────────────────────────────────────────────────────────────────
const envFile = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8')
const env = {}
for (const line of envFile.split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}

const projectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = env.NEXT_PUBLIC_SANITY_DATASET
const token = env.SANITY_API_WRITE_TOKEN
const apiVersion = env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2026-05-19'

if (!projectId || !dataset || !token) {
  console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID / NEXT_PUBLIC_SANITY_DATASET / SANITY_API_WRITE_TOKEN in .env.local')
  process.exit(1)
}

// ── Portable-text helpers ───────────────────────────────────────────────
let keyCounter = 0
const key = () => `seed${(++keyCounter).toString(36)}`

/** One paragraph block. Supports **bold** spans via simple split. */
function block(text) {
  const children = []
  const markDefs = []
  for (const part of text.split(/(\*\*[^*]+\*\*)/)) {
    if (!part) continue
    if (part.startsWith('**') && part.endsWith('**')) {
      children.push({ _type: 'span', _key: key(), text: part.slice(2, -2), marks: ['strong'] })
    } else {
      children.push({ _type: 'span', _key: key(), text: part, marks: [] })
    }
  }
  return { _type: 'block', _key: key(), style: 'normal', children, markDefs }
}

const pt = (...paras) => paras.map(block)
const stat = (value, label) => ({ _type: 'statItem', _key: key(), value, label })
const phase = (title, detail, timeframe) => ({
  _type: 'approachPhase',
  _key: key(),
  title,
  detail,
  ...(timeframe ? { timeframe } : {}),
})
const method = (metric, m) => ({ _type: 'methodologyItem', _key: key(), metric, method: m })
const point = (label, value) => ({ _type: 'chartPoint', _key: key(), label, value })
const ref = (id) => ({ _type: 'reference', _ref: id })
const slug = (s) => ({ _type: 'slug', current: s })

// ── Clients ─────────────────────────────────────────────────────────────
const clients = [
  {
    _id: 'caseStudyClient-hydraulics',
    _type: 'caseStudyClient',
    name: 'Hydraulics distributor — flagship engagement (set real internal name)',
    descriptor: 'Industrial hydraulics distributor',
    industry: 'Industrial distribution · fluid power',
    scale: '~8,500 SKUs',
    internalNotes:
      'IMPORTANT — naming hazard documented before this content model existed: the v2-1 prototype names "Northern Hydraulics" and simultaneously calls it "a representative composite", while Northern Hydraulics is a REAL logo-strip client (lib/client-logos.ts) with a real site (northernhydraulics.net). Do not set publicName, and do not flip any of this client\'s case studies to "named", until it is confirmed which real client these engagements belong to and they have signed off. Set the real internal name here once confirmed.',
  },
  {
    _id: 'caseStudyClient-automation',
    _type: 'caseStudyClient',
    name: 'Automation distributor (set real internal name)',
    descriptor: 'Industrial automation distributor',
    industry: 'Industrial distribution · automation',
    scale: '~12K SKUs',
    internalNotes:
      'Source: EditorialCaseStudy.tsx. Note: "~12k SKUs" also describes the fasteners client — they are different companies; keep them straight when setting internal names.',
  },
  {
    _id: 'caseStudyClient-fasteners',
    _type: 'caseStudyClient',
    name: 'Fasteners distributor (set real internal name)',
    descriptor: 'Specialty fasteners distributor',
    industry: 'Industrial distribution · fasteners',
    scale: '12k SKUs · 17 brands',
    internalNotes: 'Source: PortfolioGrid.tsx Case 02.',
  },
  {
    _id: 'caseStudyClient-fluid-power',
    _type: 'caseStudyClient',
    name: 'Fluid power manufacturer (set real internal name)',
    descriptor: 'Fluid power manufacturer · OEM channel',
    industry: 'Manufacturing · fluid power',
    scale: '22k SKUs',
    internalNotes: 'Source: PortfolioGrid.tsx Case 04.',
  },
]

// ── Case studies ────────────────────────────────────────────────────────
const studies = [
  // ── A1 · Flagship: Catalog AI + AI Search ─────────────────────────────
  {
    _id: 'caseStudy-hydraulics-catalog',
    _type: 'caseStudy',
    title: '1,840 to 2,640 qualified leads a month.',
    titleMuted: 'No new ad spend.',
    slug: slug('hydraulics-distributor-catalog-ai-qualified-leads'),
    client: ref('caseStudyClient-hydraulics'),
    primaryService: 'catalog',
    supportingServices: ['search'],
    summary:
      'An ~8,500-SKU hydraulics distributor was stuck at 1,840 qualified inbounds a month. AI Overviews were citing its manufacturers, not its own category pages. Six months of catalog and AI-search work later, January closed at 2,640. That’s +43.5% over the August baseline, and we didn’t add a dollar of ad spend.',
    engagementWindow: 'Aug 2024 – Jan 2025',
    durationLabel: '6 months',
    situation: pt(
      'The client sells hydraulic fittings, adapters, and assemblies. Roughly 8,500 SKUs across 150-plus categories. By mid-2024, qualified inbounds had flattened at about **1,840 a month**, and the cost of buying growth back through paid search kept climbing.',
      'You could see why on the results page. AI Overviews had started answering the engineering queries that used to land on the client’s category pages, and they cited the **manufacturers** — whose spec sheets were the cleanest structured source around. In AI answers, a distributor sits downstream of its own suppliers until its catalog gives the engines something better to cite.',
    ),
    constraint: pt(
      'Most of the catalog copy was manufacturer-supplied. The same descriptions ran on every competitor’s site, and the product schema had gaps wide enough that engines had no reason to pick the client’s pages over the manufacturer’s. The brief had one hard line: **grow qualified inbounds without adding ad budget**. Whatever moved had to come from the catalog itself.',
    ),
    approach: [
      phase(
        'Product schema rewrite',
        'Full structured-data rebuild across the ~8,500-SKU catalog — product, offer, and spec properties at a depth manufacturer pages don’t expose at the distributor level.',
        'Months 1–2',
      ),
      phase(
        'Category pages restructured',
        '150+ category pages reworked for AI scannability: direct-answer blocks up top, spec tables machines can parse, manufacturer spec-sheet data integrated on top-volume SKUs.',
        'Months 2–4',
      ),
      phase(
        'Answer hubs for engineering queries',
        'Dedicated hubs for the questions buyers actually ask — sizing, pressure ratings, thread identification — built to be the citable source AI Overviews assemble answers from.',
        'Months 3–6',
      ),
      phase(
        'Paid stack tightened',
        'Existing PPC restructured around the queries organic now covered — same budget, narrower targeting. No new spend entered the account during the window.',
        'Ongoing',
      ),
    ],
    mechanism: pt(
      'AI engines cite whichever page makes the answer easiest to assemble. The manufacturers won by default because their spec data was structured. The schema rewrite handed that advantage to the distributor, which had the same specs plus stock, pricing, cross-compatibility, and the application context a manufacturer page never carries.',
      'Once the category pages and answer hubs gave the engines a better source, the citations followed. And the traffic those answers send arrives **pre-qualified**. An engineer who clicks through from a thread-sizing answer already knows what they need. That’s why the lead count climbed faster than raw sessions did.',
    ),
    resultsNarrative: pt(
      'It wasn’t a hockey stick. Month one added about 150 leads while the schema work shipped. The slope steepened in October as the restructured category pages took hold. **January closed at 2,640 qualified inbounds, +43.5% over the August baseline** — roughly 800 more a month, with paid budget flat the whole time.',
      'The chart shows the monthly counts straight from the client’s CRM. Qualified inbounds. Not impressions, not raw sessions.',
    ),
    keyMetric: {
      prefix: '+',
      value: '43.5',
      unit: '%',
      label: 'Qualified leads per month, on the August baseline',
      sourceLine: 'Aug 2024 – Jan 2025 · client CRM',
    },
    stats: [
      stat('1,840 → 2,640', 'Qualified leads per month over the six-month window'),
      stat('+800', 'Additional qualified inbounds per month by January'),
      stat('150+', 'Category pages restructured for AI scannability'),
      stat('~8,500', 'SKUs covered by the product schema rewrite'),
    ],
    chart: {
      title: 'Qualified leads · per month',
      source: 'Client’s CRM, anonymized · monthly aggregate of qualified inbounds',
      points: [
        point('Aug', 1840),
        point('Sep', 1990),
        point('Oct', 2210),
        point('Nov', 2360),
        point('Dec', 2480),
        point('Jan', 2640),
      ],
      annotations: [
        { _type: 'chartAnnotation', _key: key(), pointLabel: 'Sep', note: 'Schema shipped' },
        { _type: 'chartAnnotation', _key: key(), pointLabel: 'Oct', note: 'Category pages live' },
      ],
      yMin: 1500,
      yMax: 3000,
    },
    quote: {
      text: 'They rebuilt our product schema and rewrote our pillar pages so AI Overviews cite us instead of the manufacturer.',
      role: 'Operations Director',
    },
    methodology: [
      method(
        'Qualified leads / month',
        'Counted in the client’s CRM under its existing qualification rules — monthly aggregate of qualified inbounds. Baseline is the August 2024 actual (1,840), not a trailing average.',
      ),
      method(
        '+43.5%',
        '(2,640 − 1,840) ÷ 1,840 over the six-month window. No attribution model applied: the count is total qualified inbounds across channels, with paid budget held flat — which is what makes the delta attributable to the organic work.',
      ),
      method(
        'No new ad spend',
        'Paid budget held at the pre-engagement level for the full window. The PPC phase was a restructure of existing spend, not an increase.',
      ),
    ],
    disclosure: 'anonymized',
    featured: true,
    publishedAt: '2026-06-12T09:00:00Z',
    seo: {
      metaTitle: 'Case Study: +43.5% Qualified Leads for a Hydraulics Distributor',
      metaDescription:
        'How an ~8,500-SKU hydraulics distributor went from 1,840 to 2,640 qualified leads a month in six months — schema rewrite, 150+ category pages, answer hubs. No new ad spend.',
    },
    internalNotes:
      'CANONICAL VERSION of the flagship story. Numbers consolidated from Evidence.tsx and CatalogCaseStudyCallout.tsx (committed copies agree: 1,840→2,640, +43.5%, Aug 2024–Jan 2025, ~8,500 SKUs, 150+ category pages). CHANGES vs prior copy: (1) dropped the pull-quote sentence "Qualified leads doubled inside two quarters" — it contradicts +43.5% over the same window; the rest of the quote is kept verbatim. (2) The v2-1 prototype tells a variant of this story (late-2025 baseline, ×3.4 AIO citation share, 3-week catalog ship, composite disclosure) with numbers that do NOT reconcile with this one — decide which is canonical before linking both. (3) PhaseDetailedFramework.tsx relabels "43%" as a CTR badge — different metric, ignore. VERIFY: engagement window + CRM numbers against the retro; month-by-month chart values (committed in Evidence.tsx, provenance unstated); whether "anonymized" is the correct disclosure (if figures are actually aggregated across engagements, flip to "composite").',
  },

  // ── B · Editorial Authority ────────────────────────────────────────────
  {
    _id: 'caseStudy-automation-editorial',
    _type: 'caseStudy',
    title: '4 to 34 AI Overview citations in six months.',
    titleMuted: 'One Standard retainer.',
    slug: slug('automation-distributor-editorial-authority-aio-citations'),
    client: ref('caseStudyClient-automation'),
    primaryService: 'editorial',
    summary:
      'A mid-market automation distributor with ~12K SKUs was ranking well and still bleeding organic share, because AI Overviews were eating the click-through on informational queries. Six months on the Standard editorial retainer took its AI Overview citations on the top 50 commercial queries from 4 to 34. Organic leads from informational pages doubled.',
    engagementWindow: '2025',
    durationLabel: '6 months',
    situation: pt(
      'The client ranked where it needed to and watched click-through decay anyway. AI Overviews had started answering the informational queries that feed its commercial pages. Across its **top 50 commercial queries**, the client’s pages showed up in AI Overview responses exactly **four times**. The query spaces its category position should have owned were getting explained to its buyers by manufacturers instead.',
    ),
    constraint: pt(
      'The catalog was already in order. The gap was authority content, and the budget covered one retainer tier, not a content-team buildout. So the plan had to be narrow: **8 pieces and 1 pillar a month, on three product categories**, written by senior subject-matter writers. Spread thin across the whole catalog, it would have moved nothing.',
    ),
    approach: [
      phase(
        'Editorial retainer, Standard tier',
        '8 pieces + 1 pillar per month for six months, concentrated on three product categories instead of scattered across the site.',
        'Months 1–6',
      ),
      phase(
        'Pillar + cluster architecture',
        'Each category got a pillar built to be the citable explainer for its query space, with cluster pieces answering the long-tail engineering questions around it.',
        'Months 1–4',
      ),
      phase(
        'Citation tracking from week one',
        'AI Overview citation count on the top 50 commercial queries probed bi-weekly, so the content plan followed what engines actually started citing rather than an editorial calendar set in advance.',
        'Bi-weekly',
      ),
    ],
    mechanism: pt(
      'AI Overviews build answers from whatever looks like the category authority — depth, internal coherence, structure a machine can parse. Six months of senior writing aimed at **three categories** made the client the densest source available in those query spaces.',
      'Citations compound. Once the pillars started getting cited, the cluster pieces around them came along. The engine had already decided the domain was the authority for that territory.',
    ),
    resultsNarrative: pt(
      'Citations on the tracked query set went from **4 to 34** over six months, a ×8.5 lift. Organic leads from informational pages **doubled** in the same window.',
      'The pillar pages now sit at the top of AI Overview responses for terms the manufacturers used to own.',
    ),
    keyMetric: {
      prefix: '×',
      value: '8.5',
      label: 'AI Overview citation count, top 50 commercial queries',
      sourceLine: '4 → 34 citations · 6-month engagement',
    },
    stats: [
      stat('4 → 34', 'AI Overview citations on the top 50 commercial queries'),
      stat('×8.5', 'Citation-count lift over the six-month window'),
      stat('2×', 'Organic leads from informational pages'),
      stat('8 + 1', 'Pieces and pillars shipped per month — Standard retainer'),
    ],
    methodology: [
      method(
        'AIO citations (4 → 34)',
        'Citation count on the client’s top 50 commercial queries, probed bi-weekly via the Salesolution citation tracker. Baseline established four weeks pre-engagement; the closing figure is the 24-week mark.',
      ),
      method(
        'Organic leads from informational pages (2×)',
        'Lead-form submissions landing on informational pages, in the client’s analytics, compared against the pre-engagement baseline window.',
      ),
      method(
        'Retainer scope',
        'Standard editorial retainer: 8 pieces + 1 pillar per month across three product categories, senior subject-matter writers, no LLM ghostwriting.',
      ),
    ],
    disclosure: 'anonymized',
    featured: false,
    publishedAt: '2026-06-12T08:00:00Z',
    seo: {
      metaTitle: 'Case Study: 4 → 34 AI Overview Citations in 6 Months',
      metaDescription:
        'An industrial automation distributor multiplied its AI Overview citations ×8.5 on its top 50 commercial queries with one Standard editorial retainer. Methodology included.',
    },
    internalNotes:
      'Source: EditorialCaseStudy.tsx (/services/editorial-authority/), consistent with EditorialPricing Standard tier ($7.5K/mo, 8 pieces + 1 pillar). VERIFY: calendar window — the component says only "6 mo"; "2025" is a placeholder, set the real months. VERIFY: measurement basis for "organic leads from informational pages doubled" (described here as analytics lead-form submissions — confirm against the retro). The bi-weekly citation-tracker cadence is the firm’s standard methodology (as described in the v2-1 methodology disclosure) — confirm it applied to this engagement.',
  },

  // ── A2 · Same client, dev replatform ──────────────────────────────────
  {
    _id: 'caseStudy-hydraulics-replatform',
    _type: 'caseStudy',
    title: '8,500 SKUs off Magento 1,',
    titleMuted: 'onto a storefront AI engines can read.',
    slug: slug('hydraulics-distributor-headless-replatform'),
    client: ref('caseStudyClient-hydraulics'),
    primaryService: 'dev',
    supportingServices: ['search'],
    summary:
      'The same hydraulics distributor’s commerce stack was at end-of-life. Magento 1, schema AI Overviews couldn’t read, and 600ms-plus INP that was killing add-to-cart on mobile category browsing. A six-month replatform moved all 8,500 SKUs onto a headless Next.js + Shopify Hydrogen storefront, with a complete schema graph live on the first deploy.',
    engagementWindow: '2024',
    durationLabel: '6 months',
    situation: pt(
      'Magento 1 was past end-of-life: no patches, an aging integration surface, and a storefront whose structured data predated everything AI engines now read. On mobile, category browsing ran at **600ms-plus INP**. Add-to-cart behaves the way you’d expect at 600ms. Customers left.',
      'Whether to replatform wasn’t really the question — the platform had answered it. The question was whether the new stack would just be newer, or become a foundation the catalog and AI-search work could actually compound on.',
    ),
    constraint: pt(
      'Buying hydraulic fittings is spec-driven: thread form, size, pressure rating. The old quote flow had years of that domain logic baked in, and an off-the-shelf theme would have flattened it. The replatform had to carry **8,500 SKUs and the spec-selection workflow** across without simplifying either one.',
    ),
    approach: [
      phase(
        'Headless storefront build',
        'Next.js storefront over a Shopify Hydrogen commerce backend — server-rendered product and category pages, with category browsing rebuilt specifically for interaction latency.',
      ),
      phase(
        'Quote flow + spec configurators',
        'Custom quote flow with JIC/NPT spec configurators, so engineers spec fittings by thread, size, and pressure rating instead of paging through the catalog.',
      ),
      phase(
        'Schema graph from day one',
        'Full structured-data graph shipped with the storefront. The legacy stack’s biggest invisible defect was schema AI engines couldn’t read — the new one launched citable.',
      ),
    ],
    mechanism: pt(
      'Platform work doesn’t generate demand. It lifts the ceiling on everything that does. The rebuild took the friction out of the two places a distributor wins or loses business: the mobile category browse, where 600ms of input delay was costing carts, and the machine-readability layer, where AI engines decide whom to cite.',
    ),
    resultsNarrative: pt(
      'The full catalog was live in **six months**. Schema graph in place from launch, quote flow and configurators carried over intact.',
      'The growth came next. The six months after launch are the **catalog + AI-search engagement written up in its own case study**, where qualified inbounds rose 43% off the post-launch baseline. The replatform is what made that slope possible. We report the two separately so neither one claims the other’s work.',
    ),
    keyMetric: {
      value: '8,500',
      label: 'SKUs replatformed in six months',
      sourceLine: 'Magento 1 → Next.js + Shopify Hydrogen',
    },
    stats: [
      stat('8,500', 'SKUs migrated to the headless storefront'),
      stat('600ms+', 'INP on mobile category browsing, before the rebuild'),
      stat('JIC/NPT', 'Spec configurators built into the quote flow'),
      stat('6 mo', 'Kickoff to full catalog live'),
    ],
    methodology: [
      method(
        'Scope & stack',
        'Stack, scope, and delivered items are taken verbatim from the launch retro: full replatform, 8,500 SKUs, Next.js + Shopify Hydrogen, custom quote flow + JIC/NPT spec configurators, full schema graph.',
      ),
      method(
        'INP 600ms+',
        'Pre-rebuild interaction latency on mobile category pages, as measured during the audit — the metric behind the abandoned add-to-carts.',
      ),
      method(
        'Qualified-lead growth',
        'Reported in the companion catalog + AI-search case study, not here. This page claims the build; that page claims the growth.',
      ),
    ],
    disclosure: 'anonymized',
    featured: false,
    publishedAt: '2026-06-12T07:00:00Z',
    seo: {
      metaTitle: 'Case Study: 8,500-SKU Headless Replatform off Magento 1',
      metaDescription:
        'Magento 1 EOL, 600ms+ INP, schema invisible to AI Overviews. Six months later: a headless Next.js + Shopify Hydrogen storefront, citable from its first deploy.',
    },
    internalNotes:
      'Source: PortfolioGrid.tsx Case 01. RESOLUTION: the portfolio card credits this build with "+43% qualified leads/mo · 6 months post-launch" — the same lead growth the catalog case study reports as +43.5%. To stop the same number being claimed by two different narratives (the inventory flagged three irreconcilable versions), this page reports BUILD facts only and routes the growth claim to caseStudy-hydraulics-catalog. Sequence (replatform first, then the Aug 2024–Jan 2025 catalog engagement) is inferred — VERIFY. Also VERIFY: calendar window ("2024" is a placeholder), and whether a publishable post-rebuild INP number exists (the retro only recorded the "before").',
  },

  // ── D · Fluid power greenfield ─────────────────────────────────────────
  {
    _id: 'caseStudy-fluid-power-greenfield',
    _type: 'caseStudy',
    title: 'Cited in AI Overviews 12 weeks after launch.',
    titleMuted: 'On a domain with zero history.',
    slug: slug('fluid-power-oem-greenfield-aio-launch'),
    client: ref('caseStudyClient-fluid-power'),
    primaryService: 'dev',
    supportingServices: ['search'],
    summary:
      'A fluid power manufacturer opening a direct commerce channel had no storefront, no organic history, and one hard rule: the Acumatica PIM stays the source of truth. Five months later a 22k-SKU Next.js + Saleor build was live. It shipped AIO-ready, and earned its first AI Overview citations within 12 weeks of launch.',
    engagementWindow: '2025',
    durationLabel: '5 months',
    situation: pt(
      'A manufacturer selling through an OEM channel decided to open a direct channel from scratch, with **no storefront and no organic history** to inherit. The catalog ran to 22k SKUs. Pricing was multi-currency across several tax regions. And the product data lived where it belonged, in the **Acumatica PIM**, which wasn’t going anywhere.',
    ),
    constraint: pt(
      'A greenfield domain starts with nothing engines trust. Every citation heuristic that rewards incumbents — history, links, behavioral signals — worked against this launch. The PIM-as-source-of-truth rule ruled out a copy-paste catalog, too: if the product data ever forked from Acumatica, the project failed on its own terms no matter what traffic did.',
    ),
    approach: [
      phase(
        'Saleor backend wired to Acumatica',
        'The PIM stays canonical. Product data flows from Acumatica into Saleor, so the catalog never forks — 22k SKUs with one source of truth.',
      ),
      phase(
        'Next.js storefront on Vercel Edge',
        'Server-rendered storefront with multi-currency and multi-tax-region handling from day one.',
      ),
      phase(
        'AIO-ready at launch, not retrofitted',
        'Schema graph, direct-answer category structure, and machine-parseable spec tables shipped with the first deploy.',
      ),
    ],
    mechanism: pt(
      'A greenfield domain can’t win citations on authority, so it has to win on **legibility**. The engines’ first crawl saw the catalog exactly the way they like it: structured specs, answer-shaped category pages, a complete schema graph. That’s why the first citations came in weeks instead of quarters. There was no remediation phase, because nothing shipped broken.',
    ),
    resultsNarrative: pt(
      'The build went live at month five. 22k SKUs, PIM wired straight through.',
      'The first **AI Overview citations on tracked category queries landed inside 12 weeks of launch**, on a domain less than half a year old with no link history to lean on.',
    ),
    keyMetric: {
      value: '12',
      unit: ' wk',
      label: 'Time to first AI Overview citation, post-launch',
      sourceLine: 'Greenfield build · zero pre-launch organic history',
    },
    stats: [
      stat('22k', 'SKUs on a greenfield Next.js + Saleor build'),
      stat('5 mo', 'Kickoff to launch'),
      stat('12 wk', 'To first AI Overview citation after launch'),
      stat('1', 'Source of truth — the Acumatica PIM, wired straight through'),
    ],
    methodology: [
      method(
        'Time to first AIO citation',
        'First observed AI Overview citation of the new domain on tracked category queries, measured from launch day via the Salesolution citation tracker.',
      ),
      method(
        'Scope & stack',
        'Verbatim from the launch retro: greenfield build, 22k SKUs, 5 months, Next.js + Saleor on Vercel Edge, Acumatica PIM integration, multi-currency / multi-tax-region.',
      ),
    ],
    disclosure: 'anonymized',
    featured: false,
    publishedAt: '2026-06-12T06:00:00Z',
    seo: {
      metaTitle: 'Case Study: First AI Overview Citation 12 Weeks After Launch',
      metaDescription:
        'A 22k-SKU greenfield storefront — Next.js + Saleor, Acumatica PIM as source of truth — earned its first AI Overview citations within 12 weeks of going live.',
    },
    internalNotes:
      'Source: PortfolioGrid.tsx Case 04 ("AIO-ready from launch, cited in AIO inside 90 days"; card metric "12 wk"). The two figures are consistent (12 wk = 84 days) but confirm which is exact. VERIFY: calendar window ("2025" is a placeholder); citation-tracker query set for the "tracked category queries".',
  },

  // ── C · Fasteners migration ────────────────────────────────────────────
  {
    _id: 'caseStudy-fasteners-migration',
    _type: 'caseStudy',
    title: 'CLS 0.31 to 0.02 at launch,',
    titleMuted: 'and 61 plugins down to 4.',
    slug: slug('fasteners-distributor-shopify-plus-migration'),
    client: ref('caseStudyClient-fasteners'),
    primaryService: 'dev',
    summary:
      'A specialty fasteners distributor with 12k SKUs across 17 brands ran B2B commerce on WooCommerce and 61 plugins. Three of them handled net terms and tiered pricing, and broke on every update. A ten-week migration to Shopify Plus B2B swapped the plugin stack for native primitives and took product-page CLS from 0.31 to 0.02.',
    engagementWindow: '2024',
    durationLabel: '10 weeks',
    situation: pt(
      'The store had grown the way WooCommerce stores grow: a plugin for every problem, **61 of them** by the time we audited it. The three that mattered most ran net terms and tiered B2B pricing, and those were the three that broke on every update. Product pages carried a **CLS of 0.31**, well outside Core Web Vitals, because every plugin loaded its own late scripts.',
    ),
    constraint: pt(
      'B2B requirements like company accounts, net terms, and per-customer price lists are exactly what generic commerce themes don’t handle. That’s how the plugin sprawl started. The migration had to land those workflows on **native platform primitives**, carry 17 brands’ spec tables across, and do it without pausing a working store.',
    ),
    approach: [
      phase(
        'Platform migration',
        'WooCommerce → Shopify Plus B2B, with companies, catalogs, and net terms running on native platform primitives instead of plugin glue.',
        'Weeks 1–8',
      ),
      phase(
        'Plugin elimination',
        '61 plugins audited down to 4. Everything else either became a platform feature or turned out to be solving a problem the old platform had created.',
        'Weeks 2–6',
      ),
      phase(
        'Custom spec-table sections',
        'Liquid sections for brand spec tables — built once, reused across 17 brands’ product pages.',
        'Weeks 5–10',
      ),
    ],
    mechanism: pt(
      'Most replatform wins come from **subtraction**. Each of the 61 plugins was a late-loading script that shifted layout and a liability on update day. Moving the B2B stack onto native primitives removed the whole class of breakage, and CLS followed the script weight out the door. We didn’t optimize anything. We removed the cause.',
    ),
    resultsNarrative: pt(
      'Launch shipped in week ten with product-page **CLS at 0.02, down from 0.31**. That’s the jump from failing Core Web Vitals to comfortably inside the “good” range, on a stack of **4 plugins where 61 had been**.',
      'Net terms and tiered pricing now run native. The failure they used to cause, breaking on every plugin update, simply isn’t there to monitor anymore.',
    ),
    keyMetric: {
      value: '0.31 → 0.02',
      label: 'Cumulative Layout Shift on product pages, at launch',
      sourceLine: 'Shopify Plus B2B · 10-week migration',
    },
    stats: [
      stat('61 → 4', 'Plugins after the migration'),
      stat('12k', 'SKUs across 17 brands migrated'),
      stat('10 wk', 'WooCommerce to Shopify Plus B2B, kickoff to launch'),
      stat('Native', 'Net terms, companies, and catalogs — zero plugins'),
    ],
    methodology: [
      method(
        'CLS 0.31 → 0.02',
        'Product-page Cumulative Layout Shift, measured at launch against the pre-migration baseline.',
      ),
      method(
        'Scope & stack',
        'Verbatim from the launch retro: 12k SKUs, 17 brands, 10 weeks, Shopify Plus B2B with native companies/catalogs/net terms, 4 plugins remaining.',
      ),
    ],
    disclosure: 'anonymized',
    featured: false,
    publishedAt: '2026-06-12T05:00:00Z',
    seo: {
      metaTitle: 'Case Study: WooCommerce to Shopify Plus B2B in 10 Weeks',
      metaDescription:
        'A 12k-SKU, 17-brand fasteners distributor cut 61 plugins to 4 and took product-page CLS from 0.31 to 0.02 by moving B2B workflows onto native Shopify Plus primitives.',
    },
    internalNotes:
      'Source: PortfolioGrid.tsx Case 02. VERIFY: calendar window ("2024" is a placeholder). The AuditSocialProof quote attributed to an "Industrial fasteners distributor · ~12k SKUs" may be the same client — not assumed or used here.',
  },
]

// Exported so the prose-humanizer patch can read the canonical content from
// one place instead of duplicating it.
export { clients, studies }

// ── Mutate — only when run directly (`node scripts/seed-case-studies.mjs`),
//    never when imported, so importing this file has no side effects. ────────
const isMain = process.argv[1]?.endsWith('seed-case-studies.mjs')
if (isMain) {
  const mutations = [...clients, ...studies].map((doc) => ({ createOrReplace: doc }))

  const res = await fetch(
    `https://${projectId}.api.sanity.io/v${apiVersion}/data/mutate/${dataset}?returnIds=true`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ mutations }),
    },
  )

  const json = await res.json()
  if (!res.ok) {
    console.error('Mutation failed:', JSON.stringify(json, null, 2))
    process.exit(1)
  }
  console.log(`Seeded ${clients.length} clients + ${studies.length} case studies:`)
  for (const r of json.results ?? []) console.log(`  ${r.operation ?? 'upsert'} ${r.id}`)
}
