import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = browser.contexts()[0].pages().find((p) => p.url().includes('linkedin.com'));
const [fc] = await Promise.all([page.waitForEvent('filechooser', { timeout: 10000 }), page.getByText('Charger une seule photo').first().click()]);
await fc.setFiles('brand/banniere-sobre.png'); await page.waitForTimeout(5000);
await page.getByRole('button', { name: 'Enregistrer les modifications' }).last().click(); await page.waitForTimeout(4000);
const save = page.getByRole('button', { name: /^Enregistrer$/ });
if (await save.count() && await save.last().isEnabled()) { await save.last().click(); await page.waitForTimeout(4000); }
console.log('bannière ok');
process.exit(0);
