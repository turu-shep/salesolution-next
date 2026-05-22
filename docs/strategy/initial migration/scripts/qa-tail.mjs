#!/usr/bin/env node
import { chromium } from 'playwright'

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()

await page.goto('http://localhost:3001/content-marketing-101/', { waitUntil: 'networkidle' })
await page.waitForTimeout(500)

// Scroll near the end of the article body to capture related-posts section
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight - 1800))
await page.waitForTimeout(400)
await page.screenshot({ path: '/tmp/ss-qa/post-tail.png', fullPage: false })

// Also navigate to a category page and tag page if they exist
await page.goto('http://localhost:3001/category/blog/', { waitUntil: 'networkidle' })
await page.evaluate(() => window.scrollTo(0, 1200))
await page.waitForTimeout(400)
await page.screenshot({ path: '/tmp/ss-qa/blog-index-grid.png', fullPage: false })

await browser.close()
console.log('done')
