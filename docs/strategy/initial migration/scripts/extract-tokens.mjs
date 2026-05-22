import { chromium } from 'playwright'
import fs from 'node:fs/promises'
import path from 'node:path'

const BASE = 'https://salesolution.net'

const PAGES = [
  '/',
  '/services/',
  '/services/ai-seo/',
  '/services/website-content-writing-packages/',
  '/contact-me/',
  '/future-proof-your-seo/',
  '/category/blog/',
  '/generative-engine-optimization-basic-to-advanced/',
]

function rgbToHex(rgb) {
  if (!rgb || typeof rgb !== 'string') return rgb
  const m = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/)
  if (!m) return rgb
  const [, r, g, b, a] = m
  const hex = '#' + [r, g, b].map(v => parseInt(v).toString(16).padStart(2, '0')).join('')
  return a !== undefined && parseFloat(a) < 1 ? `${hex}@${a}` : hex
}

const browser = await chromium.launch()
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
})
const page = await ctx.newPage()
page.setDefaultNavigationTimeout(60000)

// Aggregate maps
const fontFamilies = new Map()              // family -> {usages: Set, count}
const textColors = new Map()                // hex -> {count, examples}
const bgColors = new Map()                  // hex -> {count, examples, totalArea}
const borderRadii = new Map()
const shadows = new Map()
const fontSizes = new Map()                 // size -> {count, tagBreakdown}
const ctaButtons = []                       // primary CTA-looking buttons
const allSamples = {}

function bump(map, key, info, area = 0) {
  if (!key) return
  if (!map.has(key)) map.set(key, { count: 0, area: 0, examples: [] })
  const e = map.get(key)
  e.count++
  e.area += area
  if (info && e.examples.length < 8) e.examples.push(info)
}

for (const url of PAGES) {
  try {
    await page.goto(BASE + url, { waitUntil: 'domcontentloaded', timeout: 60000 })
    try { await page.waitForLoadState('networkidle', { timeout: 6000 }) } catch {}
    await page.waitForTimeout(500)

    const data = await page.evaluate(() => {
      const TRANSP = new Set(['rgba(0, 0, 0, 0)', 'transparent', ''])
      const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'META', 'LINK', 'TITLE', 'HEAD', 'HTML'])

      const everyElement = []
      const ctas = []
      const headings = { h1: [], h2: [], h3: [], h4: [] }
      const inputs = []
      const cards = []   // anything with a non-trivial shadow

      const all = document.querySelectorAll('body *')
      for (const el of all) {
        if (SKIP_TAGS.has(el.tagName)) continue
        const rect = el.getBoundingClientRect()
        if (rect.width < 4 || rect.height < 4) continue
        const cs = getComputedStyle(el)
        if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) === 0) continue

        const area = Math.round(rect.width * rect.height)
        const tag = el.tagName.toLowerCase()
        const cls = (el.className || '').toString().slice(0, 80)
        const txt = (el.innerText || '').trim().slice(0, 60).replace(/\s+/g, ' ')

        everyElement.push({
          tag, cls, area, txt,
          color: cs.color,
          backgroundColor: cs.backgroundColor,
          backgroundImage: cs.backgroundImage,
          fontFamily: cs.fontFamily,
          fontSize: cs.fontSize,
          fontWeight: cs.fontWeight,
          lineHeight: cs.lineHeight,
          borderRadius: cs.borderRadius,
          boxShadow: cs.boxShadow,
          padding: cs.padding,
          textTransform: cs.textTransform,
        })

        // Heading samples
        if (['h1','h2','h3','h4'].includes(tag)) {
          headings[tag].push({ tag, cls, txt, fontFamily: cs.fontFamily, fontSize: cs.fontSize, fontWeight: cs.fontWeight, lineHeight: cs.lineHeight, color: cs.color, letterSpacing: cs.letterSpacing })
        }

        // CTAs: look for likely buttons by element + content
        const looksLikeButton =
          tag === 'button' ||
          (tag === 'a' && /\bbtn|button\b/i.test(cls)) ||
          (tag === 'a' && /Audit|Quote|Call|Get|Book|Start|Try/i.test(txt) && txt.length < 50 && area > 1000 && area < 50000)
        if (looksLikeButton && !TRANSP.has(cs.backgroundColor)) {
          ctas.push({
            tag, cls, txt,
            backgroundColor: cs.backgroundColor,
            color: cs.color,
            borderRadius: cs.borderRadius,
            padding: cs.padding,
            fontFamily: cs.fontFamily,
            fontSize: cs.fontSize,
            fontWeight: cs.fontWeight,
            textTransform: cs.textTransform,
            boxShadow: cs.boxShadow,
            border: cs.border,
          })
        }

        // Inputs
        if (tag === 'input' || tag === 'textarea' || tag === 'select') {
          inputs.push({
            tag, cls,
            backgroundColor: cs.backgroundColor,
            color: cs.color,
            borderColor: cs.borderColor,
            borderWidth: cs.borderWidth,
            borderRadius: cs.borderRadius,
            padding: cs.padding,
            fontSize: cs.fontSize,
            fontFamily: cs.fontFamily,
          })
        }

        // "Card"-like elements: have a shadow and a non-trivial area
        if (cs.boxShadow && cs.boxShadow !== 'none' && area > 5000) {
          cards.push({
            tag, cls, area, txt,
            backgroundColor: cs.backgroundColor,
            borderRadius: cs.borderRadius,
            boxShadow: cs.boxShadow,
            padding: cs.padding,
          })
        }
      }

      // Section-like: top-level descendants with significant area and a non-transparent bg
      const sectionish = []
      const candidates = [
        ...document.querySelectorAll('body > *, main > *, body > div > *, .container > *, .row > *')
      ]
      for (const el of candidates) {
        if (SKIP_TAGS.has(el.tagName)) continue
        const rect = el.getBoundingClientRect()
        if (rect.height < 100 || rect.width < 600) continue
        const cs = getComputedStyle(el)
        if (TRANSP.has(cs.backgroundColor) && (!cs.backgroundImage || cs.backgroundImage === 'none')) continue
        sectionish.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className || '').toString().slice(0, 80),
          height: Math.round(rect.height),
          width: Math.round(rect.width),
          backgroundColor: cs.backgroundColor,
          backgroundImage: cs.backgroundImage !== 'none' ? cs.backgroundImage.slice(0, 80) : null,
          topText: (el.innerText || '').trim().slice(0, 60).replace(/\s+/g, ' '),
        })
      }

      // Linked font resources
      const fontResources = [...document.querySelectorAll('link[href*="font"], link[href*="fonts.googleapis"], link[href*="fonts.gstatic"]')]
        .map(l => l.href)

      return { everyElement, ctas, headings, inputs, cards, sectionish, fontResources }
    })

    // Aggregate
    for (const el of data.everyElement) {
      if (el.fontFamily) {
        if (!fontFamilies.has(el.fontFamily)) fontFamilies.set(el.fontFamily, { count: 0, sizes: new Set() })
        const e = fontFamilies.get(el.fontFamily)
        e.count++
        e.sizes.add(el.fontSize)
      }
      if (el.color && el.color !== 'rgba(0, 0, 0, 0)') bump(textColors, rgbToHex(el.color), `${el.tag} "${el.txt.slice(0,30)}"`, el.area)
      if (el.backgroundColor && el.backgroundColor !== 'rgba(0, 0, 0, 0)') bump(bgColors, rgbToHex(el.backgroundColor), `${el.tag}.${el.cls.slice(0,30)} "${el.txt.slice(0,30)}"`, el.area)
      if (el.borderRadius && el.borderRadius !== '0px') bump(borderRadii, el.borderRadius, `${el.tag}.${el.cls.slice(0,30)}`)
      if (el.boxShadow && el.boxShadow !== 'none') bump(shadows, el.boxShadow, `${el.tag}.${el.cls.slice(0,30)}`)
      if (['h1','h2','h3','h4'].includes(el.tag)) bump(fontSizes, `${el.tag}: ${el.fontSize}`, `weight=${el.fontWeight} lh=${el.lineHeight}`)
    }
    for (const cta of data.ctas) ctaButtons.push({ url, ...cta, backgroundColor: rgbToHex(cta.backgroundColor), color: rgbToHex(cta.color) })

    allSamples[url] = {
      ctas: data.ctas.slice(0, 10).map(c => ({ ...c, backgroundColor: rgbToHex(c.backgroundColor), color: rgbToHex(c.color) })),
      headings: {
        h1: data.headings.h1.slice(0, 3).map(h => ({ ...h, color: rgbToHex(h.color) })),
        h2: data.headings.h2.slice(0, 5).map(h => ({ ...h, color: rgbToHex(h.color) })),
        h3: data.headings.h3.slice(0, 5).map(h => ({ ...h, color: rgbToHex(h.color) })),
      },
      inputs: data.inputs.slice(0, 3).map(i => ({ ...i, backgroundColor: rgbToHex(i.backgroundColor), color: rgbToHex(i.color), borderColor: rgbToHex(i.borderColor) })),
      cards: data.cards.slice(0, 5).map(c => ({ ...c, backgroundColor: rgbToHex(c.backgroundColor) })),
      sectionish: data.sectionish.slice(0, 15).map(s => ({ ...s, backgroundColor: rgbToHex(s.backgroundColor) })),
      fontResources: data.fontResources,
    }

    console.log(`✓ ${url}  (${data.everyElement.length} els, ${data.ctas.length} ctas, ${data.cards.length} cards)`)
  } catch (err) {
    console.log(`✗ ${url}: ${err.message}`)
  }
}

