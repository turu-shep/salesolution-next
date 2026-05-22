# Sanity CMS — Setup Instructions

This is the manual step to complete Step 2 of the [execution roadmap](12-execution-roadmap.md). Once you've done it, the Studio loads at `/studio` and the AI-generation workflow becomes available.

## 1. Create the Sanity project (5 minutes, one-time)

1. Sign in / sign up at <https://www.sanity.io/manage>
2. Click **Create new project**
3. Fill in:
   - **Project name**: `Sale Solution`
   - **Dataset name**: `production` (default)
   - **Organization**: your personal or company org
4. After creation, you'll land on the project's settings page. Note the **Project ID** (8-character alphanumeric string in the URL or under "Project info").

## 2. Generate API tokens

In the project settings, go to **API → Tokens**, then click **Add API token** twice:

| Token name | Permissions | Purpose | Env var |
|------------|-------------|---------|---------|
| `web-read-drafts` | **Viewer** | Read drafts during preview mode | `SANITY_API_READ_TOKEN` |
| `ai-write` | **Editor** | AI agents create draft documents | `SANITY_API_WRITE_TOKEN` |

After generating, copy each token immediately — Sanity only shows it once.

## 3. Add CORS origins

Still in **API → CORS origins**, click **Add CORS origin** twice:

| Origin | Credentials | Purpose |
|--------|-------------|---------|
| `http://localhost:3000` | ✓ Allow | Local dev (default port) |
| `http://localhost:3001` | ✓ Allow | Local dev (fallback port — see Step 1 notes) |

Add your production domain (`https://salesolution.net`) later, at deploy time.

## 4. Fill `.env.local`

Copy the template and fill in the values you collected:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local`:

```dotenv
NEXT_PUBLIC_SANITY_PROJECT_ID=<the project ID from step 1>
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2026-05-19

SANITY_API_READ_TOKEN=<viewer token from step 2>
SANITY_API_WRITE_TOKEN=<editor token from step 2>
SANITY_PREVIEW_SECRET=<random hex string — generate with: openssl rand -hex 32>
```

Restart the dev server so the new env vars are picked up:

```bash
pnpm dev
```

## 5. Verify the Studio loads

Open <http://localhost:3001/studio>. You should see:

- The Sanity sign-in screen (use the same account from step 1)
- After sign-in, the Studio sidebar: Site settings · Blog posts · Guides · Career paths · Services · Testimonials · Authors

If the page errors with "missing env var," the .env.local edit didn't take. Confirm the file is at the repo root (not nested), and restart `pnpm dev`.

## 6. Seed a draft post + verify preview URL

In Studio:

1. Click **Blog posts → Create new**
2. Fill in: title, slug (auto-generated), description, published-at, body (a paragraph or two)
3. The document is auto-saved as a **draft** — there's no "Save" button
4. Click the eye / preview icon (top right). Studio routes you to a URL like `http://localhost:3001/api/draft?sanity-preview-secret=...&sanity-preview-pathname=/<slug>/`
5. That route enables draft mode and redirects you to `/<slug>/`. **Expected result for now:** Next.js returns 404 — the post page template doesn't exist yet (that's Step 10). The 404 means the plumbing works; what's missing is the page itself.

## 7. AI-generation workflow (reference)

Once `SANITY_API_WRITE_TOKEN` is set, an AI agent (Claude Code, a script, a webhook, anything) can create draft documents like this:

```ts
import { writeClient } from '@/sanity/lib/write-client'

const doc = await writeClient.create({
  _type: 'post',
  title: 'Generated post title',
  slug: { _type: 'slug', current: 'generated-post-title' },
  description: 'One-sentence excerpt.',
  body: [
    {
      _type: 'block',
      _key: 'a1',
      style: 'normal',
      children: [{ _type: 'span', _key: 'a2', text: 'Body paragraph...' }],
    },
  ],
  publishedAt: new Date().toISOString(),
  seo: {
    metaTitle: 'SEO-optimized title',
    metaDescription: '140-160 chars of meta description',
  },
})
```

Drafts have an `_id` like `drafts.<uuid>`. To return a preview URL to a human reviewer:

```ts
const previewUrl = `https://salesolution.net/api/draft?` +
  `sanity-preview-secret=${process.env.SANITY_PREVIEW_SECRET}` +
  `&sanity-preview-pathname=/${doc.slug.current}/`
```

The reviewer clicks the link, sees the draft rendered on the live site, then publishes from Studio when ready.

## 8. Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `/studio` shows blank page + console error "missing projectId" | `.env.local` not in repo root, or dev server not restarted | Move file to root, kill + restart `pnpm dev` |
| Studio sign-in succeeds but sidebar is empty | Schema didn't load | Hard-refresh browser; check `sanity/schemas/index.ts` exports |
| "CORS blocked" in browser console | Localhost not added to Sanity's CORS list | Step 3 above |
| Preview URL returns 401 | Mismatched preview secret | Confirm `SANITY_PREVIEW_SECRET` matches across `.env.local` and any Studio preview-link config |
| Write token leaks in browser bundle | Prefixed with `NEXT_PUBLIC_` by mistake | Confirm `SANITY_API_WRITE_TOKEN` has no public prefix |

## 9. Cost note

Free tier covers:
- 10,000 documents
- 5 users
- 100k API requests/month
- 10 GB asset bandwidth/month

This site will sit comfortably under those limits (~70 documents at full migration). Beyond the free tier, the Growth plan is ~$15/user/month.
