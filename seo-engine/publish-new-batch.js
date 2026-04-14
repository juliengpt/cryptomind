// Publishes new JSON articles (11-20) from data/batch/
const fs = require('fs');
const path = require('path');
const { publishArticle } = require('./generate-direct');

const BATCH_DIR = path.join(__dirname, 'data', 'batch');

const files = fs.readdirSync(BATCH_DIR)
  .filter(f => f.endsWith('.json') && /^(1[1-9]|20)/.test(f))
  .sort();

console.log(`Publishing ${files.length} new articles...\n`);

let published = 0;
for (const file of files) {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(BATCH_DIR, file), 'utf-8'));

    // Convert sections to content HTML string
    let content = '';
    if (data.sections && Array.isArray(data.sections)) {
      for (const sec of data.sections) {
        content += `<h2>${sec.title}</h2>\n${sec.content}\n\n`;
      }
    } else if (data.content) {
      content = data.content;
    }

    // Build article object expected by publishArticle
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
      generatedAt: new Date().toISOString(),
    };

    const ok = publishArticle(article);
    if (ok) published++;
  } catch (err) {
    console.error(`Error with ${file}: ${err.message}`);
  }
}

console.log(`\nDone! Published ${published}/${files.length} articles.`);
