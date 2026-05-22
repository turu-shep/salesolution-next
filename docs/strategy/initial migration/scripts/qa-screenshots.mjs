#!/usr/bin/env node
/**
 * Take full-page screenshots of every content route and save to /tmp/ss-qa
 * so we can visually QA them. Also captures any console errors per route.
 */
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'

const OUT = '/tmp/ss-qa'
mkdirSync(OUT, { recursive: true })

const ROUTES = [
  ['blog-index', '/category/blog/'],
  ['post-content-marketing', '/content-marketing-101/'],
  ['post-strategies-ecom', '/strategies-to-increase-e-commerce-conversion-rate/'],
  ['post-geo', '/generative-engine-optimization-basic-to-advanced/'],
  ['guides-index', '/guides/'],
  ['guide-performance', '/guides/website-performance-optimization-guide/'],
  ['guide-series-part1', '/guides/website-launch-checklist-series-part-1-seo-and-crawling/'],
  ['career-paths', '/career-paths/'],
]

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

const errors = {}
for (const [name, url] of ROUTES) {
  const page = await ctx.newPage()
  const consoleErrs = []
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') consoleErrs.push(`${msg.type()}: ${msg.text()}`)
  })
  page.on('pageerror', (err) => consoleErrs.push(`pageerror: ${err.message}`))
  try {
    const resp = await page.goto(`http://localhost:3001${url}`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(500)
    await page.screenshot({ path: `${OUT}/${name}-full.png`, fullPage: true })
    await page.screenshot({ path: `${OUT}/${name}-fold.png`, fullPage: false }) // viewport only
    console.log(`${name.padEnd(30)} ${resp.status()}  errors:${consoleErrs.length}`)
    if (consoleErrs.length) errors[name] = consoleErrs
  } catch (e) {
    console.log(`${name.padEnd(30)} FAIL ${e.message}`)
    errors[name] = [e.message]
  }
  await page.close()
}

await browser.close()

if (Object.keys(errors).length) {
  writeFileSync(`${OUT}/console-errors.json`, JSON.stringify(errors, null, 2))
  console.log(`\nConsole/page errors written to ${OUT}/console-errors.json`)
}
console.log(`\nScreenshots in ${OUT}/`)
