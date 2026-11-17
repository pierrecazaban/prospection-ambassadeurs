import { chromium } from 'playwright';
const b = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = await b.contexts()[0].newPage();
await page.goto(process.argv[2], { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(5000);
await page.locator('main button[aria-label="Plus"]').filter({ visible: true }).first().click(); await page.waitForTimeout(1500);
const items = await page.locator('[role=menu] [role=menuitem], [role=menu] div[aria-label], .artdeco-dropdown__content-inner li').filter({ visible: true }).evaluateAll((els) =>
  els.map((x) => '[' + (x.getAttribute('aria-label') || '').slice(0, 90) + '] ' + (x.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 40)));
console.log(items.join('\n'));
await page.keyboard.press('Escape'); await page.close(); process.exit(0);
