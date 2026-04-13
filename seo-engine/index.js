const fs = require('fs');
const path = require('path');
const config = require('./config');
const { fetchAllNews, selectTopics } = require('./news-fetcher');
const { generateArticle, closeBrowser } = require('./article-generator');
const { buildArticleHTML, buildBlogIndex, buildSitemap } = require('./html-builder');
const { submitNewArticles } = require('./gsc-submit');

// Load article registry
const REGISTRY_FILE = path.join(config.dataDir, 'articles-registry.json');

function loadRegistry() {
  if (!fs.existsSync(config.dataDir)) {
    fs.mkdirSync(config.dataDir, { recursive: true });
  }
  if (fs.existsSync(REGISTRY_FILE)) {
    return JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf-8'));
  }
  return [];
}

function saveRegistry(registry) {
  fs.writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2));
}

async function run(articlesCount = 3) {
  console.log('==============================================');
  console.log('  SEO Engine — Article Generator');
  console.log(`  ${new Date().toLocaleString('fr-FR')}`);
  console.log('==============================================\n');

  // Ensure directories
  if (!fs.existsSync(config.articlesDir)) {
    fs.mkdirSync(config.articlesDir, { recursive: true });
  }

  const registry = loadRegistry();

  // 1. Fetch latest news
  const news = await fetchAllNews();
  if (news.length === 0) {
    console.log('\nNo new articles found from RSS feeds. Using random themes.\n');
  }

  // 2. Generate articles
  const newSlugs = [];

  for (let i = 0; i < articlesCount; i++) {
    console.log(`\n--- Article ${i + 1}/${articlesCount} ---`);

    // Pick news items for this article (rotate through available news)
    const topicCount = Math.min(3, Math.max(1, news.length));
    const topics = news.length > 0 ? selectTopics(news, topicCount) : [];

    // If no news, create a synthetic topic
    if (topics.length === 0) {
      const theme = config.themes[Math.floor(Math.random() * config.themes.length)];
      topics.push({
        title: `Tendances ${theme.replace(/-/g, ' ')} en ${new Date().getFullYear()}`,
        summary: `Analyse des dernières évolutions dans le domaine de ${theme.replace(/-/g, ' ')}.`,
        source: 'Analyse interne',
        link: '',
        category: theme.includes('crypto') ? 'crypto' : theme.includes('ia') ? 'ia' : 'investissement',
        date: new Date().toISOString(),
      });
    }

    try {
      const article = await generateArticle(topics);

      if (!article) {
        console.log('  Skipping — generation failed');
        continue;
      }

      // Check for duplicate slug
      if (registry.find((r) => r.slug === article.slug)) {
        article.slug = `${article.slug}-${Date.now().toString(36)}`;
      }

      // Write HTML file
      const html = buildArticleHTML(article);
      const filePath = path.join(config.articlesDir, `${article.slug}.html`);
      fs.writeFileSync(filePath, html, 'utf-8');
      console.log(`  Written: ${article.slug}.html`);

      // Add to registry
      registry.push({
        slug: article.slug,
        title: article.title,
        category: article.category,
        tags: article.tags,
        excerpt: article.excerpt,
        readTime: article.readTime,
        generatedAt: article.generatedAt,
      });

      newSlugs.push(article.slug);
    } catch (err) {
      console.error(`  Error generating article: ${err.message}`);
    }
  }

  // 3. Rebuild blog index
  console.log('\nRebuilding blog index...');
  const indexHTML = buildBlogIndex(registry);
  fs.writeFileSync(path.join(config.blogDir, 'index.html'), indexHTML, 'utf-8');

  // 4. Rebuild sitemap
  console.log('Rebuilding sitemap...');
  const sitemap = buildSitemap(registry);
  fs.writeFileSync(path.join(__dirname, '..', 'sitemap.xml'), sitemap, 'utf-8');

  // 5. Save registry
  saveRegistry(registry);

  // 6. Submit to GSC
  if (newSlugs.length > 0) {
    console.log('\nSubmitting to Google Search Console...');
    await submitNewArticles(newSlugs);
  }

  // 7. Close browser
  console.log('\nClosing browser...');
  await closeBrowser();

  // Summary
  console.log('\n==============================================');
  console.log(`  Done! ${newSlugs.length} new articles generated`);
  console.log(`  Total articles: ${registry.length}`);
  console.log(`  Blog index: blog/index.html`);
  console.log(`  Sitemap: sitemap.xml`);
  console.log('==============================================');
}

// Parse CLI args
const args = process.argv.slice(2);
const count = parseInt(args[0], 10) || 3;

run(count);
