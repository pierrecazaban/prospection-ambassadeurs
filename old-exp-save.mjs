import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = browser.contexts()[0].pages().find((p) => p.url().includes('linkedin.com'));
await page.getByRole('button', { name: /^Enregistrer$/ }).last().click(); await page.waitForTimeout(5000);
const errs = await page.evaluate(() => [...document.querySelectorAll('[role=alert], .artdeco-inline-feedback--error')].map(e=>e.innerText.trim()).filter(Boolean));
console.log('url', page.url(), 'msgs', errs);
await page.goto('https://www.linkedin.com/in/pierre-cazaban-08a839382/', { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(5000);
await page.screenshot({ path: 'photos/old-profile.png', clip: { x: 0, y: 0, width: 1100, height: 760 } });
process.exit(0);
