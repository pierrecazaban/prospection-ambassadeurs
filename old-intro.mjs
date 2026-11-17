import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = browser.contexts()[0].pages().find((p) => p.url().includes('linkedin.com'));
await page.goto('https://www.linkedin.com/in/pierre-cazaban-08a839382/', { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(5000);
await page.locator('main [aria-label="Modifier l’introduction"]').first().click(); await page.waitForTimeout(3500);
const f = await page.evaluate(() => [...document.querySelectorAll('input,textarea,[contenteditable="true"]')].filter(e=>e.offsetParent!==null).map(e => {
  const lab = e.id && document.querySelector(`label[for="${e.id}"]`);
  return `${e.tagName} id=${e.id} label=${(lab?.innerText||e.getAttribute('aria-label')||'').trim().slice(0,40)} val=${(e.value??e.innerText??'').toString().slice(0,60)}`; }));
console.log(f.join('\n'));
process.exit(0);
