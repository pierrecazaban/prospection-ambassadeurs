import { chromium } from 'playwright';
import fs from 'node:fs';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = browser.contexts()[0].pages().find((p) => p.url().includes('/search/results/'));
await page.goto(process.argv[2], { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(5000);
console.log((await page.evaluate(() => document.querySelector('main')?.innerText || '')).slice(0, 600));
const imgs = await page.evaluate(() => [...document.querySelectorAll('main img')].map(i => ({src:i.src, alt:i.alt, w:i.naturalWidth})).filter(i => /profile-displayphoto/.test(i.src)));
console.log(imgs);
if (imgs[0]) {
  const best = imgs.sort((a,b)=>b.w-a.w)[0].src;
  const res = await page.request.get(best);
  fs.writeFileSync(process.argv[3], await res.body());
  console.log('sauvé', process.argv[3]);
}
process.exit(0);
