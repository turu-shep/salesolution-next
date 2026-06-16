/**
 * Single-browser, serial screenshot capture for the Full Growth Ownership
 * surfaces. ONE chromium instance, captures run sequentially, browser closes
 * at the end. Never run two of these concurrently.
 *
 *   node scripts/screenshot-fgo.mjs [baseUrl] [outSubdir]
 *
 * Defaults: http://localhost:3000, screenshots/fgo/<run>
 */
import { chromium } from 'playwright'
import { mkdirSync, existsSync, rmSync } from 'node:fs'
import path from 'node:path'

const baseUrl = process.argv[2] || 'http://localhost:3000'
const runDir = process.argv[3] || 'baseline'
const outDir = path.resolve('screenshots/fgo', runDir)
if (existsSync(outDir)) rmSync(outDir, { recursive: true })
mkdirSync(outDir, { recursive: true })

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
}

// Pages and the in-page sections worth a tight crop. `full` => full-page shot.
const TARGETS = [
  {
    name: 'fgo',
    url: '/services/full-growth-ownership/',
    sections: [
      { name: 'shapes', text: /Pick the one that fits/i },
      { name: 'included', text: /Coordinated under one roof/i },
      { name: 'comparison', text: /Three real options/i },
      { name: 'timeline', text: /No black box/i },
    ],
  },
  {
    name: 'quote',
    url: '/full-growth-quote/',
    sections: [{ name: 'form', text: /Three steps\. About three minutes\./i }],
  },
  {
    name: 'services-hub',
    url: '/services/',
    sections: [{ name: 'index', text: /Seven services/i }],
  },
]

// Hide the things that pollute a design review: HubSpot chat bubble, and any
// stray fixed overlays. Injected on every page before any script runs.
const HIDE_CSS = `
  #hubspot-messages-iframe-container,
  [id^="hubspot-messages"],
  div[data-test-id="cookie-banner"] { display: none !important; }
`
// Pre-seed a decided consent choice so the cookie banner never renders.
const CONSENT_INIT = `
  try { localStorage.setItem('ss_consent', JSON.stringify({ analytics: true, marketing: true, decided: true })); } catch (e) {}
`

const browser = await chromium.launch({ headless: true })
try {
  for (const [vpName, viewport] of Object.entries(VIEWPORTS)) {
    const ctx = await browser.newContext({ viewport, reducedMotion: 'reduce', deviceScaleFactor: 1 })
    await ctx.addInitScript(CONSENT_INIT)
    const p = await ctx.newPage()
    for (const t of TARGETS) {
      try {
        await p.goto(`${baseUrl}${t.url}`, { waitUntil: 'networkidle', timeout: 90000 })
        await p.addStyleTag({ content: HIDE_CSS })
        await p.waitForTimeout(500)
        // Full-page shot
        await p.screenshot({ path: path.join(outDir, `${t.name}-${vpName}-full.png`), fullPage: true })
        console.log(`✓ ${t.name}-${vpName}-full`)
        // Section crops (desktop only to keep the set tight)
        if (vpName === 'desktop') {
          for (const s of t.sections) {
            try {
              const el = p.getByText(s.text).first()
              await el.scrollIntoViewIfNeeded()
              await p.waitForTimeout(250)
              await p.screenshot({ path: path.join(outDir, `${t.name}-${s.name}.png`) })
              console.log(`✓ ${t.name}-${s.name}`)
            } catch (e) {
              console.log(`✗ ${t.name}-${s.name} — ${e.message.split('\n')[0]}`)
            }
          }
        }
      } catch (e) {
        console.log(`✗ ${t.name}-${vpName} — ${e.message.split('\n')[0]}`)
      }
    }
    await ctx.close()
  }
} finally {
  await browser.close()
}
console.log(`\nDone → ${outDir}`)
