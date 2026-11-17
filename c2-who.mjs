import { chromium } from 'playwright';
const b = await chromium.connectOverCDP('http://127.0.0.1:9334');
const pages = b.contexts().flatMap((c) => c.pages());
console.log('onglets:', pages.map((p) => p.url()));
const p = pages.find((x) => x.url().includes('linkedin.com')) ?? pages[0];
if (p) {
  await p.goto('https://www.linkedin.com/in/me/', { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(5000);
  console.log('profil:', p.url());
  console.log((await p.evaluate(() => (document.querySelector('main')?.innerText || '').slice(0, 300))));
}
process.exit(0);
