const fs = require('fs');
const path = require('path');
const config = require('./config');

// Google Search Console URL Inspection API
// Requires a Google Cloud service account with Search Console API access
// Setup: https://developers.google.com/webmaster-tools/v1/how-tos/authorizing

let authClient = null;

async function getAuthClient() {
  if (authClient) return authClient;

  const credPath = process.env.GSC_SERVICE_ACCOUNT_JSON || path.join(__dirname, 'gsc-credentials.json');

  if (!fs.existsSync(credPath)) {
    console.log('  [GSC] No credentials found. Skipping GSC submission.');
    console.log('  [GSC] To enable: place gsc-credentials.json in seo-engine/');
    return null;
  }

  try {
    // Dynamic import for optional dependency
    const { google } = require('googleapis');
    const credentials = JSON.parse(fs.readFileSync(credPath, 'utf-8'));

    authClient = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/indexing'],
    });

    return authClient;
  } catch (err) {
    console.log(`  [GSC] Auth error: ${err.message}`);
    return null;
  }
}

async function submitUrl(url) {
  const auth = await getAuthClient();
  if (!auth) return false;

  try {
    const { google } = require('googleapis');
    const indexing = google.indexing({ version: 'v3', auth: await auth.getClient() });

    await indexing.urlNotifications.publish({
      requestBody: {
        url,
        type: 'URL_UPDATED',
      },
    });

    console.log(`  [GSC] Submitted: ${url}`);
    return true;
  } catch (err) {
    console.log(`  [GSC] Submission failed for ${url}: ${err.message}`);
    return false;
  }
}

async function submitNewArticles(slugs, siteUrl) {
  // siteUrl: optional override (e.g. 'https://crypto-mind.net'). Defaults to config.siteUrl
  const baseUrl = (siteUrl || config.siteUrl).replace(/\/$/, '');
  let submitted = 0;

  for (const slug of slugs) {
    const url = `${baseUrl}/blog/articles/${slug}.html`;
    const success = await submitUrl(url);
    if (success) submitted++;
  }

  if (slugs.length > 0) {
    await submitUrl(`${baseUrl}/blog/`);
  }

  return submitted;
}

module.exports = { submitUrl, submitNewArticles };
