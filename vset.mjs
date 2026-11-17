import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = browser.contexts()[0].pages().find((p) => p.url().includes('public-profile/settings'));
const name = process.argv[2];
const inp = page.locator('#vanityUrlForm');
if (await inp.getAttribute('readonly') !== null) { await page.getByRole('button', { name: 'Modifiez votre URL personnalisée' }).click(); await page.waitForTimeout(1000); }
await inp.fill(name); await page.waitForTimeout(800);
console.log('boutons :', await page.evaluate(() => [...document.querySelectorAll('button')].filter(b=>b.offsetParent).map(b=>b.innerText.trim()).filter(Boolean)));
await page.getByRole('button', { name: 'Enregistrer' }).first().click();
await page.waitForTimeout(3000);
console.log('message :', await page.evaluate(() => document.querySelector('#vanityNameError')?.innerText || ''));
await page.reload({ waitUntil: 'domcontentloaded' }); await page.waitForTimeout(4000);
console.log('valeur enregistrée :', await page.locator('#vanityUrlForm').inputValue());
process.exit(0);
