import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = browser.contexts()[0].pages().find((p) => p.url().includes('/in/pierre-cazaban'));
const clicker = page.getByText('Modifier la photo', { exact: true }).first();
let fc = await Promise.all([page.waitForEvent('filechooser', { timeout: 6000 }), clicker.click()]).then(([f]) => f).catch(() => null);
if (!fc) {
  await page.waitForTimeout(2000);
  [fc] = await Promise.all([page.waitForEvent('filechooser', { timeout: 10000 }), page.getByText('Charger une seule photo').first().click()]);
}
await fc.setFiles('brand/banniere-sobre.png');
await page.waitForTimeout(5000);
await page.getByRole('button', { name: 'Enregistrer les modifications' }).last().click();
await page.waitForTimeout(4000);
const save = page.getByRole('button', { name: /^Enregistrer$/ });
if (await save.count() && await save.last().isEnabled()) { await save.last().click(); await page.waitForTimeout(4000); }
await page.reload({ waitUntil: 'domcontentloaded' }); await page.waitForTimeout(5000);
await page.screenshot({ path: 'photos/snap7.png', clip: { x: 0, y: 0, width: 1100, height: 400 } });
process.exit(0);
