#!/usr/bin/env node
import { chromium } from 'playwright'

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()

await page.goto('http://localhost:3001/content-marketing-101/', { waitUntil: 'networkidle' })

// Find any "Image Source" text remaining
const remaining = await page.evaluate(() => {
  const body = document.querySelector('.article-body')
  if (!body) return null
  const all = Array.from(body.querySelectorAll('p, h2, h3, h4'))
  return all
    .filter((e) => /image source/i.test(e.innerText))
    .map((e) => ({ tag: e.tagName, text: e.innerText.slice(0, 100), y: e.getBoundingClientRect().top + window.scrollY }))
})
console.log('Image Source mentions remaining:')
console.log(JSON.stringify(remaining, null, 2))

// Also find any "Build a 30-Day" heading and screenshot that area
const heading = await page.evaluate(() => {
  const h = Array.from(document.querySelectorAll('h2,h3')).find((e) => /30-day execution/i.test(e.innerText))
  if (!h) return null
  return { y: h.getBoundingClientRect().top + window.scrollY }
})
if (heading) {
  await page.evaluate((y) => window.scrollTo(0, y - 80), heading.y)
  await page.waitForTimeout(500)
  await page.screenshot({ path: '/tmp/ss-qa/after-orphan-cleanup.png', fullPage: false })
  console.log('saved /tmp/ss-qa/after-orphan-cleanup.png')
}

await browser.close()
