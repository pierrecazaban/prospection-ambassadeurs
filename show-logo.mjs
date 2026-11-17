import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = await browser.contexts()[0].newPage();
await page.setViewportSize({ width: 1500, height: 900 });
await page.goto('file:///Users/pierrecazaban/Projets/the-ai-certification/brand/propositions/tac/apercu.html');
await page.waitForTimeout(500);
await page.screenshot({ path: 'photos/logo-propositions.png', fullPage: true });
await page.bringToFront();
process.exit(0);
