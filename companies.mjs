import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = browser.contexts()[0].pages().find((p) => p.url().includes('linkedin.com'));
await page.goto('https://www.linkedin.com/search/results/companies/?keywords=' + encodeURIComponent(process.argv[2]), { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(4500);
const r = await page.evaluate(() => [...document.querySelectorAll('a[href*="/company/"]')].map(a => a.href.split('?')[0] + ' | ' + (a.closest('li')?.innerText || '').split('\n').filter(Boolean).slice(0,3).join(' / ')));
console.log([...new Set(r)].slice(0,8).join('\n'));
process.exit(0);
