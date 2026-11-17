// Usage: node clicktext.mjs <frag URL onglet> "<texte bouton/lien>" — clique puis liste les boutons/liens visibles
import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = browser.contexts()[0].pages().find((p) => p.url().includes(process.argv[2]));
if (process.argv[3]) { await page.getByText(process.argv[3], { exact: true }).first().click(); await page.waitForTimeout(2500); }
console.log(page.url());
console.log((await page.evaluate(() => [...document.querySelectorAll('[role=dialog] button, [role=dialog] a, [role=menu] *[role=menuitem], dialog button, dialog a')].filter(b=>b.offsetParent).map(b => (b.innerText.trim()||b.getAttribute('aria-label')||'').replace(/\s+/g,' ').slice(0,70)).filter(Boolean))).join('\n'));
process.exit(0);
