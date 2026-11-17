import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = browser.contexts()[0].pages().find((p) => p.url().includes('/in/pierre-cazaban/'));
const dlg = () => page.evaluate(() => [...document.querySelectorAll('[role=dialog] button, dialog button, [role=menu] *')].filter(b=>b.offsetParent).map(b => (b.innerText.trim()||b.getAttribute('aria-label')||'').replace(/\s+/g,' ').slice(0,60)).filter(Boolean));
await page.locator('main').locator('[aria-label="Ajouter une image d’arrière-plan"]').first().click();
await page.waitForTimeout(2500);
console.log('1:', await dlg());
const fileInput = page.locator('input[type=file]');
if (await fileInput.count()) await fileInput.first().setInputFiles('brand/banniere.png');
else {
  const [fc] = await Promise.all([page.waitForEvent('filechooser', { timeout: 8000 }), page.getByText(/Charger|Importer|photo d’arrière-plan|image d’arrière-plan/).last().click()]);
  await fc.setFiles('brand/banniere.png');
}
await page.waitForTimeout(5000);
console.log('2:', await dlg());
process.exit(0);
