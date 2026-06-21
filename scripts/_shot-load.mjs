import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
const [url, out] = [process.argv[2], process.argv[3]]
const dir = path.resolve('screenshots', out)
mkdirSync(dir, { recursive: true })
const b = await chromium.launch({ headless: true })
const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce', deviceScaleFactor: 1 })
const p = await ctx.newPage()
await p.goto(url, { waitUntil: 'load', timeout: 30000 })
await p.waitForTimeout(2000)
await p.screenshot({ path: path.join(dir, 'desktop-full.png'), fullPage: true })
const m = await ctx.newPage()
await m.setViewportSize({ width: 390, height: 844 })
await m.goto(url, { waitUntil: 'load', timeout: 30000 })
await m.waitForTimeout(1500)
await m.screenshot({ path: path.join(dir, 'mobile-full.png'), fullPage: true })
await b.close()
console.log('shot →', dir)
