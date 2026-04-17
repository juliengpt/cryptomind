# Multi-Site SEO Auto-Publisher — Documentation Technique

## Vue d'ensemble

Systeme 100% automatise et gratuit qui :
1. Genere des landing pages par niche avec contenu + design unique
2. Publie automatiquement des articles SEO (1/heure/site) bases sur l'actualite en temps reel
3. Telecharge des images reelles (Pexels)
4. Soumet chaque URL + sitemap a Google pour indexation rapide
5. Heberge gratuitement sur Cloudflare Pages
6. Tourne via Windows Task Scheduler (ou GitHub Actions)

**Cout mensuel : 0 EUR** (hors noms de domaine ~10 EUR/an chacun)

---

## Architecture

```
monrepo/                             <- Monorepo GitHub (1 seul repo pour tous les sites)
|
+-- sites/                           <- 1 sous-dossier par site = 1 projet Cloudflare Pages
|   +-- fitness-coach/               <- Site 1 (fitcoachai.com)
|   |   +-- index.html               <- Landing page
|   |   +-- styles.css               <- CSS du site
|   |   +-- script.js                <- JS (formulaire, animations)
|   |   +-- favicon.svg              <- Favicon unique (forme + couleurs par niche)
|   |   +-- terms.html               <- CGU
|   |   +-- privacy.html             <- Politique de confidentialite
|   |   +-- robots.txt               <- SEO robots
|   |   +-- sitemap.xml              <- Auto-genere, soumis a GSC
|   |   +-- blog/
|   |       +-- index.html            <- Liste des articles (auto-rebuilt)
|   |       +-- articles/             <- 1 fichier HTML par article
|   |       |   +-- article-slug.html
|   |       |   +-- ...
|   |       +-- images/               <- 4 images Pexels par article (hero + 3 inline)
|   |           +-- article-slug.png
|   |           +-- article-slug-1.png
|   |           +-- article-slug-2.png
|   |           +-- article-slug-3.png
|   |
|   +-- pet-nutrition/               <- Site 2 (petnutriai.com) - meme structure
|   +-- solar-invest/                <- Site 3 (solarinvestai.com) - meme structure
|
+-- seo-engine/                      <- Moteur partage entre tous les sites
|   +-- sites.json                   <- Configuration de chaque site (domaine, niche, frequence...)
|   +-- config.js                    <- Config globale par defaut (fallbacks)
|   +-- .env                         <- Cles API (GEMINI_API_KEY, PEXELS_API_KEY)
|   |
|   +-- cron-runner.js               <- ORCHESTRATEUR PRINCIPAL - tourne chaque heure
|   +-- publish-for-site.js          <- Pipeline complet pour 1 site (news->LLM->images->HTML->GSC)
|   +-- llm-gemini.js                <- Appel Gemini API (gratuit) + fallback Mistral/Groq
|   +-- news-fetcher.js              <- Fetch RSS feeds + tracking "seen" per-site
|   +-- html-builder.js              <- Genere le HTML des articles + blog index + sitemap
|   +-- gsc-submit.js                <- Soumission Google Indexing API + Sitemap API
|   |
|   +-- landing-generator.js         <- Genere landing page par niche via Gemini (contenu + couleurs)
|   +-- scaffold-site.js             <- Bootstrap un nouveau site (cree le dossier + config)
|   |
|   +-- templates/                   <- Templates HTML/CSS/JS reutilisables
|   |   +-- landing-v2.html          <- Template landing avec {{placeholders}}
|   |   +-- styles-template.css
|   |   +-- script-template.js
|   |   +-- terms-template.html
|   |   +-- privacy-template.html
|   |   +-- favicon-template.svg
|   |
|   +-- data/
|   |   +-- registries/              <- 1 JSON par site (liste des articles publies)
|   |   +-- site-content/            <- Contenu landing genere par Gemini (sauve pour re-render)
|   |   +-- seen/                    <- Tracking RSS per-site (evite doublons)
|   |   +-- cron-state.json          <- Accumulateur par site (gere la frequence)
|   |   +-- batch/                   <- Articles JSON bruts (pour regeneration future)
|   |
|   +-- gsc-credentials.json         <- Service account Google (JAMAIS commite)
|   +-- run-hourly.bat               <- Wrapper batch pour Task Scheduler
|   +-- setup-schedule.ps1           <- Installe la tache Windows planifiee
|   +-- package.json                 <- Dependances: dotenv, googleapis, rss-parser
|
+-- .github/workflows/
|   +-- hourly-publish.yml           <- GitHub Actions cron (backup si Task Scheduler indisponible)
|
+-- .gitignore                       <- Exclut .env, credentials, logs, seen files
```

