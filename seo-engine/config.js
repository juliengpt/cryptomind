// Global config — defaults overridden per-site via sites.json
require('dotenv').config();
const path = require('path');

module.exports = {
  // Default site (legacy fallback if no siteConfig passed to builder)
  siteUrl: process.env.SITE_URL || 'https://crypto-mind.net',
  siteName: process.env.SITE_NAME || 'CryptoMind AI',

  // Default paths (overridden per site)
  blogDir: path.join(__dirname, '..', 'sites', 'crypto-mind', 'blog'),
  articlesDir: path.join(__dirname, '..', 'sites', 'crypto-mind', 'blog', 'articles'),
  dataDir: path.join(__dirname, 'data'),

  // Default RSS feeds (overridden per site)
  rssFeeds: [
    { url: 'https://cointelegraph.com/rss', category: 'crypto', lang: 'en' },
    { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', category: 'crypto', lang: 'en' },
    { url: 'https://techcrunch.com/category/artificial-intelligence/feed/', category: 'ia', lang: 'en' },
    { url: 'https://feeds.bloomberg.com/technology/news.rss', category: 'investissement', lang: 'en' },
  ],

  themes: [
    'intelligence-artificielle', 'crypto-monnaies', 'investissement-technologique',
    'blockchain', 'machine-learning', 'trading-algorithmique',
  ],

  seo: {
    defaultLang: 'fr',
    minWordCount: 1500,
    maxWordCount: 3000,
  },
};
