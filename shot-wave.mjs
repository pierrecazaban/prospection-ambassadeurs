import { chromium } from 'playwright';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await browser.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
await page.goto('http://localhost:3111/', { waitUntil: 'networkidle' });
await page.screenshot({ path: 'photos/wave-top.png', clip: { x: 0, y: 0, width: 393, height: 300 } });
await page.evaluate(() => window.scrollTo(0, 900)); await page.waitForTimeout(300);
await page.screenshot({ path: 'photos/wave-scroll.png', clip: { x: 0, y: 0, width: 393, height: 200 } });
await browser.close();
