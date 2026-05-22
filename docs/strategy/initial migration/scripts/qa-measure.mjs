#!/usr/bin/env node
import { chromium } from 'playwright'

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

const targets = [
  ['post', '/content-marketing-101/'],
  ['post', '/strategies-to-increase-e-commerce-conversion-rate/'],
  ['guide', '/guides/website-performance-optimization-guide/'],
  ['guide-series', '/guides/website-launch-checklist-series-part-1-seo-and-crawling/'],
]

for (const [kind, url] of targets) {
  const page = await ctx.newPage()
  await page.goto(`http://localhost:3001${url}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)

  // Measure where the body content starts (top of .article-body or first body block)
  const m = await page.evaluate(() => {
    const VH = window.innerHeight
    const body = document.querySelector('.article-body')
    const ab = body?.getBoundingClientRect()
    const h1 = document.querySelector('h1')
    const h1r = h1?.getBoundingClientRect()
    const cover = document.querySelector('section figure img')
    const cr = cover?.getBoundingClientRect()
    return {
      vh: VH,
      h1_top: h1r ? Math.round(h1r.top + window.scrollY) : null,
      cover_top: cr ? Math.round(cr.top + window.scrollY) : null,
      cover_bottom: cr ? Math.round(cr.bottom + window.scrollY) : null,
      body_top: ab ? Math.round(ab.top + window.scrollY) : null,
    }
  })

  const heroPixels = m.body_top ?? m.cover_bottom ?? '?'
  console.log(
    `${kind.padEnd(14)} ${url.padEnd(70)} ` +
      `vh:${m.vh}  h1:${m.h1_top}  cover_top:${m.cover_top}  cover_bottom:${m.cover_bottom}  body_top:${m.body_top}  hero≈${heroPixels}px (${typeof heroPixels === 'number' ? (heroPixels / m.vh).toFixed(2) + ' viewports' : ''})`,
  )
  await page.close()
}

await browser.close()
