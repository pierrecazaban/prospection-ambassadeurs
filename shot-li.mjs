import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = await browser.contexts()[0].newPage();
await page.setViewportSize({ width: 1280, height: 900 });
await page.goto('http://localhost:3111/#linkedin', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await page.locator('#linkedin').screenshot({ path: 'photos/li-section.png' });
await page.close(); process.exit(0);
