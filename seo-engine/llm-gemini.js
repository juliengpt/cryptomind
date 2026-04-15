// Free LLM article generator — Gemini primary, Mistral/Groq fallback chain
// Quotas (April 2026):
//   Gemini 2.0 Flash: 15 RPM, 1500 RPD free
//   Mistral large-latest: 1 RPS, 1B tokens/month free (phone-verified)
//   Groq llama-3.3-70b-versatile: 30 RPM, 1000 RPD free
require('dotenv').config();
const https = require('https');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

function postJson({ hostname, path, headers, body }) {
  return new Promise((resolve, reject) => {
    const buf = Buffer.from(body);
    const req = https.request({
      hostname, path, method: 'POST',
      headers: { ...headers, 'Content-Length': buf.length },
    }, (res) => {
      const chunks = [];
      res.on('data', (d) => chunks.push(d));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf-8');
        resolve({ status: res.statusCode, text });
      });
    });
    req.on('error', reject);
    req.write(buf);
    req.end();
  });
}

function extractJson(text) {
  // Strip markdown fences
  text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON object found in LLM output');
  return JSON.parse(match[0]);
}

function buildPrompt(siteConfig, newsItem) {
  const cat = newsItem.category === 'crypto' ? 'crypto monnaies'
    : newsItem.category === 'ia' ? 'intelligence artificielle'
    : 'investissement';

  return `Tu es un journaliste tech/finance pour le blog français de "${siteConfig.siteName}" (niche : ${siteConfig.niche}).
Le produit promu sur ce site est : ${siteConfig.productPitch}.

Génère un article SEO de 2500-3000 mots en français sur cette actualité réelle :
TITRE SOURCE : ${newsItem.title}
RÉSUMÉ : ${(newsItem.summary || newsItem.title).slice(0, 500)}
CATÉGORIE : ${cat}
SOURCE : ${newsItem.source || 'actualité du jour'}

Réponds UNIQUEMENT avec ce JSON valide (aucun texte avant/après, pas de markdown) :
{
  "slug": "slug-court-en-francais-sans-accents-2026",
  "title": "Titre accrocheur 50-70 caracteres",
  "metaDescription": "Description SEO 150 caracteres max",
  "category": "${cat}",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "heroAlt": "Description courte image hero pour alt text",
  "imageQueries": {
    "hero": "english pexels search query 4-6 words",
    "inline1": "english pexels query 3-5 words",
    "inline2": "english pexels query 3-5 words",
    "inline3": "english pexels query 3-5 words"
  },
  "sections": [
    {"title": "Titre H2 section 1", "content": "<p>HTML 350-450 mots avec <strong>, <em>, <ul><li>...</p>"},
    {"title": "Titre H2 section 2", "content": "<p>...</p>"},
    {"title": "Titre H2 section 3", "content": "<p>...</p>"},
    {"title": "Titre H2 section 4", "content": "<p>...</p>"},
    {"title": "Titre H2 section 5", "content": "<p>...</p>"},
    {"title": "Titre H2 section 6", "content": "<p>...</p>"},
    {"title": "Conclusion", "content": "<p>...</p>"}
  ]
}

REGLES STRICTES :
- Francais journalistique haute qualite, ton expert
- Faits reels, chiffres precis, analyse approfondie
- Integre subtilement la pertinence pour ${siteConfig.niche} sans publicite directe
- 7 sections totales, 350-450 mots par section minimum
- HTML uniquement dans content : <p>, <strong>, <em>, <ul><li>, <blockquote>
- imageQueries en ANGLAIS, termes visuels concrets et tres specifiques
- slug court (max 60 chars), kebab-case, sans accents, finissant par -2026
- AUCUN markdown, UNIQUEMENT JSON valide`;
}

// === GEMINI ===
async function callGemini(siteConfig, newsItem) {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY missing');
  const body = JSON.stringify({
    contents: [{ parts: [{ text: buildPrompt(siteConfig, newsItem) }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
    },
  });
  const { status, text } = await postJson({
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  if (status !== 200) throw new Error(`Gemini ${status}: ${text.slice(0, 200)}`);
  const data = JSON.parse(text);
  const out = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!out) throw new Error('Gemini empty response');
  return extractJson(out);
}

// === MISTRAL ===
async function callMistral(siteConfig, newsItem) {
  if (!MISTRAL_API_KEY) throw new Error('MISTRAL_API_KEY missing');
  const body = JSON.stringify({
    model: 'mistral-large-latest',
    messages: [{ role: 'user', content: buildPrompt(siteConfig, newsItem) }],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });
  const { status, text } = await postJson({
    hostname: 'api.mistral.ai',
    path: '/v1/chat/completions',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${MISTRAL_API_KEY}` },
    body,
  });
  if (status !== 200) throw new Error(`Mistral ${status}: ${text.slice(0, 200)}`);
  const data = JSON.parse(text);
  const out = data.choices?.[0]?.message?.content;
  if (!out) throw new Error('Mistral empty response');
  return extractJson(out);
}

// === GROQ ===
async function callGroq(siteConfig, newsItem) {
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY missing');
  const body = JSON.stringify({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: buildPrompt(siteConfig, newsItem) }],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });
  const { status, text } = await postJson({
    hostname: 'api.groq.com',
    path: '/openai/v1/chat/completions',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
    body,
  });
  if (status !== 200) throw new Error(`Groq ${status}: ${text.slice(0, 200)}`);
  const data = JSON.parse(text);
  const out = data.choices?.[0]?.message?.content;
  if (!out) throw new Error('Groq empty response');
  return extractJson(out);
}

// === CHAIN WITH FALLBACK ===
async function generateArticle(siteConfig, newsItem) {
  const providers = [
    { name: 'Gemini', fn: callGemini, available: !!GEMINI_API_KEY },
    { name: 'Mistral', fn: callMistral, available: !!MISTRAL_API_KEY },
    { name: 'Groq', fn: callGroq, available: !!GROQ_API_KEY },
  ].filter(p => p.available);

  if (providers.length === 0) {
    throw new Error('No LLM API key set. Set at least GEMINI_API_KEY in .env');
  }

  const errors = [];
  for (const provider of providers) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`  [LLM] Trying ${provider.name} (attempt ${attempt}/2)...`);
        const article = await provider.fn(siteConfig, newsItem);
        if (!article.slug || !article.title || !article.sections) {
          throw new Error('Invalid article structure (missing slug/title/sections)');
        }
        console.log(`  [LLM] ${provider.name} OK: ${article.slug}`);
        return { ...article, _generatedBy: provider.name };
      } catch (err) {
        const msg = `${provider.name} attempt ${attempt}: ${err.message}`;
        console.log(`  [LLM] ${msg}`);
        errors.push(msg);
        // Wait before retry (exponential backoff)
        await new Promise(r => setTimeout(r, attempt * 2000));
      }
    }
  }
  throw new Error(`All LLM providers failed:\n${errors.join('\n')}`);
}

module.exports = { generateArticle, callGemini, callMistral, callGroq };
