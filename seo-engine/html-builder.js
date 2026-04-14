const fs = require('fs');
const path = require('path');
const config = require('./config');

// CTA variants — all focused on the AI trading agent
const CTA_VARIANTS = [
  {
    icon: '◆',
    title: "L'agent IA qui trade pour vous, 24h/24",
    text: "Notre IA analyse, décide et exécute vos trades crypto en temps réel. Sans émotions, sans stress.",
    btn: "Activer l'agent IA →",
  },
  {
    icon: '⚡',
    title: 'Pendant que vous lisez, notre IA trade',
    text: "+127% de rendement moyen en 2025. L'agent IA travaille pendant que vous vivez votre vie.",
    btn: "Lancer l'agent →",
  },
  {
    icon: '◆',
    title: 'Un trader IA autonome à votre service',
    text: "Stratégies algorithmiques avancées exécutées automatiquement. +8 000 utilisateurs nous font confiance.",
    btn: "Essayer l'agent IA →",
  },
  {
    icon: '🚀',
    title: "L'IA qui ne dort jamais — et qui gagne",
    text: "Analyse multi-actifs, gestion du risque, exécution instantanée. Tout est automatisé par l'agent IA.",
    btn: "Tester gratuitement →",
  },
];

// Inject CTAs throughout the article
function injectMidCTA(content, category) {
  let h2Count = 0;
  let ctaIndex = 0;

  return content.replace(/<h2>/g, (match) => {
    h2Count++;

    // After 2nd H2: inline CTA
    if (h2Count === 3) {
      const cta = CTA_VARIANTS[ctaIndex++ % CTA_VARIANTS.length];
      return `<div class="cta-inline">
    <div class="cta-inline-icon">${cta.icon}</div>
    <div>
        <div class="cta-inline-title">${cta.title}</div>
        <div class="cta-inline-text">${cta.text}</div>
    </div>
    <a href="${config.siteUrl}#signup" class="cta-inline-btn">${cta.btn}</a>
</div>\n${match}`;
    }

    // After 4th H2: AI agent CTA band
    if (h2Count === 5) {
      return `<div class="cta-newsletter">
    <div class="cta-newsletter-inner">
        <strong>L'agent IA qui trade pour vous</strong>
        <span>Rejoignez +8 000 investisseurs qui laissent notre IA exécuter leurs trades 24h/24.</span>
        <a href="${config.siteUrl}#signup" class="cta-btn-sm">Activer l'agent</a>
    </div>
</div>\n${match}`;
    }

    // After 6th H2: social proof CTA
    if (h2Count === 7) {
      const cta = CTA_VARIANTS[ctaIndex++ % CTA_VARIANTS.length];
      return `<div class="cta-inline cta-inline-dark">
    <div class="cta-inline-icon">${cta.icon}</div>
    <div>
        <div class="cta-inline-title">${cta.title}</div>
        <div class="cta-inline-text">${cta.text}</div>
    </div>
    <a href="${config.siteUrl}#signup" class="cta-inline-btn">${cta.btn}</a>
</div>\n${match}`;
    }

    return match;
  });
}

