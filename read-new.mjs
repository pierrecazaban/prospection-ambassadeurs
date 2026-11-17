import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = browser.contexts()[0].pages().find((p) => p.url().includes('linkedin.com'));
await page.goto('https://www.linkedin.com/in/pierre-cazaban/details/experience/', { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(5000);
console.log((await page.evaluate(() => document.querySelector('main')?.innerText || '')).slice(0, 700));
await page.goto('https://www.linkedin.com/in/pierre-cazaban-08a839382/', { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(4500);
console.log('---- ANCIEN ----\n' + (await page.evaluate(() => document.querySelector('main')?.innerText || '')).slice(0, 900));
process.exit(0);
