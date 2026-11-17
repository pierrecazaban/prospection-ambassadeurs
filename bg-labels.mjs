import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = browser.contexts()[0].pages().find((p) => p.url().includes('/in/pierre-cazaban'));
await page.reload({ waitUntil: 'domcontentloaded' }); await page.waitForTimeout(4500);
console.log((await page.evaluate(() => [...document.querySelectorAll('main button, main a')].filter(b=>b.offsetParent).map(b => (b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ').slice(0,60)).filter(Boolean).slice(0,8))).join('\n'));
process.exit(0);