---

## Stack technique (tout gratuit)

| Composant | Technologie | Cout |
|---|---|---|
| **LLM (articles + landing)** | Gemini 2.5 Flash API (1500 req/jour) | Gratuit |
| **LLM fallback** | Mistral Large / Groq Llama 3.3 70B | Gratuit |
| **Images** | Pexels API (200 req/heure) | Gratuit |
| **Hosting** | Cloudflare Pages (1 projet par site) | Gratuit |
| **DNS/CDN** | Cloudflare (Free plan) | Gratuit |
| **Indexation** | Google Indexing API + Webmasters API | Gratuit |
| **Cron** | Windows Task Scheduler (ou GitHub Actions) | Gratuit |
| **Repo** | GitHub (public) | Gratuit |
| **Lead capture** | Google Sheets (Apps Script webhook) | Gratuit |
| **Domaines** | ~10 EUR/an chacun | Seul cout |

---

## Flux de donnees - Publication d'un article

```
Chaque heure, Windows Task Scheduler lance run-hourly.bat :

+-------------------------------------------------------------+
|  1. git pull (recupere les derniers changements)             |
|  2. node cron-runner.js                                      |
|     |                                                        |
|     +- Lit sites.json -> pour chaque site actif :            |
|     |   |                                                    |
|     |   +- Calcule accumulateur (articlesPerDay / 24)        |
|     |   |   Si < 1 -> skip ce cycle, incrementer             |
|     |   |   Si >= 1 -> publier floor(acc) articles           |
|     |   |                                                    |
|     |   +- Appelle publishOneArticle(site) :                 |
|     |       |                                                |
|     |       +- 1. FETCH RSS (feeds configures par site)      |
|     |       |     news-fetcher.js -> filtre les "seen"        |
|     |       |     Resultat: liste de news fraiches            |
|     |       |                                                |
|     |       +- 2. SELECTION NEWS                             |
|     |       |     Prend la 1ere news non deja couverte        |
|     |       |                                                |
|     |       +- 3. GENERATION ARTICLE (Gemini API)            |
|     |       |     llm-gemini.js -> prompt avec:               |
|     |       |       - siteConfig (niche, produit, langue)     |
|     |       |       - newsItem (titre, resume, categorie)     |
|     |       |     Retour: JSON avec slug, title, 7 sections,  |
|     |       |       metaDescription, tags, imageQueries       |
|     |       |     Fallback: Gemini -> Mistral -> Groq         |
|     |       |                                                |
|     |       +- 4. DOWNLOAD 4 IMAGES (Pexels API)             |
|     |       |     Hero + 3 inline, queries specifiques        |
|     |       |     Sauvees dans sites/<slug>/blog/images/      |
|     |       |                                                |
|     |       +- 5. BUILD HTML                                 |
|     |       |     html-builder.js -> buildArticleHTML()        |
|     |       |     Injecte: TOC, breadcrumbs, related articles |
|     |       |       internal links, social share, CTAs,       |
|     |       |       Schema.org, Open Graph, Twitter Card,     |
|     |       |       theme override CSS (couleurs du site)     |
|     |       |                                                |
|     |       +- 6. MAJ REGISTRY                               |
|     |       |     data/registries/<slug>.json += nouvel article|
|     |       |                                                |
|     |       +- 7. REBUILD BLOG INDEX + SITEMAP               |
|     |       |     Blog index: grille de cards avec images     |
|     |       |     Sitemap.xml: toutes les URLs du site        |
|     |       |                                                |
|     |       +- 8. SOUMISSION GSC                             |
|     |       |     Indexing API: URL article + blog index      |
|     |       |     Webmasters API: refresh sitemap.xml         |
|     |       |                                                |
|     |       +- 9. MARK NEWS AS USED                          |
|     |             data/seen/<slug>.json                       |
|     |                                                        |
|     +- Sauvegarde cron-state.json (accumulateurs)            |
|                                                              |
|  3. git add -A                                               |
|  4. git commit -m "Auto-publish DATE"                        |
|  5. git push origin master                                   |
|     -> Cloudflare Pages detecte le push                      |
|     -> Redeploie chaque site dont les fichiers ont change    |
|     -> Site live en 30-60 secondes                           |
+-------------------------------------------------------------+
```

---

## Flux - Creation d'un nouveau site

