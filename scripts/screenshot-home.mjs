import { chromium } from 'playwright'
import { mkdirSync, existsSync, rmSync } from 'node:fs'
import path from 'node:path'

const baseUrl = process.argv[2] || 'http://localhost:3001'
const outDir = path.resolve('screenshots/homepage')
if (existsSync(outDir)) rmSync(outDir, { recursive: true })
mkdirSync(outDir, { recursive: true })

const browser = await chromium.launch({ headless: true })
let ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
let p = await ctx.newPage()
await p.goto(`${baseUrl}/`, { waitUntil: 'networkidle', timeout: 60000 })
await p.waitForTimeout(800)
await p.screenshot({ path: path.join(outDir, 'home-desktop.png'), fullPage: true })
console.log('✓ home-desktop')
await p.close(); await ctx.close()
ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, reducedMotion: 'reduce' })
p = await ctx.newPage()
await p.goto(`${baseUrl}/`, { waitUntil: 'networkidle', timeout: 60000 })
await p.waitForTimeout(800)
await p.screenshot({ path: path.join(outDir, 'home-mobile.png'), fullPage: true })
console.log('✓ home-mobile')
await p.close(); await ctx.close()
await browser.close()
