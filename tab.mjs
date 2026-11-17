// Usage: node tab.mjs URL — ouvre l'URL dans l'onglet de travail (pas celui du formulaire d'expérience)
import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const ctx = browser.contexts()[0];
const page = ctx.pages().find((p) => !p.url().includes('/edit/forms/position/') && p.url().includes('linkedin.com')) ?? await ctx.newPage();
await page.goto(process.argv[2], { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(4500);
await page.bringToFront();
console.log(page.url());
const f = await page.evaluate(() => [...document.querySelectorAll('input,textarea,select,[contenteditable="true"]')].filter(e=>e.offsetParent!==null).map(e => {
  const lab = e.id && document.querySelector(`label[for="${e.id}"]`);
  return `${e.tagName} id=${e.id} label=${(lab?.innerText||e.getAttribute('aria-label')||e.placeholder||'').trim().slice(0,60)} val=${(e.value??e.innerText??'').toString().slice(0,60)}`;
}));
console.log(f.join('\n'));
process.exit(0);
