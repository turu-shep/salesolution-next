import { chromium } from 'playwright'

const url = process.argv[2] || 'http://localhost:3000/revenue-engine/'
const out = process.argv[3] || 'screenshots/revenue-engine/iter3/footer.png'
const b = await chromium.launch({ headless: true })
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
const p = await ctx.newPage()
await p.goto(url, { waitUntil: 'load', timeout: 45000 })
await p.waitForTimeout(1200)
await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
await p.waitForTimeout(800)
await p.screenshot({ path: out })
await b.close()
console.log('footer shot ->', out)
