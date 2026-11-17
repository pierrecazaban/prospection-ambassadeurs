import { chromium } from 'playwright';
const b = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = await b.contexts()[0].newPage();
await page.goto(process.argv[2], { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(5000);
const items = await page.evaluate(() => [...document.querySelectorAll('main button, main a')].filter((x) => x.offsetParent).slice(0, 10)
  .map((x) => x.tagName + ' [' + (x.getAttribute('aria-label') || '').slice(0, 80) + '] ' + (x.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 30)));
console.log(items.join('\n'));
await page.close(); process.exit(0);
