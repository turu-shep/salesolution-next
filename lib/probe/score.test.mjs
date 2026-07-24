import assert from 'node:assert/strict'
import { test } from 'node:test'

import { AI_BOTS, blockedAiBots, computeScores, detectPageType, scoreDomain } from './score.mjs'

const ARTICLE_LD = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'How AI reads product pages',
  author: { '@type': 'Person', name: 'Jane Doe' },
  datePublished: '2026-01-15',
  publisher: { '@type': 'Organization', name: 'Acme Media', logo: 'https://acme.example/logo.png' },
})

const ORG_LD = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Acme Hydraulics',
  url: 'https://acme.example',
  logo: 'https://acme.example/logo.png',
  telephone: '+1-555-0100',
  sameAs: ['https://www.linkedin.com/company/acme', 'https://www.facebook.com/acme'],
})

function page({ head = '', body = '', lang = ' lang="en"' } = {}) {
  return `<!doctype html><html${lang}><head><title>Acme Hydraulics — cylinders and parts</title>${head}</head><body>${body}</body></html>`
}

const RICH_BODY = `
  <header><nav><a href="/about/">About</a><a href="/contact/">Contact</a></nav></header>
  <main>
    <h1>Hydraulic cylinders</h1>
    <h2>Bore sizes</h2><h2>Seal kits</h2><h2>Lead times</h2>
    <p>${'word '.repeat(300)}</p>
    <ul><li>2-inch bore</li><li>3-inch bore</li></ul>
    <img src="/a.png" alt="cylinder diagram" />
    <a href="https://en.wikipedia.org/wiki/Hydraulics">spec</a>
    <a href="https://www.iso.org/standard">ISO</a>
    <a href="https://nfpa.com/standards">NFPA</a>
    <a href="tel:+15550100">Call</a>
  </main>
  <footer><a href="/privacy/">Privacy</a><time datetime="2026-01-01">Jan</time></footer>`

test('deterministic: same input, same output', () => {
  const html = page({ head: `<script type="application/ld+json">${ORG_LD}</script>`, body: RICH_BODY })
  const a = computeScores(html, 'https://acme.example/')
  const b = computeScores(html, 'https://acme.example/')
  assert.deepEqual(a, b)
})

test('homepage is not judged on article bylines', () => {
  const html = page({ head: `<script type="application/ld+json">${ORG_LD}</script>`, body: RICH_BODY })
  const r = computeScores(html, 'https://acme.example/')
  assert.equal(r.pageType, 'home')
  const keys = r.details.authority.map((s) => s.key)
  assert.ok(!keys.includes('author'), 'homepage must not carry the author signal')
  assert.ok(!keys.includes('dates'), 'homepage must not carry the article dates signal')
  assert.ok(keys.includes('people') && keys.includes('reviews'), 'homepage gets org-trust signals instead')
})

test('article page IS judged on bylines, and earns them from JSON-LD', () => {
  const html = page({ head: `<script type="application/ld+json">${ARTICLE_LD}</script>`, body: RICH_BODY })
  const r = computeScores(html, 'https://acme.example/blog/how-ai-reads/')
  assert.equal(r.pageType, 'article')
  const author = r.details.authority.find((s) => s.key === 'author')
  const dates = r.details.authority.find((s) => s.key === 'dates')
  assert.equal(author.earned, author.points)
  assert.equal(dates.earned, dates.points)
})

test('page type detection: schema wins, then path, then home', () => {
  const empty = new Set()
  assert.equal(detectPageType('https://x.com/', empty), 'home')
  assert.equal(detectPageType('https://x.com/blog/foo/', empty), 'article')
  assert.equal(detectPageType('https://x.com/products/pump-3', empty), 'product')
  assert.equal(detectPageType('https://x.com/some/page', empty), 'generic')
  assert.equal(detectPageType('https://x.com/some/page', new Set(['Product'])), 'product')
})

test('noindex zeroes AI-readable', () => {
  const html = page({ head: '<meta name="robots" content="noindex, nofollow">', body: RICH_BODY })
  const r = computeScores(html, 'https://acme.example/')
  assert.equal(r.readable, 0)
})

test('JS shell (no real text) scores low on text-ratio and word-count', () => {
  const html = page({
    body: `<div id="root"></div><script>${'var x = 1;'.repeat(2000)}</script>`,
  })
  const r = computeScores(html, 'https://acme.example/')
  const ratio = r.details.readable.find((s) => s.key === 'text-ratio')
  const words = r.details.readable.find((s) => s.key === 'word-count')
  assert.equal(ratio.earned, 0)
  assert.equal(words.earned, 0)
})

test('script payload does not count as body copy', () => {
  const html = page({ body: `<main><h1>Hi</h1><p>ten real words of visible copy sit right here</p></main><script>${'padding '.repeat(500)}</script>` })
  const r = computeScores(html, 'https://acme.example/')
  const words = r.details.readable.find((s) => s.key === 'word-count')
  assert.ok(words.earned < words.points * 0.2, `expected low word count credit, got ${words.earned}`)
})

test('robots.txt blocking AI bots costs readable points', () => {
  const html = page({ body: RICH_BODY })
  const open = computeScores(html, 'https://acme.example/', { robotsTxt: 'User-agent: *\nDisallow:' })
  const blocked = computeScores(html, 'https://acme.example/', {
    robotsTxt: 'User-agent: GPTBot\nDisallow: /\n\nUser-agent: ClaudeBot\nDisallow: /',
  })
  assert.ok(blocked.readable < open.readable)
})

