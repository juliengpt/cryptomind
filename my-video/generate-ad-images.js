const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const IMAGES_DIR = path.join(__dirname, 'public', 'ad-assets');

// Ensure output dir exists
if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

const IMAGE_PROMPTS = [
    {
        name: 'scene1-bg',
        prompt: `Generate an image: Ultra dark futuristic background with subtle glowing grid lines and floating data particles. Deep navy black (#0A0E1A) base color with very faint cyan and purple light streaks. Abstract digital void atmosphere. Minimal, premium, cinematic. No text, no objects, just atmosphere. Vertical 4:5 ratio (1080x1350).`
    },
    {
        name: 'scene2-medical',
        prompt: `Generate an image: Ultra-realistic 3D render of an AI-powered medical brain scan analysis. A holographic MRI brain scan floating in a dark environment, with AI detection markers (glowing cyan rectangles highlighting detected areas), data overlays, neural pathways lit up in neon blue. Dark background (#0A0E1A). Photorealistic, cinematic lighting, high-end medical tech aesthetic. No text. Vertical 4:5 ratio.`
    },
    {
        name: 'scene2-logistics',
        prompt: `Generate an image: Ultra-realistic 3D render of an AI-powered global logistics network. A holographic world map with glowing optimized delivery routes in neon green and cyan, connected warehouse nodes, real-time tracking dots moving along paths. Dark background (#0A0E1A). Futuristic command center feel, photorealistic, premium tech aesthetic. No text. Vertical 4:5 ratio.`
    },
    {
        name: 'scene2-science',
        prompt: `Generate an image: Ultra-realistic 3D render of an AI analyzing a complex molecular structure. A large glowing molecule/protein structure floating and rotating in dark space, with AI analysis beams scanning it, data points floating around. Neon purple and blue color scheme on dark background (#0A0E1A). Photorealistic, cinematic, scientific visualization aesthetic. No text. Vertical 4:5 ratio.`
    },
    {
        name: 'scene2-industry',
        prompt: `Generate an image: Ultra-realistic 3D render of a futuristic AI-powered smart factory production line. Robotic arms with glowing joints working in sync, holographic quality control overlays, conveyor belts with products, AI monitoring interfaces floating above. Dark environment with orange and cyan neon accents on dark background (#0A0E1A). Photorealistic, Industry 4.0 aesthetic. No text. Vertical 4:5 ratio.`
    },
    {
        name: 'scene3-neural',
        prompt: `Generate an image: Ultra-realistic 3D render of a massive artificial neural network visualization. Thousands of interconnected glowing nodes forming a brain-like structure, with data pulses traveling through synaptic connections in cyan and purple light. Deep dark space background (#0A0E1A). Volumetric lighting, depth of field, cinematic. The feeling of immense computational power. No text. Vertical 4:5 ratio.`
    },
    {
        name: 'scene4-data',
        prompt: `Generate an image: Ultra-realistic 3D render of abstract data visualization showing growth and progress. Flowing streams of glowing data particles rising upward in organic curves, forming an abstract ascending shape (NOT a financial chart, NOT stock market). Holographic data nodes, light trails. Color scheme: cyan and purple gradients on deep dark background (#0A0E1A). Cinematic, premium, abstract technology art. No text, no currency symbols, no dollar signs. Vertical 4:5 ratio.`
    },
    {
        name: 'scene5-laptop',
        prompt: `Generate an image: Ultra-realistic 3D render of a premium MacBook Pro laptop on a dark sleek desk, screen glowing with a sophisticated AI analytics dashboard. The dashboard shows abstract data visualizations, flowing graphs, and AI status indicators in cyan and purple. Soft ambient glow from the screen illuminating the dark environment. Cinematic product photography style, premium tech aesthetic. Dark background (#0A0E1A). No readable text on screen, no financial data, no stock charts. Vertical 4:5 ratio.`
    },
    {
        name: 'scene6-bg',
        prompt: `Generate an image: Ultra-premium dark background for a tech brand final screen. Subtle radial gradient from dark center, with very faint geometric patterns (hexagons or circuits) barely visible. A soft glow of cyan light in the center. Minimal, luxurious, Apple-like dark aesthetic. Deep black (#0A0E1A) base. No objects, no text, just a premium dark backdrop. Vertical 4:5 ratio.`
    }
];

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForLogin(page) {
    console.log('Waiting for ChatGPT to be ready (log in if needed)...');
    while (true) {
        try {
            const editor = page.locator('#prompt-textarea, [contenteditable="true"][data-placeholder]');
            const isVisible = await editor.first().isVisible({ timeout: 3000 });
            if (isVisible) {
                console.log('ChatGPT is ready!');
                return;
            }
        } catch {}
        await sleep(3000);
    }
}

