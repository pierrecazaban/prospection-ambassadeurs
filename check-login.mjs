import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = browser.contexts()[0].pages().find((p) => p.url().includes('linkedin.com'));
console.log('onglet:', page.url());
if (!/login|checkpoint|uas/.test(page.url())) {
  await page.goto('https://www.linkedin.com/in/me/', { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(4000);
  console.log('profil:', page.url());
}
process.exit(0);
