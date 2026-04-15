// Bootstrap a new site from the crypto-mind template.
// Usage:
//   node scaffold-site.js --slug=forex-bot --domain=forex-bot.com \
//     --siteName="ForexBot AI" --niche="forex trading" \
//     --productPitch="Agent IA qui trade le forex pour vous" \
//     --minInvest=250 --articlesPerDay=4 [--leadWebhook=https://...]
//
// Effects:
//   1. Creates sites/<slug>/ with index.html, styles.css, script.js, favicon.svg, terms.html, privacy.html
//      derived from seo-engine/templates/* with {{placeholders}} replaced
//   2. Creates empty blog/ and blog/articles/ and blog/images/ dirs
//   3. Appends an entry to seo-engine/sites.json (active: false until user activates)
//   4. Prints next-step instructions (DNS, Cloudflare Pages setup, GSC verification)

const fs = require('fs');
const path = require('path');

const SITES_FILE = path.join(__dirname, 'sites.json');
const TPL_DIR = path.join(__dirname, 'templates');
const ROOT = path.join(__dirname, '..');

function parseArgs(argv) {
  const out = {};
  for (const a of argv) {
    const m = a.match(/^--([^=]+)=(.*)$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

function applyTemplate(content, vars) {
  // Find/replace approach (the templates are the actual crypto-mind files).
  // We swap product-specific strings with the new site's values.
  const replacements = [
    // Domain
    [/https:\/\/crypto-mind\.net/g, `https://${vars.domain}`],
    [/crypto-mind\.net/g, vars.domain],
    // Site name
    [/CryptoMind AI/g, vars.siteName],
    [/CryptoMind<span class="logo-accent">AI<\/span>/g, escapeBrand(vars.siteName)],
    [/CryptoMind<span>AI<\/span>/g, escapeBrand(vars.siteName)],
    // Product pitch
    [/Agent IA qui trade les cryptos pour vous/gi, vars.productPitch],
    [/L'agent IA qui trade pour vous/g, vars.productPitch],
    // Min investment
    [/250 €/g, `${vars.minInvest} ${vars.currency}`],
    [/250€/g, `${vars.minInvest}${vars.currency}`],
    [/€250/g, `${vars.currency}${vars.minInvest}`],
    [/250\s*€/g, `${vars.minInvest} ${vars.currency}`],
    // Lead webhook (only if provided)
    ...(vars.leadWebhook ? [
      [/https:\/\/script\.google\.com\/macros\/s\/[^'"]+\/exec/g, vars.leadWebhook],
    ] : []),
  ];
  let out = content;
  for (const [pat, rep] of replacements) out = out.replace(pat, rep);
  return out;
}

function escapeBrand(name) {
  // Try to split brand into root + accent (e.g. "ForexBot AI" → "ForexBot<span class='logo-accent'>AI</span>")
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts.slice(0, -1).join(' ')}<span class="logo-accent">${parts.slice(-1)[0]}</span>`;
  }
  return name;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const required = ['slug', 'domain', 'siteName'];
  for (const k of required) {
    if (!args[k]) { console.error(`Missing required --${k}`); process.exit(1); }
  }

  const vars = {
    slug: args.slug,
    domain: args.domain.replace(/^https?:\/\//, '').replace(/\/$/, ''),
    siteName: args.siteName,
    niche: args.niche || args.siteName,
    productPitch: args.productPitch || `L'agent IA qui travaille pour vous`,
    minInvest: Number(args.minInvest) || 250,
    currency: args.currency || '€',
    ctaPrimary: args.ctaPrimary || "Activer l'agent IA",
    lang: args.lang || 'fr',
    leadWebhook: args.leadWebhook || '',
    articlesPerDay: Number(args.articlesPerDay) || 1,
  };

  const siteRoot = path.join(ROOT, 'sites', vars.slug);
  if (fs.existsSync(siteRoot)) {
    console.error(`Site already exists at ${siteRoot}`);
    process.exit(1);
  }

  // Create dirs
  fs.mkdirSync(siteRoot, { recursive: true });
  fs.mkdirSync(path.join(siteRoot, 'blog', 'articles'), { recursive: true });
  fs.mkdirSync(path.join(siteRoot, 'blog', 'images'), { recursive: true });

  // Copy templates with replacements
  const fileMap = [
    { src: 'landing-template.html', dst: 'index.html', text: true },
    { src: 'styles-template.css', dst: 'styles.css', text: true },
    { src: 'script-template.js', dst: 'script.js', text: true },
    { src: 'terms-template.html', dst: 'terms.html', text: true },
    { src: 'privacy-template.html', dst: 'privacy.html', text: true },
    { src: 'favicon-template.svg', dst: 'favicon.svg', text: true },
  ];
  for (const f of fileMap) {
    const srcPath = path.join(TPL_DIR, f.src);
    if (!fs.existsSync(srcPath)) {
      console.warn(`  Template missing: ${f.src}`);
      continue;
    }
    let content = fs.readFileSync(srcPath, 'utf-8');
    content = applyTemplate(content, vars);
    fs.writeFileSync(path.join(siteRoot, f.dst), content);
    console.log(`  wrote ${f.dst}`);
  }

  // Minimal robots.txt + sitemap.xml
  fs.writeFileSync(path.join(siteRoot, 'robots.txt'),
    `User-agent: *\nAllow: /\nSitemap: https://${vars.domain}/sitemap.xml\n`);
  fs.writeFileSync(path.join(siteRoot, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://${vars.domain}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`);

  // Update sites.json (append, active: false)
  const sites = JSON.parse(fs.readFileSync(SITES_FILE, 'utf-8'));
  if (sites.find(s => s.slug === vars.slug)) {
    console.error(`Slug ${vars.slug} already in sites.json`);
    process.exit(1);
  }
  sites.push({
    slug: vars.slug,
    domain: vars.domain,
    siteName: vars.siteName,
    niche: vars.niche,
    lang: vars.lang,
    articlesPerDay: vars.articlesPerDay,
    productPitch: vars.productPitch,
    minInvest: vars.minInvest,
    currency: vars.currency,
    ctaPrimary: vars.ctaPrimary,
    leadWebhook: vars.leadWebhook,
    telegramChatId: '',
    telegramBotToken: '',
    themes: [vars.niche],
    rssFeeds: [
      { url: 'https://feeds.bloomberg.com/technology/news.rss', category: 'investissement', lang: 'en' },
    ],
    active: false,
  });
  fs.writeFileSync(SITES_FILE, JSON.stringify(sites, null, 2));
  console.log(`  appended to sites.json (active: false)`);

  console.log(`
==============================================
  Site scaffolded: ${vars.slug}
==============================================
Files created in: sites/${vars.slug}/

NEXT STEPS:
  1. Buy domain '${vars.domain}' (Namecheap, OVH, Cloudflare Registrar)
  2. Point DNS to Cloudflare nameservers
  3. Cloudflare dashboard > Workers & Pages > Create application > Pages > Connect to Git
     - Repo: cryptomind
     - Build root: sites/${vars.slug}
     - Build command: (none - static)
     - Output dir: /
  4. Add custom domain '${vars.domain}' to the Pages project
  5. Customize sites/${vars.slug}/index.html (RSS feeds, content, branding) as needed
  6. Edit seo-engine/sites.json — set "active": true, adjust rssFeeds to your niche
  7. Verify domain in Google Search Console
     - Add cron-mind-indexing@... service account as Owner
     - Submit https://${vars.domain}/sitemap.xml
  8. Generate seed content:
     node seo-engine/publish-for-site.js ${vars.slug}
  9. Commit + push — Cloudflare auto-deploys
`);
}

if (require.main === module) main();
