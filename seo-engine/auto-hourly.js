// Autonomous hourly publisher
// 1. Fetches fresh RSS news
// 2. Generates 1 article via Claude API
// 3. Downloads 4 Pexels images (hero + 3 inline)
// 4. Builds HTML with images embedded
// 5. Updates sitemap + blog index
// 6. Submits to GSC Indexing API
// 7. Commits + pushes to trigger Cloudflare deploy
//
// Run once: node auto-hourly.js
// Schedule: Windows Task Scheduler (see setup-schedule.ps1)

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');
const config = require('./config');
const { fetchAllNews } = require('./news-fetcher');
const { buildArticleHTML, buildBlogIndex, buildSitemap } = require('./html-builder');
const { submitNewArticles } = require('./gsc-submit');

const LOG_FILE = path.join(__dirname, 'data', 'auto-hourly.log');
const REGISTRY_FILE = path.join(config.dataDir, 'articles-registry.json');
const IMAGES_DIR = path.join(config.blogDir, 'images');
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

function log(msg) {
  const ts = new Date().toLocaleString('fr-FR');
  const line = `[${ts}] ${msg}`;
  console.log(line);
  try {
    fs.appendFileSync(LOG_FILE, line + '\n');
  } catch {}
}

function slugify(s) {
  return s.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 70) + '-' + new Date().getFullYear();
}

