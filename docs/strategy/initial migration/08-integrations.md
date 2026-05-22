# Third-Party Integrations & Migration

The current site loads a stack of marketing tags through WordPress plugins. The Next.js rebuild replaces that machinery while preserving every conversion and tracking signal.

## 1. Current integrations (detected from homepage HTML)

| Integration | Account / ID | Loaded via |
|-------------|--------------|------------|
| Google Ads (gtag) | `AW-17897120027` | Inline + `googletagmanager.com/gtag/js` |
| GA4 | Through MonsterInsights wrapper (`__gtagTracker`) | `monsterinsights-frontend-script-js` |
| Meta Pixel | `1246284374271362` | PixelYourSite plugin scripts |
| HubSpot | Plugin v11.3.37 | Loaded but consent-gated; embed marker visible in HTML |
| Cookie consent | Complianz GDPR Premium | `cmplz-general-css`, Google Consent Mode v2 wired (`google_consent_mode: 1` in PYS config) |
| Email obfuscation | Cloudflare | `/cdn-cgi/l/email-protection` |
| Gravatar | for author avatars | `secure.gravatar.com` |

## 2. PixelYourSite event tracking (currently configured)

From the homepage `pysOptions` object, these dynamic events fire on Meta Pixel + (likely) Google Ads:

| Event | Trigger | Notes |
|-------|---------|-------|
| `PageView` | On load | Standard |
| `Form` | Form interaction | Maps to lead form on contact/lead-gen pages |
| `Download` | File download | Triggers on `doc, exe, js, pdf, ppt, tgz, zip, xls` |
| `Comment` | WP comment submit | Drop-able if comments are removed |
| `PageScroll` | 30% scroll | |
| `TimeOnPage` | 30s on page | |

**Migration**: rebuild each of these as a GTM trigger + tag pair so Artur can edit them without touching code.

## 3. Replacement architecture

```
┌──────────────────────────────────────────────────────────┐
│ Next.js App                                              │
│                                                          │
│  app/layout.tsx                                          │
│   ├── <ConsentBanner />                  ← Cookiebot     │
│   ├── <GoogleTagManager gtmId="GTM-XXX" />               │
│   │     └── (inside GTM container)                       │
│   │         ├── GA4 tag                                  │
│   │         ├── Google Ads conversion (AW-17897120027)   │
│   │         ├── Meta Pixel (1246284374271362)            │
│   │         ├── HubSpot tracking (if retained)           │
│   │         └── Custom triggers: form submit, scroll,    │
│   │                              time on page, download  │
│   └── <ThirdPartyScripts /> (any non-GTM scripts)        │
│                                                          │
│  components/forms/LeadForm.tsx                           │
│   └── onSubmit                                           │
│       ├── server action → HubSpot Forms API              │
│       └── dataLayer.push({ event: 'lead_submit' })       │
│           ← GTM trigger fires Meta Pixel `Lead` event    │
│           ← GTM trigger fires Google Ads conversion      │
└──────────────────────────────────────────────────────────┘
```

## 4. Why GTM instead of `next/script` per tag

Three reasons:

1. **One container, edit without redeploy.** Artur (or a marketer) can add/remove tags and adjust triggers from GTM UI — no GitHub PR required for adding, say, a LinkedIn Insight Tag.
2. **Consent gating in one place.** Google Consent Mode v2 wiring goes once in GTM; every tag downstream respects it. The current site has consent logic split across PixelYourSite and Complianz — hard to audit.
3. **Cleaner dataLayer model.** Server actions and client interactions emit a single dataLayer event; GTM decides what fires.

Counter-argument: GTM ships ~50 KB of JS. If absolute performance is paramount, use `@next/third-parties` helpers for GA4 + Pixel directly and skip GTM. Recommendation: **start with GTM** for flexibility; revisit only if Core Web Vitals regress.

## 5. Consent — Google Consent Mode v2

Mandatory for EU traffic (and now Brazil, parts of US). The current site has it wired through PixelYourSite + Complianz. Replicate as:

- Default consent state in `<head>` (deny all) **before** GTM loads:

```html
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500
  });
</script>
```

- Cookie banner (Cookiebot or self-built) calls `gtag('consent', 'update', {...})` based on user choice
- GTM container fires tags only when consent is granted

## 6. Forms

### 6.1 Current behavior

