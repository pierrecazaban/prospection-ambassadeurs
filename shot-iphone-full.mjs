import { chromium } from 'playwright';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await browser.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' });
const page = await ctx.newPage();
await page.goto('http://localhost:3111/', { waitUntil: 'networkidle' });

await page.screenshot({ path: 'photos/iphone-page-complete.png', fullPage: true });
await browser.close();