// === CLAUDE API ARTICLE GENERATION ===
async function generateArticleViaClaude(newsItem) {
  const prompt = `Tu es un journaliste tech/crypto pour un blog français SEO-optimisé. Génère un article de 2500-3000 mots sur cette actualité :

TITRE SOURCE : ${newsItem.title}
RÉSUMÉ : ${newsItem.summary || newsItem.title}
CATÉGORIE : ${newsItem.category}
SOURCE : ${newsItem.source || 'actualité du jour'}

IMPÉRATIF : Réponds UNIQUEMENT avec du JSON valide, format exact :

{
  "slug": "slug-court-en-francais-2026",
  "title": "Titre accrocheur 50-70 caractères",
  "metaDescription": "Description SEO 150 caractères max",
  "category": "${newsItem.category === 'crypto' ? 'crypto monnaies' : newsItem.category === 'ia' ? 'intelligence artificielle' : 'investissement'}",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "heroAlt": "Description image hero",
  "imageQueries": {
    "hero": "english pexels query for hero photo 4-6 words",
    "inline1": "english pexels query 3-5 words",
    "inline2": "english pexels query 3-5 words",
    "inline3": "english pexels query 3-5 words"
  },
  "sections": [
    {"title": "Titre H2 section 1", "content": "<p>Contenu HTML 350-450 mots avec <strong>, <em>, <ul><li>...</p>"},
    {"title": "Titre H2 section 2", "content": "<p>...</p>"},
    {"title": "Titre H2 section 3", "content": "<p>...</p>"},
    {"title": "Titre H2 section 4", "content": "<p>...</p>"},
    {"title": "Titre H2 section 5", "content": "<p>...</p>"},
    {"title": "Titre H2 section 6", "content": "<p>...</p>"},
    {"title": "Conclusion", "content": "<p>...</p>"}
  ]
}

RÈGLES :
- Français journalistique haute qualité
- Faits réels, analyse approfondie, chiffres précis
- Intègre naturellement : crypto, IA, investissement, marchés
- 7 sections totales, 350-450 mots par section
- HTML dans content : <p>, <strong>, <em>, <ul><li>
- imageQueries en ANGLAIS, termes visuels concrets
- Pas de markdown, UNIQUEMENT JSON`;

  const body = JSON.stringify({
    model: 'claude-opus-4-6',
    max_tokens: 16000,
    messages: [{ role: 'user', content: prompt }],
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      const chunks = [];
      res.on('data', (d) => chunks.push(d));
      res.on('end', () => {
        try {
          const data = JSON.parse(Buffer.concat(chunks).toString());
          if (data.error) return reject(new Error(data.error.message));
          const text = data.content[0].text;
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (!jsonMatch) return reject(new Error('No JSON in response'));
          resolve(JSON.parse(jsonMatch[0]));
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// === PEXELS IMAGE DOWNLOAD ===
function pexelsSearch(query) {
  return new Promise((resolve, reject) => {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=3&orientation=landscape&size=large`;
    https.get(url, { headers: { Authorization: PEXELS_API_KEY } }, (res) => {
      const chunks = [];
      res.on('data', (d) => chunks.push(d));
      res.on('end', () => {
        try {
          const data = JSON.parse(Buffer.concat(chunks).toString());
          resolve(data.photos || []);
        } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const follow = (url, redir = 0) => {
      if (redir > 5) return reject(new Error('Too many redirects'));
      https.get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400) return follow(res.headers.location, redir + 1);
        if (res.statusCode !== 200) return reject(new Error('HTTP ' + res.statusCode));
        const chunks = [];
        res.on('data', (d) => chunks.push(d));
        res.on('end', () => {
          fs.writeFileSync(filePath, Buffer.concat(chunks));
          resolve();
        });
      }).on('error', reject);
    };
    follow(url);
  });
}

async function downloadImagesForArticle(slug, queries) {
  if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });
  const downloads = [
    { key: 'hero', file: `${slug}.png` },
    { key: 'inline1', file: `${slug}-1.png` },
    { key: 'inline2', file: `${slug}-2.png` },
    { key: 'inline3', file: `${slug}-3.png` },
  ];
  for (const d of downloads) {
    try {
      const photos = await pexelsSearch(queries[d.key] || 'technology abstract');
      if (photos.length > 0) {
        const img = photos[0].src.landscape || photos[0].src.large;
        await downloadFile(img, path.join(IMAGES_DIR, d.file));
        log(`  Image: ${d.file}`);
      }
    } catch (e) {
      log(`  Image error (${d.key}): ${e.message}`);
    }
    await new Promise(r => setTimeout(r, 500));
  }
}

// === MAIN PIPELINE ===
async function main() {
  log('========== HOURLY PUBLISH ==========');

  if (!ANTHROPIC_API_KEY) { log('ERROR: ANTHROPIC_API_KEY missing'); process.exit(1); }
  if (!PEXELS_API_KEY) { log('ERROR: PEXELS_API_KEY missing'); process.exit(1); }

  // Load registry
  const registry = fs.existsSync(REGISTRY_FILE) ? JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf-8')) : [];
  log(`Registry has ${registry.length} articles`);

  // Fetch news
  log('Fetching RSS news...');
  const news = await fetchAllNews();
  log(`Fetched ${news.length} new items`);

  if (news.length === 0) {
    log('No new news available, skipping this cycle');
    return;
  }

  // Pick first news item not already covered
  const existingSlugs = new Set(registry.map(r => r.slug));
  let chosen = null;
  for (const item of news) {
    const testSlug = slugify(item.title);
    if (!existingSlugs.has(testSlug)) {
      chosen = item;
      break;
    }
  }
  if (!chosen) chosen = news[0];
  log(`Selected: ${chosen.title}`);

  // Generate article
  log('Generating article via Claude API...');
  let article;
  try {
    article = await generateArticleViaClaude(chosen);
  } catch (e) {
    log(`ERROR generating article: ${e.message}`);
    return;
  }
  log(`Generated: ${article.slug}`);

  // Dedupe slug
  if (registry.find(r => r.slug === article.slug)) {
    article.slug = article.slug + '-' + Date.now().toString(36);
  }

  // Download images
  log('Downloading Pexels images...');
  await downloadImagesForArticle(article.slug, article.imageQueries);

  // Build content from sections with inline images
  let content = '';
  const imgAvailable = [1, 2, 3].filter(n => fs.existsSync(path.join(IMAGES_DIR, `${article.slug}-${n}.png`)));
  let imgIdx = 0;
  for (let i = 0; i < article.sections.length; i++) {
    const sec = article.sections[i];
    // Inject inline image before sections 2, 4, 6
    if ([1, 3, 5].includes(i) && imgIdx < imgAvailable.length) {
      const n = imgAvailable[imgIdx++];
      content += `<figure><img src="../images/${article.slug}-${n}.png" alt="${sec.title.replace(/"/g, '&quot;')}" loading="lazy"><figcaption>${sec.title}</figcaption></figure>\n`;
    }
    content += `<h2>${sec.title}</h2>\n${sec.content}\n\n`;
  }

  // Build article object
  const now = new Date().toISOString();
  const articleObj = {
    slug: article.slug,
    title: article.title,
    metaDescription: article.metaDescription,
    category: article.category,
    tags: article.tags,
    author: 'CryptoMind AI',
    datePublished: now,
    heroAlt: article.heroAlt,
    content: content,
    excerpt: article.metaDescription,
    readTime: Math.ceil(content.split(/\s+/).length / 200) + ' min',
    generatedAt: now,
  };

  // Build HTML
  const html = buildArticleHTML(articleObj);
  const htmlPath = path.join(config.articlesDir, article.slug + '.html');
  fs.writeFileSync(htmlPath, html, 'utf-8');
  log(`Wrote ${article.slug}.html`);

  // Update registry
  registry.push({
    slug: article.slug,
    title: article.title,
    category: article.category,
    tags: article.tags,
    excerpt: article.metaDescription,
    readTime: articleObj.readTime,
    generatedAt: now,
  });
  fs.writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2));

  // Rebuild index + sitemap
  fs.writeFileSync(path.join(config.blogDir, 'index.html'), buildBlogIndex(registry), 'utf-8');
  fs.writeFileSync(path.join(__dirname, '..', 'sitemap.xml'), buildSitemap(registry), 'utf-8');
  log('Rebuilt blog index + sitemap');

  // Save batch JSON for future regen
  const batchFile = path.join(__dirname, 'data', 'batch', `auto-${Date.now()}-${article.slug}.json`);
  fs.writeFileSync(batchFile, JSON.stringify(article, null, 2));

  // Submit to GSC
  log('Submitting to GSC...');
  try {
    await submitNewArticles([article.slug]);
  } catch (e) {
    log(`GSC error: ${e.message}`);
  }

  // Git commit + push
  log('Committing + pushing...');
  try {
    const repoRoot = path.join(__dirname, '..');
    execSync('git add -A', { cwd: repoRoot, stdio: 'pipe' });
    execSync(`git commit -m "Auto-publish: ${article.title.replace(/"/g, "'").slice(0, 60)}"`, { cwd: repoRoot, stdio: 'pipe' });
    execSync('git push origin master', { cwd: repoRoot, stdio: 'pipe' });
    log('Pushed to GitHub — Cloudflare deploying');
  } catch (e) {
    log(`Git error: ${e.message.slice(0, 200)}`);
  }

  log(`DONE — Total articles: ${registry.length}`);
}

main().catch(e => log(`FATAL: ${e.message}`));
