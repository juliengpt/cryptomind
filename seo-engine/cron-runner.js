// Hourly orchestrator — decides which sites get published this run.
// Each site declares articlesPerDay; we use a per-site accumulator persisted in
// data/cron-state.json so e.g. articlesPerDay=4 publishes every ~6h, not 4 in same hour.
//
// Runs publishOneArticle(site) for each site whose accumulator >= 1.
//
// Designed for GitHub Actions hourly cron: idempotent, safe to invoke multiple times.

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { publishOneArticle, loadSites } = require('./publish-for-site');

const STATE_FILE = path.join(__dirname, 'data', 'cron-state.json');
const LOG_FILE = path.join(__dirname, 'data', 'cron-runner.log');

function loadState() {
  if (fs.existsSync(STATE_FILE)) return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  return {};
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function log(msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${msg}`;
  console.log(line);
  try { fs.appendFileSync(LOG_FILE, line + '\n'); } catch {}
}

async function main() {
  log('===== cron-runner start =====');

  const sites = loadSites().filter(s => s.active !== false);
  log(`Active sites: ${sites.length}`);

  const state = loadState();
  const results = [];

  for (const site of sites) {
    const apd = Math.max(0.1, Number(site.articlesPerDay) || 1);
    const perRun = apd / 24; // articles credited per hourly run
    const cur = (state[site.slug]?.accumulator || 0) + perRun;

    log(`${site.slug}: articlesPerDay=${apd}, accumulator ${cur.toFixed(3)}`);

    if (cur < 1) {
      // Not enough credit yet, just persist the increment
      state[site.slug] = { accumulator: cur, lastRun: new Date().toISOString() };
      results.push({ site: site.slug, published: 0, reason: 'accumulator < 1' });
      continue;
    }

    // Publish floor(cur) articles, capped at 2 per run to avoid Gemini rate limits
    const toPublish = Math.min(Math.floor(cur), 2);
    let publishedCount = 0;
    let remainder = cur - toPublish;

    for (let i = 0; i < toPublish; i++) {
      try {
        const slug = await publishOneArticle(site);
        if (slug) publishedCount++;
        // Throttle between publishes to be nice to APIs
        if (i < toPublish - 1) await new Promise(r => setTimeout(r, 5000));
      } catch (e) {
        log(`  ${site.slug} publish error: ${e.message}`);
      }
    }

    // If a publish failed, give back its credit so we retry next hour
    const consumed = publishedCount;
    remainder = cur - consumed;
    state[site.slug] = { accumulator: Math.max(0, remainder), lastRun: new Date().toISOString() };
    results.push({ site: site.slug, published: publishedCount });
  }

  saveState(state);

  log('===== cron-runner end =====');
  log('Summary: ' + JSON.stringify(results));
}

if (require.main === module) {
  main().catch(e => { log('FATAL: ' + e.message); process.exit(1); });
}
