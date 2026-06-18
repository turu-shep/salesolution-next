// Temp visual-QA helper (gitignored deps). Single browser, serial.
// Usage: node scripts/_visual-check.mjs <url> <w> <h> [screenshotPath]
import { chromium } from 'playwright'

const url = process.argv[2] || 'http://localhost:3000/industries/industrial-distribution/'
const w = Number(process.argv[3] || 390)
const h = Number(process.argv[4] || 844)
const out = process.argv[5]

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 })
await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForTimeout(700)

const info = await page.evaluate((vw) => {
  const docW = document.documentElement.scrollWidth
  const culprits = []
  for (const el of document.querySelectorAll('*')) {
    const r = el.getBoundingClientRect()
    if (r.width > 0 && r.right > vw + 1) {
      culprits.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.getAttribute('class') || '').slice(0, 90),
        right: Math.round(r.right),
        width: Math.round(r.width),
        text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 45),
      })
    }
  }
  return { viewport: vw, documentScrollWidth: docW, overflowCount: culprits.length, culprits: culprits.slice(0, 30) }
}, w)

console.log(JSON.stringify(info, null, 2))
if (out) await page.screenshot({ path: out })
await browser.close()
