import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = browser.contexts()[0].pages().find((p) => p.url().includes('linkedin.com'));
console.log(page.url());
console.log((await page.evaluate(() => document.querySelector('main')?.innerText || document.body.innerText)).slice(0, 1500));
process.exit(0);
