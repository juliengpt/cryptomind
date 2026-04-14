// Generates images for articles using Pexels API (free, high quality photos)
// API key: free at https://www.pexels.com/api/
const fs = require('fs');
const path = require('path');
const https = require('https');
const config = require('./config');

const IMAGES_DIR = path.join(config.blogDir, 'images');
const BATCH_DIR = path.join(__dirname, 'data', 'batch');
const PEXELS_API_KEY = process.env.PEXELS_API_KEY || '';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const follow = (url, redir = 0) => {
      if (redir > 5) return reject(new Error('Too many redirects'));
      const client = url.startsWith('https') ? https : require('http');
      client.get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return follow(res.headers.location, redir + 1);
        }
        if (res.statusCode !== 200) return reject(new Error('HTTP ' + res.statusCode));
        const chunks = [];
        res.on('data', (d) => chunks.push(d));
        res.on('end', () => {
          const buf = Buffer.concat(chunks);
          fs.writeFileSync(filePath, buf);
          resolve(buf.length);
        });
        res.on('error', reject);
      }).on('error', reject);
    };
    follow(url);
  });
}

function pexelsSearch(query, perPage = 5) {
  return new Promise((resolve, reject) => {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape&size=large`;
    https.get(url, {
      headers: { Authorization: PEXELS_API_KEY },
    }, (res) => {
      const chunks = [];
      res.on('data', (d) => chunks.push(d));
      res.on('end', () => {
        try {
          const data = JSON.parse(Buffer.concat(chunks).toString());
          resolve(data.photos || []);
        } catch (e) {
          reject(e);
        }
      });
      res.on('error', reject);
    }).on('error', reject);
  });
}

// Each article has specific search queries + pick index to get the best photo
const ARTICLE_IMAGES = {
  'hack-polkadot-hyperbridge-exploit-dot-2026': {
    hero: { q: 'cyber attack code screen dark', pick: 0 },
    inline: [
      { q: 'crypto bitcoin digital screen', pick: 1 },
      { q: 'stock market crash red screen', pick: 0 },
      { q: 'server room data center security', pick: 0 },
    ],
  },
  'petrole-100-dollars-hormuz-impact-crypto-2026': {
    hero: { q: 'oil tanker cargo ship sea', pick: 0 },
    inline: [
      { q: 'oil refinery industry night', pick: 0 },
      { q: 'trading floor stock exchange screens', pick: 0 },
      { q: 'military navy warship ocean', pick: 0 },
    ],
  },
  'elon-musk-intel-terafab-chipmaking-2026': {
    hero: { q: 'silicon wafer semiconductor manufacturing', pick: 0 },
    inline: [
      { q: 'cpu processor chip macro', pick: 0 },
      { q: 'factory robot assembly line technology', pick: 0 },
      { q: 'data center GPU servers', pick: 0 },
    ],
  },
  'gpu-orbite-kepler-communications-calcul-spatial-ia-2026': {
    hero: { q: 'satellite space station orbit', pick: 0 },
    inline: [
      { q: 'earth from space night lights', pick: 0 },
      { q: 'rocket launch space', pick: 0 },
      { q: 'mission control room NASA screens', pick: 0 },
    ],
  },
  'anthropic-mythos-banques-administration-trump-ia-2026': {
    hero: { q: 'AI robot technology futuristic', pick: 0 },
    inline: [
      { q: 'financial charts computer monitor trading', pick: 0 },
      { q: 'wall street new york stock exchange', pick: 0 },
      { q: 'white house washington government', pick: 0 },
    ],
  },
  'zuckerberg-clone-ia-meta-2026': {
    hero: { q: 'virtual reality headset Meta office', pick: 0 },
    inline: [
      { q: 'VR headset Meta Quest technology', pick: 0 },
      { q: 'humanoid robot office futuristic', pick: 0 },
      { q: 'AI data screens artificial intelligence office', pick: 0 },
    ],
  },
  'strategy-bitcoin-800k-btc-achat-2026': {
    hero: { q: 'bitcoin gold coin market chart', pick: 0 },
    inline: [
      { q: 'bitcoin cryptocurrency gold digital', pick: 1 },
      { q: 'stock exchange trading floor screens', pick: 0 },
      { q: 'crypto mining data center servers', pick: 0 },
    ],
  },
  'apple-lunettes-connectees-ar-2026': {
    hero: { q: 'smart glasses augmented reality wearable', pick: 0 },
    inline: [
      { q: 'augmented reality glasses person wearing', pick: 0 },
      { q: 'holographic display AR interface', pick: 0 },
      { q: 'technology manufacturing assembly electronics', pick: 0 },
    ],
  },
  'agents-ia-malveillants-vol-crypto-2026': {
    hero: { q: 'hacker dark screen code cyber attack', pick: 0 },
    inline: [
      { q: 'hacker computer code dark room', pick: 1 },
      { q: 'blockchain cryptocurrency screen data', pick: 0 },
      { q: 'digital lock cybersecurity protection', pick: 0 },
    ],
  },
  'xrp-whale-coinbase-120-millions-2026': {
    hero: { q: 'cryptocurrency trading chart screen', pick: 0 },
    inline: [
      { q: 'crypto trading screen chart data', pick: 1 },
      { q: 'stock market chart red downtrend', pick: 0 },
      { q: 'data center server computing', pick: 1 },
    ],
  },
  'visa-stripe-tempo-blockchain-paiements-2026': {
    hero: { q: 'credit card payment terminal contactless', pick: 0 },
    inline: [
      { q: 'blockchain network digital nodes', pick: 0 },
      { q: 'mobile payment smartphone fintech', pick: 0 },
      { q: 'bank building financial district', pick: 0 },
    ],
  },
  'amazon-rachete-globalstar-satellites-90-dollars-2026': {
    hero: { q: 'satellite dish communication space', pick: 0 },
    inline: [
      { q: 'amazon warehouse logistics', pick: 0 },
      { q: 'satellite orbiting earth space', pick: 0 },
      { q: 'internet connectivity rural area', pick: 0 },
    ],
  },
  'deutsche-borse-investit-200m-kraken-crypto-2026': {
    hero: { q: 'stock exchange trading floor europe', pick: 0 },
    inline: [
      { q: 'cryptocurrency exchange platform screen', pick: 0 },
      { q: 'european union flags brussels', pick: 0 },
      { q: 'business handshake deal partnership', pick: 0 },
    ],
  },
  'fausse-app-ledger-apple-store-vol-crypto-2026': {
    hero: { q: 'smartphone phishing scam alert', pick: 0 },
    inline: [
      { q: 'apple store app download', pick: 0 },
      { q: 'hardware wallet crypto ledger', pick: 0 },
      { q: 'cybersecurity lock protection digital', pick: 0 },
    ],
  },
  'bitcoin-75k-shorts-liquidation-200m-2026': {
    hero: { q: 'bitcoin cryptocurrency trading chart green', pick: 0 },
    inline: [
      { q: 'trading screen charts candlestick', pick: 0 },
      { q: 'bull statue wall street finance', pick: 0 },
      { q: 'bitcoin gold coin pile', pick: 0 },
    ],
  },
  'alibaba-robot-humanoide-ia-chine-2026': {
    hero: { q: 'humanoid robot futuristic white', pick: 0 },
    inline: [
      { q: 'factory automation robot arm', pick: 0 },
      { q: 'china technology city skyline', pick: 0 },
      { q: 'artificial intelligence circuit board', pick: 0 },
    ],
  },
  'ethereum-rebond-trendline-historique-bull-market-2026': {
    hero: { q: 'ethereum cryptocurrency coin digital', pick: 0 },
    inline: [
      { q: 'stock chart uptrend green bullish', pick: 0 },
      { q: 'decentralized finance DeFi blockchain', pick: 0 },
      { q: 'crypto trader computer multiple screens', pick: 0 },
    ],
  },
  'onecoin-victimes-40-millions-arnaque-crypto-2026': {
    hero: { q: 'justice courthouse law gavel', pick: 0 },
    inline: [
      { q: 'fraud scam money crime', pick: 0 },
      { q: 'courtroom trial justice legal', pick: 0 },
      { q: 'people protest demonstration crowd', pick: 0 },
    ],
  },
  'hacks-web3-482m-q1-2026-phishing-securite': {
    hero: { q: 'hacker hooded computer cyber attack', pick: 0 },
    inline: [
      { q: 'phishing email scam warning', pick: 0 },
      { q: 'blockchain security shield protection', pick: 0 },
      { q: 'server room data center security', pick: 1 },
    ],
  },
  'macron-ue-reseaux-sociaux-mineurs-regulation-2026': {
    hero: { q: 'social media apps smartphone screen', pick: 0 },
    inline: [
      { q: 'european parliament building brussels', pick: 0 },
      { q: 'teenager smartphone social media', pick: 0 },
      { q: 'data privacy regulation GDPR', pick: 0 },
    ],
  },
};

async function main() {
  console.log('==============================================');
  console.log('  SEO Engine — Pexels Image Generator');
  console.log('  Real photos, free & high quality');
  console.log('==============================================\n');

  if (!PEXELS_API_KEY) {
    console.error('ERROR: PEXELS_API_KEY not set.');
    console.error('Get a free key at https://www.pexels.com/api/');
    console.error('Then add to .env: PEXELS_API_KEY=your_key');
    process.exit(1);
  }

  if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

  let total = 0;
  let success = 0;

  for (const [slug, queries] of Object.entries(ARTICLE_IMAGES)) {
    console.log(`\n--- ${slug} ---`);

    // Hero image
    const heroFile = path.join(IMAGES_DIR, `${slug}.png`);
    if (!fs.existsSync(heroFile)) {
      total++;
      console.log(`  [hero] Searching: "${queries.hero.q}"`);
      try {
        const photos = await pexelsSearch(queries.hero.q, 5);
        const pick = Math.min(queries.hero.pick || 0, photos.length - 1);
        if (photos.length > 0) {
          const photo = photos[pick];
          const imgUrl = photo.src.landscape || photo.src.large;
          await downloadFile(imgUrl, heroFile);
          console.log(`  OK: ${slug}.png (${photo.photographer})`);
          success++;
        } else {
          console.log('  No results');
        }
      } catch (e) {
        console.log('  Error: ' + e.message);
      }
      await sleep(500);
    }

    // Inline images
    for (let i = 0; i < queries.inline.length; i++) {
      const inlineFile = path.join(IMAGES_DIR, `${slug}-${i + 1}.png`);
      if (!fs.existsSync(inlineFile)) {
        total++;
        const q = queries.inline[i];
        console.log(`  [inline ${i + 1}] Searching: "${q.q}"`);
        try {
          const photos = await pexelsSearch(q.q, 5);
          const pick = Math.min(q.pick || 0, photos.length - 1);
          if (photos.length > 0) {
            const photo = photos[pick];
            const imgUrl = photo.src.landscape || photo.src.large;
            await downloadFile(imgUrl, inlineFile);
            console.log(`  OK: ${slug}-${i + 1}.png (${photo.photographer})`);
            success++;
          } else {
            console.log('  No results');
          }
        } catch (e) {
          console.log('  Error: ' + e.message);
        }
        await sleep(500);
      }
    }
  }

  console.log('\n==============================================');
  console.log(`  Done! ${success}/${total} images downloaded.`);
  console.log('==============================================');

  // Rebuild blog index
  if (success > 0) {
    const { buildBlogIndex } = require('./html-builder');
    const regFile = path.join(config.dataDir, 'articles-registry.json');
    if (fs.existsSync(regFile)) {
      const reg = JSON.parse(fs.readFileSync(regFile, 'utf-8'));
      fs.writeFileSync(path.join(config.blogDir, 'index.html'), buildBlogIndex(reg), 'utf-8');
      console.log('Blog index rebuilt.');
    }
  }
}

main().catch((e) => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
