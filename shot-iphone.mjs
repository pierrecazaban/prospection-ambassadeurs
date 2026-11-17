import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = await browser.contexts()[0].newPage();
let i = 0;
for (const [w, url] of [[390, '/'], [375, '/'], [320, '/'], [390, '/call'], [375, '/ecole']]) {
  await page.setViewportSize({ width: w, height: 120 });
  await page.goto('http://localhost:3111' + url, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `photos/iphone-${i++}.png` });
}
await page.close(); process.exit(0);
