// ============================================
// ForexBot AI — Landing Page Scripts
// ============================================

// --- i18n Translation System ---
const translations = {
    en: {
        // Nav
        'nav.features': 'Features',
        'nav.how': 'How It Works',
        'nav.performance': 'Performance',
        'nav.testimonials': 'Testimonials',
        'nav.pricing': 'Pricing',
        'nav.cta': 'Start Trading Now',
        // Hero
        'hero.badge': 'Autonomous Trading 24/7',
        'hero.title': 'The AI Agent That<br><span class="gradient-text">Trades for You</span>',
        'hero.subtitle': 'Our AI agent analyzes crypto markets in real-time, executes trades with extreme precision, and optimizes your portfolio — 24 hours a day, with zero human intervention.',
        'hero.cta_primary': 'Start Trading Now <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
        'hero.cta_secondary': 'See How It Works',
        'hero.trust': 'Join <strong>15,000+</strong> traders already using ForexBot AI',
        'hero.stat1': 'Trade Accuracy',
        'hero.stat2': 'Non-Stop Monitoring',
        'hero.stat3': 'Avg. Annual Return',
        // Trading Card
        'card.price_label': 'Current Price',
        'card.buy': 'BUY executed — 0.045 BTC',
        'card.analyze': 'Analyzing trend pattern...',
        'card.time_ago': '2 min ago',
        'card.time_now': 'now',
        'card.cta': 'Activate Your AI Agent <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
        // Trust
        'trust.label': 'Supported Markets & Technologies',
        // CTA 1
        'cta1.title': 'Stop losing money trading manually.',
        'cta1.desc': 'Let our AI agent handle the complexity while you enjoy the results.',
        'cta1.btn': 'Get Started Now <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
        // Features
        'feat.tag': 'Features',
        'feat.title': 'Why Choose an <span class="gradient-text">AI Agent</span> to Trade?',
        'feat.desc': 'AI agents are the future of trading. Discover why thousands of investors trust our technology to grow their wealth.',
        'feat.c1_title': '24/7 Non-Stop Trading',
        'feat.c1_desc': 'The AI agent never sleeps. It monitors crypto markets around the clock and seizes every opportunity — day, night, weekends included.',
        'feat.c2_title': 'Ultra-Fast Execution',
        'feat.c2_desc': 'Decisions made in milliseconds. The AI analyzes thousands of signals simultaneously and executes trades before the market moves.',
        'feat.c3_title': 'Smart Risk Management',
        'feat.c3_desc': 'Advanced risk management algorithms protect your capital. Dynamic stop-losses, automatic diversification, and configurable loss limits.',
        'feat.c4_title': 'Multi-Market Analysis',
        'feat.c4_desc': 'Simultaneous monitoring of hundreds of crypto pairs. The AI detects correlations and trends invisible to the human eye.',
        'feat.c5_title': 'Zero Emotion, 100% Logic',
        'feat.c5_desc': 'No fear. No greed. The AI agent makes decisions based purely on data, patterns, and mathematical models.',
        'feat.c6_title': 'Continuous Learning',
        'feat.c6_desc': 'The AI constantly improves. It learns from every trade, adapts to new market conditions, and refines its strategies automatically.',
        'feat.cta': 'Open Your Account <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
        'feat.cta_note': 'Minimum deposit of just 250 €',
        // Steps
        'steps.tag': 'How It Works',
        'steps.title': 'Start Trading in <span class="gradient-text">3 Simple Steps</span>',
        'steps.desc': 'No expertise needed. Our AI agent handles everything.',
        'steps.s1_title': 'Create Your Account',
        'steps.s1_desc': 'Sign up in minutes. Quick, secure identity verification to start immediately.',
        'steps.s1_link': 'Create Account →',
        'steps.s2_title': 'Configure Your Strategy',
        'steps.s2_desc': 'Set your risk profile, favorite cryptocurrencies, and target returns. The AI adapts to you.',
        'steps.s3_title': 'Let the AI Trade',
        'steps.s3_desc': 'The AI agent starts analyzing and trading automatically. Track your performance in real-time from your dashboard.',
        'steps.s3_link': 'Start Now →',
        // AI Advantage
        'adv.tag': 'The AI Advantage',
        'adv.title': 'The Future of Trading<br>is <span class="gradient-text">Autonomous</span>',
        'adv.desc': 'While traditional traders rely on gut feelings and limited data, our AI agent processes millions of data points per second — technical indicators, on-chain analytics, social sentiment, and market microstructure — to identify opportunities with extreme precision.',
        'adv.i1_title': 'Deep Learning Models',
        'adv.i1_desc': 'Neural networks trained on 10+ years of crypto market data',
        'adv.i2_title': 'Sentiment Analysis',
        'adv.i2_desc': 'Real-time monitoring of social media, news, and on-chain signals',
        'adv.i3_title': 'Adaptive Strategies',
        'adv.i3_desc': 'Self-optimizing algorithms that evolve with market conditions',
        'adv.cta': 'Experience AI Trading <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
        // Performance
        'perf.tag': 'Performance',
        'perf.title': 'Results That <span class="gradient-text">Speak for Themselves</span>',
        'perf.desc': 'Our AI agent delivers trading performance of extreme quality, outperforming traditional methods.',
        'perf.l1': 'Average Annual Return',
        'perf.l2': 'Average Execution Time',
        'perf.l3': 'Trades Executed',
        'perf.l4': 'System Uptime',
        'perf.cta': 'Unlock These Returns <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
        'perf.cta_note': 'Join 15,000+ profitable traders',
        // Comparison
        'comp.tag': 'Comparison',
        'comp.title': 'Human Trading vs <span class="gradient-text">AI Trading</span>',
        'comp.desc': 'See why AI-powered trading is the future of crypto investing.',
        'comp.col_feat': 'Feature',
        'comp.col_human': 'Human Trader',
        'comp.r1_feat': 'Availability',
        'comp.r1_human': '4-8 hours/day',
        'comp.r1_ai': '24/7 non-stop',
        'comp.r2_feat': 'Execution Speed',
        'comp.r2_human': 'Seconds to minutes',
        'comp.r2_ai': 'Milliseconds',
        'comp.r3_feat': 'Emotions',
        'comp.r3_human': 'Fear & greed',
        'comp.r3_ai': '100% rational',
        'comp.r4_feat': 'Data Analysis',
        'comp.r4_human': 'Limited charts',
        'comp.r4_ai': 'Millions of signals',
        'comp.r5_feat': 'Consistency',
        'comp.r5_human': 'Variable',
        'comp.r5_ai': 'Disciplined always',
        'comp.r6_feat': 'Learning',
        'comp.r6_human': 'Slow & biased',
        'comp.r6_ai': 'Continuous ML',
        'comp.cta': 'Switch to AI Trading <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
        // Testimonials
        'test.tag': 'Testimonials',
        'test.title': 'What Our <span class="gradient-text">Users Say</span>',
        'test.t1_text': '"I tried manual trading for 2 years with no success. Since using ForexBot AI, my results are incomparable. The AI detects opportunities I would never have seen."',
        'test.t1_role': 'Investor for 8 months',
        'test.t2_text': '"24/7 trading changes everything. While I sleep, the AI keeps working. The results are impressive and the risk management is excellent. Best investment I\'ve made."',
        'test.t2_role': 'Investor for 1 year',
        'test.t3_text': '"As a developer, I was skeptical. But the technology behind ForexBot AI is solid. The continuous learning produces increasingly precise results over time."',
        'test.t3_role': 'Investor for 6 months',
        'test.cta': 'Join Thousands of Happy Traders <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
        // Pricing
        'price.tag': 'Pricing',
        'price.title': 'Simple, Transparent <span class="gradient-text">Pricing</span>',
        'price.desc': 'Start today. Upgrade when you\'re ready to scale.',
        'price.s_name': 'Starter',
        'price.s_desc': 'Perfect to start AI trading',
        'price.s_f1': 'Live AI trading',
        'price.s_f2': '10 crypto pairs',
        'price.s_f3': 'Basic AI strategy',
        'price.s_f4': 'Email support',
        'price.s_f5': 'Real-time dashboard',
        'price.s_btn': 'Get Started',
        'price.badge': 'Most Popular',
        'price.p_name': 'Pro',
        'price.p_desc': 'For serious traders',
        'price.p_f1': 'Everything in Starter',
        'price.p_f2': '50+ crypto pairs',
        'price.p_f3': 'Advanced AI strategies',
        'price.p_f4': 'Priority 24/7 support',
        'price.p_f5': 'Advanced analytics & alerts',
        'price.p_btn': 'Get Started Now',
        'price.e_name': 'Elite',
        'price.e_desc': 'Maximum performance',
        'price.e_f1': 'Everything in Pro',
        'price.e_f2': 'All 100+ crypto pairs',
        'price.e_f3': 'Custom AI strategies',
        'price.e_f4': 'Dedicated account manager',
        'price.e_f5': 'API access & VIP signals',
        'price.e_btn': 'Get Started',
        // CTA 2
        'cta2.title': 'Ready to Let AI <span class="gradient-text">Grow Your Wealth?</span>',
        'cta2.desc': 'Join the revolution. Our AI agent is the future of crypto trading — and the future starts now.',
        'cta2.btn': 'Create Account <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
        'cta2.guarantee': '30-day money-back guarantee',
        // Signup
        'signup.title': 'Ready to Let AI<br><span class="gradient-text">Trade for You?</span>',
        'signup.desc': 'Join thousands of investors who trust our AI agent. Open your account and start trading in minutes.',
        'signup.b1': 'Quick signup, no commitment',
        'signup.b2': 'Support available 24/7',
        'signup.b3': '24/7 support from our team',
        'signup.b4': 'Withdraw funds at any time',
        'signup.b5': '30-day money-back guarantee',
        'signup.form_title': 'Open Your Account',
        'signup.form_sub': 'Start your AI trading journey today',
        'signup.min_invest': 'Minimum investment: <strong>€250</strong>',
        'signup.lbl_first': 'First Name',
        'signup.lbl_last': 'Last Name',
        'signup.lbl_email': 'Email Address',
        'signup.lbl_phone': 'Phone Number',
        'signup.lbl_exp': 'Trading Experience',
        'signup.opt_default': 'Select your level',
        'signup.opt_beginner': 'Beginner — Just starting out',
        'signup.opt_inter': 'Intermediate — A few trades',
        'signup.opt_adv': 'Advanced — Regular trader',
        'signup.opt_expert': 'Expert — Professional trader',
        'signup.terms': 'I agree to the <a href="terms.html" target="_blank">Terms of Service</a> and <a href="privacy.html" target="_blank">Privacy Policy</a>',
        'signup.submit': 'Create My Account <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
        'signup.disclaimer': 'Sign up in just a few minutes',
        // Placeholders
        'signup.ph_first': 'Your first name',
        'signup.ph_last': 'Your last name',
        'signup.ph_email': 'you@example.com',
        'signup.ph_phone': '+1 (555) 000-0000',
        // FAQ
        'faq.title': 'Frequently Asked <span class="gradient-text">Questions</span>',
        'faq.q1': 'What is an AI trading agent?',
        'faq.a1': 'An AI trading agent is an autonomous artificial intelligence program that analyzes financial markets, identifies trading opportunities, and automatically executes buy and sell orders. It operates 24/7 without human intervention, using advanced machine learning algorithms.',
        'faq.q2': 'Is my capital safe?',
        'faq.a2': 'Yes. Your funds are stored on regulated, secure exchange platforms. The AI agent only has access to trading functions, never to withdrawals. Additionally, our risk management algorithms include automatic stop-losses to limit potential losses.',
        'faq.q3': 'What\'s the minimum amount to start?',
        'faq.a3': 'The minimum deposit is just 250 €. There\'s no commitment and you can withdraw your funds at any time.',
        'faq.q4': 'Do I need trading experience?',
        'faq.a4': 'Absolutely not. That\'s the beauty of an AI agent — it does all the analysis and trading work for you. Our interface is designed to be intuitive, and our support team is available 24/7 to help you get started.',
        'faq.q5': 'How does the AI make trading decisions?',
        'faq.a5': 'Our AI uses a combination of advanced technical analysis, market sentiment analysis (social media, news), deep learning-based predictive models, and blockchain on-chain data analytics. It processes millions of data points per second to identify the best opportunities.',
        'faq.cta_text': 'Still have questions?',
        'faq.cta_btn': 'Talk to Our Team <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
        // Sticky CTA
        'sticky.text': 'Start trading with AI today',
        'sticky.btn': 'Open Account <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
        // Footer
        'footer.desc': 'The future of trading is autonomous. Our next-gen AI agent trades crypto with extreme quality and precision.',
        'footer.cta': 'Start Trading Now →',
        'footer.product': 'Product',
        'footer.f_feat': 'Features',
        'footer.f_how': 'How It Works',
        'footer.f_perf': 'Performance',
        'footer.f_price': 'Pricing',
        'footer.f_account': 'Open Account',
        'footer.resources': 'Resources',
        'footer.help': 'Help Center',
        'footer.blog': 'Blog',
        'footer.api': 'API Documentation',
        'footer.status': 'System Status',
        'footer.legal': 'Legal',
        'footer.terms': 'Terms of Service',
        'footer.privacy': 'Privacy Policy',
        'footer.risk': 'Risk Disclaimer',
        'footer.notices': 'Legal Notices',
        'footer.copyright': '© 2026 ForexBot AI. All rights reserved.',
        'footer.warning': 'Disclaimer: Cryptocurrency trading involves significant risk. Past performance does not guarantee future results. Only invest what you can afford to lose.',
        // Modal
        'modal.title': 'Registration Successful!',
        'modal.desc': 'Welcome to ForexBot AI. Check your email to activate your account and start trading with our AI agent.',
        'modal.btn': 'Got It',
    },
    fr: {
        // Nav
        'nav.features': 'Fonctionnalités',
        'nav.how': 'Comment ça Marche',
        'nav.performance': 'Performance',
        'nav.testimonials': 'Témoignages',
        'nav.pricing': 'Tarifs',
        'nav.cta': 'Commencer Maintenant',
        // Hero
        'hero.badge': 'Trading Autonome 24/7',
        'hero.title': 'L\'Agent IA qui<br><span class="gradient-text">Trade pour Vous</span>',
        'hero.subtitle': 'Notre agent IA analyse les marchés crypto en temps réel, exécute des trades avec une précision extrême et optimise votre portefeuille — 24h/24, sans aucune intervention humaine.',
        'hero.cta_primary': 'Commencez Maintenant <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
        'hero.cta_secondary': 'Voir Comment ça Marche',
        'hero.trust': 'Rejoignez <strong>15 000+</strong> traders qui utilisent déjà ForexBot AI',
        'hero.stat1': 'Précision des Trades',
        'hero.stat2': 'Surveillance Continue',
        'hero.stat3': 'Rendement Annuel Moy.',
        // Trading Card
        'card.price_label': 'Prix Actuel',
        'card.buy': 'ACHAT exécuté — 0.045 BTC',
        'card.analyze': 'Analyse des tendances en cours...',
        'card.time_ago': 'il y a 2 min',
        'card.time_now': 'maintenant',
        'card.cta': 'Activez Votre Agent IA <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
        // Trust
        'trust.label': 'Marchés et Technologies Supportés',
        // CTA 1
        'cta1.title': 'Arrêtez de perdre de l\'argent en tradant manuellement.',
        'cta1.desc': 'Laissez notre agent IA gérer la complexité pendant que vous profitez des résultats.',
        'cta1.btn': 'Commencer Maintenant <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
        // Features
        'feat.tag': 'Fonctionnalités',
        'feat.title': 'Pourquoi Choisir un <span class="gradient-text">Agent IA</span> pour Trader ?',
        'feat.desc': 'Les agents IA sont le futur du trading. Découvrez pourquoi des milliers d\'investisseurs font confiance à notre technologie pour faire croître leur capital.',
        'feat.c1_title': 'Trading Non-Stop 24/7',
        'feat.c1_desc': 'L\'agent IA ne dort jamais. Il surveille les marchés crypto en permanence et saisit chaque opportunité — jour, nuit, week-ends compris.',
        'feat.c2_title': 'Exécution Ultra-Rapide',
        'feat.c2_desc': 'Décisions prises en millisecondes. L\'IA analyse des milliers de signaux simultanément et exécute les trades avant que le marché ne bouge.',
        'feat.c3_title': 'Gestion Intelligente des Risques',
        'feat.c3_desc': 'Des algorithmes avancés de gestion des risques protègent votre capital. Stop-loss dynamiques, diversification automatique et limites de pertes configurables.',
        'feat.c4_title': 'Analyse Multi-Marchés',
        'feat.c4_desc': 'Surveillance simultanée de centaines de paires crypto. L\'IA détecte les corrélations et tendances invisibles à l\'œil humain.',
        'feat.c5_title': 'Zéro Émotion, 100% Logique',
        'feat.c5_desc': 'Aucune peur. Aucune avidité. L\'agent IA prend ses décisions uniquement sur la base de données, de patterns et de modèles mathématiques.',
        'feat.c6_title': 'Apprentissage Continu',
        'feat.c6_desc': 'L\'IA s\'améliore constamment. Elle apprend de chaque trade, s\'adapte aux nouvelles conditions de marché et affine ses stratégies automatiquement.',
        'feat.cta': 'Ouvrir un Compte <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
        'feat.cta_note': 'Dépôt minimum de 250 € seulement',
        // Steps
        'steps.tag': 'Comment ça Marche',
        'steps.title': 'Commencez à Trader en <span class="gradient-text">3 Étapes Simples</span>',
        'steps.desc': 'Aucune expertise nécessaire. Notre agent IA gère tout.',
        'steps.s1_title': 'Créez Votre Compte',
        'steps.s1_desc': 'Inscrivez-vous en quelques minutes. Vérification d\'identité rapide et sécurisée pour commencer immédiatement.',
        'steps.s1_link': 'Créer un Compte →',
        'steps.s2_title': 'Configurez Votre Stratégie',
        'steps.s2_desc': 'Définissez votre profil de risque, vos cryptomonnaies préférées et vos objectifs de rendement. L\'IA s\'adapte à vous.',
        'steps.s3_title': 'Laissez l\'IA Trader',
        'steps.s3_desc': 'L\'agent IA commence à analyser et trader automatiquement. Suivez vos performances en temps réel depuis votre tableau de bord.',
        'steps.s3_link': 'Commencer →',
        // AI Advantage
        'adv.tag': 'L\'Avantage IA',
        'adv.title': 'Le Futur du Trading<br>est <span class="gradient-text">Autonome</span>',
        'adv.desc': 'Alors que les traders traditionnels se fient à leur instinct et à des données limitées, notre agent IA traite des millions de points de données par seconde — indicateurs techniques, analyses on-chain, sentiment social et microstructure du marché — pour identifier les opportunités avec une précision extrême.',
        'adv.i1_title': 'Modèles d\'Apprentissage Profond',
        'adv.i1_desc': 'Réseaux neuronaux entraînés sur plus de 10 ans de données du marché crypto',
        'adv.i2_title': 'Analyse de Sentiment',
        'adv.i2_desc': 'Surveillance en temps réel des réseaux sociaux, actualités et signaux on-chain',
        'adv.i3_title': 'Stratégies Adaptatives',
        'adv.i3_desc': 'Algorithmes auto-optimisants qui évoluent avec les conditions du marché',
        'adv.cta': 'Découvrir le Trading IA <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
        // Performance
        'perf.tag': 'Performance',
        'perf.title': 'Des Résultats qui <span class="gradient-text">Parlent d\'Eux-Mêmes</span>',
        'perf.desc': 'Notre agent IA offre des performances de trading d\'une qualité extrême, surpassant les méthodes traditionnelles.',
        'perf.l1': 'Rendement Annuel Moyen',
        'perf.l2': 'Temps d\'Exécution Moyen',
        'perf.l3': 'Trades Exécutés',
        'perf.l4': 'Disponibilité Système',
        'perf.cta': 'Débloquez ces Rendements <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
        'perf.cta_note': 'Rejoignez 15 000+ traders profitables',
        // Comparison
        'comp.tag': 'Comparaison',
        'comp.title': 'Trading Humain vs <span class="gradient-text">Trading IA</span>',
        'comp.desc': 'Découvrez pourquoi le trading IA est le futur de l\'investissement crypto.',
        'comp.col_feat': 'Caractéristique',
        'comp.col_human': 'Trader Humain',
        'comp.r1_feat': 'Disponibilité',
        'comp.r1_human': '4-8 heures/jour',
        'comp.r1_ai': '24/7 non-stop',
        'comp.r2_feat': 'Vitesse d\'Exécution',
        'comp.r2_human': 'Secondes à minutes',
        'comp.r2_ai': 'Millisecondes',
        'comp.r3_feat': 'Émotions',
        'comp.r3_human': 'Peur et avidité',
        'comp.r3_ai': '100% rationnel',
        'comp.r4_feat': 'Analyse de Données',
        'comp.r4_human': 'Graphiques limités',
        'comp.r4_ai': 'Millions de signaux',
        'comp.r5_feat': 'Constance',
        'comp.r5_human': 'Variable',
        'comp.r5_ai': 'Toujours discipliné',
        'comp.r6_feat': 'Apprentissage',
        'comp.r6_human': 'Lent et biaisé',
        'comp.r6_ai': 'ML Continu',
        'comp.cta': 'Passez au Trading IA <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
        // Testimonials
        'test.tag': 'Témoignages',
        'test.title': 'Ce que Disent Nos <span class="gradient-text">Utilisateurs</span>',
        'test.t1_text': '« J\'ai essayé le trading manuel pendant 2 ans sans succès. Depuis que j\'utilise ForexBot AI, mes résultats sont incomparables. L\'IA détecte des opportunités que je n\'aurais jamais vues. »',
        'test.t1_role': 'Investisseur depuis 8 mois',
        'test.t2_text': '« Le trading 24/7 change tout. Pendant que je dors, l\'IA continue de travailler. Les résultats sont impressionnants et la gestion des risques est excellente. Meilleur investissement que j\'ai fait. »',
        'test.t2_role': 'Investisseur depuis 1 an',
        'test.t3_text': '« En tant que développeur, j\'étais sceptique. Mais la technologie derrière ForexBot AI est solide. L\'apprentissage continu produit des résultats de plus en plus précis au fil du temps. »',
        'test.t3_role': 'Investisseur depuis 6 mois',
        'test.cta': 'Rejoignez des Milliers de Traders Satisfaits <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
        // Pricing
        'price.tag': 'Tarifs',
        'price.title': 'Des Tarifs Simples et <span class="gradient-text">Transparents</span>',
        'price.desc': 'Commencez dès maintenant. Évoluez quand vous êtes prêt.',
        'price.s_name': 'Starter',
        'price.s_desc': 'Parfait pour débuter le trading IA',
        'price.s_f1': 'Trading IA en direct',
        'price.s_f2': '10 paires crypto',
        'price.s_f3': 'Stratégie IA basique',
        'price.s_f4': 'Support par email',
        'price.s_f5': 'Tableau de bord en temps réel',
        'price.s_btn': 'Commencer',
        'price.badge': 'Le Plus Populaire',
        'price.p_name': 'Pro',
        'price.p_desc': 'Pour les traders sérieux',
        'price.p_f1': 'Tout du pack Starter',
        'price.p_f2': '50+ paires crypto',
        'price.p_f3': 'Stratégies IA avancées',
        'price.p_f4': 'Support prioritaire 24/7',
        'price.p_f5': 'Analyses avancées et alertes',
        'price.p_btn': 'Commencer Maintenant',
        'price.e_name': 'Elite',
        'price.e_desc': 'Performance maximale',
        'price.e_f1': 'Tout du pack Pro',
        'price.e_f2': 'Toutes les 100+ paires crypto',
        'price.e_f3': 'Stratégies IA personnalisées',
        'price.e_f4': 'Gestionnaire de compte dédié',
        'price.e_f5': 'Accès API et signaux VIP',
        'price.e_btn': 'Commencer',
        // CTA 2
        'cta2.title': 'Prêt à Laisser l\'IA <span class="gradient-text">Faire Croître Votre Capital ?</span>',
        'cta2.desc': 'Rejoignez la révolution. Notre agent IA est le futur du trading crypto — et le futur commence maintenant.',
        'cta2.btn': 'Créer un Compte <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
        'cta2.guarantee': 'Garantie satisfait ou remboursé 30 jours',
        // Signup
        'signup.title': 'Prêt à Laisser l\'IA<br><span class="gradient-text">Trader pour Vous ?</span>',
        'signup.desc': 'Rejoignez des milliers d\'investisseurs qui font confiance à notre agent IA. Ouvrez votre compte et commencez à trader en quelques minutes.',
        'signup.b1': 'Inscription rapide, sans engagement',
        'signup.b2': 'Support disponible 24/7',
        'signup.b3': 'Support 24/7 de notre équipe',
        'signup.b4': 'Retirez vos fonds à tout moment',
        'signup.b5': 'Garantie satisfait ou remboursé 30 jours',
        'signup.form_title': 'Ouvrez Votre Compte',
        'signup.form_sub': 'Commencez votre aventure de trading IA aujourd\'hui',
        'signup.min_invest': 'Investissement minimum : <strong>250 €</strong>',
        'signup.lbl_first': 'Prénom',
        'signup.lbl_last': 'Nom',
        'signup.lbl_email': 'Adresse Email',
        'signup.lbl_phone': 'Numéro de Téléphone',
        'signup.lbl_exp': 'Expérience de Trading',
        'signup.opt_default': 'Sélectionnez votre niveau',
        'signup.opt_beginner': 'Débutant — Je commence',
        'signup.opt_inter': 'Intermédiaire — Quelques trades',
        'signup.opt_adv': 'Avancé — Trader régulier',
        'signup.opt_expert': 'Expert — Trader professionnel',
        'signup.terms': 'J\'accepte les <a href="terms.html" target="_blank">Conditions d\'Utilisation</a> et la <a href="privacy.html" target="_blank">Politique de Confidentialité</a>',
        'signup.submit': 'Créer Mon Compte <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
        'signup.disclaimer': 'Inscription en quelques minutes seulement',
        'signup.ph_first': 'Votre prénom',
        'signup.ph_last': 'Votre nom',
        'signup.ph_email': 'vous@exemple.com',
        'signup.ph_phone': '+33 6 00 00 00 00',
        // FAQ
        'faq.title': 'Questions <span class="gradient-text">Fréquentes</span>',
        'faq.q1': 'Qu\'est-ce qu\'un agent de trading IA ?',
        'faq.a1': 'Un agent de trading IA est un programme d\'intelligence artificielle autonome qui analyse les marchés financiers, identifie les opportunités de trading et exécute automatiquement des ordres d\'achat et de vente. Il fonctionne 24h/24 et 7j/7 sans intervention humaine, en utilisant des algorithmes avancés de machine learning.',
        'faq.q2': 'Mon capital est-il en sécurité ?',
        'faq.a2': 'Oui. Vos fonds sont stockés sur des plateformes d\'échange réglementées et sécurisées. L\'agent IA n\'a accès qu\'aux fonctions de trading, jamais aux retraits. De plus, nos algorithmes de gestion des risques incluent des stop-loss automatiques pour limiter les pertes potentielles.',
        'faq.q3': 'Quel est le montant minimum pour commencer ?',
        'faq.a3': 'Le dépôt minimum est de seulement 250 €. Aucun engagement et vous pouvez retirer vos fonds à tout moment.',
        'faq.q4': 'Ai-je besoin d\'expérience en trading ?',
        'faq.a4': 'Absolument pas. C\'est la beauté d\'un agent IA — il fait tout le travail d\'analyse et de trading pour vous. Notre interface est conçue pour être intuitive, et notre équipe de support est disponible 24/7 pour vous aider à démarrer.',
        'faq.q5': 'Comment l\'IA prend-elle ses décisions de trading ?',
        'faq.a5': 'Notre IA utilise une combinaison d\'analyse technique avancée, d\'analyse de sentiment du marché (réseaux sociaux, actualités), de modèles prédictifs basés sur le deep learning et d\'analyses de données on-chain de la blockchain. Elle traite des millions de points de données par seconde pour identifier les meilleures opportunités.',
        'faq.cta_text': 'Encore des questions ?',
        'faq.cta_btn': 'Contactez Notre Équipe <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
        // Sticky CTA
        'sticky.text': 'Commencez le trading IA aujourd\'hui',
        'sticky.btn': 'Ouvrir un Compte <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
        // Footer
        'footer.desc': 'Le futur du trading est autonome. Notre agent IA nouvelle génération trade les cryptos avec une qualité et une précision extrêmes.',
        'footer.cta': 'Commencer Maintenant →',
        'footer.product': 'Produit',
        'footer.f_feat': 'Fonctionnalités',
        'footer.f_how': 'Comment ça Marche',
        'footer.f_perf': 'Performance',
        'footer.f_price': 'Tarifs',
        'footer.f_account': 'Ouvrir un Compte',
        'footer.resources': 'Ressources',
        'footer.help': 'Centre d\'Aide',
        'footer.blog': 'Blog',
        'footer.api': 'Documentation API',
        'footer.status': 'État du Système',
        'footer.legal': 'Légal',
        'footer.terms': 'Conditions d\'Utilisation',
        'footer.privacy': 'Politique de Confidentialité',
        'footer.risk': 'Avertissement sur les Risques',
        'footer.notices': 'Mentions Légales',
        'footer.copyright': '© 2026 ForexBot AI. Tous droits réservés.',
        'footer.warning': 'Avertissement : Le trading de cryptomonnaies comporte des risques significatifs. Les performances passées ne garantissent pas les résultats futurs. N\'investissez que ce que vous pouvez vous permettre de perdre.',
        // Modal
        'modal.title': 'Inscription Réussie !',
        'modal.desc': 'Bienvenue sur ForexBot AI. Vérifiez votre email pour activer votre compte et commencer à trader avec notre agent IA.',
        'modal.btn': 'Compris',
    }
};