```
1. SCAFFOLD (local, 1 commande) :
   node seo-engine/scaffold-site.js \
     --slug=pet-nutrition \
     --domain=petnutriai.com \
     --siteName="PetNutri AI" \
     --niche="nutrition animale et soins veterinaires par IA" \
     --productPitch="L'IA qui optimise l'alimentation de votre animal" \
     --minInvest=49 \
     --articlesPerDay=24

   -> Cree sites/pet-nutrition/ avec tous les fichiers (copies depuis templates/)
   -> Fait find/replace: NomParDefaut->PetNutri, domaine-defaut->petnutriai.com
   -> Ajoute l'entree dans sites.json (active: false)
   -> Cree robots.txt + sitemap.xml vides

2. LANDING PAGE NICHE (local, 1 commande) :
   node seo-engine/landing-generator.js pet-nutrition

   -> Appelle Gemini avec le siteConfig
   -> Gemini retourne un JSON avec ~50 champs :
     - theme (couleurs primary/accent/gradient adaptees a la niche)
     - meta (title, description SEO)
     - hero (badge, titre, subtitle, CTAs, stats)
     - features (6 items avec titre + desc)
     - steps (3 etapes how-it-works)
     - testimonials (3 temoignages)
     - pricing (3 plans)
     - FAQ (6 questions/reponses)
     - footer, CTAs banners
   -> Applique le JSON sur le template landing-v2.html (replace {{placeholders}})
   -> Genere aussi un favicon.svg unique (forme par niche + couleurs du theme)
   -> Sauve le JSON dans data/site-content/pet-nutrition.json (pour re-render sans API)

3. SEED ARTICLE (local) :
   node seo-engine/publish-for-site.js pet-nutrition
   -> Publie 1 premier article pour que le blog ne soit pas vide

4. ACTIVER dans sites.json : mettre "active": true

5. git add -A && git commit && git push

6. CLOUDFLARE PAGES (dashboard, 5 min) :
   -> Workers & Pages -> Create application -> Pages -> Connect to Git
   -> Repo: monrepo | Build output directory: sites/pet-nutrition
   -> Custom domain: petnutriai.com + www.petnutriai.com

7. GOOGLE SEARCH CONSOLE (dashboard, 5 min) :
   -> Ajouter propriete Domain : petnutriai.com
   -> Verifier via DNS (Cloudflare auto-ajoute le record TXT)
   -> Users & permissions -> ajouter le service account email en Owner
   -> Sitemaps -> ajouter sitemap.xml

8. C'EST FINI - le cron publie 1 article/heure automatiquement
```

---

## sites.json - Configuration par site

```json
[
  {
    "slug": "fitness-coach",
    "domain": "fitcoachai.com",
    "siteName": "FitCoach AI",
    "niche": "coaching fitness et nutrition personnalisee par IA",
    "lang": "fr",
    "articlesPerDay": 24,
    "productPitch": "L'agent IA qui cree vos programmes fitness sur mesure",
    "minInvest": 29,
    "currency": "EUR",
    "ctaPrimary": "Demarrer mon coaching",
    "leadWebhook": "https://script.google.com/macros/s/.../exec",
    "telegramChatId": "",
    "telegramBotToken": "",
    "themes": ["fitness", "nutrition", "sante", "bien-etre"],
    "rssFeeds": [
      { "url": "https://www.healthline.com/rss/fitness", "category": "fitness", "lang": "en" },
      { "url": "https://feeds.bbci.co.uk/news/health/rss.xml", "category": "sante", "lang": "en" },
      { "url": "https://techcrunch.com/category/health/feed/", "category": "tech-sante", "lang": "en" }
    ],
    "active": true
  },
  {
    "slug": "pet-nutrition",
    "domain": "petnutriai.com",
    "siteName": "PetNutri AI",
    "niche": "nutrition animale et soins veterinaires par IA",
    "lang": "fr",
    "articlesPerDay": 12,
    "productPitch": "L'IA qui optimise l'alimentation de votre animal",
    "minInvest": 19,
    "currency": "EUR",
    "ctaPrimary": "Analyser l'alimentation",
    "rssFeeds": [
      { "url": "https://www.petfoodindustry.com/rss", "category": "nutrition", "lang": "en" },
      { "url": "https://www.veterinarypracticenews.com/feed/", "category": "veto", "lang": "en" }
    ],
    "active": true
  },
  {
    "slug": "solar-invest",
    "domain": "solarinvestai.com",
    "siteName": "SolarInvest AI",
    "niche": "investissement solaire et energies renouvelables",
    "lang": "fr",
    "articlesPerDay": 24,
    "productPitch": "L'IA qui identifie les meilleures opportunites d'investissement solaire",
    "minInvest": 500,
    "currency": "EUR",
    "ctaPrimary": "Analyser les opportunites",
    "rssFeeds": [
      { "url": "https://www.solarpowerworldonline.com/feed/", "category": "solaire", "lang": "en" },
      { "url": "https://feeds.bloomberg.com/energy/news.rss", "category": "energie", "lang": "en" },
      { "url": "https://cleantechnica.com/feed/", "category": "cleantech", "lang": "en" }
    ],
    "active": true
  }
]
```

