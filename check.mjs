import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = browser.contexts()[0].pages().find((p) => p.url().includes('linkedin.com'));
const f = await page.evaluate(() => [...document.querySelectorAll('input,textarea,[contenteditable="true"]')].filter(e=>e.offsetParent!==null).map(e => {
  const lab = e.id && document.querySelector(`label[for="${e.id}"]`);
  const v = e.type==='checkbox' ? e.checked : (e.value ?? e.innerText);
  return `${e.tagName} ${(lab?.innerText||e.getAttribute('aria-label')||'').trim().slice(0,40)} => ${String(v).slice(0,80)}`;
}));
console.log(f.join('\n'));
process.exit(0);
