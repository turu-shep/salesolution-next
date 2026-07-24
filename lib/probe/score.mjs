/**
 * Pure scoring engine for the AI-Readiness Probe (/api/probe).
 * No React/DOM/network — imported by the route AND unit-tested with `node --test`.
 *
 * Each category is a list of weighted signals; the score is the earned fraction
 * of the points that APPLY to this page (signals can be page-type-scoped, so a
 * homepage is never judged on article bylines). Deterministic by design.
 *
 * @typedef {'article' | 'product' | 'home' | 'generic'} PageType
 *
 * @typedef {Object} SignalResult
 * @property {string} key
 * @property {string} label
 * @property {number} points   // weight of this signal
 * @property {number} earned   // 0..points
 *
 * @typedef {Object} DomainMetricsInput
 * @property {number} rank              // DataForSEO backlinks rank, 0–1000
 * @property {number} backlinks
 * @property {number} referringDomains
 *
 * @typedef {Object} ProbeScores
 * @property {number} schema
 * @property {number} readable
 * @property {number} authority
 * @property {number | undefined} domain   // present only when off-page data was available
 * @property {number} overall
 * @property {PageType} pageType
 * @property {{schema: SignalResult[], readable: SignalResult[], authority: SignalResult[], domain?: SignalResult[]}} details
 */
import { parse } from 'node-html-parser'

const PARSE_OPTIONS = {
  lowerCaseTagName: false,
  comment: false,
  blockTextElements: { script: true, noscript: true, style: true, pre: true },
}

export const REQUIRED_PROPS = {
  Product: ['name', 'image', 'description', 'offers'],
  Article: ['headline', 'author', 'datePublished'],
  BlogPosting: ['headline', 'author', 'datePublished'],
  NewsArticle: ['headline', 'author', 'datePublished'],
  Organization: ['name', 'url', 'logo'],
  LocalBusiness: ['name', 'address', 'telephone'],
  WebSite: ['name', 'url'],
  FAQPage: ['mainEntity'],
  HowTo: ['name', 'step'],
  Service: ['name', 'provider'],
  ItemList: ['itemListElement'],
  CollectionPage: ['name'],
}

/** Beyond the minimum: what citation-grade markup for that type carries. */
export const RECOMMENDED_PROPS = {
  Product: ['brand', 'sku', 'aggregateRating'],
  Article: ['image', 'dateModified', 'publisher'],
  BlogPosting: ['image', 'dateModified', 'publisher'],
  NewsArticle: ['image', 'dateModified', 'publisher'],
  Organization: ['address', 'contactPoint', 'sameAs'],
  LocalBusiness: ['openingHours', 'geo', 'sameAs'],
  WebSite: ['potentialAction'],
  Service: ['areaServed', 'provider'],
}

const RECOGNIZED_TYPES = new Set(Object.keys(REQUIRED_PROPS))

/** AI answer engines' crawlers — a robots.txt full block means "can't be cited". */
export const AI_BOTS = ['GPTBot', 'ClaudeBot', 'Claude-Web', 'PerplexityBot', 'Google-Extended', 'CCBot']

const SOCIAL_HOSTS = /(^|\.)(facebook|linkedin|instagram|youtube|tiktok|x)\.com$|(^|\.)twitter\.com$/i

// ---------- JSON-LD helpers ----------

function collectJsonLdBlocks(root) {
  return root.querySelectorAll('script[type="application/ld+json"]').map((s) => {
    const raw = s.text?.trim() ?? ''
    if (!raw) return { ok: false, data: null }
    try {
      return { ok: true, data: JSON.parse(raw) }
    } catch {
      return { ok: false, data: null }
    }
  })
}

function flattenLd(data) {
  const out = []
  const walk = (node) => {
    if (!node) return
    if (Array.isArray(node)) return node.forEach(walk)
    if (typeof node === 'object') {
      if (Array.isArray(node['@graph'])) node['@graph'].forEach(walk)
      if ('@type' in node) out.push(node)
      // nested entities (author, publisher, offers…) count as entities too
      for (const v of Object.values(node)) {
        if (v && typeof v === 'object') walk(v)
      }
    }
  }
  walk(data)
  return out
}

function typesOf(entity) {
  const at = entity['@type']
  return (Array.isArray(at) ? at : [at]).filter((t) => typeof t === 'string')
}

