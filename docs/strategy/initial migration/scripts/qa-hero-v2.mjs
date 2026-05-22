#!/usr/bin/env node
import { chromium } from 'playwright'

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

const tests = [
  ['post-cm', '/content-marketing-101/'],
  ['post-ecom', '/strategies-to-increase-e-commerce-conversion-rate/'],
  ['post-geo', '/generative-engine-optimization-basic-to-advanced/'],
]

for (const [name, url] of tests) {
  const page = await ctx.newPage()
  await page.goto(`http://localhost:3001${url}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  await page.screenshot({ path: `/tmp/ss-qa/hero-v2-${name}.png`, fullPage: false })

  // Measure
  const m = await page.evaluate(() => {
    const VH = window.innerHeight
    const body = document.querySelector('.article-body')
    const ab = body?.getBoundingClientRect()
    return {
      vh: VH,
      body_top: ab ? Math.round(ab.top + window.scrollY) : null,
    }
  })
  console.log(
    `${name.padEnd(12)} body starts at ${m.body_top}px (${(m.body_top / m.vh).toFixed(2)} viewports)`,
  )
  await page.close()
}

// Also mobile
const mobileCtx = await browser.newContext({ viewport: { width: 390, height: 844 } })
const mp = await mobileCtx.newPage()
await mp.goto('http://localhost:3001/content-marketing-101/', { waitUntil: 'networkidle' })
await mp.waitForTimeout(500)
await mp.screenshot({ path: '/tmp/ss-qa/hero-v2-mobile.png', fullPage: false })
console.log('mobile screenshot saved')

await browser.close()
