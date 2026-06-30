/**
 * Generate + brand-treat the /industries/ vertical images.
 *
 *   node --env-file=.env.local scripts/_gen-industry-images.mjs <key|all>
 *
 * Generates with OpenAI gpt-image-1 (raw cached to .cache/industry-raw/ so
 * re-treating never re-bills), then reprocesses with sharp to a restrained
 * editorial duotone in the brand palette, output as optimized webp to
 * public/industries/<key>.webp. Tooling-only; not committed-source critical.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import sharp from 'sharp'

const RAW_DIR = path.resolve('.cache/industry-raw')
const OUT_DIR = path.resolve('public/industries')
mkdirSync(RAW_DIR, { recursive: true })
mkdirSync(OUT_DIR, { recursive: true })

// Duotone endpoints. shadow = near-black ink; highlight = the vertical's brand
// tone. Keeps the 4 cohesive while colour-coding the two funnels.
const INK = { r: 12, g: 14, b: 20 }
const BRAND = { r: 37, g: 99, b: 235 } // brand-600 (industrial)
const ACCENT = { r: 234, g: 88, b: 12 } // accent-600 (revenue engine)

const STYLE =
  'Editorial documentary photography, soft natural light, calm and premium, ' +
  'shallow depth of field, muted tones, no people facing camera, no text, no ' +
  'words, no signage, no logos, no watermarks.'

const SPECS = {
  industrial: {
    tone: BRAND,
    prompt:
      'A clean modern industrial parts-distribution warehouse aisle, neatly ' +
      'organized rows of hydraulic fittings and metal components on shelving. ' +
      STYLE,
  },
  medical: {
    tone: ACCENT,
    prompt:
      'A clean, modern, empty dental practice treatment room, professional and ' +
      'calm, daylight through a window. ' + STYLE,
  },
  'home-services': {
    tone: ACCENT,
    prompt:
      'A residential roof with a professional roofing contractor working, seen ' +
      'from a respectful distance at golden hour, suburban neighborhood. ' + STYLE,
  },
  // Consumer & DTC brands is a SELL-PRODUCT motion (Phase 5 flip) → brand-blue,
  // matching industrial. (Image file stays local-retail.webp; the pillar lives
  // at /industries/consumer-brands/.)
  'local-retail': {
    tone: BRAND,
    prompt:
      'A bright modern local retail showroom interior with tidy product ' +
      'displays and warm inviting light, no shoppers. ' + STYLE,
  },
}

async function generateRaw(key) {
  const rawPath = path.join(RAW_DIR, `${key}.png`)
  if (existsSync(rawPath)) {
    console.log(`  • raw cached: ${key}`)
    return rawPath
  }
  console.log(`  • generating: ${key} …`)
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt: SPECS[key].prompt,
      size: '1536x1024',
      quality: 'medium',
      n: 1,
    }),
  })
  if (!res.ok) {
    throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 300)}`)
  }
  const json = await res.json()
  const b64 = json.data?.[0]?.b64_json
  if (!b64) throw new Error(`no image in response for ${key}`)
  writeFileSync(rawPath, Buffer.from(b64, 'base64'))
  return rawPath
}

async function treat(key) {
  const rawPath = path.join(RAW_DIR, `${key}.png`)
  const { tone } = SPECS[key]
  const outPath = path.join(OUT_DIR, `${key}.webp`)

  // Editorial duotone. normalise() first so the four differently-exposed
  // sources land at a matched tonal range (they read as one set); then a
  // multiply grade in the vertical's tone so the funnel temperature is legible
  // at a glance (cool blue / warm accent), with a brightness lift to recover
  // from the multiply darkening. Restrained but clearly branded.
  const base = await sharp(readFileSync(rawPath))
    .resize(1200, 800, { fit: 'cover', position: 'attention' })
    .grayscale()
    .normalise()
    .linear(1.04, -4)
    .toBuffer()

  await sharp(base)
    .composite([
      {
        input: {
          create: {
            width: 1200,
            height: 800,
            channels: 4,
            background: { ...tone, alpha: 0.5 },
          },
        },
        blend: 'multiply',
      },
    ])
    .modulate({ brightness: 1.16 })
    .webp({ quality: 80 })
    .toFile(outPath)

  const px = `linear ink(${INK.r},${INK.g},${INK.b}) → tone(${tone.r},${tone.g},${tone.b})`
  console.log(`  ✓ treated: public/industries/${key}.webp  [${px}]`)
}

const arg = process.argv[2] || 'all'
const keys = arg === 'all' ? Object.keys(SPECS) : [arg]
if (keys.some((k) => !SPECS[k])) {
  console.error(`unknown key. valid: ${Object.keys(SPECS).join(', ')}, or "all"`)
  process.exit(1)
}

for (const key of keys) {
  await generateRaw(key)
  await treat(key)
}
console.log('done.')
