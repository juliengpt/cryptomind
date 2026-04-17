// Per-site article publisher
// Reads sites.json, picks one site by slug (or all active), fetches news,
// generates 1 article via Gemini, downloads Pexels images, builds HTML,
// updates sitemap+blog index, submits to GSC. No git push (handled by cron-runner).
//
// Usage: node publish-for-site.js <slug>
//   or:  node publish-for-site.js --all   (publishes 1 article for every active site)

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');
const { fetchAllNews, markUsed } = require('./news-fetcher');
const { generateArticle } = require('./llm-gemini');
const { buildArticleHTML, buildBlogIndex, buildSitemap } = require('./html-builder');
const { submitNewArticles, submitSitemap } = require('./gsc-submit');

const ROOT = path.join(__dirname, '..');
const SITES_FILE = path.join(__dirname, 'sites.json');
const REGISTRIES_DIR = path.join(__dirname, 'data', 'registries');
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

function loadSites() {
  return JSON.parse(fs.readFileSync(SITES_FILE, 'utf-8'));
}

function loadRegistry(slug) {
  if (!fs.existsSync(REGISTRIES_DIR)) fs.mkdirSync(REGISTRIES_DIR, { recursive: true });
  const f = path.join(REGISTRIES_DIR, `${slug}.json`);
  if (fs.existsSync(f)) return JSON.parse(fs.readFileSync(f, 'utf-8'));
  return [];
}

function saveRegistry(slug, registry) {
  fs.writeFileSync(path.join(REGISTRIES_DIR, `${slug}.json`), JSON.stringify(registry, null, 2));
}

function siteDirs(site) {
  const root = path.join(ROOT, 'sites', site.slug);
  return {
    root,
    blogDir: path.join(root, 'blog'),
    articlesDir: path.join(root, 'blog', 'articles'),
    imagesDir: path.join(root, 'blog', 'images'),
    sitemapPath: path.join(root, 'sitemap.xml'),
  };
}

function siteConfigForBuilder(site) {
  const dirs = siteDirs(site);
  // Load theme from data/site-content/<slug>.json if available (produced by landing-generator.js)
  let theme = null;
  try {
    const contentPath = path.join(__dirname, 'data', 'site-content', `${site.slug}.json`);
    if (fs.existsSync(contentPath)) {
      const content = JSON.parse(fs.readFileSync(contentPath, 'utf-8'));
      if (content.theme) theme = content.theme;
    }
  } catch {}
  return {
    domain: site.domain,
    siteUrl: `https://${site.domain.replace(/^https?:\/\//, '').replace(/\/$/, '')}`,
    siteName: site.siteName,
    niche: site.niche,
    blogDir: dirs.blogDir,
    articlesDir: dirs.articlesDir,
    productPitch: site.productPitch,
    minInvest: site.minInvest,
    currency: site.currency,
    ctaPrimary: site.ctaPrimary,
    lang: site.lang,
    theme,
  };
}

