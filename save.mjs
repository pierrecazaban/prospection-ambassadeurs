// Usage: node save.mjs <fragment d'URL de l'onglet> — clique sur Enregistrer dans le formulaire ouvert
import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = browser.contexts()[0].pages().find((p) => p.url().includes(process.argv[2]));
const btn = page.getByRole('button', { name: /^Enregistrer$/ }).last();
await btn.click();
await page.waitForTimeout(4000);
console.log('URL après :', page.url());
const err = await page.evaluate(() => [...document.querySelectorAll('[role=alert], .artdeco-inline-feedback--error')].map(e=>e.innerText.trim()).filter(Boolean));
console.log('erreurs :', err);
process.exit(0);
