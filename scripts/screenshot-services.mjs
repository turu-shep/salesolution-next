#!/usr/bin/env node
/**
 * Screenshot every service page at multiple viewports for verification.
 * Outputs PNGs to `screenshots/round-{N}/{page}-{viewport}.png`.
 *
 * Run with:
 *   node scripts/screenshot-services.mjs <round-number> [base-url]
 *
 * Example:
 *   node scripts/screenshot-services.mjs 1 http://localhost:3001
 */
import { chromium } from 'playwright'
import { mkdirSync, existsSync, rmSync } from 'node:fs'
import path from 'node:path'

const round = process.argv[2] || '1'
const baseUrl = process.argv[3] || 'http://localhost:3001'

const PAGES = [
  { name: 'services-index', url: '/services/' },
  { name: 'ai-seo', url: '/services/ai-seo/' },
  { name: 'catalog-ai', url: '/services/catalog-ai/' },
  { name: 'editorial-authority', url: '/services/editorial-authority/' },
  { name: 'website-dev', url: '/services/website-development-design-services/' },
  { name: 'outbound-email', url: '/services/outbound-email-marketing-services/' },
  { name: 'full-growth-ownership', url: '/services/full-growth-ownership/' },
]

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  // Mobile only for round 1 — adds time; uncomment if needed for design polish
  // { name: 'mobile', width: 390, height: 844 },
]

const outDir = path.resolve(`screenshots/round-${round}`)
if (existsSync(outDir)) rmSync(outDir, { recursive: true })
mkdirSync(outDir, { recursive: true })

const browser = await chromium.launch({ headless: true })

console.log(`Screenshotting against ${baseUrl} → ${outDir}\n`)

const results = []
for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  })
  for (const page of PAGES) {
    const p = await ctx.newPage()
    const url = `${baseUrl}${page.url}`
    const t0 = Date.now()
    try {
      const resp = await p.goto(url, {
        waitUntil: 'networkidle',
        timeout: 60000,
      })
      // Give animations/fonts a beat to settle
      await p.waitForTimeout(800)
      const file = path.join(outDir, `${page.name}-${vp.name}.png`)
      await p.screenshot({ path: file, fullPage: true })
      const status = resp?.status() ?? '?'
      const ms = Date.now() - t0
      results.push({ page: page.name, viewport: vp.name, status, ms, file })
      console.log(`✓ ${page.name} (${vp.name}) — ${status} in ${ms}ms`)
    } catch (err) {
      console.log(`✗ ${page.name} (${vp.name}) — ${err.message}`)
      results.push({ page: page.name, viewport: vp.name, error: err.message })
    } finally {
      await p.close()
    }
  }
  await ctx.close()
}

await browser.close()

console.log('\nSummary:')
console.table(results)