// Pexels image download
function pexelsSearch(query) {
  return new Promise((resolve, reject) => {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=3&orientation=landscape&size=large`;
    https.get(url, { headers: { Authorization: PEXELS_API_KEY } }, (res) => {
      const chunks = [];
      res.on('data', d => chunks.push(d));
      res.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString()).photos || []); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const follow = (u, redir = 0) => {
      if (redir > 5) return reject(new Error('Too many redirects'));
      https.get(u, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400) return follow(res.headers.location, redir + 1);
        if (res.statusCode !== 200) return reject(new Error('HTTP ' + res.statusCode));
        const chunks = [];
        res.on('data', d => chunks.push(d));
        res.on('end', () => {
          fs.writeFileSync(filePath, Buffer.concat(chunks));
          resolve();
        });
      }).on('error', reject);
    };
    follow(url);
  });
}

async function downloadImagesForArticle(slug, queries, imagesDir) {
  if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });
  const targets = [
    { key: 'hero', file: `${slug}.png` },
    { key: 'inline1', file: `${slug}-1.png` },
    { key: 'inline2', file: `${slug}-2.png` },
    { key: 'inline3', file: `${slug}-3.png` },
  ];
  let ok = 0;
  for (const t of targets) {
    try {
      const photos = await pexelsSearch(queries[t.key] || 'technology business abstract');
      if (photos.length > 0) {
        const imgUrl = photos[0].src.landscape || photos[0].src.large;
        await downloadFile(imgUrl, path.join(imagesDir, t.file));
        ok++;
        console.log(`    [img] ${t.file}`);
      }
    } catch (e) {
      console.log(`    [img] ${t.key} error: ${e.message}`);
    }
    await new Promise(r => setTimeout(r, 400));
  }
  return ok;
}

async function publishOneArticle(site) {
  console.log(`\n=== Publishing for site: ${site.slug} (${site.domain}) ===`);

  const dirs = siteDirs(site);
  const cfg = siteConfigForBuilder(site);
  const registry = loadRegistry(site.slug);
  console.log(`  Registry: ${registry.length} existing articles`);

  // 1. Fetch news (per-site seen tracking)
  const news = await fetchAllNews({ feeds: site.rssFeeds, siteSlug: site.slug });
  if (news.length === 0) {
    console.log('  No fresh news, skipping');
    return null;
  }

  // 2. Pick first uncovered news
  const existingTitles = new Set(registry.map(r => r.title.toLowerCase().slice(0, 40)));
  const chosen = news.find(n => !existingTitles.has(n.title.toLowerCase().slice(0, 40))) || news[0];
  console.log(`  News selected: ${chosen.title.slice(0, 80)}`);

  // 3. Generate article via Gemini (free)
  let article;
  try {
    article = await generateArticle(site, chosen);
  } catch (e) {
    console.log(`  LLM error: ${e.message}`);
    return null;
  }

  // Dedupe slug
  if (registry.find(r => r.slug === article.slug)) {
    article.slug = article.slug + '-' + Date.now().toString(36).slice(-4);
  }

  // 4. Download images
  console.log('  Downloading images...');
  await downloadImagesForArticle(article.slug, article.imageQueries || {}, dirs.imagesDir);

  // 5. Build content with inline figures
  let content = '';
  const availableInline = [1, 2, 3].filter(n => fs.existsSync(path.join(dirs.imagesDir, `${article.slug}-${n}.png`)));
  let imgIdx = 0;
  for (let i = 0; i < article.sections.length; i++) {
    const sec = article.sections[i];
    if ([1, 3, 5].includes(i) && imgIdx < availableInline.length) {
      const n = availableInline[imgIdx++];
      const altText = sec.title.replace(/"/g, '&quot;');
      content += `<figure><img src="../images/${article.slug}-${n}.png" alt="${altText}" loading="lazy"><figcaption>${sec.title}</figcaption></figure>\n`;
    }
    content += `<h2>${sec.title}</h2>\n${sec.content}\n\n`;
  }

  const now = new Date().toISOString();
  const articleObj = {
    slug: article.slug,
    title: article.title,
    metaDescription: article.metaDescription,
    category: article.category,
    tags: article.tags || [],
    author: site.siteName,
    datePublished: now,
    heroAlt: article.heroAlt,
    content,
    excerpt: article.metaDescription,
    readTime: Math.ceil(content.split(/\s+/).length / 200) + ' min',
    generatedAt: now,
  };

  // 6. Write article HTML
  if (!fs.existsSync(dirs.articlesDir)) fs.mkdirSync(dirs.articlesDir, { recursive: true });
  const html = buildArticleHTML(articleObj, cfg, registry);
  fs.writeFileSync(path.join(dirs.articlesDir, `${article.slug}.html`), html, 'utf-8');
  console.log(`  Wrote ${article.slug}.html`);

  // 7. Update registry
  registry.unshift({
    slug: article.slug,
    title: article.title,
    category: article.category,
    tags: article.tags,
    excerpt: article.metaDescription,
    readTime: articleObj.readTime,
    generatedAt: now,
    generatedBy: article._generatedBy || 'unknown',
  });
  saveRegistry(site.slug, registry);

  // 8. Rebuild blog index + sitemap
  fs.writeFileSync(path.join(dirs.blogDir, 'index.html'), buildBlogIndex(registry, cfg), 'utf-8');
  fs.writeFileSync(dirs.sitemapPath, buildSitemap(registry, cfg), 'utf-8');
  console.log('  Rebuilt blog index + sitemap');

  // 9. Refresh sitemap in GSC (natural crawl — no Indexing API to avoid spam flags)
  try {
    await submitSitemap(site.domain);
    console.log(`  GSC sitemap refreshed`);
  } catch (e) {
    console.log(`  GSC sitemap error: ${e.message}`);
  }

  // 10. Mark news as used (so we don't reprocess it next run)
  markUsed(chosen, site.slug);

  return article.slug;
}

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage: node publish-for-site.js <slug>  |  node publish-for-site.js --all');
    process.exit(1);
  }

  if (!PEXELS_API_KEY) { console.error('PEXELS_API_KEY missing in .env'); process.exit(1); }

  const sites = loadSites();
  const targets = arg === '--all'
    ? sites.filter(s => s.active !== false)
    : sites.filter(s => s.slug === arg);

  if (targets.length === 0) {
    console.error(`No site matched: ${arg}`);
    process.exit(1);
  }

  const results = [];
  for (const site of targets) {
    try {
      const slug = await publishOneArticle(site);
      results.push({ site: site.slug, slug, ok: !!slug });
    } catch (e) {
      console.error(`  FATAL for ${site.slug}: ${e.message}`);
      results.push({ site: site.slug, slug: null, ok: false, error: e.message });
    }
  }

  console.log('\n=== SUMMARY ===');
  for (const r of results) {
    console.log(`  ${r.ok ? 'OK' : 'FAIL'} ${r.site}: ${r.slug || r.error || 'no article'}`);
  }
}

if (require.main === module) main();
module.exports = { publishOneArticle, loadSites, siteDirs, siteConfigForBuilder };
