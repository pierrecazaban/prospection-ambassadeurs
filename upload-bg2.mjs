import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = browser.contexts()[0].pages().find((p) => p.url().includes('/in/pierre-cazaban/'));
const dlg = () => page.evaluate(() => [...document.querySelectorAll('[role=dialog] button, dialog button')].filter(b=>b.offsetParent).map(b => (b.innerText.trim()||b.getAttribute('aria-label')||'').replace(/\s+/g,' ').slice(0,60)).filter(Boolean));
const [fc] = await Promise.all([
  page.waitForEvent('filechooser', { timeout: 10000 }),
  page.getByText('Ajouter une image de couverture', { exact: true }).first().click(),
]);
await fc.setFiles('brand/banniere.png');
await page.waitForTimeout(5000);
console.log('après import :', await dlg());
process.exit(0);