function firstRecognizedType(entities) {
  for (const e of entities) {
    for (const t of typesOf(e)) {
      if (RECOGNIZED_TYPES.has(t)) return { type: t, entity: e }
    }
  }
  return null
}

function present(v) {
  return v !== undefined && v !== null && v !== ''
}

// ---------- robots.txt ----------

/**
 * Which of the AI crawlers a robots.txt fully blocks (a `Disallow: /` in the
 * group that governs them). Missing/unreadable robots.txt blocks nobody.
 * @param {string | null} robotsTxt
 * @returns {string[]}
 */
export function blockedAiBots(robotsTxt) {
  if (!robotsTxt) return []
  const groups = []
  let current = null
  for (const rawLine of robotsTxt.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, '').trim()
    const m = line.match(/^([a-z-]+)\s*:\s*(.*)$/i)
    if (!m) continue
    const field = m[1].toLowerCase()
    const value = m[2].trim()
    if (field === 'user-agent') {
      if (!current || current.rules.length > 0) {
        current = { agents: [], rules: [] }
        groups.push(current)
      }
      current.agents.push(value.toLowerCase())
    } else if ((field === 'disallow' || field === 'allow') && current) {
      current.rules.push({ allow: field === 'allow', path: value })
    }
  }
  const groupFor = (bot) => {
    const b = bot.toLowerCase()
    return (
      groups.find((g) => g.agents.some((a) => a !== '*' && (b.includes(a) || a.includes(b)))) ??
      groups.find((g) => g.agents.includes('*'))
    )
  }
  return AI_BOTS.filter((bot) => {
    const g = groupFor(bot)
    if (!g) return false
    const blocksAll = g.rules.some((r) => !r.allow && (r.path === '/' || r.path === '/*'))
    const allowsSome = g.rules.some((r) => r.allow && r.path.length > 0)
    return blocksAll && !allowsSome
  })
}

// ---------- page type ----------

/**
 * @param {string} pageUrl
 * @param {Set<string>} ldTypes
 * @returns {PageType}
 */
export function detectPageType(pageUrl, ldTypes) {
  if (ldTypes.has('Article') || ldTypes.has('BlogPosting') || ldTypes.has('NewsArticle')) return 'article'
  if (ldTypes.has('Product')) return 'product'
  let path = '/'
  try {
    path = new URL(pageUrl).pathname
  } catch {
    /* keep '/' */
  }
  if (/\/(blog|news|articles?|posts?|insights|resources|guides?|glossary)(\/|$)/i.test(path)) return 'article'
  if (/\/(products?|item|itm|p|shop|store|category|categories|collections?)(\/|$)/i.test(path)) return 'product'
  if (path === '/' || path === '') return 'home'
  return 'generic'
}

// ---------- signal engine ----------

function runSignals(signals, ctx) {
  const results = []
  let possible = 0
  let earned = 0
  for (const s of signals) {
    if (s.when && !s.when(ctx)) continue
    const fraction = Math.min(1, Math.max(0, s.test(ctx)))
    possible += s.points
    earned += s.points * fraction
    results.push({ key: s.key, label: s.label, points: s.points, earned: Math.round(s.points * fraction * 10) / 10 })
  }
  return { score: possible > 0 ? Math.round((earned / possible) * 100) : 0, results }
}

// ---------- category signals ----------

