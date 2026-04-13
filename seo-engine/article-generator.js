const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const config = require('./config');

const BROWSER_DATA_DIR = path.join(__dirname, '..', '.browser-data');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function pickTheme() {
  return config.themes[Math.floor(Math.random() * config.themes.length)];
}

async function waitForLogin(page) {
  console.log('  Waiting for ChatGPT to be ready...');
  while (true) {
    try {
      const editor = page.locator('#prompt-textarea, [contenteditable="true"][data-placeholder]');
      const isVisible = await editor.first().isVisible({ timeout: 3000 });
      if (isVisible) {
        console.log('  ChatGPT is ready!');
        return;
      }
    } catch {}
    await sleep(3000);
  }
}

async function waitForResponse(page, timeout = 180000) {
  const startTime = Date.now();
  console.log('  Waiting for ChatGPT response...');

  while (Date.now() - startTime < timeout) {
    try {
      // Check if still generating (button changes from stop to send when done)
      const stopBtn = page.locator('[data-testid="stop-button"]');
      const isGenerating = await stopBtn.isVisible({ timeout: 1000 }).catch(() => false);

      if (!isGenerating) {
        // Double-check it's actually done (wait a bit for final render)
        await sleep(3000);
        const stillGenerating = await stopBtn.isVisible({ timeout: 1000 }).catch(() => false);
        if (!stillGenerating) {
          // Get the last assistant message
          const messages = page.locator('[data-message-author-role="assistant"]');
          const count = await messages.count();
          if (count > 0) {
            const lastMsg = messages.nth(count - 1);
            const text = await lastMsg.innerText();
            if (text && text.length > 100) {
              console.log(`  Response received (${text.length} chars)`);
              return text;
            }
          }
        }
      }
    } catch {}
    await sleep(3000);
  }

  console.log('  Timeout waiting for response');
  return null;
}

function buildPrompt(newsItems) {
  const theme = pickTheme();
  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const newsContext = newsItems
    .map(
      (n, i) =>
        `[Source ${i + 1}] ${n.source} — "${n.title}"\nRésumé: ${n.summary.slice(0, 300)}\nCatégorie: ${n.category}`,
    )
    .join('\n\n');

  return {
    theme,
    prompt: `Tu es un rédacteur SEO expert en IA, crypto-monnaies et investissement technologique.
Tu écris pour le blog de "${config.siteName}".

Date du jour : ${today}
Thématique principale : ${theme}

Actualités récentes :

${newsContext}

CONSIGNES :
1. Rédige un article de blog en FRANÇAIS de 1500-2500 mots
2. Basé sur l'actualité ci-dessus avec une ANALYSE ORIGINALE et un ANGLE UNIQUE
3. Structure avec des H2 et H3, paragraphes aérés, listes à puces
4. Ton : expert mais accessible, engageant
5. Inclus des données chiffrées quand disponibles
6. Termine par une conclusion qui ouvre la réflexion
7. NE MENTIONNE JAMAIS de rendements financiers garantis ou promesses de profit
8. Contenu informatif et éducatif, pas promotionnel
9. Intègre naturellement des mots-clés SEO liés à : ${theme}

IMPORTANT — Réponds UNIQUEMENT avec un objet JSON valide, rien d'autre :
{
  "title": "Titre accrocheur optimisé SEO (50-65 caractères)",
  "metaDescription": "Meta description engageante (150-160 caractères)",
  "slug": "url-friendly-slug-en-francais",
  "category": "${theme}",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "readTime": "X min de lecture",
  "content": "Le contenu HTML complet avec balises h2, h3, p, ul, li, strong, em. PAS de h1. PAS de div ni style inline.",
  "excerpt": "Résumé de 2-3 phrases pour la page index",
  "sources": ["url source 1", "url source 2"]
}`,
  };
}

function parseArticleJSON(text) {
  // Try to extract JSON from the response
  let jsonStr = text;

  // Look for JSON block in code fences
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1];
  } else {
    // Try to find JSON object directly
    const jsonMatch = text.match(/\{[\s\S]*"title"[\s\S]*"content"[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }
  }

  try {
    const article = JSON.parse(jsonStr.trim());
    article.generatedAt = new Date().toISOString();
    return article;
  } catch (err) {
    console.error('  Failed to parse JSON:', err.message);
    console.error('  First 200 chars:', jsonStr.substring(0, 200));
    return null;
  }
}

// Shared browser instance
let browserContext = null;
let browserPage = null;

async function initBrowser() {
  if (browserContext) return browserPage;

  console.log('  Launching browser...');
  browserContext = await chromium.launchPersistentContext(BROWSER_DATA_DIR, {
    headless: false,
    viewport: { width: 1400, height: 900 },
  });

  browserPage = browserContext.pages()[0] || (await browserContext.newPage());

  console.log('  Opening ChatGPT...');
  await browserPage.goto('https://chatgpt.com', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await sleep(3000);
  await waitForLogin(browserPage);
  await sleep(2000);

  return browserPage;
}

async function closeBrowser() {
  if (browserContext) {
    await browserContext.close();
    browserContext = null;
    browserPage = null;
  }
}

async function generateArticle(newsItems) {
  const page = await initBrowser();
  const { theme, prompt } = buildPrompt(newsItems);

  console.log(`  Generating article on theme: ${theme}...`);

  // Start a new chat
  try {
    const newChat = page.locator('[data-testid="create-new-chat-button"], a[href="/"]').first();
    await newChat.click({ timeout: 5000 });
    await sleep(3000);
  } catch {
    await page.goto('https://chatgpt.com', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    await sleep(4000);
  }

  try {
    // Type the prompt
    const editor = page.locator('#prompt-textarea');
    await editor.waitFor({ state: 'visible', timeout: 15000 });
    await editor.click();
    await sleep(500);

    // Paste the prompt (faster than typing character by character)
    await page.evaluate((text) => {
      const el = document.querySelector('#prompt-textarea');
      if (el) {
        el.focus();
        document.execCommand('insertText', false, text);
      }
    }, prompt);
    await sleep(1500);

    // Send
    const sendBtn = page.locator('[data-testid="send-button"]').first();
    await sendBtn.click({ timeout: 5000 });
    console.log('  Prompt sent!');

    // Wait for full response
    const responseText = await waitForResponse(page, 180000);
    if (!responseText) return null;

    // Parse the JSON from ChatGPT response
    const article = parseArticleJSON(responseText);
    if (article) {
      article.newsSourcesUsed = newsItems.map((n) => ({
        title: n.title,
        source: n.source,
        link: n.link,
      }));
    }
    return article;
  } catch (err) {
    console.error(`  Error: ${err.message}`);
    return null;
  }
}

module.exports = { generateArticle, initBrowser, closeBrowser };
