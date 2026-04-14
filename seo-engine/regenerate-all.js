// Regenerate all HTML articles from batch JSONs using updated template
const fs = require('fs');
const path = require('path');
const config = require('./config');
const { buildArticleHTML, buildBlogIndex, buildSitemap } = require('./html-builder');

const BATCH_DIR = path.join(__dirname, 'data', 'batch');
const REGISTRY_FILE = path.join(config.dataDir, 'articles-registry.json');

const registry = JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf-8'));
const files = fs.readdirSync(BATCH_DIR).filter(f => f.endsWith('.json')).sort();

console.log(`Regenerating ${files.length} articles...`);

let count = 0;
for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(BATCH_DIR, file), 'utf-8'));

  let content = '';
  if (data.sections && Array.isArray(data.sections)) {
    for (const sec of data.sections) {
      content += `<h2>${sec.title}</h2>\n${sec.content}\n\n`;
    }
  } else if (data.content) {
    content = data.content;
  }

  // Auto-inject inline images if JSON doesn't include them
  if (!content.includes('<figure>') && !content.includes('<img')) {
    const imgDir = path.join(config.blogDir, 'images');
    const availableImages = [1, 2, 3].filter(n =>
      fs.existsSync(path.join(imgDir, `${data.slug}-${n}.png`))
    );

    if (availableImages.length > 0) {
      let h2Count = 0;
      let imgIdx = 0;
      // Inject after 2nd, 4th, 6th H2
      content = content.replace(/<h2>/g, (match) => {
        h2Count++;
        if ((h2Count === 2 || h2Count === 4 || h2Count === 6) && imgIdx < availableImages.length) {
          const n = availableImages[imgIdx++];
          const altText = data.sections && data.sections[h2Count - 1] ? data.sections[h2Count - 1].title : data.title;
          const fig = `<figure><img src="../images/${data.slug}-${n}.png" alt="${altText.replace(/"/g, '&quot;')}" loading="lazy"><figcaption>${altText}</figcaption></figure>\n`;
          return fig + match;
        }
        return match;
      });
    }
  }

  const regEntry = registry.find(r => r.slug === data.slug);
  const article = {
    slug: data.slug,
    title: data.title,
    metaDescription: data.metaDescription || '',
    category: data.category || 'crypto monnaies',
    tags: data.tags || [],
    author: data.author || 'CryptoMind AI',
    datePublished: data.datePublished || new Date().toISOString(),
    heroAlt: data.heroAlt || data.title,
    content: content,
    excerpt: data.metaDescription || data.title,
    readTime: Math.ceil(content.split(/\s+/).length / 200) + ' min',
    generatedAt: (regEntry && regEntry.generatedAt) || data.datePublished || new Date().toISOString(),
  };

  const html = buildArticleHTML(article);
  const filePath = path.join(config.articlesDir, article.slug + '.html');
  fs.writeFileSync(filePath, html, 'utf-8');
  count++;
  console.log(`  OK: ${article.slug}.html`);
}

// Rebuild blog index + sitemap
fs.writeFileSync(path.join(config.blogDir, 'index.html'), buildBlogIndex(registry), 'utf-8');
fs.writeFileSync(path.join(__dirname, '..', 'sitemap.xml'), buildSitemap(registry), 'utf-8');

console.log(`\nRegenerated ${count} articles + blog index + sitemap.`);
