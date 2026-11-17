import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const ctx = browser.contexts()[0];
const page = ctx.pages().find((p) => p.url().includes('/in/pierre-cazaban')) ?? await ctx.newPage();
await page.goto('https://www.linkedin.com/in/pierre-cazaban/', { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(5000);
const labels = await page.evaluate(() => [...document.querySelectorAll('main button, main a')].filter(b=>b.offsetParent).map(b => (b.getAttribute('aria-label')||'').trim()).filter(l=>/photo/i.test(l)));
console.log(labels);
process.exit(0);
