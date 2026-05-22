#!/usr/bin/env node
/**
 * Run Google Lighthouse against the production-built site on five
 * representative templates. Reports a table of mobile scores.
 *
 * Requires the prod server to be up:
 *   pnpm build && pnpm start --port 3010
 *
 * Usage:
 *   node docs/strategy/scripts/lighthouse-check.mjs
 *   node docs/strategy/scripts/lighthouse-check.mjs --base=http://localhost:3010
 */

import { spawn } from 'node:child_process'
import { mkdir, readFile, unlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=')
    return [k, v ?? true]
  }),
)
const BASE = args.base ?? 'http://localhost:3010'

const URLS = [
  ['Home',           '/'],
  ['Pricing tiers',  '/services/website-content-writing-packages/'],
  ['Contact',        '/contact-me/'],
  ['Blog post',      '/generative-engine-optimization-basic-to-advanced/'],
  ['Guide',          '/guides/website-launch-checklist-series-part-1-seo-and-crawling/'],
]

async function runLighthouse(url) {
  const out = join(tmpdir(), `lh-${Date.now()}-${Math.random().toString(36).slice(2)}.json`)

  await new Promise((resolve, reject) => {
    const child = spawn('npx', [
      '-y',
      'lighthouse',
      url,
      '--quiet',
      '--output=json',
      '--output-path=' + out,
      '--chrome-flags=--headless=new --no-sandbox --disable-gpu',
      '--preset=desktop',
      '--max-wait-for-load=30000',
      '--throttling-method=provided',
    ], {
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    let stderr = ''
    child.stderr.on('data', (d) => { stderr += d })
    child.on('exit', (code) => {
      if (code === 0) resolve(undefined)
      else reject(new Error(`lighthouse exited ${code}\n${stderr.slice(-400)}`))
    })
  })

  const json = JSON.parse(await readFile(out, 'utf8'))
  await unlink(out).catch(() => {})
  return {
    performance: Math.round((json.categories.performance?.score ?? 0) * 100),
    accessibility: Math.round((json.categories.accessibility?.score ?? 0) * 100),
    bestPractices: Math.round((json.categories['best-practices']?.score ?? 0) * 100),
    seo: Math.round((json.categories.seo?.score ?? 0) * 100),
    fcp: Math.round(json.audits['first-contentful-paint']?.numericValue ?? 0),
    lcp: Math.round(json.audits['largest-contentful-paint']?.numericValue ?? 0),
    cls: (json.audits['cumulative-layout-shift']?.numericValue ?? 0).toFixed(3),
  }
}

console.log(`Lighthouse (desktop) — ${BASE}\n`)
const HEADER = `${'Template'.padEnd(16)} ${'Perf'.padStart(5)} ${'A11y'.padStart(5)} ${'BP'.padStart(5)} ${'SEO'.padStart(5)}   ${'FCP(ms)'.padStart(8)} ${'LCP(ms)'.padStart(8)} ${'CLS'.padStart(6)}`
console.log(HEADER)
console.log('─'.repeat(HEADER.length))

const rows = []
for (const [name, url] of URLS) {
  try {
    const r = await runLighthouse(BASE + url)
    console.log(
      `${name.padEnd(16)} ${String(r.performance).padStart(5)} ${String(r.accessibility).padStart(5)} ${String(r.bestPractices).padStart(5)} ${String(r.seo).padStart(5)}   ${String(r.fcp).padStart(8)} ${String(r.lcp).padStart(8)} ${r.cls.padStart(6)}`,
    )
    rows.push({ name, url, ...r })
  } catch (err) {
    console.log(`${name.padEnd(16)} ✗ ${err.message.split('\n')[0]}`)
  }
}

const ok = rows.filter((r) => r.performance >= 90 && r.accessibility >= 90 && r.seo >= 90).length
console.log(`\n${ok} / ${rows.length} hit ≥ 90 across Perf + A11y + SEO.`)
