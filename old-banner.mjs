import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = browser.contexts()[0].pages().find((p) => p.url().includes('linkedin.com'));
await page.goto('https://www.linkedin.com/in/pierre-cazaban-08a839382/', { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(5000);
await page.locator('main [aria-label="Modifier l’image d’arrière-plan"]').first().click(); await page.waitForTimeout(2000);
const menu = page.getByText('Changer d’image de couverture'); if (await menu.count()) { await menu.first().click(); await page.waitForTimeout(2500); }
let fc = await Promise.all([page.waitForEvent('filechooser', { timeout: 6000 }), page.getByText('Modifier la photo', { exact: true }).first().click()]).then(([f]) => f).catch(() => null);
if (!fc) fc = await Promise.all([page.waitForEvent('filechooser', { timeout: 8000 }), page.getByText(/Charger une seule photo|Ajouter une image de couverture/).first().click()]).then(([f]) => f).catch(() => null);
if (!fc) { await page.screenshot({ path: 'photos/old-banner-fail.png' }); console.log('pas de sélecteur'); process.exit(1); }
await fc.setFiles('brand/banniere-sobre.png'); await page.waitForTimeout(5000);
await page.getByRole('button', { name: 'Enregistrer les modifications' }).last().click(); await page.waitForTimeout(4000);
const save = page.getByRole('button', { name: /^Enregistrer$/ });
if (await save.count() && await save.last().isEnabled()) { await save.last().click(); await page.waitForTimeout(4000); }
console.log('bannière ok');
process.exit(0);
