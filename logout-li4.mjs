import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const ctx = browser.contexts()[0];
await ctx.clearCookies({ domain: /linkedin\.com$/ });
const page = ctx.pages().find((p) => p.url().includes('linkedin.com')) ?? await ctx.newPage();
await page.goto('https://www.linkedin.com/login', { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(2500);
await page.bringToFront();
console.log(page.url());
process.exit(0);