const SCHEMA_SIGNALS = [
  {
    key: 'jsonld-present',
    label: 'JSON-LD structured data exists',
    points: 5,
    test: (c) => (c.blocks.length > 0 ? 1 : 0),
  },
  {
    key: 'jsonld-valid',
    label: 'All JSON-LD blocks parse as valid JSON',
    points: 5,
    test: (c) => (c.blocks.length > 0 && c.blocks.every((b) => b.ok) ? 1 : 0),
  },
  {
    key: 'primary-type',
    label: 'A recognized entity type is declared (Product, Article, Organization…)',
    points: 15,
    test: (c) => (c.primary ? 1 : 0),
  },
  {
    key: 'required-props',
    label: 'The primary entity carries its required properties',
    points: 20,
    test: (c) => {
      if (!c.primary) return 0
      const required = REQUIRED_PROPS[c.primary.type] ?? []
      if (required.length === 0) return 0
      let n = 0
      for (const prop of required) {
        if (present(c.primary.entity[prop])) n++
        else if (c.primary.type === 'Product' && prop === 'offers' && present(c.primary.entity.price)) n++
      }
      return n / required.length
    },
  },
  {
    key: 'recommended-props',
    label: 'Citation-grade properties beyond the minimum (brand, ratings, contact, search)',
    points: 15,
    test: (c) => {
      if (!c.primary) return 0
      const rec = RECOMMENDED_PROPS[c.primary.type] ?? []
      if (rec.length === 0) return 0
      let n = 0
      for (const prop of rec) if (present(c.primary.entity[prop])) n++
      return n / rec.length
    },
  },
  {
    key: 'multiple-types',
    label: 'Two or more distinct entity types are described',
    points: 5,
    test: (c) => {
      const distinct = new Set()
      for (const e of c.entities) for (const t of typesOf(e)) if (RECOGNIZED_TYPES.has(t)) distinct.add(t)
      return distinct.size >= 2 ? 1 : 0
    },
  },
  {
    key: 'breadcrumbs',
    label: 'BreadcrumbList markup places the page in the site hierarchy',
    points: 10,
    test: (c) => (c.ldTypes.has('BreadcrumbList') ? 1 : 0),
  },
  {
    key: 'org-identity',
    label: 'Organization/LocalBusiness entity with name, logo, and url',
    points: 10,
    test: (c) => {
      const orgs = c.entities.filter(
        (e) => typesOf(e).some((t) => t === 'Organization' || t === 'LocalBusiness') && present(e.name),
      )
      if (orgs.length === 0) return 0
      return Math.max(...orgs.map((e) => (present(e.logo) ? 0.5 : 0) + (present(e.url) ? 0.5 : 0)))
    },
  },
  {
    key: 'same-as',
    label: 'sameAs links point to your profiles elsewhere (LinkedIn, socials)',
    points: 10,
    test: (c) => {
      const max = Math.max(0, ...c.entities.map((e) => (Array.isArray(e.sameAs) ? e.sameAs.length : 0)))
      return Math.min(1, max / 3)
    },
  },
  {
    key: 'open-graph',
    label: 'Open Graph title, description, and image are set',
    points: 5,
    test: (c) =>
      ['og:title', 'og:description', 'og:image'].filter((p) =>
        c.root.querySelector(`meta[property="${p}"]`),
      ).length / 3,
  },
  {
    key: 'canonical',
    label: 'A canonical URL is declared',
    points: 5,
    test: (c) => (c.root.querySelector('link[rel="canonical"]')?.getAttribute('href') ? 1 : 0),
  },
]

function headingLevelsOk(root) {
  let prev = 0
  for (const h of root.querySelectorAll('h1, h2, h3, h4, h5, h6')) {
    const lvl = Number(h.tagName?.[1])
    if (!Number.isFinite(lvl)) continue
    if (prev !== 0 && lvl > prev + 1) return false
    prev = lvl
  }
  return true
}

