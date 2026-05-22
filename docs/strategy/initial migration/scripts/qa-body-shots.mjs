#!/usr/bin/env node
import { chromium } from 'playwright'

const OUT = '/tmp/ss-qa'

const targets = [
  ['post-strategies-body', '/strategies-to-increase-e-commerce-conversion-rate/'],
  ['post-cm-body', '/content-marketing-101/'],
  ['guide-perf-body', '/guides/website-performance-optimization-guide/'],
  ['guide-series1-body', '/guides/website-launch-checklist-series-part-1-seo-and-crawling/'],
]

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

for (const [name, url] of targets) {
  const page = await ctx.newPage()
  await page.goto(`http://localhost:3001${url}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)

  // Scroll to the first inline image inside .article-body (or first ul)
  const target = await page.evaluate(() => {
    const body = document.querySelector('.article-body')
    if (!body) return null
    const img = body.querySelector('figure img, img')
    if (img) {
      const r = img.getBoundingClientRect()
      return { kind: 'img', y: r.y + window.scrollY }
    }
    const ul = body.querySelector('ul')
    if (ul) {
      const r = ul.getBoundingClientRect()
      return { kind: 'ul', y: r.y + window.scrollY }
    }
    return null
  })

  if (target) {
    await page.evaluate((y) => window.scrollTo(0, y - 100), target.y)
    await page.waitForTimeout(400)
    await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false })
    console.log(`${name}: shot at first ${target.kind} (y=${Math.round(target.y)})`)
  } else {
    console.log(`${name}: no body found`)
  }
  await page.close()
}

await browser.close()
