// Cron-like scheduler — runs article generation at a configurable interval
// Usage: node cron.js [articles_per_batch] [interval_minutes]
// Default: 3 articles every 60 minutes = 72 articles/day

const { execSync, spawn } = require('child_process');
const path = require('path');

const ARTICLES_PER_BATCH = parseInt(process.argv[2], 10) || 3;
const INTERVAL_MIN = parseInt(process.argv[3], 10) || 60;

console.log('==============================================');
console.log('  SEO Engine — Cron Scheduler');
console.log(`  ${ARTICLES_PER_BATCH} articles every ${INTERVAL_MIN} minutes`);
console.log(`  = ~${Math.round((ARTICLES_PER_BATCH * 24 * 60) / INTERVAL_MIN)} articles/day`);
console.log('  Press Ctrl+C to stop');
console.log('==============================================\n');

function runGeneration() {
  const timestamp = new Date().toLocaleString('fr-FR');
  console.log(`\n[${timestamp}] Starting batch generation...`);

  try {
    const result = spawn('node', [path.join(__dirname, 'index.js'), String(ARTICLES_PER_BATCH)], {
      stdio: 'inherit',
      cwd: __dirname,
    });

    result.on('close', (code) => {
      if (code === 0) {
        console.log(`[${timestamp}] Batch complete. Next run in ${INTERVAL_MIN} minutes.\n`);
      } else {
        console.error(`[${timestamp}] Batch failed with code ${code}. Retrying next cycle.\n`);
      }
    });
  } catch (err) {
    console.error(`[${timestamp}] Error: ${err.message}`);
  }
}

// Run immediately
runGeneration();

// Then schedule
setInterval(runGeneration, INTERVAL_MIN * 60 * 1000);
