// Generate a niche-specific landing page by rewriting all user-facing texts
// via Gemini, keeping HTML structure and CSS intact.
//
// Usage: node landing-generator.js <slug>
// Reads sites.json, finds site, rewrites sites/<slug>/index.html with niche-appropriate copy.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash-lite'];

const ROOT = path.join(__dirname, '..');
const SITES_FILE = path.join(__dirname, 'sites.json');

// Keys to fill via Gemini — structure the generator targets.
// These keys map 1-to-1 to placeholders {{KEY}} in landing-template.html.
const CONTENT_SCHEMA = `{
  "theme": {
    "primary": "Couleur hex principale cohérente avec la niche (ex: forex=#10b981 vert finance, santé=#3b82f6 bleu, luxe=#f59e0b or). PAS #6366f1 ni #8b5cf6 (déjà utilisés)",
    "accent": "Couleur hex accent complémentaire (ex: #06b6d4, #f43f5e, #eab308)",
    "gradientStart": "Hex pour gradient start — même que primary",
    "gradientEnd": "Hex pour gradient end — proche de accent mais plus clair",
    "glowRgb": "Les 3 valeurs RGB de la primary sans le #, séparées par virgules (ex: '16,185,129' pour #10b981)"
  },
  "meta": {
    "title": "60-70 char SEO title combining site name and main keyword",
    "description": "150-160 char SEO meta description"
  },
  "nav": {
    "features": "Label de la section features (ex: Fonctionnalités)",
    "howItWorks": "Label how-it-works (ex: Comment ça marche)",
    "performance": "Performance",
    "testimonials": "Témoignages",
    "pricing": "Tarifs",
    "cta": "Label du bouton CTA du menu (ex: Commencer maintenant)"
  },
  "hero": {
    "badge": "Petit texte badge pulsant, ex 'Trading Autonome 24/7'",
    "titleMain": "Titre principal ligne 1, 4-6 mots, percutant",
    "titleAccent": "Titre principal ligne 2 (gradient), 3-5 mots, complète le 1",
    "subtitle": "Phrase de 20-30 mots qui explique l'offre",
    "ctaPrimary": "Texte bouton principal (ex: Ouvrir mon compte)",
    "ctaSecondary": "Texte bouton secondaire (ex: Voir la démo)",
    "trust": "Phrase 'Rejoignez <strong>15 000+</strong> xxxx' adaptée à la niche",
    "stat1Label": "Label sous le 1er chiffre (précision, ex: 'Précision des trades')",
    "stat2Label": "Label sous 24/7 (ex: 'Surveillance continue')",
    "stat3Label": "Label sous le % (ex: 'Rendement annuel moyen')"
  },
  "features": {
    "tag": "Tag de section (ex: Fonctionnalités)",
    "title": "Titre H2 section (8-12 mots)",
    "titleAccent": "Mots en gradient dans le titre (2-4 mots)",
    "desc": "Description sous le titre (25-35 mots)",
    "items": [
      {"title": "Feature 1 titre court (3-5 mots)", "desc": "Description 15-25 mots"},
      {"title": "Feature 2 titre", "desc": "Description"},
      {"title": "Feature 3 titre", "desc": "Description"},
      {"title": "Feature 4 titre", "desc": "Description"},
      {"title": "Feature 5 titre", "desc": "Description"},
      {"title": "Feature 6 titre", "desc": "Description"}
    ]
  },
  "steps": {
    "tag": "Tag section (ex: Comment ça marche)",
    "title": "Titre H2 (6-10 mots)",
    "titleAccent": "Mots gradient (2-4 mots)",
    "desc": "Description courte (20-30 mots)",
    "s1Title": "Étape 1 titre",
    "s1Desc": "Étape 1 description 20-30 mots",
    "s2Title": "Étape 2 titre",
    "s2Desc": "Étape 2 description",
    "s3Title": "Étape 3 titre",
    "s3Desc": "Étape 3 description"
  },
  "performance": {
    "tag": "Tag",
    "title": "Titre H2",
    "titleAccent": "Gradient",
    "desc": "Description 20-30 mots"
  },
  "comparison": {
    "tag": "Tag",
    "title": "Titre H2 (ex: IA vs méthodes traditionnelles)",
    "titleAccent": "Gradient",
    "desc": "Description 20-30 mots"
  },
  "testimonials": {
    "tag": "Tag",
    "title": "Titre H2",
    "titleAccent": "Gradient",
    "desc": "Description 15-25 mots",
    "t1Text": "Témoignage 1, 40-60 mots, guillemets français",
    "t1Author": "Prénom N.",
    "t1Role": "Rôle utilisateur adapté à la niche",
    "t2Text": "Témoignage 2",
    "t2Author": "Prénom N.",
    "t2Role": "Rôle",
    "t3Text": "Témoignage 3",
    "t3Author": "Prénom N.",
    "t3Role": "Rôle"
  },
  "pricing": {
    "tag": "Tag",
    "title": "Titre H2",
    "titleAccent": "Gradient",
    "desc": "Description 15-25 mots",
    "starterName": "Nom plan débutant (ex: Starter)",
    "starterDesc": "Courte description",
    "proName": "Nom plan populaire (ex: Pro)",
    "proDesc": "Courte description",
    "eliteName": "Nom plan premium (ex: Elite)",
    "eliteDesc": "Courte description"
  },
  "signup": {
    "title": "Prêt à laisser l'IA faire [action niche] pour Vous ?",
    "titleAccent": "Mots en gradient",
    "desc": "Description 20-30 mots",
    "formTitle": "Ouvrez Votre Compte",
    "formSub": "Courte phrase sous le titre"
  },
  "faq": {
    "tag": "FAQ",
    "title": "Questions Fréquentes",
    "q1": "Question 1 adaptée à la niche",
    "a1": "Réponse 40-80 mots",
    "q2": "Question 2",
    "a2": "Réponse",
    "q3": "Question 3",
    "a3": "Réponse",
    "q4": "Question 4",
    "a4": "Réponse",
    "q5": "Question 5",
    "a5": "Réponse",
    "q6": "Question 6",
    "a6": "Réponse"
  },
  "cta1Title": "Bannière CTA mid-page - titre accrocheur 6-10 mots",
  "cta1Subtitle": "Sous-titre 15-20 mots",
  "cta2Title": "Bannière CTA finale - titre 6-10 mots",
  "cta2Subtitle": "Sous-titre 15-20 mots",
  "footer": {
    "desc": "Description footer 20-30 mots",
    "warning": "Avertissement légal adapté à la niche (trading, finance, etc.) 30-50 mots"
  }
}`;

