import { chromium } from 'playwright'
import { mkdirSync, existsSync, rmSync } from 'node:fs'
import path from 'node:path'

// Single shared browser, serial captures. Reuses the already-running dev
// server (default :3000). Pass a base URL as argv[2] to override.
const baseUrl = process.argv[2] || 'http://localhost:3000'
const routePath = process.argv[3] || '/revenue-engine/'
const tag = process.argv[4] || 'r1'
const outDir = path.resolve('screenshots/revenue-engine', tag)
if (existsSync(outDir)) rmSync(outDir, { recursive: true })
mkdirSync(outDir, { recursive: true })

const browser = await chromium.launch({ headless: true })

// Desktop — above-fold viewport + full page
let ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
let p = await ctx.newPage()
await p.goto(`${baseUrl}${routePath}`, { waitUntil: 'networkidle', timeout: 60000 })
await p.waitForTimeout(700)
await p.screenshot({ path: path.join(outDir, 'desktop-hero.png') })
console.log('✓ desktop-hero')
await p.screenshot({ path: path.join(outDir, 'desktop-full.png'), fullPage: true })
console.log('✓ desktop-full')
await p.close(); await ctx.close()

// Mobile — full page
ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, reducedMotion: 'reduce' })
p = await ctx.newPage()
await p.goto(`${baseUrl}${routePath}`, { waitUntil: 'networkidle', timeout: 60000 })
await p.waitForTimeout(700)
await p.screenshot({ path: path.join(outDir, 'mobile-full.png'), fullPage: true })
console.log('✓ mobile-full')
await p.close(); await ctx.close()

await browser.close()
console.log('done →', outDir)