const READABLE_SIGNALS = [
  {
    key: 'indexable',
    label: 'Page is not blocked by a noindex directive',
    points: 5,
    test: () => 1, // noindex zeroes the whole category before signals run
  },
  {
    key: 'ai-crawlers',
    label: 'robots.txt lets AI crawlers (GPTBot, ClaudeBot, Perplexity…) in',
    points: 10,
    test: (c) => (AI_BOTS.length - c.blockedBots.length) / AI_BOTS.length,
  },
  {
    key: 'llms-txt',
    label: 'An llms.txt file guides AI crawlers (llmstxt.org)',
    points: 8,
    test: (c) => (c.hasLlmsTxt ? 1 : 0),
  },
  {
    key: 'one-h1',
    label: 'Exactly one H1 states what the page is',
    points: 10,
    test: (c) => (c.root.querySelectorAll('h1').length === 1 ? 1 : 0),
  },
  {
    key: 'heading-order',
    label: 'Heading levels descend without skips',
    points: 8,
    test: (c) => (headingLevelsOk(c.root) ? 1 : 0),
  },
  {
    key: 'subheadings',
    label: 'Content is sectioned with H2/H3 subheadings',
    points: 7,
    test: (c) => Math.min(1, c.root.querySelectorAll('h2, h3').length / 3),
  },
  {
    key: 'word-count',
    label: 'Substantive body copy (300–4,000 words)',
    points: 12,
    test: (c) => {
      const wc = c.wordCount
      if (wc >= 300 && wc <= 4000) return 1
      if (wc < 300) return wc / 300
      return Math.max(0, 1 - (wc - 4000) / 8000)
    },
  },
  {
    key: 'landmark',
    label: 'A <main> or <article> landmark marks the content',
    points: 8,
    test: (c) => (c.root.querySelector('main') || c.root.querySelector('article') ? 1 : 0),
  },
  {
    key: 'page-shell',
    label: 'Semantic <header> and <footer> frame the page',
    points: 5,
    test: (c) => (c.root.querySelector('header') && c.root.querySelector('footer') ? 1 : 0),
  },
  {
    key: 'meta-description',
    label: 'Meta description in the 70–160 character sweet spot',
    points: 10,
    test: (c) => {
      const len = (c.root.querySelector('meta[name="description"]')?.getAttribute('content') ?? '').length
      if (len >= 70 && len <= 160) return 1
      if (len >= 50 && len <= 300) return 0.6
      return len > 0 ? 0.3 : 0
    },
  },
  {
    key: 'title-tag',
    label: 'Title tag of 15–60 characters',
    points: 10,
    test: (c) => {
      const len = (c.root.querySelector('title')?.text ?? '').trim().length
      if (len === 0) return 0
      return len >= 15 && len <= 60 ? 1 : 0.3
    },
  },
  {
    key: 'question-headings',
    label: 'At least one heading is phrased as a question AI can answer',
    points: 8,
    test: (c) =>
      c.root
        .querySelectorAll('h2, h3')
        .some((h) => /\?|^\s*(how|what|why|when|which|who|can|does?|is|are|should)\b/i.test(h.text ?? ''))
        ? 1
        : 0,
  },
  {
    key: 'lists-tables',
    label: 'Lists or tables give AI extractable structure',
    points: 7,
    test: (c) => {
      const body = c.root.querySelector('body') ?? c.root
      return body.querySelector('ul, ol, table, dl') ? 1 : 0
    },
  },
  {
    key: 'text-ratio',
    label: 'Real text is in the HTML, not behind JavaScript',
    points: 8,
    test: (c) => Math.min(1, c.textRatio / 0.15),
  },
  {
    key: 'viewport',
    label: 'Mobile viewport is declared',
    points: 5,
    test: (c) => (c.root.querySelector('meta[name="viewport"]') ? 1 : 0),
  },
]

function hasTrustNavLink(root, pattern) {
  const areas = [
    ...root.querySelectorAll('header a[href]'),
    ...root.querySelectorAll('nav a[href]'),
    ...root.querySelectorAll('footer a[href]'),
  ]
  return areas.some((a) => pattern.test(a.getAttribute('href') ?? ''))
}

