#!/usr/bin/env node
/**
 * Screenshot the case-studies hub + detail pages for verification.
 * Outputs full-page PNGs to `screenshots/case-studies-{round}/`.
 *
 * Run with:
 *   node scripts/screenshot-case-studies.mjs <round-number> [base-url]
 */
import { chromium } from 'playwright'
import { mkdirSync, existsSync, rmSync } from 'node:fs'
import path from 'node:path'

const round = process.argv[2] || '1'
const baseUrl = process.argv[3] || 'http://localhost:3001'

const PAGES = [
  { name: 'hub', url: '/case-studies/' },
  { name: 'catalog-flagship', url: '/case-studies/hydraulics-distributor-catalog-ai-qualified-leads/' },
  { name: 'editorial', url: '/case-studies/automation-distributor-editorial-authority-aio-citations/' },
  { name: 'replatform', url: '/case-studies/hydraulics-distributor-headless-replatform/' },
  { name: 'greenfield', url: '/case-studies/fluid-power-oem-greenfield-aio-launch/' },
  { name: 'fasteners', url: '/case-studies/fasteners-distributor-shopify-plus-migration/' },
]

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
]

const outDir = path.resolve(`screenshots/case-studies-${round}`)
if (existsSync(outDir)) rmSync(outDir, { recursive: true })
mkdirSync(outDir, { recursive: true })

const browser = await chromium.launch({ headless: true })

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
  const page = await ctx.newPage()
  for (const p of PAGES) {
    await page.goto(`${baseUrl}${p.url}`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(400)
    await page.screenshot({
      path: path.join(outDir, `${p.name}-${vp.name}.png`),
      fullPage: true,
    })
    console.log(`✓ ${p.name} (${vp.name})`)
  }
  await ctx.close()
}

await browser.close()
console.log(`\nScreenshots in ${outDir}`)