Multi-step lead form lives on `/contact-me/`, `/unlock-growth-audit/`, `/book-growth-call/`, `/constraint-sprint/` — same field set. Submits to a HubSpot endpoint (inferred from plugin presence) and likely sends an internal notification email.

### 6.2 Next.js implementation

```tsx
// components/forms/LeadForm.tsx
'use client'
const { handleSubmit, ... } = useForm({ resolver: zodResolver(leadSchema) })

async function onSubmit(data: LeadFormData) {
  await submitLead(data)         // server action
  window.dataLayer?.push({ event: 'lead_submit', form_id: formId, ... })
  router.push(thankYouUrl)
}

// app/api/lead/route.ts OR a server action
'use server'
import { z } from 'zod'

export async function submitLead(data: LeadFormData) {
  // 1. Validate with zod
  // 2. POST to HubSpot Forms API
  await fetch(`https://api.hsforms.com/submissions/v3/integration/submit/${PORTAL_ID}/${FORM_ID}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: [...] }),
  })
  // 3. Send internal notification via Resend (backup channel)
  await resend.emails.send({
    from: 'leads@salesolution.net',
    to: 'artur@salesolution.net',
    subject: `New lead: ${data.fullName}`,
    text: formatLead(data),
  })
}
```

### 6.3 Spam handling

Add **Cloudflare Turnstile** (free, privacy-friendly, no reCAPTCHA Google dependency). Token verified server-side before HubSpot write.

## 7. Calendar / booking

Current state: **no embedded calendar found** on `/book-growth-call/`. Booking happens after manual review of the form submission. If Artur wants self-serve booking:

- **Cal.com** (open-source, self-host or hosted) — recommended
- **Calendly** — simplest embed, paid for advanced
- **TidyCal** — cheapest paid option

Implementation: lazy-load the calendar embed below the fold so it doesn't tax initial render.

## 8. Email infrastructure

| Need | Tool |
|------|------|
| Transactional (form notifications, thank-yous) | **Resend** |
| Marketing (newsletter "Weekly Turbulence Brief") | **ConvertKit** / **Buttondown** / **Beehiiv** — pick based on Artur's preference; HubSpot can also handle this |
| Email preferences center | If HubSpot is retained, link to HubSpot's hosted prefs page; otherwise replicate `/communication-preferences/` as a small dynamic page hitting your ESP's API |

## 9. Image / asset CDN

| Asset class | Source | New CDN |
|-------------|--------|---------|
| Existing `/wp-content/uploads/*` | WordPress media library | Mirror to Cloudflare R2; rewrite at edge |
| New site images | `public/images/*` | Vercel/Cloudflare native |
| Author avatar | Gravatar | Replace with self-hosted SVG/PNG to drop Gravatar dep |

## 10. Search

The current site has WordPress search (blocked in robots: `*?s=`). No on-site search UI is exposed.

For Next.js, options if search is wanted later:

- **Algolia DocSearch** (free for open-source content)
- **Pagefind** (build-time static search — zero runtime)
- **Fuse.js** in-memory (for small content sets)

Recommendation: **skip search for v1**; revisit after content volume justifies it.

## 11. Service-worker / PWA

The current site is not a PWA. **Don't add a service worker** in v1 — it complicates caching for a content site and rarely benefits marketing pages.

## 12. Migration order for integrations

1. **Pre-cutover**: build GTM container, mirror current tags inside it, load it on staging
2. **Pre-cutover**: verify Meta Pixel events fire correctly on staging using Meta Events Manager → Test Events
3. **Pre-cutover**: verify Google Ads conversions fire on staging using GA4 DebugView and Google Tag Assistant
4. **Pre-cutover**: verify HubSpot form submissions land in the right list/contact properties
5. **At cutover**: DNS swap → live GTM container now serves real traffic
6. **Post-cutover (24h)**: monitor GA4 realtime, Meta Pixel diagnostics, HubSpot lead capture; if any drops in volume, halt and investigate

## 13. Decommission checklist

After 30 days of clean cutover:

- [ ] Cancel Rank Math Pro license
- [ ] Cancel MonsterInsights license
- [ ] Cancel PixelYourSite license
- [ ] Cancel Complianz Premium license
- [ ] Cancel Link Whisper Premium license
- [ ] Disconnect HubSpot WP plugin (HubSpot itself stays)
- [ ] Spin down Cloudways WordPress instance (keep DB export for 12mo)
- [ ] Update HubSpot tracking domain settings if changed
- [ ] Update any third parties that allowlist the IP / hostname
