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
