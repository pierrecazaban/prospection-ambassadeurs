import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = browser.contexts()[0].pages().find((p) => p.url().includes('linkedin.com'));
const items = await page.evaluate(() => [...document.querySelectorAll('a, button')].filter(e => e.offsetParent && /d(é|e)connexion|sign out|se d(é|e)connecter/i.test(e.innerText)).map(e => e.tagName + ' ' + e.innerText.trim()));
console.log(items);
const el = page.locator('a, button').filter({ hasText: /Déconnexion|Se déconnecter|Sign out/ }).first();
if (await el.count()) { await el.click(); await page.waitForTimeout(5000); }
console.log(page.url());
process.exit(0);
