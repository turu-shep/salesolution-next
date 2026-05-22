#!/usr/bin/env node
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const OUT = '/tmp/ss-qa'
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()

await page.goto('http://localhost:3001/content-marketing-101/', { waitUntil: 'networkidle' })

// Find the article-body — element screenshot scrolls into view automatically
const body = await page.$('.article-body')
if (body) {
  await body.scrollIntoViewIfNeeded()
  await page.waitForTimeout(300)
  await body.screenshot({ path: `${OUT}/article-body-content-marketing.png` })
}

// Look for an h2 with following list or paragraph with strong
const sample = await page.evaluate(() => {
  const body = document.querySelector('.article-body')
  if (!body) return null
  const ul = body.querySelector('ul')
  const ulRect = ul?.getBoundingClientRect()
  const strong = body.querySelector('strong')
  const strongRect = strong?.getBoundingClientRect()
  const link = body.querySelector('a[href]')
  const linkRect = link?.getBoundingClientRect()
  const h2 = body.querySelector('h2')
  const h2Rect = h2?.getBoundingClientRect()
  return {
    ul: ul ? { y: ulRect.y + window.scrollY, text: ul.innerText.slice(0, 80) } : null,
    strong: strong ? { y: strongRect.y + window.scrollY, text: strong.innerText.slice(0, 60) } : null,
    link: link ? { y: linkRect.y + window.scrollY, text: link.innerText.slice(0, 60), href: link.href } : null,
    h2: h2 ? { y: h2Rect.y + window.scrollY, text: h2.innerText.slice(0, 60) } : null,
  }
})
console.log(JSON.stringify(sample, null, 2))

// Take a screenshot centered on the first <ul> if found
if (sample?.ul) {
  await page.evaluate((y) => window.scrollTo(0, y - 200), sample.ul.y)
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${OUT}/article-body-around-list.png`, fullPage: false })
}

if (sample?.h2) {
  await page.evaluate((y) => window.scrollTo(0, y - 100), sample.h2.y)
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${OUT}/article-body-around-h2.png`, fullPage: false })
}

await browser.close()
