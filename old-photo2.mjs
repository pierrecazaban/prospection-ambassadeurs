import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = browser.contexts()[0].pages().find((p) => p.url().includes('linkedin.com'));
let fc = await Promise.all([page.waitForEvent('filechooser', { timeout: 6000 }), page.getByText('Mise à jour', { exact: true }).first().click()]).then(([f]) => f).catch(() => null);
if (!fc) { await page.waitForTimeout(1500); fc = await Promise.all([page.waitForEvent('filechooser', { timeout: 8000 }), page.getByText(/Charger une photo|Importer/).first().click()]).then(([f]) => f); }
await fc.setFiles('photos/photo-zoom.jpg'); await page.waitForTimeout(5000);
const btns = await page.evaluate(() => [...document.querySelectorAll('[role=dialog] button, dialog button')].filter(b=>b.offsetParent).map(b => (b.innerText.trim()||b.getAttribute('aria-label')||'').replace(/\s+/g,' ').slice(0,40)).filter(Boolean));
console.log(btns);
const save = page.getByRole('button', { name: /Enregistrer la photo|Enregistrer les modifications|^Enregistrer$|Appliquer/ }).last();
await save.click(); await page.waitForTimeout(5000);
console.log('photo ok');
process.exit(0);