function postJson({ hostname, path: p, headers, body }) {
  return new Promise((resolve, reject) => {
    const buf = Buffer.from(body);
    const req = https.request({ hostname, path: p, method: 'POST', headers: { ...headers, 'Content-Length': buf.length } }, (res) => {
      const chunks = [];
      res.on('data', d => chunks.push(d));
      res.on('end', () => resolve({ status: res.statusCode, text: Buffer.concat(chunks).toString('utf-8') }));
    });
    req.on('error', reject);
    req.write(buf);
    req.end();
  });
}

async function generateContent(site) {
  const prompt = `Tu dois générer un objet JSON de contenu pour une landing page française, niche : "${site.niche}".
Nom du produit : ${site.siteName}
Pitch : ${site.productPitch}
Investissement min : ${site.minInvest} ${site.currency || '€'}
CTA principal : ${site.ctaPrimary || 'Commencer'}

Contexte : le produit est un agent IA autonome spécifique à cette niche. Tous les textes doivent être en FRANCAIS, de qualité haute, SEO-optimisés, orientés conversion, mais cohérents avec la niche (pas de mentions crypto si la niche est forex, etc.).

Réponds UNIQUEMENT avec ce JSON valide (pas de markdown, pas de texte avant/après) :
${CONTENT_SCHEMA}

RÈGLES :
- Tous les textes sont en français
- Pas de guillemets doubles non échappés dans les valeurs
- Pas de markdown
- Chiffres, statistiques, noms adaptés à la niche ${site.niche}
- Ton expert et convaincant, orienté résultats`;

  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.8, maxOutputTokens: 16000, responseMimeType: 'application/json' },
  });

  const errors = [];
  for (const model of GEMINI_MODELS) {
    const { status, text } = await postJson({
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    if (status === 200) {
      const data = JSON.parse(text);
      const out = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!out) { errors.push(`${model}: empty`); continue; }
      try {
        const cleaned = out.replace(/```json/gi, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
      } catch (e) { errors.push(`${model}: parse ${e.message.slice(0, 80)}`); continue; }
    }
    errors.push(`${model}: ${status}`);
    if (status !== 429 && status !== 503 && status !== 500) break;
  }
  throw new Error('All Gemini models failed: ' + errors.join(' | '));
}

// Merge content JSON into the template HTML.
// Template uses {{DOT.PATH}} placeholders.
function applyContent(templateHtml, content, site) {
  const siteUrl = `https://${site.domain}`;
  const brandHtml = (() => {
    const parts = site.siteName.split(' ');
    if (parts.length >= 2) return `${parts.slice(0, -1).join(' ')}<span class="logo-accent">${parts.slice(-1)[0]}</span>`;
    return site.siteName;
  })();

  // Flatten content paths
  const flat = {};
  const walk = (obj, prefix = '') => {
    for (const [k, v] of Object.entries(obj)) {
      const key = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === 'object' && !Array.isArray(v)) walk(v, key);
      else flat[key] = v;
    }
  };
  walk(content);

  // Inject site-wide vars
  flat.siteName = site.siteName;
  flat.siteBrandHtml = brandHtml;
  flat.domain = site.domain;
  flat.siteUrl = siteUrl;
  flat.minInvest = String(site.minInvest || 250);
  flat.currency = site.currency || '€';

  // Replace {{KEY}} placeholders
  let html = templateHtml;
  for (const [k, v] of Object.entries(flat)) {
    const re = new RegExp(`\\{\\{${k.replace(/\./g, '\\.')}\\}\\}`, 'g');
    html = html.replace(re, String(v));
  }

  // Array items (features/faq etc. rendered as JSON arrays in template)
  if (content.features?.items) {
    for (let i = 0; i < content.features.items.length; i++) {
      html = html.replace(new RegExp(`\\{\\{features\\.items\\[${i}\\]\\.title\\}\\}`, 'g'), content.features.items[i].title || '');
      html = html.replace(new RegExp(`\\{\\{features\\.items\\[${i}\\]\\.desc\\}\\}`, 'g'), content.features.items[i].desc || '');
    }
  }

  return html;
}

async function main() {
  const slug = process.argv[2];
  if (!slug) { console.error('Usage: node landing-generator.js <slug>'); process.exit(1); }
  if (!GEMINI_API_KEY) { console.error('GEMINI_API_KEY missing'); process.exit(1); }

  const sites = JSON.parse(fs.readFileSync(SITES_FILE, 'utf-8'));
  const site = sites.find(s => s.slug === slug);
  if (!site) { console.error(`Site not found: ${slug}`); process.exit(1); }

  console.log(`Generating landing content for ${site.slug} (${site.niche})...`);
  const content = await generateContent(site);
  console.log('Content generated (' + Object.keys(content).length + ' top-level keys)');

  // Save content JSON for debugging/later regen
  const contentDir = path.join(__dirname, 'data', 'site-content');
  if (!fs.existsSync(contentDir)) fs.mkdirSync(contentDir, { recursive: true });
  fs.writeFileSync(path.join(contentDir, `${slug}.json`), JSON.stringify(content, null, 2));
  console.log(`Saved: data/site-content/${slug}.json`);

  const templatePath = path.join(__dirname, 'templates', 'landing-v2.html');
  if (!fs.existsSync(templatePath)) {
    console.error(`Template missing: ${templatePath} — create it first (see README)`);
    process.exit(1);
  }
  const template = fs.readFileSync(templatePath, 'utf-8');
  const html = applyContent(template, content, site);

  const outPath = path.join(ROOT, 'sites', slug, 'index.html');
  fs.writeFileSync(outPath, html, 'utf-8');
  console.log(`Wrote: sites/${slug}/index.html`);
}

if (require.main === module) main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
module.exports = { generateContent, applyContent };
