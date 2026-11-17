import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = browser.contexts()[0].pages().find((p) => p.url().includes('linkedin.com'));
const h = page.locator('[contenteditable="true"][aria-label="Titre du profil"]');
await h.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Backspace');
await page.keyboard.insertText('Co-fondateur chez The AI Certification');
await page.waitForTimeout(800);
// Sector: online education instead of "sports clubs"
const sector = page.locator('[id="_r_m_"]');
await sector.click(); await sector.fill(''); await sector.pressSequentially('E-learning', { delay: 80 }); await page.waitForTimeout(2500);
const opts = await page.evaluate(() => [...document.querySelectorAll('[role=option], [role=listbox] li')].filter(o=>o.offsetParent).map(o=>o.innerText.trim()).slice(0,6));
console.log('secteurs proposés:', opts);
if (opts.length) { await page.locator('[role=option]').first().click(); await page.waitForTimeout(800); }
console.log('titre =', await h.innerText(), '| secteur =', await sector.inputValue());
await page.getByRole('button', { name: /^Enregistrer$/ }).last().click(); await page.waitForTimeout(4000);
console.log('enregistré, url', page.url());
process.exit(0);