await browser.close()

const sortByCount = (a, b) => b[1].count - a[1].count
const summary = {
  generatedAt: new Date().toISOString(),
  base: BASE,
  pagesSampled: PAGES,

  fonts: [...fontFamilies.entries()].map(([family, info]) => ({
    family,
    usageCount: info.count,
    sizesUsed: [...info.sizes].sort(),
  })).sort((a, b) => b.usageCount - a.usageCount),

  textColors: [...textColors.entries()].sort(sortByCount).map(([hex, info]) => ({ hex, count: info.count, examples: info.examples })),
  backgroundColors: [...bgColors.entries()].sort((a,b) => b[1].area - a[1].area).map(([hex, info]) => ({ hex, count: info.count, totalArea: info.area, examples: info.examples })),
  borderRadii: [...borderRadii.entries()].sort(sortByCount).map(([v, info]) => ({ value: v, count: info.count, examples: info.examples })),
  shadows: [...shadows.entries()].sort(sortByCount).map(([v, info]) => ({ value: v, count: info.count, examples: info.examples })),
  headingFontSizes: [...fontSizes.entries()].sort(sortByCount).map(([k, info]) => ({ key: k, count: info.count, examples: info.examples })),
  ctaButtons,
  samples: allSamples,
}

const outJson = path.resolve(import.meta.dirname, '..', 'design-tokens.json')
await fs.writeFile(outJson, JSON.stringify(summary, null, 2))
console.log(`\n→ ${outJson} (${(JSON.stringify(summary).length / 1024).toFixed(0)} KB)`)
console.log(`fonts=${summary.fonts.length} text=${summary.textColors.length} bg=${summary.backgroundColors.length} radii=${summary.borderRadii.length} shadows=${summary.shadows.length} ctas=${summary.ctaButtons.length}`)
