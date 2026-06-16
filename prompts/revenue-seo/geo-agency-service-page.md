# Prompt: Target "geo agency" on the AI-SEO service page (Linear SAL-404)

**Read `prompts/_CONTEXT.md` first.** This is a **revenue / money-page** task, separate from the
learning hub. Tracked in Linear project "SS SEO" as **SAL-404**.

## Why
The 2026-06-14 Ahrefs pull found **"geo agency" — ~1,300 US searches/mo, KD ~15, commercial
intent, AI Overview present.** It's the most revenue-relevant keyword in the whole project: low
difficulty + buyer intent + a money page that already exists. The existing GEO service page
currently targets **"generative engine optimization"** (~12,000 vol but **KD ~75 — unwinnable** at
DR ~10) and ignores "geo agency". (Re-verify these numbers with Ahrefs if available before acting.)

## The page
`app/(site)/services/ai-seo/page.tsx` — currently titled "AI Search & Generative-Engine
Optimization (GEO)". It already positions *against* generic agencies ("no agency layer", "different
from a typical SEO agency") — use that as the hook, don't fight it.

## Do this (copy/metadata only — do NOT build a new page)
1. Work **"GEO agency"** into the `<title>`, H1, and meta description. Keep "generative engine
   optimization" in the body for relevance but drop it as the primary target.
2. Add a short section that answers the buyer query and pivots to the operator-led difference —
   **capture-and-subvert**: *"Looking for a GEO agency? You get one senior operator who does the
   work, not an agency layer."*
3. Add the on-niche long-tail: **"GEO agency for industrial e-commerce / distributors"** (even
   lower competition, exactly the positioning).
4. Keep the brand voice (operator register, see `_CONTEXT.md`) and the existing page structure.
5. Make sure the page's `serviceSchema`/JSON-LD and canonical stay correct.

## Do NOT
- Build a separate `/geo-agency` page (cannibalizes the service page, splits the site's limited
  authority). Only reconsider a dedicated landing page later for paid ads.

## Definition of done
- `tsc` clean (ignore `lib/lead-form/*`), lint clean, `next build` compiles.
- `curl /services/ai-seo/` shows the new title/H1/section and the "geo agency" phrasing.
- Update Linear SAL-404 (or note it for the owner). Reference data: `docs/strategy/career-path/01-assessment.md` §3a.
