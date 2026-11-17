import { chromium } from 'playwright';
const b = await chromium.connectOverCDP('http://127.0.0.1:9334');
const page = await b.contexts()[0].newPage();
await page.goto(process.argv[2], { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(5000);
const btns = await page.evaluate(() => [...document.querySelectorAll('main button, main a')].filter((x) => x.offsetParent).slice(0, 9).map((x) => '[' + (x.getAttribute('aria-label') || '').slice(0, 70) + '] ' + (x.innerText || '').trim().slice(0, 25)));
console.log('PROFIL:\n' + btns.join('\n'));
const more = page.locator('main button[aria-label="Plus"]').filter({ visible: true }).first();
if (await more.count()) { await more.click(); await page.waitForTimeout(1200);
  console.log('MENU PLUS:', (await page.locator('[role=menu] [aria-label]').filter({ visible: true }).evaluateAll((e) => e.map((x) => x.getAttribute('aria-label').slice(0, 70)))).join(' | '));
  await page.keyboard.press('Escape'); }
await page.close(); process.exit(0);