async function downloadImage(page, filePath, timeout = 180000) {
    const startTime = Date.now();
    console.log('   Waiting for image generation (can take up to 3 minutes)...');

    while (Date.now() - startTime < timeout) {
        try {
            const images = page.locator('[data-message-author-role="assistant"] img[src], .agent-turn img[src], .markdown img[src]');
            const count = await images.count();

            if (count > 0) {
                const lastImg = images.nth(count - 1);
                const src = await lastImg.getAttribute('src');

                if (src && (src.includes('oaidalleapi') || src.includes('openai') || src.includes('blob:') || src.startsWith('https://'))) {
                    console.log('   Image detected! Downloading...');
                    await sleep(3000);

                    if (src.startsWith('blob:')) {
                        await lastImg.screenshot({ path: filePath });
                    } else {
                        try {
                            const response = await page.request.get(src);
                            const buffer = await response.body();
                            fs.writeFileSync(filePath, buffer);
                        } catch {
                            await lastImg.screenshot({ path: filePath });
                        }
                    }

                    console.log(`   Saved: ${path.basename(filePath)}`);
                    return true;
                }
            }
        } catch {}
        await sleep(5000);
    }

    console.log('   Timeout waiting for image. Skipping...');
    return false;
}

async function main() {
    console.log('===========================================');
    console.log('  Facebook Ad — AI Image Generator');
    console.log('  Generating 9 ultra-realistic scenes');
    console.log('===========================================\n');

    const userDataDir = path.join(__dirname, '..', '.browser-data');
    const context = await chromium.launchPersistentContext(userDataDir, {
        headless: false,
        viewport: { width: 1400, height: 900 },
    });

    const page = context.pages()[0] || await context.newPage();

    console.log('Opening ChatGPT...');
    await page.goto('https://chatgpt.com', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(3000);

    await waitForLogin(page);
    await sleep(2000);

    let successCount = 0;

    for (let i = 0; i < IMAGE_PROMPTS.length; i++) {
        const img = IMAGE_PROMPTS[i];
        const filePath = path.join(IMAGES_DIR, `${img.name}.png`);

        if (fs.existsSync(filePath)) {
            console.log(`\n[${i + 1}/${IMAGE_PROMPTS.length}] ${img.name} already exists, skipping.`);
            successCount++;
            continue;
        }

        console.log(`\n[${i + 1}/${IMAGE_PROMPTS.length}] Generating: ${img.name}`);

        if (i > 0) {
            try {
                const newChat = page.locator('[data-testid="create-new-chat-button"], a[href="/"]').first();
                await newChat.click({ timeout: 5000 });
                await sleep(3000);
            } catch {
                await page.goto('https://chatgpt.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
                await sleep(4000);
            }
        }

        try {
            const editor = page.locator('#prompt-textarea');
            await editor.waitFor({ state: 'visible', timeout: 15000 });
            await editor.click();
            await sleep(500);

            await editor.pressSequentially(img.prompt, { delay: 5 });
            await sleep(1000);

            const sendBtn = page.locator('[data-testid="send-button"]').first();
            await sendBtn.click({ timeout: 5000 });
            console.log('   Prompt sent!');

            const success = await downloadImage(page, filePath, 180000);
            if (success) successCount++;

        } catch (e) {
            console.log(`   Error: ${e.message}`);
        }

        await sleep(3000);
    }

    console.log('\n===========================================');
    console.log(`  Done! ${successCount}/${IMAGE_PROMPTS.length} images generated.`);
    console.log(`  Saved to: ${IMAGES_DIR}`);
    console.log('===========================================');

    console.log('\nBrowser will close in 15 seconds...');
    await sleep(15000);
    await context.close();
}

main().catch(err => {
    console.error('Fatal error:', err.message);
    process.exit(1);
});
