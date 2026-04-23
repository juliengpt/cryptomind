// Deploy all active sites to Cloudflare Pages via Wrangler CLI.
// Reads CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID from .env.
// No GitHub↔Cloudflare connection needed — direct upload.

require('dotenv').config();
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SITES_FILE = path.join(__dirname, 'sites.json');
const ROOT = path.join(__dirname, '..');

// Map slug → Cloudflare Pages project name (may differ from slug)
const PROJECT_NAMES = {
  'crypto-mind': 'cryptomind',
  // All others use the slug as project name
};

function main() {
  if (!process.env.CLOUDFLARE_API_TOKEN) {
    console.log('[deploy-all] CLOUDFLARE_API_TOKEN not set in .env — skipping deploy');
    return;
  }

  const sites = JSON.parse(fs.readFileSync(SITES_FILE, 'utf-8'));
  const active = sites.filter(s => s.active !== false);

  console.log(`[deploy-all] Deploying ${active.length} sites via Wrangler...`);

  for (const site of active) {
    const projectName = PROJECT_NAMES[site.slug] || site.slug;
    const siteDir = path.join(ROOT, 'sites', site.slug);

    if (!fs.existsSync(siteDir)) {
      console.log(`  [${site.slug}] Directory not found: ${siteDir} — skipping`);
      continue;
    }

    try {
      const result = execSync(
        `npx wrangler pages deploy "${siteDir}" --project-name=${projectName} --commit-dirty=true --no-bundle`,
        {
          env: { ...process.env },
          cwd: ROOT,
          timeout: 60000,
          stdio: 'pipe',
        }
      ).toString();

      const success = result.includes('Success') || result.includes('Deployment complete');
      const url = (result.match(/https:\/\/[^\s]+\.pages\.dev/) || [''])[0];
      console.log(`  [${site.slug}] ${success ? 'OK' : 'WARN'} ${url}`);
    } catch (e) {
      console.log(`  [${site.slug}] DEPLOY ERROR: ${e.message.slice(0, 150)}`);
    }
  }

  console.log('[deploy-all] Done.');
}

main();
