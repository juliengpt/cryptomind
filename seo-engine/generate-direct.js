// Direct article generation — outputs article data as JSON for Claude to fill
// Usage: node generate-direct.js
// Reads fresh news, outputs the context, then expects article JSON files in data/pending/

const fs = require('fs');
const path = require('path');
const config = require('./config');
const { fetchAllNews, selectTopics } = require('./news-fetcher');
const { buildArticleHTML, buildBlogIndex, buildSitemap } = require('./html-builder');
const { submitNewArticles } = require('./gsc-submit');

const REGISTRY_FILE = path.join(config.dataDir, 'articles-registry.json');

function loadRegistry() {
  if (!fs.existsSync(config.dataDir)) fs.mkdirSync(config.dataDir, { recursive: true });
  if (fs.existsSync(REGISTRY_FILE)) return JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf-8'));
  return [];
}

function saveRegistry(reg) {
  fs.writeFileSync(REGISTRY_FILE, JSON.stringify(reg, null, 2));
}

function publishArticle(article) {
  const registry = loadRegistry();

  if (!article || !article.title || !article.slug || !article.content) {
    console.error('Invalid article data');
    return false;
  }

  // Deduplicate slug
  if (registry.find(r => r.slug === article.slug)) {
    article.slug = article.slug + '-' + Date.now().toString(36);
  }

  // Ensure dirs
  if (!fs.existsSync(config.articlesDir)) fs.mkdirSync(config.articlesDir, { recursive: true });

  // Write HTML
  const html = buildArticleHTML(article);
  const filePath = path.join(config.articlesDir, article.slug + '.html');
  fs.writeFileSync(filePath, html, 'utf-8');

  // Update registry
  registry.push({
    slug: article.slug,
    title: article.title,
    category: article.category,
    tags: article.tags,
    excerpt: article.excerpt,
    readTime: article.readTime,
    generatedAt: article.generatedAt,
  });
  saveRegistry(registry);

  // Rebuild index + sitemap
  const indexHTML = buildBlogIndex(registry);
  fs.writeFileSync(path.join(config.blogDir, 'index.html'), indexHTML, 'utf-8');
  const sitemap = buildSitemap(registry);
  fs.writeFileSync(path.join(__dirname, '..', 'sitemap.xml'), sitemap, 'utf-8');

  console.log('Published: ' + article.slug + '.html');
  console.log('Total articles: ' + registry.length);
  return true;
}

module.exports = { publishArticle, loadRegistry };
