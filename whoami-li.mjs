import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const ctx = browser.contexts()[0];
const page = ctx.pages().find((p) => p.url().includes('linkedin.com')) ?? await ctx.newPage();
await page.goto('https://www.linkedin.com/in/me/', { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(5000);
console.log('URL:', page.url());
console.log((await page.evaluate(() => document.querySelector('main')?.innerText || document.body.innerText)).slice(0, 300));
await page.screenshot({ path: 'photos/whoami.png', clip: { x: 0, y: 0, width: 1100, height: 500 } });
process.exit(0);
