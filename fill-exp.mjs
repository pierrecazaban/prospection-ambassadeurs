import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = browser.contexts()[0].pages().find((p) => p.url().includes('linkedin.com'));
const company = page.locator('[id="_r_1b_"]');
await company.click(); await company.pressSequentially('The AI Certification', { delay: 60 });
await page.waitForTimeout(1500);
await page.keyboard.press('Escape').catch(()=>{});
const cur = page.locator('[id="_r_1n_"]');
console.log('poste actuel coché :', await cur.isChecked());
if (!(await cur.isChecked())) await cur.check({ force: true });
const desc = `The AI Certification certifie les compétences en intelligence artificielle (ChatGPT, Claude, Copilot, prompt engineering, automatisation) via un examen et un certificat vérifiable, directement intégrable à LinkedIn.\n\nJe développe notre présence dans les écoles et universités françaises et pilote notre réseau d'ambassadeurs étudiants (ESCP, EDHEC, emlyon, SKEMA, IESEG, Polytechnique…).`;
const ed = page.locator('textarea:visible, [contenteditable="true"]:visible').first();
console.log('champ description trouvé :', await ed.count());
if (await ed.count()) { await ed.scrollIntoViewIfNeeded(); await ed.click(); await page.keyboard.insertText(desc); }
console.log('entreprise =', await company.inputValue());
process.exit(0);
