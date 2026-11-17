import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = browser.contexts()[0].pages().find((p) => p.url().includes('/in/pierre-cazaban/'));
await page.locator('main').getByRole('button', { name: 'Ajouter une photo' }).or(page.locator('main a[aria-label="Ajouter une photo"]')).first().click();
await page.waitForTimeout(3000);
const dlg = () => page.evaluate(() => [...document.querySelectorAll('[role=dialog] button, [role=dialog] label, dialog button')].filter(b=>b.offsetParent).map(b => (b.innerText.trim()||b.getAttribute('aria-label')||'').replace(/\s+/g,' ').slice(0,60)).filter(Boolean));
console.log('dialogue :', await dlg());
const input = page.locator('input[type=file]');
console.log('inputs fichier :', await input.count());
if (await input.count()) {
  await input.first().setInputFiles('photos/ancienne-hd.jpg');
} else {
  const [fc] = await Promise.all([page.waitForEvent('filechooser', { timeout: 8000 }), page.getByText(/Importer|Télécharger une photo|Charger/).first().click()]);
  await fc.setFiles('photos/ancienne-hd.jpg');
}
await page.waitForTimeout(5000);
console.log('après import :', await dlg());
process.exit(0);
