#!/usr/bin/env node
import { chromium } from 'playwright'

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()

await page.goto('http://localhost:3001/content-marketing-101/', { waitUntil: 'networkidle' })

// Find "Choose the Right Content Types and Channels" heading
const heading = await page.evaluate(() => {
  const all = Array.from(document.querySelectorAll('h2, h3'))
  const h = all.find((e) => e.innerText.toLowerCase().includes('choose the right content'))
  if (!h) return null
  const r = h.getBoundingClientRect()
  return { y: r.top + window.scrollY, text: h.innerText, tag: h.tagName }
})

console.log('heading found:', heading)

if (heading) {
  await page.evaluate((y) => window.scrollTo(0, y - 80), heading.y)
  await page.waitForTimeout(500)
  await page.screenshot({ path: '/tmp/ss-qa/specific-choose-content.png', fullPage: false })
  console.log('saved /tmp/ss-qa/specific-choose-content.png')
}

await browser.close()
