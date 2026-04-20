// Fully automated site deployment:
//   1. Create Cloudflare Pages project (connected to GitHub repo)
//   2. Set custom domain on the project
//   3. Add domain to Google Search Console
//   4. Add DNS TXT record for GSC verification (via Cloudflare DNS API)
//   5. Verify domain in GSC
//   6. Add service account as Owner in GSC
//   7. Submit sitemap
//
// Usage: node deploy-site.js <slug>
//
// Required env vars (set once in .env):
//   CLOUDFLARE_API_TOKEN   — create at https://dash.cloudflare.com/profile/api-tokens (use "Edit Cloudflare Pages" template + DNS edit)
//   CLOUDFLARE_ACCOUNT_ID  — visible at https://dash.cloudflare.com → any domain → Overview → right sidebar
//   GITHUB_REPO            — e.g. "juliengpt/cryptomind"

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');

const SITES_FILE = path.join(__dirname, 'sites.json');
const CF_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CF_ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID;
const GITHUB_REPO = process.env.GITHUB_REPO || 'juliengpt/cryptomind';
const GSC_CRED_PATH = process.env.GSC_SERVICE_ACCOUNT_JSON || path.join(__dirname, 'gsc-credentials.json');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function cfApi(method, endpoint, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const req = https.request({
      hostname: 'api.cloudflare.com',
      path: `/client/v4${endpoint}`,
      method,
      headers: {
        Authorization: `Bearer ${CF_TOKEN}`,
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    }, (res) => {
      const chunks = [];
      res.on('data', d => chunks.push(d));
      res.on('end', () => {
        try {
          const json = JSON.parse(Buffer.concat(chunks).toString());
          resolve({ status: res.statusCode, data: json });
        } catch (e) { resolve({ status: res.statusCode, data: Buffer.concat(chunks).toString() }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function getZoneId(domain) {
  const { data } = await cfApi('GET', `/zones?name=${domain}&status=active`);
  if (data.result && data.result.length > 0) return data.result[0].id;
  return null;
}

async function addDnsTxtRecord(zoneId, domain, value) {
  const { data } = await cfApi('POST', `/zones/${zoneId}/dns_records`, {
    type: 'TXT',
    name: domain,
    content: value,
    ttl: 1, // auto
  });
  if (data.success) {
    console.log(`  [CF] DNS TXT record added for ${domain}`);
    return true;
  }
  console.log(`  [CF] DNS TXT error: ${JSON.stringify(data.errors || data.messages)}`);
  return false;
}

async function createPagesProject(slug, domain) {
  console.log(`  [CF] Creating Pages project: ${slug}...`);
  const [owner, repo] = GITHUB_REPO.split('/');
  const { status, data } = await cfApi('POST', `/accounts/${CF_ACCOUNT}/pages/projects`, {
    name: slug,
    production_branch: 'master',
    source: {
      type: 'github',
      config: {
        owner,
        repo_name: repo,
        production_branch: 'master',
        pr_comments_enabled: true,
        deployments_enabled: true,
      },
    },
    build_config: {
      build_command: '',
      destination_dir: `sites/${slug}`,
      root_dir: '',
    },
  });

  if (data.success !== false && (status === 200 || status === 201)) {
    console.log(`  [CF] Pages project '${slug}' created`);
    return true;
  }
  // Project might already exist
  if (JSON.stringify(data).includes('already exists') || JSON.stringify(data).includes('A project with this name already exists')) {
    console.log(`  [CF] Project '${slug}' already exists — skipping creation`);
    return true;
  }
  console.log(`  [CF] Pages creation error (${status}): ${JSON.stringify(data.errors || data).slice(0, 300)}`);
  return false;
}

async function addCustomDomain(slug, domain) {
  console.log(`  [CF] Adding custom domain ${domain} to project ${slug}...`);
  const { status, data } = await cfApi('POST', `/accounts/${CF_ACCOUNT}/pages/projects/${slug}/domains`, {
    name: domain,
  });
  if (data.success !== false || JSON.stringify(data).includes('already associated')) {
    console.log(`  [CF] Custom domain ${domain} added`);
  } else {
    console.log(`  [CF] Domain error (${status}): ${JSON.stringify(data.errors || data).slice(0, 200)}`);
  }

  // Add CNAME DNS record pointing to <slug>.pages.dev
  // Always use the root domain (not www) to find the correct zone
  const rootDomain = domain.replace(/^www\./, '').split('.').slice(-2).join('.');
  const zoneId = await getZoneId(rootDomain);
  if (zoneId) {
    const target = `${slug}.pages.dev`;
    const { data: cname } = await cfApi('POST', `/zones/${zoneId}/dns_records`, {
      type: 'CNAME', name: domain, content: target, ttl: 1, proxied: true,
    });
    if (cname.success) {
      console.log(`  [CF] CNAME ${domain} → ${target}`);
    } else if (JSON.stringify(cname).includes('already exists')) {
      console.log(`  [CF] CNAME ${domain} already exists`);
    } else {
      console.log(`  [CF] CNAME error: ${JSON.stringify(cname.errors).slice(0, 150)}`);
    }
  }
  return true;
}

async function setupGsc(domain) {
  if (!fs.existsSync(GSC_CRED_PATH)) {
    console.log('  [GSC] No credentials file, skipping GSC setup');
    return false;
  }

  const { google } = require('googleapis');
  const credentials = JSON.parse(fs.readFileSync(GSC_CRED_PATH, 'utf-8'));
  const serviceAccountEmail = credentials.client_email;

  // Auth with both scopes
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [
      'https://www.googleapis.com/auth/webmasters',
      'https://www.googleapis.com/auth/siteverification',
    ],
  });
  const client = await auth.getClient();

  // Step 1: Get verification token
  console.log(`  [GSC] Getting verification token for ${domain}...`);
  const sv = google.siteVerification({ version: 'v1', auth: client });
  let verificationToken;
  try {
    const { data } = await sv.webResource.getToken({
      requestBody: {
        site: { type: 'INET_DOMAIN', identifier: domain },
        verificationMethod: 'DNS_TXT',
      },
    });
    verificationToken = data.token;
    console.log(`  [GSC] Verification token: ${verificationToken}`);
  } catch (e) {
    console.log(`  [GSC] Token error: ${e.message.slice(0, 150)}`);
    return false;
  }

  // Step 2: Add DNS TXT record via Cloudflare
  const zoneId = await getZoneId(domain);
  if (!zoneId) {
    console.log(`  [CF] Zone not found for ${domain} — add the domain to Cloudflare first`);
    return false;
  }
  await addDnsTxtRecord(zoneId, domain, verificationToken);

  // Step 3: Wait for DNS propagation then verify
  console.log('  [GSC] Waiting 10s for DNS propagation...');
  await sleep(10000);

  // Include user's personal email as co-owner so they can see the property in GSC UI
  const userEmail = process.env.GSC_USER_EMAIL || '';
  const owners = [serviceAccountEmail];
  if (userEmail) owners.push(userEmail);

  try {
    await sv.webResource.insert({
      verificationMethod: 'DNS_TXT',
      requestBody: {
        site: { type: 'INET_DOMAIN', identifier: domain },
        owners,
      },
    });
    console.log(`  [GSC] Domain ${domain} VERIFIED (owners: ${owners.join(', ')})`);
  } catch (e) {
    if (e.message.includes('already verified')) {
      console.log(`  [GSC] Domain ${domain} already verified`);
    } else {
      console.log(`  [GSC] Verification failed: ${e.message.slice(0, 150)}`);
      console.log('  [GSC] DNS may need more time to propagate. Run again in 5 minutes.');
      return false;
    }
  }

  // Step 4: Add as site in Search Console (webmasters)
  const wm = google.webmasters({ version: 'v3', auth: client });
  try {
    await wm.sites.add({ siteUrl: `sc-domain:${domain}` });
    console.log(`  [GSC] Site sc-domain:${domain} added`);
  } catch (e) {
    if (e.message.includes('already exists') || e.message.includes('already been added')) {
      console.log(`  [GSC] Site sc-domain:${domain} already exists`);
    } else {
      console.log(`  [GSC] Add site error: ${e.message.slice(0, 150)}`);
    }
  }

  // Step 5: Submit sitemap
  try {
    await wm.sitemaps.submit({
      siteUrl: `sc-domain:${domain}`,
      feedpath: `https://${domain}/sitemap.xml`,
    });
    console.log(`  [GSC] Sitemap submitted for ${domain}`);
  } catch (e) {
    console.log(`  [GSC] Sitemap error: ${e.message.slice(0, 150)}`);
  }

  return true;
}

async function main() {
  const slug = process.argv[2];
  if (!slug) { console.error('Usage: node deploy-site.js <slug>'); process.exit(1); }
  if (!CF_TOKEN) { console.error('CLOUDFLARE_API_TOKEN missing in .env'); process.exit(1); }
  if (!CF_ACCOUNT) { console.error('CLOUDFLARE_ACCOUNT_ID missing in .env'); process.exit(1); }

  const sites = JSON.parse(fs.readFileSync(SITES_FILE, 'utf-8'));
  const site = sites.find(s => s.slug === slug);
  if (!site) { console.error(`Site not found in sites.json: ${slug}`); process.exit(1); }

  const domain = site.domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
  console.log(`\n=== Deploying ${slug} (${domain}) ===\n`);

  // 1. Create Cloudflare Pages project
  const projectOk = await createPagesProject(slug, domain);
  if (!projectOk) { console.error('Cloudflare Pages project creation failed. Aborting.'); process.exit(1); }

  // 2. Trigger first deployment
  console.log(`  [CF] Triggering first build...`);
  const { data: buildData } = await cfApi('POST', `/accounts/${CF_ACCOUNT}/pages/projects/${slug}/deployments`, {});
  if (buildData.result?.id) {
    console.log(`  [CF] Build triggered: ${buildData.result.id}`);
  } else {
    console.log(`  [CF] Build trigger note: ${JSON.stringify(buildData.errors || buildData.messages || '').slice(0, 150)}`);
  }

  // 3. Add custom domain (after build is queued so the project is ready)
  await sleep(5000);
  await addCustomDomain(slug, domain);
  await addCustomDomain(slug, `www.${domain}`);

  // 4. Setup Google Search Console (verify domain + add site + sitemap)
  console.log('');
  const gscOk = await setupGsc(domain);
  if (!gscOk) {
    console.log('\n  GSC setup incomplete. You can re-run: node deploy-site.js ' + slug);
  }

  console.log(`\n=== Deploy complete for ${slug} ===`);
  console.log(`Site will be live at https://${domain} after first Cloudflare build (~2 min)\n`);
}

if (require.main === module) main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