let currentLang = 'fr';

function setLanguage(lang) {
    currentLang = lang;
    const t = translations[lang];
    document.documentElement.lang = lang;
    document.title = lang === 'fr' ? 'ForexBot AI — Agent de Trading IA Autonome' : 'ForexBot AI — Autonomous AI Trading Agent';

    // Update text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key] !== undefined) el.textContent = t[key];
    });

    // Update HTML content (elements with child markup)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        if (t[key] !== undefined) el.innerHTML = t[key];
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        const key = el.getAttribute('data-i18n-ph');
        if (t[key] !== undefined) el.placeholder = t[key];
    });

    // Update toggle buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
}

document.addEventListener('DOMContentLoaded', () => {

    // --- Language toggle ---
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setLanguage(btn.dataset.lang);
        });
    });

    // --- Navbar scroll effect ---
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    // --- Mobile menu toggle ---
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');

    mobileToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
        });
    });

    // --- Smooth scroll for anchor links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // --- Animated counters ---
    const counters = document.querySelectorAll('.hero-stat-value[data-count]');
    let countersAnimated = false;

    function animateCounters() {
        if (countersAnimated) return;
        countersAnimated = true;

        counters.forEach(counter => {
            const target = parseFloat(counter.dataset.count);
            const duration = 2000;
            const startTime = performance.now();
            const isDecimal = target % 1 !== 0;

            function update(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = eased * target;

                if (isDecimal) {
                    counter.textContent = current.toFixed(1);
                } else if (target >= 1000) {
                    counter.textContent = Math.floor(current).toLocaleString('en-US');
                } else {
                    counter.textContent = Math.floor(current);
                }

                if (progress < 1) {
                    requestAnimationFrame(update);
                }
            }

            requestAnimationFrame(update);
        });
    }

    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) animateCounters();
        });
    }, { threshold: 0.3 });

    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) heroObserver.observe(heroStats);

    // --- Performance bars animation ---
    const perfBars = document.querySelectorAll('.perf-bar-fill');
    const perfObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('animated');
        });
    }, { threshold: 0.5 });

    perfBars.forEach(bar => perfObserver.observe(bar));

    // --- Scroll reveal animations ---
    const revealElements = document.querySelectorAll(
        '.feature-card, .step-card, .perf-card, .testimonial-card, .section-header, .signup-info, .signup-form-wrapper, .faq-item, .advantage-content, .advantage-visual, .pricing-card, .comparison-table, .cta-banner-inner, .cta-banner-large-inner'
    );

    revealElements.forEach(el => el.classList.add('reveal'));

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 80);
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));

    // --- FAQ accordion ---
    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.parentElement;
            const isActive = item.classList.contains('active');
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
            if (!isActive) item.classList.add('active');
        });
    });

    // --- Signup form handling ---
    const signupForm = document.getElementById('signupForm');
    const successModal = document.getElementById('successModal');

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(signupForm);
        const data = Object.fromEntries(formData);

        if (!data.firstName || !data.lastName || !data.email || !data.experience) return;
        if (!document.getElementById('terms').checked) return;

        // ====== CONFIGURATION — Fill these 3 values ======
        const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbxFSjheiMjGA9tYY5vA9M7j8r-yhb1BYl42BI4Epqk3v4cE_8ud-J8BENVl2DWiwN95Ug/exec';
        const TELEGRAM_BOT_TOKEN = 'PASTE_YOUR_BOT_TOKEN_HERE';
        const TELEGRAM_CHAT_ID = 'PASTE_YOUR_CHAT_ID_HERE';
        // ===================================================

        const leadData = {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone || '',
            experience: data.experience,
            date: new Date().toLocaleString('fr-FR'),
            source: window.location.hostname
        };

        // 1. Send to Google Sheets via GET (most reliable, no CORS issues)
        try {
            const params = new URLSearchParams(leadData).toString();
            const img = new Image();
            img.src = GOOGLE_SHEET_URL + '?' + params;
        } catch (err) {
            console.error('Google Sheets error:', err);
        }

        // 2. Send to Telegram
        try {
            const msg = `🔔 *Nouveau Lead ForexBot AI*\n\n` +
                `👤 *Nom :* ${leadData.firstName} ${leadData.lastName}\n` +
                `📧 *Email :* ${leadData.email}\n` +
                `📱 *Tél :* ${leadData.phone}\n` +
                `📊 *Niveau :* ${leadData.experience}\n` +
                `📅 *Date :* ${leadData.date}`;
            await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: msg,
                    parse_mode: 'Markdown'
                })
            });
        } catch (err) {
            console.error('Telegram error:', err);
        }

        successModal.classList.add('active');
        signupForm.reset();
    });

    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) successModal.classList.remove('active');
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') successModal.classList.remove('active');
    });

    // --- Live BTC price from CoinGecko API ---
    const priceEl = document.querySelector('.price-value');
    if (priceEl) {
        async function fetchBtcPrice() {
            try {
                const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
                const data = await res.json();
                if (data.bitcoin && data.bitcoin.usd) {
                    priceEl.textContent = '$' + data.bitcoin.usd.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    });
                }
            } catch (e) {
                // Silently keep last displayed price on error
            }
        }
        fetchBtcPrice();
        setInterval(fetchBtcPrice, 30000); // Refresh every 30s
    }

    // --- Sticky CTA bar ---
    const stickyCta = document.getElementById('stickyCta');
    const signupSection = document.getElementById('signup');

    if (stickyCta && signupSection) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            const signupTop = signupSection.getBoundingClientRect().top + window.scrollY;

            // Show after scrolling past hero, hide when near signup form
            if (scrollY > 600 && scrollY < signupTop - 400) {
                stickyCta.classList.add('visible');
            } else {
                stickyCta.classList.remove('visible');
            }
        });
    }
});