const AUTHORITY_SIGNALS = [
  {
    key: 'publisher',
    label: 'A named publisher/organization stands behind the page (in schema)',
    points: 12,
    test: (c) => {
      const inLd =
        c.entities.some((e) => present(e.publisher)) ||
        c.entities.some(
          (e) => typesOf(e).some((t) => t === 'Organization' || t === 'LocalBusiness') && present(e.name),
        )
      if (inLd) return 1
      return c.root.querySelector('meta[property="og:site_name"]') ? 0.5 : 0
    },
  },
  {
    key: 'contact',
    label: 'Real-world contact: a phone number AND an email or address',
    points: 12,
    test: (c) => {
      const phone =
        c.root.querySelector('a[href^="tel:"]') || c.entities.some((e) => present(e.telephone))
      const place =
        c.root.querySelector('a[href^="mailto:"]') ||
        c.root.querySelector('address') ||
        c.entities.some((e) => present(e.address))
      return (phone ? 0.5 : 0) + (place ? 0.5 : 0)
    },
  },
  {
    key: 'trust-nav',
    label: 'About/contact/team pages are linked in your header or footer',
    points: 10,
    test: (c) => (hasTrustNavLink(c.root, /(^|\/)(about|contact|team|authors|company)(\/|$|#|\?)/i) ? 1 : 0),
  },
  {
    key: 'citations',
    label: 'Cites sources: outbound links to 5+ distinct domains',
    points: 12,
    test: (c) => {
      const hosts = new Set()
      for (const a of c.root.querySelectorAll('a[href]')) {
        try {
          const abs = new URL(a.getAttribute('href') ?? '', c.pageUrl)
          if (abs.protocol !== 'http:' && abs.protocol !== 'https:') continue
          const h = abs.hostname.toLowerCase()
          if (h && h !== c.pageHost) hosts.add(h)
        } catch {
          /* noop */
        }
      }
      const citeBoost = c.root.querySelectorAll('cite').length > 0 ? 0.4 : 0
      return Math.min(1, hosts.size / 5 + citeBoost)
    },
  },
  {
    key: 'alt-text',
    label: 'Images carry alt text',
    points: 8,
    test: (c) => {
      const body = c.root.querySelector('body') ?? c.root
      const imgs = body.querySelectorAll('img')
      if (imgs.length === 0) return 1
      return imgs.filter((i) => (i.getAttribute('alt') ?? '').trim().length > 0).length / imgs.length
    },
  },
  {
    key: 'lang',
    label: 'Document language is declared',
    points: 4,
    test: (c) => ((c.root.querySelector('html')?.getAttribute('lang') ?? '').trim().length > 0 ? 1 : 0),
  },
  {
    key: 'legal',
    label: 'Privacy policy or terms are linked',
    points: 6,
    test: (c) => (hasTrustNavLink(c.root, /(privacy|terms|impressum|legal)/i) ? 1 : 0),
  },
  {
    key: 'social-profiles',
    label: 'Linked profiles on other platforms (sameAs or social links)',
    points: 10,
    test: (c) => {
      const sameAs = Math.max(0, ...c.entities.map((e) => (Array.isArray(e.sameAs) ? e.sameAs.length : 0)))
      if (sameAs >= 3) return 1
      const hosts = new Set()
      for (const a of c.root.querySelectorAll('a[href]')) {
        try {
          const h = new URL(a.getAttribute('href') ?? '', c.pageUrl).hostname
          if (SOCIAL_HOSTS.test(h)) hosts.add(h.replace(/^www\./, ''))
        } catch {
          /* noop */
        }
      }
      return Math.min(1, (sameAs + hosts.size) / 3)
    },
  },
  // Article pages: bylines and dates are non-negotiable.
  {
    key: 'author',
    label: 'A named author is credited',
    points: 14,
    when: (c) => c.pageType === 'article',
    test: (c) =>
      c.entities.some((e) => present(e.author)) ||
      c.root.querySelector('meta[property="article:author"]') ||
      c.root.querySelector('a[rel="author"]')
        ? 1
        : 0,
  },
  {
    key: 'dates',
    label: 'Published/updated dates are machine-readable',
    points: 12,
    when: (c) => c.pageType === 'article',
    test: (c) =>
      c.entities.some((e) => present(e.datePublished) || present(e.dateModified)) ||
      c.root.querySelector('time[datetime]')
        ? 1
        : 0,
  },
  // Non-article pages: judged on org trust instead of bylines.
  {
    key: 'freshness',
    label: 'Shows a machine-readable update date',
    points: 6,
    when: (c) => c.pageType !== 'article',
    test: (c) =>
      c.entities.some((e) => present(e.dateModified)) || c.root.querySelector('time[datetime]') ? 1 : 0,
  },
  {
    key: 'people',
    label: 'Named people (Person markup with a role) stand behind the business',
    points: 10,
    when: (c) => c.pageType !== 'article',
    test: (c) => {
      const people = c.entities.filter((e) => typesOf(e).includes('Person') && present(e.name))
      if (people.length === 0) return 0
      return people.some((e) => present(e.jobTitle) || present(e.sameAs)) ? 1 : 0.5
    },
  },
  {
    key: 'reviews',
    label: 'Ratings or reviews are marked up',
    points: 10,
    when: (c) => c.pageType !== 'article',
    test: (c) =>
      c.ldTypes.has('AggregateRating') ||
      c.ldTypes.has('Review') ||
      c.entities.some((e) => present(e.aggregateRating) || present(e.review))
        ? 1
        : 0,
  },
]

// ---------- domain strength (off-page) ----------

/**
 * Off-page reality check: markup can be perfect and the domain still too weak
 * to win citations. Rank is DataForSEO's 0–1000 backlinks rank (full credit
 * at 500 ≈ a genuinely strong domain); link counts are log-scaled so early
 * links matter most.
 * @param {DomainMetricsInput} m
 */
const DOMAIN_SIGNALS = [
  {
    key: 'domain-rank',
    label: 'Domain rank is in the range AI already cites',
    points: 40,
    test: (c) => Math.min(1, (c.metrics.rank ?? 0) / 500),
  },
  {
    key: 'referring-domains',
    label: 'Other sites link to you (referring domains)',
    points: 35,
    test: (c) => Math.min(1, Math.log10((c.metrics.referringDomains ?? 0) + 1) / 3),
  },
  {
    key: 'backlinks',
    label: 'Total backlinks pointing at the domain',
    points: 25,
    test: (c) => Math.min(1, Math.log10((c.metrics.backlinks ?? 0) + 1) / 4),
  },
]

export function scoreDomain(m) {
  return runSignals(DOMAIN_SIGNALS, { metrics: m })
}

// ---------- entry point ----------

/**
 * @param {string} html
 * @param {string} pageUrl
 * @param {{robotsTxt?: string | null, llmsTxt?: boolean, domainMetrics?: DomainMetricsInput | null}} [opts]
 * @returns {ProbeScores}
 */
export function computeScores(html, pageUrl, opts = {}) {
  const root = parse(html, PARSE_OPTIONS)

  // Separate parse for text metrics so script/style payloads don't count as copy.
  const textRoot = parse(html, PARSE_OPTIONS)
  for (const n of textRoot.querySelectorAll('script, style, noscript, template, svg')) n.remove()
  const bodyText = ((textRoot.querySelector('body') ?? textRoot).text || '').replace(/\s+/g, ' ').trim()

  const blocks = collectJsonLdBlocks(root)
  const entities = blocks.filter((b) => b.ok).flatMap((b) => flattenLd(b.data))
  const ldTypes = new Set(entities.flatMap(typesOf))

  let pageHost = ''
  try {
    pageHost = new URL(pageUrl).hostname.toLowerCase()
  } catch {
    /* keep '' */
  }

  const ctx = {
    root,
    pageUrl,
    pageHost,
    blocks,
    entities,
    ldTypes,
    primary: firstRecognizedType(entities),
    pageType: detectPageType(pageUrl, ldTypes),
    wordCount: bodyText.split(/\s+/).filter(Boolean).length,
    textRatio: html.length > 0 ? bodyText.length / html.length : 0,
    blockedBots: blockedAiBots(opts.robotsTxt ?? null),
    hasLlmsTxt: opts.llmsTxt === true,
  }

  const schema = runSignals(SCHEMA_SIGNALS, ctx)

  const robotsContent = root.querySelector('meta[name="robots"]')?.getAttribute('content')?.toLowerCase() ?? ''
  const readable = robotsContent.includes('noindex')
    ? { score: 0, results: [{ key: 'indexable', label: 'Page is blocked by a noindex directive', points: 100, earned: 0 }] }
    : runSignals(READABLE_SIGNALS, ctx)

  const authority = runSignals(AUTHORITY_SIGNALS, ctx)
  const domain = opts.domainMetrics ? scoreDomain(opts.domainMetrics) : null

  // Weakest-gate overall: an answer engine trips on your worst layer, not
  // your average. 60% mean, 40% minimum, across every category we could score.
  const cats = [schema.score, readable.score, authority.score]
  if (domain) cats.push(domain.score)
  const mean = cats.reduce((a, b) => a + b, 0) / cats.length
  const min = Math.min(...cats)
  return {
    schema: schema.score,
    readable: readable.score,
    authority: authority.score,
    domain: domain ? domain.score : undefined,
    overall: Math.round(mean * 0.6 + min * 0.4),
    pageType: ctx.pageType,
    details: {
      schema: schema.results,
      readable: readable.results,
      authority: authority.results,
      ...(domain ? { domain: domain.results } : {}),
    },
  }
}

// ---------- public catalog (methodology page) ----------

/**
 * Static view of every signal for the public methodology page — the page is
 * generated from the same arrays that score, so it can't drift from the code.
 * `scope`: 'article' / 'non-article' signals apply by detected page type.
 *
 * @typedef {{key: string, label: string, points: number, scope: 'all' | 'article' | 'non-article'}} CatalogSignal
 * @returns {{schema: CatalogSignal[], readable: CatalogSignal[], authority: CatalogSignal[], domain: CatalogSignal[]}}
 */
export function signalCatalog() {
  const ARTICLE_ONLY = new Set(['author', 'dates'])
  const strip = (arr) => arr.map(({ key, label, points }) => ({ key, label, points, scope: 'all' }))
  return {
    schema: strip(SCHEMA_SIGNALS),
    readable: strip(READABLE_SIGNALS),
    authority: AUTHORITY_SIGNALS.map(({ key, label, points, when }) => ({
      key,
      label,
      points,
      scope: when ? (ARTICLE_ONLY.has(key) ? 'article' : 'non-article') : 'all',
    })),
    domain: strip(DOMAIN_SIGNALS),
  }
}