function buildArticleHTML(article) {
  const publishDate = new Date(article.generatedAt);
  const dateStr = publishDate.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const isoDate = publishDate.toISOString();
  const heroImage = article.heroImage || null;

  const schemaOrg = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.metaDescription,
    datePublished: isoDate,
    dateModified: isoDate,
    ...(heroImage ? { image: `${config.siteUrl}/blog/images/${article.slug}.png` } : {}),
    author: {
      '@type': 'Organization',
      name: config.siteName,
      url: config.siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: config.siteName,
      url: config.siteUrl,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${config.siteUrl}/blog/articles/${article.slug}.html`,
    },
    articleSection: article.category,
    keywords: article.tags.join(', '),
  };

  const contentWithCTAs = injectMidCTA(article.content, article.category);

  const heroImagePath = `../images/${article.slug}.png`;
  const hasHero = heroImage || fs.existsSync(path.join(config.blogDir, 'images', `${article.slug}.png`));

  return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(article.title)} — ${config.siteName}</title>
    <meta name="description" content="${escapeHtml(article.metaDescription)}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${config.siteUrl}/blog/articles/${article.slug}.html">

    <!-- Open Graph -->
    <meta property="og:type" content="article">
    <meta property="og:title" content="${escapeHtml(article.title)}">
    <meta property="og:description" content="${escapeHtml(article.metaDescription)}">
    <meta property="og:url" content="${config.siteUrl}/blog/articles/${article.slug}.html">
    <meta property="og:site_name" content="${config.siteName}">
    ${hasHero ? `<meta property="og:image" content="${config.siteUrl}/blog/images/${article.slug}.png">` : ''}
    <meta property="article:published_time" content="${isoDate}">
    <meta property="article:section" content="${article.category}">
    ${article.tags.map((t) => `<meta property="article:tag" content="${escapeHtml(t)}">`).join('\n    ')}

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(article.title)}">
    <meta name="twitter:description" content="${escapeHtml(article.metaDescription)}">
    ${hasHero ? `<meta name="twitter:image" content="${config.siteUrl}/blog/images/${article.slug}.png">` : ''}

    <!-- Schema.org -->
    <script type="application/ld+json">${JSON.stringify(schemaOrg)}</script>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

    <style>
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', sans-serif;
            background: #0A0E1A;
            color: #E2E8F0;
            line-height: 1.8;
            font-size: 18px;
        }
        a { color: #00D4FF; text-decoration: none; }
        a:hover { text-decoration: underline; }

        /* Nav */
        .nav {
            position: fixed; top: 0; width: 100%; z-index: 100;
            background: rgba(10,14,26,0.92);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid rgba(255,255,255,0.06);
            padding: 16px 0;
        }
        .nav-inner {
            max-width: 1100px; margin: 0 auto; padding: 0 24px;
            display: flex; justify-content: space-between; align-items: center;
        }
        .nav-logo { font-size: 20px; font-weight: 700; color: #fff; text-decoration: none; }
        .nav-logo span { color: #00D4FF; }
        .nav-links { display: flex; gap: 24px; list-style: none; align-items: center; }
        .nav-links a { color: #94A3B8; font-size: 14px; font-weight: 500; }
        .nav-links a:hover { color: #fff; text-decoration: none; }
        .nav-cta { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff !important; padding: 8px 20px; border-radius: 8px; font-weight: 600; }
        .nav-cta:hover { opacity: 0.9; }
        @media (max-width: 768px) {
            .nav-links { gap: 12px; }
            .nav-links .hide-mobile { display: none; }
            .nav-cta { padding: 6px 14px; font-size: 13px; }
        }

        /* Hero image */
        .article-hero {
            width: 100%;
            max-height: 500px;
            overflow: hidden;
            border-radius: 16px;
            margin-bottom: 40px;
            position: relative;
        }
        .article-hero img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }
        .article-hero::after {
            content: '';
            position: absolute;
            bottom: 0; left: 0; right: 0;
            height: 120px;
            background: linear-gradient(transparent, #0A0E1A);
        }

        /* Article */
        .article-wrapper {
            max-width: 800px;
            margin: 0 auto;
            padding: 120px 24px 80px;
        }
        .article-meta {
            display: flex; flex-wrap: wrap; gap: 16px; align-items: center;
            margin-bottom: 32px; font-size: 14px; color: #64748B;
        }
        .article-category {
            background: rgba(0,212,255,0.1);
            color: #00D4FF;
            padding: 4px 14px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .article-wrapper h1 {
            font-size: 42px;
            font-weight: 800;
            line-height: 1.2;
            color: #FFFFFF;
            margin-bottom: 24px;
            letter-spacing: -0.5px;
        }
        .article-excerpt {
            font-size: 20px;
            color: #94A3B8;
            line-height: 1.6;
            margin-bottom: 40px;
            padding-bottom: 40px;
            border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .article-content h2 {
            font-size: 28px; font-weight: 700; color: #FFFFFF;
            margin: 48px 0 20px; letter-spacing: -0.3px;
        }
        .article-content h3 {
            font-size: 22px; font-weight: 600; color: #E2E8F0;
            margin: 36px 0 16px;
        }
        .article-content p { margin-bottom: 20px; color: #CBD5E1; }
        .article-content ul, .article-content ol {
            margin: 16px 0 24px 24px; color: #CBD5E1;
        }
        .article-content li { margin-bottom: 10px; }
        .article-content strong { color: #FFFFFF; font-weight: 600; }
        .article-content em { color: #00D4FF; font-style: normal; }
        .article-content blockquote {
            border-left: 3px solid #00D4FF;
            padding: 16px 24px;
            margin: 24px 0;
            background: rgba(0,212,255,0.04);
            border-radius: 0 8px 8px 0;
            color: #94A3B8;
            font-style: italic;
        }

        /* Inline article images */
        .article-content figure {
            margin: 36px 0;
            border-radius: 14px;
            overflow: hidden;
            border: 1px solid rgba(255,255,255,0.06);
        }
        .article-content figure img {
            width: 100%;
            height: auto;
            display: block;
        }
        .article-content figcaption {
            padding: 12px 20px;
            font-size: 13px;
            color: #64748B;
            background: rgba(255,255,255,0.02);
            border-top: 1px solid rgba(255,255,255,0.04);
            line-height: 1.5;
        }

        /* Inline CTA (mid-article) */
        .cta-inline {
            display: flex;
            align-items: center;
            gap: 20px;
            padding: 24px 28px;
            background: linear-gradient(135deg, rgba(0,212,255,0.06), rgba(123,97,255,0.06));
            border: 1px solid rgba(0,212,255,0.15);
            border-radius: 14px;
            margin: 40px 0;
        }
        .cta-inline-icon {
            font-size: 32px;
            color: #00D4FF;
            flex-shrink: 0;
        }
        .cta-inline-title {
            font-size: 16px;
            font-weight: 700;
            color: #fff;
            margin-bottom: 4px;
        }
        .cta-inline-text {
            font-size: 14px;
            color: #94A3B8;
        }
        .cta-inline-btn {
            flex-shrink: 0;
            padding: 10px 24px;
            background: linear-gradient(135deg, #00D4FF, #7B61FF);
            color: #fff !important;
            font-weight: 700;
            font-size: 14px;
            border-radius: 10px;
            white-space: nowrap;
        }
        .cta-inline-btn:hover { text-decoration: none !important; opacity: 0.9; }
        .cta-inline-dark {
            background: linear-gradient(135deg, rgba(123,97,255,0.08), rgba(0,212,255,0.06));
            border-color: rgba(123,97,255,0.2);
        }

        /* Newsletter CTA */
        .cta-newsletter {
            margin: 40px 0;
            padding: 3px;
            border-radius: 14px;
            background: linear-gradient(135deg, #00D4FF, #7B61FF);
        }
        .cta-newsletter-inner {
            background: #0A0E1A;
            border-radius: 12px;
            padding: 24px 28px;
            display: flex;
            align-items: center;
            gap: 16px;
            flex-wrap: wrap;
        }
        .cta-newsletter strong {
            color: #fff;
            font-size: 16px;
        }
        .cta-newsletter span {
            color: #94A3B8;
            font-size: 14px;
            flex: 1;
            min-width: 200px;
        }
        .cta-btn-sm {
            padding: 10px 24px;
            background: linear-gradient(135deg, #00D4FF, #7B61FF);
            color: #fff !important;
            font-weight: 700;
            font-size: 14px;
            border-radius: 10px;
            white-space: nowrap;
        }
        .cta-btn-sm:hover { text-decoration: none !important; opacity: 0.9; }

        /* Tags */
        .article-tags {
            display: flex; flex-wrap: wrap; gap: 8px;
            margin-top: 48px; padding-top: 32px;
            border-top: 1px solid rgba(255,255,255,0.06);
        }
        .tag {
            background: rgba(255,255,255,0.05);
            color: #94A3B8;
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 13px;
        }

        /* Sources */
        .article-sources {
            margin-top: 32px; padding: 24px;
            background: rgba(255,255,255,0.02);
            border-radius: 12px;
            border: 1px solid rgba(255,255,255,0.04);
        }
        .article-sources h4 {
            font-size: 14px; font-weight: 600; color: #64748B;
            text-transform: uppercase; letter-spacing: 1px;
            margin-bottom: 12px;
        }
        .article-sources ul { list-style: none; margin: 0; padding: 0; }
        .article-sources li {
            font-size: 14px; color: #64748B; margin-bottom: 6px;
        }

        /* Big CTA (end of article) */
        .article-cta {
            margin-top: 48px; padding: 48px 40px;
            background: linear-gradient(135deg, rgba(0,212,255,0.1), rgba(123,97,255,0.1));
            border: 1px solid rgba(0,212,255,0.2);
            border-radius: 20px;
            text-align: center;
        }
        .article-cta h3 { color: #fff; margin-bottom: 12px; font-size: 28px; font-weight: 800; }
        .article-cta p { color: #94A3B8; margin-bottom: 28px; font-size: 17px; }
        .cta-btn {
            display: inline-block;
            padding: 16px 44px;
            background: linear-gradient(135deg, #00D4FF, #7B61FF);
            color: #fff;
            font-weight: 700;
            border-radius: 14px;
            font-size: 18px;
            box-shadow: 0 4px 24px rgba(0,212,255,0.25);
            transition: all 0.3s;
        }
        .cta-btn:hover { text-decoration: none; transform: translateY(-2px); box-shadow: 0 6px 32px rgba(0,212,255,0.35); }
        .cta-subtext {
            margin-top: 16px;
            font-size: 13px;
            color: #475569;
        }

        /* Sticky bottom CTA bar */
        .sticky-cta {
            position: fixed;
            bottom: 0; left: 0; right: 0;
            background: rgba(10,14,26,0.95);
            backdrop-filter: blur(12px);
            border-top: 1px solid rgba(0,212,255,0.15);
            padding: 12px 24px;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 16px;
            z-index: 99;
            transform: translateY(100%);
            transition: transform 0.4s ease;
        }
        .sticky-cta.visible { transform: translateY(0); }
        .sticky-cta-text {
            font-size: 14px;
            color: #94A3B8;
            font-weight: 500;
        }
        .sticky-cta-text strong { color: #fff; }
        .sticky-cta-btn {
            padding: 10px 28px;
            background: linear-gradient(135deg, #00D4FF, #7B61FF);
            color: #fff;
            font-weight: 700;
            font-size: 14px;
            border-radius: 10px;
            white-space: nowrap;
        }
        .sticky-cta-btn:hover { text-decoration: none; opacity: 0.9; }

        /* Footer */
        .blog-footer {
            max-width: 800px; margin: 0 auto;
            padding: 40px 24px 100px;
            border-top: 1px solid rgba(255,255,255,0.04);
            text-align: center;
            color: #475569;
            font-size: 14px;
        }

        /* Reading progress bar */
        .progress-bar {
            position: fixed; top: 0; left: 0; height: 3px; z-index: 200;
            background: linear-gradient(90deg, #00D4FF, #7B61FF);
            width: 0%; transition: width 0.1s;
            box-shadow: 0 0 8px rgba(0,212,255,0.5);
        }

        /* Content gate — blur last sections */
        .content-gate {
            position: relative;
            margin-top: -120px;
            padding-top: 120px;
            background: linear-gradient(180deg, transparent, #0A0E1A 30%);
        }
        .content-gate-inner {
            text-align: center;
            padding: 48px 32px;
        }
        .content-gate h3 {
            font-size: 26px; font-weight: 700; color: #fff;
            margin-bottom: 12px;
        }
        .content-gate p {
            color: #94A3B8; font-size: 16px; margin-bottom: 24px;
        }
        .content-gate .cta-btn { font-size: 18px; }
        .content-gate-count {
            margin-top: 16px; font-size: 13px; color: #475569;
        }
        .article-blurred {
            filter: blur(5px);
            user-select: none;
            pointer-events: none;
            max-height: 300px;
            overflow: hidden;
        }

        /* Modal popup */
        .modal-overlay {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.7);
            backdrop-filter: blur(4px);
            z-index: 300;
            display: none;
            justify-content: center;
            align-items: center;
        }
        .modal-overlay.visible { display: flex; }
        .modal {
            background: #111827;
            border: 1px solid rgba(0,212,255,0.2);
            border-radius: 20px;
            padding: 48px 40px;
            max-width: 500px;
            width: 90%;
            text-align: center;
            position: relative;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(0,212,255,0.1);
        }
        .modal-close {
            position: absolute; top: 16px; right: 20px;
            background: none; border: none; color: #475569;
            font-size: 24px; cursor: pointer;
        }
        .modal-close:hover { color: #fff; }
        .modal-icon { font-size: 48px; margin-bottom: 20px; }
        .modal h3 { font-size: 24px; font-weight: 700; color: #fff; margin-bottom: 12px; }
        .modal p { color: #94A3B8; font-size: 16px; margin-bottom: 28px; line-height: 1.6; }
        .modal .cta-btn { width: 100%; text-align: center; display: block; }
        .modal-subtext { margin-top: 12px; font-size: 12px; color: #475569; }
        .modal-social {
            margin-top: 20px; padding-top: 20px;
            border-top: 1px solid rgba(255,255,255,0.06);
            font-size: 13px; color: #64748B;
        }
        .modal-avatars {
            display: flex; justify-content: center; gap: -8px; margin-bottom: 8px;
        }
        .modal-avatar {
            width: 32px; height: 32px; border-radius: 50%;
            background: linear-gradient(135deg, #00D4FF, #7B61FF);
            border: 2px solid #111827;
            margin-left: -8px;
            display: flex; justify-content: center; align-items: center;
            font-size: 12px; color: #fff; font-weight: 700;
        }

        /* Toast notification */
        .toast {
            position: fixed; bottom: 80px; left: 24px;
            background: #111827;
            border: 1px solid rgba(0,212,255,0.15);
            border-radius: 12px;
            padding: 14px 20px;
            display: flex; align-items: center; gap: 12px;
            z-index: 150;
            box-shadow: 0 8px 30px rgba(0,0,0,0.3);
            transform: translateX(-120%);
            transition: transform 0.4s ease;
            max-width: 340px;
        }
        .toast.visible { transform: translateX(0); }
        .toast-dot {
            width: 8px; height: 8px; border-radius: 50%;
            background: #00FF94; flex-shrink: 0;
            animation: pulse-dot 2s infinite;
        }
        @keyframes pulse-dot {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
        }
        .toast-text { font-size: 13px; color: #94A3B8; }
        .toast-text strong { color: #fff; }

        @media (max-width: 768px) {
            .article-wrapper h1 { font-size: 28px; }
            .article-content h2 { font-size: 22px; }
            .article-wrapper { padding: 100px 16px 60px; }
            .cta-inline { flex-direction: column; text-align: center; }
            .cta-newsletter-inner { flex-direction: column; text-align: center; }
            .article-hero { border-radius: 0; margin-left: -16px; margin-right: -16px; width: calc(100% + 32px); }
            .modal { padding: 32px 24px; }
            .toast { left: 12px; right: 12px; max-width: none; }
        }
    </style>
</head>
<body>
    <nav class="nav">
        <div class="nav-inner">
            <a href="${config.siteUrl}" class="nav-logo">◆ CryptoMind<span>AI</span></a>
            <ul class="nav-links">
                <li><a href="${config.siteUrl}">Accueil</a></li>
                <li><a href="${config.siteUrl}/blog/">Blog</a></li>
                <li class="hide-mobile"><a href="${config.siteUrl}#performance">Performance</a></li>
                <li class="hide-mobile"><a href="${config.siteUrl}#pricing">Tarifs</a></li>
                <li><a href="${config.siteUrl}#signup" class="nav-cta">Commencer</a></li>
            </ul>
        </div>
    </nav>

    <article class="article-wrapper" itemscope itemtype="https://schema.org/Article">
        <div class="article-meta">
            <span class="article-category">${escapeHtml(article.category.replace(/-/g, ' '))}</span>
            <time datetime="${isoDate}">${dateStr}</time>
            <span>·</span>
            <span>${article.readTime}</span>
        </div>

        <h1 itemprop="headline">${escapeHtml(article.title)}</h1>

        ${hasHero ? `<div class="article-hero">
            <img src="${heroImagePath}" alt="${escapeHtml(article.title)}" itemprop="image" loading="eager">
        </div>` : ''}

        <p class="article-excerpt" itemprop="description">${escapeHtml(article.excerpt)}</p>

        <div class="article-content" itemprop="articleBody">
            ${contentWithCTAs}
        </div>

        <div class="article-tags">
            ${article.tags.map((t) => `<span class="tag">#${escapeHtml(t)}</span>`).join('\n            ')}
        </div>

        ${
          article.sources && article.sources.length > 0
            ? `<div class="article-sources">
            <h4>Sources</h4>
            <ul>
                ${article.sources.map((s) => `<li><a href="${escapeHtml(s)}" target="_blank" rel="noopener">${escapeHtml(s)}</a></li>`).join('\n                ')}
            </ul>
        </div>`
            : ''
        }

        <div class="article-cta">
            <h3>L'agent IA qui trade pour vous</h3>
            <p>Pendant que vous lisez nos analyses, notre agent IA analyse les marchés crypto 24h/24 et exécute les trades à votre place. <strong>+127% de rendement moyen en 2025</strong>. Rejoignez +8 000 investisseurs.</p>
            <a href="${config.siteUrl}#signup" class="cta-btn">Activer l'agent IA</a>
            <div class="cta-subtext">À partir de 250 € · Garantie satisfait ou remboursé 30 jours</div>
        </div>
    </article>

    <!-- Reading progress bar -->
    <div class="progress-bar" id="progressBar"></div>

    <!-- Sticky bottom CTA -->
    <div class="sticky-cta" id="stickyCta">
        <span class="sticky-cta-text"><strong>CryptoMind AI</strong> — L'IA qui analyse pour vous</span>
        <a href="${config.siteUrl}#signup" class="sticky-cta-btn">Essai gratuit →</a>
    </div>

    <!-- Social proof toast -->
    <div class="toast" id="toast">
        <div class="toast-dot"></div>
        <div class="toast-text" id="toastText"></div>
    </div>

    <!-- Scroll popup modal -->
    <div class="modal-overlay" id="scrollModal">
        <div class="modal">
            <button class="modal-close" id="modalClose">&times;</button>
            <div class="modal-icon">◆</div>
            <h3>L'agent IA qui trade pour vous</h3>
            <p>Notre agent IA <strong>analyse, décide et exécute</strong> vos trades crypto en temps réel, 24h/24. Sans émotions, sans stress, sans intervention humaine. <strong>+127% de rendement moyen en 2025</strong>.</p>
            <a href="${config.siteUrl}#signup" class="cta-btn">Activer l'agent IA</a>
            <div class="modal-subtext">À partir de 250 € · Garantie 30 jours satisfait ou remboursé</div>
            <div class="modal-social">
                <div class="modal-avatars">
                    <div class="modal-avatar">A</div>
                    <div class="modal-avatar">M</div>
                    <div class="modal-avatar">S</div>
                    <div class="modal-avatar">K</div>
                    <div class="modal-avatar">+</div>
                </div>
                Rejoint par 8 247 investisseurs cette semaine
            </div>
        </div>
    </div>

    <!-- Exit intent modal -->
    <div class="modal-overlay" id="exitModal">
        <div class="modal">
            <button class="modal-close" id="exitModalClose">&times;</button>
            <div class="modal-icon">⚡</div>
            <h3>Attendez — un dernier truc</h3>
            <p>Les marchés n'attendent pas. Nos algorithmes IA analysent les données 24h/24 et envoient des alertes avant les mouvements majeurs.</p>
            <a href="${config.siteUrl}#signup" class="cta-btn">Activer les alertes IA gratuitement</a>
            <div class="modal-subtext">Gratuit pendant 30 jours · Sans engagement</div>
        </div>
    </div>

    <footer class="blog-footer">
        <p>© ${new Date().getFullYear()} ${config.siteName}. Tous droits réservés.</p>
        <p style="margin-top: 8px;">
            <a href="${config.siteUrl}">Accueil</a> · <a href="${config.siteUrl}/blog/">Blog</a>
        </p>
    </footer>

    <script>
    (function() {
        // === READING PROGRESS BAR ===
        const progressBar = document.getElementById('progressBar');
        const article = document.querySelector('.article-wrapper');

        // === STICKY CTA ===
        const stickyCta = document.getElementById('stickyCta');
        let stickyShown = false;

        // === SCROLL POPUP (at 60%) ===
        const scrollModal = document.getElementById('scrollModal');
        let scrollModalShown = false;
        document.getElementById('modalClose').onclick = function() {
            scrollModal.classList.remove('visible');
        };
        scrollModal.onclick = function(e) {
            if (e.target === scrollModal) scrollModal.classList.remove('visible');
        };

        // === EXIT INTENT ===
        const exitModal = document.getElementById('exitModal');
        let exitShown = false;
        document.getElementById('exitModalClose').onclick = function() {
            exitModal.classList.remove('visible');
        };
        exitModal.onclick = function(e) {
            if (e.target === exitModal) exitModal.classList.remove('visible');
        };
        document.addEventListener('mouseout', function(e) {
            if (e.clientY < 5 && !exitShown && scrollModalShown) {
                exitModal.classList.add('visible');
                exitShown = true;
            }
        });

        // === SCROLL HANDLER ===
        window.addEventListener('scroll', function() {
            const scrollTop = window.scrollY;
            const docHeight = document.body.scrollHeight - window.innerHeight;
            const percent = Math.min(scrollTop / docHeight, 1);

            // Progress bar
            progressBar.style.width = (percent * 100) + '%';

            // Sticky CTA at 20%
            if (percent > 0.2 && !stickyShown) {
                stickyCta.classList.add('visible');
                stickyShown = true;
            }

            // Scroll popup at 55%
            if (percent > 0.55 && !scrollModalShown) {
                scrollModal.classList.add('visible');
                scrollModalShown = true;
            }
        });

        // === SOCIAL PROOF TOASTS ===
        const toast = document.getElementById('toast');
        const toastText = document.getElementById('toastText');
        const toastMessages = [
            '<strong>Thomas D.</strong> vient de s\\'inscrire depuis Paris',
            '<strong>14 personnes</strong> se sont inscrites dans les 30 dernières minutes',
            '<strong>Marie L.</strong> vient d\\'activer les alertes IA',
            '<strong>+340 inscriptions</strong> aujourd\\'hui',
            '<strong>Alexandre R.</strong> vient de rejoindre depuis Lyon',
            '<strong>Sophie M.</strong> a activé son essai gratuit',
        ];
        let toastIndex = 0;

        function showToast() {
            toastText.innerHTML = toastMessages[toastIndex % toastMessages.length];
            toast.classList.add('visible');
            toastIndex++;
            setTimeout(function() { toast.classList.remove('visible'); }, 5000);
        }

        // First toast after 25s, then every 45s
        setTimeout(showToast, 25000);
        setInterval(showToast, 45000);

        // === CONTENT GATE (blur last sections) ===
        // Find last 2 h2 sections and blur them
        setTimeout(function() {
            var h2s = document.querySelectorAll('.article-content h2');
            if (h2s.length >= 4) {
                var lastH2 = h2s[h2s.length - 2];
                var gate = document.createElement('div');
                gate.className = 'content-gate';
                gate.innerHTML = '<div class="content-gate-inner">' +
                    '<h3>Inscrivez-vous pour lire la suite</h3>' +
                    '<p>Cet article contient encore des analyses exclusives. Créez votre compte gratuit pour y accéder.</p>' +
                    '<a href="${config.siteUrl}#signup" class="cta-btn">Lire la suite gratuitement</a>' +
                    '<div class="content-gate-count">Déjà 8 247 membres inscrits</div>' +
                '</div>';

                // Blur everything after this H2
                var sibling = lastH2;
                var toBlur = [];
                while (sibling) {
                    toBlur.push(sibling);
                    sibling = sibling.nextElementSibling;
                }
                if (toBlur.length > 0) {
                    var wrapper = document.createElement('div');
                    wrapper.className = 'article-blurred';
                    toBlur[0].parentNode.insertBefore(wrapper, toBlur[0]);
                    toBlur.forEach(function(el) { wrapper.appendChild(el); });
                    wrapper.parentNode.insertBefore(gate, wrapper.nextSibling);
                }
            }
        }, 500);
    })();
    </script>
</body>
</html>`;
}

function buildBlogIndex(articles) {
  const cards = articles
    .sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt))
    .map((a) => {
      const date = new Date(a.generatedAt).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const hasImage = fs.existsSync(path.join(config.blogDir, 'images', `${a.slug}.png`));
      const imageTag = hasImage
        ? `<div class="card-image"><img src="images/${a.slug}.png" alt="${escapeHtml(a.title)}" loading="lazy"></div>`
        : `<div class="card-image card-image-placeholder"><span>◆</span></div>`;
      return `
        <a href="articles/${a.slug}.html" class="blog-card">
            ${imageTag}
            <div class="card-body">
                <div class="card-category">${escapeHtml(a.category.replace(/-/g, ' '))}</div>
                <h2>${escapeHtml(a.title)}</h2>
                <p>${escapeHtml(a.excerpt)}</p>
                <div class="card-meta">
                    <time>${date}</time>
                    <span>${a.readTime}</span>
                </div>
            </div>
        </a>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blog — ${config.siteName} | Actualités IA, Crypto & Investissement</title>
    <meta name="description" content="Découvrez nos analyses et actualités sur l'intelligence artificielle, les crypto-monnaies et l'investissement technologique.">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${config.siteUrl}/blog/">
    <meta property="og:title" content="Blog — ${config.siteName}">
    <meta property="og:description" content="Analyses et actualités sur l'IA, les crypto-monnaies et l'investissement.">
    <meta property="og:type" content="website">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', sans-serif;
            background: #0A0E1A;
            color: #E2E8F0;
            line-height: 1.6;
        }
        a { color: inherit; text-decoration: none; }
        .nav {
            position: fixed; top: 0; width: 100%; z-index: 100;
            background: rgba(10,14,26,0.92);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid rgba(255,255,255,0.06);
            padding: 16px 0;
        }
        .nav-inner {
            max-width: 1100px; margin: 0 auto; padding: 0 24px;
            display: flex; justify-content: space-between; align-items: center;
        }
        .nav-logo { font-size: 20px; font-weight: 700; color: #fff; text-decoration: none; }
        .nav-logo span { color: #00D4FF; }
        .nav-links { display: flex; gap: 24px; list-style: none; align-items: center; }
        .nav-links a { color: #94A3B8; font-size: 14px; font-weight: 500; }
        .nav-links a:hover { color: #fff; }
        .nav-cta { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff !important; padding: 8px 20px; border-radius: 8px; font-weight: 600; }
        .nav-cta:hover { opacity: 0.9; }
        @media (max-width: 768px) {
            .nav-links { gap: 12px; }
            .nav-links .hide-mobile { display: none; }
            .nav-cta { padding: 6px 14px; font-size: 13px; }
        }
        .blog-header {
            max-width: 1100px; margin: 0 auto;
            padding: 140px 24px 40px;
        }
        .blog-header h1 {
            font-size: 48px; font-weight: 800; color: #fff;
            margin-bottom: 16px; letter-spacing: -1px;
        }
        .blog-header p { font-size: 18px; color: #64748B; max-width: 600px; margin-bottom: 32px; }
        .blog-header-cta {
            display: inline-block;
            padding: 12px 32px;
            background: linear-gradient(135deg, #00D4FF, #7B61FF);
            color: #fff;
            font-weight: 700;
            border-radius: 12px;
            font-size: 15px;
        }
        .blog-header-cta:hover { opacity: 0.9; }
        .blog-grid {
            max-width: 1100px; margin: 0 auto;
            padding: 0 24px 80px;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
            gap: 24px;
        }
        .blog-card {
            background: rgba(255,255,255,0.02);
            border: 1px solid rgba(255,255,255,0.06);
            border-radius: 16px;
            overflow: hidden;
            transition: all 0.3s;
            display: flex;
            flex-direction: column;
        }
        .blog-card:hover {
            border-color: rgba(0,212,255,0.2);
            background: rgba(0,212,255,0.03);
            transform: translateY(-3px);
            box-shadow: 0 8px 30px rgba(0,212,255,0.08);
        }
        .card-image {
            width: 100%;
            height: 200px;
            overflow: hidden;
        }
        .card-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s;
        }
        .blog-card:hover .card-image img { transform: scale(1.05); }
        .card-image-placeholder {
            background: linear-gradient(135deg, rgba(0,212,255,0.08), rgba(123,97,255,0.08));
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .card-image-placeholder span {
            font-size: 48px;
            color: rgba(0,212,255,0.2);
        }
        .card-body { padding: 24px 28px 28px; display: flex; flex-direction: column; flex: 1; }
        .card-category {
            font-size: 12px; font-weight: 600;
            color: #00D4FF; text-transform: uppercase;
            letter-spacing: 1px; margin-bottom: 12px;
        }
        .blog-card h2 {
            font-size: 20px; font-weight: 700; color: #fff;
            line-height: 1.3; margin-bottom: 12px;
        }
        .blog-card p {
            font-size: 15px; color: #64748B;
            line-height: 1.6; flex: 1; margin-bottom: 16px;
        }
        .card-meta {
            font-size: 13px; color: #475569;
            display: flex; justify-content: space-between;
            padding-top: 16px;
            border-top: 1px solid rgba(255,255,255,0.04);
        }
        .blog-footer {
            max-width: 1100px; margin: 0 auto;
            padding: 40px 24px;
            border-top: 1px solid rgba(255,255,255,0.04);
            text-align: center;
            color: #475569;
            font-size: 14px;
        }
        @media (max-width: 768px) {
            .blog-header h1 { font-size: 32px; }
            .blog-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <nav class="nav">
        <div class="nav-inner">
            <a href="${config.siteUrl}" class="nav-logo">◆ CryptoMind<span>AI</span></a>
            <ul class="nav-links">
                <li><a href="${config.siteUrl}">Accueil</a></li>
                <li><a href="${config.siteUrl}/blog/" style="color:#fff">Blog</a></li>
                <li class="hide-mobile"><a href="${config.siteUrl}#performance">Performance</a></li>
                <li class="hide-mobile"><a href="${config.siteUrl}#pricing">Tarifs</a></li>
                <li><a href="${config.siteUrl}#signup" class="nav-cta">Commencer</a></li>
            </ul>
        </div>
    </nav>

    <header class="blog-header">
        <h1>Blog</h1>
        <p>Analyses, tendances et décryptages sur l'intelligence artificielle, les crypto-monnaies et l'investissement technologique.</p>
        <a href="${config.siteUrl}#signup" class="blog-header-cta">Découvrir CryptoMind AI →</a>
    </header>

    <div class="blog-grid">
        ${cards}
    </div>

    <footer class="blog-footer">
        <p>© ${new Date().getFullYear()} ${config.siteName}. Tous droits réservés.</p>
    </footer>
</body>
</html>`;
}

function buildSitemap(articles) {
  const urls = [
    { loc: `${config.siteUrl}/`, priority: '1.0', changefreq: 'weekly' },
    { loc: `${config.siteUrl}/blog/`, priority: '0.9', changefreq: 'hourly' },
    ...articles.map((a) => ({
      loc: `${config.siteUrl}/blog/articles/${a.slug}.html`,
      lastmod: new Date(a.generatedAt).toISOString().split('T')[0],
      priority: '0.7',
      changefreq: 'monthly',
    })),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>`;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = { buildArticleHTML, buildBlogIndex, buildSitemap };
