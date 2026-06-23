import { chromium } from 'playwright'

// Usage: node scripts/_section-shot.mjs <url> <selector> <outPath>
const [url, selector, out] = [process.argv[2], process.argv[3], process.argv[4]]
const b = await chromium.launch({ headless: true })
const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' })
const p = await ctx.newPage()
await p.goto(url, { waitUntil: 'load', timeout: 45000 })
await p.waitForTimeout(1100)
await p.evaluate((sel) => {
  const el = document.querySelector(sel)
  if (el) el.scrollIntoView({ block: 'start' })
}, selector)
await p.waitForTimeout(500)
await p.screenshot({ path: out })
await b.close()
console.log('section shot ->', out)
