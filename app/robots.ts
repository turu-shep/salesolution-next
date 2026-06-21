import type { MetadataRoute } from 'next'

import { business } from '@/lib/business'

/**
 * Generates /robots.txt.
 *
 * Minimal disallow set. We intentionally do NOT block tracking-parameter URLs
 * (utm_*, fbclid, gclid) — blocking them via robots prevents crawl, which
 * prevents the rel="canonical" signal on the underlying page from being
 * honoured. Canonical tags are the modern way to dedupe parameter variants.
 *
 * Thank-you pages are noindex'd via per-page `metadata.robots` rather than
 * disallowed here, so crawlers can still follow links and pass authority
 * through them.
 */
export default function robots(): MetadataRoute.Robots {
  // Block lists that apply to every named bot below. Define once, share.
  const standardDisallow = ['/api/', '/studio/', '/dev/', '/sales/']

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: standardDisallow,
      },
      // ── AI / LLM crawlers — explicit ALLOW ─────────────────────────────
      // The whole point of this site is to be cited in AI answers. Explicitly
      // permit the major training + retrieval bots so they don't fall back
      // to wildcard rules (which some honor more conservatively).
      { userAgent: 'GPTBot',          allow: '/', disallow: standardDisallow },        // OpenAI training
      { userAgent: 'OAI-SearchBot',   allow: '/', disallow: standardDisallow },        // ChatGPT search
      { userAgent: 'ChatGPT-User',    allow: '/', disallow: standardDisallow },        // ChatGPT on-demand fetch
      { userAgent: 'ClaudeBot',       allow: '/', disallow: standardDisallow },        // Anthropic training
      { userAgent: 'Claude-Web',      allow: '/', disallow: standardDisallow },        // Claude on-demand fetch
      { userAgent: 'Claude-SearchBot', allow: '/', disallow: standardDisallow },       // Claude search
      { userAgent: 'PerplexityBot',   allow: '/', disallow: standardDisallow },        // Perplexity training
      { userAgent: 'Perplexity-User', allow: '/', disallow: standardDisallow },        // Perplexity on-demand fetch
      { userAgent: 'Google-Extended', allow: '/', disallow: standardDisallow },        // Gemini training (separate from Googlebot)
      { userAgent: 'Applebot-Extended', allow: '/', disallow: standardDisallow },      // Apple Intelligence
      { userAgent: 'Meta-ExternalAgent', allow: '/', disallow: standardDisallow },     // Meta AI
      { userAgent: 'Bytespider',      allow: '/', disallow: standardDisallow },        // ByteDance / TikTok AI
      { userAgent: 'CCBot',           allow: '/', disallow: standardDisallow },        // Common Crawl (powers many LLMs)
      { userAgent: 'cohere-ai',       allow: '/', disallow: standardDisallow },        // Cohere
      { userAgent: 'Amazonbot',       allow: '/', disallow: standardDisallow },        // Amazon AI/Alexa
      { userAgent: 'YouBot',          allow: '/', disallow: standardDisallow },        // You.com
      { userAgent: 'DuckAssistBot',   allow: '/', disallow: standardDisallow },        // DuckDuckGo AI
    ],
    sitemap: `${business.url}/sitemap.xml`,
    host: business.url,
  }
}
