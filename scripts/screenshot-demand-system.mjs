import { chromium } from 'playwright'
import { mkdirSync, existsSync, rmSync } from 'node:fs'
import path from 'node:path'

const baseUrl = process.argv[2] || 'http://localhost:3000'
const outDir = path.resolve('screenshots/demand-system')
if (existsSync(outDir)) rmSync(outDir, { recursive: true })
mkdirSync(outDir, { recursive: true })

const browser = await chromium.launch({ headless: true })

// Desktop — full section (reduced motion = final state of the rise-in)
let ctx = await browser.newContext({ viewport: { width: 1440, height: 1200 }, reducedMotion: 'reduce' })
let p = await ctx.newPage()
await p.goto(`${baseUrl}/`, { waitUntil: 'networkidle', timeout: 60000 })
await p.waitForTimeout(600)
const section = p.locator('#demand-system')
await section.scrollIntoViewIfNeeded()
await p.waitForTimeout(400)
await section.screenshot({ path: path.join(outDir, 'desktop.png') })
console.log('✓ desktop')

// Desktop — a source chip hovered (tooltip visible)
const chip = p.getByRole('button', { name: 'AI search & chat' })
await chip.hover()
await p.waitForTimeout(300)
await section.screenshot({ path: path.join(outDir, 'desktop-hover.png') })
console.log('✓ desktop-hover')
await p.close(); await ctx.close()

// Mobile
ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, reducedMotion: 'reduce' })
p = await ctx.newPage()
await p.goto(`${baseUrl}/`, { waitUntil: 'networkidle', timeout: 60000 })
await p.waitForTimeout(600)
const msec = p.locator('#demand-system')
await msec.scrollIntoViewIfNeeded()
await p.waitForTimeout(400)
await msec.screenshot({ path: path.join(outDir, 'mobile.png') })
console.log('✓ mobile')
await p.close(); await ctx.close()

await browser.close()