---

## Modules detailles

### `llm-gemini.js` - Generation d'articles via IA gratuite

**Prompt** : recoit `siteConfig` (niche, produit, langue) + `newsItem` (titre, resume de l'actualite). Demande a Gemini de produire un JSON structure :

```json
{
  "slug": "slug-article-2026",
  "title": "Titre SEO 50-70 chars",
  "metaDescription": "Description SEO 150 chars max",
  "category": "nom de categorie",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "heroAlt": "Alt text de l'image hero",
  "imageQueries": {
    "hero": "pexels search query en anglais",
    "inline1": "query image 1",
    "inline2": "query image 2",
    "inline3": "query image 3"
  },
  "sections": [
    {"title": "Titre H2", "content": "<p>HTML 350-450 mots avec <strong>, <em>, <ul><li>...</p>"},
    {"title": "Titre H2 section 2", "content": "<p>...</p>"},
    {"title": "Titre H2 section 3", "content": "<p>...</p>"},
    {"title": "Titre H2 section 4", "content": "<p>...</p>"},
    {"title": "Titre H2 section 5", "content": "<p>...</p>"},
    {"title": "Titre H2 section 6", "content": "<p>...</p>"},
    {"title": "Conclusion", "content": "<p>...</p>"}
  ]
}
```

**Fallback chain** : si Gemini retourne 429 (quota) ou 503 (overload), essaye dans l'ordre :
1. `gemini-2.5-flash` (principal)
2. `gemini-2.0-flash`
3. `gemini-2.5-flash-lite`
4. `gemini-2.0-flash-lite`
5. Mistral `mistral-large-latest` (si MISTRAL_API_KEY configure)
6. Groq `llama-3.3-70b-versatile` (si GROQ_API_KEY configure)

Chaque provider a 2 tentatives avec backoff exponentiel.

**Appel HTTP** : pur `https` natif Node.js (pas de SDK, aucune dependance externe). Body JSON + `responseMimeType: 'application/json'` pour forcer Gemini a retourner du JSON valide.

### `news-fetcher.js` - Sources d'actualite

- Utilise `rss-parser` pour fetch les RSS feeds configures par site dans `sites.json`
- Tracking **per-site** : chaque site a son propre fichier `data/seen/<slug>.json`
- Un article RSS n'est marque "used" qu'APRES qu'un article blog a ete publie avec succes (pas des le fetch - evite de "perdre" des news si le LLM echoue)
- Nettoyage automatique des entries > 30 jours

### `html-builder.js` - Template HTML des articles

Genere un HTML complet et autonome (tout le CSS est inline) avec :

**SEO technique :**
- `<title>` avec mot-cle + nom du site
- `<meta description>` unique (150 chars, generee par Gemini)
- `<link rel="canonical">`
- Open Graph complet (og:title, og:description, og:image, og:url, og:site_name)
- Twitter Card (summary_large_image)
- Schema.org Article (JSON-LD) avec headline, author, publisher, datePublished
- Schema.org BreadcrumbList (JSON-LD) - Accueil > Blog > Categorie > Article
- Tags `<meta property="article:tag">` pour chaque mot-cle
- `<meta property="article:published_time">`
- `lang="fr"` sur `<html>`
- `<link rel="icon">` favicon

**SEO contenu (optimisation impressions) :**
- **Table des matieres (TOC)** avec anchor links vers chaque H2 - Google affiche des "jump to" links dans les SERP
- **Breadcrumbs visibles** (Accueil > Blog > Categorie) - rich snippet breadcrumb dans Google
- **3 articles lies** en bas de page - scores par categorie + tags communs, affiches en cards cliquables
- **2 liens internes inline** dans le corps de l'article - maillage interne = repartition du PageRank
- **Boutons de partage social** (Twitter, LinkedIn, Facebook, WhatsApp) - signaux sociaux + potentiel backlinks

**Conversion (9 touchpoints) :**
- 3 CTAs inline (apres les H2 n3, 5, 7) avec copy adapte a la niche
- 1 banniere CTA entre les sections
- Popup scroll modal (a 55% du scroll)
- Popup exit-intent (quand la souris quitte la page)
- Barre sticky en bas avec CTA
- Content gate (floute les 2 dernieres sections, demande inscription)
- Social proof toasts toutes les 45 secondes (ex: "Thomas D. vient de s'inscrire")
- Progress bar de lecture en haut de page

**Theme dynamique** : si un `siteConfig.theme` est fourni (couleurs par niche), un `<style>` inline override toutes les variables CSS (--primary, --accent, --gradient) pour matcher la niche. Les regles utilisent des selecteurs haute specificite (`a.cta-btn`) pour que le texte des boutons soit toujours lisible (noir sur gradient clair).

### `gsc-submit.js` - Indexation Google

Deux APIs utilisees :
1. **Indexing API** (`google.indexing.v3`) : soumet chaque URL individuellement avec `URL_UPDATED` -> Google priorise le crawl
2. **Webmasters API** (`google.webmasters.v3`) : refresh le sitemap.xml -> Google re-scanne toutes les URLs

Authentification via service account JSON (`gsc-credentials.json`). Le service account doit etre "Owner" dans chaque propriete GSC. Format de propriete attendu : `sc-domain:domaine.com` (Domain property, pas URL-prefix).

### `landing-generator.js` - Landing page par niche

1. Appelle Gemini avec un prompt contenant le `CONTENT_SCHEMA` (~50 champs) + le siteConfig (niche, produit, prix)
2. Gemini retourne un JSON complet avec :
   - `theme` : palette couleurs (primary, accent, gradientStart, gradientEnd, glowRgb)
   - `meta` : title + description SEO
   - `hero` : badge, titre (2 lignes), subtitle, CTAs, trust text, labels stats
   - `features` : 6 features (titre + description)
   - `steps` : 3 etapes how-it-works
   - `performance` : titre + description
   - `testimonials` : 3 temoignages (texte, auteur, role)
   - `pricing` : 3 plans (nom, description)
   - `faq` : 6 Q&A
   - `footer` : description + avertissement legal adapte a la niche
3. Sauvegarde le JSON dans `data/site-content/<slug>.json` (pour re-render sans re-appeler l'API)
4. Charge `templates/landing-v2.html` (HTML avec `{{key.subkey}}` placeholders)
5. Replace tous les placeholders par les valeurs Gemini
6. Injecte un `<style>` avec les couleurs du theme (override CSS variables)
7. Ajoute un Schema.org FAQPage JSON-LD (rich snippets FAQ dans Google)
8. Genere un favicon SVG unique - forme choisie selon des mots-cles dans la niche :
   - "finance/epargne" -> piece de monnaie avec symbole devise
   - "trading/forex/bourse" -> graphique avec fleche montante
   - "securite/assurance" -> bouclier
   - "IA/tech/intelligence" -> eclair
   - "sante/fitness" -> coeur ou bouclier
   - defaut -> losange (diamant)

### `scaffold-site.js` - Bootstrap d'un nouveau site

Arguments CLI :
```
--slug            Nom du dossier (ex: pet-nutrition)
--domain          Domaine sans protocole (ex: petnutriai.com)
--siteName        Nom affiche (ex: "PetNutri AI")
--niche           Description niche pour Gemini
--productPitch    One-liner produit
--minInvest       Prix minimum affiche
--articlesPerDay  Frequence (24 = 1/heure)
--currency        EUR / $ / GBP
--leadWebhook     URL Google Sheets (optionnel)
```

Actions :
1. Copie `templates/*` vers `sites/<slug>/`
2. Find/replace global : nom par defaut -> nouveau nom, domaine par defaut -> nouveau domaine
3. Cree les dossiers `blog/articles/` et `blog/images/`
4. Genere `robots.txt` et `sitemap.xml` vides
5. Ajoute l'entree dans `sites.json` avec `active: false`
6. Affiche les instructions de setup (Cloudflare Pages, GSC)

### `cron-runner.js` - Orchestrateur horaire

- Lit `sites.json` -> filtre les sites `active: true`
- Pour chaque site, utilise un **accumulateur** persiste dans `data/cron-state.json` :
  - A chaque run horaire : `accumulator += articlesPerDay / 24`
  - Si `accumulator >= 1` : publie `floor(accumulator)` articles, garde le reste fractionnaire
  - Si `accumulator < 1` : skip ce cycle, attend le prochain
  - Exemple : `articlesPerDay: 4` -> accumule 0.167/h -> publie apres 6h quand acc atteint 1.0
  - Exemple : `articlesPerDay: 48` -> accumule 2.0/h -> publie 2 articles par cycle
- Si une publication echoue (Gemini down, etc.), le credit n'est pas consomme -> retry automatique au prochain cycle
- Logs dans `data/cron-runner.log`
- Throttle 5 secondes entre publications pour respecter les rate limits API

---

## Lead Capture - Google Sheets

Le formulaire d'inscription sur chaque landing envoie les donnees en GET via un pixel invisible (contourne CORS) vers un Google Apps Script :

```javascript
// Cote client (script.js du site)
const leadData = {
  firstName: data.firstName,
  lastName: data.lastName,
  email: data.email,
  phone: data.phone,
  experience: data.experience,
  date: new Date().toLocaleString('fr-FR'),
  source: window.location.hostname
};
const img = new Image();
img.src = GOOGLE_SHEET_URL + '?' + new URLSearchParams(leadData).toString();
```

```javascript
// Google Apps Script (cote serveur Google)
function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = e.parameter;
  if (data.email) {
    sheet.appendRow([
      data.date, data.firstName, data.lastName,
      data.email, data.phone, data.experience, data.source
    ]);
  }
  return ContentService.createTextOutput(JSON.stringify({status:'ok'}))
    .setMimeType(ContentService.MimeType.JSON);
}
```

Setup par site :
1. Creer un Google Sheet avec en-tetes : Date | Prenom | Nom | Email | Telephone | Experience | Source
2. Extensions > Apps Script -> coller le code ci-dessus
3. Deployer > Application Web > Acces "Tout le monde"
4. Copier l'URL dans `leadWebhook` de sites.json

---

## Scheduling - Windows Task Scheduler

`setup-schedule.ps1` (auto-elevation UAC integree) cree une tache Windows qui :
- Execute `run-hourly.bat` chaque heure
- **StartWhenAvailable = true** -> si le PC etait eteint au moment du run, la tache se lance automatiquement des le boot
- **AllowStartIfOnBatteries** -> fonctionne aussi sur batterie
- **ExecutionTimeLimit 25 min** -> kill la tache si elle est bloquee
- **RestartCount 2** -> reessaye 2 fois en cas d'echec

Le `run-hourly.bat` fait sequentiellement :
```batch
git pull --rebase --autostash --quiet
node cron-runner.js
git add -A
git diff --cached --quiet || git commit -m "Auto-publish DATE" && git push origin master
```

**Alternative GitHub Actions** (`.github/workflows/hourly-publish.yml`) : fait exactement la meme chose sur les serveurs GitHub. Gratuit pour les repos publics. Necessite de configurer les secrets (GEMINI_API_KEY, PEXELS_API_KEY, GSC_SERVICE_ACCOUNT_JSON) dans Settings > Secrets > Actions du repo.

---

## Template landing-v2.html - Placeholders

Le template HTML contient ~50 placeholders `{{key.subkey}}` remplaces par `landing-generator.js` :

```
{{meta.title}}                 -> Titre SEO de la page
{{meta.description}}           -> Meta description
{{siteName}}                   -> Nom du produit/site
{{siteBrandHtml}}              -> Nom formate pour le logo (ex: FitCoach<span class="logo-accent">AI</span>)
{{siteUrl}}                    -> https://domaine.com
{{minInvest}}                  -> Prix minimum affiche
{{currency}}                   -> EUR, $, GBP

{{hero.badge}}                 -> Texte du badge anime ("Coaching IA 24/7")
{{hero.titleMain}}             -> Ligne 1 du titre hero
{{hero.titleAccent}}           -> Ligne 2 du titre hero (gradient)
{{hero.subtitle}}              -> Paragraphe sous le titre
{{hero.ctaPrimary}}            -> Bouton principal
{{hero.ctaSecondary}}          -> Bouton secondaire
{{hero.trust}}                 -> "Rejoignez <strong>15 000+</strong> utilisateurs..."
{{hero.stat1Label}}            -> Label sous 97.3%
{{hero.stat2Label}}            -> Label sous 24/7
{{hero.stat3Label}}            -> Label sous +127%

{{features.tag}}               -> Tag section
{{features.title}}             -> Titre H2
{{features.titleAccent}}       -> Mots en gradient
{{features.desc}}              -> Description
{{features.items[0].title}}    -> Feature 1 titre
{{features.items[0].desc}}     -> Feature 1 description
... (6 features)

{{steps.tag/title/desc}}       -> Section how-it-works
{{steps.s1Title/s1Desc}}       -> Etape 1
{{steps.s2Title/s2Desc}}       -> Etape 2
{{steps.s3Title/s3Desc}}       -> Etape 3

{{testimonials.t1Text/t1Author/t1Role}} -> Temoignage 1 (x3)
{{pricing.starterName/proName/eliteName}} -> Plans tarifaires
{{faq.q1/a1 ... q6/a6}}       -> 6 FAQ
{{footer.desc/warning}}        -> Footer

{{theme.primary}}              -> Couleur hex principale (#3b82f6)
{{theme.accent}}               -> Couleur accent (#06b6d4)
{{theme.gradientStart/End}}    -> Gradient CSS
{{theme.glowRgb}}              -> RGB pour les rgba() (59,130,246)
```

---

## Cles API necessaires

| Cle | Ou l'obtenir | Gratuit |
|---|---|---|
| `GEMINI_API_KEY` | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) | Oui, sans CB |
| `PEXELS_API_KEY` | [pexels.com/api](https://www.pexels.com/api/) | Oui, sans CB |
| `gsc-credentials.json` | Google Cloud Console -> IAM -> Service Account -> Keys -> JSON | Oui |
| `MISTRAL_API_KEY` (optionnel) | [console.mistral.ai](https://console.mistral.ai) | Oui (SMS requis) |
| `GROQ_API_KEY` (optionnel) | [console.groq.com](https://console.groq.com) | Oui |

**Setup Google Cloud pour GSC :**
1. Creer un projet sur [console.cloud.google.com](https://console.cloud.google.com)
2. Activer **Web Search Indexing API** + **Google Search Console API**
3. IAM -> Service Accounts -> Creer -> Telecharger cle JSON
4. Dans Google Search Console : ajouter l'email du service account (`xxx@projet.iam.gserviceaccount.com`) comme **Proprietaire** sur chaque domaine

---

## Quotas gratuits a respecter

| Service | Limite gratuite | Usage avec 3 sites x 24 articles/jour |
|---|---|---|
| Gemini 2.5 Flash | 1 500 req/jour | 72 req/jour (5%) |
| Pexels | 200 req/heure | ~12 req/heure (6%) |
| Google Indexing API | 200 URLs/jour/propriete | ~24/jour/site (12%) |
| Cloudflare Pages | 500 builds/mois/projet | ~720/mois -> batcher les commits |
| GitHub (public repo) | Illimite | OK |

**Scaling max** : ~60 sites x 24 articles/jour = 1 440 req Gemini/jour (96% du quota). Au-dela, ajouter Mistral/Groq en fallback ou creer une 2eme cle Gemini sur un autre projet Google.

---

## Commandes de reference

```bash
# ====== NOUVEAU SITE ======
# 1. Scaffold
node seo-engine/scaffold-site.js \
  --slug=pet-nutrition \
  --domain=petnutriai.com \
  --siteName="PetNutri AI" \
  --niche="nutrition animale par IA" \
  --productPitch="L'IA qui optimise l'alimentation de votre animal" \
  --minInvest=19 \
  --articlesPerDay=24

# 2. Generer la landing (contenu + couleurs + favicon)
node seo-engine/landing-generator.js pet-nutrition

# 3. Re-render landing depuis JSON sauve (sans appeler Gemini)
node -e "
  const {applyContent}=require('./seo-engine/landing-generator');
  const {loadSites}=require('./seo-engine/publish-for-site');
  const fs=require('fs'), path=require('path');
  const site=loadSites().find(s=>s.slug==='pet-nutrition');
  const content=JSON.parse(fs.readFileSync('seo-engine/data/site-content/pet-nutrition.json'));
  const tpl=fs.readFileSync('seo-engine/templates/landing-v2.html','utf-8');
  fs.writeFileSync('sites/pet-nutrition/index.html', applyContent(tpl, content, site));
"

# 4. Seed 1er article
node seo-engine/publish-for-site.js pet-nutrition

# 5. Push
git add -A && git commit -m "Launch: pet-nutrition" && git push

# ====== OPERATIONS COURANTES ======
# Publier 1 article pour un site specifique
node seo-engine/publish-for-site.js pet-nutrition

# Publier 1 article pour tous les sites actifs
node seo-engine/publish-for-site.js --all

# Lancer le cycle horaire manuellement
node seo-engine/cron-runner.js

# Soumission manuelle GSC (URLs + sitemap)
node -e "
  const {submitNewArticles,submitSitemap}=require('./seo-engine/gsc-submit');
  submitNewArticles(['slug-article'], 'https://petnutriai.com');
  submitSitemap('petnutriai.com');
"

# ====== SCHEDULING ======
# Installer la tache Windows planifiee (1 execution = setup definitif)
powershell -ExecutionPolicy Bypass -File seo-engine/setup-schedule.ps1

# Voir les logs du cron (PowerShell)
Get-Content seo-engine/data/scheduler.log -Tail 50 -Wait

# Voir les logs du cron (Bash)
tail -f seo-engine/data/scheduler.log

# Verifier l'etat de la tache
Get-ScheduledTaskInfo -TaskName MonProjet-HourlyPublish

# ====== DIAGNOSTIC ======
# Voir l'accumulateur de chaque site
cat seo-engine/data/cron-state.json

# Voir combien d'articles par site
node -e "
  const fs=require('fs');
  fs.readdirSync('seo-engine/data/registries').forEach(f => {
    const reg=JSON.parse(fs.readFileSync('seo-engine/data/registries/'+f));
    console.log(f.replace('.json','') + ': ' + reg.length + ' articles');
  });
"

# Lister les sites que GSC voit
node -e "
  const {google}=require('googleapis');
  const fs=require('fs');
  (async()=>{
    const creds=JSON.parse(fs.readFileSync('seo-engine/gsc-credentials.json'));
    const auth=new google.auth.GoogleAuth({credentials:creds,scopes:['https://www.googleapis.com/auth/webmasters']});
    const wm=google.webmasters({version:'v3',auth:await auth.getClient()});
    const {data}=await wm.sites.list({});
    (data.siteEntry||[]).forEach(s=>console.log(s.siteUrl+' ['+s.permissionLevel+']'));
  })();
"
```

---

## Dependances Node.js (package.json)

```json
{
  "name": "seo-engine",
  "version": "1.0.0",
  "scripts": {
    "publish": "node publish-for-site.js",
    "publish:all": "node publish-for-site.js --all",
    "cron": "node cron-runner.js",
    "scaffold": "node scaffold-site.js"
  },
  "dependencies": {
    "dotenv": "^17.x",
    "googleapis": "^171.x",
    "rss-parser": "^3.x"
  }
}
```

Seulement **3 dependances**. Tout le reste (Gemini API, Pexels API, Cloudflare deploy) est fait en HTTP natif Node.js.

---

## .gitignore

```
node_modules/
seo-engine/.env
seo-engine/node_modules/
seo-engine/gsc-credentials.json
seo-engine/data/seen-articles.json
seo-engine/data/seen/
seo-engine/data/cron-state.json
seo-engine/data/cron-runner.log
seo-engine/data/scheduler.log
seo-engine/data/auto-hourly.log
seo-engine/run-hourly.bat
```

---

## .env (fichier local, jamais commite)

```
GEMINI_API_KEY=AIza...
MISTRAL_API_KEY=
GROQ_API_KEY=
PEXELS_API_KEY=xxx...
SITE_URL=https://fitcoachai.com
SITE_NAME=FitCoach AI
```

---

## Pour reproduire ce systeme sur un autre projet

1. **Creer un repo GitHub** (public pour GitHub Actions gratuit)
2. **Copier la structure** : `seo-engine/` + `sites/` + `.github/workflows/`
3. **Adapter le template** : modifier `landing-v2.html` et `styles-template.css` selon le design voulu (couleurs par defaut, layout, sections)
4. **Adapter les prompts Gemini** :
   - `buildPrompt()` dans `llm-gemini.js` pour le style des articles
   - `CONTENT_SCHEMA` dans `landing-generator.js` pour la structure des landings
5. **Configurer les APIs** : obtenir cle Gemini + Pexels + service account GSC
6. **Scaffold le 1er site** avec `scaffold-site.js`
7. **Generer la landing** avec `landing-generator.js`
8. **Configurer Cloudflare Pages** (build root = `sites/<slug>`) + custom domain
9. **Configurer Google Search Console** (ajouter domaine + service account Owner + sitemap)
10. **Installer le cron** : `setup-schedule.ps1` (Windows) ou activer le workflow GitHub Actions
11. **Laisser tourner** - les articles se publient automatiquement

L'IA a qui tu envoies ce document peut reproduire le systeme complet en une session si elle a acces au filesystem + terminal + les cles API.
