import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = browser.contexts()[0].pages().find((p) => p.url().includes('/search/results/'));
await page.goto('https://www.linkedin.com/in/pierre-cazaban-97632b44b/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(5000);
for (let i=0;i<4;i++){ await page.mouse.wheel(0,1500); await page.waitForTimeout(800); }
console.log((await page.evaluate(() => document.querySelector('main')?.innerText || '')).slice(0, 5000));
process.exit(0);
