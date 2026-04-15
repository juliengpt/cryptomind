# SEO Engine — Multi-site auto-publisher

100% free pipeline that publishes SEO-optimised articles to multiple landing pages on a configurable per-site schedule. Powered by:

- **Gemini 2.0 Flash** (free) — article generation, with Mistral & Groq fallback
- **Pexels API** (free) — hero + 3 inline images per article
- **Google Search Console Indexing API** (free) — instant indexing
- **GitHub Actions** (free) — hourly cron orchestration
- **Cloudflare Pages** (free) — multi-project hosting from this monorepo

## Architecture

```
.
├── sites/
│   ├── crypto-mind/        ← one site = one Cloudflare Pages project
│   │   ├── index.html
│   │   ├── blog/
│   │   ├── sitemap.xml
│   │   └── ...
│   └── <new-site>/         ← created by scaffold-site.js
└── seo-engine/
    ├── sites.json          ← per-site config (domain, niche, articlesPerDay…)
    ├── publish-for-site.js ← single-site pipeline (news → LLM → images → HTML → GSC)
    ├── cron-runner.js      ← orchestrator (called hourly by GitHub Actions)
    ├── llm-gemini.js       ← Gemini + fallback chain
    ├── scaffold-site.js    ← creates sites/<slug>/ from templates
    ├── templates/          ← landing/styles/script templates
    └── data/registries/    ← per-site article registry
```

## Setup

### 1. Get free API keys
- **Gemini**: https://aistudio.google.com → "Get API key" (no credit card)
- **Pexels**: https://www.pexels.com/api/ (free, no credit card)
- **GSC Indexing**: Google Cloud → create service account → enable Indexing API
  → add service account email as Owner in your GSC property

### 2. Local install
```bash
cd seo-engine
npm install
cp .env.example .env
# Edit .env: paste GEMINI_API_KEY, PEXELS_API_KEY
# Place gsc-credentials.json in seo-engine/ (downloaded from Google Cloud)
```

### 3. Test publish locally
```bash
node publish-for-site.js crypto-mind
```
This generates 1 article for the crypto-mind site, downloads images, updates the blog index/sitemap, submits to GSC. No git commit (handled by GitHub Actions).

### 4. Configure GitHub Actions secrets
In your GitHub repo → Settings → Secrets and variables → Actions:
- `GEMINI_API_KEY`
- `PEXELS_API_KEY`
- `GSC_SERVICE_ACCOUNT_JSON` (paste the entire service account JSON)
- `MISTRAL_API_KEY` (optional fallback)
- `GROQ_API_KEY` (optional fallback)

The workflow `.github/workflows/hourly-publish.yml` runs at xx:05 every hour.

### 5. Cloudflare Pages
**For the existing crypto-mind site**: change build root from `/` to `sites/crypto-mind` in the Pages project settings.

**For new sites**: create a new Pages project per domain, build root = `sites/<slug>`.

## Adding a new site

```bash
node scaffold-site.js \
  --slug=forex-bot \
  --domain=forex-bot.com \
  --siteName="ForexBot AI" \
  --niche="forex algorithmic trading" \
  --productPitch="Agent IA qui trade le forex pour vous" \
  --minInvest=250 \
  --articlesPerDay=4 \
  --leadWebhook=https://script.google.com/macros/s/.../exec
```

Then follow the printed next-steps (DNS, Cloudflare project, GSC verification).

## sites.json schema

| Field | Required | Description |
|---|---|---|
| `slug` | yes | Folder name in `sites/` |
| `domain` | yes | Production domain (no protocol) |
| `siteName` | yes | Brand name shown in UI |
| `niche` | yes | Topic context for LLM |
| `lang` | no | `fr` (default) |
| `articlesPerDay` | yes | 1-24+, fractional OK (cron-runner accumulates) |
| `productPitch` | yes | One-liner promoted in CTAs |
| `minInvest` | no | Number shown on signup form |
| `currency` | no | `€`, `$`, `£`… |
| `ctaPrimary` | no | Main button label |
| `leadWebhook` | no | Google Apps Script URL for lead capture |
| `telegramChatId` | no | For lead notifications |
| `rssFeeds` | yes | Array of `{url, category, lang}` |
| `themes` | no | Array of fallback topics |
| `active` | yes | `true` to include in cron-runner |

## Quotas (April 2026)

| Service | Free tier | Capacity |
|---|---|---|
| Gemini 2.0 Flash | 1 500 RPD | ~60 sites × 24 articles/day |
| Pexels | 200 req/hour | ~50 articles/hour |
| GSC Indexing | 200 URLs/day | per property |
| GitHub Actions | 2 000 min/month (private) | ~30 min/day for hourly cron |
| Cloudflare Pages | 500 builds/month per project | ~16 builds/day per site |

## Commands

```bash
npm run publish <slug>   # Publish 1 article for one site
npm run publish:all      # Publish 1 article for every active site
npm run cron             # Run hourly orchestrator (used by GitHub Actions)
npm run scaffold ...     # Bootstrap new site from templates
```
