const RSSParser = require('rss-parser');
const fs = require('fs');
const path = require('path');
const config = require('./config');

const parser = new RSSParser({
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; SEOEngine/1.0)',
  },
});

const DATA_DIR = config.dataDir;

function seenFile(siteSlug) {
  // Per-site seen file so two sites don't compete for the same news
  if (siteSlug) return path.join(DATA_DIR, 'seen', `${siteSlug}.json`);
  return path.join(DATA_DIR, 'seen-articles.json');
}

function ensureDataDir(siteSlug) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (siteSlug) {
    const dir = path.join(DATA_DIR, 'seen');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
}

function loadSeen(siteSlug) {
  ensureDataDir(siteSlug);
  const f = seenFile(siteSlug);
  if (fs.existsSync(f)) return JSON.parse(fs.readFileSync(f, 'utf-8'));
  return {};
}

function saveSeen(seen, siteSlug) {
  fs.writeFileSync(seenFile(siteSlug), JSON.stringify(seen, null, 2));
}

async function fetchFeed(feed) {
  try {
    const result = await parser.parseURL(feed.url);
    return result.items.map((item) => ({
      title: item.title || '',
      link: item.link || '',
      summary: item.contentSnippet || item.content || '',
      date: item.isoDate || item.pubDate || new Date().toISOString(),
      category: feed.category,
      source: result.title || feed.url,
    }));
  } catch (err) {
    console.warn(`  [WARN] Failed to fetch ${feed.url}: ${err.message}`);
    return [];
  }
}

async function fetchAllNews(opts = {}) {
  // opts: { feeds, siteSlug }  — feeds defaults to config.rssFeeds, siteSlug for per-site seen tracking
  const feeds = opts.feeds || config.rssFeeds;
  const siteSlug = opts.siteSlug;

  console.log(`Fetching news from ${feeds.length} RSS feeds${siteSlug ? ` (site: ${siteSlug})` : ''}...`);
  const seen = loadSeen(siteSlug);
  const allArticles = [];

  for (const feed of feeds) {
    const items = await fetchFeed(feed);
    console.log(`  ${feed.category}: ${items.length} articles from ${feed.url.split('/')[2]}`);

    for (const item of items) {
      const key = item.link || item.title;
      const entry = seen[key];
      // Include items that are either fresh OR fetched-but-not-yet-used
      if (!entry || entry.used !== true) {
        allArticles.push(item);
        if (!entry) seen[key] = { date: new Date().toISOString(), used: false };
      }
    }
  }

  // Clean seen entries older than 30 days
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  for (const [key, val] of Object.entries(seen)) {
    if (new Date(val.date).getTime() < thirtyDaysAgo) {
      delete seen[key];
    }
  }

  saveSeen(seen, siteSlug);

  // Sort by date (newest first)
  allArticles.sort((a, b) => new Date(b.date) - new Date(a.date));

  console.log(`Total new articles found: ${allArticles.length}`);
  return allArticles;
}

// Pick the best articles to write about - mix of categories
function selectTopics(articles, count = 3, siteSlug) {
  const byCategory = {};
  for (const a of articles) {
    if (!byCategory[a.category]) byCategory[a.category] = [];
    byCategory[a.category].push(a);
  }

  const selected = [];
  const categories = Object.keys(byCategory);
  let catIndex = 0;

  while (selected.length < count && categories.length > 0) {
    const cat = categories[catIndex % categories.length];
    const pool = byCategory[cat];
    if (pool.length > 0) {
      selected.push(pool.shift());
    } else {
      categories.splice(catIndex % categories.length, 1);
      if (categories.length === 0) break;
    }
    catIndex++;
  }

  // Mark as used
  const seen = loadSeen(siteSlug);
  for (const s of selected) {
    const key = s.link || s.title;
    if (seen[key]) seen[key].used = true;
  }
  saveSeen(seen, siteSlug);

  return selected;
}

function markUsed(item, siteSlug) {
  const seen = loadSeen(siteSlug);
  const key = item.link || item.title;
  if (seen[key]) {
    seen[key].used = true;
    saveSeen(seen, siteSlug);
  }
}

module.exports = { fetchAllNews, selectTopics, markUsed };
