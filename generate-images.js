const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const IMAGES_DIR = path.join(__dirname, 'images');

const IMAGE_PROMPTS = [
    {
        name: 'hero-ai-trading',
        prompt: `Generate an image: A futuristic, dark-themed digital illustration for a crypto AI trading landing page hero section. Show a glowing AI brain or neural network in the center connected to floating cryptocurrency symbols (Bitcoin, Ethereum, Solana). Include holographic trading charts going upward, data streams, and a deep dark blue/purple background with subtle grid lines. Style: clean, modern, premium fintech aesthetic. No text. 16:9 aspect ratio.`
    },
    {
        name: 'ai-agent-robot',
        prompt: `Generate an image: A sleek, futuristic AI robot or digital assistant avatar for a crypto trading platform. The robot should look sophisticated and trustworthy, with a glowing indigo/cyan color scheme. It should be analyzing holographic trading data and charts floating around it. Dark background. Style: premium, minimal, modern tech. No text. Square format.`
    },
    {
        name: 'trading-dashboard',
        prompt: `Generate an image: A realistic mockup of a premium crypto trading dashboard interface on a dark background. Show multiple charts with green upward trends, portfolio balance showing profits, live trade feed, and AI analysis indicators. Color scheme: dark navy/black background with indigo and cyan accents, green for profits. Style: modern UI/UX design, glassmorphism effects. No readable text. 16:9 ratio.`
    },
    {
        name: 'crypto-network',
        prompt: `Generate an image: An abstract futuristic illustration of a blockchain and crypto network. Show interconnected glowing nodes forming a neural network pattern, with cryptocurrency coins (Bitcoin, Ethereum) floating in a digital space. Deep dark background with indigo and cyan light effects, particle effects, and energy streams. Style: abstract, premium, high-tech. No text. 16:9 ratio.`
    },
    {
        name: 'security-shield',
        prompt: `Generate an image: A futuristic digital security shield illustration for a fintech platform. Show a glowing translucent shield protecting crypto assets, with lock symbols, encryption patterns, and blockchain elements. Dark background with indigo and green glowing accents. Style: premium, trustworthy, modern tech. No text. Square format.`
    }
];

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForLogin(page) {
    console.log('Waiting for ChatGPT to be ready (log in if needed)...');
    // Wait until we see the chat input, meaning user is logged in
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

async function downloadImage(page, filePath, timeout = 150000) {
    const startTime = Date.now();
    console.log('   Waiting for image generation (this can take up to 2 minutes)...');

    while (Date.now() - startTime < timeout) {
        try {
            // Look for any image in the assistant's response
            const images = page.locator('[data-message-author-role="assistant"] img[src], .agent-turn img[src], .markdown img[src]');
            const count = await images.count();

            if (count > 0) {
                // Get the last image
                const lastImg = images.nth(count - 1);
                const src = await lastImg.getAttribute('src');

                if (src && (src.includes('oaidalleapi') || src.includes('openai') || src.includes('blob:') || src.startsWith('https://'))) {
                    console.log('   Image detected! Downloading...');
                    await sleep(3000); // Wait a bit for full render

                    if (src.startsWith('blob:')) {
                        // For blob URLs, take a screenshot of the image element
                        await lastImg.screenshot({ path: filePath });
                    } else {
                        // Download via HTTP
                        try {
                            const response = await page.request.get(src);
                            const buffer = await response.body();
                            fs.writeFileSync(filePath, buffer);
                        } catch {
                            // Fallback: screenshot the image
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
    console.log('  CryptoMind AI — Image Generator');
    console.log('  Using ChatGPT via Playwright');
    console.log('===========================================\n');

    const userDataDir = path.join(__dirname, '.browser-data');
    const context = await chromium.launchPersistentContext(userDataDir, {
        headless: false,
        viewport: { width: 1400, height: 900 },
    });

    const page = context.pages()[0] || await context.newPage();

    console.log('Opening ChatGPT...');
    await page.goto('https://chatgpt.com', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(3000);

    // Wait for user to be logged in
    await waitForLogin(page);
    await sleep(2000);

    let successCount = 0;

    for (let i = 0; i < IMAGE_PROMPTS.length; i++) {
        const img = IMAGE_PROMPTS[i];
        const filePath = path.join(IMAGES_DIR, `${img.name}.png`);

        // Skip if already exists
        if (fs.existsSync(filePath)) {
            console.log(`\n[${i + 1}/${IMAGE_PROMPTS.length}] ${img.name} already exists, skipping.`);
            successCount++;
            continue;
        }

        console.log(`\n[${i + 1}/${IMAGE_PROMPTS.length}] Generating: ${img.name}`);

        // Start new chat for each image
        if (i > 0) {
            try {
                // Try clicking new chat button
                const newChat = page.locator('[data-testid="create-new-chat-button"], a[href="/"]').first();
                await newChat.click({ timeout: 5000 });
                await sleep(3000);
            } catch {
                await page.goto('https://chatgpt.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
                await sleep(4000);
            }
        }

        try {
            // Find and fill the prompt textarea
            const editor = page.locator('#prompt-textarea');
            await editor.waitFor({ state: 'visible', timeout: 15000 });
            await editor.click();
            await sleep(500);

            // Use keyboard to type (more reliable than fill for contenteditable)
            await editor.pressSequentially(img.prompt, { delay: 5 });
            await sleep(1000);

            // Send the message
            const sendBtn = page.locator('[data-testid="send-button"]').first();
            await sendBtn.click({ timeout: 5000 });
            console.log('   Prompt sent!');

            // Wait for and download the image
            const success = await downloadImage(page, filePath, 150000);
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

    // Keep browser open for 30 seconds so user can review
    console.log('\nBrowser will close in 30 seconds...');
    await sleep(30000);
    await context.close();
}

main().catch(err => {
    console.error('Fatal error:', err.message);
    process.exit(1);
});
