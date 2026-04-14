require('dotenv').config();
const path = require('path');

module.exports = {
  // API
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,

  // Site
  siteUrl: process.env.SITE_URL || 'https://crypto-mind.net',
  siteName: process.env.SITE_NAME || 'CryptoMind AI',

  // Paths
  blogDir: path.join(__dirname, '..', 'blog'),
  articlesDir: path.join(__dirname, '..', 'blog', 'articles'),
  dataDir: path.join(__dirname, 'data'),

  // RSS feeds - actualité temps réel
  rssFeeds: [
    // Crypto
    { url: 'https://cointelegraph.com/rss', category: 'crypto', lang: 'en' },
    { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', category: 'crypto', lang: 'en' },
    { url: 'https://cryptonews.com/news/feed/', category: 'crypto', lang: 'en' },
    // AI
    { url: 'https://techcrunch.com/category/artificial-intelligence/feed/', category: 'ia', lang: 'en' },
    { url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', category: 'ia', lang: 'en' },
    { url: 'https://feeds.arstechnica.com/arstechnica/technology-lab', category: 'ia', lang: 'en' },
    // Finance / Investissement
    { url: 'https://www.investing.com/rss/news.rss', category: 'investissement', lang: 'en' },
    { url: 'https://feeds.bloomberg.com/technology/news.rss', category: 'investissement', lang: 'en' },
  ],

  // Thématiques pour articles variés
  themes: [
    'intelligence-artificielle',
    'crypto-monnaies',
    'investissement-technologique',
    'blockchain',
    'machine-learning',
    'trading-algorithmique',
    'defi-finance-decentralisee',
    'regulation-crypto',
    'ia-et-finance',
    'web3',
    'nft-et-metaverse',
    'cybersecurite',
    'big-data',
    'automatisation',
    'fintech',
  ],

  // SEO settings
  seo: {
    defaultLang: 'fr',
    articlesPerSitemap: 5000,
    minWordCount: 1500,
    maxWordCount: 2500,
  },
};
