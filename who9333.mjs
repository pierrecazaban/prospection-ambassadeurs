import { chromium } from 'playwright';
const b = await chromium.connectOverCDP('http://127.0.0.1:9333');
const p = await b.contexts()[0].newPage();
await p.goto('https://www.linkedin.com/in/me/', { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(4500);
console.log(p.url()); console.log((await p.evaluate(() => (document.querySelector('main')?.innerText || '').slice(0, 120))));
await p.close(); process.exit(0);
