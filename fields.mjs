import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = browser.contexts()[0].pages().find((p) => p.url().includes('linkedin.com'));
const f = await page.evaluate(() => [...document.querySelectorAll('input,textarea,select')].filter(e=>e.offsetParent!==null).map(e => {
  const lab = e.id && document.querySelector(`label[for="${e.id}"]`);
  return `${e.tagName} type=${e.type} id=${e.id} label=${(lab?.innerText||e.getAttribute('aria-label')||e.placeholder||'').trim().slice(0,60)}`;
}));
console.log(f.join('\n'));
process.exit(0);