test('blockedAiBots parses groups, wildcards, and comments', () => {
  assert.deepEqual(blockedAiBots(null), [])
  assert.deepEqual(blockedAiBots('User-agent: *\nDisallow: /admin/'), [])
  assert.deepEqual(blockedAiBots('User-agent: GPTBot\nDisallow: /'), ['GPTBot'])
  // shared group: two agents, one rule set
  assert.deepEqual(blockedAiBots('User-agent: GPTBot\nUser-agent: CCBot\nDisallow: /'), ['GPTBot', 'CCBot'])
  // wildcard full block hits every AI bot
  assert.deepEqual(blockedAiBots('User-agent: *\nDisallow: /'), AI_BOTS)
  // specific allow overrides the full block for that group
  assert.deepEqual(blockedAiBots('User-agent: GPTBot\nDisallow: /\nAllow: /public/'), [])
  // comments ignored
  assert.deepEqual(blockedAiBots('# block ai\nUser-agent: ClaudeBot # note\nDisallow: /'), ['ClaudeBot'])
})

test('llms.txt and question headings earn readable points', () => {
  const html = page({ body: RICH_BODY })
  const withOut = computeScores(html, 'https://acme.example/')
  const withIn = computeScores(html, 'https://acme.example/', { llmsTxt: true })
  assert.ok(withIn.readable > withOut.readable, 'llms.txt must add readable points')
  const q = computeScores(page({ body: RICH_BODY.replace('<h2>Bore sizes</h2>', '<h2>What bore size do I need?</h2>') }), 'https://acme.example/')
  const qSig = q.details.readable.find((s) => s.key === 'question-headings')
  assert.equal(qSig.earned, qSig.points)
})

test('recommended props are graded beyond the required minimum', () => {
  const bare = computeScores(page({ head: `<script type="application/ld+json">${ORG_LD}</script>` }), 'https://acme.example/')
  const recBare = bare.details.schema.find((s) => s.key === 'recommended-props')
  // ORG_LD has sameAs but no address/contactPoint → partial credit
  assert.ok(recBare.earned > 0 && recBare.earned < recBare.points)
})

test('overall respects the weakest gate, not just the mean', () => {
  const r = computeScores(page({ body: RICH_BODY }), 'https://acme.example/')
  const mean = (r.schema + r.readable + r.authority) / 3
  const min = Math.min(r.schema, r.readable, r.authority)
  assert.equal(r.overall, Math.round(mean * 0.6 + min * 0.4))
  assert.ok(r.overall <= Math.round(mean), 'weakest gate can only pull the score down')
})

test('rich org page scores well; empty page scores poorly', () => {
  const rich = computeScores(
    page({
      head:
        `<script type="application/ld+json">${ORG_LD}</script>` +
        '<meta name="description" content="Hydraulic cylinders, seal kits, and parts with same-day quotes from a real distributor.">' +
        '<meta property="og:title" content="Acme"><meta property="og:description" content="Parts"><meta property="og:image" content="/og.png">' +
        '<link rel="canonical" href="https://acme.example/">' +
        '<meta name="viewport" content="width=device-width, initial-scale=1">',
      body: RICH_BODY,
    }),
    'https://acme.example/',
  )
  const empty = computeScores('<html><body><div>hi</div></body></html>', 'https://empty.example/')
  assert.ok(rich.overall >= 55, `rich page should clear 55, got ${rich.overall}`)
  assert.ok(empty.overall <= 20, `empty page should be ≤20, got ${empty.overall}`)
  assert.ok(rich.overall - empty.overall >= 40, 'rich and empty must be clearly separated')
  assert.ok(rich.details.schema.length >= 10, 'schema category carries 10+ signals')
  assert.ok(rich.details.readable.length >= 14, 'readable category carries 14+ signals')
  assert.ok(rich.details.authority.length >= 10, 'authority category carries 10+ signals')
})

test('domain strength: weak domains score low, strong high, absent omits the category', () => {
  const weak = scoreDomain({ rank: 100, backlinks: 500, referringDomains: 50 })
  const strong = scoreDomain({ rank: 600, backlinks: 250000, referringDomains: 3000 })
  assert.ok(weak.score < 55, `DR~10-class domain must score low, got ${weak.score}`)
  assert.ok(strong.score >= 90, `strong domain must score high, got ${strong.score}`)

  // Strong on-page fixture so the weak domain is unambiguously the weakest gate.
  const html = page({
    head:
      `<script type="application/ld+json">${ORG_LD}</script>` +
      '<meta name="description" content="Hydraulic cylinders, seal kits, and parts with same-day quotes from a real distributor.">' +
      '<meta property="og:title" content="Acme"><meta property="og:description" content="Parts"><meta property="og:image" content="/og.png">' +
      '<link rel="canonical" href="https://acme.example/">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1">',
    body: RICH_BODY,
  })
  const without = computeScores(html, 'https://acme.example/')
  assert.equal(without.domain, undefined)
  assert.ok(!('domain' in without.details))

  const withWeak = computeScores(html, 'https://acme.example/', {
    domainMetrics: { rank: 100, backlinks: 500, referringDomains: 50 },
  })
  assert.ok(typeof withWeak.domain === 'number')
  assert.ok(withWeak.details.domain.length === 3)
  const cats = [withWeak.schema, withWeak.readable, withWeak.authority, withWeak.domain]
  const mean = cats.reduce((a, b) => a + b, 0) / 4
  const min = Math.min(...cats)
  assert.equal(withWeak.overall, Math.round(mean * 0.6 + min * 0.4), 'overall spans all four categories')
  if (min === withWeak.domain) {
    assert.ok(withWeak.overall < without.overall, 'a weakest-gate domain must drag the overall down')
  }
})

test('scores stay in 0..100', () => {
  const r = computeScores(page({ body: RICH_BODY }), 'https://acme.example/')
  for (const v of [r.schema, r.readable, r.authority, r.overall]) {
    assert.ok(v >= 0 && v <= 100)
  }
})
