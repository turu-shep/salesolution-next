# Sanity Webhook → Next.js Cache Invalidation

Goal: when you edit a post / guide / siteSettings in Studio, the public site reflects the change within seconds without a redeploy. Without this wiring, the `revalidate: 3600` (1-hour) staleness window applies and Studio edits stay invisible for up to an hour.

## How it works

```
Studio edit
   │
   ▼
Sanity Content Lake fires webhook
   │
   ▼
POST /api/revalidate
  ├── verifies signature against SANITY_WEBHOOK_SECRET
  └── calls revalidateTag(`post`) + revalidateTag(`post:<slug>`)
   │
   ▼
Next.js purges the matching fetch cache entries
   │
   ▼
Next request to /<slug>/ fetches fresh data
```

## One-time setup

1. **Generate a webhook secret locally.**

   ```bash
   openssl rand -hex 32
   ```

   Copy the output. Add it to `.env.local`:

   ```dotenv
   SANITY_WEBHOOK_SECRET=<paste here>
   ```

2. **Add the same secret to production env**
   - **Vercel**: Project → Settings → Environment Variables → `SANITY_WEBHOOK_SECRET`
   - **Cloudflare Pages**: Settings → Environment variables
   - **Other host**: wherever your prod env lives

3. **Configure the webhook in Sanity Manage**

   Open <https://www.sanity.io/manage> → your project → **API** → **Webhooks** → **Create webhook**:

   | Field | Value |
   |-------|-------|
   | Name | `Next.js cache invalidation` |
   | URL | `https://salesolution.net/api/revalidate/` (use the production URL, trailing slash) |
   | Dataset | `production` |
   | Trigger on | ✓ Create  ✓ Update  ✓ Delete |
   | Filter (GROQ) | `_type in ["post","guide","careerPath","caseStudy","glossaryTerm","siteSettings","service","testimonial","author"]` |
   | Projection (GROQ) | `{ _type, "slug": slug.current }` |
   | Secret | The hex string from step 1 |
   | API version | `2026-05-19` (same as `NEXT_PUBLIC_SANITY_API_VERSION`) |
   | HTTP method | `POST` |
   | HTTP headers | Leave empty |
   | Enable | ✓ |

   Click **Save**.

4. **Smoke-test from Sanity Manage**

   Click the webhook you just created → **Attempts** → **Send test event**. You should see:
   - HTTP 200 from your route handler
   - JSON body like `{"ok":true,"revalidated":["post","post:<slug>"]}`

   If you see 401, the secret in `.env.local` doesn't match the one configured in the webhook.

5. **Smoke-test end-to-end**
   - Edit a post in Studio (change the title).
   - Within ~5 seconds, refresh `/<slug>/` on production — the title should already be the new one.

## What gets invalidated

The `body._type` in the webhook payload determines what gets purged. Tags used in [sanity/lib/posts.ts](../../sanity/lib/posts.ts) and siblings:

| Document type | Tag(s) invalidated |
|---------------|--------------------|
| `post` | `post`, `post:<slug>` |
| `guide` | `guide`, `guide:<slug>` |
| `careerPath` | `careerPath`, `careerPath:<slug>` |
| `siteSettings` | `siteSettings` (singleton — no slug tag) |
| `service`, `testimonial`, `author` | each by `_type` |

The slug-specific tag is a tightening optimisation — it lets a fetch like `getPostBySlug('foo')` use a narrower cache key than the broad `post` tag.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Webhook delivers 401 | Secret mismatch | Re-paste the secret in both Sanity webhook config + `.env.local` (or production env) |
| Webhook delivers 500 with `webhook-secret-not-configured` | Env var missing in production | Add `SANITY_WEBHOOK_SECRET` to your host's env settings + redeploy |
| Edits in Studio still not appearing | Webhook URL points at staging or wrong domain | Update the webhook URL in Sanity Manage |
| All edits appear but new documents don't | The `_type` isn't in the GROQ filter | Edit the filter to include the missing type |

## Local dev

Sanity webhooks can't reach `http://localhost:3001`. Two options for testing locally:

1. **Tunnel with ngrok** (or Cloudflare Tunnel): `ngrok http 3001`, then point the webhook URL temporarily at the ngrok HTTPS URL.
2. **Replay**: in Sanity Manage → Webhooks → Attempts, copy the request body + headers and curl it locally:

   ```bash
   curl -X POST http://localhost:3001/api/revalidate/ \
     -H "content-type: application/json" \
     -H "sanity-webhook-signature: <header value from Manage>" \
     -d '<body json>'
   ```
